
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authPa.php";

$user = validateToken($conn);
$staffId = $user['staffId'];
$studentId = $_GET['studentId'];
$date = $_GET['date'];

// $contactMessage = $_POST['message'];
$noteType = $_POST['noteType'] ?? null;
$note = $_POST['note'] ?? null;

if (empty($noteType) || empty($note)) {
    echo json_encode([
        "success" => false,
        "message" => "Note Type and Note Cannot Be Empty!"
    ]);
    exit;
}

// Verify this student belongs to this PA
$stmtCheckStudent = $conn->prepare("
    SELECT * FROM student
    WHERE studentId = ? AND staffId = ?
");
$stmtCheckStudent->bind_param("ii", $studentId, $staffId);
$stmtCheckStudent->execute();
$resultCheckStudent = $stmtCheckStudent->get_result();
$studentData = $resultCheckStudent->fetch_assoc();

if (!$studentData) {
    echo json_encode([
        "success" => false,
        "message" => "Student not found or unauthorized"
    ]);
    exit;
}

$stmtUpdateContact = $conn->prepare("
    UPDATE contactNote
    SET note = ?,
    noteType = ?
    WHERE studentId = ?
    AND date(datetimeRecord) = ?
");
$stmtUpdateContact->bind_param("ssis", $note, $noteType, $studentId, $date);

if ($stmtUpdateContact->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Student contact details updated successfully."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Student contact details failed to update."
    ]);
}

?>