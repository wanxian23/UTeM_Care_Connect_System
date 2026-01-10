
<?php
// noteRecord.php
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

if (empty($note) || empty($noteType)) {
    echo json_encode([
        "success" => false,
        "message" => "Both note type and message cannot be empty!"
    ]);
    exit;
}

$stmtGetContact = $conn->prepare("
    SELECT *
    FROM contactNote
    WHERE studentId = ?
    AND staffId = ?
    ORDER BY contactId DESC
    LIMIT 1
");
$stmtGetContact->bind_param("ii", $studentId, $staffId);
$stmtGetContact->execute();
$resultGetContact = $stmtGetContact->get_result();
$getContactData = $resultGetContact->fetch_assoc();

$contactId = $getContactData['contactId'];
$stmtInsertNote = $conn->prepare("
    UPDATE contactNote
    SET note = ?,
    noteType = ?
    WHERE contactId = ?
    AND staffId = ?
");
$stmtInsertNote->bind_param("ssii", $note, $noteType, $contactId, $staffId);

if ($stmtInsertNote->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Student note recorded successfully"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Student note recorded failed"
    ]);
}

?>