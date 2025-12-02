<?php
// ✅ CORS headers — put at the top
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "../database.php";
require "authStudent.php";

$user = validateToken($conn);
$token = $user['loginToken'];

$studentId = $user['studentId'];

// Get data of recorded
$stmtCheckMoodDataMorning = $conn->prepare("
    SELECT * 
    FROM moodTracking 
    WHERE studentId = ? 
    AND DATE(datetimeRecord) = CURDATE()
");

$stmtCheckMoodDataMorning->bind_param("i", $studentId);
$stmtCheckMoodDataMorning->execute();
$resultCheckMoodDataMorning = $stmtCheckMoodDataMorning->get_result();
// $moodDataMorning = $resultCheckMoodDataMorning->fetch_assoc();

if ($resultCheckMoodDataMorning->num_rows < 2) {
    echo json_encode([
        "success" => true, 
        "finishRecord" => false,
        "message" => "Daily Mood Recorded Successfully!"
    ]);
} else {
    // No record for today
    echo json_encode([
        "success" => true, // <-- still true, but entriesData empty
        "finishRecord" => true,  // Add this flag
        "message" => "Great! You Have Completed Mood Recorded For Both Morning and Afternoon :)"
    ]);
}

?>
