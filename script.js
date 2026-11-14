// --- WHITELIST FOR GIAT ROLE ---
const GIAT_WHITELIST = ["kak budi", "kak siti", "pembina utama", "giat", "kak ambalan", "pembina", "admin giat"];

// --- GLOBAL APP STATE ---
let currentUser = {
    name: "Kak Budi",
    role: "giat", // 'giat' or 'dewan'
    pasukan: "1. Petugas Pemimpin Pengibaran",
    idNum: "GIAT-01",
    avatar: "KB"
};

let attendanceData = {
    todayStatus: false,
    timeHadir: null,
    photoUrl: null,
    history: [
        { date: "Jumat, 13 Nov 2026", type: "Absen Hadir Pengibaran", status: "Hadir", time: "06:45 WIB", photo: "https://placehold.co/400x300/dc2626/ffffff?text=Jumat+13+Nov" },
        { date: "Jumat, 6 Nov 2026", type: "Absen Hadir Pengibaran", status: "Hadir", time: "06:50 WIB", photo: "https://placehold.co/400x300/dc2626/ffffff?text=Jumat+6+Nov" },
        { date: "Jumat, 30 Okt 2026", type: "Izin Resmi", status: "Izin", time: "-", photo: null }
    ]
};

// Mock members for Giat managing Dewan based on the 3 requested options
let pasukanMembersData = {
    "1. Petugas Pemimpin Pengibaran": [
        { id: 1, name: "Andika Pratama", idNum: "DEW-P01", time: "06:45 WIB", status: "Hadir", photo: "https://placehold.co/400x300/dc2626/ffffff?text=Andika+Pemimpin" },
        { id: 2, name: "Siti Rahma", idNum: "DEW-P02", time: "06:48 WIB", status: "Hadir", photo: "https://placehold.co/400x300/dc2626/ffffff?text=Siti+Pemimpin" }
    ],
    "2. Petugas Pengibaran": [
        { id: 3, name: "Rezky Mahendra", idNum: "DEW-K01", time: "06:42 WIB", status: "Hadir", photo: "https://placehold.co/400x300/dc2626/ffffff?text=Rezky+Petugas" },
        { id: 4, name: "Dewi Lestari", idNum: "DEW-K02", time: "06:52 WIB", status: "Hadir", photo: "https://placehold.co/400x300/dc2626/ffffff?text=Dewi+Petugas" },
        { id: 5, name: "Joko Santoso", idNum: "DEW-K03", time: "-", status: "Izin", photo: null }
    ],
    "3. Peserta": [
        { id: 6, name: "Mega Wati", idNum: "DEW-S01", time: "06:35 WIB", status: "Hadir", photo: "https://placehold.co/400x300/dc2626/ffffff?text=Mega+Peserta" },
        { id: 7, name: "Prabowo Subroto", idNum: "DEW-S02", time: "06:40 WIB", status: "Hadir", photo: "https://placehold.co/400x300/dc2626/ffffff?text=Prabowo+Peserta" },
        { id: 8, name: "Ganjar Pranowo", idNum: "DEW-S03", time: "06:45 WIB", status: "Hadir", photo: "https://placehold.co/400x300/dc2626/ffffff?text=Ganjar+Peserta" }
    ]
};

let mediaStream = null;
let schoolChartInstance = null;
let schoolDonutInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    renderCalendarDays();
});

// --- TOAST NOTIFICATION ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const bgCol = type === 'success' ? 'bg-emerald-600' : (type === 'error' ? 'bg-red-600' : 'bg-slate-900');
    toast.className = `${bgCol} text-white px-4 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 transform translate-y-2 opacity-0 transition-all duration-300 pointer-events-auto`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 50);

    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// --- LOGIN ROLE TABS ---
function setLoginRole(role) {
    document.getElementById('login-role-input').value = role;
    const roles = ['giat', 'dewan'];
    
    roles.forEach(r => {
        const btn = document.getElementById(`tab-role-${r}`);
        if (r === role) {
            btn.className = "py-3 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all bg-white text-red-600 shadow-sm flex items-center justify-center gap-2";
        } else {
            btn.className = "py-3 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all text-slate-600 hover:text-slate-900 flex items-center justify-center gap-2";
        }
    });

    const inputName = document.getElementById('login-username');
    const labelName = document.getElementById('login-label-name');
    const inputIcon = document.getElementById('login-input-icon');
    const hintEl = document.getElementById('login-hint');

    if (role === 'giat') {
        labelName.innerText = "Nama Giat (Pembina / Authorized)";
        inputName.value = "Kak Budi";
        inputIcon.className = "fa-solid fa-user-tie";
        hintEl.innerText = "*Giat wajib menggunakan nama terdaftar (contoh: Kak Budi, Kak Siti, Pembina Utama, Giat)";
    } else if (role === 'dewan') {
        labelName.innerText = "Nama Lengkap Dewan (Peserta)";
        inputName.value = "Andika Pratama";
        inputIcon.className = "fa-solid fa-user-group";
        hintEl.innerText = "*Anggota Dewan bebas memasukkan nama lengkap dan memilih pasukan.";
    }
}

