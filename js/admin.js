const supabaseUrl = 'ISI_PROJECT_URL';
const supabaseKey = 'ISI_ANON_KEY';

const supabase = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);
async function uploadImage(file) {

    const fileName = `fighter-${Date.now()}`;

    const { data, error } = await supabase
        .storage
        .from('fighters')
        .upload(fileName, file);

    if (error) {
        console.error(error);
        return null;
    }

    const { data: publicUrl } = supabase
        .storage
        .from('fighters')
        .getPublicUrl(fileName);

    return publicUrl.publicUrl;
}
/**
 * ==========================================================================
 * TUMBUK SISWA — FULL UNLOCKED ENGINE (CONNECTED TO GOOGLE APPS SCRIPT)
 * AUTHOR: PAULA | ZERO MOCK LOCKS | 100% PRODUCTION READY
 * INTEGRATED CYBERPUNK QR CODE HUD ENGINE GENERATOR
 * ==========================================================================
 */

// ⚠️ PASTE URL WEB APP GOOGLE APPS SCRIPT YANG SUDAH DI-DEPLOY DI SINI ⚠️
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzSHFpF2lG20vElXU11zeUMmSWZ5YN5yDKln4QPPQB-Ydxd76qJQOmn31SyypSBSouaEw/exec";
const PASSWORD_RAHASIA = "admintumbuk2026";

// Live Scanner HUD Variables
let html5QrcodeScanner = null;
let isScanningActive = false;
let verifiedSessionCount = 0;

async function uploadToCloudinary(file) {
    const cloudName = "dkyrzxsml";
    const uploadPreset = "fighter_unsigned";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    if (!data.secure_url) {
        throw new Error("Upload gambar gagal");
    }

    return data.secure_url;
}

// Global State Synchronized with Apps Script Data Models
let appState = {
    pesanan: [],
    fighters: [],
    matches: [],
    logs: [],
    kuota     : { tribun: 50,    ringside: 50,    vvip: 50 },
    harga     : { tribun: 35000, ringside: 75000, vvip: 150000 },
    nama_tier : { tribun: "Kelas Reguler", ringside: "Kelas Unggulan", vvip: "Kelas Akselerasi VVIP" }, 
    kapasitas : { tribun: 50,    ringside: 50,    vvip: 50 },  
    total_hadir: 0,
    notifications: []
};

// Global Mutation Tracking Variables
let globalTargetType = null;
let globalTargetId = null; 
let globalTargetIndex = null; 
let globalTargetExtra = null;

/**
 * ==========================================================================
 * INITIALIZATION ON DOM LOAD
 * ==========================================================================
 */
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initDropdowns();
    initSearchEngines();
    initModalSystem();
    initFormHandlers();
    initScannerUIHandlers(); // Menginisialisasi event internal komponen HUD scanner
    
    // Tarik data nyata dari Google Sheets
    fetchDataFromSheets();

    // Auto Refresh background data setiap 15 detik
    setInterval(() => {
        silentFetchStats();
    }, 15000);
});

function toggleSkeleton(show) {
    const loader = document.getElementById('skeletonLoader');
    const content = document.getElementById('realContent');
    if (!loader || !content) return;
    if (show) {
        loader.classList.remove('hidden');
        content.classList.add('hidden');
    } else {
        loader.classList.add('hidden');
        content.classList.remove('hidden');
    }
}

/**
 * ==========================================================================
 * AJAX/FETCH CORE CONNECTORS (GET & POST QUERY PARAMS ROUTING)
 * ==========================================================================
 */
async function fetchDataFromSheets() {
    toggleSkeleton(true);
    try {
        const queryParams = new URLSearchParams({ p: PASSWORD_RAHASIA });
        const response = await fetch(`${SCRIPT_URL}?${queryParams.toString()}`, { 
            method: "GET", 
            redirect: "follow" 
        });
        
        if (!response.ok) throw new Error("Gagal mengambil respon dari deployment web app.");
        const res = await response.json();
        
        if (res.status === "success" || res.pesanan) {
            appState.pesanan     = res.pesanan  || [];
            appState.fighters    = res.fighters || [];
            appState.matches     = res.matches  || [];
            appState.logs        = res.logs     || [];
            appState.total_hadir = res.total_hadir || 0;
            if (res.kuota)      appState.kuota      = res.kuota;
            if (res.harga)      appState.harga      = res.harga;
            if (res.nama_tier)  appState.nama_tier  = res.nama_tier;   
            if (res.kapasitas)  appState.kapasitas  = res.kapasitas;   
            
            renderAllModules();
        } else {
            showToast("Akses Ditolak! Password salah atau script bermasalah.", "danger");
        }
    } catch (err) {
        console.error(err);
        showToast("Gagal tersambung ke Google Sheets App Script!", "danger");
    } finally {
        toggleSkeleton(false);
    }
}

