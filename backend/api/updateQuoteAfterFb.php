<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require "../database.php";

    // $studentId = 1;
    $studentId = $_GET['studentId'];

    // Get today's mood with priority
    $stmtCheckMood = $conn->prepare("
        SELECT mt.*, m.moodStatus, m.moodStoreLocation, m.priority
        FROM moodTracking mt
        JOIN mood m ON mt.moodTypeId = m.moodTypeId
        WHERE mt.studentId = ? AND DATE(mt.datetimeRecord) = CURDATE()
        ORDER BY priority ASC
        LIMIT 1
    ");
    $stmtCheckMood->bind_param("i", $studentId);
    $stmtCheckMood->execute();
    $resultCheckMood = $stmtCheckMood->get_result();
    $checkMoodData = $resultCheckMood->fetch_assoc();

    $priority = $checkMoodData['priority'];
    $quoteTypes = [];
    
    switch ($priority) {
        case 1: // Crying
            $quoteTypes = ["Calm", "Positive"];
            break;
        case 2: // Sad
            $quoteTypes = ["Calm", "Positive"];
            break;
        case 3: // Angry
            $quoteTypes = ["Calm", "Motivation"];
            break;
        case 4: // Anxious
            $quoteTypes = ["Calm", "Positive"];
            break;
        case 5: // Annoying
            $quoteTypes = ["Motivation", "Game"];
            break;
        case 6: // Neutral
            $quoteTypes = ["Calm", "Positive"];
            break;
        case 7: // Happy
            $quoteTypes = ["Calm", "Positive"];
            break;
        case 8: // Excited
            $quoteTypes = ["Motivation", "Positive"];
            break;
        default:
            $quoteTypes = ["Positive"];
    }

    // Get all recommendations matching these quote types
    $placeholders = implode(',', array_fill(0, count($quoteTypes), '?'));
    $stmtRecommend = $conn->prepare("
        SELECT recommendId 
        FROM recommendation
        WHERE type IN ($placeholders)
    ");
    $types = str_repeat('s', count($quoteTypes));
    $stmtRecommend->bind_param($types, ...$quoteTypes);
    $stmtRecommend->execute();
    $resultRecommend = $stmtRecommend->get_result();
    $availableRecommendIds = [];
    
    while ($row = $resultRecommend->fetch_assoc()) {
        $availableRecommendIds[] = $row['recommendId'];
    }

    $attempts = 0;
    $maxAttempts = 20;
    $selectedRecommendId = null;

    // Try to find a useful recommendation
    while ($attempts < $maxAttempts) {
        // Pick random recommendation from available ones
        $randomIndex = array_rand($availableRecommendIds);
        $randomRecommendId = $availableRecommendIds[$randomIndex];

        // Check if this student has feedback for this recommendation
        $stmtCheckFeedback = $conn->prepare("
            SELECT fbUsefulness 
            FROM recommendationDisplay 
            WHERE recommendId = ? AND studentId = ?
        ");
        $stmtCheckFeedback->bind_param("ii", $randomRecommendId, $studentId);
        $stmtCheckFeedback->execute();
        $resultCheckFeedback = $stmtCheckFeedback->get_result();
        $feedbackData = $resultCheckFeedback->fetch_assoc();

        // If no feedback yet (never shown) OR feedback is good (1) or neutral (3)
        if (!$feedbackData || $feedbackData['fbUsefulness'] != 0) {
            $selectedRecommendId = $randomRecommendId;
            break;
        }

        $attempts++;
    }

    // If all 20 attempts failed (all have bad feedback), reset all feedback for this student
    if ($attempts === $maxAttempts) {
        $stmtResetFeedback = $conn->prepare("
            UPDATE recommendationDisplay 
            SET fbUsefulness = 3 
            WHERE studentId = ?
        ");
        $stmtResetFeedback->bind_param("i", $studentId);
        $stmtResetFeedback->execute();

        // Pick a random one after reset
        $randomIndex = array_rand($availableRecommendIds);
        $selectedRecommendId = $availableRecommendIds[$randomIndex];
    }

    // Insert/update the selected recommendation for display
    $stmtInsertDisplay = $conn->prepare("
        INSERT INTO recommendationDisplay (recommendId, studentId, displayCount, fbUsefulness) 
        VALUES (?, ?, 1, 3)
        ON DUPLICATE KEY UPDATE displayCount = displayCount + 1
    ");
    $stmtInsertDisplay->bind_param("ii", $selectedRecommendId, $studentId);
    $stmtInsertDisplay->execute();

    echo "Student $studentId: Assigned recommendation $selectedRecommendId\n";

echo "Done!";
?>