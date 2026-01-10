<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require "../database.php";

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$pin = $data['pin'] ?? '';
$newPassword = $data['newPassword'] ?? '';

if (!$email || !$pin || !$newPassword) {
    echo json_encode([
        "success" => false,
        "message" => "Email, PIN, and new password are required"
    ]);
    exit;
}

// Validate password strength
if (strlen($newPassword) < 8) {
    echo json_encode([
        "success" => false,
        "message" => "Password must be at least 8 characters long"
    ]);
    exit;
}

// Hash the new password
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

// Try to find user in student table with valid PIN
$type = "";
$userId = null;

$stmt = $conn->prepare("
    SELECT studentId FROM student
    WHERE studentEmail = ?
    AND loginToken = ?
    AND expiresAt > NOW()
");
$stmt->bind_param("ss", $email, $pin);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $type = "student";
    $user = $result->fetch_assoc();
    $userId = $user['studentId'];
} else {
    // Try staff table
    $stmt = $conn->prepare("
        SELECT staffId FROM staff
        WHERE staffEmail = ?
        AND loginToken = ?
        AND expiresAt > NOW()
    ");
    $stmt->bind_param("ss", $email, $pin);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $type = "staff";
        $user = $result->fetch_assoc();
        $userId = $user['staffId'];
    }
}

// If no valid user found
if (!$userId) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid or expired PIN. Please request a new one."
    ]);
    exit;
}

// Update password and clear the PIN
if ($type === "student") {
    $stmt = $conn->prepare("
        UPDATE student
        SET studentPassword = ?,
            loginToken = NULL,
            expiresAt = NULL
        WHERE studentId = ?
    ");
    $stmt->bind_param("si", $hashedPassword, $userId);
} else {
    $stmt = $conn->prepare("
        UPDATE staff
        SET staffPassword = ?,
            loginToken = NULL,
            expiresAt = NULL
        WHERE staffId = ?
    ");
    $stmt->bind_param("si", $hashedPassword, $userId);
}

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Password has been reset successfully"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to reset password. Please try again."
    ]);
}
?>