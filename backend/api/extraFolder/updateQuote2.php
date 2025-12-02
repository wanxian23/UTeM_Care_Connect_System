<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require "../database.php";

$stmtAllStudent = $conn->prepare("SELECT * FROM student");
$stmtAllStudent->execute();
$resultAllStudent = $stmtAllStudent->get_result();
$allStudent = $resultAllStudent->fetch_all(MYSQLI_ASSOC);

foreach ($allStudent as $eachStudent) {
    $studentId = $eachStudent['studentId'];

    // Get random number between 1 to 40
    $randomNumber = 0;
    $count = 0;
    $stmtRecommendationChecking = $conn->prepare("
        SELECT * FROM recommendationDisplay 
        WHERE studentId = ? AND recommendId = ?
    ");
    $stmtRecommendationChecking->bind_param("ii", $studentId, $randomNumber);

    do {
        $randomNumber = mt_rand(1, 40);
        echo $randomNumber;

        $stmtRecommendationChecking = $conn->prepare("SELECT * FROM recommendationDisplay WHERE recommendId = ?");
        $stmtRecommendationChecking->bind_param("i", $randomNumber);
        $stmtRecommendationChecking->execute();
        $resultRecommendationChecking = $stmtRecommendationChecking->get_result();
        $recommendationChecking = $resultRecommendationChecking->fetch_assoc();

        ++$count;
    }
    while (!empty($recommendationChecking) && $recommendationChecking['displayCount'] == 1 && $count < 40);

    if ($count === 40) {
        $stmtResetRecommendation = $conn->prepare("UPDATE recommendationDisplay SET displayCount = 0 WHERE studentId = ?");
        $stmtResetRecommendation->bind_param("i", $studentId);
        $stmtResetRecommendation->execute();

        $randomNumber = mt_rand(1, 40);
        echo $randomNumber;

        $stmtRecommendationChecking = $conn->prepare("SELECT * FROM recommendationDisplay WHERE recommendId = ?");
        $stmtRecommendationChecking->bind_param("i", $randomNumber);
        $stmtRecommendationChecking->execute();
        $resultRecommendationChecking = $stmtRecommendationChecking->get_result();
        $recommendationChecking = $resultRecommendationChecking->fetch_assoc();
    }

    // If student doesnt exist then = 1, if existed then + 1
    $stmtUpdateRecommendation = $conn->prepare("
        INSERT INTO recommendationDisplay (recommendId, studentId, displayCount) 
        VALUES (?, ?, 1) 
        ON DUPLICATE KEY UPDATE displayCount = displayCount + 1
    ");
    $stmtUpdateRecommendation->bind_param("ii", $randomNumber, $studentId);
    $stmtUpdateRecommendation->execute();
}

?>