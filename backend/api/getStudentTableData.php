<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authPa.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$userId = $user['staffId'];

$stmtGetAllStudent = $conn->prepare("
    SELECT * FROM Student
    WHERE staffId = ?
");
$stmtGetAllStudent->bind_param("i", $userId);
$stmtGetAllStudent->execute();
$resultGetAllStudent = $stmtGetAllStudent->get_result();
$getAllStudentData = $resultGetAllStudent->fetch_all(MYSQLI_ASSOC);


$studentMoodData = [];
foreach ($getAllStudentData as $row) {
    $studentId = $row['studentId'];

    // Get latest mood for this student
    $stmtStudentMood = $conn->prepare("
        SELECT * 
        FROM moodTracking 
        WHERE studentId = ? 
        ORDER BY datetimeRecord DESC 
        LIMIT 1
    ");
    $stmtStudentMood->bind_param("i", $studentId);
    $stmtStudentMood->execute();
    $resultStudentMood = $stmtStudentMood->get_result();
    $studentMoodDataRow = $resultStudentMood->fetch_assoc();

    $moodTypeId = $studentMoodDataRow['moodTypeId'] ?? null;

    // Get Mood Status from mood table
    $studentMoodStatusData = [];
    $recordedDate = "No Record";
    $recordedTime = "No Record";
    if ($moodTypeId) {
        $stmtMoodStatus = $conn->prepare("SELECT * FROM mood WHERE moodTypeId = ?");
        $stmtMoodStatus->bind_param("i", $moodTypeId);
        $stmtMoodStatus->execute();
        $resultMoodStatus = $stmtMoodStatus->get_result();
        $studentMoodStatusData = $resultMoodStatus->fetch_assoc();

        $datetime = $studentMoodDataRow['datetimeRecord'] ?? null;

        if ($datetime) {
            $dateObj = new DateTime($datetime);
            $recordedDate = $dateObj->format('Y-m-d'); // e.g., 2025-12-07
            $recordedTime = $dateObj->format('H:i');   // e.g., 15:30
        }
    } else {
        $studentMoodStatusData = [];
    }

    $allStudentMoodData[] = [
        'studentId' => $studentId,
        'matricNo' => $row['matricNo'],
        'studentName' => $row['studentName'],
        'latestMoodStatus' => $studentMoodStatusData['moodStatus'] ?? "No Record",
        'latestMoodLocation' => $studentMoodStatusData['moodStoreLocation'] ?? "No Record",
        'latestStressLevel' => $studentMoodDataRow['stressLevel'] ?? "No Record",
        'lastRecordedDate' => $recordedDate ?? "No Record",
        'lastRecordedTime' => $recordedTime ?? "No Record"
    ];
}

echo json_encode([
    "success" => true, // <-- still true, but entriesData empty
    "studentData" => $allStudentMoodData
]);

?>
