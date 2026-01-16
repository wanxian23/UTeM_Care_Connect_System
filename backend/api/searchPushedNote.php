<?php
// searchPushedNote.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Content-Type: application/json");

require "../database.php";
require "authPa.php";

$user = validateToken($conn);
$staffId = $user['staffId'];

$query = isset($_GET['query']) ? trim($_GET['query']) : '';

// If query is empty, return all pushed notes
if (empty($query)) {
    // Redirect to the main endpoint or return all data
    $sql = "
        SELECT cn.*, s.*, st.*
        FROM contactNote cn
        INNER JOIN student s ON cn.studentId = s.studentId
        INNER JOIN staff st ON cn.staffId = st.staffId
        WHERE cn.pushToCounsellor = 1
        ORDER BY cn.pushDatetime DESC
    ";
    $stmt = $conn->prepare($sql);
} else {
    // Search by student name, matric number, or PA name
    $searchTerm = "%{$query}%";
    
    $sql = "
        SELECT cn.*, s.*, st.*
        FROM contactNote cn
        INNER JOIN student s ON cn.studentId = s.studentId
        INNER JOIN staff st ON cn.staffId = st.staffId
        WHERE cn.pushToCounsellor = 1
        AND (
            s.studentName LIKE ? 
            OR st.staffName LIKE ?
        )
        ORDER BY cn.pushDatetime DESC
    ";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $searchTerm, $searchTerm);
}

$stmt->execute();
$result = $stmt->get_result();

$totalPushedNote = 0;
$totalMoodAlert = 0;
$totalDASSAlert = 0;
$pushedDetails = [];

while ($row = $result->fetch_assoc()) {
    $totalPushedNote++;
    
    if (empty($row['dassId'])) {
        $totalMoodAlert++;
    } else {
        $totalDASSAlert++;
    }

    $pushedDetails[] = [
        'noteData' => [
            'contactId' => $row['contactId'],
            'studentId' => $row['studentId'],
            'staffId' => $row['staffId'],
            'dassId' => $row['dassId'],
            'pushToCounsellor' => $row['pushToCounsellor'],
            'pushDatetime' => $row['pushDatetime'],
            'datetimeRecord' => $row['datetimeRecord'],
            // Add other contactNote fields as needed
        ],
        'studentData' => [
            'studentId' => $row['studentId'],
            'studentName' => $row['studentName'],
            // Add other student fields
        ],
        'paData' => [
            'staffId' => $row['staffId'],
            'staffName' => $row['staffName'],
            'staffEmail' => $row['staffEmail'],
            'staffFaculty' => $row['staffFaculty'],
            // Add other staff fields
        ]
    ];
}

$dashboardDetails = [
    'totalAlert' => $totalPushedNote,
    'totalMoodAlert' => $totalMoodAlert,
    'totalDASSAlert' => $totalDASSAlert
];

echo json_encode([
    "success" => true,
    'dashboardDetails' => $dashboardDetails,
    "pushedDetails" => $pushedDetails  // ← Note: React expects "allPADetails"
]);
?>