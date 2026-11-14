let currentUser = { id: null, name: "Kak Budi", role: "giat", pasukan: "1. Petugas Pemimpin Pengibaran" };
let mediaStream = null;

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white px-4 py-3 rounded-2xl shadow-xl text-sm font-bold`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function setLoginRole(role) {
    document.getElementById('login-role-input').value = role;
    document.getElementById('tab-role-giat').className = role === 'giat' ? "py-3 px-4 text-xs font-bold rounded-xl bg-white text-red-600 shadow-sm flex items-center justify-center gap-2" : "py-3 px-4 text-xs font-bold rounded-xl text-slate-600 flex items-center justify-center gap-2";
    document.getElementById('tab-role-dewan').className = role === 'dewan' ? "py-3 px-4 text-xs font-bold rounded-xl bg-white text-red-600 shadow-sm flex items-center justify-center gap-2" : "py-3 px-4 text-xs font-bold rounded-xl text-slate-600 flex items-center justify-center gap-2";
}

function handleLogin(e) {
    e.preventDefault();
    const role = document.getElementById('login-role-input').value;
    const name = document.getElementById('login-username').value.trim();
    const pasukan = document.getElementById('login-class').value;

    fetch('proses_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, role: role, pasukan: pasukan })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            currentUser.id = data.user_id;
            currentUser.name = name;
            currentUser.role = role;
            currentUser.pasukan = pasukan;

            document.getElementById('view-login').classList.add('hidden');
            document.getElementById('app-navbar').classList.remove('hidden');

            if(role === 'dewan') {
                document.getElementById('view-dashboard-dewan').classList.remove('hidden');
            } else {
                document.getElementById('view-dashboard-giat').classList.remove('hidden');
            }
            showToast("Berhasil masuk sebagai " + name);
        } else {
            showToast("Gagal login: " + data.message, "error");
        }
    });
}

function logout() {
    location.reload();
}

function openAttendanceModal() {
    document.getElementById('modal-camera').classList.remove('hidden');
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        mediaStream = stream;
        document.getElementById('webcam-video').srcObject = stream;
    }).catch(err => console.log("Kamera simulasi aktif"));
}

function closeCameraModal() {
    document.getElementById('modal-camera').classList.add('hidden');
    if(mediaStream) mediaStream.getTracks().forEach(t => t.stop());
}

function captureAndSubmitAttendance() {
    const now = new Date();
    const payload = {
        user_id: currentUser.id,
        activity_type: "Absen Hadir Pengibaran",
        status: "Hadir",
        time: `${now.getHours()}:${now.getMinutes()} WIB`,
        date: "Jumat, 14 Nov 2026",
        photo_url: "https://placehold.co/400x300/dc2626/ffffff?text=Absen+" + encodeURIComponent(currentUser.name)
    };

    fetch('proses_absen.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            showToast("Absen berhasil disimpan ke database!");
        } else {
            showToast("Gagal menyimpan absen", "error");
        }
    });

    closeCameraModal();
}
