<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "../database.php";
require "authPa.php"; // ✅ Add authentication

$user = validateToken($conn);
$staffId = $user['staffId'];

$newStatus = "";
$currentStatus = "";

if (isset($_GET['notificationId'])) {
    $notificationId = intval($_GET['notificationId']);

    // ✅ Use prepared statement to get current status
    $stmt = $conn->prepare("SELECT notiStatus FROM notification WHERE notificationId = ? AND staffId = ?");
    $stmt->bind_param("ii", $notificationId, $staffId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Notification not found"]);
        exit();
    }

    $row = $result->fetch_assoc();
    $currentStatus = $row['notiStatus'];

    // Toggle status
    $newStatus = ($currentStatus === "READ") ? "UNREAD" : "READ"; // ✅ Use === for comparison

    // ✅ Update status with prepared statement
    $stmtUpdate = $conn->prepare("UPDATE notification SET notiStatus = ? WHERE notificationId = ? AND staffId = ?");
    $stmtUpdate->bind_param("sii", $newStatus, $notificationId, $staffId);
    $exec = $stmtUpdate->execute();

} else if (isset($_GET['notificationIdReadOnly'])) {
    $notificationId = intval($_GET['notificationIdReadOnly']);

    // ✅ Update status with prepared statement
    $stmtUpdate = $conn->prepare("UPDATE notification SET notiStatus = 'READ' WHERE notificationId = ? AND staffId = ?");
    $stmtUpdate->bind_param("ii", $notificationId, $staffId);
    $exec = $stmtUpdate->execute();

} else {
    echo json_encode(["success" => false, "message" => "No notificationId provided"]);
    exit();
}


if ($exec) {
    echo json_encode([
        "success" => true,
        "message" => "Notification status updated",
        "newStatus" => $newStatus,
        "oldStatus" => $currentStatus 
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to update",
        "error" => $stmtUpdate->error
    ]);
}

$stmt->close();
$stmtUpdate->close();
$conn->close();
?>