async function silentFetchStats() {
    try {
        const queryParams = new URLSearchParams({ p: PASSWORD_RAHASIA });
        const response = await fetch(`${SCRIPT_URL}?${queryParams.toString()}`, { method: "GET", redirect: "follow" });
        if (response.ok) {
            const res = await response.json();
            appState.pesanan     = res.pesanan || [];
            appState.matches     = res.matches || [];
            appState.logs        = res.logs     || [];
            appState.total_hadir = res.total_hadir || 0;
            if (res.kuota)      appState.kuota      = res.kuota;
            if (res.harga)      appState.harga      = res.harga;
            if (res.nama_tier)  appState.nama_tier  = res.nama_tier;   
            if (res.kapasitas)  appState.kapasitas  = res.kapasitas;   
            
            renderDashboardStats();
            renderFightCardPreview();
            renderActivityLogs();
        }
    } catch (e) {
        console.log("Background sync skipped.");
    }
}

async function commitActionToBackend(actionName, extraParams = {}, successMsg = "Data berhasil disinkronkan!") {
    toggleSkeleton(true);
    try {
        const fullParams = Object.assign({ action: actionName, p: PASSWORD_RAHASIA }, extraParams);
        const response = await fetch(`${SCRIPT_URL}?${new URLSearchParams(fullParams).toString()}`, {
            method: "POST",
            redirect: "follow"
        });
        
        const res = await response.json();
        if (res.status === "success") {
            showToast(successMsg, "success");
            await fetchDataFromSheets();
        } else {
            showToast(`Gagal: ${res.message || "Terjadi kesalahan"}`, "danger");
            toggleSkeleton(false);
        }
    } catch (err) {
        console.error(err);
        showToast("Gagal memproses tindakan ke Apps Script!", "danger");
        toggleSkeleton(false);
    }
}

/**
 * ==========================================================================
 * TOAST NOTIFICATION COMPONENT
 * ==========================================================================
 */
