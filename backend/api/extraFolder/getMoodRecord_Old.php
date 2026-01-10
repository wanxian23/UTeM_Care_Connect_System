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

$stmtCheckStress = $conn->prepare("
    SELECT * FROM stress WHERE studentId = ? AND DATE(datetimeRecord) = CURDATE()
");
$stmtCheckStress->bind_param("i", $studentId);
$stmtCheckStress->execute();
$resultCheckStress = $stmtCheckStress->get_result();
$stressData = null;
$stressRecord = false;
if ($resultCheckStress->num_rows > 0) {
    $stressRecord = true;
    $stressData = $resultCheckStress->fetch_assoc();
}

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


// // Get latest data of record
// $stmtGetLatestMood = $conn->prepare("
//     SELECT * 
//     FROM moodTracking 
//     WHERE studentId = ? 
//     ORDER BY moodId DESC
//     LIMIT 1
// ");
// $stmtGetLatestMood->bind_param("i", $studentId);
// $stmtGetLatestMood->execute();
// $resultGetLatestMood = $stmtGetLatestMood->get_result();
// $latestMoodData = $resultGetLatestMood->fetch_assoc();

// $moodTypeId = $latestMoodData['moodTypeId'];
//     $stmtGetLatestMoodDetails = $conn->prepare("
//         SELECT * 
//         FROM mood 
//         WHERE moodTypeId = ? 
//     ");
//     $stmtGetLatestMoodDetails->bind_param("i", $moodTypeId);
//     $stmtGetLatestMoodDetails->execute();
//     $resultGetLatestMoodDetails = $stmtGetLatestMoodDetails->get_result();
//     $latestMoodDetailsData = $resultGetLatestMoodDetails->fetch_assoc();


//     // Get data of recommendation
//     $stmtRecommendationChecking = $conn->prepare("
//         SELECT * 
//         FROM recommendationDisplay 
//         WHERE studentId = ? 
//         ORDER BY recommendationDisplayId DESC 
//         LIMIT 1
//     ");
//     $stmtRecommendationChecking->bind_param("i", $studentId);
//     $stmtRecommendationChecking->execute();
//     $resultRecommendationChecking = $stmtRecommendationChecking->get_result();
//     $recommendationChecking = $resultRecommendationChecking->fetch_assoc();

//     $recommendId = $recommendationChecking['recommendId'];

//     $stmtRecommendation = $conn->prepare("SELECT * FROM recommendation WHERE recommendId = ?");
//     $stmtRecommendation->bind_param("i", $recommendId);
//     $stmtRecommendation->execute();
//     $resultRecommendation = $stmtRecommendation->get_result();
//     $recommendation = $resultRecommendation->fetch_assoc();

if ($resultCheckMoodDataMorning->num_rows < 2) {
    echo json_encode([
        "success" => true, 
        "finishRecord" => false,
        "message" => "Daily Mood Recorded Successfully!",
        "stressRecord" => $stressRecord
        // "stressLevel" => $stressData['stressLevel'],
        // "moodData" => $latestMoodData,
        // "moodDetailsData" => $latestMoodDetailsData,
        // "quote" => $recommendation ? $recommendation['quote'] : "Be Happy Everyday!",
        // "quoteType" => $recommendation ? $recommendation['type'] : "Positive"
    ]);
} else {
    // No record for today
    echo json_encode([
        "success" => true, // <-- still true, but entriesData empty
        "finishRecord" => true,  // Add this flag
        "message" => "Great! You Have Completed Mood Recorded For Both Morning and Afternoon :)",
        "stressRecord" => $stressRecord
    ]);
}

?>
