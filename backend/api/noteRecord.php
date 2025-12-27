
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
$note = $data['message'];
$noteType = $data['noteType'];

$stmtGetContact = $conn->prepare("
    SELECT *
    FROM contactNote
    WHERE studentId = ?
    ORDER BY contactId DESC
    LIMIT 1
");
$stmtGetContact->bind_param("i", $studentId);
$stmtGetContact->execute();
$resultGetContact = $stmtGetContact->get_result();
$getContactData = $resultGetContact->fetch_assoc();

$contactId = $getContactData['contactId'];
$stmtInsertNote = $conn->prepare("
    UPDATE contactNote
    SET note = ?,
    noteType = ?
    WHERE contactId = ?
");
$stmtInsertNote->bind_param("ssi", $note, $noteType, $contactId);

if ($stmtInsertNote->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Student note recorded successfully"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "FStudent note recorded failed"
    ]);
}

?>