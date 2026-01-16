<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authPa.php";

$user = validateToken($conn);
$staffId = $user['staffId'];
$contactId = $_GET['contactId'] ?? null;
$date = $_GET['date'];

$stmtGetContactDetails = $conn->prepare("
    SELECT * FROM contactNote
    WHERE contactId = ?
");
$stmtGetContactDetails->bind_param("i", $contactId);
$stmtGetContactDetails->execute();
$resultGetContactDetails = $stmtGetContactDetails->get_result();
$contactDetails = $resultGetContactDetails->fetch_assoc();

$studentId = $contactDetails['studentId'];

$paId = $contactDetails['staffId'];
$stmtGetPADetails = $conn->prepare("
    SELECT * FROM staff
    WHERE staffId = ?
");
$stmtGetPADetails->bind_param("i", $paId);
$stmtGetPADetails->execute();
$resultGetPADetails = $stmtGetPADetails->get_result();
$PADetails = $resultGetPADetails->fetch_assoc();

$title = "Alert! New Contact Note Pushed";
$todayDate = date("d-m-Y");
$description = 'A new student contact note has been pushed by PA '. $PADetails['staffNo'] .' for your review.';
$type = "push";
$location = "/StudentContactViewSpecific/".$studentId."/".$paId."/".$date."/".$contactId;
$notificationId = "";

$stmtGetAllCounsellor = $conn->prepare("
    SELECT * FROM staff
    WHERE staffRole = 'PEGAWAI PSIKOLOGI'
");
$stmtGetAllCounsellor->execute();
$resultGetAllCounsellor = $stmtGetAllCounsellor->get_result();
$AllCounsellorData = $resultGetAllCounsellor->fetch_all(MYSQLI_ASSOC);

foreach ($AllCounsellorData as $row) {
    $counsellorId = $row['staffId'];

    // Insert DASS notification
    $stmtInsertNotification = $conn->prepare("
        INSERT INTO notification (staffId, title, description, notiType, location) 
        VALUES (?, ?, ?, ?, ?);
    ");
    $stmtInsertNotification->bind_param("issss", $counsellorId, $title, $description, $type, $location);
}

$stmtUpdateContact = $conn->prepare("
    UPDATE contactNote
    SET pushToCounsellor = 1,
    pushDatetime = NOW()
    WHERE contactId = ?
");
$stmtUpdateContact->bind_param("i", $contactId);

if ($stmtInsertNotification->execute() && $stmtUpdateContact->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Contact & Note Pushed Successfully.!"
    ]);

} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to push contact & note"
    ]);
}
?>