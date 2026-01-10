<?php
// ✅ CORS headers — put at the top
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "../database.php";
require "authStudent.php";

$user = validateToken($conn);
$token = $user['loginToken'];
$studentId = $user['studentId'];

// ============= CONFIGURATION =============
date_default_timezone_set("Asia/Kuala_Lumpur");

// ============= TESTING CONFIGURATION =============
// Set to true when testing, false in production
define('ENABLE_TIME_TESTING', false);
define('ENABLE_TIME_TESTING2', false); // Test for first recorded (Mainly test for morning)
// Manually set test time (HH:MM:SS) — ONLY used when ENABLE_TIME_TESTING = true
define('TEST_TIME', '07:30:00'); 
define('TEST_TIME2', '07:30:00'); // Test for first recorded (Mainly test for morning)

// ============= ACTUAL CONFIGURATION =============
// Define time windows for mood recording
define('MORNING_START', '06:00:00');  // 6:00 AM
define('MORNING_END', '11:59:59');    // 11:59 AM
define('AFTERNOON_START', '12:00:00'); // 12:00 PM
define('AFTERNOON_END', '23:59:59');   // 11:59 PM

// Define time window for stress recording (after second mood)
define('STRESS_START', '12:00:00');    // 6:00 PM
define('STRESS_END', '23:59:59');      // 11:59 PM

// Get current time
$currentTime = ENABLE_TIME_TESTING ? TEST_TIME : date('H:i:s');
$currentDateTime = new DateTime();

// ============= CHECK EXISTING RECORDS =============

