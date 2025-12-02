<?php
// ✅ CORS headers — put at the top
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// For local API testing
$data = json_decode(file_get_contents("php://input"), true);

// $email = $data["email"] ?? null;
// $password = $data["password"] ?? null;

// For actual login

require "../database.php";

$email = $_POST["email"];
$password = $_POST["password"];

$type = "";     // <--- you still have type variable
$user = null;   // store user data

/* -------------------------------------------
   1️⃣ CHECK STAFF TABLE
------------------------------------------- */
$stmt = $conn->prepare("SELECT * FROM staff WHERE staffEmail=? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $type = "staff"; // <--- assign after checking
}

/* -------------------------------------------
   2️⃣ IF NOT STAFF → CHECK STUDENT TABLE
------------------------------------------- */
if ($type === "") {
    $stmt = $conn->prepare("SELECT * FROM student WHERE studentEmail=? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $type = "student"; // <--- assign here
    }
}

/* -------------------------------------------
   3️⃣ IF NO USER FOUND
------------------------------------------- */
if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found due to wrong email!"]);
    exit;
}

/* -------------------------------------------
   4️⃣ PASSWORD CHECK
------------------------------------------- */
$storedPassword = ($type === "staff")
    ? $user["staffPassword"]
    : $user["studentPassword"];

if (!password_verify($password, $storedPassword)) {
    echo json_encode(["success" => false, "message" => "Wrong password.. Please try again!"]);
    exit;
}

/* -------------------------------------------
   5️⃣ GENERATE TOKEN
------------------------------------------- */
$token = bin2hex(random_bytes(32));

/* -------------------------------------------
   6️⃣ SAVE TOKEN BASED ON TYPE
------------------------------------------- */
if ($type === "staff") {
    $stmt = $conn->prepare("UPDATE staff SET loginToken=? WHERE staffId=?");
    $stmt->bind_param("si", $token, $user["staffId"]);
} else {
    $stmt = $conn->prepare("UPDATE student SET loginToken=? WHERE studentId=?");
    $stmt->bind_param("si", $token, $user["studentId"]);
}

$stmt->execute();

/* -------------------------------------------
   7️⃣ RESPONSE
------------------------------------------- */
echo json_encode([
    "success" => true,
    "message" => "Login success",
    "token" => $token,
    "type" => $type, // <--- staff or student
    "userId" => ($type === "staff") ? $user["staffId"] : $user["studentId"]
]);


?>
