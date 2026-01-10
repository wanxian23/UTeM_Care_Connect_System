<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authStudent.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$userId = $user['studentId'];

// // Get data of recorded
// $stmtMoodData = $conn->prepare("SELECT * FROM moodTracking WHERE studentId = ? AND DATE(datetimeRecord) = CURDATE() ORDER BY moodId DESC");
// $stmtMoodData->bind_param("i", $userId);
// $stmtMoodData->execute();
// $resultMoodData = $stmtMoodData->get_result();
// $moodData = $resultMoodData->fetch_assoc();


// Get data of averageStress
// $stmtStressAvg = $conn->prepare("
//     SELECT AVG(stressLevel) AS avgStress
//     FROM moodTracking
//     WHERE studentId = ?
//     AND DATE(datetimeRecord) = CURDATE()
// ");
// $stmtStressAvg->bind_param("i", $userId);
// $stmtStressAvg->execute();
// $resultStressAvg = $stmtStressAvg->get_result();
// $stressData = $resultStressAvg->fetch_assoc();

// $avgStress = $stressData['avgStress']; // this is the average



// Get stress level
$stmtStress = $conn->prepare("
    SELECT * FROM stress
    WHERE studentId = ?
    AND DATE(datetimeRecord) = CURDATE()
");
$stmtStress->bind_param("i", $userId);
$stmtStress->execute();
$resultStress = $stmtStress->get_result();
$stressData = $resultStress->fetch_assoc();



// Get data of averageScale
// $stmtMoodAvg = $conn->prepare("
//     SELECT 
//         AVG(m.scale) AS avgMoodScale
//     FROM moodTracking mt
//     JOIN mood m ON mt.moodTypeId = m.moodTypeId
//     WHERE mt.studentId = ?
//     AND DATE(mt.datetimeRecord) = CURDATE()
// ");
// $stmtMoodAvg->bind_param("i", $userId);
// $stmtMoodAvg->execute();

// $resultMoodAvg = $stmtMoodAvg->get_result();
// $dataMood = $resultMoodAvg->fetch_assoc();

// $avgMoodScale = $dataMood['avgMoodScale'];  // decimal (e.g., 5.7)

// $finalMoodScale = round($avgMoodScale);

// $stmtMoodInfo = $conn->prepare("
//     SELECT *
//     FROM mood
//     WHERE scale = ?
// ");
// $stmtMoodInfo->bind_param("i", $finalMoodScale);
// $stmtMoodInfo->execute();

// $resultMoodInfo = $stmtMoodInfo->get_result();
// $moodInfo = $resultMoodInfo->fetch_assoc();

$moodStatus = [];
$moodStoreLocation = [];
$stmtGetAllMoodStatus = $conn->prepare("
    SELECT * FROM moodTracking 
    WHERE studentId = ?
    AND DATE(datetimeRecord) = CURDATE()
");
$stmtGetAllMoodStatus->bind_param("i", $userId);
$stmtGetAllMoodStatus->execute();
$resultGetAllMoodStatus = $stmtGetAllMoodStatus->get_result();
$getAllMoodStatusData = $resultGetAllMoodStatus->fetch_all(MYSQLI_ASSOC);

foreach ($getAllMoodStatusData as $row) {
    $moodTypeId = $row['moodTypeId'];

    $stmtGetMoodDetails = $conn->prepare("
        SELECT * FROM mood
        WHERE moodTypeId = ?
    ");
    $stmtGetMoodDetails->bind_param("i", $moodTypeId);
    $stmtGetMoodDetails->execute();
    $resultGetMoodDetails = $stmtGetMoodDetails->get_result();
    $moodDetails = $resultGetMoodDetails->fetch_assoc();

    $moodStatus[] = $moodDetails['moodStatus'];
    $moodStoreLocation[] = $moodDetails['moodStoreLocation'];
}

// Variable for moodCount (Weekly)
$moodCount = [];

// Get Weekly data of recorded
$stmtMoodDataWeekly = $conn->prepare("
    SELECT * FROM moodTracking 
    WHERE studentId = ? AND 
    YEARWEEK(datetimeRecord, 1) = YEARWEEK(CURDATE(), 1)
");
$stmtMoodDataWeekly->bind_param("i", $userId);
$stmtMoodDataWeekly->execute();
$resultMoodDataWeekly = $stmtMoodDataWeekly->get_result();
$moodDataWeekly = $resultMoodDataWeekly->fetch_all(MYSQLI_ASSOC);

// Initialize 8 mood counters
// Start with index 0 and create 8 items
// Last initialize all to zero
$moodCount = array_fill(0, 8, 0);

// Count mood occurrences
foreach ($moodDataWeekly as $weeklyRow) {
    $type = intval($weeklyRow['moodTypeId']);
    if ($type >= 1 && $type <= 8) {
        $moodCount[$type - 1]++;
    }
}

if ($stressData) {

    // // Get data of recorded entries
    // $moodId = $moodData['moodId'];
    // $stmtEntriesData = $conn->prepare("SELECT * FROM entriesRecord WHERE moodId = ?");
    // $stmtEntriesData->bind_param("i", $moodId);
    // $stmtEntriesData->execute();
    // $resultEntriesData = $stmtEntriesData->get_result();
    // $entriesData = $resultEntriesData->fetch_all(MYSQLI_ASSOC);

    // Get data of mood
    // $moodTypeId = $moodData['moodTypeId'];
    // $stmtMoodType = $conn->prepare("SELECT * FROM mood WHERE moodTypeId = ?");
    // $stmtMoodType->bind_param("i", $moodTypeId);
    // $stmtMoodType->execute();
    // $resultMoodType = $stmtMoodType->get_result();
    // $moodType = $resultMoodType->fetch_assoc();

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
            "moodStatus" => $moodStatus ?? null,
            "moodStoreLocation" => $moodStoreLocation ?? null,
            "stressLevel" => $avgStress,
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

    // DAILY RECORD EXISTS
    if ($stressData) {

        echo json_encode([
            "success" => true,
            "hasRecord" => true,

            // Daily mood info
            "moodStatus" => $moodStatus ?? null,
            "moodStoreLocation" => $moodStoreLocation ?? null,
            "stressLevel" => $stressData['stressLevel'] ?? null,

            // Recommendation info
            "quote" => $recommendation ? $recommendation['quote'] : "Be Happy Everyday!",
            "quoteType" => $recommendation ? $recommendation['type'] : "Positive",
            "quoteLink" => $recommendation['hyperlink'] ??  null,
            "fbUsefulness" => $recommendationChecking['fbUsefulness'] ?? null,

            // WEEKLY DATA (ALWAYS RETURNED)
            "weeklyMoodCount" => $moodCount
        ]);

        exit;
    }

    // DAILY RECORD NOT FOUND
    echo json_encode([
        "success" => true,
        "hasRecord" => false,

        // Daily default values
        "moodStatus" => null,
        "moodStoreLocation" => null,
        "stressLevel" => null,
        "message" => "No mood record for today",

        // WEEKLY DATA STILL RETURNED
        "weeklyMoodCount" => $moodCount
    ]);
    exit;

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