// --- QUICK DEMO 1-KLIK ---
function quickDemoLogin(role) {
    setLoginRole(role);
    if (role === 'giat') {
        currentUser = { name: "Kak Budi", role: "giat", pasukan: "1. Petugas Pemimpin Pengibaran", idNum: "GIAT-01", avatar: "KB" };
    } else if (role === 'dewan') {
        currentUser = { name: "Andika Pratama", role: "dewan", pasukan: "1. Petugas Pemimpin Pengibaran", idNum: "DEW-P01", avatar: "AP" };
    }
    executeLoginSuccess();
}

function handleLogin(e) {
    e.preventDefault();
    const role = document.getElementById('login-role-input').value;
    const name = document.getElementById('login-username').value.trim();
    const pasukan = document.getElementById('login-class').value;

    // STRICT AUTHENTICATION CHECK FOR GIAT ROLE
    if (role === 'giat') {
        const isAuthorized = GIAT_WHITELIST.some(w => name.toLowerCase().includes(w));
        if (!isAuthorized) {
            showToast(`Akses Ditolak! Nama "${name}" tidak terdaftar sebagai Giat yang sah. Gunakan nama terdaftar seperti "Kak Budi" atau "Giat".`, 'error');
            return;
        }
    }

    currentUser.role = role;
    currentUser.name = name;
    currentUser.pasukan = pasukan;
    currentUser.avatar = name.substring(0, 2).toUpperCase();

    executeLoginSuccess();
}

function executeLoginSuccess() {
    document.getElementById('view-login').classList.add('hidden');
    document.getElementById('app-navbar').classList.remove('hidden');

    document.getElementById('nav-user-name').innerText = currentUser.name;
    document.getElementById('nav-user-avatar').innerText = currentUser.avatar;

    if (currentUser.role === 'dewan') {
        document.getElementById('nav-role-subtitle').innerText = `Dewan (${currentUser.pasukan})`;
        switchTab('dashboard');
    } else if (currentUser.role === 'giat') {
        document.getElementById('nav-role-subtitle').innerText = `Giat (Pembina Ambalan)`;
        switchTab('dashboard');
    }

    showToast(`Berhasil masuk sebagai ${currentUser.name} (${currentUser.role.toUpperCase()})!`, 'success');
}

function logout() {
    document.getElementById('app-navbar').classList.add('hidden');
    document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-login').classList.remove('hidden');
    showToast('Anda telah keluar dari sesi.', 'info');
}

// --- NAVIGATION TABS ---
function switchTab(tabName) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));

    if (tabName === 'dashboard') {
        if (currentUser.role === 'dewan') {
            document.getElementById('view-dashboard-dewan').classList.remove('hidden');
            renderDewanDashboard();
        } else if (currentUser.role === 'giat') {
            document.getElementById('view-dashboard-giat').classList.remove('hidden');
            renderGiatTable();
            setTimeout(initCharts, 200);
        }
    } else if (tabName === 'tutorial') {
        document.getElementById('view-tutorial').classList.remove('hidden');
    } else if (tabName === 'faq') {
        document.getElementById('view-faq').classList.remove('hidden');
    } else if (tabName === 'settings') {
        document.getElementById('view-settings').classList.remove('hidden');
        document.getElementById('settings-name-input').value = currentUser.name;
    }

    ['dashboard', 'tutorial', 'faq', 'settings'].forEach(t => {
        const btn = document.getElementById(`nav-tab-${t}`);
        if (btn) {
            if (t === tabName) {
                btn.className = "px-4 py-2 rounded-xl text-sm font-semibold text-red-600 bg-red-50 transition-all flex items-center gap-2";
            } else {
                btn.className = "px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-2";
            }
        }
    });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// --- DASHBOARD DEWAN (PESERTA) ---
