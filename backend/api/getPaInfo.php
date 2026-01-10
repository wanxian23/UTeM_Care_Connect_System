<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authPa.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$staffId = $user['staffId'];

$paId = $_GET['paId'];

// Get all the data of PA
$stmtGetPaDetails = $conn->prepare("
    SELECT * 
    FROM staff
    WHERE staffId = ?
"); 
$stmtGetPaDetails->bind_param("i", $paId);
$stmtGetPaDetails->execute();
$resultGetPaDetails = $stmtGetPaDetails->get_result();
$PaDetails = $resultGetPaDetails->fetch_assoc();

echo json_encode([
    "success" => true,
    "counsellorData" => $user,
    "PADetails" => $PaDetails
]);
?>
