// Initialize Map
const map = L.map('map').setView([43.090000, 141.380000], 13); // Centered on Higashi Ward

// Add OpenStreetMap Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// State management
const state = {
    subway: { visible: true, radius: 800, color: '#ef4444', layerGroup: L.layerGroup().addTo(map) },
    aeon: { visible: true, radius: 500, color: '#8b5cf6', layerGroup: L.layerGroup().addTo(map) },
    maxvalu: { visible: true, radius: 500, color: '#ec4899', layerGroup: L.layerGroup().addTo(map) },
    tsuruha: { visible: true, radius: 500, color: '#f59e0b', layerGroup: L.layerGroup().addTo(map) },
    junior_high: { visible: true, radius: 800, color: '#10b981', layerGroup: L.layerGroup().addTo(map) },
    elementary: { visible: true, radius: 600, color: '#059669', layerGroup: L.layerGroup().addTo(map) }
};

// Helper to create custom icon
function createCustomIcon(color, shape = 'circle') {
    const borderRadius = shape === 'circle' ? '50%' : '2px';
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${color};
            width: 12px;
            height: 12px;
            border-radius: ${borderRadius};
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
}

// Render markers and circles
function renderCategory(category) {
    const config = state[category];
    config.layerGroup.clearLayers();

    if (!config.visible) return;

    facilities.filter(f => f.category === category).forEach(f => {
        // Add Circle
        L.circle([f.lat, f.lng], {
            color: config.color,
            fillColor: config.color,
            fillOpacity: 0.15,
            weight: 1,
            radius: parseInt(config.radius)
        }).addTo(config.layerGroup);

        // Add Marker
        const shape = category === 'elementary' ? 'square' : 'circle';
        const marker = L.marker([f.lat, f.lng], {
            icon: createCustomIcon(config.color, shape),
            draggable: true
        }).bindPopup(`
            <h3>${f.name}</h3>
            <p>${f.address}</p>
            <p><small>${f.note}</small></p>
            <button onclick="deleteFacility('${f.id}')" class="delete-btn">🗑️ 削除</button>
        `).addTo(config.layerGroup);

        // Update coordinates on drag end
        marker.on('dragend', function (event) {
            const marker = event.target;
            const position = marker.getLatLng();
            f.lat = position.lat;
            f.lng = position.lng;
            console.log(`Updated ${f.name}: ${f.lat}, ${f.lng}`);
        });
    });
}

// Initial Render
Object.keys(state).forEach(renderCategory);

// Event Listeners
function setupListeners(category) {
    const checkEl = document.getElementById(`${category}-check`);
    const radiusEl = document.getElementById(`${category}-radius`);
    const valEl = document.getElementById(`${category}-val`);

    if (!checkEl || !radiusEl || !valEl) return;

    checkEl.addEventListener('change', (e) => {
        state[category].visible = e.target.checked;
        renderCategory(category);
    });

    radiusEl.addEventListener('input', (e) => {
        const val = e.target.value;
        state[category].radius = val;
        valEl.textContent = `${val}m`;
        renderCategory(category);
    });
}

Object.keys(state).forEach(setupListeners);

// UI Toggle for Mobile
function toggleControls() {
    const controls = document.getElementById('controls');
    const icon = document.getElementById('toggle-icon');
    controls.classList.toggle('collapsed');
    icon.textContent = controls.classList.contains('collapsed') ? '▲' : '▼';
}

// Initialize UI state based on screen size
if (window.innerWidth < 768) {
    toggleControls(); // Collapse by default on mobile
}