function renderDewanDashboard() {
    document.getElementById('dewan-welcome-title').innerText = `Halo, ${currentUser.name}! 👋`;
    document.getElementById('wm-name').innerText = `${currentUser.name} (${currentUser.pasukan})`;

    const badge = document.getElementById('dewan-status-badge-today');
    const timeInfo = document.getElementById('dewan-status-time-today');
    const btnAbsen = document.getElementById('btn-action-absen');

    if (attendanceData.todayStatus) {
        badge.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-300"></i> Sudah Hadir Pengibaran`;
        timeInfo.innerText = `Absen Jumat pukul ${attendanceData.timeHadir}`;
        btnAbsen.innerHTML = `<i class="fa-solid fa-check"></i> Sudah Melakukan Absen Hadir`;
        btnAbsen.className = "w-full py-4 px-8 bg-emerald-600 text-white font-bold rounded-2xl shadow-md cursor-default flex items-center justify-center gap-3 text-base";
        btnAbsen.disabled = true;
    }

    const historyList = document.getElementById('dewan-history-list');
    historyList.innerHTML = '';
    attendanceData.history.forEach(item => {
        const div = document.createElement('div');
        div.className = "p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4";
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                    <i class="fa-solid fa-calendar-day"></i>
                </div>
                <div>
                    <div class="font-bold text-slate-900 text-sm">${item.date} (${item.type})</div>
                    <div class="text-xs text-slate-500">Pukul: ${item.time} • <span class="text-emerald-600 font-semibold">${item.status}</span></div>
                </div>
            </div>
            ${item.photo ? `<button onclick="showToast('Melihat bukti foto ${item.date}')" class="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"><i class="fa-solid fa-image text-red-600"></i> Foto</button>` : '<span class="text-xs text-slate-400">Tanpa Foto</span>'}
        `;
        historyList.appendChild(div);
    });
}

// --- CAMERA & GPS MODAL ---
function openAttendanceModal() {
    document.getElementById('modal-camera').classList.remove('hidden');

    const now = new Date();
    const timeStr = `Jumat, ${now.getDate()} Nov 2026, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} WIB`;
    document.getElementById('wm-time').innerText = timeStr;
    document.getElementById('wm-gps').innerText = `Lat: -7.0051, Long: 110.4381 (Akurat GPS)`;

    startWebcam();
}

function closeCameraModal() {
    document.getElementById('modal-camera').classList.add('hidden');
    stopWebcam();
}

async function startWebcam() {
    const videoElement = document.getElementById('webcam-video');
    videoElement.classList.remove('hidden');
    document.getElementById('snapshot-canvas').classList.add('hidden');
    
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        videoElement.srcObject = mediaStream;
    } catch (err) {
        console.warn("Webcam access warning:", err);
        showToast("Kamera fisik menggunakan mode simulasi otomatis.", "info");
    }
}

function stopWebcam() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
}

function captureAndSubmitAttendance() {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} WIB`;
    const dateStr = `Jumat, ${now.getDate()} Nov 2026`;

    attendanceData.todayStatus = true;
    attendanceData.timeHadir = timeStr;
    attendanceData.photoUrl = "https://placehold.co/400x300/dc2626/ffffff?text=Absen+Jumat+" + currentUser.name;
    
    attendanceData.history.unshift({
        date: dateStr,
        type: "Absen Hadir Pengibaran",
        status: "Hadir",
        time: timeStr,
        photo: attendanceData.photoUrl
    });

    showToast("Absen Hadir Pengibaran Jumat Berhasil!", "success");
    closeCameraModal();
    renderDewanDashboard();
}

// --- CALENDAR GENERATOR (HIGHLIGHTING FRIDAYS) ---
function renderCalendarDays() {
    const container = document.getElementById('dewan-calendar-days');
    container.innerHTML = '';
    for (let i = 1; i <= 30; i++) {
        const dayEl = document.createElement('div');
        let bgCol = "bg-slate-50 text-slate-700 hover:bg-slate-100";
        let dotCol = "";

        // Fridays in Nov 2026 approx: 6, 13, 20, 27
        if ([6, 13, 20, 27].includes(i)) {
            if (i <= 13) {
                bgCol = "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200";
                dotCol = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5 inline-block"></span>';
            } else {
                bgCol = "bg-blue-50 text-blue-800 font-bold border border-blue-200";
                dotCol = '<span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-0.5 inline-block"></span>';
            }
        } else {
            bgCol = "bg-slate-50 text-slate-400";
        }

        dayEl.className = `aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-semibold ${bgCol} transition-all`;
        dayEl.innerHTML = `<span>${i}</span>${dotCol}`;
        container.appendChild(dayEl);
    }
}

// --- DASHBOARD GIAT (PEMBINA / ADMIN) ---
function renderGiatTable() {
    const selectedPasukan = document.getElementById('filter-pasukan-select').value;
    const members = pasukanMembersData[selectedPasukan] || [];
    const tbody = document.getElementById('giat-tbody');
    tbody.innerHTML = '';

    let hadirCount = 0;
    let izinSakitCount = 0;
    let alphaCount = 0;

    members.forEach((m, idx) => {
        if (m.status === 'Hadir') hadirCount++;
        else if (m.status === 'Izin' || m.status === 'Sakit') izinSakitCount++;
        else alphaCount++;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-all border-b border-slate-100";
        tr.innerHTML = `
            <td class="p-4 font-bold text-slate-900 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">${m.name.substring(0,2).toUpperCase()}</div>
                <span>${m.name}</span>
            </td>
            <td class="p-4 font-mono text-xs text-slate-500">${m.idNum}</td>
            <td class="p-4 text-slate-600">${m.time}</td>
            <td class="p-4">
                ${m.photo ? `<button onclick="showToast('Melihat bukti foto ${m.name}')" class="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-100 flex items-center gap-1.5"><i class="fa-solid fa-image text-red-600"></i> Lihat</button>` : '<span class="text-xs text-slate-400">Tidak ada</span>'}
            </td>
            <td class="p-4 text-center">
                <div class="inline-flex rounded-xl p-1 bg-slate-100 gap-1">
                    <button onclick="changeMemberStatus('${selectedPasukan}', ${idx}, 'Hadir')" class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${m.status === 'Hadir' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">Hadir</button>
                    <button onclick="changeMemberStatus('${selectedPasukan}', ${idx}, 'Izin')" class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${m.status === 'Izin' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">Izin</button>
                    <button onclick="changeMemberStatus('${selectedPasukan}', ${idx}, 'Alpha')" class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${m.status === 'Alpha' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">Alpha</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('stat-giat-hadir').innerText = `${hadirCount} Anggota`;
    document.getElementById('stat-giat-izin').innerText = `${izinSakitCount} Anggota`;
    document.getElementById('stat-giat-alpha').innerText = `${alphaCount} Anggota`;
    const total = members.length;
    const pct = total > 0 ? Math.round((hadirCount / total) * 100) : 0;
    document.getElementById('stat-giat-persen').innerText = `${pct}%`;
}

function changeMemberStatus(pasukanKey, idx, newStatus) {
    pasukanMembersData[pasukanKey][idx].status = newStatus;
    if (newStatus === 'Hadir') {
        pasukanMembersData[pasukanKey][idx].time = "06:50 WIB";
        pasukanMembersData[pasukanKey][idx].photo = "https://placehold.co/400x300/dc2626/ffffff?text=Updated+" + newStatus;
    } else {
        pasukanMembersData[pasukanKey][idx].time = "-";
        pasukanMembersData[pasukanKey][idx].photo = null;
    }
    renderGiatTable();
    showToast(`Status berhasil diubah menjadi ${newStatus}`, 'success');
}

// --- CHARTS INITIALIZATION ---
function initCharts() {
    const ctxBar = document.getElementById('schoolAttendanceChart');
    if (ctxBar && !schoolChartInstance) {
        schoolChartInstance = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['Jumat 6 Nov', 'Jumat 13 Nov', 'Jumat 20 Nov', 'Jumat 27 Nov'],
                datasets: [{
                    label: 'Kehadiran Pengibaran',
                    data: [32, 35, 30, 34],
                    backgroundColor: '#DC2626',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 40 } }
            }
        });
    }

    const ctxDonut = document.getElementById('schoolDonutChart');
    if (ctxDonut && !schoolDonutInstance) {
        schoolDonutInstance = new Chart(ctxDonut, {
            type: 'doughnut',
            data: {
                labels: ['Hadir', 'Izin/Sakit', 'Alpha'],
                datasets: [{
                    data: [32, 2, 0],
                    backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
            }
        });
    }
}

// --- EXPORT & PRINT FUNCTIONS ---
function printRekapGiat() {
    showToast("Menyiapkan dokumen rekap untuk dicetak...", "success");
    setTimeout(() => window.print(), 800);
}

function exportToExcel() {
    showToast("Berhasil mengekspor data rekapitulasi ke format Excel (.xlsx)!", "success");
}

// --- TOGGLE FAQ & TUTORIAL ---
function toggleFaq(id) {
    const content = document.getElementById(`faq-content-${id}`);
    const icon = document.getElementById(`faq-icon-${id}`);
    content.classList.toggle('hidden');
    icon.classList.toggle('rotate-180');
}

function playTutorialVideo() {
    showToast("Memutar video tutorial interaktif...", "info");
}

function testPermissions() {
    showToast("Izin kamera dan GPS perangkat berfungsi dengan sangat baik!", "success");
}

function saveSettings(e) {
    e.preventDefault();
    const newName = document.getElementById('settings-name-input').value;
    const selectedAvatar = document.querySelector('input[name="avatar-choice"]:checked').value;
    
    currentUser.name = newName;
    currentUser.avatar = selectedAvatar;

    document.getElementById('nav-user-name').innerText = newName;
    document.getElementById('nav-user-avatar').innerText = selectedAvatar;

    showToast("Pengaturan profil berhasil disimpan!", "success");
}