<?php
// ✅ CORS headers — put at the top
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "../database.php";
require "authStudent.php";

$pass = $_POST["password"];
$hashedPass = password_hash($pass, PASSWORD_DEFAULT);

$user = validateToken($conn);
$token = $user['loginToken'];

$stmt = $conn->prepare("UPDATE student SET studentPassword = ? WHERE loginToken = ?");
$stmt->bind_param("ss", $hashedPass, $token);
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Password has changed successfully!"]);
} else {
    echo json_encode(["success" => false, "message" => "Password Changed Failed!"]);
}

?>
