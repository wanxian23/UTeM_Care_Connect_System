<?php 

    require "database.php";

    // Shared between all staff (PA & Counsellor) and Student
    $no = "C032310001";
    $name = "CHANG YEE QI";
    $email = "changyeeqi@utem.edu.my";
    $contact = "0162487513";
    $faculty = "HEPA";
    $password = '1234';
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Staff Only (PA & Counsellor)
    // Comment code below if you want to add for student only
    $office = "Aras 1, Pusat Persatuan Pelajar (PPP)";
    $role = "PEGAWAI PSIKOLOGI";

    // Student Only
    // Comment code below if you want to add for staff only
    $course = "DIPLOMA IN COMPUTER SCIENCE";
    $yearOfStudy = 3;
    $section = "SECTION 2";
    $group = "GROUP 2";
    $staffId = 5;

    
    // Staff only
    // Uncomment code below if you want to add for staff
    // $stmtInsert = $conn->prepare("INSERT INTO staff (staffNo, staffName, staffEmail, staffContact, staffFaculty, staffOffice, staffRole, staffPassword) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    // $stmtInsert->bind_param("ssssssss", $no, $name, $email, $contact, $faculty, $office, $role, $hashedPassword);

    // Student only
    // Uncomment code below if you want to add for student
    // $stmtInsert = $conn->prepare("INSERT INTO student (matricNo, studentName, studentEmail, studentContact, studentFaculty, studentYearOfStudy, studentSection, studentGrp, studentPassword, staffId, studentCourse) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    // $stmtInsert->bind_param("sssssisssss", $no, $name, $email, $contact, $faculty, $yearOfStudy, $section, $group, $hashedPassword, $staffId, $course);


    // Uncomment code below to run the sql code into database
    // if ($stmtInsert->execute()) {
    //     echo "Student Account Created Successfully!";
    // } else {
    //     echo "Fail to Create Account! Please Try Again...";
    // }

    $stmtInsert->close();

?>