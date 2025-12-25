<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Content-Type: application/json");

require "../database.php";
require "authStudent.php";

// Validate token
$user = validateToken($conn);
$userId = $user['studentId'];

$selectedDate = $_GET['selectedDate'];

// Fetch ALL mood records for the selected date
$stmtMoodData = $conn->prepare("
    SELECT * FROM moodTracking 
    WHERE studentId = ? AND DATE(datetimeRecord) = ?
    ORDER BY datetimeRecord ASC
");
$stmtMoodData->bind_param("is", $userId, $selectedDate);
$stmtMoodData->execute();
$resultMoodData = $stmtMoodData->get_result();
$allMoodRecords = $resultMoodData->fetch_all(MYSQLI_ASSOC);

// Get stress level from the separate stress table for the selected date (1 record per day)
$stmtCheckStress = $conn->prepare("
    SELECT stressLevel, datetimeRecord 
    FROM stress 
    WHERE studentId = ? AND DATE(datetimeRecord) = ?
");
$stmtCheckStress->bind_param("is", $userId, $selectedDate);
$stmtCheckStress->execute();
$resultCheckStress = $stmtCheckStress->get_result();
$stressData = $resultCheckStress->fetch_assoc();

// Get stress level (single record per day)
$stressLevel = $stressData ? (float)$stressData['stressLevel'] : null;

if ($resultMoodData->num_rows > 0) {

    $finalRecords = [];

    foreach ($allMoodRecords as $record) {

        $moodId = $record['moodId'];

        // Entries
        $stmtEntriesData = $conn->prepare("SELECT * FROM entriesRecord WHERE moodId = ?");
        $stmtEntriesData->bind_param("i", $moodId);
        $stmtEntriesData->execute();
        $entriesRes = $stmtEntriesData->get_result();
        $entriesData = $entriesRes->fetch_all(MYSQLI_ASSOC);

        // Mood type
        $stmtMoodType = $conn->prepare("SELECT * FROM mood WHERE moodTypeId = ?");
        $stmtMoodType->bind_param("i", $record['moodTypeId']);
        $stmtMoodType->execute();
        $moodType = $stmtMoodType->get_result()->fetch_assoc();

        // Entries type (reuse prepared statement)
        $stmtEntriesType = $conn->prepare("SELECT entriesType FROM entriesType WHERE entriesTypeId = ?");

        $completeEntriesData = [];
        foreach ($entriesData as $entry) {
            $stmtEntriesType->bind_param("i", $entry['entriesTypeId']);
            $stmtEntriesType->execute();
            $entriesType = $stmtEntriesType->get_result()->fetch_assoc();

            $completeEntriesData[] = array_merge($entry, $entriesType);
        }

        // Build one mood record (removed stressLevel from here)
        $finalRecords[] = [
            "moodId" => $record['moodId'],
            "moodStatus" => $moodType['moodStatus'],
            "moodStoreLocation" => $moodType['moodStoreLocation'],
            "moodRecordTime" => $record['datetimeRecord'],
            "note" => nl2br(htmlspecialchars($record['note'])),
            "entriesData" => $completeEntriesData
        ];
    }

    echo json_encode([
        "success" => true,
        "records" => $finalRecords,
        "total" => count($finalRecords),
        "stressLevel" => $stressLevel, // Single stress level for the day
        "stressRecordTime" => $stressData ? $stressData['datetimeRecord'] : null
    ]);

} else {
    echo json_encode([
        "success" => true,
        "hasRecord" => false,
        "records" => [],
        "message" => "No mood record for this date",
        "stressLevel" => $stressLevel, // Still return stress even if no mood
        "stressRecordTime" => $stressData ? $stressData['datetimeRecord'] : null
    ]);
}
?>