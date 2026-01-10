<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require "../database.php";

// ✅ SET TIMEZONE
date_default_timezone_set('Asia/Kuala_Lumpur');

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$pin = $data['pin'] ?? '';

$email = trim($email);
$pin = trim($pin);

if (!$email || !$pin) {
    echo json_encode([
        "success" => false,
        "message" => "Email and PIN are required"
    ]);
    exit;
}

// Check student table first
$stmt = $conn->prepare("
    SELECT studentId, loginToken, expiresAt 
    FROM student
    WHERE studentEmail = ?
");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$userData = $result->fetch_assoc();

// If not found in student, check staff
if (!$userData) {
    $stmt = $conn->prepare("
        SELECT staffId, loginToken, expiresAt 
        FROM staff
        WHERE staffEmail = ?
    ");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $userData = $result->fetch_assoc();
}

// If email not found
if (!$userData) {
    echo json_encode([
        "success" => false,
        "message" => "Email not found. Please try again."
    ]);
    exit;
}

// Check if PIN matches
if ($userData['loginToken'] !== $pin) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid PIN. Please check and try again."
    ]);
    exit;
}

// ✅ Check if PIN is expired using correct timezone
$currentTime = date('Y-m-d H:i:s');
if ($currentTime > $userData['expiresAt']) {
    echo json_encode([
        "success" => false,
        "message" => "PIN has expired. Please request a new one.",
        "debug" => [
            "current_time" => $currentTime,
            "expires_at" => $userData['expiresAt']
        ]
    ]);
    exit;
}

// ✅ If we reach here, everything is valid
echo json_encode([
    "success" => true,
    "message" => "PIN verified successfully"
]);
?>