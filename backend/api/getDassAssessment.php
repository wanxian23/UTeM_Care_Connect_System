<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authStudent.php";

$dassId = $_GET['dassId'];

// Run the auth function to fetch student data
$user = validateToken($conn);
$studentId = $user['studentId'];

$stmtGetDassQuestions = $conn->prepare("
    SELECT * 
    FROM dassQuestion 
");
// $stmtGetDassQuestions->bind_param("i", $userId);
$stmtGetDassQuestions->execute();
$resultGetDassQuestions = $stmtGetDassQuestions->get_result();
$dassQuestions = $resultGetDassQuestions->fetch_all(MYSQLI_ASSOC);

$stmtGetDass = $conn->prepare("
    SELECT * 
    FROM dass
    WHERE dassId = ? 
    AND studentId = ?
");
$stmtGetDass->bind_param("ii", $dassId, $studentId);
$stmtGetDass->execute();
$resultGetDass = $stmtGetDass->get_result();
$getDassData = $resultGetDass->fetch_assoc();

echo json_encode([
    "success" => true,
    "studentData" => $user,
    "dassData" => $getDassData,
    "dassQuestions" => $dassQuestions
]);
?>