<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authStudent.php";

// Authenticate student
$user = validateToken($conn);
$userId = $user['studentId'];

// Get all mood tracking records for this student
$stmtMoodData = $conn->prepare("
    SELECT *
    FROM moodTracking
    WHERE studentId = ?
");
$stmtMoodData->bind_param("i", $userId);
$stmtMoodData->execute();
$resultMoodData = $stmtMoodData->get_result();
$moodData = $resultMoodData->fetch_all(MYSQLI_ASSOC);

// Get all stress records for this student from the stress table
$stmtStressData = $conn->prepare("
    SELECT stressLevel, datetimeRecord
    FROM stress
    WHERE studentId = ?
");
$stmtStressData->bind_param("i", $userId);
$stmtStressData->execute();
$resultStressData = $stmtStressData->get_result();
$stressData = $resultStressData->fetch_all(MYSQLI_ASSOC);

// Initialize calendar data
$calendarMood = [];
$calendarStress = []; // Store stress per day from stress table

// Process mood data
foreach ($moodData as $row) {
    // Format date for calendar cell
    $date = (new DateTime($row['datetimeRecord']))->format('Y-m-d');

    // Initialize array if not exists
    if (!isset($calendarMood[$date])) {
        $calendarMood[$date] = [];
    }

    $moodTypeId = $row['moodTypeId'];

    // Get mood details
    $stmtGetParticularMood = $conn->prepare("
        SELECT moodStatus, moodStoreLocation
        FROM mood
        WHERE moodTypeId = ?
    ");
    $stmtGetParticularMood->bind_param("i", $moodTypeId);
    $stmtGetParticularMood->execute();
    $resultGetParticularMood = $stmtGetParticularMood->get_result();
    $particularMoodData = $resultGetParticularMood->fetch_assoc();

    // Store mood under the correct date
    $calendarMood[$date][] = [
        "moodStatus" => $particularMoodData['moodStatus'],
        "moodStoreLocation" => $particularMoodData['moodStoreLocation']
    ];
}

// Process stress data (one record per day)
foreach ($stressData as $row) {
    // Format date for calendar cell
    $date = (new DateTime($row['datetimeRecord']))->format('Y-m-d');
    
    // Store stress level for this date (only one per day)
    $calendarStress[$date] = (float)$row['stressLevel'];
}

// Get today's average stress level (from stress table)
$stmtTodayStress = $conn->prepare("
    SELECT stressLevel
    FROM stress
    WHERE studentId = ?
    AND DATE(datetimeRecord) = CURDATE()
");
$stmtTodayStress->bind_param("i", $userId);
$stmtTodayStress->execute();
$resultTodayStress = $stmtTodayStress->get_result();
$todayStressRow = $resultTodayStress->fetch_assoc();
$avgStress = $todayStressRow ? (float)$todayStressRow['stressLevel'] : null;

// Get Monthly mood data
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

// Get total mood records for today
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
    "dailyMood" => $calendarMood,
    "avgStressLevel" => $calendarStress, // Now contains one stress value per day
    "todayAvgStress" => $avgStress, // Today's stress level
    "totalRecord" => $totalRecords,
    "monthlyMoodCount" => $moodCount
]);
?>