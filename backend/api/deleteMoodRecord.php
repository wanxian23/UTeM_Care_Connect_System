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

if(!$moodId){
    echo json_encode([
        "success" => false, 
        "message" => "No moodId provided"
    ]);
    exit;
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