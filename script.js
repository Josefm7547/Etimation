// Branding Configuration
const businessName = "StarClean";
const ADMIN_PASSWORD = "jose123";

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
    condition: 'good' // default condition
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
    if (num === 1) {
        s1.style.display = 'block';
        s1.classList.add('fade-in');
        s2.style.display = 'none';
        s2.classList.remove('fade-in');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        s1.style.display = 'none';
        s1.classList.remove('fade-in');
        s2.style.display = 'block';
        s2.classList.add('fade-in');
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (state.condition) {
        setTimeout(() => window.setCondition(state.condition), 500);
    }
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

    const inputAttrs = isAdmin ? "" : 'readonly tabindex="-1"';
    const inputStyle = isAdmin ? "" : "border:none; background:transparent; font-weight:700; width:60px; padding:0; cursor:default; outline:none;";

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
                               ${inputAttrs}
                               style="${inputStyle}"
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

    const qty = state.values[id] || 0;
    const subEl = document.getElementById(`subtotal-${id}`);
    if (subEl) subEl.innerText = `Subtotal: $${(val * qty).toFixed(2)}`;

    calculateTotal();
    updateSummary();
};

window.updateQty = (id, value) => {
    state.values[id] = parseFloat(value) || 0;
    let item = zones.find(z => z.id === id) || appliances.find(a => a.id === id);
    const price = item ? item.price : 0;
    const subEl = document.getElementById(`subtotal-${id}`);
    if (subEl) subEl.innerText = `Subtotal: $${(price * state.values[id]).toFixed(2)}`;

    calculateTotal();
    updateSummary();
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
        const qty = state.values[item.id] || 0;
        subtotal += (item.price * qty);
    });

    // Apply condition multiplier
    const multipliers = {
        poor: 1.5,
        fair: 1.25,
        good: 1.0,
        verygood: 0.85,
        pristine: 0.75
    };
    const total = subtotal * (multipliers[state.condition] || 1);

    const totalEl = document.getElementById('total-price');
    if (!totalEl) return;
    if (animate) {
        animateValue(totalEl, parseFloat(totalEl.innerText) || 0, total, 400);
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
        const qty = state.values[item.id] || 0;
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

    const conditionNames = {
        poor: "Pobre",
        fair: "Regular",
        good: "Bueno",
        verygood: "Muy Bueno",
        pristine: "Impecable"
    };

    html += `
        <div class="summary-item" style="border-top: 1px solid var(--card-border); padding-top: 1rem; margin-top: 1rem;">
            <span>Estado del Hogar:</span>
            <span style="color: var(--secondary); font-weight: 600;">${conditionNames[state.condition]}</span>
        </div>
    `;

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
                const conditionNames = { poor: "Pobre", fair: "Regular", good: "Bueno", verygood: "Muy Bueno", pristine: "Impecable" };
                const detailsText = `Estado del Hogar: ${conditionNames[state.condition]}\n\n` + [...zones, ...appliances]
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

    const printBtn = document.getElementById('print-btn');
    if (printBtn) printBtn.addEventListener('click', () => window.print());
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
