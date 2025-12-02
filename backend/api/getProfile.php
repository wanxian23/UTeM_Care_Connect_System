<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authStudent.php";

// Run the auth function to fetch student data
$user = validateToken($conn);

echo json_encode([
    "success" => true,
    "userId" => $user['studentId'],
    "matricNo" => $user['matricNo'],
    "name" => $user['studentName'],
    "email" => $user['studentEmail'],
    "contact" => $user['studentContact'],
    "course" => $user['studentCourse'],
    "memberSince" => date("Y-m-d", strtotime($user['studentMemberSince'])),
    "faculty" => $user['studentFaculty'],
    "yearOfStudy" => $user['studentYearOfStudy'],
    "section" => $user['studentSection'],
    "group" => $user['studentGrp']
]);
?>
