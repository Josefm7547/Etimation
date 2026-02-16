// Branding Configuration
const businessName = "StarClean"; // <--- CAMBIA TU NOMBRE AQUÍ

// Data configuration
const zones = [
    { id: 'sala', name: "Sala", desc: "Limpieza de áreas sociales" },
    { id: 'cocina', name: "Cocina", desc: "Desengrasado y superficies" },
    { id: 'baño', name: "Baño", desc: "Desinfección profunda" },
    { id: 'dormitorio', name: "Dormitorio", desc: "Orden y limpieza general" }
];

const appliances = [
    { id: 'refri', name: "Refrigerador", desc: "Limpieza interior/exterior" },
    { id: 'horno', name: "Horno", desc: "Eliminación de grasa" },
    { id: 'lavadora', name: "Lavadora", desc: "Limpieza de filtros" },
    { id: 'secadora', name: "Secadora", desc: "Limpieza de conductos" }
];

// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id"
};

// EmailJS Configuration (Sign up at emailjs.com to get these)
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "service_default";
const EMAILJS_TEMPLATE_ID = "template_quote";

let db = null;
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
    values: {} // id: { price: 0, qty: 0 }
};

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
    } else {
        [...zones, ...appliances].forEach(item => {
            state.values[item.id] = { price: 0, qty: 0 };
        });
    }
    renderAll();
    updateSummary();
    calculateTotal(false);
}

function saveState() {
    localStorage.setItem('cleaning_estimate_state_v2', JSON.stringify(state));
}

function renderItemCard(item, containerId) {
    const data = state.values[item.id] || { price: 0, qty: 0 };
    return `
        <div class="item-card">
            <div class="item-info">
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
            </div>
            <div class="inputs-row" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <div class="field" style="flex: 1; min-width: 100px;">
                    <label style="font-size: 0.75rem;">Precio $</label>
                    <input type="number" 
                           placeholder="0.00" 
                           min="0" 
                           oninput="updateItem('${item.id}', 'price', this.value)"
                           value="${data.price || ''}">
                </div>
                <div class="field" style="flex: 1; min-width: 80px;">
                    <label style="font-size: 0.75rem;">Cantidad</label>
                    <input type="number" 
                           placeholder="0" 
                           min="0" 
                           oninput="updateItem('${item.id}', 'qty', this.value)"
                           value="${data.qty || ''}">
                </div>
            </div>
            <div id="subtotal-${item.id}" style="text-align: right; font-size: 0.9rem; color: var(--primary); font-weight: 600; margin-top: 0.5rem;">
                Subtotal: $${(data.price * data.qty).toFixed(2)}
            </div>
        </div>
    `;
}

function renderAll() {
    document.getElementById('zones-container').innerHTML = zones.map(z => renderItemCard(z)).join('');
    document.getElementById('appliances-container').innerHTML = appliances.map(a => renderItemCard(a)).join('');
}

window.updateItem = (id, field, value) => {
    if (!state.values[id]) state.values[id] = { price: 0, qty: 0 };
    state.values[id][field] = parseFloat(value) || 0;

    // Update Subtotal UI instantly
    const sub = state.values[id].price * state.values[id].qty;
    document.getElementById(`subtotal-${id}`).innerText = `Subtotal: $${sub.toFixed(2)}`;

    calculateTotal();
    updateSummary();
    saveState();
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
                } catch (e) { console.log("Lead alert waiting for config."); }
            }
        }, 5000); // Wait 5 seconds of inactivity to send
    }
};

function calculateTotal(animate = true) {
    let total = 0;
    Object.values(state.values).forEach(val => {
        total += (val.price * val.qty);
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
    let html = '';
    let hasItems = false;

    [...zones, ...appliances].forEach(item => {
        const val = state.values[item.id];
        if (val && val.qty > 0 && val.price > 0) {
            hasItems = true;
            html += `
                <div class="summary-item">
                    <span>${item.name} (${val.qty} x $${val.price})</span>
                    <span>$${(val.qty * val.price).toFixed(2)}</span>
                </div>
            `;
        }
    });

    container.innerHTML = hasItems ? html : '<p style="color: var(--text-muted); text-align: center;">Agregue precios y cantidades para ver el resumen.</p>';
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

window.closeModal = () => {
    document.getElementById('success-modal').classList.remove('active');
    localStorage.removeItem('cleaning_estimate_state_v2');
    location.reload();
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS
    if (EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
    // Update Branding in UI
    const logo = document.querySelector('header h1');
    if (logo) logo.innerText = businessName;
    document.title = `${businessName} | Cotización`;

    init();

    document.getElementById('book-btn').addEventListener('click', async function () {
        const total = parseFloat(document.getElementById('total-price').innerText);
        if (!state.contact.name || !state.contact.email || !state.contact.date) {
            alert('Complete los campos obligatorios del cliente.');
            return;
        }
        if (total <= 0) {
            alert('Agregue al menos un item con precio y cantidad.');
            return;
        }

        const btn = this;
        const originalText = btn.innerText;
        btn.innerText = "Procesando...";
        btn.disabled = true;

        try {
            // 1. Save to Database
            if (db) {
                await db.collection("estimates").add({
                    ...state.contact,
                    details: state.values,
                    total: total,
                    date: new Date().toISOString()
                });
            } else {
                await new Promise(r => setTimeout(r, 800));
            }

            // 2. Send email via EmailJS (if configured)
            if (EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
                const summaryText = Object.entries(state.values)
                    .filter(([id, val]) => val.qty > 0)
                    .map(([id, val]) => `${id}: ${val.qty} x $${val.price}`)
                    .join("\n");

                await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                    to_email: "josefm7547@gmail.com",
                    from_name: state.contact.name,
                    customer_email: state.contact.email,
                    customer_phone: state.contact.phone,
                    service_date: state.contact.date,
                    address: state.contact.address,
                    total_amount: `$${total.toFixed(2)}`,
                    details: summaryText
                });
            }

            const summary = document.getElementById('ticket-summary');
            summary.innerHTML = `
                <strong>Ticket: #${Math.random().toString(36).substr(2, 7).toUpperCase()}</strong><br>
                Cliente: ${state.contact.name}<br>
                Total: $${total.toFixed(2)}
            `;
            document.getElementById('success-modal').classList.add('active');
        } catch (e) {
            alert("Error al guardar.");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    document.getElementById('print-btn').addEventListener('click', () => window.print());
});
