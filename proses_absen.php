<?php
include 'koneksi.php';

// Menerima data JSON dari JavaScript
$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    $userId = mysqli_real_escape_string($conn, $data['user_id']);
    $activityType = mysqli_real_escape_string($conn, $data['activity_type']);
    $status = mysqli_real_escape_string($conn, $data['status']);
    $time = mysqli_real_escape_string($conn, $data['time']);
    $date = mysqli_real_escape_string($conn, $data['date']);
    $photoUrl = mysqli_real_escape_string($conn, $data['photo_url']);

    // Masukkan ke database
    $query = "INSERT INTO attendance (user_id, activity_type, status, attendance_time, attendance_date, photo_url) 
              VALUES ('$userId', '$activityType', '$status', '$time', '$date', '$photoUrl')";

    if (mysqli_query($conn, $query)) {
        echo json_encode(["status" => "success", "message" => "Absen berhasil disimpan ke database!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal menyimpan: " . mysqli_error($conn)]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Data tidak valid!"]);
}
?>