function showToast(message, type = "success") {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    
    let icon = "fa-check-circle";
    if (type === "danger") icon = "fa-exclamation-triangle";
    if (type === "warning") icon = "fa-bell";
    
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(50px)";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/**
 * ==========================================================================
 * UI DATA RENDERING CONTROLLERS
 * ==========================================================================
 */
function renderAllModules() {
    renderDashboardStats();
    renderFightCardPreview();
    renderActivityLogs();
    renderFightersTable();
    renderMatchesTable();
    renderOrdersTable();
    renderPricingCards();
}

function renderDashboardStats() {
    const statRevenue = document.getElementById('statRevenue');
    const statTickets = document.getElementById('statTickets');
    const statFighters = document.getElementById('statFighters');

    if (statRevenue) {
        const totalRevenue = appState.pesanan
            .filter(o => String(o.status).trim().toLowerCase() === "y")
            .reduce((sum, current) => sum + (parseInt(String(current.total).replace(/[^0-9]/g, '')) || 0), 0);
        statRevenue.innerText = `Rp ${totalRevenue.toLocaleString('id-ID')}`;
    }
    if (statTickets) {
        const paidTicketsCount = appState.pesanan.filter(o => String(o.status).trim().toLowerCase() === "y").length;
        statTickets.innerText = `${paidTicketsCount} Terverifikasi (Gate: ${appState.total_hadir} Masuk)`;
    }
    if (statFighters) {
        statFighters.innerText = appState.fighters.length;
    }
}

function renderFightCardPreview() {
    const container = document.getElementById('fightCardPreview');
    if (!container) return;
    container.innerHTML = "";
    
    if (appState.matches.length === 0) {
        container.innerHTML = "<p class='text-muted text-center' style='padding:20px;'>Belum ada agenda pertandingan di Sheets.</p>";
        return;
    }

    appState.matches.forEach(m => {
        const fBlue = appState.fighters.find(f => f.nama === m.blue) || {};
        const fRed = appState.fighters.find(f => f.nama === m.red) || {};

        let badgeClass = m.status === "LIVE" ? "badge-danger" : (m.status === "FINISHED" ? "badge-success" : "badge-warning");

        const row = document.createElement('div');
        row.className = "preview-match-row";
        row.innerHTML = `
            <div class="fighter-mini-profile">
                <img src="${fBlue.photo || 'https://via.placeholder.com/100'}" class="avatar-mini">
                <div>
                    <div class="name-mini">${m.blue}</div>
                    <div class="school-mini">${fBlue.gym || fBlue.nickname || 'Corner Biru'}</div>
                </div>
            </div>
            <div class="vs-badge-box">
                <span class="vs-text">VS</span>
                <div class="match-meta-info">${m.weight || 'Catchweight'}</div>
                <span class="badge ${badgeClass}" style="margin-top:6px;">${m.status || 'PENDING'}</span>
            </div>
            <div class="fighter-mini-profile text-right">
                <img src="${fRed.photo || 'https://via.placeholder.com/100'}" class="avatar-mini">
                <div>
                    <div class="name-mini">${m.red}</div>
                    <div class="school-mini">${fRed.gym || fRed.nickname || 'Corner Merah'}</div>
                </div>
            </div>
        `;
        container.appendChild(row);
    });
}

function renderActivityLogs() {
    const container = document.getElementById('activityLogList');
    if (!container) return;
    container.innerHTML = "";
    if (appState.logs.length === 0) {
        container.innerHTML = "<p class='text-muted' style='font-size:12px;'>Log riwayat kosong.</p>";
        return;
    }
    appState.logs.forEach(log => {
        const item = document.createElement('div');
        item.className = `log-item ${log.type === 'error' ? 'warning' : 'info'}`;
        item.innerHTML = `<div class="log-bullet"></div><p class="log-text">${log.teks}</p><span class="log-time">${log.waktu}</span>`;
        container.appendChild(item);
    });
}

function renderFightersTable(filterQuery = "") {
    const tbody = document.querySelector('#fighterTable tbody');
    if (!tbody) return;
    tbody.innerHTML = "";

    const filtered = appState.fighters.filter(f => f.nama.toLowerCase().includes(filterQuery.toLowerCase()));

    filtered.forEach(f => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="identity-cell">
                    <img src="${f.photo || 'https://via.placeholder.com/100'}">
                    <div class="identity-meta">
                        <h4>${f.nama}</h4>
                        <p>"${f.nickname || 'No Nickname'}"</p>
                    </div>
                </div>
            </td>
            <td>${f.gym || '-'}</td>
            <td><strong>${f.height || '-'} cm</strong></td>
            <td><span class="badge badge-info">${f.w} W - ${f.l} L - ${f.d} D</span></td>
            <td>
                <button class="btn-action-icon edit-trigger" onclick="openEditFighter('${f.nama}')"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-action-icon delete-trigger" onclick="triggerDeleteConfirm('fighter', null, '${f.nama}')"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    updateMatchFormSelectOptions();
}

function renderMatchesTable(filterQuery = "") {
    const tbody = document.querySelector('#matchTable tbody');
    if (!tbody) return;
    tbody.innerHTML = "";

    appState.matches.forEach((m, index) => {
        if (filterQuery && !m.red.toLowerCase().includes(filterQuery.toLowerCase()) && !m.blue.toLowerCase().includes(filterQuery.toLowerCase())) return;

        let statusBadge = m.status === "LIVE" ? `<span class="badge badge-danger">LIVE</span>` : (m.status === "FINISHED" ? `<span class="badge badge-success">SELESAI</span>` : `<span class="badge badge-warning">PENDING</span>`);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${m.title || 'Regular Fight'}</strong></td>
            <td class="text-info">${m.blue}</td>
            <td class="text-danger">${m.red}</td>
            <td>${m.weight || '-'}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn-action-icon edit-trigger" onclick="openEditMatch(${index})"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-action-icon delete-trigger" onclick="triggerDeleteConfirm('match', index)"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderOrdersTable(filterQuery = "") {
    const tbody = document.querySelector('#orderTable tbody');
    if (!tbody) return;
    tbody.innerHTML = "";

    const filtered = appState.pesanan.filter(o => 
        String(o.id_invoice).toLowerCase().includes(filterQuery.toLowerCase()) || String(o.nama).toLowerCase().includes(filterQuery.toLowerCase())
    );

    filtered.forEach(o => {
        const isLunas = String(o.status).trim().toLowerCase() === "y";
        let statusBadge = isLunas ? `<span class="badge badge-success">LUNAS / PAID</span>` : `<span class="badge badge-warning">WAITING</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${o.id_invoice}</code></td>
            <td><strong>${o.nama}</strong> <small class="text-muted">(${o.jumlah} Tiket)</small></td>
            <td><a href="https://wa.me/${o.kontak}" target="_blank" class="text-info" style="text-decoration:none;"><i class="fa-brands fa-whatsapp"></i> +${o.kontak}</a></td>
            <td><span class="badge badge-info">${String(o.tier).toUpperCase()}</span></td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn-action-icon edit-trigger" style="color:var(--success);" onclick="openEditOrder('${o.id_invoice}', '${o.nama}', '${o.kontak}')"><i class="fa-solid fa-user-pen"></i></button>
                <button class="btn-action-icon" style="color:#fff;" onclick="simulatePrintTicket('${o.id_invoice}')"><i class="fa-solid fa-print"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPricingCards() {
    const container = document.getElementById('pricingTierContainer');
    if (!container) return;
    container.innerHTML = "";

    const tierKeys = Object.keys(appState.harga);

    tierKeys.forEach(tierKey => {
        const hargaSaatIni  = appState.harga[tierKey]     || 0;
        const namaSaatIni   = appState.nama_tier[tierKey] || tierKey.toUpperCase();
        const kapSaatIni    = appState.kapasitas[tierKey] || 50;
        const sisa          = appState.kuota[tierKey]     !== undefined ? appState.kuota[tierKey] : kapSaatIni;

        const card = document.createElement('div');
        card.className = `tier-card ${tierKey === 'vvip' ? 'VIP' : ''}`;
        card.innerHTML = `
            <div class="tier-name">${namaSaatIni.toUpperCase()}</div>
            <div class="tier-price">Rp ${Number(hargaSaatIni).toLocaleString('id-ID')}</div>
            <ul class="tier-meta-list">
                <li>Sisa Kuota Terbuka <span>${sisa} / ${kapSaatIni} Kursi</span></li>
            </ul>
            <form class="modern-form pricing-edit-form" data-tier="${tierKey}">
                <div class="form-group">
                    <label for="namaInput-${tierKey}">Nama Tier (tampil di halaman tiket)</label>
                    <input type="text" id="namaInput-${tierKey}" value="${namaSaatIni}" placeholder="Contoh: Kelas Reguler" required>
                </div>
                <div class="form-group">
                    <label for="hargaInput-${tierKey}">Harga Tiket (Rp)</label>
                    <input type="number" id="hargaInput-${tierKey}" min="0" step="1000" value="${hargaSaatIni}" required>
                </div>
                <div class="form-group">
                    <label for="kapInput-${tierKey}">Total Kapasitas Kursi</label>
                    <input type="number" id="kapInput-${tierKey}" min="1" step="1" value="${kapSaatIni}" required>
                </div>
                <button type="submit" class="btn btn-primary btn-full">
                    <i class="fa-solid fa-floppy-disk"></i> Simpan ${tierKey.toUpperCase()}
                </button>
            </form>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.pricing-edit-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tierKey    = form.getAttribute('data-tier');
            const hargaBaru  = parseInt(document.getElementById(`hargaInput-${tierKey}`).value)  || 0;
            const namaBaru   = document.getElementById(`namaInput-${tierKey}`).value.trim();
            const kapBaru    = parseInt(document.getElementById(`kapInput-${tierKey}`).value)     || 50;

            await commitActionToBackend(
                "update_pricing",
                { tier: tierKey, harga: hargaBaru, nama: namaBaru, kapasitas: kapBaru },
                `Konfigurasi tier ${tierKey.toUpperCase()} berhasil diupdate!`
            );
        });
    });
}

/**
 * ==========================================================================
 * LIVE FILTER ENGINE SEARCHES
 * ==========================================================================
 */
function initSearchEngines() {
    const sf = document.getElementById('searchFighter');
    const sm = document.getElementById('searchMatch');
    const so = document.getElementById('searchOrder');

    if (sf) sf.addEventListener('input', (e) => renderFightersTable(e.target.value));
    if (sm) sm.addEventListener('input', (e) => renderMatchesTable(e.target.value));
    if (so) so.addEventListener('input', (e) => renderOrdersTable(e.target.value));
}

/**
 * ==========================================================================
 * MODALS CONTROLLERS & DATA POPULATORS
 * ==========================================================================
 */
function initModalSystem() {
    document.querySelectorAll('.close-modal-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('show'));
        });
    });

    const addFighterBtn = document.getElementById('addFighterBtn');
    if (addFighterBtn) {
        addFighterBtn.addEventListener('click', () => {
            document.getElementById('fighterForm').reset();
            document.getElementById('fighterId').value = ""; 
            document.getElementById('fighterModalTitle').innerText = "Tambah Fighter Baru";
            openModal('fighterModal');
        });
    }

    const addMatchBtn = document.getElementById('addMatchBtn');
    if (addMatchBtn) {
        addMatchBtn.addEventListener('click', () => {
            document.getElementById('matchForm').reset();
            document.getElementById('matchId').value = ""; 
            document.getElementById('matchModalTitle').innerText = "Buat Jadwal Match Arena Baru";
            openModal('matchModal');
        });
    }

    const btnExecuteDelete = document.getElementById('btnExecuteDelete');
    if (btnExecuteDelete) btnExecuteDelete.addEventListener('click', () => executeDeleteItem());
}

