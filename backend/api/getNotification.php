<?php
// ✅ CORS headers — put at the top
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "../database.php";
require "authStudent.php";

$user = validateToken($conn);
$token = $user['loginToken'];

$studentId = $user['studentId'];

// Get student notification data (Show only this month)
$stmtGetNotification = $conn->prepare("
    SELECT *
    FROM notification
    WHERE studentId = ?
    AND MONTH(notiCreatedDateTime) = MONTH(CURRENT_DATE())
    AND YEAR(notiCreatedDateTime) = YEAR(CURRENT_DATE())
    ORDER BY notificationId DESC
");
$stmtGetNotification->bind_param("i", $studentId);
$stmtGetNotification->execute();
$resultGetNotification = $stmtGetNotification->get_result();
$notificationData = $resultGetNotification->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    "success" => true, 
    "notificationData" => $notificationData
]);
?>
