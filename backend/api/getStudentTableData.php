<?php
// getStudentTableData.php
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
        'trend' => $difference > 0 ? 'increasing' : ($difference < 0 ? 'decreasing' : 'stable'),
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

// ============= NEW: STRESS CATEGORY FUNCTIONS =============

// Helper function to get stress category (0-40: Low, 41-70: Moderate, 71-100: High)
function getStressCategory($stressLevel) {
    if ($stressLevel <= 40) return "Low Stress";
    if ($stressLevel <= 60) return "Moderate Stress";
    return "High Stress";
}

// Calculate stress category percentages for a period
function calculateStressBalanceForPeriod($stressData, $startDate, $endDate) {
    $lowCount = 0;
    $moderateCount = 0;
    $highCount = 0;
    $totalCount = 0;
    
    foreach ($stressData as $row) {
        $dateObj = new DateTime($row['datetimeRecord']);
        if ($dateObj >= $startDate && $dateObj <= $endDate) {
            $totalCount++;
            $category = getStressCategory((float)$row['stressLevel']);
            
            if ($category === "Low Stress") {
                $lowCount++;
            } elseif ($category === "Moderate Stress") {
                $moderateCount++;
            } else {
                $highCount++;
            }
        }
    }
    
    if ($totalCount === 0) {
        return null;
    }
    
    return [
        'low' => round(($lowCount / $totalCount) * 100),
        'moderate' => round(($moderateCount / $totalCount) * 100),
        'high' => round(($highCount / $totalCount) * 100)
    ];
}

// Calculate stress category comparison (similar to mood comparison)
function calculateStressCategoryComparison($current, $previous) {
    if ($current === null || $previous === null) {
        return null;
    }
    
    return [
        'low' => calculateComparison(
            $current['low'],
            $previous['low'],
            'absolute'
        ),
        'moderate' => calculateComparison(
            $current['moderate'],
            $previous['moderate'],
            'absolute'
        ),
        'high' => calculateComparison(
            $current['high'],
            $previous['high'],
            'absolute'
        ),
        'overallTrend' => determineOverallStressTrend(
            $current,
            $previous
        )
    ];
}

// Determine overall stress trend based on categories
function determineOverallStressTrend($current, $previous) {
    $lowChange = $current['low'] - $previous['low'];
    $highChange = $current['high'] - $previous['high'];
    
    // Calculate a "stress score" (low - high)
    $currentScore = $current['low'] - $current['high'];
    $previousScore = $previous['low'] - $previous['high'];
    $scoreDiff = $currentScore - $previousScore;
    
    if ($scoreDiff > 5) {
        return 'improving'; // More low stress, less high stress
    } elseif ($scoreDiff < -5) {
        return 'worsening'; // Less low stress, more high stress
    } else {
        return 'stable';
    }
}

// ============= END HELPER FUNCTIONS =============

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
    SELECT *
    FROM dass
    WHERE staffId = ? 
    GROUP BY studentId
