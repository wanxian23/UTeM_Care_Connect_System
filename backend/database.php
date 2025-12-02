<?php

$server = "localhost";
$root = "cwx";
$password = "1234";
$tableDB = "utem_care_connect";

$conn = new mysqli($server, $root, $password, $tableDB);

if ($conn->connect_error) {
    echo "Database Connection Failed!";
} else {
    // echo "Database Connected Successfully!";
}
?>