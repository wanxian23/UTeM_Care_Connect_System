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
    SET status = 'Completed'
    WHERE dassId = ?
");
$stmtUpdateDassStatus->bind_param("i", $dassId);

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