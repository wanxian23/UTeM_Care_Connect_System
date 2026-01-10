<?php
// getStatisticCounsellor.php
// Handle preflight CORS request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:3000");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Authorization, Content-Type");
    header("Access-Control-Max-Age: 86400");
    exit;
}

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

require "../database.php";
require "authPa.php";

// Authenticate counsellor
$user = validateToken($conn);

// Get week and month offset from query parameters
$weekOffset = isset($_GET['weekOffset']) ? (int)$_GET['weekOffset'] : 0;
$monthOffset = isset($_GET['monthOffset']) ? (int)$_GET['monthOffset'] : 0;

$today = new DateTime();

// Calculate target week based on offset
$targetWeekDate = (clone $today)->modify($weekOffset . ' weeks');
$currentDayOfWeek = (int)$targetWeekDate->format('N');
$weekStart = (clone $targetWeekDate)->modify('-' . ($currentDayOfWeek - 1) . ' days')->setTime(0,0,0);
$weekEnd = (clone $weekStart)->modify('+6 days')->setTime(23,59,59);

// Calculate target month based on offset
$targetMonthDate = (clone $today)->modify($monthOffset . ' months');
$targetMonth = (int)$targetMonthDate->format('m');
$targetYear = (int)$targetMonthDate->format('Y');

// Calculate week information
$weekStartMonth = $weekStart->format('F');
$weekEndMonth = $weekEnd->format('F');
$weekYear = $weekStart->format('Y');

$firstDayOfMonth = (clone $weekStart)->modify('first day of this month');
$daysDiff = $weekStart->diff($firstDayOfMonth)->days;
$weekOfMonth = floor($daysDiff / 7) + 1;

if ($weekStartMonth !== $weekEndMonth) {
    $weekDisplayText = $weekOfMonth . getOrdinalSuffix($weekOfMonth) . " week of " . $weekStartMonth . " " . $weekYear;
} else {
    $weekDisplayText = $weekOfMonth . getOrdinalSuffix($weekOfMonth) . " week of " . $weekStartMonth . " " . $weekYear;
}

// Month information
$monthDisplayText = $targetMonthDate->format('F Y');

// Helper function for ordinal suffix
function getOrdinalSuffix($num) {
    if (!in_array(($num % 100), [11, 12, 13])) {
        switch ($num % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
        }
    }
    return 'th';
}

// Helper function to categorize stress
function getStressCategory($stress) {
    if ($stress < 40) return 'Low Stress';
    if ($stress <= 60) return 'Moderate Stress';
    return 'High Stress';
}

