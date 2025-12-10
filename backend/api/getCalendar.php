<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authStudent.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$userId = $user['studentId'];

// Get data of recorded
// $stmtMoodData = $conn->prepare("SELECT * FROM moodTracking WHERE studentId = ?");
// $stmtMoodData->bind_param("i", $userId);
// $stmtMoodData->execute();
// $resultMoodData = $stmtMoodData->get_result();
// $moodData = $resultMoodData->fetch_all(MYSQLI_ASSOC);


// Get data of averageStress
// I havent use this record yet
$stmtStressAvg = $conn->prepare("
    SELECT AVG(stressLevel) AS avgStress
    FROM moodTracking
    WHERE studentId = ?
    AND DATE(datetimeRecord) = CURDATE()
");
$stmtStressAvg->bind_param("i", $userId);
$stmtStressAvg->execute();
$resultStressAvg = $stmtStressAvg->get_result();
$stressData = $resultStressAvg->fetch_assoc();

$avgStress = $stressData['avgStress']; // this is the average


// Get data of averageScale
$stmtMoodData = $conn->prepare("
    SELECT 
        mt.moodTypeId,
        mt.datetimeRecord,
        m.scale
    FROM moodTracking mt
    JOIN mood m ON mt.moodTypeId = m.moodTypeId
    WHERE mt.studentId = ?
    ORDER BY mt.datetimeRecord ASC
");
$stmtMoodData->bind_param("i", $userId);
$stmtMoodData->execute();

$resultMoodData = $stmtMoodData->get_result();

$dailyMoodScales = []; // "2025-01-21" => [7, 6]

// Group all scales by date
while ($row = $resultMoodData->fetch_assoc()) {
    $date = (new DateTime($row['datetimeRecord']))->format('Y-m-d');

    if (!isset($dailyMoodScales[$date])) {
        $dailyMoodScales[$date] = [];
    }

    $dailyMoodScales[$date][] = $row['scale'];
}

$dailyMoodAverage = [];  // "2025-01-21" => 7 (rounded)
$finalDailyMood = [];    // final mood result for each day

// For each date → Calculate average scale and fetch mood info
foreach ($dailyMoodScales as $date => $scales) {

    // Step 1: Average scale
    $avg = array_sum($scales) / count($scales);
    $finalScale = round($avg);

    // Step 2: Get mood info based on scale
    $stmtMoodInfo = $conn->prepare("
        SELECT moodStatus, moodStoreLocation
        FROM mood
        WHERE scale = ?
    ");
    $stmtMoodInfo->bind_param("i", $finalScale);
    $stmtMoodInfo->execute();

    $resultMoodInfo = $stmtMoodInfo->get_result();
    $moodInfo = $resultMoodInfo->fetch_assoc();

    // Step 3: Store final mood data for this date
    $finalDailyMood[$date] = [
        "moodStatus" => $moodInfo['moodStatus'],
        "moodStoreLocation" => $moodInfo['moodStoreLocation'],
        "totalRecords" => count($scales) // total records for this day
    ];

}

// Get Monthly data of recorded
$moodCount = [];

$stmtMoodDataMonthly = $conn->prepare("
    SELECT *
    FROM moodTracking
    WHERE studentId = ?
    AND YEAR(datetimeRecord) = YEAR(CURDATE())
    AND MONTH(datetimeRecord) = MONTH(CURDATE())
");
$stmtMoodDataMonthly->bind_param("i", $userId);
$stmtMoodDataMonthly->execute();
$resultMoodDataMonthly = $stmtMoodDataMonthly->get_result();
$moodDataMonthly = $resultMoodDataMonthly->fetch_all(MYSQLI_ASSOC);

// Initialize 8 mood counters
$moodCount = array_fill(0, 8, 0);

// Count mood occurrences
foreach ($moodDataMonthly as $monthlyRow) {
    $type = intval($monthlyRow['moodTypeId']);
    if ($type >= 1 && $type <= 8) {
        $moodCount[$type - 1]++;
    }
}

// Get total record per day
$stmtCount = $conn->prepare("
    SELECT COUNT(*) AS totalRecords
    FROM moodTracking
    WHERE studentId = ?
    AND DATE(datetimeRecord) = CURDATE()
");
$stmtCount->bind_param("i", $userId);
$stmtCount->execute();
$resultCount = $stmtCount->get_result();
$rowCount = $resultCount->fetch_assoc();
$totalRecords = $rowCount ? $rowCount['totalRecords'] : 0;



// Output JSON
echo json_encode([
    "success" => true,
    "dailyMood" => $finalDailyMood,
    "totalRecord" => $totalRecords,
    "monthlyMoodCount" => $moodCount
]);
?>