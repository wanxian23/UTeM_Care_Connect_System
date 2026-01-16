<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Content-Type: application/json"); // ✅ Add this

require "../database.php";
require "authPa.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$staffId = $user['staffId'];

// Get all pushed note details
$stmtGetNoteDetails = $conn->prepare("
    SELECT * FROM contactNote
    WHERE pushToCounsellor = 1
    ORDER BY pushDatetime DESC
");
$stmtGetNoteDetails->execute();
$resultGetNoteDetails = $stmtGetNoteDetails->get_result();
$noteDetails = $resultGetNoteDetails->fetch_all(MYSQLI_ASSOC);

$totalPushedNote = $resultGetNoteDetails->num_rows ?? 0;
$totalMoodAlert = 0;
$totalDASSAlert = 0;

$pushedDetails = [];
foreach ($noteDetails as $noteRow) {
    $contactId = $noteRow['contactId'];
    $studentId = $noteRow['studentId'];
    $paId = $noteRow['staffId'];

    // Get each note details
    $stmtGetSpecificNoteDetails = $conn->prepare("
        SELECT * FROM contactNote
        WHERE contactId = ?
    ");
    $stmtGetSpecificNoteDetails->bind_param("i", $contactId);
    $stmtGetSpecificNoteDetails->execute();
    $resultGetSpecificNoteDetails = $stmtGetSpecificNoteDetails->get_result();
    $specificNoteDetails = $resultGetSpecificNoteDetails->fetch_assoc();

    if (empty($specificNoteDetails['dassId'])) {
        $totalMoodAlert++;
    } else {
        $totalDASSAlert++;
    }

    // Get pushed student details
    $stmtGetStudentDetails = $conn->prepare("
        SELECT * FROM student
        WHERE studentId = ?
    ");
    $stmtGetStudentDetails->bind_param("i", $studentId);
    $stmtGetStudentDetails->execute();
    $resultGetStudentDetails = $stmtGetStudentDetails->get_result();
    $studentDetails = $resultGetStudentDetails->fetch_assoc();

    // Get pushed PA details
    $stmtGetPaDetails = $conn->prepare("
        SELECT * FROM staff
        WHERE staffId = ?
    ");
    $stmtGetPaDetails->bind_param("i", $paId);
    $stmtGetPaDetails->execute();
    $resultGetPaDetails = $stmtGetPaDetails->get_result();
    $paDetails = $resultGetPaDetails->fetch_assoc();

    $pushedDetails[] = [
        'noteData' => $specificNoteDetails,
        'studentData' => $studentDetails,
        'paData' => $paDetails,
    ];
}

$dashboardDetails = [
    'totalAlert' => $totalPushedNote,
    'totalMoodAlert' => $totalMoodAlert,
    'totalDASSAlert' => $totalDASSAlert
];

echo json_encode([
    "success" => true,
    'dashboardDetails' => $dashboardDetails,
    "pushedDetails" => $pushedDetails
]);
?>