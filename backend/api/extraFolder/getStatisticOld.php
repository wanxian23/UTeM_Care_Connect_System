<?php
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
require "authStudent.php";

// Authenticate student
$user = validateToken($conn);
$userId = $user['studentId'];

// Get week and month offset from query parameters
$weekOffset = isset($_GET['weekOffset']) ? (int)$_GET['weekOffset'] : 0;
$monthOffset = isset($_GET['monthOffset']) ? (int)$_GET['monthOffset'] : 0;

// Get all mood tracking records for this student
$stmtMoodData = $conn->prepare("
    SELECT mt.datetimeRecord, m.moodStatus, m.moodTypeId, m.category
    FROM moodTracking mt
    JOIN mood m ON mt.moodTypeId = m.moodTypeId
    WHERE mt.studentId = ?
    ORDER BY datetimeRecord ASC
");
$stmtMoodData->bind_param("i", $userId);
$stmtMoodData->execute();
$result = $stmtMoodData->get_result();
$moodData = $result->fetch_all(MYSQLI_ASSOC);

// Get all stress records from separate stress table
$stmtStressData = $conn->prepare("
    SELECT stressLevel, datetimeRecord
    FROM stress
    WHERE studentId = ?
    ORDER BY datetimeRecord ASC
");
$stmtStressData->bind_param("i", $userId);
$stmtStressData->execute();
$resultStress = $stmtStressData->get_result();
$stressData = $resultStress->fetch_all(MYSQLI_ASSOC);

// Helper function for average
function averageOrNull($arr) {
    if (empty($arr)) return null;
    return round(array_sum($arr)/count($arr), 1);
}

// Prepare arrays
$weeklyTrend = [];
$monthlyTrend = [];
$weeklyStressTrend = [];
$monthlyStressTrend = [];

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

$weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// Initialize arrays
foreach($weekDays as $day) {
    $weeklyTrend[$day] = [];
    $weeklyStressTrend[$day] = [];
}
for($d=1; $d<=31; $d++){
    $key = str_pad($d,2,'0',STR_PAD_LEFT);
    $monthlyTrend[$key] = [];
    $monthlyStressTrend[$key] = [];
}

// Populate mood trend (no stress here anymore)
foreach($moodData as $row){
    $dateObj = new DateTime($row['datetimeRecord']);
    $dayOfWeek = $dateObj->format('D');
    $dayOfMonth = $dateObj->format('d');
    $month = (int)$dateObj->format('m');
    $year = (int)$dateObj->format('Y');

    // Check if date is within target week
    if ($dateObj >= $weekStart && $dateObj <= $weekEnd) {
        $weeklyTrend[$dayOfWeek][] = [
            'moodStatus' => $row['moodStatus'],
            'moodTypeId' => (int)$row['moodTypeId']
        ];
    }
    
    // Check if date is within target month
    if ($month === $targetMonth && $year === $targetYear) {
        $monthlyTrend[$dayOfMonth][] = [
            'moodStatus' => $row['moodStatus'],
            'moodTypeId' => (int)$row['moodTypeId']
        ];
    }
}

// Populate stress trend from separate stress table
foreach($stressData as $row){
    $dateObj = new DateTime($row['datetimeRecord']);
    $dayOfWeek = $dateObj->format('D');
    $dayOfMonth = $dateObj->format('d');
    $month = (int)$dateObj->format('m');
    $year = (int)$dateObj->format('Y');

    // Check if date is within target week
    if ($dateObj >= $weekStart && $dateObj <= $weekEnd) {
        $weeklyStressTrend[$dayOfWeek][] = (float)$row['stressLevel'];
    }
    
    // Check if date is within target month
    if ($month === $targetMonth && $year === $targetYear) {
        $monthlyStressTrend[$dayOfMonth][] = (float)$row['stressLevel'];
    }
}

// Average stress per day
foreach($weeklyStressTrend as $day => $scores){
    $weeklyStressTrend[$day] = averageOrNull($scores);
}
foreach($monthlyStressTrend as $day => $scores){
    $monthlyStressTrend[$day] = averageOrNull($scores);
}

// Fill empty mood days with null
foreach($weeklyTrend as $day => $records){
    if(empty($records)) $weeklyTrend[$day] = null;
}
foreach($monthlyTrend as $day => $records){
    if(empty($records)) $monthlyTrend[$day] = null;
}

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

// Helper function for mood sentiment
function getMoodSentiment($categories) {
    if (empty($categories)) return null;
    $pos = $neu = $neg = 0;
    foreach($categories as $cat) {
        if ($cat === 'Positive') $pos++;
        elseif ($cat === 'Neutral') $neu++;
        else $neg++;
    }
    if ($pos > $neg && $pos > $neu) return 'Mostly Positive';
    if ($neg > $pos && $neg > $neu) return 'Mostly Negative';
    return 'Mostly Neutral';
}

// Calculate mood summary statistics
function calculateMoodSummary($trendData, $moodData, $weekStart, $weekEnd) {
    $allMoods = [];
    $moodCounts = [];
    $positiveCount = 0;
    $neutralCount = 0;
    $negativeCount = 0;
    $morningMoods = [];
    $afternoonMoods = [];
    $eveningMoods = [];
    
    foreach($moodData as $row) {
        $dateObj = new DateTime($row['datetimeRecord']);
        if ($dateObj >= $weekStart && $dateObj <= $weekEnd) {
            $moodId = (int)$row['moodTypeId'];
            $category = $row['category'];
            $hour = (int)$dateObj->format('H');
            
            $allMoods[] = $moodId;
            
            if (!isset($moodCounts[$moodId])) {
                $moodCounts[$moodId] = 0;
            }
            $moodCounts[$moodId]++;
            
            if ($category === 'Positive') {
                $positiveCount++;
            } elseif ($category === 'Neutral') {
                $neutralCount++;
            } else {
                $negativeCount++;
            }
            
            if ($hour >= 0 && $hour <= 12) {
                $morningMoods[] = $category;
            } elseif ($hour >= 13 && $hour <= 23) {
                $afternoonMoods[] = $category;
            } else {
                $eveningMoods[] = $category;
            }
        }
    }
    
    $totalMoods = count($allMoods);
    
    if ($totalMoods == 0) {
        return null;
    }
    
    arsort($moodCounts);
    $mostFrequentMoodId = array_key_first($moodCounts);
    $mostFrequentCount = $moodCounts[$mostFrequentMoodId];
    
    $moodNames = [
        1 => 'Excited',
        2 => 'Happy',
        3 => 'Neutral',
        4 => 'Sad',
        5 => 'Crying',
        6 => 'Angry',
        7 => 'Anxious',
        8 => 'Annoying'
    ];
    
    $positivePercent = round(($positiveCount / $totalMoods) * 100);
    $neutralPercent = round(($neutralCount / $totalMoods) * 100);
    $negativePercent = round(($negativeCount / $totalMoods) * 100);
    
    return [
        'mostFrequentMood' => [
            'moodId' => $mostFrequentMoodId,
            'moodName' => $moodNames[$mostFrequentMoodId],
            'count' => $mostFrequentCount
        ],
        'moodBalance' => [
            'positive' => $positivePercent,
            'neutral' => $neutralPercent,
            'negative' => $negativePercent
        ],
        'timeBasedInsight' => [
            'morning' => getMoodSentiment($morningMoods),
            'afternoon' => getMoodSentiment($afternoonMoods),
            'evening' => getMoodSentiment($eveningMoods)
        ]
    ];
}

function getStressLevel($stress) {
    if ($stress <= 20) return 'Very Low Stress';
    if ($stress <= 40) return 'Low Stress';
    if ($stress <= 60) return 'Moderate Stress';
    if ($stress <= 80) return 'High Stress';
    return 'Very High Stress';
}

// Calculate stress summary statistics using separate stress table data
function calculateStressSummary($stressData, $weekStart, $weekEnd) {
    $allStress = [];
    $stressByDay = [];
    
    foreach($stressData as $row) {
        $dateObj = new DateTime($row['datetimeRecord']);
        if ($dateObj >= $weekStart && $dateObj <= $weekEnd) {
            $stress = (float)$row['stressLevel'];
            $dayName = $dateObj->format('D');
            
            $allStress[] = $stress;
            
            if (!isset($stressByDay[$dayName])) {
                $stressByDay[$dayName] = [];
            }
            $stressByDay[$dayName][] = $stress;
        }
    }
    
    if (empty($allStress)) {
        return null;
    }
    
    $avgStress = round(array_sum($allStress) / count($allStress), 1);
    
    $dayAverages = [];
    foreach($stressByDay as $day => $scores) {
        $dayAverages[$day] = array_sum($scores) / count($scores);
    }
    
    if (!empty($dayAverages)) {
        $maxStress = max($dayAverages);
        $peakDays = array_keys(array_filter($dayAverages, function($v) use ($maxStress) {
            return abs($v - $maxStress) < 0.1;
        }));
    } else {
        $peakDays = [];
        $maxStress = 0;
    }
    
    $mean = array_sum($allStress) / count($allStress);
    $variance = array_sum(array_map(function($x) use ($mean) {
        return pow($x - $mean, 2);
    }, $allStress)) / count($allStress);
    $stdDev = sqrt($variance);
    
    $consistency = 'Stable';
    if ($stdDev > 20) {
        $consistency = 'High Fluctuations';
    } elseif ($stdDev > 10) {
        $consistency = 'Moderate Fluctuations';
    }
    
    return [
        'avgStress' => $avgStress,
        'avgStressLevel' => getStressLevel($avgStress),
        'peakStressDays' => $peakDays,
        'peakStressLevel' => getStressLevel($maxStress),
        'stressConsistency' => $consistency
    ];
}

// Calculate summaries for weekly data
$weeklySummary = calculateMoodSummary($weeklyTrend, $moodData, $weekStart, $weekEnd);
$weeklyStressSummary = calculateStressSummary($stressData, $weekStart, $weekEnd);

// Calculate summaries for monthly data
$monthStart = new DateTime("$targetYear-$targetMonth-01 00:00:00");
$monthEnd = (clone $monthStart)->modify('last day of this month')->setTime(23, 59, 59);
$monthlySummary = calculateMoodSummary($monthlyTrend, $moodData, $monthStart, $monthEnd);
$monthlyStressSummary = calculateStressSummary($stressData, $monthStart, $monthEnd);

// [Previous headers and setup code remains the same until after calculating current period summaries]

// ============= COMPARISON CALCULATION =============

// Helper function to calculate comparison data
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

// ============= PREVIOUS WEEK CALCULATION =============
$prevWeekStart = (clone $weekStart)->modify('-7 days');
$prevWeekEnd = (clone $weekEnd)->modify('-7 days');

$prevWeeklySummary = calculateMoodSummary($weeklyTrend, $moodData, $prevWeekStart, $prevWeekEnd);
$prevWeeklyStressSummary = calculateStressSummary($stressData, $prevWeekStart, $prevWeekEnd);

// Calculate weekly comparisons
$weeklyMoodComparison = null;
$weeklyStressComparison = null;

if ($weeklySummary && $prevWeeklySummary) {
    $weeklyMoodComparison = [
        'positive' => calculateComparison(
            $weeklySummary['moodBalance']['positive'],
            $prevWeeklySummary['moodBalance']['positive'],
            'absolute'
        ),
        'neutral' => calculateComparison(
            $weeklySummary['moodBalance']['neutral'],
            $prevWeeklySummary['moodBalance']['neutral'],
            'absolute'
        ),
        'negative' => calculateComparison(
            $weeklySummary['moodBalance']['negative'],
            $prevWeeklySummary['moodBalance']['negative'],
            'absolute'
        ),
        'overallTrend' => determineOverallMoodTrend(
            $weeklySummary['moodBalance'],
            $prevWeeklySummary['moodBalance']
        )
    ];
}

if ($weeklyStressSummary && $prevWeeklyStressSummary) {
    $weeklyStressComparison = calculateComparison(
        $weeklyStressSummary['avgStress'],
        $prevWeeklyStressSummary['avgStress'],
        'percentage'
    );
}

// ============= PREVIOUS MONTH CALCULATION =============
$prevMonthDate = (clone $targetMonthDate)->modify('-1 month');
$prevMonth = (int)$prevMonthDate->format('m');
$prevYear = (int)$prevMonthDate->format('Y');

$prevMonthStart = new DateTime("$prevYear-$prevMonth-01 00:00:00");
$prevMonthEnd = (clone $prevMonthStart)->modify('last day of this month')->setTime(23, 59, 59);

$prevMonthlySummary = calculateMoodSummary($monthlyTrend, $moodData, $prevMonthStart, $prevMonthEnd);
$prevMonthlyStressSummary = calculateStressSummary($stressData, $prevMonthStart, $prevMonthEnd);

// Calculate monthly comparisons
$monthlyMoodComparison = null;
$monthlyStressComparison = null;

if ($monthlySummary && $prevMonthlySummary) {
    $monthlyMoodComparison = [
        'positive' => calculateComparison(
            $monthlySummary['moodBalance']['positive'],
            $prevMonthlySummary['moodBalance']['positive'],
            'absolute'
        ),
        'neutral' => calculateComparison(
            $monthlySummary['moodBalance']['neutral'],
            $prevMonthlySummary['moodBalance']['neutral'],
            'absolute'
        ),
        'negative' => calculateComparison(
            $monthlySummary['moodBalance']['negative'],
            $prevMonthlySummary['moodBalance']['negative'],
            'absolute'
        ),
        'overallTrend' => determineOverallMoodTrend(
            $monthlySummary['moodBalance'],
            $prevMonthlySummary['moodBalance']
        )
    ];
}

if ($monthlyStressSummary && $prevMonthlyStressSummary) {
    $monthlyStressComparison = calculateComparison(
        $monthlyStressSummary['avgStress'],
        $prevMonthlyStressSummary['avgStress'],
        'percentage'
    );
}

// Helper function to determine overall mood trend
function determineOverallMoodTrend($current, $previous) {
    $posChange = $current['positive'] - $previous['positive'];
    $negChange = $current['negative'] - $previous['negative'];
    
    // Calculate a "mood score" (positive - negative)
    $currentScore = $current['positive'] - $current['negative'];
    $previousScore = $previous['positive'] - $previous['negative'];
    $scoreDiff = $currentScore - $previousScore;
    
    if ($scoreDiff > 5) {
        return 'improving'; // More positive moods, fewer negative moods
    } elseif ($scoreDiff < -5) {
        return 'declining'; // Fewer positive moods, more negative moods
    } else {
        return 'stable';
    }
}

// ============= FINAL OUTPUT =============
ob_clean();
header('Content-Type: application/json');

echo json_encode([
    "success" => true,
    "weeklyTrend" => $weeklyTrend,
    "monthlyTrend" => $monthlyTrend,
    "weeklyStressTrend" => $weeklyStressTrend,
    "monthlyStressTrend" => $monthlyStressTrend,
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
    "weeklySummary" => $weeklySummary,
    "weeklyStressSummary" => $weeklyStressSummary,
    "monthlySummary" => $monthlySummary,
    "monthlyStressSummary" => $monthlyStressSummary,
    
    // NEW: Comparison data
    "weeklyMoodComparison" => $weeklyMoodComparison,
    "weeklyStressComparison" => $weeklyStressComparison,
    "monthlyMoodComparison" => $monthlyMoodComparison,
    "monthlyStressComparison" => $monthlyStressComparison,
    
    // Reference periods for context
    "comparisonInfo" => [
        "weeklyComparison" => [
            "currentPeriod" => $weekDisplayText,
            "previousPeriod" => "Previous week (" . $prevWeekStart->format('M d') . " - " . $prevWeekEnd->format('M d, Y') . ")"
        ],
        "monthlyComparison" => [
            "currentPeriod" => $monthDisplayText,
            "previousPeriod" => $prevMonthDate->format('F Y')
        ]
    ]
]);

exit;
?>