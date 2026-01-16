<?php
// filterCounselling.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Content-Type: application/json");

require "../database.php";
require "authPa.php";

$user = validateToken($conn);
$staffId = $user['staffId'];

// Get filter parameters from URL
$sortPName = isset($_GET['sortPName']) ? trim($_GET['sortPName']) : '';
$sortSName = isset($_GET['sortSName']) ? trim($_GET['sortSName']) : '';
$sortRLevel = isset($_GET['sortRLevel']) ? trim($_GET['sortRLevel']) : '';
$sortFaculty = isset($_GET['sortFaculty']) ? trim($_GET['sortFaculty']) : '';

// Start building the query
$sql = "
    SELECT cn.*, s.*, st.*
    FROM contactNote cn
    INNER JOIN student s ON cn.studentId = s.studentId
    INNER JOIN staff st ON cn.staffId = st.staffId
    WHERE cn.pushToCounsellor = 1
";

// Add faculty filter if provided
if (!empty($sortFaculty)) {
    $sql .= " AND st.staffFaculty = ?";
}

// Add trigger filter if provided (Mood & Stress vs DASS)
if (!empty($sortRLevel)) {
    if ($sortRLevel === 'mood') {
        // Mood & Stress (dassId is NULL)
        $sql .= " AND cn.dassId IS NULL";
    } else if ($sortRLevel === 'dass') {
        // DASS (dassId is NOT NULL)
        $sql .= " AND cn.dassId IS NOT NULL";
    }
}

// ✅ Build ORDER BY clause based on sorting options
$orderBy = [];

// Add PA name sorting if provided
if (!empty($sortPName)) {
    if ($sortPName === 'az') {
        $orderBy[] = "st.staffName ASC";
    } else if ($sortPName === 'za') {
        $orderBy[] = "st.staffName DESC";
    }
}

// Add Student name sorting if provided
if (!empty($sortSName)) {
    if ($sortSName === 'az') {
        $orderBy[] = "s.studentName ASC";
    } else if ($sortSName === 'za') {
        $orderBy[] = "s.studentName DESC";
    }
}

// Apply ORDER BY or use default
if (!empty($orderBy)) {
    $sql .= " ORDER BY " . implode(", ", $orderBy);
} else {
    // Default sorting by push datetime if no sorting selected
    $sql .= " ORDER BY cn.pushDatetime DESC";
}

// Prepare statement
$stmt = $conn->prepare($sql);

// Bind parameters if faculty filter is used
if (!empty($sortFaculty)) {
    $stmt->bind_param("s", $sortFaculty);
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
        ],
        'studentData' => [
            'studentId' => $row['studentId'],
            'studentName' => $row['studentName'],
        ],
        'paData' => [
            'staffId' => $row['staffId'],
            'staffName' => $row['staffName'],
            'staffEmail' => $row['staffEmail'],
            'staffFaculty' => $row['staffFaculty'],
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
    "allPADetails" => $pushedDetails
]);
?>