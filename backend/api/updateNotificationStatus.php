<?php
// ✅ CORS headers — put at the top
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "../database.php";

$notificationId= $_GET['notificationId'];
$notiStatus = "READ";
// Get data of recorded
$stmtUpdateNotiStatus = $conn->prepare("
    UPDATE notification
    SET notiStatus = ?
    WHERE notificationId = ?
");
$stmtUpdateNotiStatus->bind_param("si", $notiStatus, $notificationId);
$stmtUpdateNotiStatus->execute();

?>
