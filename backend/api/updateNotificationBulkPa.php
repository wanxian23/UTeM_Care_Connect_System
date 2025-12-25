<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "../database.php";
require "authPa.php"; // ✅ Add authentication

$user = validateToken($conn);
$staffId = $user['staffId'];

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

// ✅ Check for both ids and newStatus
if (!isset($data["ids"]) || !is_array($data["ids"]) || !isset($data["newStatus"])) {
    echo json_encode(["success" => false, "message" => "ids and newStatus required"]);
    exit();
}

$ids = $data["ids"];
$newStatus = $data["newStatus"];

// ✅ Validate status
if ($newStatus !== "READ" && $newStatus !== "UNREAD") {
    echo json_encode(["success" => false, "message" => "Invalid status value"]);
    exit();
}

// Prepare SQL with IN clause
$placeholders = implode(",", array_fill(0, count($ids), "?"));

$sql = "
    UPDATE notification
    SET notiStatus = ?
    WHERE notificationId IN ($placeholders)
    AND staffId = ?
";

$stmt = $conn->prepare($sql);

// ✅ Build type string: 's' for newStatus, 'i' for each ID, 'i' for staffId
$types = 's' . str_repeat("i", count($ids)) . 'i';

// ✅ Build params array: newStatus, then all IDs, then staffId
$params = array_merge([$newStatus], $ids, [$staffId]);

// ✅ Bind params
$stmt->bind_param($types, ...$params);

$success = $stmt->execute();

if ($success) {
    echo json_encode([
        "success" => true,
        "message" => "Notifications updated successfully",
        "updatedCount" => $stmt->affected_rows
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Update failed",
        "error" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>