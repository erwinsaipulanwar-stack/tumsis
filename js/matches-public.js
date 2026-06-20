document.addEventListener("DOMContentLoaded", () => {
    // ⚠️ GANTI PAKE URL APPS SCRIPT VERSI TERBARU LU BRAY!
    const scriptUrl = "https://script.google.com/macros/s/AKfycbzSHFpF2lG20vElXU11zeUMmSWZ5YN5yDKln4QPPQB-Ydxd76qJQOmn31SyypSBSouaEw/exec";

    const wrapper = document.getElementById("fight-cards-wrapper");

    fetch(`${scriptUrl}?action=get_public_matches`)
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                renderFightCards(data.matches, data.fighters);
            } else {
                wrapper.innerHTML = `<p style="text-align:center; color: var(--accent);">Gagal memuat jadwal dari arena.</p>`;
            }
        })
        .catch(err => {
            console.error("Koneksi ke Arena gagal:", err);
            wrapper.innerHTML = `<p style="text-align:center; color: var(--accent);">Koneksi terputus. Cek internet lu bray.</p>`;
        });

    function renderFightCards(matches, fighters) {
        // Helper: Cari data detail petarung (foto & gym) berdasarkan nama
        const getFighterDetails = (namaFighter) => {
            const found = fighters.find(f => f.nama === namaFighter);
            return found ? found : { nama: namaFighter, gym: "Unknown Gym", photo: "" };
        };

        const defaultPic = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="%23161616"/></svg>';

        if (!matches || matches.length === 0) {
            wrapper.innerHTML = `<p style="text-align:center; color: var(--text-gray);">Belum ada Fight Card yang diumumkan.</p>`;
            return;
        }

        let html = "";
        matches.forEach(match => {
            const redFighter = getFighterDetails(match.red);
            const blueFighter = getFighterDetails(match.blue);

            html += `
            <div class="fight-card-poster">
                <div class="poster-side red-side">
                    <div class="poster-img-wrap">
                        <img src="${redFighter.photo || defaultPic}" alt="${redFighter.nama}">
                        <div class="poster-fade"></div>
                    </div>
                </div>

                <div class="poster-center">
                    <span class="poster-status">${match.status.toUpperCase()}</span>
                    <div class="poster-names">
                        <h3 class="name-red">${redFighter.nama}</h3>
                        <div class="vs-mark">VS</div>
                        <h3 class="name-blue">${blueFighter.nama}</h3>
                    </div>
                    <span class="poster-weight">${match.weight}</span>
                    <div class="poster-gyms">
                        <span class="gym-red">${redFighter.gym}</span>
                        <span class="gym-blue">${blueFighter.gym}</span>
                    </div>
                </div>

                <div class="poster-side blue-side">
                    <div class="poster-img-wrap">
                        <img src="${blueFighter.photo || defaultPic}" alt="${blueFighter.nama}">
                        <div class="poster-fade"></div>
                    </div>
                </div>
            </div>
            `;
        });
        wrapper.innerHTML = html;
    }
});