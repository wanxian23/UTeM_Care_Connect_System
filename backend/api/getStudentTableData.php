<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authPa.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$userId = $user['staffId'];

$stmtGetAllStudent = $conn->prepare("
    SELECT * FROM Student
    WHERE staffId = ?
    ORDER BY studentName
");
$stmtGetAllStudent->bind_param("i", $userId);
$stmtGetAllStudent->execute();
$resultGetAllStudent = $stmtGetAllStudent->get_result();
$getAllStudentData = $resultGetAllStudent->fetch_all(MYSQLI_ASSOC);

$allStudentMoodData = [];
foreach ($getAllStudentData as $row) {
    $studentId = $row['studentId'];

    // Check contact record
    $contactSent = false;
    $stmtCheckContact = $conn->prepare("
        SELECT * 
        FROM contactNote
        WHERE studentId = ?
        ORDER BY contactId DESC
        LIMIT 1
    ");
    $stmtCheckContact->bind_param("i", $studentId);
    $stmtCheckContact->execute();
    $resultCheckContact = $stmtCheckContact->get_result();
    $checkContactData = $resultCheckContact->fetch_assoc();
    
    if ($resultCheckContact->num_rows > 0 && empty($checkContactData['note'])) {
        $contactSent = true;
    }

    $noteRecord = false;
    if (!empty($checkContactData['note'])) {
        $noteRecord = true;
    }


    // Define 7-day window
    $startDate = (new DateTime())->modify('-7 days')->format('Y-m-d H:i:s');

    // Get last 7 days mood + stress with category
    $stmtTrend = $conn->prepare("
        SELECT m.moodTypeId, mt.moodStatus, mt.category, mt.moodStoreLocation, m.stressLevel, m.datetimeRecord
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

    // Initialize counters and trends
    $negativeMoodCount = 0;
    $highStressCount = 0;
    $totalRecords = count($trendData);

    $moodTrend = "Stable";
    $stressTrend = "Stable";
    $prevStress = null;

    foreach ($trendData as $rowTrend) {
        // Mood analysis using category
        if ($rowTrend['category'] === "Negative") {
            $negativeMoodCount++;
        }

        // Stress analysis
        if ($rowTrend['stressLevel'] !== null && $rowTrend['stressLevel'] >= 60) {
            $highStressCount++;
        }

        // Stress trend
        if ($prevStress !== null && $rowTrend['stressLevel'] !== null) {
            if ($rowTrend['stressLevel'] > $prevStress) {
                $stressTrend = "Increasing";
            } elseif ($rowTrend['stressLevel'] < $prevStress) {
                $stressTrend = "Decreasing";
            }
        }
        $prevStress = $rowTrend['stressLevel'];
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
    $riskIndicator = "Low Risk";
    if (
        ($negativeMoodCount >= 3 && $highStressCount >= 3) ||
        ($stressTrend === "Increasing" && $negativeMoodCount >= 2)
    ) {
        $riskIndicator = "High Risk";
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

    $allStudentMoodData[] = [
        'studentId' => $studentId,
        'matricNo' => $row['matricNo'],
        'studentName' => $row['studentName'],

        'period' => 'Last 7 Days',
        'moodPattern' => $moodPattern,
        'stressPattern' => $stressPattern,
        'trend' => $stressTrend,

        'riskIndicator' => $riskIndicator,

        'lastRecordedDate' => $lastRecordedDate,
        'lastRecordedTime' => $lastRecordedTime,

        'contactRecord' => $contactSent,
        'noteRecord' => $noteRecord
    ];
}

echo json_encode([
    "success" => true,
    "studentData" => $allStudentMoodData
]);
?>
