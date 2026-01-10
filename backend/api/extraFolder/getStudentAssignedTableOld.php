<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authPa.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$userId = $user['staffId'];

// ============= HELPER FUNCTIONS FROM getStatisticPa.php =============

function calculateComparison($current, $previous, $type = 'percentage') {
    if ($previous === null || $previous === 0) {
        return null;
    }
    
    $difference = $current - $previous;
    
    if ($type === 'percentage') {
        $percentChange = round(($difference / $previous) * 100, 1);
        return [
            'current' => $current,
            'previous' => $previous,
            'difference' => round($difference, 1),
            'percentChange' => $percentChange,
            'trend' => $difference > 0 ? 'increasing' : ($difference < 0 ? 'decreasing' : 'stable'),
            'interpretation' => getInterpretation($percentChange, $difference)
        ];
    }
    
    // For absolute values (like mood balance percentages)
    return [
        'current' => $current,
        'previous' => $previous,
        'difference' => round($difference, 1),
        'trend' => $difference > 0 ? 'increasing' : ($difference < 0 ? 'decreasing' : 'stable')
    ];
}

function getInterpretation($percentChange, $difference) {
    if (abs($percentChange) < 5) {
        return 'minimal_change';
    } elseif (abs($percentChange) < 15) {
        return 'moderate_change';
    } else {
        return 'significant_change';
    }
}

function determineOverallMoodTrend($current, $previous) {
    $posChange = $current['positive'] - $previous['positive'];
    $negChange = $current['negative'] - $previous['negative'];
    
    // Calculate a "mood score" (positive - negative)
    $currentScore = $current['positive'] - $current['negative'];
    $previousScore = $previous['positive'] - $previous['negative'];
    $scoreDiff = $currentScore - $previousScore;
    
    if ($scoreDiff > 5) {
        return 'improving';
    } elseif ($scoreDiff < -5) {
        return 'declining';
    } else {
        return 'stable';
    }
}

function calculateMoodBalanceForPeriod($moodData, $startDate, $endDate) {
    $positiveCount = 0;
    $neutralCount = 0;
    $negativeCount = 0;
    $totalCount = 0;
    
    foreach ($moodData as $row) {
        $dateObj = new DateTime($row['datetimeRecord']);
        if ($dateObj >= $startDate && $dateObj <= $endDate) {
            $totalCount++;
            if ($row['category'] === 'Positive') {
                $positiveCount++;
            } elseif ($row['category'] === 'Neutral') {
                $neutralCount++;
            } else {
                $negativeCount++;
            }
        }
    }
    
    if ($totalCount === 0) {
        return null;
    }
    
    return [
        'positive' => round(($positiveCount / $totalCount) * 100),
        'neutral' => round(($neutralCount / $totalCount) * 100),
        'negative' => round(($negativeCount / $totalCount) * 100)
    ];
}

function calculateAvgStressForPeriod($stressData, $startDate, $endDate) {
    $stressLevels = [];
    
    foreach ($stressData as $row) {
        $dateObj = new DateTime($row['datetimeRecord']);
        if ($dateObj >= $startDate && $dateObj <= $endDate) {
            $stressLevels[] = (float)$row['stressLevel'];
        }
    }
    
    if (empty($stressLevels)) {
        return null;
    }
    
    return round(array_sum($stressLevels) / count($stressLevels), 1);
}

// ============= END HELPER FUNCTIONS =============

$paId = $_GET['paId'] ?? null;

