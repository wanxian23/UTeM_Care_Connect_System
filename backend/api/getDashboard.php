<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authStudent.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$userId = $user['studentId'];

// Get data of recorded
$stmtMoodData = $conn->prepare("SELECT * FROM moodTracking WHERE studentId = ? AND DATE(datetimeRecord) = CURDATE()");
$stmtMoodData->bind_param("i", $userId);
$stmtMoodData->execute();
$resultMoodData = $stmtMoodData->get_result();
$moodData = $resultMoodData->fetch_assoc();

$moodCount = [];

// Get Weekly data of recorded
$stmtMoodDataWeekly = $conn->prepare("SELECT * FROM moodTracking WHERE studentId = ? AND YEARWEEK(datetimeRecord, 1) = YEARWEEK(CURDATE(), 1)");
$stmtMoodDataWeekly->bind_param("i", $userId);
$stmtMoodDataWeekly->execute();
$resultMoodDataWeekly = $stmtMoodDataWeekly->get_result();
$moodDataWeekly = $resultMoodDataWeekly->fetch_all(MYSQLI_ASSOC);

// Initialize 8 mood counters
$moodCount = array_fill(0, 8, 0);

// Count mood occurrences
foreach ($moodDataWeekly as $weeklyRow) {
    $type = intval($weeklyRow['moodTypeId']);
    if ($type >= 1 && $type <= 8) {
        $moodCount[$type - 1]++;
    }
}

if ($moodData) {

    // Get data of recorded entries
    $moodId = $moodData['moodId'];
    $stmtEntriesData = $conn->prepare("SELECT * FROM entriesRecord WHERE moodId = ?");
    $stmtEntriesData->bind_param("i", $moodId);
    $stmtEntriesData->execute();
    $resultEntriesData = $stmtEntriesData->get_result();
    $entriesData = $resultEntriesData->fetch_all(MYSQLI_ASSOC);

    // Get data of mood
    $moodTypeId = $moodData['moodTypeId'];
    $stmtMoodType = $conn->prepare("SELECT * FROM mood WHERE moodTypeId = ?");
    $stmtMoodType->bind_param("i", $moodTypeId);
    $stmtMoodType->execute();
    $resultMoodType = $stmtMoodType->get_result();
    $moodType = $resultMoodType->fetch_assoc();

    // Get data of recommendation

    $stmtRecommendationChecking = $conn->prepare("
        SELECT * 
        FROM recommendationDisplay 
        WHERE studentId = ? 
        ORDER BY recommendationDisplayId DESC 
        LIMIT 1
    ");
    $stmtRecommendationChecking->bind_param("i", $userId);
    $stmtRecommendationChecking->execute();
    $resultRecommendationChecking = $stmtRecommendationChecking->get_result();
    $recommendationChecking = $resultRecommendationChecking->fetch_assoc();

    // If no record exists for this student → return default
    if (!$recommendationChecking) {
        echo json_encode([
            "success" => true,
            "hasRecord" => true,
            "moodStatus" => $moodType['moodStatus'],
            "moodStoreLocation" => $moodType['moodStoreLocation'],
            "stressLevel" => $moodData['stressLevel'],
            "quote" => "Be Happy Everyday!",
            "quoteType" => "Positive",
            "weeklyMoodCount" => $moodCount
        ]);
        exit;
    }

    $recommendId = $recommendationChecking['recommendId'];

    $stmtRecommendation = $conn->prepare("SELECT * FROM recommendation WHERE recommendId = ?");
    $stmtRecommendation->bind_param("i", $recommendId);
    $stmtRecommendation->execute();
    $resultRecommendation = $stmtRecommendation->get_result();
    $recommendation = $resultRecommendation->fetch_assoc();

    if ($recommendation) {
        echo json_encode([
            "success" => true,
            "hasRecord" => true,
            "moodStatus" => $moodType['moodStatus'],
            "moodStoreLocation" => $moodType['moodStoreLocation'],
            "stressLevel" => $moodData['stressLevel'],
            "quote" => $recommendation['quote'],
            "quoteType" => $recommendation['type'],
            "fbUsefulness" => $recommendationChecking['fbUsefulness'],
            "weeklyMoodCount" => $moodCount
        ]);
    } else {
        echo json_encode([
            "success" => true,
            "hasRecord" => true,
            "moodStatus" => $moodType['moodStatus'],
            "moodStoreLocation" => $moodType['moodStoreLocation'],
            "stressLevel" => $moodData['stressLevel'],
            "quote" => "Be Happy Everyday!",
            "quoteType" => "Positive",
            "weeklyMoodCount" => $moodCount
        ]);
    }

} else {
    // No record for today
    echo json_encode([
        "success" => true, // <-- still true, but entriesData empty
        "hasRecord" => false,  // Add this flag
        "entriesData" => [],
        "message" => "No mood record for today",
        "weeklyMoodCount" => $moodCount
    ]);
}
?>
