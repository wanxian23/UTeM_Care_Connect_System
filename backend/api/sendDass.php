<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authPa.php";

$user = validateToken($conn);
$staffId = $user['staffId'];
$studentId = $_GET['studentId'];

$title = "Complete Your DASS Assessment";
$todayDate = date("d-m-Y");
$description = 'The DASS assessment for ' . $todayDate . ' has assigned by your PA. Kindly click here to fill it in.';
$type = "DASS";
$location = "";
$notificationId = "";

// Insert DASS notification
$stmtInsertNotification = $conn->prepare("
    INSERT INTO notification (studentId, title, description, notiType) 
    VALUES (?, ?, ?, ?);
");
$stmtInsertNotification->bind_param("isss", $studentId, $title, $description, $type);

$stmtInsertDass = $conn->prepare("
    INSERT INTO dass (studentId, staffId) 
    VALUES (?, ?);
");
$stmtInsertDass->bind_param("ii", $studentId, $staffId);

if ($stmtInsertNotification->execute()) {

    $notificationId = $conn->insert_id;

    if ($stmtInsertDass->execute()) {
        $dassId = $conn->insert_id;
        $location = "/DassAssessment/".$dassId."/".$staffId."/".$studentId;

        $stmtUpdateLocation = $conn->prepare("
            UPDATE notification
            SET location = ?
            WHERE notificationId = ?;
        ");
        $stmtUpdateLocation->bind_param("si", $location, $notificationId);
        
        if ($stmtUpdateLocation->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "DASS notification sent and assessment created successfully"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Failed to send DASS notification and create assessment"
            ]);
        }
 
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to send DASS notification and create assessment"
        ]);
    }

} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to send DASS notification and create assessment"
    ]);
}
?>