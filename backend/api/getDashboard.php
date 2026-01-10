<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require "../database.php";
require "authStudent.php";

// Run the auth function to fetch student data
$user = validateToken($conn);
$userId = $user['studentId'];

// ============= DATE TESTING CONFIG =============
define('ENABLE_DATE_TESTING', false);
// Format: YYYY-MM-DD
define('TEST_DATE', '2026-01-10');
define('TEST_TIME', '02:00:00');

$todayDate = ENABLE_DATE_TESTING
    ? TEST_DATE
    : date('Y-m-d'); // Asia/Kuala_Lumpur already set

// ============= ACTUAL CONFIG =============
// Define time windows for mood recording
define('MORNING_START', '06:00:00');  // 6:00 AM
define('MORNING_END', '11:59:59');    // 11:59 AM
define('AFTERNOON_START', '12:00:00'); // 12:00 PM
define('AFTERNOON_END', '23:59:59');   // 11:59 PM

// Get stress level
$stmtStress = $conn->prepare("
    SELECT * FROM stress
    WHERE studentId = ?
    AND DATE(datetimeRecord) = ?
");
$stmtStress->bind_param("is", $userId, $todayDate);
$stmtStress->execute();
$resultStress = $stmtStress->get_result();
$stressData = $resultStress->fetch_assoc();

$moodStatus = [];
$moodStoreLocation = [];
$moodRecordTime = [];
$stmtGetAllMoodStatus = $conn->prepare("
    SELECT * FROM moodTracking 
    WHERE studentId = ?
    AND DATE(datetimeRecord) = ?
");
$stmtGetAllMoodStatus->bind_param("is", $userId, $todayDate);
$stmtGetAllMoodStatus->execute();
$resultGetAllMoodStatus = $stmtGetAllMoodStatus->get_result();
$getAllMoodStatusData = $resultGetAllMoodStatus->fetch_all(MYSQLI_ASSOC);
$totalRows = ENABLE_DATE_TESTING
    ? 1 : $resultGetAllMoodStatus->num_rows;

$currentTime = ENABLE_DATE_TESTING
    ? TEST_TIME : date("H:i:s");
$canRecord = [];
if ($totalRows === 0) {
    if ($currentTime >= MORNING_START && $currentTime <= MORNING_END) {
        $canRecord = [
            'recordCount' => $totalRows,
            'isMorning' => true,
            'isAfternoon' => false,
            'canRecord' => true,
            'buttonShow' => true,
            'message' => "You seem like haven't record for any mood today yet!"
        ];
    } elseif ($currentTime >= AFTERNOON_START && $currentTime <= AFTERNOON_END) {
        $canRecord = [
            'recordCount' => $totalRows,
            'isMorning' => false,
            'isAfternoon' => true,
            'canRecord' => true,
            'buttonShow' => true,
            'message' => "You seem like haven't record for any mood today yet!"
        ];
    }  else {
        $canRecord = [
            'recordCount' => $totalRows,
            'isMorning' => true,
            'isAfternoon' => false,
            'canRecord' => false,
            'buttonShow' => false,
            'message' => "Please wait until 6AM to record your second mood and stress status!"
        ];
    }
} else if ($totalRows == 1) {

    $periodRecord = ENABLE_DATE_TESTING
        ? TEST_TIME : "";
    foreach ($getAllMoodStatusData as $row) {
        $periodRecord = date('H:i:s', strtotime($row['datetimeRecord']));
    }
    
    if ($currentTime >= MORNING_START && $currentTime <= MORNING_END) {
        $canRecord = [
            'recordCount' => $totalRows,
            'isMorning' => true,
            'isAfternoon' => false,
            'canRecord' => false,
            'buttonShow' => false,
            'message' => "Please wait until 12PM to record your second mood and stress status!"
        ];
    } elseif ($currentTime >= AFTERNOON_START && $currentTime <= AFTERNOON_END) {
        if ($periodRecord >= AFTERNOON_START && $periodRecord <= AFTERNOON_END) {
            $canRecord = [
                'recordCount' => $totalRows,
                'isMorning' => false,
                'isAfternoon' => false,
                'canRecord' => false,
                'buttonShow' => false,
                'message' => "Great! You have completed mood record for afternoon."
            ];
        } else {
            $canRecord = [
                'recordCount' => $totalRows,
                'isMorning' => false,
                'isAfternoon' => true,
                'canRecord' => true,
                'buttonShow' => true,
                'message' => "You still have 1 mood record left haven't completed."
            ];
        }
        
    }  
} else {
    $canRecord = [
        'recordCount' => $totalRows,
        'isMorning' => false,
        'isAfternoon' => false,
        'canRecord' => false,
        'buttonShow' => false,
        'message' => "Great! You have completed all the mood record today :)"
    ];
}

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
    
    $datetime = $row['datetimeRecord'];
    $timeOnly = date('H:i:s', strtotime($datetime));

    $period = null;

    if ($timeOnly >= MORNING_START && $timeOnly <= MORNING_END) {
        $period = "morning";
    } elseif ($timeOnly >= AFTERNOON_START && $timeOnly <= AFTERNOON_END) {
        $period = "afternoon";
    }

    $moodRecordTime[] = [
        "datetime" => $datetime,
        "period" => $period
    ];
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
            "moodRecordTime" => $moodRecordTime ?? null,
            "moodStoreLocation" => $moodStoreLocation ?? null,
            "stressLevel" => $stressData['stressLevel'] ?? "N/A",
            // "stressLevel" => $stressData['stressLevel'] != 0 ? $stressData['stressLevel'] : "N/A",
            "moodRecordCount" => $totalRows ?? 0,
            "recordAvailability" => $canRecord ?? null,

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
        "moodRecordTime" => null,
        "moodStoreLocation" => null,
        "stressLevel" => "N/A",
        "moodRecordCount" => 0,
        "message" => "No mood record for today",
        "recordAvailability" => $canRecord ?? null,

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
        "recordAvailability" => $canRecord ?? null,
        "weeklyMoodCount" => $moodCount
    ]);
}
?>
