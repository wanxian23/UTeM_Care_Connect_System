<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authStudent.php";

// Validate token
$user = validateToken($conn);
$userId = $user['studentId'];

$moodId = "";
// Fetch ALL mood records for today
if (empty($_GET['moodId'])) {
    $stmtMoodData = $conn->prepare("
        SELECT * FROM moodTracking 
        WHERE studentId = ? AND DATE(datetimeRecord) = CURDATE()
        ORDER BY datetimeRecord ASC
    ");
    $stmtMoodData->bind_param("i", $userId);
} else {
    $moodId = $_GET['moodId'];
    $stmtMoodData = $conn->prepare("
        SELECT * FROM moodTracking 
        WHERE studentId = ? AND DATE(datetimeRecord) = CURDATE() 
        AND moodId = ?
        ORDER BY datetimeRecord ASC
    ");
    $stmtMoodData->bind_param("ii", $userId, $moodId);
}
$stmtMoodData->execute();
$resultMoodData = $stmtMoodData->get_result();
$allMoodRecords = $resultMoodData->fetch_all(MYSQLI_ASSOC);

// Get stress level
$stmtCheckStress = $conn->prepare("
    SELECT * FROM stress WHERE studentId = ? AND DATE(datetimeRecord) = CURDATE()
");
$stmtCheckStress->bind_param("i", $userId);
$stmtCheckStress->execute();
$resultCheckStress = $stmtCheckStress->get_result();
$stressData = $resultCheckStress->fetch_assoc();

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

        // Build one mood record
        $finalRecords[] = [
            "moodId" => $record['moodId'],
            "moodStatus" => $moodType['moodStatus'],
            "moodStoreLocation" => $moodType['moodStoreLocation'],
            "moodRecordTime" => $record['datetimeRecord'],
            "stressLevel" => $stressData['stressLevel'] ?? "N/A",
            "note" => nl2br(htmlspecialchars($record['note'])),
            "entriesData" => $completeEntriesData
        ];
    }

    echo json_encode([
        "success" => true,
        "records" => $finalRecords,
        "total" => count($finalRecords)
    ]);

} else {
    echo json_encode([
        "success" => true,
        "hasRecord" => false,
        "entriesData" => [],
        "message" => "No mood record for today"
    ]);
}

?>
