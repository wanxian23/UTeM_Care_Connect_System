<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authStudent.php";

$contactId = $_GET['contactId'];

// Run the auth function to fetch student data
$user = validateToken($conn);
$studentId = $user['studentId'];

$stmtGetContactDetails = $conn->prepare("
    SELECT * 
    FROM contactNote
    WHERE contactId = ? 
    AND studentId = ?
");
$stmtGetContactDetails->bind_param("ii", $contactId, $studentId);
$stmtGetContactDetails->execute();
$resultGetContactDetails = $stmtGetContactDetails->get_result();
$contactDetails = $resultGetContactDetails->fetch_assoc();

$staffId = $contactDetails['staffId'];
$getPaDetails = $conn->prepare("
    SELECT staffName, staffEmail
    FROM staff
    WHERE staffId = ?
");
$getPaDetails->bind_param("i", $staffId);
$getPaDetails->execute();
$resultGetPaDetails = $getPaDetails->get_result();
$paDetails = $resultGetPaDetails->fetch_assoc();

echo json_encode([
    "success" => true,
    "studentData" => $user,
    "paDetails" => $paDetails,
    "contactData" => $contactDetails
]);
?>