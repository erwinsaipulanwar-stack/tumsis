document.addEventListener('DOMContentLoaded', () => {
    // 1. AMBIL DATA DARI STORAGE COK
    const idInvoice = localStorage.getItem('inv_id') || "#XXXXXX";
    const namaUser = localStorage.getItem('inv_nama') || "Penonton Tumbuk Siswa";
    const kontakUser = localStorage.getItem('inv_kontak') || "-";
    const tierUser = localStorage.getItem('inv_tier') || "-";
    const jumlahUser = localStorage.getItem('inv_jumlah') || "0";
    const totalUser = localStorage.getItem('inv_total') || "Rp 0";
    const qrisBase64 = localStorage.getItem('inv_qris');

    // Taruh URL Apps Script Baru Lu Di Sini Win!
    const scriptUrl = "https://script.google.com/macros/s/AKfycbzSHFpF2lG20vElXU11zeUMmSWZ5YN5yDKln4QPPQB-Ydxd76qJQOmn31SyypSBSouaEw/exec";

    // Parsing struktur nama awal untuk list invoice ringkas
    let namaHtmlAwal = "";
    let templateNamaBuatWa = namaUser;

    if (namaUser.includes('|')) {
        const pecahNama = namaUser.split('|');
        namaHtmlAwal = `<span style="font-size:15px; font-weight:700; color:#ffffff;">${pecahNama[0]}</span>`;
        pecahNama.slice(1).forEach(namaAsisten => {
            namaHtmlAwal += `<div style="font-size:11px; color:#999999; font-weight:400; margin-top:3px; padding-left:4px;">└ • ${namaAsisten}</div>`;
        });
        templateNamaBuatWa = `${pecahNama[0]} (+ Rekan: ${pecahNama.slice(1).join(', ')})`;
    } else {
        namaHtmlAwal = `<span style="font-size:15px; font-weight:700; color:#ffffff;">${namaUser}</span>`;
    }

    // CETAK DATA AWAL KE ELEMEN HTML DOM INVOICE
    if(document.getElementById('pay-nama')) document.getElementById('pay-nama').innerHTML = namaHtmlAwal;
    if(document.getElementById('pay-kontak')) document.getElementById('pay-kontak').innerText = kontakUser;
    if(document.getElementById('pay-tier')) document.getElementById('pay-tier').innerText = tierUser;
    if(document.getElementById('pay-jumlah')) document.getElementById('pay-jumlah').innerText = `${jumlahUser} Tiket`;
    if(document.getElementById('pay-total')) document.getElementById('pay-total').innerText = totalUser;
    
    const dateEl = document.querySelector('.invoice-date');
    if (dateEl) { dateEl.innerHTML = `ID Invoice: <strong style="color: #CD0100; letter-spacing:1px;">${idInvoice}</strong>`; }

    const qrisImgEl = document.getElementById('qris-image');
    const qrisLoaderEl = document.getElementById('qris-loader');

    if (qrisBase64) {
        if (qrisImgEl) { qrisImgEl.src = qrisBase64; qrisImgEl.style.display = "block"; }
        if (qrisLoaderEl) qrisLoaderEl.style.display = "none";
    }

    // ==================================================================
    // ENGINE AUTO POLLING: BERUBAH JADI ZONE DOWNLOAD TIKET LANDSCAPE SECARA INSTAN
    // ==================================================================
    const statusIntervalId = setInterval(() => {
        if (idInvoice === "#XXXXXX") return;

        fetch(`${scriptUrl}?action=cek_status&id_invoice=${encodeURIComponent(idInvoice)}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === "success" && data.payment_status === "y") {
                
                // Setop mesin interval polling bray
                clearInterval(statusIntervalId);

                // Ambil kontainer grid utama pembungkus halaman invoice lu
                const invoiceGridWrapper = document.querySelector('.invoice-grid');
                if (!invoiceGridWrapper) return;

                // Pecah string nama pengunjung dari storage
                const daftarNama = namaUser.includes('|') ? namaUser.split('|') : [namaUser];
                const kodeClean = idInvoice.replace('#', ''); 

                // Inject font external game HUD langsung via JavaScript biar aman ga bentrok
                if (!document.getElementById('esports-fonts-injected')) {
                    const linkFonts = document.createElement('link');
                    linkFonts.id = 'esports-fonts-injected';
                    linkFonts.rel = 'stylesheet';
                    linkFonts.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap';
                    document.head.appendChild(linkFonts);
                }

                // Bangun template kartu landscape eSports HUD per individu pengunjung
                let tiketLandscapeHtmlCombined = "";
                daftarNama.forEach((namaOrang, index) => {
                    const nomorUrut = String(index + 1).padStart(2, '0');
                    const dataQrUnik = `TS4-${kodeClean}-${nomorUrut}`;
                    const urlApiQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=5&data=${encodeURIComponent(dataQrUnik)}`;

                    tiketLandscapeHtmlCombined += `
                    <div class="h-ticket-card">
                        <div class="h-hud-corner h-tl"></div>
                        <div class="h-hud-corner h-tr"></div>
                        <div class="h-hud-corner h-bl"></div>
                        <div class="h-hud-corner h-br"></div>

                        <div class="h-left-panel">
                            <div class="h-brand-row">
                                <div class="h-logo-txt">TUMBUK<span style="color:#CD0100;">SISWA</span></div>
                                <div class="h-event-tag">VOL. 4 / 2026</div>
                            </div>
                            
                            <div class="h-info-box">
                                <div class="h-mini-lbl">// COMPETITOR_NAME</div>
                                <div class="h-main-val h-name-txt">${namaOrang.trim().toUpperCase()}</div>
                            </div>
                            
                            <div class="h-flex-row">
                                <div class="h-info-box">
                                    <div class="h-mini-lbl">// ARENA_ZONE</div>
                                    <div class="h-main-val h-tier-txt">${tierUser.toUpperCase()} RING</div>
                                </div>
                                <div class="h-info-box">
                                    <div class="h-mini-lbl">// INVOICE_REF</div>
                                    <div class="h-main-val" style="font-family:'Share Tech Mono', monospace; color:#888888; font-size:14px;">${idInvoice}</div>
                                </div>
                            </div>

                            <div class="h-footer-lbl">
                                [SECURITY NOTE] ACCESS PASS ACTIVE. UNIQUE ID MATRIX ALLOWS FOR SINGLE SCAN ENTRY VALIDATION AT THE MAIN GATE.
                            </div>
                        </div>

                        <div class="h-right-panel">
                            <div class="h-vertical-tag">GATE PASS</div>
                            <div class="h-qr-border">
                                <img class="h-qr-img" src="${urlApiQrCode}" alt="Secure QR">
                            </div>
                            <div class="h-qr-code-str">${dataQrUnik}</div>
                        </div>
                    </div>
                    `;
                });

                // Rombak total struktur innerHTML grid invoice jadi Halaman Unduh Tiket Profesional
                invoiceGridWrapper.parentNode.innerHTML = `
                    <style>
                        /* INJEKSI STYLE LANDSCAPE TIKET SECARA REALTIME */
                        .success-title-zone { text-align: center; margin-bottom: 30px; animation: fadeIn 0.5s ease-out; }
                        .success-title-zone h2 { font-family: 'Orbitron', sans-serif; font-size: 26px; color: #00ff66; text-transform: uppercase; margin: 0; letter-spacing: 1px; }
                        .success-title-zone p { font-size: 13px; color: #999999; margin: 6px 0 0 0; }
                        
                        .action-download-area { text-align: center; margin-bottom: 40px; }
                        .btn-save-ticket-pdf { 
                            background-color: #CD0100; color: #ffffff; border: none; font-family: 'Orbitron', sans-serif; 
                            font-size: 12px; font-weight: 900; padding: 14px 32px; cursor: pointer; letter-spacing: 2px;
                            box-shadow: 0 0 20px rgba(205, 1, 0, 0.5); border-radius: 6px; text-transform: uppercase; transition: all 0.2s;
                        }
                        .btn-save-ticket-pdf:hover { background-color: #ff002a; transform: translateY(-1px); box-shadow: 0 0 25px rgba(255, 0, 42, 0.6); }

                        .h-ticket-card { 
                            width: 100%; max-width: 700px; height: 310px; margin: 0 auto 30px auto;
                            background-color: #0a0a0a; border: 2px solid #1c1c1c; position: relative; 
                            display: flex; overflow: hidden; box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.5);
                            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                        }
                        .h-ticket-card::before {
                            content: ''; position: absolute; top: -15px; left: -15px; width: 30px; height: 30px;
                            background-color: #060606; transform: rotate(45deg); border-right: 2px solid #1c1c1c; z-index: 2;
                        }
                        
                        .h-hud-corner { position: absolute; width: 12px; height: 12px; border-color: #CD0100; border-style: solid; z-index: 5; }
                        .h-tl { top: 12px; left: 12px; border-width: 3px 0 0 3px; }
                        .h-tr { top: 12px; right: 12px; border-width: 3px 3px 0 0; }
                        .h-bl { bottom: 12px; left: 12px; border-width: 0 0 3px 3px; }
                        .h-br { bottom: 12px; right: 12px; border-width: 0 3px 3px 0; }

                        .h-left-panel { flex: 1; padding: 25px 30px; display: flex; flex-direction: column; justify-content: space-between; border-right: 2px dashed #1f1f1f; position: relative; }
                        .h-brand-row { display: flex; justify-content: space-between; align-items: center; }
                        .h-logo-txt { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 900; letter-spacing: -1.5px; color:#fff; }
                        .h-event-tag { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #ff002a; letter-spacing: 2px; font-weight: bold; }
                        
                        .h-flex-row { display: flex; gap: 15px; }
                        .h-info-box { background: #111111; border: 1px solid #1f1f1f; padding: 10px 14px; flex: 1; position: relative; margin-top: 10px; }
                        .h-info-box::after { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: #CD0100; }
                        .h-info-box.full-w { flex: none; width: 100%; box-sizing: border-box; }
                        
                        .h-mini-lbl { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: #555555; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; }
                        .h-main-val { font-size: 14px; font-weight: 700; text-transform: uppercase; margin-top: 2px; color: #ffffff; }
                        .h-name-txt { font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 900; letter-spacing: 0.5px; }
                        .h-tier-txt { font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 900; color: #CD0100; text-shadow: 0 0 8px rgba(205, 1, 0, 0.4); }
                        
                        .h-footer-lbl { font-family: 'Share Tech Mono', monospace; font-size: 8px; color: #333333; line-height: 1.3; border-top: 1px dashed #262626; padding-top: 8px; text-transform: uppercase; }

                        .h-right-panel { width: 190px; background-color: #0d0d0d; padding: 25px 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
                        .h-qr-border { padding: 10px; border: 2px solid #CD0100; background-color: #050505; box-shadow: 0 0 15px rgba(205, 1, 0, 0.2); margin-bottom: 8px; }
                        .h-qr-img { width: 125px; height: 125px; display: block; border: 3px solid #ffffff; background: #ffffff; }
                        .h-qr-code-str { font-family: 'Share Tech Mono', monospace; font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #ffffff; text-align: center; }
                        .h-vertical-tag { font-family: 'Orbitron', sans-serif; font-size: 8px; color: #222; letter-spacing: 4px; transform: rotate(90deg); position: absolute; right: -28px; top: 45%; text-transform: uppercase; }

                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                        /* LOGIKA AUTOMATED PRINT CONFIGURATION */
                        @media print {
                            body { background-color: #030303 !important; padding: 0 !important; }
                            .navbar, .secure-tag, .success-title-zone, .action-download-area, .footer-mini { display: none !important; }
                            .payment-container { padding-top: 0 !important; padding-bottom: 0 !important; }
                            .h-ticket-card { margin: 40px auto !important; page-break-after: always !important; box-shadow: none !important; border: 2px solid #1c1c1c !important; }
                            @page { size: landscape; margin: 0; }
                        }
                    </style>

                    <div class="success-title-zone">
                        <h2>✓ PEMBAYARAN VALID</h2>
                        <p>Tiket resmi Anda telah terbit. Silakan unduh PDF atau screenshot kartu akses Anda di bawah ini bray.</p>
                    </div>

                    <div class="action-download-area">
                        <button class="btn-save-ticket-pdf" onclick="window.print()">// CETAK_ATAU_SAVE_PDF</button>
                    </div>

                    ${tiketLandscapeHtmlCombined}
                `;
            }
        })
        .catch(err => console.error("Realtime polling error bray:", err));
    }, 5000);

    // 4. GATEWAY WHATSAPP MANUAL AWAL
    const btnWa = document.getElementById('btn-wa-confirm');
    if (btnWa) {
        btnWa.addEventListener('click', () => {
            const NO_ADMIN_WA = "6281234567890"; // Ganti pake nomor WA lu Win
            const teksPesan = `Halo Panitia Tumbuk Siswa!\n\nSaya ingin konfirmasi pembayaran tiket.\n\n*DATA TRANSAKSI:*\n• *ID Invoice: ${idInvoice}*\n• Nama: ${templateNamaBuatWa}\n• No. WA: ${kontakUser}\n• Kategori: ${tierUser.toUpperCase()}\n• Jumlah: ${jumlahUser} Tiket\n• Total: ${totalUser}\n\nMohon segera divalidasi sistem. Terima kasih! 🥊`;
            window.open(`https://wa.me/${NO_ADMIN_WA}?text=${encodeURIComponent(teksPesan)}`, '_blank');
        });
    }
});