function openModal(id) { 
    const el = document.getElementById(id);
    if (el) el.classList.add('show'); 
}
function closeModal(id) { 
    const el = document.getElementById(id);
    if (el) el.classList.remove('show'); 
}

function updateMatchFormSelectOptions() {
    const blueSelect = document.getElementById('matchBlue');
    const redSelect = document.getElementById('matchRed');
    if (!blueSelect || !redSelect) return;

    let optionsHtml = `<option value="" disabled selected>Pilih nama petarung...</option>`;
    appState.fighters.forEach(f => { optionsHtml += `<option value="${f.nama}">${f.nama}</option>`; });
    blueSelect.innerHTML = optionsHtml;
    redSelect.innerHTML = optionsHtml;
}

window.openEditFighter = function(namaFighter) {
    const f = appState.fighters.find(item => item.nama === namaFighter);
    if (!f) return;

    globalTargetExtra = namaFighter; 
    document.getElementById('fighterId').value = "EDIT_MODE";
    document.getElementById('fighterName').value = f.nama;
    document.getElementById('fighterNickname').value = f.nickname || "";
    document.getElementById('fighterSchool').value = f.gym || "";
    document.getElementById('fighterWeight').value = f.height || 170;
    document.getElementById('fighterAvatar').value = f.photo || "";
    document.getElementById('fighterWin').value = f.w;
    document.getElementById('fighterLoss').value = f.l;
    document.getElementById('fighterDraw').value = f.d;

    document.getElementById('fighterModalTitle').innerText = "Edit Data Profile Fighter";
    openModal('fighterModal');
};

