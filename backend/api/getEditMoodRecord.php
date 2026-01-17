<?php
// ✅ CORS headers — put at the top
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require "../database.php";
require "authStudent.php";

// ============= CONFIGURATION =============
date_default_timezone_set("Asia/Kuala_Lumpur");

// Define time window for stress recording (after second mood)
define('STRESS_START', '12:00:00');    // 6:00 PM
define('STRESS_END', '23:59:59');      // 11:59 PM

$todayDate = date('Y-m-d');
$currentTime = date('H:i:s');
$currentDateTime = new DateTime();

$user = validateToken($conn);
$studentId = $user['studentId'];
$moodId = $_GET['moodId'];
$date = $_GET['date'];

// Get stress level
if ($date == "Today" || $date == "Specific") {
    $stmtStress = $conn->prepare("
        SELECT stressLevel, datetimeRecord FROM stress
        WHERE studentId = ?
        AND DATE(datetimeRecord) = CURDATE()
    ");
    $stmtStress->bind_param("i", $studentId);
    $stmtStress->execute();
    $resultStress = $stmtStress->get_result();
    $stressData = $resultStress->fetch_assoc();
} else {
    $stmtStress = $conn->prepare("
        SELECT stressLevel, datetimeRecord FROM stress
        WHERE studentId = ?
        AND DATE(datetimeRecord) = ?
    ");
    $stmtStress->bind_param("is", $studentId, $date);
    $stmtStress->execute();
    $resultStress = $stmtStress->get_result();
    $stressData = $resultStress->fetch_assoc();
}

$stressLevel = $stressData ? (float)$stressData['stressLevel'] : null;

// Get data of recorded mood
$stmtCheckMoodData = $conn->prepare("
    SELECT * 
    FROM moodTracking 
    WHERE studentId = ? AND moodId = ?
");
$stmtCheckMoodData->bind_param("ii", $studentId, $moodId);
$stmtCheckMoodData->execute();
$resultCheckMoodData = $stmtCheckMoodData->get_result();
$moodData = $resultCheckMoodData->fetch_assoc();

$recordTime = $moodData['datetimeRecord']; // e.g. 2026-01-17 09:30:00

$recordDate = date('Y-m-d', strtotime($recordTime));
$todayDate  = date('Y-m-d');

$inStressWindow = ($currentTime >= STRESS_START && $currentTime <= STRESS_END);
// Check timing
$stressRecord = false;
if ($inStressWindow || ($date != "Today" && $date != "Specific" && $recordDate != $todayDate)) {
    $stressRecord = true;
}

if ($moodData) {
    // Get entries for this mood
    $stmtEntriesData = $conn->prepare("SELECT entriesTypeId FROM entriesRecord WHERE moodId = ?");
    $stmtEntriesData->bind_param("i", $moodId);
    $stmtEntriesData->execute();
    $resultEntriesData = $stmtEntriesData->get_result();
    $entriesData = $resultEntriesData->fetch_all(MYSQLI_ASSOC);

    // Extract just the IDs into an array
    $entryIds = array_map(function($entry) {
        return (int)$entry['entriesTypeId']; // Convert to int
    }, $entriesData);

    echo json_encode([
        "success" => true,
        "moodRecord" => $moodData,
        "stressLevel" => $stressLevel, // Now safely handles null
        "entries" => $entryIds,  // Array of entry IDs like [1, 3, 5]
        "stressRecord" => $stressRecord
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Mood record not found or doesn't belong to you"
    ]);
}
?>