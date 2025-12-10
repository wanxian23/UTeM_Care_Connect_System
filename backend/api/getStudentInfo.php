<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authPa.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$userId = $user['staffId'];
$studentId = $_GET['studentId'];

// Get student personal information
$stmtGetAllStudent = $conn->prepare("
    SELECT * FROM Student
    WHERE studentId = ?
");
$stmtGetAllStudent->bind_param("i", $studentId);
$stmtGetAllStudent->execute();
$resultGetAllStudent = $stmtGetAllStudent->get_result();
$getAllStudentData = $resultGetAllStudent->fetch_assoc();

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
            "stressLevel" => $record['stressLevel'],
            "note" => nl2br(htmlspecialchars($record['note'])),
            "entriesData" => $completeEntriesData,
            "notePrivacy" => (int)$record['notePrivacy']
        ];
    }

}

// Get data of averageStress
$stmtStressAvg = $conn->prepare("
    SELECT AVG(stressLevel) AS avgStress
    FROM moodTracking
    WHERE studentId = ?
    AND DATE(datetimeRecord) = CURDATE()
");
$stmtStressAvg->bind_param("i", $studentId);
$stmtStressAvg->execute();
$resultStressAvg = $stmtStressAvg->get_result();
$stressData = $resultStressAvg->fetch_assoc();

$avgStress = $stressData['avgStress']; // this is the average

// Get data of averageScale
$stmtMoodAvg = $conn->prepare("
    SELECT 
        AVG(m.scale) AS avgMoodScale
    FROM moodTracking mt
    JOIN mood m ON mt.moodTypeId = m.moodTypeId
    WHERE mt.studentId = ?
    AND DATE(mt.datetimeRecord) = CURDATE()
");
$stmtMoodAvg->bind_param("i", $studentId);
$stmtMoodAvg->execute();

$resultMoodAvg = $stmtMoodAvg->get_result();
$dataMood = $resultMoodAvg->fetch_assoc();

$avgMoodScale = $dataMood['avgMoodScale'];  // decimal (e.g., 5.7)

$finalMoodScale = round($avgMoodScale);

$stmtMoodInfo = $conn->prepare("
    SELECT *
    FROM mood
    WHERE scale = ?
");
$stmtMoodInfo->bind_param("i", $finalMoodScale);
$stmtMoodInfo->execute();

$resultMoodInfo = $stmtMoodInfo->get_result();
$moodInfo = $resultMoodInfo->fetch_assoc();

echo json_encode([
        "success" => true, // <-- still true, but entriesData empty
        "studentData" => $getAllStudentData,
        "studentMoodData" => $finalRecords,

        // Daily mood info (Avg)
        "avgTodayStudentMoodStatus" => $moodInfo['moodStatus'] ?? null,
        "avgTodayStudentMoodStoreLocation" => $moodInfo['moodStoreLocation'] ?? null,
        "avgTodayStudentStressLevel" => $avgStress ?? null,
    ]);

?>
