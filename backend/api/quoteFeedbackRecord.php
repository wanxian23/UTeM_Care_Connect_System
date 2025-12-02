<?php
// ✅ CORS headers — put at the top
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "../database.php";
require "authStudent.php";

function runInBackground($url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT_MS, 500); // do not wait
    curl_setopt($ch, CURLOPT_NOSIGNAL, 1);
    curl_exec($ch);
}

$feedbackUser = (!empty($_POST["thumbUp"])) ? 1 : 0;

$user = validateToken($conn);
$token = $user['loginToken'];

$studentId = $user['studentId'];

// Get data of recorded
$stmtGetRecommendationCurrent = $conn->prepare("
    SELECT * 
    FROM recommendationDisplay 
    WHERE studentId = ? 
    ORDER BY recommendationDisplayId DESC LIMIT 1
");
$stmtGetRecommendationCurrent->bind_param("i", $studentId);
$stmtGetRecommendationCurrent->execute();
$resultGetRecommendationCurrent = $stmtGetRecommendationCurrent->get_result();
$getRecommendationCurrent = $resultGetRecommendationCurrent->fetch_assoc();

$recommendId = $getRecommendationCurrent['recommendationDisplayId'];

$stmtUpdateFbUsefulness = $conn->prepare("
    UPDATE recommendationDisplay
    SET fbUsefulness = ?
    WHERE recommendationDisplayId = ?
");
$stmtUpdateFbUsefulness->bind_param("ii", $feedbackUser, $recommendId);

if ($stmtUpdateFbUsefulness->execute() && $feedbackUser == 1) {
    echo json_encode([
        "success" => true, 
        "message" => "I Glab That This Quote Help You Alot :)"
    ]);
} else {
    // Feedback Not Usefu;
    // Run api in background
    // Change quote since not useful
    runInBackground("http://localhost:8080/care_connect_system/backend/api/updateQuoteAfterFb.php?studentId=$studentId");

    echo json_encode([
        "success" => true, // <-- still true, but entriesData empty
        "message" => "Be Happy OK! You'll Be Fine :)"
    ]);
}
?>