// ============= FACULTY MOOD COMPARISON (UNCHANGED) =============
function calculateFacultyMoodComparison($conn, $startDate, $endDate) {
    $faculties = ['FTKEK', 'FTKE', 'FTKM', 'FTKIP', 'FTMK', 'FPTT', 'FAIX'];
    $result = [];
    
    foreach ($faculties as $faculty) {
        // First check if faculty has any students
        $stmtCheck = $conn->prepare("
            SELECT COUNT(*) as studentCount
            FROM student
            WHERE studentFaculty = ?
        ");
        $stmtCheck->bind_param("s", $faculty);
        $stmtCheck->execute();
        $checkResult = $stmtCheck->get_result();
        $checkRow = $checkResult->fetch_assoc();
        
        if ($checkRow['studentCount'] == 0) {
            $result[$faculty] = [
                'positive' => 0,
                'neutral' => 0,
                'negative' => 0,
                'totalStudents' => 0
            ];
            continue;
        }
        
        $stmt = $conn->prepare("
            SELECT m.category, COUNT(*) as count
            FROM moodTracking mt
            JOIN mood m ON mt.moodTypeId = m.moodTypeId
            JOIN student s ON mt.studentId = s.studentId
            WHERE s.studentFaculty = ?
            AND mt.datetimeRecord >= ?
            AND mt.datetimeRecord <= ?
            GROUP BY m.category
        ");
        
        $startStr = $startDate->format('Y-m-d H:i:s');
        $endStr = $endDate->format('Y-m-d H:i:s');
        $stmt->bind_param("sss", $faculty, $startStr, $endStr);
        $stmt->execute();
        $moodResult = $stmt->get_result();
        
        $positive = 0;
        $neutral = 0;
        $negative = 0;
        $total = 0;
        
        while ($row = $moodResult->fetch_assoc()) {
            $count = (int)$row['count'];
            $total += $count;
            
            if ($row['category'] === 'Positive') {
                $positive = $count;
            } elseif ($row['category'] === 'Neutral') {
                $neutral = $count;
            } else {
                $negative = $count;
            }
        }
        
        $stmtStudents = $conn->prepare("
            SELECT COUNT(DISTINCT mt.studentId) as totalStudents
            FROM moodTracking mt
            JOIN student s ON mt.studentId = s.studentId
            WHERE s.studentFaculty = ?
            AND mt.datetimeRecord >= ?
            AND mt.datetimeRecord <= ?
        ");
        $stmtStudents->bind_param("sss", $faculty, $startStr, $endStr);
        $stmtStudents->execute();
        $studentResult = $stmtStudents->get_result();
        $studentRow = $studentResult->fetch_assoc();
        $totalStudents = (int)$studentRow['totalStudents'];
        
        if ($total > 0) {
            $result[$faculty] = [
                'positive' => round(($positive / $total) * 100),
                'neutral' => round(($neutral / $total) * 100),
                'negative' => round(($negative / $total) * 100),
                'totalStudents' => $totalStudents
            ];
        } else {
            $result[$faculty] = [
                'positive' => 0,
                'neutral' => 0,
                'negative' => 0,
                'totalStudents' => 0
            ];
        }
    }
    
    return $result;
}

// ============= FACULTY STRESS COMPARISON (UPDATED TO USE CATEGORIES) =============
function calculateFacultyStressComparison($conn, $startDate, $endDate) {
    $faculties = ['FTKEK', 'FTKE', 'FTKM', 'FTKIP', 'FTMK', 'FPTT', 'FAIX'];
    $result = [];
    
    foreach ($faculties as $faculty) {
        $stmtCheck = $conn->prepare("
            SELECT COUNT(*) as studentCount
            FROM student
            WHERE studentFaculty = ?
        ");
        $stmtCheck->bind_param("s", $faculty);
        $stmtCheck->execute();
        $checkResult = $stmtCheck->get_result();
        $checkRow = $checkResult->fetch_assoc();
        
        if ($checkRow['studentCount'] == 0) {
            $result[$faculty] = [
                'low' => 0,
                'moderate' => 0,
                'high' => 0,
                'totalStudents' => 0
            ];
            continue;
        }
        
        $stmt = $conn->prepare("
            SELECT st.stressLevel
            FROM stress st
            JOIN student s ON st.studentId = s.studentId
            WHERE s.studentFaculty = ?
            AND st.datetimeRecord >= ?
            AND st.datetimeRecord <= ?
        ");
        
        $startStr = $startDate->format('Y-m-d H:i:s');
        $endStr = $endDate->format('Y-m-d H:i:s');
        $stmt->bind_param("sss", $faculty, $startStr, $endStr);
        $stmt->execute();
        $stressResult = $stmt->get_result();
        
        $lowCount = 0;
        $moderateCount = 0;
        $highCount = 0;
        $total = 0;
        
        while ($row = $stressResult->fetch_assoc()) {
            $stressLevel = (float)$row['stressLevel'];
            $total++;
            
            $category = getStressCategory($stressLevel);
            if ($category === 'Low Stress') {
                $lowCount++;
            } elseif ($category === 'Moderate Stress') {
                $moderateCount++;
            } else {
                $highCount++;
            }
        }
        
        $stmtStudents = $conn->prepare("
            SELECT COUNT(DISTINCT st.studentId) as totalStudents
            FROM stress st
            JOIN student s ON st.studentId = s.studentId
            WHERE s.studentFaculty = ?
            AND st.datetimeRecord >= ?
            AND st.datetimeRecord <= ?
        ");
        $stmtStudents->bind_param("sss", $faculty, $startStr, $endStr);
        $stmtStudents->execute();
        $studentResult = $stmtStudents->get_result();
        $studentRow = $studentResult->fetch_assoc();
        $totalStudents = (int)$studentRow['totalStudents'];
        
        if ($total > 0) {
            $result[$faculty] = [
                'low' => round(($lowCount / $total) * 100),
                'moderate' => round(($moderateCount / $total) * 100),
                'high' => round(($highCount / $total) * 100),
                'totalStudents' => $totalStudents
            ];
        } else {
            $result[$faculty] = [
                'low' => 0,
                'moderate' => 0,
                'high' => 0,
                'totalStudents' => 0
            ];
        }
    }
    
    return $result;
}

// ============= DASS STATISTICS (UPDATED TO USE CATEGORY PERCENTAGES) =============
function getDassLevel($score, $category) {
    if ($category === 'depression') {
        if ($score <= 9) return 'Normal';
        if ($score <= 13) return 'Mild';
        if ($score <= 20) return 'Moderate';
        if ($score <= 27) return 'Severe';
        return 'Extremely Severe';
    } elseif ($category === 'anxiety') {
        if ($score <= 7) return 'Normal';
        if ($score <= 9) return 'Mild';
        if ($score <= 14) return 'Moderate';
        if ($score <= 19) return 'Severe';
        return 'Extremely Severe';
    } else { // stress
        if ($score <= 14) return 'Normal';
        if ($score <= 18) return 'Mild';
        if ($score <= 25) return 'Moderate';
        if ($score <= 33) return 'Severe';
        return 'Extremely Severe';
    }
}

function calculateFacultyDassComparison($conn, $startDate, $endDate) {
    $faculties = ['FTKEK', 'FTKE', 'FTKM', 'FTKIP', 'FTMK', 'FPTT', 'FAIX'];
    $result = [
        'depression' => [],
        'anxiety' => [],
        'stress' => []
    ];
    
    foreach ($faculties as $faculty) {
        $stmtCheck = $conn->prepare("
            SELECT COUNT(*) as studentCount
            FROM student
            WHERE studentFaculty = ?
        ");
        $stmtCheck->bind_param("s", $faculty);
        $stmtCheck->execute();
        $checkResult = $stmtCheck->get_result();
        $checkRow = $checkResult->fetch_assoc();
        
        if ($checkRow['studentCount'] == 0) {
            $result['depression'][$faculty] = [
                'normal' => 0,
                'mild' => 0,
                'moderate' => 0,
                'severe' => 0,
                'extremelySevere' => 0,
                'totalStudents' => 0
            ];
            $result['anxiety'][$faculty] = [
                'normal' => 0,
                'mild' => 0,
                'moderate' => 0,
                'severe' => 0,
                'extremelySevere' => 0,
                'totalStudents' => 0
            ];
            $result['stress'][$faculty] = [
                'normal' => 0,
                'mild' => 0,
                'moderate' => 0,
                'severe' => 0,
                'extremelySevere' => 0,
                'totalStudents' => 0
            ];
            continue;
        }
        
        $startStr = $startDate->format('Y-m-d H:i:s');
        $endStr = $endDate->format('Y-m-d H:i:s');
        
        $stmtStudents = $conn->prepare("
            SELECT DISTINCT d.studentId
            FROM dass d
            JOIN student s ON d.studentId = s.studentId
            WHERE s.studentFaculty = ?
            AND d.dassCompletedDateTime >= ?
            AND d.dassCompletedDateTime <= ?
            AND d.status = 'Completed'
        ");
        $stmtStudents->bind_param("sss", $faculty, $startStr, $endStr);
        $stmtStudents->execute();
        $studentResult = $stmtStudents->get_result();
        
        $depressionLevels = [];
        $anxietyLevels = [];
        $stressLevels = [];
        $totalStudents = 0;
        
        while ($studentRow = $studentResult->fetch_assoc()) {
            $studentId = $studentRow['studentId'];
            $totalStudents++;
            
            $stmtLatest = $conn->prepare("
                SELECT d.dassId
                FROM dass d
                WHERE d.studentId = ?
                AND d.dassCompletedDateTime >= ?
                AND d.dassCompletedDateTime <= ?
                AND d.status = 'Completed'
                ORDER BY d.dassCompletedDateTime DESC
                LIMIT 1
            ");
            $stmtLatest->bind_param("iss", $studentId, $startStr, $endStr);
            $stmtLatest->execute();
            $latestResult = $stmtLatest->get_result();
            
            if ($latestRow = $latestResult->fetch_assoc()) {
                $dassId = $latestRow['dassId'];
                
                // Depression
                $stmtDep = $conn->prepare("
                    SELECT SUM(dr.scale) as total
                    FROM dassRecord dr
                    JOIN dassQuestion dq ON dr.dassQuestionId = dq.dassQuestionId
                    WHERE dr.dassId = ? AND dq.type = 'Depression'
                ");
                $stmtDep->bind_param("i", $dassId);
                $stmtDep->execute();
                $depResult = $stmtDep->get_result();
                $depRow = $depResult->fetch_assoc();
                $depScore = $depRow['total'] ? (int)$depRow['total'] : 0;
                $depressionLevels[] = getDassLevel($depScore, 'depression');
                
                // Anxiety
                $stmtAnx = $conn->prepare("
                    SELECT SUM(dr.scale) as total
                    FROM dassRecord dr
                    JOIN dassQuestion dq ON dr.dassQuestionId = dq.dassQuestionId
                    WHERE dr.dassId = ? AND dq.type = 'Anxiety'
                ");
                $stmtAnx->bind_param("i", $dassId);
                $stmtAnx->execute();
                $anxResult = $stmtAnx->get_result();
                $anxRow = $anxResult->fetch_assoc();
                $anxScore = $anxRow['total'] ? (int)$anxRow['total'] : 0;
                $anxietyLevels[] = getDassLevel($anxScore, 'anxiety');
                
                // Stress
                $stmtStr = $conn->prepare("
                    SELECT SUM(dr.scale) as total
                    FROM dassRecord dr
                    JOIN dassQuestion dq ON dr.dassQuestionId = dq.dassQuestionId
                    WHERE dr.dassId = ? AND dq.type = 'Stress'
                ");
                $stmtStr->bind_param("i", $dassId);
                $stmtStr->execute();
                $strResult = $stmtStr->get_result();
                $strRow = $strResult->fetch_assoc();
                $strScore = $strRow['total'] ? (int)$strRow['total'] : 0;
                $stressLevels[] = getDassLevel($strScore, 'stress');
            }
        }
        
        // Count categories for Depression
        if (count($depressionLevels) > 0) {
            $normalCount = count(array_filter($depressionLevels, fn($l) => $l === 'Normal'));
            $mildCount = count(array_filter($depressionLevels, fn($l) => $l === 'Mild'));
            $moderateCount = count(array_filter($depressionLevels, fn($l) => $l === 'Moderate'));
            $severeCount = count(array_filter($depressionLevels, fn($l) => $l === 'Severe'));
            $extremelyCount = count(array_filter($depressionLevels, fn($l) => $l === 'Extremely Severe'));
            $total = count($depressionLevels);
            
            $result['depression'][$faculty] = [
                'normal' => round(($normalCount / $total) * 100),
                'mild' => round(($mildCount / $total) * 100),
                'moderate' => round(($moderateCount / $total) * 100),
                'severe' => round(($severeCount / $total) * 100),
                'extremelySevere' => round(($extremelyCount / $total) * 100),
                'totalStudents' => $totalStudents
            ];
        } else {
            $result['depression'][$faculty] = [
                'normal' => 0,
                'mild' => 0,
                'moderate' => 0,
                'severe' => 0,
                'extremelySevere' => 0,
                'totalStudents' => 0
            ];
        }
        
        // Count categories for Anxiety
        if (count($anxietyLevels) > 0) {
            $normalCount = count(array_filter($anxietyLevels, fn($l) => $l === 'Normal'));
            $mildCount = count(array_filter($anxietyLevels, fn($l) => $l === 'Mild'));
            $moderateCount = count(array_filter($anxietyLevels, fn($l) => $l === 'Moderate'));
            $severeCount = count(array_filter($anxietyLevels, fn($l) => $l === 'Severe'));
            $extremelyCount = count(array_filter($anxietyLevels, fn($l) => $l === 'Extremely Severe'));
            $total = count($anxietyLevels);
            
            $result['anxiety'][$faculty] = [
                'normal' => round(($normalCount / $total) * 100),
                'mild' => round(($mildCount / $total) * 100),
                'moderate' => round(($moderateCount / $total) * 100),
                'severe' => round(($severeCount / $total) * 100),
                'extremelySevere' => round(($extremelyCount / $total) * 100),
                'totalStudents' => $totalStudents
            ];
        } else {
            $result['anxiety'][$faculty] = [
                'normal' => 0,
                'mild' => 0,
                'moderate' => 0,
                'severe' => 0,
                'extremelySevere' => 0,
                'totalStudents' => 0
            ];
        }
        
        // Count categories for Stress
        if (count($stressLevels) > 0) {
            $normalCount = count(array_filter($stressLevels, fn($l) => $l === 'Normal'));
            $mildCount = count(array_filter($stressLevels, fn($l) => $l === 'Mild'));
            $moderateCount = count(array_filter($stressLevels, fn($l) => $l === 'Moderate'));
            $severeCount = count(array_filter($stressLevels, fn($l) => $l === 'Severe'));
            $extremelyCount = count(array_filter($stressLevels, fn($l) => $l === 'Extremely Severe'));
            $total = count($stressLevels);
            
            $result['stress'][$faculty] = [
                'normal' => round(($normalCount / $total) * 100),
                'mild' => round(($mildCount / $total) * 100),
                'moderate' => round(($moderateCount / $total) * 100),
                'severe' => round(($severeCount / $total) * 100),
                'extremelySevere' => round(($extremelyCount / $total) * 100),
                'totalStudents' => $totalStudents
            ];
        } else {
            $result['stress'][$faculty] = [
                'normal' => 0,
                'mild' => 0,
                'moderate' => 0,
                'severe' => 0,
                'extremelySevere' => 0,
                'totalStudents' => 0
            ];
        }
    }
    
    return $result;
}

// Calculate all statistics
$weeklyFacultyMood = calculateFacultyMoodComparison($conn, $weekStart, $weekEnd);
$weeklyFacultyStress = calculateFacultyStressComparison($conn, $weekStart, $weekEnd);
$weeklyDass = calculateFacultyDassComparison($conn, $weekStart, $weekEnd);

$monthStart = new DateTime("$targetYear-$targetMonth-01 00:00:00");
$monthEnd = (clone $monthStart)->modify('last day of this month')->setTime(23, 59, 59);
$monthlyFacultyMood = calculateFacultyMoodComparison($conn, $monthStart, $monthEnd);
$monthlyFacultyStress = calculateFacultyStressComparison($conn, $monthStart, $monthEnd);
$monthlyDass = calculateFacultyDassComparison($conn, $monthStart, $monthEnd);

// Output
ob_clean();
header('Content-Type: application/json');

echo json_encode([
    "success" => true,
    "weekInfo" => [
        "displayText" => $weekDisplayText,
        "weekStart" => $weekStart->format('Y-m-d'),
        "weekEnd" => $weekEnd->format('Y-m-d')
    ],
    "monthInfo" => [
        "displayText" => $monthDisplayText,
        "month" => $targetMonth,
        "year" => $targetYear
    ],
    "weeklyFacultyMood" => $weeklyFacultyMood,
    "monthlyFacultyMood" => $monthlyFacultyMood,
    "weeklyFacultyStress" => $weeklyFacultyStress,
    "monthlyFacultyStress" => $monthlyFacultyStress,
    "weeklyDass" => $weeklyDass,
    "monthlyDass" => $monthlyDass
]);

exit;
?>