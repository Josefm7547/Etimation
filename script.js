// Branding Configuration
const businessName = "StarClean";
const ADMIN_PASSWORD = "jose123";

// Data configuration with default prices
let zones = [
    { id: 'bedrooms', name: "BEDROOMS", desc: "Dormitorios", price: 20 },
    { id: 'bathrooms', name: "BATHROOMS", desc: "Baños", price: 20 },
    { id: 'kitchens', name: "KITCHENS", desc: "Cocinas", price: 20 },
    { id: 'laundry_rooms', name: "LAUNDRY ROOMS", desc: "Lavandería", price: 20 },
    { id: 'study_offices', name: "OFFICES", desc: "Estudios/Oficinas", price: 20 },
    { id: 'living_rooms', name: "LIVING ROOMS", desc: "Salas de estar", price: 20 },
    { id: 'dining_rooms', name: "DINING ROOMS", desc: "Comedores", price: 20 },
    { id: 'hallways', name: "HALLWAYS", desc: "Pasillos", price: 20 },
    { id: 'stairs', name: "STAIRS", desc: "Escaleras", price: 20 },
    { id: 'foyer_entryways', name: "ENTRIES", desc: "Entradas", price: 20 },
    { id: 'walkin_closets', name: "WALK-IN CLOSETS", desc: "Vestidores", price: 20 },
    { id: 'gyms', name: "GYMS", desc: "Gimnasios", price: 20 },
    { id: 'pantries', name: "PANTRIES", desc: "Despensas", price: 20 },
    { id: 'refrigerators', name: "FRIDGES", desc: "Refrigeradores", price: 20 },
    { id: 'ovens', name: "OVENS", desc: "Hornos", price: 20 },
    { id: 'microv', name: "MICROV.", desc: "Microondas", price: 20 },
    { id: 'windows', name: "WINDOWS", desc: "Ventanas", price: 20 }
];

let appliances = []; // Merged into the main list above

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
let isAdmin = false;

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
    values: {}, // id: qty
    condition: 'good', // default condition
    frequency: 'monthly', // default frequency
    serviceType: 'standard' // default service type info
};

window.setServiceType = (val) => {
    state.serviceType = val;
    calculateTotal();
    updateSummary();
    saveState();
};

window.setFrequency = (val) => {
    state.frequency = val;
    document.querySelectorAll('.freq-card').forEach(card => card.classList.remove('active'));
    document.getElementById(`freq-${val}`).classList.add('active');

    updateSummary();
    saveState();
};

window.setCondition = (val) => {
    state.condition = val;
    // Update active UI state
    document.querySelectorAll('.cond-card').forEach(card => card.classList.remove('active'));
    document.getElementById(`cond-${val}`).classList.add('active');

    calculateTotal();
    updateSummary();
    saveState();
};

