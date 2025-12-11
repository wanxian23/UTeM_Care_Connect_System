<?php

require "../database.php";

// Get mood data of all students
$stmtGetStudentMoodData = $conn->prepare("
    SELECT * 
    FROM student 
");
$stmtGetStudentMoodData->execute();
$resultGetStudentMoodData = $stmtGetStudentMoodData->get_result();
$getStudentMoodData = $resultGetStudentMoodData->fetch_all(MYSQLI_ASSOC);

// Content of each notification
$title = "Daily Mood Record Time!";
$description1 = "Good morning! Take a moment to record your mood and set the tone for today.";
$description2 = "How was your day? Update your mood to reflect how you’re feeling now.";
$type = "mood";

foreach ($getStudentMoodData as $row) {
    $studentId = $row['studentId'];

    $stmtCheckMoodRecord = $conn->prepare("
        SELECT * 
        FROM moodTracking 
        WHERE studentId = ?
        AND DATE(datetimeRecord) = CURDATE()
    ");
    $stmtCheckMoodRecord->bind_param("i", $studentId);
    $stmtCheckMoodRecord->execute();
    $resultCheckMoodRecord = $stmtCheckMoodRecord->get_result();

    if ($resultCheckMoodRecord->num_rows == 1) {
        $stmtRecordMoodReminder = $conn->prepare("INSERT INTO notification(title, description, location, notiType, studentId, purpose)
                        VALUES(?, ?, '/MoodRecord', ?, ?, 'test')");
        $stmtRecordMoodReminder->bind_param("sssi", $title, $description2, $type, $studentId);
        $stmtRecordMoodReminder->execute();

        echo "<br>Mood Reminder For Afternoon Successfully Created For Student" . $studentId . "!";
    } else if ($resultCheckMoodRecord->num_rows == 0) {
        $stmtRecordMoodReminder = $conn->prepare("INSERT INTO notification(title, description, location, notiType, studentId, purpose)
                        VALUES(?, ?, '/MoodRecord', ?, ?, 'test')");
        $stmtRecordMoodReminder->bind_param("sssi", $title, $description1, $type, $studentId);
        $stmtRecordMoodReminder->execute();

        echo "<br>Mood Reminder For Morning Successfully Created For Student" . $studentId . "!";
    } else {
        echo "<br>No Mood Reminder Needed For Student" . $studentId . " Today!";
    }
}

?>
