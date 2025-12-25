<?php
// ✅ CORS headers — put at the top
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "../database.php";
require "authStudent.php";

$dassId = $_GET['dassId'];
$dassAnswer = "";
$dassQuestionId = 0;

$user = validateToken($conn);
$token = $user['loginToken'];

for ($i = 0; $i < 21; $i++) {
    $dassQuestionId++;

    $dassName = "q".$i;
    $dassAnswer = $_POST[$dassName];
    $stmtRecordDass = $conn->prepare("INSERT INTO dassRecord(dassId, dassQuestionId, scale)
                        VALUES(?, ?, ?)");
    $stmtRecordDass->bind_param("iii", $dassId, $dassQuestionId, $dassAnswer);
    $stmtRecordDass->execute();
}

$stmtUpdateDassStatus = $conn->prepare("
    UPDATE dass
    SET status = 'Completed',
    dassCompletedDateTime = NOW()
    WHERE dassId = ?
");
$stmtUpdateDassStatus->bind_param("i", $dassId);

// For notification part
$stmtGetDassDetails = $conn->prepare("
    SELECT * 
    FROM dass
    WHERE dassId = ?
");
$stmtGetDassDetails->bind_param("i", $dassId);
$stmtGetDassDetails->execute();
$resultGetDassDetails = $stmtGetDassDetails->get_result();
$dassDetailsData = $resultGetDassDetails->fetch_assoc();

$studentId = $dassDetailsData['studentId'];
$stmtGetStudentDetails = $conn->prepare("
    SELECT * FROM Student
    WHERE studentId = ?
");
$stmtGetStudentDetails->bind_param("i", $studentId);
$stmtGetStudentDetails->execute();
$resultGetStudentDetails = $stmtGetStudentDetails->get_result();
$studentDetailsData = $resultGetStudentDetails->fetch_assoc();

$studentMatric = $studentDetailsData['matricNo'];
$title = "DASS Assessment Completed By A Student!";
$description = "DASS Assessment has completed by ".$studentMatric."! Click and check it out.";
$staffId = $dassDetailsData['staffId'];
$stmtSendNotiToPa = $conn->prepare("
    INSERT INTO notification (staffId, title, description, notiType) 
    VALUES (?, ?, ?, 'DASS');
");
$stmtSendNotiToPa->bind_param("iss", $staffId, $title, $description);
$stmtSendNotiToPa->execute();

if ($stmtUpdateDassStatus->execute()) {
    echo json_encode([
        "success" => true, 
        "message" => "DASS Recorded Successfully!"
    ]);
} else {
    echo json_encode([
        "success" => false, 
        "message" => "DASS Recorded Failed!"
    ]);
}


?>