<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authPa.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$userId = $user['staffId'];

// Count Student Assigned
$stmtCountStudentAssigned = $conn->prepare("
    SELECT COUNT(*) as studentAssignedCount
    FROM student
    WHERE staffId = ?
");
$stmtCountStudentAssigned->bind_param("i", $userId);
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
$stmtGetTotalDass->bind_param("i", $userId);
$stmtGetTotalDass->execute();
$resultGetTotalDass = $stmtGetTotalDass->get_result();
$totalDassData = $resultGetTotalDass->fetch_assoc();
$totalDassCount = $totalDassData['totalDassCount'];

// Get All Student Details
$stmtGetAllStudent = $conn->prepare("
    SELECT * FROM Student
    WHERE staffId = ?
    ORDER BY studentName
");
$stmtGetAllStudent->bind_param("i", $userId);
$stmtGetAllStudent->execute();
$resultGetAllStudent = $stmtGetAllStudent->get_result();
$getAllStudentData = $resultGetAllStudent->fetch_all(MYSQLI_ASSOC);

$moodRecordedCount = 0;
$dassRecordedCount = 0;
$highMoodRiskCount = 0;
$allStudentMoodData = [];
foreach ($getAllStudentData as $row) {
    $studentId = $row['studentId'];

    // Count contact and note (Separately)
    $stmtContactNoteCount = $conn->prepare("
        SELECT 
            COUNT(*) AS contactCount,
            SUM(CASE WHEN note IS NOT NULL AND TRIM(note) != '' THEN 1 ELSE 0 END) AS noteCount
        FROM contactNote
        WHERE studentId = ?
    ");
    $stmtContactNoteCount->bind_param("i", $studentId);
    $stmtContactNoteCount->execute();
    $resultContactNoteCount = $stmtContactNoteCount->get_result();
    $contactNoteCount = $resultContactNoteCount->fetch_assoc();

    $contactCount = (int) $contactNoteCount['contactCount'];
    $noteCount = (int) $contactNoteCount['noteCount'];

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

    // ✅ FIXED: Check if user recorded mood today
    $stmtMoodRecordedToday = $conn->prepare("
        SELECT COUNT(*) as moodRecordedTodayCount
        FROM moodTracking
        WHERE studentId = ? AND
        date(datetimeRecord) = CURDATE()
    ");
    $stmtMoodRecordedToday->bind_param("i", $studentId);
    $stmtMoodRecordedToday->execute();
    $resultMoodRecordedToday = $stmtMoodRecordedToday->get_result();
    $moodRecordedTodayData = $resultMoodRecordedToday->fetch_assoc();
    
    // ✅ FIXED: Check the actual count value, not num_rows
    if ($moodRecordedTodayData['moodRecordedTodayCount'] > 0) {
        $moodRecordedCount++;
    }

    // Check if user has record dass (If Received and Completed)
    $stmtDassRecorded = $conn->prepare("
        SELECT *
        FROM dass
        WHERE studentId = ?
    ");
    $stmtDassRecorded->bind_param("i", $studentId);
    $stmtDassRecorded->execute();
    $resultDassRecorded = $stmtDassRecorded->get_result();
    $studentDassRecordedData = $resultDassRecorded->fetch_assoc();

    if ($studentDassRecordedData && $studentDassRecordedData['status'] === "Completed") {
        $dassRecordedCount++;
    }

    // Define 7-day window
    $startDate = (new DateTime())->modify('-7 days')->format('Y-m-d H:i:s');

    // Get last 7 days mood + stress with category
    $stmtTrend = $conn->prepare("
        SELECT m.moodTypeId, mt.moodStatus, mt.category, mt.moodStoreLocation, m.datetimeRecord
        FROM moodTracking m
        LEFT JOIN mood mt ON m.moodTypeId = mt.moodTypeId
        WHERE m.studentId = ?
          AND m.datetimeRecord >= ?
        ORDER BY m.datetimeRecord ASC
    ");
    $stmtTrend->bind_param("is", $studentId, $startDate);
    $stmtTrend->execute();
    $resultTrend = $stmtTrend->get_result();
    $trendData = $resultTrend->fetch_all(MYSQLI_ASSOC);

    $stmtStressLevel = $conn->prepare("
        SELECT * FROM stress
        WHERE studentId = ?
        AND datetimeRecord >= ?
        ORDER BY datetimeRecord ASC
    ");
    $stmtStressLevel->bind_param("is", $studentId, $startDate);
    $stmtStressLevel->execute();
    $resultStressLevel = $stmtStressLevel->get_result();
    $stressLevelData = $resultStressLevel->fetch_all(MYSQLI_ASSOC);

    // Initialize counters and trends
    $negativeMoodCount = 0;
    $highStressCount = 0;
    $totalRecords = count($trendData);

    $stressTrend = "No Record";
    $prevStress = null;

    $moodPattern = "No Record";
    $stressPattern = "No Record";
    $riskIndicator = "No Record";
    $lastRecordedDate = "No Record";
    $lastRecordedTime = "No Record";
    if (!empty($stressLevelData)) {

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
        'contactCount' => $contactCount,
        'noteCount' => $noteCount,
    ];
}

// Get all student DASS data
$stmtGetAllStudentDass = $conn->prepare("
    SELECT s.*, d.dassId, d.status, d.dassCompletedDateTime
    FROM student s
    LEFT JOIN dass d ON s.studentId = d.studentId
    WHERE s.staffId = ?
    ORDER BY s.studentName
");
$stmtGetAllStudentDass->bind_param("i", $userId);
$stmtGetAllStudentDass->execute();
$resultGetAllStudentDass = $stmtGetAllStudentDass->get_result();
$getAllStudentDassData = $resultGetAllStudentDass->fetch_all(MYSQLI_ASSOC);

$highDassRiskCount = 0;
$allStudentDassData = [];

// ✅ FIXED: Process each unique student only once
$processedStudents = [];
foreach ($getAllStudentDassData as $row) {
    $studentId = $row['studentId'];
    
    // Skip if already processed
    if (in_array($studentId, $processedStudents)) {
        continue;
    }
    $processedStudents[] = $studentId;

    // Count contact and note
    $stmtContactNoteCount = $conn->prepare("
        SELECT 
            COUNT(*) AS contactCount,
            SUM(CASE WHEN note IS NOT NULL AND TRIM(note) != '' THEN 1 ELSE 0 END) AS noteCount
        FROM contactNote
        WHERE studentId = ?
    ");
    $stmtContactNoteCount->bind_param("i", $studentId);
    $stmtContactNoteCount->execute();
    $resultContactNoteCount = $stmtContactNoteCount->get_result();
    $contactNoteCount = $resultContactNoteCount->fetch_assoc();

    $contactCount = (int) $contactNoteCount['contactCount'];
    $noteCount = (int) $contactNoteCount['noteCount'];

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
    
    if ($resultCheckContact->num_rows > 0) {
        $contactSent = true;
    }
    
    // Check note record
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

    $dassStatus = "No Record";
    $dassId = null;
    $depressionLevel = "No Record";
    $anxietyLevel = "No Record";
    $stressLevel = "No Record";
    $recordedDate = "No Record";

    if ($studentDassDataRow) {
        $dassStatus = $studentDassDataRow['status'];
        $dassId = $studentDassDataRow['dassId'];

        // Only calculate levels if DASS exists and is completed
        if ($dassId && $studentDassDataRow['status'] === "Completed") {
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

            $temporaryHighRiskDassCount = 0;
            
            // Determine Depression Level
            if ($sumEachLevel[0] >= 0 && $sumEachLevel[0] <= 9) {
                $depressionLevel = "Normal";
            } else if ($sumEachLevel[0] >= 10 && $sumEachLevel[0] <= 13) {
                $depressionLevel = "Mild";
            } else if ($sumEachLevel[0] >= 14 && $sumEachLevel[0] <= 20) {
                $depressionLevel = "Moderate";
            } else if ($sumEachLevel[0] >= 21 && $sumEachLevel[0] <= 27) {
                $depressionLevel = "Severe";
                $temporaryHighRiskDassCount++;
            } else if ($sumEachLevel[0] >= 28) {
                $depressionLevel = "Extremely Severe";
                $temporaryHighRiskDassCount++;
            }

            // Determine Anxiety Level
            if ($sumEachLevel[1] >= 0 && $sumEachLevel[1] <= 7) {
                $anxietyLevel = "Normal";
            } else if ($sumEachLevel[1] >= 8 && $sumEachLevel[1] <= 9) {
                $anxietyLevel = "Mild";
            } else if ($sumEachLevel[1] >= 10 && $sumEachLevel[1] <= 14) {
                $anxietyLevel = "Moderate";
            } else if ($sumEachLevel[1] >= 15 && $sumEachLevel[1] <= 19) {
                $anxietyLevel = "Severe";
                $temporaryHighRiskDassCount++;
            } else if ($sumEachLevel[1] >= 20) {
                $anxietyLevel = "Extremely Severe";
                $temporaryHighRiskDassCount++;
            }

            // Determine Stress Level
            if ($sumEachLevel[2] >= 0 && $sumEachLevel[2] <= 14) {
                $stressLevel = "Normal";
            } else if ($sumEachLevel[2] >= 15 && $sumEachLevel[2] <= 18) {
                $stressLevel = "Mild";
            } else if ($sumEachLevel[2] >= 19 && $sumEachLevel[2] <= 25) {
                $stressLevel = "Moderate";
            } else if ($sumEachLevel[2] >= 26 && $sumEachLevel[2] <= 33) {
                $stressLevel = "Severe";
                $temporaryHighRiskDassCount++;
            } else if ($sumEachLevel[2] >= 34) {
                $stressLevel = "Extremely Severe";
                $temporaryHighRiskDassCount++;
            }

            if ($temporaryHighRiskDassCount > 0) {
                $highDassRiskCount++;
            }

            // Extract date
            $datetime = $studentDassDataRow['dassCompletedDateTime'] ?? null;
            if ($datetime) {
                $dateObj = new DateTime($datetime);
                $recordedDate = $dateObj->format('Y-m-d');
            }
        }
    }

    $allStudentDassData[] = [
        'studentId' => $studentId,
        'matricNo' => $row['matricNo'],
        'studentName' => $row['studentName'],
        'dassStatus' => $dassStatus,
        'depressionLevel' => $depressionLevel,
        'anxietyLevel' => $anxietyLevel,
        'stressLevel' => $stressLevel,
        'completedDate' => $recordedDate,
        'contactRecord' => $contactSent,
        'noteRecord' => $noteRecord,
        'contactCount' => $contactCount,
        'noteCount' => $noteCount
    ];
}

$dashboardData = [
    'studentAssignedCount' => $studentCount ?? 0,
    'moodRecordedTodayCount' => $moodRecordedCount ?? 0,
    'totalDassCount' => $totalDassCount ?? 0,
    'dassRecordedCount' => $dassRecordedCount ?? 0,
    'highMoodRiskCount' => $highMoodRiskCount ?? 0,
    'highDassRiskCount' => $highDassRiskCount ?? 0
];

echo json_encode([
    "success" => true,
    "studentData" => $allStudentMoodData,
    "studentDassData" => $allStudentDassData,
    'dashboardData' => $dashboardData
]);
?>