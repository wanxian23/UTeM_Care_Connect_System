<?php

function validateToken($conn) {
    header("Content-Type: application/json");

    // Read headers safely
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? null;

    if (!$auth) {
        echo json_encode(["success" => false, "message" => "No token provided"]);
        exit;
    }

    list($type, $token) = explode(" ", $auth);

    if (empty($token)) {
        echo json_encode(["success" => false, "message" => "Invalid token"]);
        exit;
    }

    // Query student table
    $stmt = $conn->prepare("SELECT * FROM student WHERE loginToken = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Invalid or expired token"]);
        exit;
    }

    // Return user data
    return $result->fetch_assoc();
}
?>