// Export Data Function
// Modal Helpers
const modal = {
    overlay: document.getElementById('modal-overlay'),
    title: document.getElementById('modal-title'),
    body: document.getElementById('modal-body'),
    cancelBtn: document.getElementById('modal-cancel'),
    confirmBtn: document.getElementById('modal-confirm'),

    show: function (title, content, onConfirm, showCancel = true) {
        this.title.textContent = title;
        this.body.innerHTML = content;
        this.overlay.classList.remove('hidden');

        this.cancelBtn.style.display = showCancel ? 'block' : 'none';

        // Clear previous listeners
        const newConfirm = this.confirmBtn.cloneNode(true);
        const newCancel = this.cancelBtn.cloneNode(true);
        this.confirmBtn.parentNode.replaceChild(newConfirm, this.confirmBtn);
        this.cancelBtn.parentNode.replaceChild(newCancel, this.cancelBtn);

        this.confirmBtn = newConfirm;
        this.cancelBtn = newCancel;

        this.confirmBtn.addEventListener('click', () => {
            if (onConfirm()) {
                this.hide();
            }
        });

        this.cancelBtn.addEventListener('click', () => {
            this.hide();
        });
    },

    hide: function () {
        this.overlay.classList.add('hidden');
    },

    alert: function (message) {
        this.show('お知らせ', `<p>${message}</p>`, () => true, false);
    }
};

// Export Data Function
window.exportData = function () {
    console.log("Export Data called");
    let output = "const facilities = [\n";

    // Group by category for readability
    const categories = ['subway', 'aeon', 'maxvalu', 'tsuruha', 'junior_high', 'elementary'];

    categories.forEach(cat => {
        output += `    // ${cat}\n`;
        facilities.filter(f => f.category === cat).forEach(f => {
            output += `    { id: '${f.id}', name: '${f.name}', category: '${f.category}', lat: ${f.lat.toFixed(6)}, lng: ${f.lng.toFixed(6)}, address: '${f.address}', note: '${f.note}' },\n`;
        });
        output += "\n";
    });

    output += "];";

    // Copy to clipboard with fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(output).then(() => {
            modal.alert("現在のデータをクリップボードにコピーしました！<br>チャットに貼り付けて送信してください。");
        }).catch(err => {
            console.error('Clipboard API failed, trying fallback:', err);
            copyToClipboardFallback(output);
        });
    } else {
        copyToClipboardFallback(output);
    }
};

function copyToClipboardFallback(text) {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (successful) {
            modal.alert("現在のデータをクリップボードにコピーしました！(Fallback)<br>チャットに貼り付けて送信してください。");
        } else {
            throw new Error("execCommand failed");
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        modal.alert("コピーに失敗しました。<br>コンソール(F12)にデータを出力しましたので、そこからコピーしてください。");
        console.log("--- EXPORT DATA ---");
        console.log(text);
        console.log("-------------------");
    }
}

// Add Facility Function
window.addFacility = function () {
    console.log("Add Facility called");

    const content = `
        <div class="modal-input-group">
            <label>施設名</label>
            <input type="text" id="input-name" placeholder="施設名を入力">
        </div>
        <div class="modal-input-group">
            <label>カテゴリ</label>
            <select id="input-category">
                <option value="subway">地下鉄</option>
                <option value="aeon">イオン</option>
                <option value="maxvalu">MaxValu</option>
                <option value="tsuruha">ツルハ</option>
                <option value="junior_high">中学校</option>
                <option value="elementary">小学校</option>
            </select>
        </div>
    `;

    modal.show('施設を追加', content, () => {
        const name = document.getElementById('input-name').value;
        const category = document.getElementById('input-category').value;

        if (!name) {
            alert("施設名を入力してください"); // Native alert for validation inside modal is fine, or use inline error
            return false;
        }

        const center = map.getCenter();
        const newId = 'NEW_' + Date.now();

        const newFacility = {
            id: newId,
            name: name,
            category: category,
            lat: center.lat,
            lng: center.lng,
            address: '住所未設定',
            note: '新規追加'
        };

        facilities.push(newFacility);
        renderCategory(category);

        modal.alert(`「${name}」を画面中央に追加しました。<br>ドラッグして位置を調整してください。`);
        return true;
    });
};

// Delete Facility Function
window.deleteFacility = function (id) {
    console.log("Delete Facility called for id:", id);

    modal.show('削除の確認', 'この施設を削除してもよろしいですか？', () => {
        const index = facilities.findIndex(f => f.id === id);
        if (index > -1) {
            const category = facilities[index].category;
            facilities.splice(index, 1);
            renderCategory(category);
            return true;
        } else {
            modal.alert("施設が見つかりませんでした。");
            return true;
        }
    });
};