window.openEditMatch = function(index) {
    const m = appState.matches[index];
    if (!m) return;

    globalTargetIndex = index;
    updateMatchFormSelectOptions();

    document.getElementById('matchId').value = "EDIT_MODE";
    document.getElementById('matchPart').value = m.title || "";
    document.getElementById('matchBlue').value = m.blue;
    document.getElementById('matchRed').value = m.red;
    document.getElementById('matchTime').value = m.weight || "";
    document.getElementById('matchStatus').value = m.status || "PENDING";

    document.getElementById('matchModalTitle').innerText = "Edit Susunan Match Card";
    openModal('matchModal');
};

window.openEditOrder = function(idInvoice, nama, kontak) {
    globalTargetId = idInvoice;
    document.getElementById('orderId').value = idInvoice;
    document.getElementById('orderNamaInput').value = nama;
    document.getElementById('orderWaInput').value = kontak;
    document.getElementById('orderStatusSelect').value = "KEEP";
    openModal('orderModal');
};

window.triggerDeleteConfirm = function(type, index = null, extraKey = null) {
    globalTargetType = type;
    globalTargetIndex = index;
    globalTargetExtra = extraKey;
    openModal('deleteConfirmModal');
};

async function executeDeleteItem() {
    if (globalTargetType === 'match' && globalTargetIndex !== null) {
        await commitActionToBackend("delete_match", { match_index: globalTargetIndex }, "Match Card berhasil dihapus!");
    } else if (globalTargetType === 'fighter' && globalTargetExtra !== null) {
        await commitActionToBackend("delete_fighter", { nama: globalTargetExtra }, "Roster Fighter berhasil dihapus!");
    }
    closeModal('deleteConfirmModal');
}

/**
 * ==========================================================================
 * FORMS SUBMISSIONS DISPATCHERS
 * ==========================================================================
 */
function initFormHandlers() {
    const fighterForm = document.getElementById('fighterForm');
    if (fighterForm) {
        fighterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const isEdit = document.getElementById('fighterId').value === "EDIT_MODE";
            const fileInput = document.getElementById('fighterAvatarFile');

            let photoUrl = document.getElementById('fighterAvatar').value || "";

            if (fileInput && fileInput.files.length > 0) {
                try {
                    photoUrl = await uploadToCloudinary(fileInput.files[0]);
                } catch (err) {
                    showToast("Upload foto gagal!", "danger");
                    return;
                }
            }
            const fileInput = document.getElementById('fighterAvatarFile');

let imageUrl = "";

if (fileInput.files.length > 0) {
    imageUrl = await uploadImage(fileInput.files[0]);
}

            const params = {
                nama: document.getElementById('fighterName').value,
                nickname: document.getElementById('fighterNickname').value,
                w: parseInt(document.getElementById('fighterWin').value) || 0,
                l: parseInt(document.getElementById('fighterLoss').value) || 0,
                d: parseInt(document.getElementById('fighterDraw').value) || 0,
                ko: 0,
                height: parseInt(document.getElementById('fighterWeight').value) || 170,
                stance: "Orthodox",
                gym: document.getElementById('fighterSchool').value,
                photo: imageUrl
            };

            if (isEdit) {
                params.nama_target = globalTargetExtra; 
                await commitActionToBackend("edit_fighter", params, "Profile Fighter berhasil diupdate!");
            } else {
                await commitActionToBackend("add_fighter", params, "Fighter baru berhasil didaftarkan!");
            }
            closeModal('fighterModal');
        });
    }

    const matchForm = document.getElementById('matchForm');
    if (matchForm) {
        matchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const isEdit = document.getElementById('matchId').value === "EDIT_MODE";
            
            const params = {
                red: document.getElementById('matchRed').value,
                blue: document.getElementById('matchBlue').value,
                weight: document.getElementById('matchTime').value,
                title: document.getElementById('matchPart').value,
                status: document.getElementById('matchStatus').value,
                result: ""
            };

            if (isEdit) {
                params.match_index = globalTargetIndex;
                await commitActionToBackend("edit_match", params, "Match Card sukses dimodifikasi!");
            } else {
                await commitActionToBackend("add_match", params, "Match Card baru sukses dibuat!");
            }
            closeModal('matchModal');
        });
    }

    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const namaBaru = document.getElementById('orderNamaInput').value;
            const waBaru = document.getElementById('orderWaInput').value;
            const statusAction = document.getElementById('orderStatusSelect').value;

            await commitActionToBackend("edit_pesanan", {
                id_invoice: globalTargetId,
                nama_baru: namaBaru,
                wa_baru: waBaru
            }, "Data penonton berhasil diperbarui.");

            if (statusAction === "PAID") {
                await commitActionToBackend("verifikasi", { id_invoice: globalTargetId }, `Invoice ${globalTargetId} BERHASIL DISET LUNAS!`);
            }
            closeModal('orderModal');
        });
    }
}

