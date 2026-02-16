// Branding Configuration
const businessName = "StarClean";
const ADMIN_PASSWORD = "jose123"; // <--- CAMBIA TU CONTRASEÑA AQUÍ

// Data configuration with default prices
let zones = [
    { id: 'sala', name: "Sala", desc: "Limpieza de áreas sociales", price: 0.50 },
    { id: 'cocina', name: "Cocina", desc: "Desengrasado y superficies", price: 0.70 },
    { id: 'baño', name: "Baño", desc: "Desinfección profunda", price: 0.60 },
    { id: 'dormitorio', name: "Dormitorio", desc: "Orden y limpieza general", price: 0.50 }
];

let appliances = [
    { id: 'refri', name: "Refrigerador", desc: "Limpieza interior/exterior", price: 25 },
    { id: 'horno', name: "Horno", desc: "Eliminación de grasa", price: 20 },
    { id: 'lavadora', name: "Lavadora", desc: "Limpieza de filtros", price: 30 },
    { id: 'secadora', name: "Secadora", desc: "Limpieza de conductos", price: 25 }
];

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDCHjSe1a9h-JQm_RVIAAQAxfL3UrHRtp0",
    authDomain: "starclean-43024.firebaseapp.com",
    projectId: "starclean-43024",
    storageBucket: "starclean-43024.firebasestorage.app",
    messagingSenderId: "1042926359678",
    appId: "1:1042926359678:web:7d8b18998a5fd929ed742f"
};

// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = "Fyvdr-qc_UTfoTKLU";
const EMAILJS_SERVICE_ID = "service_l9hmik8";
const EMAILJS_TEMPLATE_ID = "template_8dklrk8";

let db = null;
let isAdmin = true; // Everyone is admin now

try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
    }
} catch (e) {
    console.error("Firebase error:", e);
}

// State management
let state = {
    contact: { name: '', email: '', phone: '', date: '', address: '' },
    values: {} // id: qty
};

async function loadPrices() {
    if (db) {
        try {
            const doc = await db.collection("settings").doc("prices").get();
            if (doc.exists) {
                const data = doc.data();
                zones = zones.map(z => ({ ...z, price: data[z.id] || z.price }));
                appliances = appliances.map(a => ({ ...a, price: data[a.id] || a.price }));
            }
        } catch (e) { console.log("Using default prices"); }
    }
    renderAll();
}

function init() {
    const saved = localStorage.getItem('cleaning_estimate_state_v2');
    if (saved) {
        state = JSON.parse(saved);
        setTimeout(() => {
            Object.keys(state.contact).forEach(key => {
                const el = document.getElementById(`cust-${key}`);
                if (el) el.value = state.contact[key];
            });
        }, 0);
    }
    loadPrices();
    updateSummary();
    calculateTotal(false);
}

function saveState() {
    localStorage.setItem('cleaning_estimate_state_v2', JSON.stringify(state));
}

function renderItemCard(item) {
    const qty = state.values[item.id] || 0;
    const price = item.price;
    const isZone = zones.find(z => z.id === item.id);

    return `
        <div class="item-card ${isAdmin ? 'admin-mode' : ''}">
            <div class="item-info">
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
            </div>
            <div class="inputs-row" style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                <div class="field" style="flex: 1.5; min-width: 100px;">
                    <label style="font-size: 0.75rem;">${isZone ? 'Precio/pie²' : 'Precio Un.'}</label>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="color: var(--text-muted); font-weight: 600;">$</span>
                        <input type="number" 
                               step="0.01"
                               class="price-input"
                               oninput="updateBasePrice('${item.id}', this.value)"
                               value="${price}">
                    </div>
                </div>
                <div class="field" style="flex: 1; min-width: 80px;">
                    <label style="font-size: 0.75rem;">${isZone ? 'Pies²' : 'Cant.'}</label>
                    <input type="number" 
                           placeholder="0" 
                           min="0" 
                           oninput="updateQty('${item.id}', this.value)"
                           value="${qty || ''}">
                </div>
            </div>
            <div id="subtotal-${item.id}" style="text-align: right; font-size: 0.9rem; color: var(--primary); font-weight: 600; margin-top: 0.5rem;">
                Subtotal: $${(price * qty).toFixed(2)}
            </div>
        </div>
    `;
}

function renderAll() {
    const zContainer = document.getElementById('zones-container');
    const aContainer = document.getElementById('appliances-container');
    if (zContainer) zContainer.innerHTML = zones.map(z => renderItemCard(z)).join('');
    if (aContainer) aContainer.innerHTML = appliances.map(a => renderItemCard(a)).join('');
}

window.updateBasePrice = (id, value) => {
    const val = parseFloat(value) || 0;
    let item = zones.find(z => z.id === id) || appliances.find(a => a.id === id);
    if (item) item.price = val;

    // Update individual subtotal UI
    const qty = state.values[id] || 0;
    const subEl = document.getElementById(`subtotal-${id}`);
    if (subEl) subEl.innerText = `Subtotal: $${(val * qty).toFixed(2)}`;

    calculateTotal();
    updateSummary();
};