window.goToScreen = (num) => {
    const s1 = document.getElementById('screen-1');
    const s2 = document.getElementById('screen-2');
    const s3 = document.getElementById('screen-3');
    const s4 = document.getElementById('screen-4');

    // Reset all
    [s1, s2, s3, s4].forEach(s => {
        if (s) {
            s.style.display = 'none';
            s.classList.remove('fade-in');
        }
    });

    // Show target
    const target = num === 1 ? s1 : (num === 2 ? s2 : (num === 3 ? s3 : s4));
    if (target) {
        target.style.display = 'block';
        target.classList.add('fade-in');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Hide/Show header tagline based on screen
    const tagline = document.getElementById('header-tagline');
    if (tagline) {
        tagline.style.display = (num === 4) ? 'none' : 'block';
    }
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

    // Auto-set today's date
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    state.contact.date = today;
    const dateEl = document.getElementById('cust-date');
    if (dateEl) dateEl.value = today;

    if (state.condition) {
        setTimeout(() => window.setCondition(state.condition), 500);
    }
    if (state.frequency) {
        setTimeout(() => window.setFrequency(state.frequency), 600);
    }
    updateSummary();
    calculateTotal(false);
}

function saveState() {
    localStorage.setItem('cleaning_estimate_state_v2', JSON.stringify(state));
}

function renderTableRow(item) {
    const qtyStd = state.values[item.id]?.std || 0;
    const qtyDeep = state.values[item.id]?.deep || 0;
    const priceStd = item.price;
    const priceDeep = item.price * 1.5; // Default deep price logic

    return `
        <div class="table-row">
            <div style="font-weight: 600; color: var(--text-main);">${item.name}</div>
            <div>
                <input type="number" placeholder="0" min="0" 
                    oninput="updateTableQty('${item.id}', 'std', this.value)" 
                    value="${qtyStd || ''}">
            </div>
            <div class="price-cell">$${priceStd.toFixed(0)}</div>
            <div>
                <input type="number" placeholder="0" min="0" 
                    oninput="updateTableQty('${item.id}', 'deep', this.value)" 
                    value="${qtyDeep || ''}">
            </div>
            <div class="price-cell">$${priceDeep.toFixed(0)}</div>
            <div id="subtotal-${item.id}" class="subtotal-cell">
                $${Math.round(priceStd * qtyStd + priceDeep * qtyDeep)}
            </div>
        </div>
    `;
}

function renderAll() {
    const container = document.getElementById('estimate-items-container');
    if (container) {
        container.innerHTML = [
            ...zones.map(z => renderTableRow(z)),
            ...appliances.map(a => renderTableRow(a))
        ].join('');
    }
}

window.updateBasePrice = (id, value) => {
    const val = parseFloat(value) || 0;
    let item = zones.find(z => z.id === id) || appliances.find(a => a.id === id);
    if (item) item.price = val;

    const qty = state.values[id] || 0;
    const subEl = document.getElementById(`subtotal-${id}`);
    if (subEl) subEl.innerText = `Subtotal: $${(val * qty).toFixed(2)}`;

    calculateTotal();
    updateSummary();
};

window.updateTableQty = (id, type, value) => {
    if (!state.values[id]) state.values[id] = { std: 0, deep: 0 };
    if (typeof state.values[id] !== 'object') {
        // Migration from old state
        const oldVal = state.values[id];
        state.values[id] = { std: oldVal, deep: 0 };
    }

    state.values[id][type] = parseFloat(value) || 0;

    let item = zones.find(z => z.id === id) || appliances.find(a => a.id === id);
    const priceStd = item ? item.price : 0;
    const priceDeep = priceStd * 1.5;

    const subEl = document.getElementById(`subtotal-${id}`);
    if (subEl) {
        const subtotal = (priceStd * state.values[id].std) + (priceDeep * state.values[id].deep);
        subEl.innerText = `$${Math.round(subtotal)}`;
    }

    calculateTotal();
    saveState();
};

window.toggleAdmin = () => {
    if (isAdmin) {
        alert("El Modo Admin ya está activo.");
        return;
    }
    const pass = prompt("Clave de administrador:");
    if (pass === ADMIN_PASSWORD) {
        isAdmin = true;
        document.body.classList.add("admin-active");

        const modal = document.getElementById('admin-modal');
        if (modal) modal.classList.add('active');

        const controls = document.querySelector('.preview-controls');
        if (controls) controls.style.display = 'flex';

        renderAll();
        // Hide the lock icon after activation
        const lock = document.getElementById('admin-lock');
        if (lock) lock.style.display = 'none';

        alert("✅ Acceso Concedido.");
    } else if (pass !== null) {
        alert("❌ Clave incorrecta.");
    }
};

window.closeAdmin = () => {
    isAdmin = false;
    document.body.classList.remove("admin-active");
    const modal = document.getElementById('admin-modal');
    if (modal) modal.classList.remove('active');
    const lock = document.getElementById('admin-lock');
    if (lock) lock.style.display = 'block';
    renderAll();
};

window.saveGlobalPrices = async () => {
    if (!db) {
        alert("Firebase no está configurado.");
        return;
    }
    const btn = document.getElementById('save-prices-btn-bar');
    if (!btn) return;

    btn.innerText = "Guardando...";
    btn.disabled = true;

    const prices = {};
    [...zones, ...appliances].forEach(item => {
        prices[item.id] = item.price;
    });

    try {
        await db.collection("settings").doc("prices").set(prices);
        alert("✅ Precios actualizados exitosamente.");
    } catch (e) {
        alert("Error: " + e.message);
    } finally {
        btn.innerText = "💾 Guardar Cambios";
        btn.disabled = false;
    }
};

function calculateTotal(animate = true) {
    let subtotal = 0;
    [...zones, ...appliances].forEach(item => {
        const vals = state.values[item.id] || { std: 0, deep: 0 };
        const priceStd = item.price;
        const priceDeep = item.price * 1.5;

        if (typeof vals === 'object') {
            subtotal += (priceStd * (vals.std || 0)) + (priceDeep * (vals.deep || 0));
        } else {
            subtotal += (priceStd * vals);
        }
    });

    // Apply condition multiplier
    const condMultipliers = { poor: 1.5, fair: 1.25, good: 1.0, verygood: 0.85, pristine: 0.75 };
    const total = subtotal * (condMultipliers[state.condition] || 1);

    const totalEl = document.getElementById('total-price');
    if (!totalEl) return;
    if (animate) {
        animateValue(totalEl, parseFloat(totalEl.innerText) || 0, total, 400);
    } else {
        totalEl.innerText = Math.round(total);
    }
}

function updateSummary() {
    const container = document.getElementById('summary-items');
    if (container) {
        container.innerHTML = '';
    }
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = progress * (end - start) + start;
        obj.innerHTML = Math.round(current);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

window.updateContactData = () => {
    state.contact.name = document.getElementById('cust-name').value;
    state.contact.email = document.getElementById('cust-email').value;
    state.contact.phone = document.getElementById('cust-phone').value;
    state.contact.date = document.getElementById('cust-date').value;
    state.contact.address = document.getElementById('cust-address').value;
    saveState();

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
                } catch (e) { console.log("Lead alert failed:", e); }
            }
        }, 5000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") emailjs.init(EMAILJS_PUBLIC_KEY);
    init();

    const saveBtn = document.getElementById('save-prices-btn-bar');
    if (saveBtn) saveBtn.addEventListener('click', saveGlobalPrices);

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