/**
 * ==========================================================================
 * LIVE QR GATE SCANNER HUD ENGINE & RECEIPT PRINTER
 * ==========================================================================
 */

// Synthesizer Audio Bip Feedback Generator
function playAudioFeedback(isSuccess) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        if (isSuccess) {
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, ctx.currentTime); 
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
        } else {
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(130, ctx.currentTime); 
            gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.28);
        }
    } catch (e) {
        console.error("Audio feedback error:", e);
    }
}

// Router Eksekusi Verifikasi QR ke Database Apps Script
async function eksekusiVerifikasiDatabase(decodedText) {
    const cameraBox = document.getElementById('camera-box-interface');
    const uploadBox = document.getElementById('upload-box-interface');
    const monitorResult = document.getElementById('monitor-result');
    const resTitle = document.getElementById('res-title');
    const resName = document.getElementById('res-name');
    const resDetail = document.getElementById('res-detail');
    const countEl = document.getElementById('session-counter');
    const resultBox = document.getElementById('scanResultContainer'); 

    // Ubah status ke mode pemrosesan matrix HUD
    if (cameraBox) cameraBox.style.display = 'none';
    if (uploadBox) uploadBox.style.display = 'none';
    if (monitorResult) {
        monitorResult.style.display = 'block';
        monitorResult.className = "result-panel"; 
        resTitle.innerText = "PROCESSING...";
        resName.innerText = "VERIFYING MATRIX DATA...";
        resDetail.innerText = `ID: ${decodedText}`;
    }
    if (resultBox) {
        resultBox.classList.remove('hidden', 'valid', 'invalid');
        resultBox.innerHTML = `<div>Memproses ID QR: <code>${decodedText}</code>...</div>`;
    }

    toggleSkeleton(true);

    try {
        const fullParams = { action: "checkin", p: PASSWORD_RAHASIA, id_qr: decodedText };
        const response = await fetch(`${SCRIPT_URL}?${new URLSearchParams(fullParams).toString()}`, { 
            method: "POST", 
            redirect: "follow" 
        });
        const res = await response.json();
        
        if (monitorResult) monitorResult.className = "result-panel";

        if (res.status === "success") {
            if (monitorResult) {
                monitorResult.classList.add("state-success");
                resTitle.innerText = "ACCESS GRANTED";
                resName.innerText = `NAME: ${res.nama}`;
                resDetail.innerText = `STATUS: CHECK-IN BERHASIL PADA SIKLUS UTAMA`;
            }
            if (resultBox) {
                resultBox.classList.add('valid');
                resultBox.innerHTML = `
                    <div class="result-header" style="color:var(--success);"><i class="fa-solid fa-circle-check"></i> ${res.message}</div>
                    <div class="result-body"><p>Nama Penonton: <strong>${res.nama}</strong></p><p>Kode QR: <code>${decodedText}</code></p></div>
                `;
            }
            
            playAudioFeedback(true); 
            verifiedSessionCount++;
            if (countEl) countEl.innerText = `SESSION VERIFIED: ${verifiedSessionCount} TIKET`;
            showToast("Check-In Berhasil!", "success");

        } else if (res.status === "bocor") {
            if (monitorResult) {
                monitorResult.classList.add("state-bocor");
                resTitle.innerText = "ACCESS DENIED";
                resName.innerText = `NAME: ${res.nama}`;
                resDetail.innerText = `⚠️ WARNING: TIKET SUDAH PERNAH MASUK JAM ${res.waktu}`;
            }
            if (resultBox) {
                resultBox.classList.add('invalid');
                resultBox.innerHTML = `
                    <div class="result-header" style="color:var(--warning);"><i class="fa-solid fa-triangle-exclamation"></i> TERDETEKSI RE-SCAN</div>
                    <div class="result-body"><p>Nama: <strong>${res.nama}</strong></p><p style="color:var(--danger); font-weight:700;">${res.message}</p><p>Jam Masuk: <strong>${res.waktu}</strong></p></div>
                `;
            }
            
            playAudioFeedback(false); 
            showToast("Warning! Tiket sudah terpakai.", "warning");

        } else {
            if (monitorResult) {
                monitorResult.classList.add("state-bocor");
                resTitle.innerText = "INVALID PASS";
                resName.innerText = "ERROR: TIKET TIDAK TERDAFTAR";
                resDetail.innerText = `LOG: ${res.message || 'ID QR Palsu / Tidak Valid'}`;
            }
            if (resultBox) {
                resultBox.classList.add('invalid');
                resultBox.innerHTML = `
                    <div class="result-header" style="color:var(--danger);"><i class="fa-solid fa-circle-xmark"></i> ${res.message || "TIKET PALSU!"}</div>
                `;
            }
            
            playAudioFeedback(false); 
            showToast("Akses Ditolak!", "danger");
        }
        // Sinkronisasi data background secara berkala ke modul dashboard metrics
        silentFetchStats();
    } catch (err) {
        console.error(err);
        if (monitorResult) {
            monitorResult.className = "result-panel state-bocor";
            resTitle.innerText = "NETWORK ERROR";
            resName.innerText = "GAGAL MENYAMBUNG KE DATABASE";
            resDetail.innerText = `LOG: ${err.toString()}`;
        }
        playAudioFeedback(false);
        showToast("Error memproses data scanner", "danger");
    } finally {
        toggleSkeleton(false);
        const inputField = document.getElementById('ticketScannerInput');
        if (inputField) inputField.value = "";
    }
}

