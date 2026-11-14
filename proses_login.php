<?php
include 'koneksi.php';

$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    $name = mysqli_real_escape_string($conn, $data['name']);
    $role = mysqli_real_escape_string($conn, $data['role']);
    $pasukan = mysqli_real_escape_string($conn, $data['pasukan']);

    $idNum = strtoupper(substr($role, 0, 3)) . '-' . rand(100, 999);
    $avatar = strtoupper(substr($name, 0, 2));

    $checkQuery = "SELECT * FROM users WHERE name = '$name' AND role = '$role'";
    $result = mysqli_query($conn, $checkQuery);

    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        echo json_encode(["status" => "success", "user_id" => $user['id'], "message" => "Login berhasil!"]);
    } else {
        $insertQuery = "INSERT INTO users (name, role, pasukan, id_num, avatar) VALUES ('$name', '$role', '$pasukan', '$idNum', '$avatar')";
        if (mysqli_query($conn, $insertQuery)) {
            $newUserId = mysqli_insert_id($conn);
            echo json_encode(["status" => "success", "user_id" => $newUserId, "message" => "Akun baru terdaftar di database!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Gagal mendaftarkan user: " . mysqli_error($conn)]);
        }
    }
} else {
    echo json_encode(["status" => "error", "message" => "Data tidak valid!"]);
}
?>
