const API_URL = 'https://road-damage.lskk.co.id/api';

// --- INISIALISASI PETA ---
const map = L.map('map').setView([-6.9294068, 107.6268073], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
let markers = [];

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// 1. FETCH & RENDER KERUSAKAN JALAN
async function fetchRoadIssues() {
    try {
        const response = await fetch(`${API_URL}/road-issues`);
        const data = await response.json();
        
        const container = document.getElementById('road-issues-list');
        document.getElementById('issue-count').innerText = data.length;
        
        container.innerHTML = ''; 
        // Bersihkan marker lama
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];

        data.forEach(issue => {
            const mapsUrl = `http://googleusercontent.com/maps.google.com/?q=${issue.latitude},${issue.longitude}`;
            const timeStr = formatDate(issue.timestamp);

            // A. BUAT GRID GALERI (Kiri)
            const galleryCard = document.createElement('div');
            galleryCard.className = 'gallery-card';
            galleryCard.innerHTML = `
                <img src="${issue.image_url}" class="gallery-img" onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                <div class="gallery-overlay">
                    <div class="gallery-title">${issue.detected_class}</div>
                    <div class="gallery-meta"><i class="far fa-clock"></i> ${timeStr}</div>
                </div>
            `;
            // Klik gambar galeri -> Buka Maps
            galleryCard.onclick = () => window.open(mapsUrl, '_blank');
            container.appendChild(galleryCard);

            // B. BUAT MARKER PETA (Atas)
            if (issue.latitude && issue.longitude && issue.latitude !== 0) {
                const marker = L.marker([issue.latitude, issue.longitude]).addTo(map);
                
                // HTML Popup yang "Kece"
                const popupContent = `
                    <div class="popup-card">
                        <div class="popup-header">
                            <i class="fas fa-exclamation-triangle"></i> DETEKSI: ${issue.detected_class.toUpperCase()}
                        </div>
                        <div class="popup-image-wrapper">
                             <img src="${issue.image_url}" onerror="this.src='https://via.placeholder.com/300x150?text=Gagal'">
                        </div>
                        <div class="popup-details">
                            <div class="detail-row">
                                <div class="detail-icon-box"><i class="far fa-clock"></i></div>
                                <span>${timeStr} WIB</span>
                            </div>
                            <div class="detail-row">
                                <div class="detail-icon-box"><i class="fas fa-map-marker-alt"></i></div>
                                <span>${issue.latitude.toFixed(5)}, ${issue.longitude.toFixed(5)}</span>
                            </div>
                        </div>
                        <a href="${mapsUrl}" target="_blank" class="popup-btn">
                            Buka Google Maps <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                `;

                marker.bindPopup(popupContent, {
                    minWidth: 260, maxWidth: 260,
                    className: 'custom-leaflet-popup',
                    closeButton: true
                });
                markers.push(marker);
            }
        });
    } catch (error) {
        console.error("Error Road Issues:", error);
    }
}

// 2. FETCH & RENDER SENSOR
async function fetchSensorData() {
    try {
        const response = await fetch(`${API_URL}/sensors`);
        const data = await response.json();
        
        const tbody = document.getElementById('sensor-table-body');
        tbody.innerHTML = '';

        data.forEach(sensor => {
            const row = document.createElement('tr');
            // Warna merah jika guncangan keras (threshold asal: 7)
            const isHigh = Math.abs(sensor.y) > 7 || Math.abs(sensor.x) > 6;
            const valClass = isHigh ? 'val-high' : '';

            row.innerHTML = `
                <td><span style="color:#94a3b8">${formatDate(sensor.timestamp)}</span></td>
                <td>${sensor.x.toFixed(2)}</td>
                <td class="${valClass}">${sensor.y.toFixed(2)}</td>
                <td>${sensor.z.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error Sensor:", error);
    }
}

// Jalankan Pertama Kali
fetchRoadIssues();
fetchSensorData();

// Auto Refresh 5 Detik
setInterval(() => {
    fetchRoadIssues();
    fetchSensorData();
}, 5000);