// Handler Pembacaan / Decoding File Gambar QR Lokal
function prosesScanFileGambar(file) {
    const cameraBox = document.getElementById('camera-box-interface');
    const uploadBox = document.getElementById('upload-box-interface');
    const monitorResult = document.getElementById('monitor-result');
    const resTitle = document.getElementById('res-title');
    const resName = document.getElementById('res-name');

    if (cameraBox) cameraBox.style.display = 'none';
    if (uploadBox) uploadBox.style.display = 'none';
    if (monitorResult) {
        monitorResult.style.display = 'block';
        resTitle.innerText = "READING FILE...";
        resName.innerText = "DECODING IMAGE MATRIX...";
    }

    if (!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5Qrcode("reader");
    }

    html5QrcodeScanner.scanFile(file, false)
        .then(decodedText => {
            eksekusiVerifikasiDatabase(decodedText);
        })
        .catch(err => {
            if (monitorResult) {
                monitorResult.className = "result-panel state-bocor";
                resTitle.innerText = "SCAN FAILED";
                resName.innerText = "QR CODE TIDAK TERDETEKSI";
                document.getElementById('res-detail').innerText = "LOG: Pastikan gambar memiliki pencahayaan yang jelas.";
            }
            playAudioFeedback(false);
            showToast("QR Code tidak terdeteksi pada berkas!", "danger");
        });
}

// Handler Mengaktifkan Instansiasi Kamera Stream Scanner
function jalankanKameraScanner() {
    const cameraBox = document.getElementById('camera-box-interface');
    const uploadBox = document.getElementById('upload-box-interface');
    const monitorResult = document.getElementById('monitor-result');
    const fileInput = document.getElementById('qr-input-file');
    const manualInput = document.getElementById('ticketScannerInput');

    if (cameraBox) cameraBox.style.display = 'block';
    if (uploadBox) uploadBox.style.display = 'block';
    if (monitorResult) monitorResult.style.display = 'none';
    if (fileInput) fileInput.value = ""; 
    if (manualInput) manualInput.value = "";
    isScanningActive = true;

    if (!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5Qrcode("reader");
    }

    if (!html5QrcodeScanner.isScanning) {
        html5QrcodeScanner.start(
            { facingMode: "environment" }, 
            { fps: 10, qrbox: { width: 250, height: 250 } }, 
            (decodedText) => {
                if (!isScanningActive) return;
                isScanningActive = false;
                html5QrcodeScanner.stop().then(() => {
                    eksekusiVerifikasiDatabase(decodedText);
                }).catch(err => {
                    console.error("Gagal stop stream:", err);
                    eksekusiVerifikasiDatabase(decodedText);
                });
            }
        ).catch(err => {
            console.warn("Kamera terblokir atau tidak ditemukan, otomatis masuk fallback mode upload.");
        });
    }
}

// Menghancurkan Track Aliran Video untuk Menghemat Resource Perangkat
function stopKameraScanner() {
    isScanningActive = false;
    if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
        html5QrcodeScanner.stop().catch(err => console.log("Stop errors safely bypassed."));
    }
}

// Mengikat Event Listener Tambahan untuk Komponen Pendukung Scanner HUD
function deletehtml5qrcodeInstance() {
    stopKameraScanner();
}