window.updateContactData = () => {
    state.contact.name = document.getElementById('cust-name').value;
    state.contact.email = document.getElementById('cust-email').value;
    state.contact.phone = document.getElementById('cust-phone').value;
    state.contact.date = document.getElementById('cust-date').value;
    state.contact.address = document.getElementById('cust-address').value;
    saveState();

    // Lead Tracking Alert: If name and email are present, send a quick alert
    if (state.contact.name && state.contact.email) {
        clearTimeout(window.leadTimer);
        window.leadTimer = setTimeout(async () => {
            if (EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
                try {
                    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                        to_email: "josefm7547@gmail.com",
                        subject: "🔔 NUEVO INTERESADO en StarClean",
                        from_name: state.contact.name,
                        customer_email: state.contact.email,
                        customer_phone: state.contact.phone,
                        details: "El cliente está actualmente llenando el formulario de cotización."
                    });
                    console.log("Lead alert sent!");
                } catch (e) { console.log("Lead alert failed:", e); }
            }
        }, 5000); // Wait 5 seconds of inactivity to send
    }
};

window.updateQty = (id, value) => {
    state.values[id] = parseFloat(value) || 0;

    // Update individual subtotal UI
    let item = zones.find(z => z.id === id) || appliances.find(a => a.id === id);
    const price = item ? item.price : 0;
    const subEl = document.getElementById(`subtotal-${id}`);
    if (subEl) subEl.innerText = `Subtotal: $${(price * state.values[id]).toFixed(2)}`;

    calculateTotal();
    updateSummary();
    saveState();
};

// Admin functions removed as requested. Everyone is admin now.

window.saveGlobalPrices = async () => {
    if (!db) {
        alert("Firebase no está configurado. Los precios se perderán al recargar.");
        return;
    }
    const prices = {};
    [...zones, ...appliances].forEach(item => {
        prices[item.id] = item.price;
    });

    try {
        await db.collection("settings").doc("prices").set(prices);
        alert("¡Precios guardados en la nube exitosamente!");
        // isAdmin = false; // No need to reset admin since everyone is admin
        renderAll();
    } catch (e) {
        alert("Error al guardar precios: " + e.message);
    }
};

function calculateTotal(animate = true) {
    let total = 0;
    [...zones, ...appliances].forEach(item => {
        const qty = state.values[item.id] || 0;
        total += (item.price * qty);
    });

    const totalEl = document.getElementById('total-price');
    if (!totalEl) return;
    if (animate) {
        animateValue(totalEl, parseFloat(totalEl.innerText), total, 400);
    } else {
        totalEl.innerText = total.toFixed(2);
    }
}

function updateSummary() {
    const container = document.getElementById('summary-items');
    if (!container) return;
    let html = '';
    let hasItems = false;

    [...zones, ...appliances].forEach(item => {
        const qty = state.values[item.id];
        if (qty > 0) {
            hasItems = true;
            html += `
                <div class="summary-item">
                    <span>${item.name} (${qty} x $${item.price})</span>
                    <span>$${(qty * item.price).toFixed(2)}</span>
                </div>
            `;
        }
    });

    container.innerHTML = hasItems ? html : '<p style="color: var(--text-muted); text-align: center;">Seleccione áreas para ver el resumen.</p>';
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = progress * (end - start) + start;
        obj.innerHTML = current.toFixed(2);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', () => {
    if (EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") emailjs.init(EMAILJS_PUBLIC_KEY);

    const logo = document.querySelector('header h1');
    if (logo) logo.innerText = businessName;
    document.title = `${businessName} | Cotización`;

    init();

    const adminTrigger = document.getElementById('new-admin-trigger');
    if (adminTrigger) {
        // Just use onclick from HTML to avoid double firing
    }
    // Admin trigger handled via onclick in HTML

    // Admin Save Button logic
    const saveBtn = document.getElementById('save-prices-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveGlobalPrices);

    document.getElementById('book-btn').addEventListener('click', async function () {
        const total = parseFloat(document.getElementById('total-price').innerText);
        if (!state.contact.name || !state.contact.email || !state.contact.date) {
            alert('Complete los campos obligatorios del cliente.');
            return;
        }
        if (total <= 0) {
            alert('La cotización debe ser mayor a $0.');
            return;
        }

        const btn = this;
        btn.innerText = "Procesando...";
        btn.disabled = true;

        try {
            if (db) {
                await db.collection("estimates").add({
                    ...state.contact,
                    details: state.values,
                    total: total,
                    date: new Date().toISOString()
                });
            }

            if (EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
                const detailsText = [...zones, ...appliances]
                    .filter(i => state.values[i.id] > 0)
                    .map(i => `${i.name}: ${state.values[i.id]} x $${i.price}`)
                    .join("\n");

                await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                    to_email: "josefm7547@gmail.com",
                    from_name: state.contact.name,
                    customer_email: state.contact.email,
                    total_amount: `$${total.toFixed(2)}`,
                    details: detailsText
                });
            }

            document.getElementById('success-modal').classList.add('active');
        } catch (e) {
            alert("Error al procesar la reserva.");
        } finally {
            btn.innerText = "Confirmar Reserva";
            btn.disabled = false;
        }
    });

    document.getElementById('print-btn').addEventListener('click', () => window.print());
});

window.openPreview = (device) => {
    const overlay = document.getElementById('device-simulator');
    const frame = document.getElementById('device-frame');
    const iframe = document.getElementById('preview-iframe');

    overlay.classList.add('active');
    frame.className = 'device-frame ' + (device === 'mobile' ? 'device-mobile' : 'device-tablet');
    iframe.src = window.location.href;
};

window.closePreview = () => {
    document.getElementById('device-simulator').classList.remove('active');
    document.getElementById('preview-iframe').src = '';
};
