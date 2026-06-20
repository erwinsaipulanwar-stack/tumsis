document.addEventListener('DOMContentLoaded', () => {
    const cameraBox = document.getElementById('camera-box-interface');
    const uploadBox = document.getElementById('upload-box-interface');
    const fileInput = document.getElementById('qr-input-file');
    const monitorResult = document.getElementById('monitor-result');
    const resTitle = document.getElementById('res-title');
    const resName = document.getElementById('res-name');
    const resDetail = document.getElementById('res-detail');
    const btnReset = document.getElementById('btn-reset-scan');
    const countEl = document.getElementById('session-counter');

    const scriptUrl = "https://script.google.com/macros/s/AKfycbzSHFpF2lG20vElXU11zeUMmSWZ5YN5yDKln4QPPQB-Ydxd76qJQOmn31SyypSBSouaEw/exec";
    const PASS_GATE = "admintumbuk2026";

    const html5QrcodeScanner = new Html5Qrcode("reader");
    let isScanningActive = true;
    let verifiedCount = 0; 

    // Audio Synth Generator (Bip Elektrik Feedback)
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

    // FUNGSI INTI: Jalur Bersama Verifikasi Data QR ke Server Apps Script
    function eksekusiVerifikasiDatabase(decodedText) {
        cameraBox.style.display = 'none';
        uploadBox.style.display = 'none'; // Sembunyikan tombol upload saat proses
        monitorResult.style.display = 'block';
        monitorResult.className = "result-panel"; 
        resTitle.innerText = "PROCESSING...";
        resName.innerText = "VERIFYING MATRIX DATA...";
        resDetail.innerText = `ID: ${decodedText}`;

        const formData = new URLSearchParams();
        formData.append('action', 'checkin');
        formData.append('id_qr', decodedText);
        formData.append('p', PASS_GATE);

        fetch(scriptUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString()
        })
        .then(res => res.json())
        .then(data => {
            monitorResult.className = "result-panel"; 

            if (data.status === "success") {
                monitorResult.classList.add("state-success");
                resTitle.innerText = "ACCESS GRANTED";
                resName.innerText = `NAME: ${data.nama}`;
                resDetail.innerText = `STATUS: CHECK-IN BERHASIL PADA JAM ${data.message.split('//')[0] || ''}`;
                
                playAudioFeedback(true); 
                verifiedCount++;
                if (countEl) countEl.innerText = `SESSION VERIFIED: ${verifiedCount} TIKET`;

            } else if (data.status === "bocor") {
                monitorResult.classList.add("state-bocor");
                resTitle.innerText = "ACCESS DENIED";
                resName.innerText = `NAME: ${data.nama}`;
                resDetail.innerText = `⚠️ WARNING: TIKET SUDAH PERNAH MASUK PADA JAM ${data.waktu}`;
                
                playAudioFeedback(false); 

            } else {
                monitorResult.classList.add("state-bocor");
                resTitle.innerText = "INVALID PASS";
                resName.innerText = "ERROR: TIKET TIDAK TERDAFTAR";
                resDetail.innerText = `LOG: ${data.message}`;
                
                playAudioFeedback(false); 
            }
        })
        .catch(err => {
            monitorResult.className = "result-panel state-bocor";
            resTitle.innerText = "NETWORK ERROR";
            resName.innerText = "GAGAL MENYAMBUNG KE DATABASE";
            resDetail.innerText = `LOG: ${err.toString()}`;
            playAudioFeedback(false);
        });
    }

    // Callback saat kamera sukses mendeteksi QR
    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        if (!isScanningActive) return;
        isScanningActive = false;
        
        html5QrcodeScanner.stop().then(() => {
            eksekusiVerifikasiDatabase(decodedText);
        }).catch(err => console.error("Gagal stop kamera:", err));
    };

    // FITUR BARU: Trigger deteksi QR dari File Upload Gambar
    fileInput.addEventListener('change', e => {
        if (e.target.files.length === 0) return;
        const fileGambar = e.target.files[0];

        // Jika kamera sedang menyala, matikan dulu kameranya biar gak tabrakan engine
        if (isScanningActive) {
            isScanningActive = false;
            html5QrcodeScanner.stop().then(() => {
                prosesScanFileGambar(fileGambar);
            }).catch(err => {
                console.error(err);
                prosesScanFileGambar(fileGambar);
            });
        } else {
            prosesScanFileGambar(fileGambar);
        }
    });

    // Fungsi pemroses gambar local menggunakan engine html5qrcode
    function prosesScanFileGambar(file) {
        cameraBox.style.display = 'none';
        uploadBox.style.display = 'none';
        monitorResult.style.display = 'block';
        resTitle.innerText = "READING FILE...";
        resName.innerText = "DECODING IMAGE MATRIX...";

        html5QrcodeScanner.scanFile(file, false)
            .then(decodedText => {
                eksekusiVerifikasiDatabase(decodedText);
            })
            .catch(err => {
                // Jika file gambar tidak terbaca atau tidak ada QR code didalamnya
                monitorResult.className = "result-panel state-bocor";
                resTitle.innerText = "SCAN FAILED";
                resName.innerText = "QR CODE TIDAK TERDETEKSI";
                resDetail.innerText = "LOG: Pastikan file gambar pecahannya jelas & berisi QR Code resmi.";
                playAudioFeedback(false);
            });
    }

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    function jalankanKameraScanner() {
        cameraBox.style.display = 'block';
        uploadBox.style.display = 'block'; // Tampilkan tombol upload kembali
        monitorResult.style.display = 'none';
        fileInput.value = ""; // Reset input file lama
        isScanningActive = true;

        html5QrcodeScanner.start(
            { facingMode: "environment" }, 
            config, 
            qrCodeSuccessCallback
        ).catch(err => {
            console.error("Gagal start camera:", err);
            // Tetap izinkan upload gambar walaupun device tidak punya kamera (seperti PC desktop/laptop server)
            console.log("Kamera tidak terdeteksi, stand-by mode upload gambar.");
        });
    }

    btnReset.addEventListener('click', jalankanKameraScanner);
    jalankanKameraScanner();
});