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
$stress = $_POST['stress'];
$note = $_POST['note'];
$notePrivacy = isset($_POST['notePrivacy']) ? 1 : 0;
$entries = isset($_POST['entries']) ? $_POST['entries'] : [];

$user = validateToken($conn);
$token = $user['loginToken'];

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

// if ($resultCheckMoodDataMorning->num_rows < 2) {
    $stmtRecordMood = $conn->prepare("
        UPDATE moodTracking
        SET moodTypeId = ?,
        stressLevel = ?, 
        note = ?, 
        notePrivacy = ?
        WHERE studentId = ? AND
        moodId = ?
    ");
    $stmtRecordMood->bind_param("issiii", $mood, $stress, $note, $notePrivacy, $studentId, $moodId);
    $stmtRecordMood->execute();

    $stmtDeleteEntries = $conn->prepare("DELETE FROM entriesRecord WHERE moodId = ?");
    $stmtDeleteEntries->bind_param("i", $moodId);
    $stmtDeleteEntries->execute();

    foreach ($entries as $entry) {
        $stmtRecordEntries = $conn->prepare("INSERT INTO entriesRecord(entriesTypeId, moodId)
                            VALUES(?, ?)");
        $stmtRecordEntries->bind_param("ii", $entry, $moodId);
        $stmtRecordEntries->execute();
    }

    // Check if the date is today
    $datetime = $moodData['datetimeRecord']; // FIXED
    $recordDate = date("Y-m-d", strtotime($datetime));
    $today = date("Y-m-d");

    if ($recordDate === $today) {
        runInBackground("http://localhost:8080/care_connect_system/backend/api/updateQuoteAfterFb.php?studentId=$studentId");
    }

    echo json_encode([
        "success" => true, 
        // "finishRecord" => false,
        "message" => "Daily Mood Updated Successfully!"
    ]);

// } else {
    // No record for today
    // echo json_encode([
    //     "success" => true, // <-- still true, but entriesData empty
    //     "finishRecord" => true,  // Add this flag
    //     "message" => "Great! You Have Completed Mood Recorded For Both Morning and Afternoon :)"
    // ]);
// }

?>
