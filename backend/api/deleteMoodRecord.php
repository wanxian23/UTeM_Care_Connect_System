<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "../database.php";
require "authStudent.php";

$user = validateToken($conn);
$studentId = $user['studentId'];

// Use GET or POST — match React
$moodId = $_GET['moodId'] ?? null;
$date = $_GET['date'];

if(!$moodId){
    echo json_encode([
        "success" => false, 
        "message" => "No moodId provided"
    ]);
    exit;
}

if ($date == "today" || $date == "specific") {
    $stmtCheckMoodRecord = $conn->prepare("
        SELECT *
        FROM moodTracking
        WHERE studentId = ?
        AND date(datetimeRecord) = CURDATE()
    ");
    $stmtCheckMoodRecord->bind_param("i", $studentId);
    $stmtCheckMoodRecord->execute();
    $resultCheckMoodRecord = $stmtCheckMoodRecord->get_result();

    if ($resultCheckMoodRecord->num_rows < 2) {
        $stmt = $conn->prepare("DELETE FROM stress WHERE studentId = ? AND date(datetimeRecord) = CURDATE()");
        $stmt->bind_param("i", $studentId);
        $stmt->execute();
    }
} else {
    $stmtCheckMoodRecord = $conn->prepare("
        SELECT *
        FROM moodTracking
        WHERE studentId = ?
        AND date(datetimeRecord) = ?
    ");
    $stmtCheckMoodRecord->bind_param("is", $studentId, $date);
    $stmtCheckMoodRecord->execute();
    $resultCheckMoodRecord = $stmtCheckMoodRecord->get_result();
    if ($resultCheckMoodRecord->num_rows < 2) {
        $stmt = $conn->prepare("DELETE FROM stress WHERE studentId = ? AND date(datetimeRecord) = ?");
        $stmt->bind_param("is", $studentId, $date);
        $stmt->execute();
    }
}

 
$stmt = $conn->prepare("DELETE FROM moodTracking WHERE studentId = ? AND moodId = ?");
$stmt->bind_param("ii", $studentId, $moodId);

if($stmt->execute()){
    echo json_encode([
        "success" => true, 
        "message" => "Mood deleted successfully!"
    ]);
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Mood delete failed!"
    ]);
}


?>