<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Content-Type: application/json"); // ✅ ADD THIS

require "../database.php";
require "authPa.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$userId = $user['staffId'];
$studentIdGet = $_GET['studentId'];

$paId = $_GET['paId'] ?? null;
$PADetails = [];

// Get student personal information
if (empty($paId)) {
    $stmtGetAllStudent = $conn->prepare("
        SELECT * FROM Student
        WHERE studentId = ?
        AND staffId = ?
    ");
    $stmtGetAllStudent->bind_param("ii", $studentIdGet, $userId);
} else {
    // Get PA Details
    $stmtGetPADetails = $conn->prepare("
        SELECT * FROM staff
        WHERE staffId = ?
    ");
    $stmtGetPADetails->bind_param("i", $paId);
    $stmtGetPADetails->execute();
    $resultGetPADetails = $stmtGetPADetails->get_result();
    $PADetails = $resultGetPADetails->fetch_assoc();

    $stmtGetAllStudent = $conn->prepare("
        SELECT * FROM Student
        WHERE studentId = ?
        AND staffId = ?
    ");
    $stmtGetAllStudent->bind_param("ii", $studentIdGet, $paId);
}

$stmtGetAllStudent->execute();
$resultGetAllStudent = $stmtGetAllStudent->get_result();
$getAllStudentData = $resultGetAllStudent->fetch_assoc();

// ✅ ADD NULL CHECK HERE
if (!$getAllStudentData) {
    echo json_encode([
        "success" => false,
        "message" => "Student not found"
    ]);
    exit;
}

$studentId = $getAllStudentData['studentId'];

// Get student mood record information
$stmtMoodData = $conn->prepare("
    SELECT * FROM moodTracking 
    WHERE studentId = ? AND DATE(datetimeRecord) = CURDATE()
    ORDER BY datetimeRecord ASC
");
$stmtMoodData->bind_param("i", $studentId);
$stmtMoodData->execute();
$resultMoodData = $stmtMoodData->get_result();
$allMoodRecords = $resultMoodData->fetch_all(MYSQLI_ASSOC);

// Get stress level
$stmtStress = $conn->prepare("
    SELECT * FROM stress
    WHERE studentId = ?
    AND DATE(datetimeRecord) = CURDATE()
");
$stmtStress->bind_param("i", $studentId);
$stmtStress->execute();
$resultStress = $stmtStress->get_result();
$stressData = $resultStress->fetch_assoc();

// ✅ INITIALIZE AS EMPTY ARRAY (not null)
$finalRecords = [];

if ($resultMoodData->num_rows > 0) {
    foreach ($allMoodRecords as $record) {
        $moodId = $record['moodId'];

        // Entries
        $stmtEntriesData = $conn->prepare("SELECT * FROM entriesRecord WHERE moodId = ?");
        $stmtEntriesData->bind_param("i", $moodId);
        $stmtEntriesData->execute();
        $entriesRes = $stmtEntriesData->get_result();
        $entriesData = $entriesRes->fetch_all(MYSQLI_ASSOC);

        // Mood type
        $stmtMoodType = $conn->prepare("SELECT * FROM mood WHERE moodTypeId = ?");
        $stmtMoodType->bind_param("i", $record['moodTypeId']);
        $stmtMoodType->execute();
        $moodType = $stmtMoodType->get_result()->fetch_assoc();

        // Entries type
        $stmtEntriesType = $conn->prepare("SELECT entriesType FROM entriesType WHERE entriesTypeId = ?");

        $completeEntriesData = [];
        foreach ($entriesData as $entry) {
            $stmtEntriesType->bind_param("i", $entry['entriesTypeId']);
            $stmtEntriesType->execute();
            $entriesType = $stmtEntriesType->get_result()->fetch_assoc();
            $completeEntriesData[] = array_merge($entry, $entriesType);
        }

        $finalRecords[] = [
            "moodStatus" => $moodType['moodStatus'] ?? null,
            "moodStoreLocation" => $moodType['moodStoreLocation'] ?? null,
            "moodRecordTime" => $record['datetimeRecord'] ?? null,
            "stressLevel" => $stressData['stressLevel'] ?? null,
            "note" => $record['note'] ? nl2br(htmlspecialchars($record['note'])) : null,
            "entriesData" => $completeEntriesData,
            "notePrivacy" => (int)($record['notePrivacy'] ?? 0)
        ];
    }
}

// ✅ ALWAYS RETURN ARRAYS (never null)
echo json_encode([
    "success" => true,
    "studentData" => $getAllStudentData,
    "studentMoodData" => $finalRecords, // ✅ Will be [] if empty, not null
    "PADetails" => $PADetails ?: [] // ✅ Empty array if no PA details
]);
?>