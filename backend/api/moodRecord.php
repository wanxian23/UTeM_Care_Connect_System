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

$mood = $_POST["mood"];
$stress = $_POST['stress'] ?? null;
$note = $_POST['note'];
$notePrivacy = isset($_POST['notePrivacy']) ? 1 : 0;
$entries = isset($_POST['entries']) ? $_POST['entries'] : [];

$user = validateToken($conn);
$token = $user['loginToken'];

$studentId = $user['studentId'];


// Get stress level
$stmtStress = $conn->prepare("
    SELECT * FROM stress
    WHERE studentId = ?
    AND DATE(datetimeRecord) = CURDATE()
");
$stmtStress->bind_param("i", $studentId);
$stmtStress->execute();
$resultStress = $stmtStress->get_result();
$stressData = $resultStress->fetch_assoc();


// Check if stress is recorded
$stmtCheckStress = $conn->prepare("
    SELECT * FROM stress WHERE studentId = ?
");
// $stmtCheckStress->bind_param("i", $studentId);
// $stmtCheckStress->execute();
// $resultCheckStress = $stmtCheckStress->get_result();
// $stressRecord = false;
if (!empty($stress)) {
    $stmtRecordMood = $conn->prepare("INSERT INTO stress(stressLevel, studentId)
                        VALUES(?, ?)");
    $stmtRecordMood->bind_param("ii", $stress, $studentId);
    $stmtRecordMood->execute();
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

$moodId = "";
if ($resultCheckMoodDataMorning->num_rows < 2) {
    $stmtRecordMood = $conn->prepare("INSERT INTO moodTracking(moodTypeId, note, stressLevel, studentId, notePrivacy)
                        VALUES(?, ?, ?, ?, ?)");
    $stmtRecordMood->bind_param("isiii", $mood, $note, $stress, $studentId, $notePrivacy);
    $stmtRecordMood->execute();

    // Get the newly inserted primary key (moodId)
    $moodId = $conn->insert_id;

    foreach ($entries as $entry) {
        $stmtRecordEntries = $conn->prepare("INSERT INTO entriesRecord(entriesTypeId, moodId)
                            VALUES(?, ?)");
        $stmtRecordEntries->bind_param("ii", $entry, $moodId);
        $stmtRecordEntries->execute();
    }

    // Get latest data of record
    $stmtGetLatestMood = $conn->prepare("
        SELECT * 
        FROM moodTracking 
        WHERE moodId = ? 
    ");
    $stmtGetLatestMood->bind_param("i", $moodId);
    $stmtGetLatestMood->execute();
    $resultGetLatestMood = $stmtGetLatestMood->get_result();
    $latestMoodData = $resultGetLatestMood->fetch_assoc();

    $moodTypeId = $latestMoodData['moodTypeId'];
    $stmtGetLatestMoodDetails = $conn->prepare("
        SELECT * 
        FROM mood 
        WHERE moodTypeId = ? 
    ");
    $stmtGetLatestMoodDetails->bind_param("i", $moodTypeId);
    $stmtGetLatestMoodDetails->execute();
    $resultGetLatestMoodDetails = $stmtGetLatestMoodDetails->get_result();
    $latestMoodDetailsData = $resultGetLatestMoodDetails->fetch_assoc();

    runInBackground("http://localhost:8080/care_connect_system/backend/api/updateQuoteAfterFb.php?studentId=$studentId");

    // Get data of recommendation
    $stmtRecommendationChecking = $conn->prepare("
        SELECT * 
        FROM recommendationDisplay 
        WHERE studentId = ? 
        ORDER BY recommendationDisplayId DESC 
        LIMIT 1
    ");
    $stmtRecommendationChecking->bind_param("i", $studentId);
    $stmtRecommendationChecking->execute();
    $resultRecommendationChecking = $stmtRecommendationChecking->get_result();
    $recommendationChecking = $resultRecommendationChecking->fetch_assoc();

    $recommendId = $recommendationChecking['recommendId'];

    $stmtRecommendation = $conn->prepare("SELECT * FROM recommendation WHERE recommendId = ?");
    $stmtRecommendation->bind_param("i", $recommendId);
    $stmtRecommendation->execute();
    $resultRecommendation = $stmtRecommendation->get_result();
    $recommendation = $resultRecommendation->fetch_assoc();

    echo json_encode([
        "success" => true, 
        "finishRecord" => false,
        "moodId" => $moodId,
        "message" => "Daily Mood Recorded Successfully!",
        "moodData" => $latestMoodData,
        "moodDetailsData" => $latestMoodDetailsData,
        "stressLevel" => $stressData['stressLevel'],
        "quote" => $recommendation ? $recommendation['quote'] : "Be Happy Everyday!",
        "quoteType" => $recommendation ? $recommendation['type'] : "Positive",
        "quoteLink" => $recommendation['hyperlink'] ??  null
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
