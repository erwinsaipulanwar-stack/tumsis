document.addEventListener('DOMContentLoaded', () => {
    // ⚠️ GANTI PAKE URL APPS SCRIPT VERSI TERBARU LU BRAY! (Samain kayak admin.js & matches-public.js)
    const scriptUrl = "https://script.google.com/macros/s/AKfycbzSHFpF2lG20vElXU11zeUMmSWZ5YN5yDKln4QPPQB-Ydxd76qJQOmn31SyypSBSouaEw/exec";

    const rosterGrid = document.querySelector('.roster-grid');
    if (!rosterGrid) return;

    const defaultPic = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23161616"/></svg>';

    // Tampilkan loading state dulu sambil nunggu data asli
    rosterGrid.innerHTML = `<p style="text-align:center; padding: 40px; color: var(--text-gray); grid-column: 1 / -1;">Memuat roster fighter...</p>`;

    // Tembak jalur publik yang sama kayak Matches (server udah nyiapin get_public_matches yang juga ngirim fighters)
    fetch(`${scriptUrl}?action=get_public_matches`)
        .then(res => res.json())
        .then(data => {
            if (data.status === "success" && Array.isArray(data.fighters)) {
                renderRoster(data.fighters);
            } else {
                rosterGrid.innerHTML = `<p style="text-align:center; padding: 40px; color: var(--accent); grid-column: 1 / -1;">Gagal memuat roster dari arena.</p>`;
            }
        })
        .catch(err => {
            console.error("Koneksi ke Arena gagal:", err);
            rosterGrid.innerHTML = `<p style="text-align:center; padding: 40px; color: var(--accent); grid-column: 1 / -1;">Koneksi terputus. Cek internet lu bray.</p>`;
        });

    function tierTagFromHeight(height) {
        // Aturan sederhana biar konsisten sama tampilan lama (Akselerasi / KKM / Remedial)
        const h = parseInt(height) || 0;
        if (h >= 175) return { cls: 'acceleration', label: 'Kelas Akselerasi' };
        if (h >= 165) return { cls: 'kkm', label: 'Kelas KKM' };
        return { cls: 'remedial', label: 'Kelas Remedial' };
    }

    function renderRoster(fighters) {
        if (fighters.length === 0) {
            rosterGrid.innerHTML = `<p style="text-align:center; padding: 40px; color: var(--text-gray); grid-column: 1 / -1;">Belum ada fighter yang terdaftar.</p>`;
            return;
        }

        let html = "";
        fighters.forEach(f => {
            const tier = tierTagFromHeight(f.height);
            const win = parseInt(f.w) || 0;
            const loss = parseInt(f.l) || 0;
            const draw = parseInt(f.d) || 0;

            html += `
            <div class="fighter-card">
                <div class="fighter-photo">
                    <img src="${f.photo ? f.photo.replace('/upload/', '/upload/f_auto,q_auto/') : defaultPic}"" alt="${f.nama}">
                    <div class="record-badge">${win} - ${loss} - ${draw}</div>
                </div>
                <div class="fighter-details">
                    <span class="tier-tag ${tier.cls}">${tier.label}</span>
                    <h2>${f.nama}</h2>
                    <p class="school">${f.gym || '-'}</p>
                </div>
            </div>
            `;
        });
        rosterGrid.innerHTML = html;

        attachCardClickHandlers();
    }

    function attachCardClickHandlers() {
        const fighterCards = document.querySelectorAll('.fighter-card');
        fighterCards.forEach(card => {
            card.addEventListener('click', () => {
                const name = card.querySelector('h2').textContent;
                const record = card.querySelector('.record-badge').textContent;
                const school = card.querySelector('.school').textContent;

                alert(`🥊 Fighter Profile: \nNama: ${name} \nAsal: ${school} \nRekor (Win-Loss-Draw): ${record}`);
            });
        });
    }
});