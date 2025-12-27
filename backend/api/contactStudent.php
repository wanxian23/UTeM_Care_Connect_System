<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authPa.php";

$user = validateToken($conn);
$staffId = $user['staffId'];

// Use to get data from body (JSON.stringify)
$data = json_decode(file_get_contents("php://input"), true);
$studentId = $data['studentId'];
$message = $data['message'];

$title = "Meeting Request from Your PA";
$todayDate = date("d-m-Y");
$description = 'Your PA has scheduled a meeting with you. Check the details inside.';
$type = "contact";
$location = "";
$notificationId = "";

// Insert DASS notification
$stmtInsertNotification = $conn->prepare("
    INSERT INTO notification (studentId, title, description, notiType) 
    VALUES (?, ?, ?, ?);
");
$stmtInsertNotification->bind_param("isss", $studentId, $title, $description, $type);

$stmtInsertContact = $conn->prepare("
    INSERT INTO contactNote (message, studentId, staffId) 
    VALUES (?, ?, ?);
");
$stmtInsertContact->bind_param("sii", $message, $studentId, $staffId);

if ($stmtInsertNotification->execute()) {

    $notificationId = $conn->insert_id;

    if ($stmtInsertContact->execute()) {
        $contactId = $conn->insert_id;
        $location = "/ContactDetails/".$contactId;

        $stmtUpdateLocation = $conn->prepare("
            UPDATE notification
            SET location = ?
            WHERE notificationId = ?;
        ");
        $stmtUpdateLocation->bind_param("si", $location, $notificationId);
        
        if ($stmtUpdateLocation->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Student contact notification sent created successfully"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Failed to send student contact notification"
            ]);
        }
 
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to send contact student notification"
        ]);
    }

} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to send contact student notification"
    ]);
}
?>