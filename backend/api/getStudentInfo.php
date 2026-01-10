<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authPa.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$userId = $user['staffId'];
$studentIdGet = $_GET['studentId'];

$paId = $_GET['paId'] ?? null;

// Get student personal information
if (empty($paId)) {
    $stmtGetAllStudent = $conn->prepare("
        SELECT * FROM Student
        WHERE studentId = ?
        AND staffId = ?
    ");
    $stmtGetAllStudent->bind_param("ii", $studentIdGet, $userId);
} else {
    $stmtGetAllStudent = $conn->prepare("
        SELECT * FROM Student
        WHERE studentId = ?
        AND staffId = ?
    ");
    $stmtGetAllStudent->bind_param("ii", $studentIdGet, $paId);
}
$stmtGetAllStudent->execute();
$resultGetAllStudent = $stmtGetAllStudent->get_result();
$getAllStudentData = $resultGetAllStudent->fetch_assoc();

$studentId = $getAllStudentData['studentId'];
// Get student mood record information
// Get latest mood for this student
// Fetch ALL mood records for today
$stmtMoodData = $conn->prepare("
    SELECT * FROM moodTracking 
    WHERE studentId = ? AND DATE(datetimeRecord) = CURDATE()
    ORDER BY datetimeRecord ASC
");
$stmtMoodData->bind_param("i", $studentId);
$stmtMoodData->execute();
$resultMoodData = $stmtMoodData->get_result();
$allMoodRecords = $resultMoodData->fetch_all(MYSQLI_ASSOC);

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

$finalRecords = [];
if ($resultMoodData->num_rows > 0) {

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
            "moodStatus" => $moodType['moodStatus'],
            "moodStoreLocation" => $moodType['moodStoreLocation'],
            "moodRecordTime" => $record['datetimeRecord'],
            "stressLevel" => $stressData['stressLevel'],
            "note" => nl2br(htmlspecialchars($record['note'])),
            "entriesData" => $completeEntriesData,
            "notePrivacy" => (int)$record['notePrivacy']
        ];
    }

}

// Get data of averageStress
// $stmtStressAvg = $conn->prepare("
//     SELECT AVG(stressLevel) AS avgStress
//     FROM moodTracking
//     WHERE studentId = ?
//     AND DATE(datetimeRecord) = CURDATE()
// ");
// $stmtStressAvg->bind_param("i", $studentId);
// $stmtStressAvg->execute();
// $resultStressAvg = $stmtStressAvg->get_result();
// $stressData = $resultStressAvg->fetch_assoc();

// $avgStress = $stressData['avgStress']; // this is the average


// // Get data of averageScale
// $stmtMoodAvg = $conn->prepare("
//     SELECT 
//         AVG(m.scale) AS avgMoodScale
//     FROM moodTracking mt
//     JOIN mood m ON mt.moodTypeId = m.moodTypeId
//     WHERE mt.studentId = ?
//     AND DATE(mt.datetimeRecord) = CURDATE()
// ");
// $stmtMoodAvg->bind_param("i", $studentId);
// $stmtMoodAvg->execute();

// $resultMoodAvg = $stmtMoodAvg->get_result();
// $dataMood = $resultMoodAvg->fetch_assoc();

// $avgMoodScale = $dataMood['avgMoodScale'];  // decimal (e.g., 5.7)

// $finalMoodScale = round($avgMoodScale);

// $stmtMoodInfo = $conn->prepare("
//     SELECT *
//     FROM mood
//     WHERE scale = ?
// ");
// $stmtMoodInfo->bind_param("i", $finalMoodScale);
// $stmtMoodInfo->execute();

// $resultMoodInfo = $stmtMoodInfo->get_result();
// $moodInfo = $resultMoodInfo->fetch_assoc();

$moodStatus = [];
$moodStoreLocation = [];
$stmtGetAllMoodStatus = $conn->prepare("
    SELECT * FROM moodTracking 
    WHERE studentId = ?
    AND DATE(datetimeRecord) = CURDATE()
");
$stmtGetAllMoodStatus->bind_param("i", $studentId);
$stmtGetAllMoodStatus->execute();
$resultGetAllMoodStatus = $stmtGetAllMoodStatus->get_result();
$getAllMoodStatusData = $resultGetAllMoodStatus->fetch_all(MYSQLI_ASSOC);

foreach ($getAllMoodStatusData as $row) {
    $moodTypeId = $row['moodTypeId'];

    $stmtGetMoodDetails = $conn->prepare("
        SELECT * FROM mood
        WHERE moodTypeId = ?
    ");
    $stmtGetMoodDetails->bind_param("i", $moodTypeId);
    $stmtGetMoodDetails->execute();
    $resultGetMoodDetails = $stmtGetMoodDetails->get_result();
    $moodDetails = $resultGetMoodDetails->fetch_assoc();

    $moodStatus[] = $moodDetails['moodStatus'];
    $moodStoreLocation[] = $moodDetails['moodStoreLocation'];
}

echo json_encode([
        "success" => true, // <-- still true, but entriesData empty
        "studentData" => $getAllStudentData,
        "studentMoodData" => $finalRecords,

        // Daily mood info (Avg)
        // "avgTodayStudentMoodStatus" => $moodInfo['moodStatus'] ?? null,
        // "avgTodayStudentMoodStoreLocation" => $moodInfo['moodStoreLocation'] ?? null,
        "moodStatus" => $moodStatus ?? null,
        "moodStoreLocation" => $moodStoreLocation ?? null,
        "todayStressLevel" => $stressData['stressLevel'] ?? null,
    ]);

?>
