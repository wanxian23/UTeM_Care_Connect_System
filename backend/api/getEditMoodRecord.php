<?php
// ✅ CORS headers — put at the top
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "../database.php";
require "authStudent.php";

$user = validateToken($conn);
$studentId = $user['studentId'];
$moodId = $_GET['moodId'];

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

if ($moodData) {
    // Get entries for this mood
    $stmtEntriesData = $conn->prepare("SELECT entriesTypeId FROM entriesRecord WHERE moodId = ?");
    $stmtEntriesData->bind_param("i", $moodId);
    $stmtEntriesData->execute();
    $resultEntriesData = $stmtEntriesData->get_result();
    $entriesData = $resultEntriesData->fetch_all(MYSQLI_ASSOC);

    // Extract just the IDs into an array
    $entryIds = array_map(function($entry) {
        return $entry['entriesTypeId'];
    }, $entriesData);

    echo json_encode([
        "success" => true,
        "moodRecord" => $moodData,
        "entries" => $entryIds  // Array of entry IDs like [1, 3, 5]
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Mood record not found or doesn't belong to you"
    ]);
}
?>