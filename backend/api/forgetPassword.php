<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require "../database.php";

// ✅ Set timezone to Malaysia (GMT+8)
date_default_timezone_set('Asia/Kuala_Lumpur');

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';

if (!$email) {
    echo json_encode([
        "success" => false,
        "message" => "Email is required"
    ]);
    exit;
}

// Check if email exists in student table
$type = "";
$userId = null;

$stmt = $conn->prepare("SELECT studentId, studentEmail FROM student WHERE studentEmail = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $type = "student";
    $user = $result->fetch_assoc();
    $userId = $user['studentId'];
    $userEmail = $user['studentEmail'];
} else {
    // Check staff table
    $stmt = $conn->prepare("SELECT staffId, staffEmail FROM staff WHERE staffEmail = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $type = "staff";
        $user = $result->fetch_assoc();
        $userId = $user['staffId'];
        $userEmail = $user['staffEmail'];
    }
}

// If email not found
if (!$userId) {
    echo json_encode([
        "success" => false,
        "message" => "Email does not exist. Please try again."
    ]);
    exit;
}

// Generate 6-digit PIN
$pin = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

// Set expiration time (15 minutes from now)
$expiresAt = date("Y-m-d H:i:s", strtotime("+15 minutes"));

// Save PIN and expiration to database
if ($type === "student") {
    $stmt = $conn->prepare("
        UPDATE student
        SET loginToken = ?,
            expiresAt = ?
        WHERE studentId = ?
    ");
    $stmt->bind_param("ssi", $pin, $expiresAt, $userId);
} else {
    $stmt = $conn->prepare("
        UPDATE staff
        SET loginToken = ?,
            expiresAt = ?
        WHERE staffId = ?
    ");
    $stmt->bind_param("ssi", $pin, $expiresAt, $userId);
}

if (!$stmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to generate PIN. Please try again."
    ]);
    exit;
}

// ✅ FOR DEVELOPMENT: Return PIN in response (REMOVE IN PRODUCTION!)
echo json_encode([
    "success" => true,
    "message" => "A 6-digit PIN has been generated. Check console for PIN (development mode).",
    "debug_pin" => $pin,  // ⚠️ REMOVE THIS IN PRODUCTION!
    "debug_email" => $userEmail
]);

/* ⚠️ UNCOMMENT THIS FOR PRODUCTION (requires mail server setup)
// Send email with PIN
$subject = "Password Reset PIN - UTeM Care Connect";
$message = "Your password reset PIN is: $pin\n\n";
$message .= "This PIN will expire in 15 minutes.\n\n";
$message .= "If you did not request a password reset, please ignore this email.";
$headers = "From: no-reply@utem.edu.my";

$mailSent = mail($userEmail, $subject, $message, $headers);

if ($mailSent) {
    echo json_encode([
        "success" => true,
        "message" => "A 6-digit PIN has been sent to your email."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to send email. Please try again."
    ]);
}
*/
?>