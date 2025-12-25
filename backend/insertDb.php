<?php 

    require "database.php";

    $no = "D032310322";
    $name = "CHONG PUI YI";
    $email = "chongpuiyi@student.utem.edu.my";
    $contact = "0124568542";
    $faculty = "FTMK";

    // $office = "1st FLOOR K03";
    // $role = "PENASIHAT AKADEMIK";
    $password = '1234';
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // $stmtInsert = $conn->prepare("INSERT INTO staff (staffNo, staffName, staffEmail, staffContact, staffFaculty, staffOffice, staffRole, staffPassword) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    // $stmtInsert->bind_param("ssssssss", $no, $name, $email, $contact, $faculty, $office, $role, $hashedPassword);

    // if ($stmtInsert->execute()) {
    //     echo "Staff Account Created Successfully!";
    //     // echo "<meta http-equiv='refresh' content='3; URL=../login.php'>";
    // } else {
    //     echo "Fail to Create Account! Please Try Again...";
    //     // echo "<meta http-equiv='refresh' content='3; URL=../signup.html'>";
    // }
    // $stmtInsert->close();

    $course = "DIPLOMA IN COMPUTER SCIENCE";
    $yearOfStudy = 3;
    $section = "SECTION 2";
    $group = "GROUP 2";
    $staffId = 5;

    // $stmtInsert = $conn->prepare("INSERT INTO student (matricNo, studentName, studentEmail, studentContact, studentFaculty, studentYearOfStudy, studentSection, studentGrp, studentPassword, staffId, studentCourse) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    // $stmtInsert->bind_param("sssssisssss", $no, $name, $email, $contact, $faculty, $yearOfStudy, $section, $group, $hashedPassword, $staffId, $course);

    // if ($stmtInsert->execute()) {
    //     echo "Student Account Created Successfully!";
    //     // echo "<meta http-equiv='refresh' content='3; URL=../login.php'>";
    // } else {
    //     echo "Fail to Create Account! Please Try Again...";
    //     // echo "<meta http-equiv='refresh' content='3; URL=../signup.html'>";
    // }
    $stmtInsert->close();

?>