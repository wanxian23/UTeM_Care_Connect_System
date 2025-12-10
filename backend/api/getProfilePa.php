<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authPa.php";

// Run the auth function to fetch student data
$user = validateToken($conn);

echo json_encode([
    "success" => true,
    "userId" => $user['staffId'],
    "staffNo" => $user['staffNo'],
    "name" => $user['staffName'],
    "email" => $user['staffEmail'],
    "contact" => $user['staffContact'],
    "memberSince" => date("Y-m-d", strtotime($user['staffMemberSince'])),
    "faculty" => $user['staffFaculty'],
    "office" => $user['staffOffice'],
    "role" => $user['staffRole']
]);
?>