// Get PA Details
$stmtGetPADetails = $conn->prepare("
    SELECT * FROM staff
    WHERE staffId = ?
");
$stmtGetPADetails->bind_param("i", $paId);
$stmtGetPADetails->execute();
$resultGetPADetails = $stmtGetPADetails->get_result();
$profileData = $resultGetPADetails->fetch_assoc();

// Count Student Assigned
$stmtCountStudentAssigned = $conn->prepare("
    SELECT COUNT(*) as studentAssignedCount
    FROM student
    WHERE staffId = ?
");
$stmtCountStudentAssigned->bind_param("i", $paId);
$stmtCountStudentAssigned->execute();
$resultCountStudentAssigned = $stmtCountStudentAssigned->get_result();
$studentCountData = $resultCountStudentAssigned->fetch_assoc();
$studentCount = $studentCountData['studentAssignedCount'];

// Get Total Dass Recorded Under This PA
$stmtGetTotalDass = $conn->prepare("
    SELECT COUNT(*) as totalDassCount
    FROM dass
    WHERE staffId = ?
");
$stmtGetTotalDass->bind_param("i", $paId);
$stmtGetTotalDass->execute();
$resultGetTotalDass = $stmtGetTotalDass->get_result();
$totalDassData = $resultGetTotalDass->fetch_assoc();
$totalDassCount = $totalDassData['totalDassCount'];

// Get Student Details
$stmtGetAllStudent = $conn->prepare("
    SELECT * FROM Student
    WHERE staffId = ?
    ORDER BY studentName
");
$stmtGetAllStudent->bind_param("i", $paId);
$stmtGetAllStudent->execute();
$resultGetAllStudent = $stmtGetAllStudent->get_result();
$getAllStudentData = $resultGetAllStudent->fetch_all(MYSQLI_ASSOC);

$highMoodRiskCount = 0;
$highDassRiskCount = 0;
$allStudentMoodData = [];
foreach ($getAllStudentData as $row) {
    $studentId = $row['studentId'];

    // Check contact record
    $contactSent = false;
    $stmtCheckContact = $conn->prepare("
        SELECT * 
        FROM contactNote
        WHERE studentId = ?
        AND date(datetimeRecord) = CURDATE()
    ");
    $stmtCheckContact->bind_param("i", $studentId);
    $stmtCheckContact->execute();
    $resultCheckContact = $stmtCheckContact->get_result();
    $checkContactData = $resultCheckContact->fetch_assoc();
    
    if ($resultCheckContact->num_rows > 0) {
        $contactSent = true;
    }
    
    // Check contact note record
    $stmtCheckNote = $conn->prepare("
        SELECT * 
        FROM contactNote
        WHERE studentId = ?
        ORDER BY contactId DESC
        LIMIT 1
    ");
    $stmtCheckNote->bind_param("i", $studentId);
    $stmtCheckNote->execute();
    $resultCheckNote = $stmtCheckNote->get_result();
    $CheckNoteData = $resultCheckNote->fetch_assoc();

    $noteRecord = false;
    if (!empty($CheckNoteData['note'])) {
        $noteRecord = true;
    }

    // Get last 7 days
    $last7Days = (new DateTime())->modify('-7 days')->format('Y-m-d H:i:s');

    // Get last 7 days mood + stress with category
    $stmtTrend = $conn->prepare("
        SELECT m.moodTypeId, mt.moodStatus, mt.category, mt.moodStoreLocation, m.datetimeRecord
        FROM moodTracking m
        LEFT JOIN mood mt ON m.moodTypeId = mt.moodTypeId
        WHERE m.studentId = ?
          AND m.datetimeRecord >= ?
        ORDER BY m.datetimeRecord ASC
    ");
    $stmtTrend->bind_param("is", $studentId, $last7Days);
    $stmtTrend->execute();
    $resultTrend = $stmtTrend->get_result();
    $trendData = $resultTrend->fetch_all(MYSQLI_ASSOC);

    $stmtStressLevel = $conn->prepare("
        SELECT * FROM stress
        WHERE studentId = ?
        AND datetimeRecord >= ?
        ORDER BY datetimeRecord ASC
    ");
    $stmtStressLevel->bind_param("is", $studentId, $last7Days);
    $stmtStressLevel->execute();
    $resultStressLevel = $stmtStressLevel->get_result();
    $stressLevelData = $resultStressLevel->fetch_all(MYSQLI_ASSOC);

    // Initialize counters and trends
    $negativeMoodCount = 0;
    $highStressCount = 0;
    $totalRecords = count($trendData);

    $moodTrend = "Stable";
    $stressTrend = "No Record";
    $prevStress = null;

    $moodPattern = "No Record";
    $stressPattern = "No Record";
    $riskIndicator = "No Record";
    $lastRecordedDate = "No Record";
    $lastRecordedTime = "No Record";
    if (!empty($trendData)) {
        foreach ($stressLevelData as $rowTrend) {
            if ($rowTrend['stressLevel'] !== null && $rowTrend['stressLevel'] >= 60) {
                $highStressCount++;
            }

            if ($prevStress !== null && $rowTrend['stressLevel'] !== null) {
                if ($rowTrend['stressLevel'] > $prevStress) {
                    $stressTrend = "Increasing";
                } elseif ($rowTrend['stressLevel'] < $prevStress) {
                    $stressTrend = "Decreasing";
                } else {
                    $stressTrend = "Stable";
                }
            }
            
            if ($rowTrend['stressLevel'] !== null) {
                $prevStress = $rowTrend['stressLevel'];
            }
        }

        foreach ($trendData as $rowTrend) {
            if ($rowTrend['category'] === "Negative") {
                $negativeMoodCount++;
            }
        }

        // Mood Pattern
        if ($negativeMoodCount >= 4) {
            $moodPattern = "Mostly Negative";
        } elseif ($negativeMoodCount >= 2) {
            $moodPattern = "Occasionally Negative";
        } else {
            $moodPattern = "Stable";
        }

        // Stress Pattern
        if ($highStressCount >= 4) {
            $stressPattern = "High";
        } elseif ($highStressCount >= 2) {
            $stressPattern = "Moderate";
        } else {
            $stressPattern = "Low";
        }

        // Risk indicator
        if (
            ($negativeMoodCount >= 3 && $highStressCount >= 3) ||
            ($stressTrend === "Increasing" && $negativeMoodCount >= 2)
        ) {
            $riskIndicator = "High";
            $highMoodRiskCount++;
        } elseif (
            $negativeMoodCount >= 2 || $highStressCount >= 2
        ) {
            $riskIndicator = "Need Attention";
        } else {
            $riskIndicator = "Low";
        }

        // Last recorded mood date
        if ($totalRecords > 0) {
            $datetime = $trendData[$totalRecords - 1]['datetimeRecord'];
            if ($datetime) {
                $dateObj = new DateTime($datetime);
                $lastRecordedDate = $dateObj->format('Y-m-d');
                $lastRecordedTime = $dateObj->format('H:i');
            }
        }
    }

    // ✅ INITIALIZE DASS VARIABLES OUTSIDE THE IF BLOCK
    $depressionLevel = "No Record";
    $anxietyLevel = "No Record";
    $stressLevel = "No Record";
    $recordedDate = "No Record";
    $dassStatus = "No Record";
    $riskStatus = "No Record";  // ✅ CRITICAL FIX - Initialize here!

    // Get latest DASS for this student
    $stmtStudentDass = $conn->prepare("
        SELECT * 
        FROM dass 
        WHERE studentId = ? 
        ORDER BY dassId DESC 
        LIMIT 1
    ");
    $stmtStudentDass->bind_param("i", $studentId);
    $stmtStudentDass->execute();
    $resultStudentDass = $stmtStudentDass->get_result();
    $studentDassDataRow = $resultStudentDass->fetch_assoc();

    if ($studentDassDataRow) {
        $dassStatus = $studentDassDataRow['status'];
        $dassId = $studentDassDataRow['dassId'];

        // Only calculate levels if DASS exists and is completed
        if ($dassId && $studentDassDataRow['status'] !== "Pending") {
            $sumEachLevel = [];

            // Calculate Depression
            $stmtCalculateDassDepression = $conn->prepare("
                SELECT SUM(dr.scale) as total 
                FROM dassRecord dr
                JOIN dassQuestion dq ON dr.dassQuestionId = dq.dassQuestionId
                WHERE dr.dassId = ? AND dq.type = 'Depression'
            ");
            $stmtCalculateDassDepression->bind_param("i", $dassId);
            $stmtCalculateDassDepression->execute();
            $resultDassDepression = $stmtCalculateDassDepression->get_result();
            $dassDepressionData = $resultDassDepression->fetch_assoc();
            $sumEachLevel[0] = $dassDepressionData['total'] ?? 0;

            // Calculate Anxiety
            $stmtCalculateDassAnxiety = $conn->prepare("
                SELECT SUM(dr.scale) as total 
                FROM dassRecord dr
                JOIN dassQuestion dq ON dr.dassQuestionId = dq.dassQuestionId
                WHERE dr.dassId = ? AND dq.type = 'Anxiety'
            ");
            $stmtCalculateDassAnxiety->bind_param("i", $dassId);
            $stmtCalculateDassAnxiety->execute();
            $resultDassAnxiety = $stmtCalculateDassAnxiety->get_result();
            $dassAnxietyData = $resultDassAnxiety->fetch_assoc();
            $sumEachLevel[1] = $dassAnxietyData['total'] ?? 0;

            // Calculate Stress
            $stmtCalculateDassStress = $conn->prepare("
                SELECT SUM(dr.scale) as total 
                FROM dassRecord dr
                JOIN dassQuestion dq ON dr.dassQuestionId = dq.dassQuestionId
                WHERE dr.dassId = ? AND dq.type = 'Stress'
            ");
            $stmtCalculateDassStress->bind_param("i", $dassId);
            $stmtCalculateDassStress->execute();
            $resultDassStress = $stmtCalculateDassStress->get_result();
            $dassStressData = $resultDassStress->fetch_assoc();
            $sumEachLevel[2] = $dassStressData['total'] ?? 0;

            // Initialize counters
            $normalCount = 0;
            $mildCount = 0;
            $moderateCount = 0;
            $severeCount = 0;
            $extremeSevereCount = 0;

            $temporaryHighDassRiskCount = 0;
            // Determine Depression Level
            if ($sumEachLevel[0] >= 0 && $sumEachLevel[0] <= 9) {
                $depressionLevel = "Normal";
                $normalCount++;
            } else if ($sumEachLevel[0] >= 10 && $sumEachLevel[0] <= 13) {
                $depressionLevel = "Mild";
                $mildCount++;
            } else if ($sumEachLevel[0] >= 14 && $sumEachLevel[0] <= 20) {
                $depressionLevel = "Moderate";
                $moderateCount++;
            } else if ($sumEachLevel[0] >= 21 && $sumEachLevel[0] <= 27) {
                $depressionLevel = "Severe";
                $severeCount++;
                $temporaryHighDassRiskCount++;
            } else if ($sumEachLevel[0] >= 28) {
                $depressionLevel = "Extremely Severe";
                $extremeSevereCount++;
                $temporaryHighDassRiskCount++;
            }

            // Determine Anxiety Level
            if ($sumEachLevel[1] >= 0 && $sumEachLevel[1] <= 7) {
                $anxietyLevel = "Normal";
                $normalCount++;
            } else if ($sumEachLevel[1] >= 8 && $sumEachLevel[1] <= 9) {
                $anxietyLevel = "Mild";
                $mildCount++;
            } else if ($sumEachLevel[1] >= 10 && $sumEachLevel[1] <= 14) {
                $anxietyLevel = "Moderate";
                $moderateCount++;
            } else if ($sumEachLevel[1] >= 15 && $sumEachLevel[1] <= 19) {
                $anxietyLevel = "Severe";
                $severeCount++;
                $temporaryHighDassRiskCount++;
            } else if ($sumEachLevel[1] >= 20) {
                $anxietyLevel = "Extremely Severe";
                $extremeSevereCount++;
                $temporaryHighDassRiskCount++;
            }

            // Determine Stress Level
            if ($sumEachLevel[2] >= 0 && $sumEachLevel[2] <= 14) {
                $stressLevel = "Normal";
                $normalCount++;
            } else if ($sumEachLevel[2] >= 15 && $sumEachLevel[2] <= 18) {
                $stressLevel = "Mild";
                $mildCount++;
            } else if ($sumEachLevel[2] >= 19 && $sumEachLevel[2] <= 25) {
                $stressLevel = "Moderate";
                $moderateCount++;
            } else if ($sumEachLevel[2] >= 26 && $sumEachLevel[2] <= 33) {
                $stressLevel = "Severe";
                $severeCount++;
                $temporaryHighDassRiskCount++;
            } else if ($sumEachLevel[2] >= 34) {
                $stressLevel = "Extremely Severe";
                $extremeSevereCount++;
                $temporaryHighDassRiskCount++;
            }

            // Determine Risk Status
            if ($extremeSevereCount > 0) {
                $riskStatus = "Critical";
            } elseif ($extremeSevereCount == 0 && $severeCount > 0) {
                $riskStatus = "High";
            } elseif ($severeCount == 0 && $moderateCount > 0) {
                $riskStatus = "Medium";
            } else {
                $riskStatus = "Low";
            }

            if ($temporaryHighDassRiskCount > 0) {
                $highDassRiskCount++;
            }

            // Extract date from datetime
            $datetime = $studentDassDataRow['dassCompletedDateTime'] ?? null;
            if ($datetime) {
                $dateObj = new DateTime($datetime);
                $recordedDate = $dateObj->format('Y-m-d');
            }
        }
    }

    $allStudentMoodData[] = [
        'studentId' => $studentId,
        'matricNo' => $row['matricNo'],
        'studentName' => $row['studentName'],

        'period' => 'Last 7 Days',
        'moodPattern' => $moodPattern,
        'stressPattern' => $stressPattern,
        'trend' => $stressTrend,

        'riskIndicator' => $riskIndicator,

        'lastRecordedDate' => $lastRecordedDate,
        'lastRecordedTime' => $lastRecordedTime,

        'contactRecord' => $contactSent,
        'noteRecord' => $noteRecord,
        'contactCount' => $contactCount ?? 0,
        'noteCount' => $noteCount ?? 0,

        'dassStatus' => $dassStatus,
        'depressionLevel' => $depressionLevel,
        'anxietyLevel' => $anxietyLevel,
        'stressLevel' => $stressLevel,
        'completedDate' => $recordedDate,
        'riskDassIndicator' => $riskStatus 
    ];
}

$dashboardData = [
    'studentAssignedCount' => $studentCount ?? 0,
    'highMoodRiskCount' => $highMoodRiskCount ?? 0,
    'highDassRiskCount' => $highDassRiskCount ?? 0
];

echo json_encode([
    "success" => true,
    "profileData" => $profileData,
    'dashboardData' => $dashboardData,
    "studentData" => $allStudentMoodData
]);
?>