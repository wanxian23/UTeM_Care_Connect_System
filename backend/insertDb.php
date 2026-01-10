<?php 

    require "database.php";

    $no = "C032310001";
    $name = "CHANG YEE QI";
    $email = "changyeeqi@utem.edu.my";
    $contact = "0162487513";
    $faculty = "HEPA";

    $office = "Aras 1, Pusat Persatuan Pelajar (PPP)";
    $role = "PEGAWAI PSIKOLOGI";
    $password = '1234';
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // $stmtInsert = $conn->prepare("INSERT INTO staff (staffNo, staffName, staffEmail, staffContact, staffFaculty, staffOffice, staffRole, staffPassword) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    // $stmtInsert->bind_param("ssssssss", $no, $name, $email, $contact, $faculty, $office, $role, $hashedPassword);

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