function initScannerUIHandlers() {
    // Tombol verifikasi input ketik manual
    const btnVerifyTicket = document.getElementById('btnVerifyTicket');
    if (btnVerifyTicket) {
        btnVerifyTicket.addEventListener('click', () => {
            const manualInput = document.getElementById('ticketScannerInput');
            const qrTarget = manualInput ? manualInput.value.trim() : "";
            if (!qrTarget) {
                showToast("Masukkan ID QR unik penonton!", "warning");
                return;
            }
            if (isScanningActive && html5QrcodeScanner && html5QrcodeScanner.isScanning) {
                isScanningActive = false;
                html5QrcodeScanner.stop().then(() => {
                    eksekusiVerifikasiDatabase(qrTarget);
                }).catch(() => eksekusiVerifikasiDatabase(qrTarget));
            } else {
                eksekusiVerifikasiDatabase(qrTarget);
            }
        });
    }

    // Tombol reset scan ulang berikutnya (Scan Next Pass)
    const btnResetScan = document.getElementById('btn-reset-scan');
    if (btnResetScan) {
        btnResetScan.addEventListener('click', jalankanKameraScanner);
    }

    // Event input unggah berkas screenshot/gambar dari galeri lokal
    const fileInput = document.getElementById('qr-input-file');
    if (fileInput) {
        fileInput.addEventListener('change', e => {
            if (e.target.files.length === 0) return;
            const fileGambar = e.target.files[0];

            if (isScanningActive && html5QrcodeScanner && html5QrcodeScanner.isScanning) {
                isScanningActive = false;
                html5QrcodeScanner.stop().then(() => {
                    prosesScanFileGambar(fileGambar);
                }).catch(() => prosesScanFileGambar(fileGambar));
            } else {
                prosesScanFileGambar(fileGambar);
            }
        });
    }
}

function simulatePrintTicket(idInvoice) {
    const order = appState.pesanan.find(o => o.id_invoice === idInvoice);
    if (!order) return;
    
    const printWindow = window.open('', '_blank', 'width=600,height=400');
    printWindow.document.write(`
        <html><head><title>Struk - ${order.id_invoice}</title><style>body{font-family:monospace;padding:20px;}.receipt{border:2px dashed #000;padding:15px;max-width:400px;}.center{text-align:center;font-weight:bold;}p{margin:4px 0;font-size:12px;}</style></head>
        <body><div class="receipt"><div class="center">TUMBUK SISWA OFFICIAL</div><hr><p>Invoice : ${order.id_invoice}</p><p>Nama    : ${order.nama}</p><p>Kategori: ${String(order.tier).toUpperCase()}</p><p>Jumlah  : ${order.jumlah} Kursi</p><p>Total   : ${order.total}</p><p>Status  : ${String(order.status).toLowerCase() === 'y' ? 'LUNAS' : 'PENDING'}</p></div><script>window.print();<\/script></body></html>
    `);
    printWindow.document.close();
}

// Navigasi Intuitif dengan Otomatisasi Lifecycle Kamera Terintegrasi
function initNavigation() {
    const menuItems = document.querySelectorAll('.menu-item, .menu-shortcut');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');
    const sidebar = document.getElementById('sidebar');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = item.getAttribute('data-section');
            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
            
            const activeMenu = document.querySelector(`.menu-item[data-section="${targetSection}"]`);
            if (activeMenu) activeMenu.classList.add('active');
            
            sections.forEach(sec => sec.classList.remove('active'));
            const currentSection = document.getElementById(`section-${targetSection}`);
            if (currentSection) currentSection.classList.add('active');
            
            pageTitle.innerText = activeMenu ? activeMenu.querySelector('span').innerText : "Overview";
            sidebar.classList.remove('mobile-open');

            // Manajemen Daur Hidup Kamera Saat Membuka Tab Menu Lainnya
            if (targetSection === "verify") {
                jalankanKameraScanner();
            } else {
                stopKameraScanner();
            }
        });
    });
    
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => sidebar.classList.add('mobile-open'));
    
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => sidebar.classList.remove('mobile-open'));
}

function initDropdowns() {
    const ndBtn = document.getElementById('notifDropdownBtn');
    const pdBtn = document.getElementById('profileDropdownBtn');

    if (ndBtn) {
        ndBtn.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            document.getElementById('profileDropdown').classList.remove('show'); 
            document.getElementById('notifDropdown').classList.toggle('show'); 
        });
    }
    if (pdBtn) {
        pdBtn.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            document.getElementById('notifDropdown').classList.remove('show'); 
            document.getElementById('profileDropdown').classList.toggle('show'); 
        });
    }
    document.addEventListener('click', () => { 
        const nd = document.getElementById('notifDropdown');
        const pd = document.getElementById('profileDropdown');
        if (nd) nd.classList.remove('show'); 
        if (pd) pd.classList.remove('show'); 
    });
}

const clearNotifBtn = document.getElementById('clearNotifBtn');
if (clearNotifBtn) clearNotifBtn.addEventListener('click', () => { showToast("Kotak masuk dibersihkan."); });

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => { 
        showToast("Mengalihkan...", "warning"); 
        setTimeout(() => { window.location.href = "index.html"; }, 1000); 
    });
}