");
$stmtGetTotalDass->bind_param("i", $userId);
$stmtGetTotalDass->execute();
$resultGetTotalDass = $stmtGetTotalDass->get_result();
$totalDassData = $resultGetTotalDass->fetch_assoc();
$totalDassCount = $resultGetTotalDass->num_rows;

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
    $period = "N/A";

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

    // Check contact record - UNCHANGED
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
    
    // Check contact note record - UNCHANGED
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

    // Check if user recorded mood today
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
    
    if ($moodRecordedTodayData['moodRecordedTodayCount'] > 0) {
        $moodRecordedCount++;
    }

    // Check if user has record dass
    $stmtDassRecorded = $conn->prepare("
        SELECT *
        FROM dass
        WHERE studentId = ?
        ORDER BY dassId DESC
        LIMIT 1
    ");
    $stmtDassRecorded->bind_param("i", $studentId);
    $stmtDassRecorded->execute();
    $resultDassRecorded = $stmtDassRecorded->get_result();
    $studentDassRecordedData = $resultDassRecorded->fetch_assoc();

    if ($studentDassRecordedData && $studentDassRecordedData['status'] === "Completed") {
        $dassRecordedCount++;
    }

    // ============= NEW: THIS WEEK vs LAST WEEK + THIS MONTH vs LAST MONTH COMPARISON =============
    
    // ========== WEEK COMPARISON (Actual Calendar Weeks: Monday to Sunday) ==========
    $today = new DateTime();
    $currentDayOfWeek = (int)$today->format('N'); // 1 (Monday) to 7 (Sunday)
    
    $thisWeekStart = (clone $today)->modify('-' . ($currentDayOfWeek - 1) . ' days')->setTime(0, 0, 0);
    $thisWeekEnd = (clone $thisWeekStart)->modify('+6 days')->setTime(23, 59, 59);
    
    $lastWeekStart = (clone $thisWeekStart)->modify('-7 days');
    $lastWeekEnd = (clone $lastWeekStart)->modify('+6 days')->setTime(23, 59, 59);

    // ========== MONTH COMPARISON (Actual Calendar Months) ==========
    $currentMonth = (int)$today->format('m');
    $currentYear = (int)$today->format('Y');
    
    // THIS MONTH (1st to last day of current month)
    $thisMonthStart = new DateTime("$currentYear-$currentMonth-01 00:00:00");
    $thisMonthEnd = (clone $thisMonthStart)->modify('last day of this month')->setTime(23, 59, 59);
    
    // LAST MONTH (1st to last day of previous month)
    $lastMonthDate = (clone $today)->modify('-1 month');
    $lastMonth = (int)$lastMonthDate->format('m');
    $lastYear = (int)$lastMonthDate->format('Y');
    
    $lastMonthStart = new DateTime("$lastYear-$lastMonth-01 00:00:00");
    $lastMonthEnd = (clone $lastMonthStart)->modify('last day of this month')->setTime(23, 59, 59);

    $period = $lastMonthDate->format('M Y') . " - " . $today->format('M Y');

    // ========== GET DATA FOR WEEK COMPARISON ==========
    
    // Get mood data for THIS WEEK
    $stmtThisWeekMood = $conn->prepare("
        SELECT m.datetimeRecord, mt.category
        FROM moodTracking m
        LEFT JOIN mood mt ON m.moodTypeId = mt.moodTypeId
        WHERE m.studentId = ?
        AND m.datetimeRecord BETWEEN ? AND ?
        ORDER BY m.datetimeRecord ASC
    ");
    $thisWeekStartStr = $thisWeekStart->format('Y-m-d H:i:s');
    $thisWeekEndStr = $thisWeekEnd->format('Y-m-d H:i:s');
    $stmtThisWeekMood->bind_param("iss", $studentId, $thisWeekStartStr, $thisWeekEndStr);
    $stmtThisWeekMood->execute();
    $resultThisWeekMood = $stmtThisWeekMood->get_result();
    $thisWeekMoodData = $resultThisWeekMood->fetch_all(MYSQLI_ASSOC);

    // Get mood data for LAST WEEK
    $stmtLastWeekMood = $conn->prepare("
        SELECT m.datetimeRecord, mt.category
        FROM moodTracking m
        LEFT JOIN mood mt ON m.moodTypeId = mt.moodTypeId
        WHERE m.studentId = ?
        AND m.datetimeRecord BETWEEN ? AND ?
        ORDER BY m.datetimeRecord ASC
    ");
    $lastWeekStartStr = $lastWeekStart->format('Y-m-d H:i:s');
    $lastWeekEndStr = $lastWeekEnd->format('Y-m-d H:i:s');
    $stmtLastWeekMood->bind_param("iss", $studentId, $lastWeekStartStr, $lastWeekEndStr);
    $stmtLastWeekMood->execute();
    $resultLastWeekMood = $stmtLastWeekMood->get_result();
    $lastWeekMoodData = $resultLastWeekMood->fetch_all(MYSQLI_ASSOC);

    // Get stress data for THIS WEEK
    $stmtThisWeekStress = $conn->prepare("
        SELECT stressLevel, datetimeRecord
        FROM stress
        WHERE studentId = ?
        AND datetimeRecord BETWEEN ? AND ?
        ORDER BY datetimeRecord ASC
    ");
    $stmtThisWeekStress->bind_param("iss", $studentId, $thisWeekStartStr, $thisWeekEndStr);
    $stmtThisWeekStress->execute();
    $resultThisWeekStress = $stmtThisWeekStress->get_result();
    $thisWeekStressData = $resultThisWeekStress->fetch_all(MYSQLI_ASSOC);

    // Get stress data for LAST WEEK
    $stmtLastWeekStress = $conn->prepare("
        SELECT stressLevel, datetimeRecord
        FROM stress
        WHERE studentId = ?
        AND datetimeRecord BETWEEN ? AND ?
        ORDER BY datetimeRecord ASC
    ");
    $stmtLastWeekStress->bind_param("iss", $studentId, $lastWeekStartStr, $lastWeekEndStr);
    $stmtLastWeekStress->execute();
    $resultLastWeekStress = $stmtLastWeekStress->get_result();
    $lastWeekStressData = $resultLastWeekStress->fetch_all(MYSQLI_ASSOC);

    // ========== GET DATA FOR MONTH COMPARISON ==========
    
    // Get mood data for THIS MONTH
    $stmtThisMonthMood = $conn->prepare("
        SELECT m.datetimeRecord, mt.category
        FROM moodTracking m
        LEFT JOIN mood mt ON m.moodTypeId = mt.moodTypeId
        WHERE m.studentId = ?
        AND m.datetimeRecord BETWEEN ? AND ?
        ORDER BY m.datetimeRecord ASC
    ");
    $thisMonthStartStr = $thisMonthStart->format('Y-m-d H:i:s');
    $thisMonthEndStr = $thisMonthEnd->format('Y-m-d H:i:s');
    $stmtThisMonthMood->bind_param("iss", $studentId, $thisMonthStartStr, $thisMonthEndStr);
    $stmtThisMonthMood->execute();
    $resultThisMonthMood = $stmtThisMonthMood->get_result();
    $thisMonthMoodData = $resultThisMonthMood->fetch_all(MYSQLI_ASSOC);

    // Get mood data for LAST MONTH
    $stmtLastMonthMood = $conn->prepare("
        SELECT m.datetimeRecord, mt.category
        FROM moodTracking m
        LEFT JOIN mood mt ON m.moodTypeId = mt.moodTypeId
        WHERE m.studentId = ?
        AND m.datetimeRecord BETWEEN ? AND ?
        ORDER BY m.datetimeRecord ASC
    ");
    $lastMonthStartStr = $lastMonthStart->format('Y-m-d H:i:s');
    $lastMonthEndStr = $lastMonthEnd->format('Y-m-d H:i:s');
    $stmtLastMonthMood->bind_param("iss", $studentId, $lastMonthStartStr, $lastMonthEndStr);
    $stmtLastMonthMood->execute();
    $resultLastMonthMood = $stmtLastMonthMood->get_result();
    $lastMonthMoodData = $resultLastMonthMood->fetch_all(MYSQLI_ASSOC);

    // Get stress data for THIS MONTH
    $stmtThisMonthStress = $conn->prepare("
        SELECT stressLevel, datetimeRecord
        FROM stress
        WHERE studentId = ?
        AND datetimeRecord BETWEEN ? AND ?
        ORDER BY datetimeRecord ASC
    ");
    $stmtThisMonthStress->bind_param("iss", $studentId, $thisMonthStartStr, $thisMonthEndStr);
    $stmtThisMonthStress->execute();
    $resultThisMonthStress = $stmtThisMonthStress->get_result();
    $thisMonthStressData = $resultThisMonthStress->fetch_all(MYSQLI_ASSOC);

    // Get stress data for LAST MONTH
    $stmtLastMonthStress = $conn->prepare("
        SELECT stressLevel, datetimeRecord
        FROM stress
        WHERE studentId = ?
        AND datetimeRecord BETWEEN ? AND ?
        ORDER BY datetimeRecord ASC
    ");
    $stmtLastMonthStress->bind_param("iss", $studentId, $lastMonthStartStr, $lastMonthEndStr);
    $stmtLastMonthStress->execute();
    $resultLastMonthStress = $stmtLastMonthStress->get_result();
    $lastMonthStressData = $resultLastMonthStress->fetch_all(MYSQLI_ASSOC);

    // ========== CALCULATE WEEKLY COMPARISONS ==========
    
    $thisWeekMoodBalance = calculateMoodBalanceForPeriod($thisWeekMoodData, $thisWeekStart, $thisWeekEnd);
    $lastWeekMoodBalance = calculateMoodBalanceForPeriod($lastWeekMoodData, $lastWeekStart, $lastWeekEnd);
    
    // NEW: Calculate stress category balance instead of average
    $thisWeekStressBalance = calculateStressBalanceForPeriod($thisWeekStressData, $thisWeekStart, $thisWeekEnd);
    $lastWeekStressBalance = calculateStressBalanceForPeriod($lastWeekStressData, $lastWeekStart, $lastWeekEnd);

    $weeklyMoodComparison = null;
    $weeklyStressComparison = null;

    if ($thisWeekMoodBalance && $lastWeekMoodBalance) {
        $weeklyMoodComparison = [
            'positive' => calculateComparison(
                $thisWeekMoodBalance['positive'],
                $lastWeekMoodBalance['positive'],
                'absolute'
            ),
            'neutral' => calculateComparison(
                $thisWeekMoodBalance['neutral'],
                $lastWeekMoodBalance['neutral'],
                'absolute'
            ),
            'negative' => calculateComparison(
                $thisWeekMoodBalance['negative'],
                $lastWeekMoodBalance['negative'],
                'absolute'
            ),
            'overallTrend' => determineOverallMoodTrend(
                $thisWeekMoodBalance,
                $lastWeekMoodBalance
            )
        ];
    }

    // NEW: Calculate stress category comparison
    if ($thisWeekStressBalance && $lastWeekStressBalance) {
        $weeklyStressComparison = calculateStressCategoryComparison(
            $thisWeekStressBalance,
            $lastWeekStressBalance
        );
    }

    // ========== CALCULATE MONTHLY COMPARISONS ==========
    
    $thisMonthMoodBalance = calculateMoodBalanceForPeriod($thisMonthMoodData, $thisMonthStart, $thisMonthEnd);
    $lastMonthMoodBalance = calculateMoodBalanceForPeriod($lastMonthMoodData, $lastMonthStart, $lastMonthEnd);
    
    // NEW: Calculate stress category balance instead of average
    $thisMonthStressBalance = calculateStressBalanceForPeriod($thisMonthStressData, $thisMonthStart, $thisMonthEnd);
    $lastMonthStressBalance = calculateStressBalanceForPeriod($lastMonthStressData, $lastMonthStart, $lastMonthEnd);

    $monthlyMoodComparison = null;
    $monthlyStressComparison = null;

    if ($thisMonthMoodBalance && $lastMonthMoodBalance) {
        $monthlyMoodComparison = [
            'positive' => calculateComparison(
                $thisMonthMoodBalance['positive'],
                $lastMonthMoodBalance['positive'],
                'absolute'
            ),
            'neutral' => calculateComparison(
                $thisMonthMoodBalance['neutral'],
                $lastMonthMoodBalance['neutral'],
                'absolute'
            ),
            'negative' => calculateComparison(
                $thisMonthMoodBalance['negative'],
                $lastMonthMoodBalance['negative'],
                'absolute'
            ),
            'overallTrend' => determineOverallMoodTrend(
                $thisMonthMoodBalance,
                $lastMonthMoodBalance
            )
        ];
    }

    // NEW: Calculate stress category comparison
    if ($thisMonthStressBalance && $lastMonthStressBalance) {
        $monthlyStressComparison = calculateStressCategoryComparison(
            $thisMonthStressBalance,
            $lastMonthStressBalance
        );
    }

    // ============= ORIGINAL LOGIC FOR LAST 7 DAYS (UNCHANGED) =============
    
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
        'period' => $period,
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
        // ✅ NEW: Add WEEKLY and MONTHLY comparison data (now with stress categories)
        'weeklyComparison' => [
            'mood' => $weeklyMoodComparison,
            'stress' => $weeklyStressComparison, // Now contains low, moderate, high categories
            'period' => [
                'thisWeek' => $thisWeekStart->format('M d') . ' - ' . $thisWeekEnd->format('M d, Y'),
                'lastWeek' => $lastWeekStart->format('M d') . ' - ' . $lastWeekEnd->format('M d, Y')
            ]
        ],
        'monthlyComparison' => [
            'mood' => $monthlyMoodComparison,
            'stress' => $monthlyStressComparison, // Now contains low, moderate, high categories
            'period' => [
                'thisMonth' => $thisMonthStart->format('F Y'),
                'lastMonth' => $lastMonthStart->format('F Y')
            ]
        ]
    ];
}

// ============= DASS DATA SECTION (COMPLETELY UNCHANGED) =============

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

// Process each unique student only once
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