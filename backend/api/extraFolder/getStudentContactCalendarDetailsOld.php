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
$selectedDate = $_GET['selectedDate'];
$paId = $_GET['paId'] ?? null;

// Verify this student belongs to this PA
if (empty($paId)) {
    $stmtGetProfile = $conn->prepare("
        SELECT * 
        FROM staff
        WHERE staffId = ?
    ");
    $stmtGetProfile->bind_param("i", $staffId);

    $stmtCheckStudent = $conn->prepare("
        SELECT * FROM student
        WHERE studentId = ? AND staffId = ?
    ");
    $stmtCheckStudent->bind_param("ii", $getStudentId, $staffId);
} else {
    $stmtGetProfile = $conn->prepare("
        SELECT * 
        FROM staff
        WHERE staffId = ?
    ");
    $stmtGetProfile->bind_param("i", $paId);

    $stmtCheckStudent = $conn->prepare("
        SELECT * FROM student
        WHERE studentId = ? AND staffId = ?
    ");
    $stmtCheckStudent->bind_param("ii", $getStudentId, $paId);
}
$stmtGetProfile->execute();
$resultGetProfile = $stmtGetProfile->get_result();
$profileData = $resultGetProfile->fetch_assoc();

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
    AND date(datetimeRecord) = ?
");
$stmtGetAllContacts->bind_param("is", $getStudentId, $selectedDate);
$stmtGetAllContacts->execute();
$resultAllContacts = $stmtGetAllContacts->get_result();
$contactsData = $resultAllContacts->fetch_assoc();

$dateContact = $contactsData['datetimeRecord'];
// Define 7-day window
$startDate = (new DateTime($dateContact))->modify('-7 days')->format('Y-m-d H:i:s');

// Get last 7 days mood + stress with category
$stmtTrend = $conn->prepare("
    SELECT m.moodTypeId, mt.moodStatus, mt.category, mt.moodStoreLocation, m.datetimeRecord
    FROM moodTracking m
    LEFT JOIN mood mt ON m.moodTypeId = mt.moodTypeId
    WHERE m.studentId = ?
        AND m.datetimeRecord >= ?
    ORDER BY m.datetimeRecord ASC
");
$stmtTrend->bind_param("is", $studentId, $startDate);
$stmtTrend->execute();
$resultTrend = $stmtTrend->get_result();
$trendData = $resultTrend->fetch_all(MYSQLI_ASSOC);

$stmtStressLevel = $conn->prepare("
    SELECT * FROM stress
    WHERE studentId = ?
    AND datetimeRecord >= ?
    ORDER BY datetimeRecord ASC
");
$stmtStressLevel->bind_param("is", $studentId, $startDate);
$stmtStressLevel->execute();
$resultStressLevel = $stmtStressLevel->get_result();
$stressLevelData = $resultStressLevel->fetch_all(MYSQLI_ASSOC);

// Initialize counters and trends
$negativeMoodCount = 0;
$highStressCount = 0;
$totalRecords = count($trendData);

$moodTrend = "Stable";
$stressTrend = "Stable";
$prevStress = null;

// ✅ FIXED: Initialize prevStress properly
foreach ($stressLevelData as $rowTrend) {
    // Stress analysis
    if ($rowTrend['stressLevel'] !== null && $rowTrend['stressLevel'] >= 60) {
        $highStressCount++;
    }

    // Stress trend - only calculate if we have a previous value
    if ($prevStress !== null && $rowTrend['stressLevel'] !== null) {
        if ($rowTrend['stressLevel'] > $prevStress) {
            $stressTrend = "Increasing";
        } elseif ($rowTrend['stressLevel'] < $prevStress) {
            $stressTrend = "Decreasing";
        }
    }
    
    // Update previous stress for next iteration
    if ($rowTrend['stressLevel'] !== null) {
        $prevStress = $rowTrend['stressLevel'];
    }
}

foreach ($trendData as $rowTrend) {
    // Mood analysis using category
    if ($rowTrend['category'] === "Negative") {
        $negativeMoodCount++;
    }
}

// Mood Pattern
$moodPattern = "Stable";
if ($negativeMoodCount >= 4) {
    $moodPattern = "Mostly Negative";
} elseif ($negativeMoodCount >= 2) {
    $moodPattern = "Occasionally Negative";
}

// Stress Pattern
$stressPattern = "Low";
if ($highStressCount >= 4) {
    $stressPattern = "High";
} elseif ($highStressCount >= 2) {
    $stressPattern = "Moderate";
}

// Risk indicator
$riskIndicator = "Low";
if (
    ($negativeMoodCount >= 3 && $highStressCount >= 3) ||
    ($stressTrend === "Increasing" && $negativeMoodCount >= 2)
) {
    $riskIndicator = "High";
} elseif (
    $negativeMoodCount >= 2 || $highStressCount >= 2
) {
    $riskIndicator = "Need Attention";
}

// Last recorded mood date
$lastRecordedDate = "No Record";
$lastRecordedTime = "No Record";
if ($totalRecords > 0) {
    $datetime = $trendData[$totalRecords - 1]['datetimeRecord'];
    if ($datetime) {
        $dateObj = new DateTime($datetime);
        $lastRecordedDate = $dateObj->format('Y-m-d');
        $lastRecordedTime = $dateObj->format('H:i');
    }
}

$trendData = [
    'period' => 'Last 7 Days',
    'moodPattern' => $moodPattern,
    'stressPattern' => $stressPattern,
    'trend' => $stressTrend,
    'riskIndicator' => $riskIndicator,
];

echo json_encode([
    "success" => true,
    "profileData" => $profileData,
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
    'contactData' => $contactsData,
    'noteStatus' => $contactsData['note'] ?? "Pending",
    
    'trendData' => $trendData
]);
?>