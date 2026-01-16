<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Content-Type: application/json");

require "../database.php";
require "authPa.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$staffId = $user['staffId'];
$getStudentId = $_GET['studentId'];
$paId = $_GET['paId'] ?? null;

// Verify this student belongs to this PA
if (empty($paId)) {
    $stmtCheckStudent = $conn->prepare("
        SELECT * FROM student
        WHERE studentId = ? AND staffId = ?
    ");
    $stmtCheckStudent->bind_param("ii", $getStudentId, $staffId);
} else {
    $stmtCheckStudent = $conn->prepare("
        SELECT * FROM student
        WHERE studentId = ? AND staffId = ?
    ");
    $stmtCheckStudent->bind_param("ii", $getStudentId, $paId);
}
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

// Get all contact records for this student
$stmtGetAllContacts = $conn->prepare("
    SELECT *
    FROM contactNote
    WHERE studentId = ?
    ORDER BY datetimeRecord DESC
");
$stmtGetAllContacts->bind_param("i", $getStudentId);
$stmtGetAllContacts->execute();
$resultAllContacts = $stmtGetAllContacts->get_result();
$allContactsData = $resultAllContacts->fetch_all(MYSQLI_ASSOC);

// Organize contacts by date
$contactsByDate = [];
foreach ($allContactsData as $contact) {
    $dateOnly = (new DateTime($contact['datetimeRecord']))->format('Y-m-d');
    
    // Determine note status
    $noteStatus = "Pending";
    if (!empty($contact['note'])) {
        $noteStatus = "Added";
    }
    
    // Store contact info
    if (!isset($contactsByDate[$dateOnly])) {
        $contactsByDate[$dateOnly] = [];
    }
    
    $contactsByDate[$dateOnly][] = [
        'contactId' => $contact['contactId'],
        'message' => $contact['message'],
        'datetime' => $contact['datetimeRecord'],
        'note' => $contact['note'],
        'noteType' => $contact['noteType'],
        'noteStatus' => $noteStatus,
        'pushToCounsellor' => $contact['pushToCounsellor']
    ];
}

echo json_encode([
    "success" => true,
    "studentData" => [
        'studentId' => $studentData['studentId'],
        'matricNo' => $studentData['matricNo'],
        'studentName' => $studentData['studentName'],
        'studentEmail' => $studentData['studentEmail'],
        'studentContact' => $studentData['studentContact'],
        'studentFaculty' => $studentData['studentFaculty'],
        'studentCourse' => $studentData['studentCourse'],
        'studentYearOfStudy' => $studentData['studentYearOfStudy'],
        'studentSection' => $studentData['studentSection'],
        'studentGrp' => $studentData['studentGrp'],
        'studentMemberSince' => $studentData['studentMemberSince']
    ],
    "contactsByDate" => $contactsByDate,
    "totalContacts" => count($allContactsData)
]);
?>