<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authPa.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$userId = $user['staffId'];

$stmtGetAllStudent = $conn->prepare("
    SELECT * FROM Student s
    LEFT JOIN dass d
    ON s.studentId = d.studentId
    WHERE s.staffId = ?
    ORDER BY d.studentId DESC
");
$stmtGetAllStudent->bind_param("i", $userId);
$stmtGetAllStudent->execute();
$resultGetAllStudent = $stmtGetAllStudent->get_result();
$getAllStudentData = $resultGetAllStudent->fetch_all(MYSQLI_ASSOC);

$allStudentDassData = [];

foreach ($getAllStudentData as $row) {
    $studentId = $row['studentId'];

    // Get latest DASS for this student
    $stmtStudentDass = $conn->prepare("
        SELECT * 
        FROM dass 
        WHERE studentId = ? 
        ORDER BY dassId DESC 
        LIMIT 1
    ");
    $stmtStudentDass->bind_param("i", $studentId);
    $stmtStudentDass->execute();
    $resultStudentDass = $stmtStudentDass->get_result();
    $studentDassDataRow = $resultStudentDass->fetch_assoc();

    $dassStatus = $studentDassDataRow['status'] ?? "No Record";
    $dassId = $studentDassDataRow['dassId'] ?? null;

    // Initialize default values
    $depressionLevel = null;
    $anxietyLevel = null;
    $stressLevel = null;
    $recordedDate = "No Record";

    // Only calculate levels if DASS exists
    if ($dassId && $studentDassDataRow['status'] !== "Pending") {
        $sumEachLevel = [];

        // Calculate Depression
        $stmtCalculateDassDepression = $conn->prepare("
            SELECT SUM(dr.scale) as total 
            FROM dassRecord dr
            JOIN dassQuestion dq ON dr.dassQuestionId = dq.dassQuestionId
            WHERE dr.dassId = ? AND dq.type = 'Depression'
        ");
        $stmtCalculateDassDepression->bind_param("i", $dassId);
        $stmtCalculateDassDepression->execute();
        $resultDassDepression = $stmtCalculateDassDepression->get_result();
        $dassDepressionData = $resultDassDepression->fetch_assoc();
        $sumEachLevel[0] = $dassDepressionData['total'] ?? 0;

        // Calculate Anxiety
        $stmtCalculateDassAnxiety = $conn->prepare("
            SELECT SUM(dr.scale) as total 
            FROM dassRecord dr
            JOIN dassQuestion dq ON dr.dassQuestionId = dq.dassQuestionId
            WHERE dr.dassId = ? AND dq.type = 'Anxiety'
        ");
        $stmtCalculateDassAnxiety->bind_param("i", $dassId);
        $stmtCalculateDassAnxiety->execute();
        $resultDassAnxiety = $stmtCalculateDassAnxiety->get_result();
        $dassAnxietyData = $resultDassAnxiety->fetch_assoc();
        $sumEachLevel[1] = $dassAnxietyData['total'] ?? 0;

        // Calculate Stress
        $stmtCalculateDassStress = $conn->prepare("
            SELECT SUM(dr.scale) as total 
            FROM dassRecord dr
            JOIN dassQuestion dq ON dr.dassQuestionId = dq.dassQuestionId
            WHERE dr.dassId = ? AND dq.type = 'Stress'
        ");
        $stmtCalculateDassStress->bind_param("i", $dassId);
        $stmtCalculateDassStress->execute();
        $resultDassStress = $stmtCalculateDassStress->get_result();
        $dassStressData = $resultDassStress->fetch_assoc();
        $sumEachLevel[2] = $dassStressData['total'] ?? 0;

        // Determine Depression Level
        if ($sumEachLevel[0] >= 0 && $sumEachLevel[0] <= 9) {
            $depressionLevel = "Normal";
        } else if ($sumEachLevel[0] >= 10 && $sumEachLevel[0] <= 13) {
            $depressionLevel = "Mild";
        } else if ($sumEachLevel[0] >= 14 && $sumEachLevel[0] <= 20) {
            $depressionLevel = "Moderate";
        } else if ($sumEachLevel[0] >= 21 && $sumEachLevel[0] <= 27) {
            $depressionLevel = "Severe";
        } else if ($sumEachLevel[0] >= 28) {
            $depressionLevel = "Extremely Severe";
        }

        // Determine Anxiety Level
        if ($sumEachLevel[1] >= 0 && $sumEachLevel[1] <= 7) {
            $anxietyLevel = "Normal";
        } else if ($sumEachLevel[1] >= 8 && $sumEachLevel[1] <= 9) {
            $anxietyLevel = "Mild";
        } else if ($sumEachLevel[1] >= 10 && $sumEachLevel[1] <= 14) {
            $anxietyLevel = "Moderate";
        } else if ($sumEachLevel[1] >= 15 && $sumEachLevel[1] <= 19) {
            $anxietyLevel = "Severe";
        } else if ($sumEachLevel[1] >= 20) {
            $anxietyLevel = "Extremely Severe";
        }

        // Determine Stress Level
        if ($sumEachLevel[2] >= 0 && $sumEachLevel[2] <= 14) {
            $stressLevel = "Normal";
        } else if ($sumEachLevel[2] >= 15 && $sumEachLevel[2] <= 18) {
            $stressLevel = "Mild";
        } else if ($sumEachLevel[2] >= 19 && $sumEachLevel[2] <= 25) {
            $stressLevel = "Moderate";
        } else if ($sumEachLevel[2] >= 26 && $sumEachLevel[2] <= 33) {
            $stressLevel = "Severe";
        } else if ($sumEachLevel[2] >= 34) {
            $stressLevel = "Extremely Severe";
        }

        // Extract date from datetime
        $datetime = $studentDassDataRow['dassCompletedDateTime'] ?? null;
        if ($datetime) {
            $dateObj = new DateTime($datetime);
            $recordedDate = $dateObj->format('Y-m-d');
        }

    }

    // Always add student to the array (whether they have DASS data or not)
    $allStudentDassData[] = [
        'studentId' => $studentId,
        'matricNo' => $row['matricNo'],
        'studentName' => $row['studentName'],
        'dassStatus' => $dassStatus,
        'depressionLevel' => $depressionLevel,
        'anxietyLevel' => $anxietyLevel,
        'stressLevel' => $stressLevel,
        'completedDate' => $recordedDate
    ];
}

echo json_encode([
    "success" => true,
    "studentDassData" => $allStudentDassData
]);
?>