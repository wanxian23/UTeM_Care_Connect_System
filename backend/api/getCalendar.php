<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authStudent.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$userId = $user['studentId'];

// Get data of recorded
$stmtMoodData = $conn->prepare("SELECT * FROM moodTracking WHERE studentId = ?");
$stmtMoodData->bind_param("i", $userId);
$stmtMoodData->execute();
$resultMoodData = $stmtMoodData->get_result();
$moodData = $resultMoodData->fetch_all(MYSQLI_ASSOC);

$dayRecord = [];
$moodEmoji = [];
$moodStatus = [];

foreach ($moodData as $row) {
    $wholeDatetime = new DateTime($row['datetimeRecord']);
    $fullDate = $wholeDatetime->format('Y-m-d'); // Full date for key
    $day = (int)$wholeDatetime->format('j');

    // Get mood emoji - USE moodTypeId, NOT moodId
    $stmtGetMoodEmoji = $conn->prepare("SELECT * FROM mood WHERE moodTypeId = ?");
    $stmtGetMoodEmoji->bind_param("i", $row['moodTypeId']);
    $stmtGetMoodEmoji->execute();
    $resultGetMoodEmoji = $stmtGetMoodEmoji->get_result();
    $moodEmojiData = $resultGetMoodEmoji->fetch_assoc();

    // Store by full date instead of just day
    $dayRecord[$fullDate] = $fullDate;
    $moodEmoji[$fullDate] = $moodEmojiData['moodStoreLocation'];
    $moodStatus[$fullDate] = $moodEmojiData['moodStatus'];
}

echo json_encode([
    "success" => true,
    "hasRecord" => true,
    "moodStatus" => $moodStatus,
    "moodStoreLocation" => $moodEmoji,
    "dayRecord" => $dayRecord
]);
?>