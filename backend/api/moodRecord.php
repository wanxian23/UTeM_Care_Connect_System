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
$entries = isset($_POST['entries']) ? $_POST['entries'] : [];

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
    $stmtRecordMood = $conn->prepare("INSERT INTO moodTracking(moodTypeId, stressLevel, note, studentId)
                        VALUES(?, ?, ?, ?)");
    $stmtRecordMood->bind_param("issi", $mood, $stress, $note, $studentId);
    $stmtRecordMood->execute();

    // Get the newly inserted primary key (moodId)
    $moodId = $conn->insert_id;

    foreach ($entries as $entry) {
        $stmtRecordEntries = $conn->prepare("INSERT INTO entriesRecord(entriesTypeId, moodId)
                            VALUES(?, ?)");
        $stmtRecordEntries->bind_param("ii", $entry, $moodId);
        $stmtRecordEntries->execute();
    }

    echo json_encode([
        "success" => true, 
        "finishRecord" => false,
        "message" => "Daily Mood Recorded Successfully!"
    ]);

    runInBackground("http://localhost:8080/care_connect_system/backend/api/updateQuoteAfterFb.php?studentId=$studentId");
} else {
    // No record for today
    echo json_encode([
        "success" => true, // <-- still true, but entriesData empty
        "finishRecord" => true,  // Add this flag
        "message" => "Great! You Have Completed Mood Recorded For Both Morning and Afternoon :)"
    ]);
}

?>