// Check stress record for today
$stmtCheckStress = $conn->prepare("
    SELECT * FROM stress WHERE studentId = ? AND DATE(datetimeRecord) = CURDATE()
");
$stmtCheckStress->bind_param("i", $studentId);
$stmtCheckStress->execute();
$resultCheckStress = $stmtCheckStress->get_result();
$stressData = null;
$stressRecord = false;
if ($resultCheckStress->num_rows > 0) {
    $stressRecord = true;
    $stressData = $resultCheckStress->fetch_assoc();
}

// Get all mood records for today with their timestamps
$stmtCheckMoodData = $conn->prepare("
    SELECT mt.*, m.category 
    FROM moodTracking mt
    LEFT JOIN mood m ON mt.moodTypeId = m.moodTypeId
    WHERE mt.studentId = ? 
    AND DATE(mt.datetimeRecord) = CURDATE()
    ORDER BY mt.datetimeRecord ASC
");
$stmtCheckMoodData->bind_param("i", $studentId);
$stmtCheckMoodData->execute();
$resultCheckMoodData = $stmtCheckMoodData->get_result();
$moodRecords = $resultCheckMoodData->fetch_all(MYSQLI_ASSOC);
$moodRecordCount = count($moodRecords);

// ============= DETERMINE RECORDING STATUS =============

$canRecordMood = false;
$canRecordStress = false;
$recordingPeriod = null; // 'morning', 'afternoon', or null
$nextAvailableTime = null;
$message = "";
$statusType = ""; // 'waiting', 'available', 'completed'

// Check which time window we're in
$inMorningWindow = ($currentTime >= MORNING_START && $currentTime <= MORNING_END);
$inAfternoonWindow = ($currentTime >= AFTERNOON_START && $currentTime <= AFTERNOON_END);
$inStressWindow = ($currentTime >= STRESS_START && $currentTime <= STRESS_END);

if ($moodRecordCount == 0) {
    // No records yet
    if ($inMorningWindow) {
        $canRecordMood = true;
        $recordingPeriod = 'morning';
        $message = "Good morning! Record your morning mood.";
        $statusType = "available";
    } elseif ($inAfternoonWindow) {
        $canRecordMood = true;
        $recordingPeriod = 'afternoon';
        $message = "Good afternoon! Record your afternoon mood.";
        $statusType = "available";
    } else {
        // Before morning window
        $canRecordMood = false;
        $message = "Morning mood recording starts at " . date('g:i A', strtotime(MORNING_START));
        $statusType = "waiting";
        $nextAvailableTime = MORNING_START;
    }
    
} elseif ($moodRecordCount == 1) {
    // One record exists - check if we can record second one
    $firstRecordTime = ENABLE_TIME_TESTING2 ? new DateTime(TEST_TIME2) : new DateTime($moodRecords[0]['datetimeRecord']);
    $firstRecordHour = $firstRecordTime->format('H:i:s');
    
    // Determine if first record was morning or afternoon
    $firstWasMorning = ($firstRecordHour >= MORNING_START && $firstRecordHour <= MORNING_END);
    
    if ($firstWasMorning) {
        // First record was in morning, can only record afternoon now
        if ($inAfternoonWindow) {
            $canRecordMood = true;
            $recordingPeriod = 'afternoon';
            $message = "Good afternoon! Record your afternoon mood.";
            $statusType = "available";
        } else {
            // Still in morning or late night
            $canRecordMood = false;
            $message = "Afternoon mood recording starts at " . date('g:i A', strtotime(AFTERNOON_START));
            $statusType = "waiting";
            $nextAvailableTime = AFTERNOON_START;
        }
    } else {
        // First record was in afternoon (edge case: recorded afternoon without morning)
        if ($inMorningWindow) {
            // User can record morning mood even if they already recorded afternoon
            $canRecordMood = true;
            $recordingPeriod = 'morning';
            $message = "Good morning! Record your morning mood.";
            $statusType = "available";
        } else {
            $canRecordMood = false;
            $message = "You've completed your mood recordings for afternoon!";
            $statusType = "completed";
        }
    }
    
} else {
    // Two or more records - no more mood recording
    $canRecordMood = false;
    $message = "You've completed your mood recordings for today!";
    $statusType = "completed";
}

// ============= CHECK STRESS RECORDING AVAILABILITY =============

if (!$stressRecord && $inStressWindow) {
    $canRecordStress = true;
} else {
    $canRecordStress = false;
}

// ============= PREPARE RESPONSE =============

$response = [
    "success" => true,
    "canRecordMood" => $canRecordMood,
    "canRecordStress" => $canRecordStress,
    "recordingPeriod" => $recordingPeriod,
    "message" => $message,
    "statusType" => $statusType,
    
    // Recording counts
    "moodRecordCount" => $moodRecordCount,
    "maxMoodRecords" => 2,
    "stressRecorded" => $stressRecord,
    
    // Time window information
    "timeWindows" => [
        "morning" => [
            "start" => date('g:i A', strtotime(MORNING_START)),
            "end" => date('g:i A', strtotime(MORNING_END)),
            "active" => $inMorningWindow
        ],
        "afternoon" => [
            "start" => date('g:i A', strtotime(AFTERNOON_START)),
            "end" => date('g:i A', strtotime(AFTERNOON_END)),
            "active" => $inAfternoonWindow
        ],
        "stress" => [
            "start" => date('g:i A', strtotime(STRESS_START)),
            "end" => date('g:i A', strtotime(STRESS_END)),
            "active" => $inStressWindow
        ]
    ],
    
    // Next available time
    "nextAvailableTime" => $nextAvailableTime ? date('g:i A', strtotime($nextAvailableTime)) : null,
    
    // Current time for debugging
    "currentTime" => date('g:i A', strtotime($currentTime)),
    
    // Existing records
    "moodRecords" => $moodRecords,
    "stressData" => $stressData,
    
    // Completion status
    "finishRecord" => ($moodRecordCount >= 2 && $stressRecord),
    
    // Detailed status messages
    "detailedStatus" => [
        "mood" => getMoodStatus($moodRecordCount, $canRecordMood, $recordingPeriod, $nextAvailableTime),
        "stress" => getStressStatus($stressRecord, $canRecordStress, $moodRecordCount, $inStressWindow, $nextAvailableTime)
    ]
];

echo json_encode($response);

// ============= HELPER FUNCTIONS =============

function getMoodStatus($count, $canRecord, $period, $nextTime) {
    if ($count >= 2) {
        return [
            "status" => "completed",
            "message" => "Both morning and afternoon moods recorded ✓",
            "progress" => "2/2"
        ];
    } elseif ($count == 1) {
        if ($canRecord) {
            return [
                "status" => "available",
                "message" => "Ready to record your " . $period . " mood",
                "progress" => "1/2"
            ];
        } else {
            return [
                "status" => "waiting",
                "message" => "Waiting for " . ($nextTime ? date('g:i A', strtotime($nextTime)) : "afternoon") . " to record second mood",
                "progress" => "1/2"
            ];
        }
    } else {
        if ($canRecord) {
            return [
                "status" => "available",
                "message" => "Ready to record your " . $period . " mood",
                "progress" => "0/2"
            ];
        } else {
            return [
                "status" => "waiting",
                "message" => "Waiting for " . ($nextTime ? date('g:i A', strtotime($nextTime)) : "recording time"),
                "progress" => "0/2"
            ];
        }
    }
}

function getStressStatus($recorded, $canRecord, $moodCount, $inWindow, $nextTime) {
    if ($recorded) {
        return [
            "status" => "completed",
            "message" => "Stress level recorded for today ✓",
            "available" => false
        ];
    }

    if ($canRecord) {
        return [
            "status" => "available",
            "message" => "Ready to record your stress level",
            "available" => true
        ];
    }

    return [
        "status" => "waiting",
        "message" => "Stress recording available at " . date('g:i A', strtotime(STRESS_START)),
        "available" => false
    ];
}



?>