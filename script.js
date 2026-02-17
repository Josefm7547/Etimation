// Branding Configuration
const businessName = "StarClean";
const ADMIN_PASSWORD = "jose123";

// Data configuration with default prices
let zones = [
    { id: 'bedrooms', price: 20 },
    { id: 'bathrooms', price: 20 },
    { id: 'kitchens', price: 20 },
    { id: 'laundry_rooms', price: 20 },
    { id: 'study_offices', price: 20 },
    { id: 'living_rooms', price: 20 },
    { id: 'dining_rooms', price: 20 },
    { id: 'hallways', price: 20 },
    { id: 'stairs', price: 20 },
    { id: 'foyer_entryways', price: 20 },
    { id: 'walkin_closets', price: 20 },
    { id: 'gyms', price: 20 },
    { id: 'pantries', price: 20 },
    { id: 'refrigerators', price: 20 },
    { id: 'ovens', price: 20 },
    { id: 'microv', price: 20 },
    { id: 'windows', price: 20 }
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

// Translation Dictionary
const i18n = {
    en: {
        tagline: "Smart estimate calculator for professional home cleaning.",
        screen1_title: "What is the current condition of your home?",
        next: "Next ➔",
        back: "← Back",
        cond_poor_title: "HEAVY BUILD-UP",
        cond_poor_desc: "Extreme dirt; requires deep cleaning.",
        cond_fair_title: "AVERAGE CONDITION",
        cond_fair_desc: "Visible dirt; requires regular attention.",
        cond_good_title: "WELL-MAINTAINED",
        cond_good_desc: "Basic care; some areas require maintenance.",
        cond_verygood_title: "EXCELLENT CONDITION",
        cond_verygood_desc: "Well maintained; requires minimal cleaning.",
        cond_pristine_title: "PRISTINE",
        cond_pristine_desc: "Excellent cleanliness and order.",
        screen2_title: "How often do you clean your home?",
        freq_weekly_title: "WEEKLY",
        freq_weekly_desc: "Scheduled service once a week.",
        freq_biweekly_title: "BI-WEEKLY",
        freq_biweekly_desc: "Scheduled service every two weeks.",
        freq_monthly_title: "MONTHLY",
        freq_monthly_desc: "Scheduled service once a month.",
        freq_once_title: "ONE-TIME / OCCASIONAL",
        freq_once_desc: "Occasional cleaning as needed.",
        freq_hiring_title: "LOOKING TO START REGULAR SERVICE",
        freq_hiring_desc: "First time or looking for recurring service.",
        screen3_title: "Important Service Information",
        std_clean_title: "Standard Cleaning",
        std_clean_desc: "Routine cleaning of kitchen, bathrooms, and living areas; focused on surfaces and general tidiness.",
        deep_clean_title: "Deep Cleaning",
        deep_clean_desc: "Intensive cleaning requiring extra effort and attention to detail; targets built-up grime throughout the home.",
        service_note: "Note: Estimated prices are based on standard cleaning. Final cost may vary depending on the level of deep cleaning required.",
        table_header_area: "AREA / ITEM",
        table_header_qty_std: "QTY STD",
        table_header_price_std: "$ STD",
        table_header_qty_deep: "QTY DEEP",
        table_header_price_deep: "$ DEEP",
        table_header_total: "TOTAL",
        special_services: "SPECIAL SERVICES",
        estimated_total: "Estimated Total:",
        estimated_time: "Estimated Time:",
        guarantee: "🛡️ 100% Satisfaction Guaranteed on every cleaning",
        inspection_note: "Price subject to detailed on-site inspection.",
        cust_info_title: "Customer Information",
        cust_name_label: "Full Name *",
        cust_name_placeholder: "e.g. John Doe",
        cust_phone_label: "WhatsApp / Phone (USA) *",
        cust_phone_placeholder: "(555) 000-0000",
        cust_date_label: "Request Date (Auto)",
        cust_address_label: "Property Address (for quote only) *",
        cust_address_placeholder: "123 Main St, City, Zip",
        admin_mode: "🔐 Admin Mode",
        admin_desc: "Edit prices and save to the cloud.",
        close: "Close",
        save_changes: "💾 Save Changes",
        copyright: "&copy; 2024 StarClean. All rights reserved.",
        bedrooms: "BEDROOMS",
        bedrooms_desc: "Bedrooms",
        bathrooms: "BATHROOMS",
        bathrooms_desc: "Bathrooms",
        kitchens: "KITCHENS",
        kitchens_desc: "Kitchens",
        laundry_rooms: "LAUNDRY ROOMS",
        laundry_rooms_desc: "Laundry Rooms",
        study_offices: "OFFICES",
        study_offices_desc: "Study/Offices",
        living_rooms: "LIVING ROOMS",
        living_rooms_desc: "Living Rooms",
        dining_rooms: "DINING ROOMS",
        dining_rooms_desc: "Dining Rooms",
        hallways: "HALLWAYS",
        hallways_desc: "Hallways",
        stairs: "STAIRS",
        stairs_desc: "Stairs",
        foyer_entryways: "ENTRIES",
        foyer_entryways_desc: "Entries",
        walkin_closets: "WALK-IN CLOSETS",
        walkin_closets_desc: "Walk-in Closets",
        gyms: "GYMS",
        gyms_desc: "Gyms",
        pantries: "PANTRIES",
        pantries_desc: "Pantries",
        refrigerators: "FRIDGES",
        refrigerators_desc: "Refrigerators",
        ovens: "OVENS",
        ovens_desc: "Ovens",
        microv: "MICROV.",
        microv_desc: "Microwaves",
        windows: "WINDOWS",
        windows_desc: "Windows"
    }
};

// State management
let state = {
    contact: { name: '', email: '', phone: '', date: '', address: '' },
    values: {}, // id: qty
    condition: 'good', // default condition
    frequency: 'monthly', // default frequency
    serviceType: 'standard', // default service type info
    lang: 'en' // Always English
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

    // Hide/Show float-lang-container based on screen
    const langBtn = document.getElementById('float-lang-container');
    if (langBtn) {
        langBtn.style.display = (num === 1) ? 'block' : 'none';
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
    // State persistence disabled per user request: client values reset on refresh
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
    // Apply initial translation
    translateUI();
}

function saveState() {
    // Persistence disabled
}

function renderTableRow(item) {
    const qtyStd = state.values[item.id]?.std || 0;
    const qtyDeep = state.values[item.id]?.deep || 0;
    const priceStd = item.price;
    const priceDeep = priceStd * 1.5;

    // Check if it's a special service to hide Standard options
    const isSpecial = ['refrigerators', 'ovens', 'microv', 'windows'].includes(item.id);

    const translatedName = i18n[state.lang][item.id] || item.id.toUpperCase();
    const translatedDesc = i18n[state.lang][`${item.id}_desc`] || '';

    return `
        <div class="table-row">
            <div style="font-weight: 500; position: relative;">
                <span style="display: inline-block; color: var(--text-main); font-weight: 700; letter-spacing: 0.05rem;">
                    ${translatedName}${isSpecial ? '<span class="deep-badge">Deep</span>' : ''}
                </span>
                <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">${translatedDesc}</span>
            </div>
            
            ${isSpecial ? `
                <div style="color: var(--text-muted); opacity: 0.5;">-</div>
                <div class="price-cell" style="color: var(--text-muted); opacity: 0.5;">-</div>
            ` : `
                <div>
                    <input type="number" placeholder="0" min="0" 
                        class="${qtyStd > 0 ? 'active-input' : ''}"
                        oninput="updateTableQty('${item.id}', 'std', this)" 
                        value="${qtyStd || ''}">
                </div>
                <div class="price-cell">$${priceStd.toFixed(0)}</div>
            `}

            <div>
                <input type="number" placeholder="0" min="0" 
                    class="${qtyDeep > 0 ? 'active-input-deep' : ''}"
                    oninput="updateTableQty('${item.id}', 'deep', this)" 
                    value="${qtyDeep || ''}">
            </div>
            <div class="price-cell">$${priceDeep.toFixed(0)}</div>
            <div id="subtotal-${item.id}" class="subtotal-cell">
                $${Math.round((isSpecial ? 0 : qtyStd) * priceStd + qtyDeep * priceDeep)}
            </div>
        </div>
    `;
}

function renderAll() {
    const container = document.getElementById('estimate-items-container');
    if (!container) return;

    let html = '';
    zones.forEach(item => {
        if (item.id === 'refrigerators') {
            html += `
                <div class="table-row table-category-header">
                    <div class="special-services-title" style="grid-column: 1 / -1; text-align: center; color: #00d2ff; font-weight: 800; letter-spacing: 0.3rem; font-size: 2.2rem; padding: 1.5rem 0; text-shadow: 0 0 15px rgba(0, 210, 255, 0.6); width: 100%;">
                        ✦ SPECIAL SERVICES ✦
                    </div>
                </div>
            `;
        }
        html += renderTableRow(item);
    });

    container.innerHTML = html;
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

window.updateTableQty = (id, type, el) => {
    // Determine value: 'el' can be the input element or raw value (for backward compat if needed)
    let value = 0;
    if (typeof el === 'object' && el.value !== undefined) {
        value = el.value;
        // Toggle active styling based on type
        const activeClass = type === 'deep' ? 'active-input-deep' : 'active-input';
        const otherClass = type === 'deep' ? 'active-input' : 'active-input-deep';
        if (parseFloat(value) > 0) {
            el.classList.add(activeClass);
            el.classList.remove(otherClass);
        } else {
            el.classList.remove(activeClass);
            el.classList.remove(otherClass);
        }
    } else {
        value = el;
    }

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
    let totalHours = 0;
    const specialIds = ['refrigerators', 'ovens', 'microv', 'windows'];

    // Time factors (in hours)
    const TIME_PER_UNIT = 1.0;

    [...zones, ...appliances].forEach(item => {
        const vals = state.values[item.id] || { std: 0, deep: 0 };
        const priceStd = item.price;
        const priceDeep = item.price * 1.5;
        const isSpecial = specialIds.includes(item.id);

        if (typeof vals === 'object') {
            const qtyStd = isSpecial ? 0 : (vals.std || 0);
            const qtyDeep = vals.deep || 0;

            subtotal += (priceStd * qtyStd) + (priceDeep * qtyDeep);
            totalHours += (qtyStd + qtyDeep) * TIME_PER_UNIT;
        } else {
            subtotal += (priceStd * vals);
            totalHours += (vals * TIME_PER_UNIT);
        }
    });

    // Apply condition multiplier
    const condMultipliers = { poor: 1.5, fair: 1.25, good: 1.0, verygood: 0.85, pristine: 0.75 };
    const multiplier = condMultipliers[state.condition] || 1;

    const total = subtotal * multiplier;
    const finalHours = totalHours * multiplier;

    const totalEl = document.getElementById('total-price');
    const tableTotalEl = document.getElementById('table-total-price');
    const tableTimeEl = document.getElementById('table-total-time');

    if (totalEl) {
        if (animate) animateValue(totalEl, parseFloat(totalEl.innerText) || 0, total, 400);
        else totalEl.innerText = Math.round(total);
    }

    if (tableTotalEl) {
        if (animate) animateValue(tableTotalEl, parseFloat(tableTotalEl.innerText) || 0, total, 400);
        else tableTotalEl.innerText = Math.round(total);
    }

    if (tableTimeEl) {
        // Round to 1 decimal place for cleaner display
        const displayHours = Math.round(finalHours * 10) / 10;
        if (animate) animateValue(tableTimeEl, parseFloat(tableTimeEl.innerText) || 0, displayHours, 400);
        else tableTimeEl.innerText = displayHours;
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

window.translateUI = () => {
    // Everything is English only now
    const t_set = i18n.en;

    // Logo & Tagline
    const tagline = document.getElementById('header-tagline');
    if (tagline) tagline.innerText = t_set.tagline;

    // Screen 1
    const s1_title = document.querySelector('#screen-1 .section-title');
    if (s1_title) s1_title.innerHTML = `<span>✦</span> ${t_set.screen1_title}`;

    // Condition Cards
    const conds = ['poor', 'fair', 'good', 'verygood', 'pristine'];
    conds.forEach(c => {
        const title = document.querySelector(`#cond-${c} strong`);
        const desc = document.querySelector(`#cond-${c} p`);
        if (title) title.innerText = t_set[`cond_${c}_title`];
        if (desc) desc.innerText = t_set[`cond_${c}_desc`];
    });

    // Screen 2
    const s2_title = document.querySelector('#screen-2 .section-title');
    if (s2_title) s2_title.innerHTML = `<span>✦</span> ${t_set.screen2_title}`;

    const freqs = ['weekly', 'biweekly', 'monthly', 'once', 'hiring'];
    freqs.forEach(f => {
        const title = document.querySelector(`#freq-${f} strong`);
        const desc = document.querySelector(`#freq-${f} p`);
        if (title) title.innerText = t_set[`freq_${f}_title`];
        if (desc) desc.innerText = t_set[`freq_${f}_desc`];
    });

    // Screen 3
    const s3_title = document.querySelector('#screen-3 .section-title');
    if (s3_title) s3_title.innerHTML = `<span>✦</span> ${t_set.screen3_title}`;

    const std_clean_block = document.querySelector('#screen-3 .info-block:nth-of-type(1)');
    if (std_clean_block) {
        std_clean_block.querySelector('h3').innerText = t_set.std_clean_title;
        std_clean_block.querySelector('p').innerText = t_set.std_clean_desc;
    }
    const deep_clean_block = document.querySelector('#screen-3 .info-block:nth-of-type(2)');
    if (deep_clean_block) {
        deep_clean_block.querySelector('h3').innerText = t_set.deep_clean_title;
        deep_clean_block.querySelector('p').innerText = t_set.deep_clean_desc;
    }
    const s3_note = document.querySelector('#screen-3 > section > p');
    if (s3_note) s3_note.innerText = t_set.service_note;

    // Buttons
    document.querySelectorAll('.btn-primary').forEach(btn => {
        if (btn.innerText.includes('Next') || btn.innerText.includes('➔')) {
            btn.innerHTML = t_set.next;
        }
    });
    document.querySelectorAll('.btn-secondary').forEach(btn => {
        if (btn.innerText.includes('Back') || btn.innerText.includes('←')) {
            btn.innerHTML = t_set.back;
        }
    });

    // Screen 4
    const table_headers = document.querySelectorAll('.table-header div');
    if (table_headers.length >= 6) {
        table_headers[0].innerText = t_set.table_header_area;
        table_headers[1].innerText = t_set.table_header_qty_std;
        table_headers[2].innerText = t_set.table_header_price_std;
        table_headers[3].innerText = t_set.table_header_qty_deep;
        table_headers[4].innerText = t_set.table_header_price_deep;
        table_headers[5].innerText = t_set.table_header_total;
    }

    const special_header = document.querySelector('.special-services-title');
    if (special_header) special_header.innerText = `✦ ${t_set.special_services} ✦`;

    const labelTotal = document.getElementById('label-total');
    if (labelTotal) labelTotal.innerText = t_set.estimated_total;

    const labelTime = document.getElementById('label-time');
    if (labelTime) labelTime.innerText = t_set.estimated_time;

    const guarantee_text = document.querySelector('#screen-4 p[style*="font-weight: 500"]');
    if (guarantee_text) guarantee_text.innerText = t_set.guarantee;

    const inspection_note = document.querySelector('.summary-card p[style*="font-style: italic"]');
    if (inspection_note) inspection_note.innerText = t_set.inspection_note;

    const cust_info_title = document.querySelector('.compact-form h3');
    if (cust_info_title) cust_info_title.innerText = t_set.cust_info_title;

    // Form labels and placeholders
    const name_label = document.querySelector('.compact-field:nth-child(2) label');
    const name_input = document.getElementById('cust-name');
    if (name_label) name_label.innerText = t_set.cust_name_label;
    if (name_input) name_input.placeholder = t_set.cust_name_placeholder;

    const phone_label = document.querySelector('.compact-field:nth-child(3) label');
    const phone_input = document.getElementById('cust-phone');
    if (phone_label) phone_label.innerText = t_set.cust_phone_label;
    if (phone_input) phone_input.placeholder = t_set.cust_phone_placeholder;

    const email_label = document.querySelector('.compact-field:nth-child(4) label');
    const email_input = document.getElementById('cust-email');
    if (email_label) email_label.innerText = 'Email Address *';
    if (email_input) email_input.placeholder = 'john@example.com';

    // Address is the 5th child
    const address_label = document.querySelector('.compact-field:nth-child(5) label');
    const address_input = document.getElementById('cust-address');
    if (address_label) address_label.innerText = t_set.cust_address_label;
    if (address_input) address_input.placeholder = t_set.cust_address_placeholder;

    const date_label = document.querySelector('.compact-field:nth-child(6) label');
    if (date_label) date_label.innerText = t_set.cust_date_label;

    // Footer
    const footer_copy = document.querySelector('footer p');
    if (footer_copy) footer_copy.innerHTML = t_set.copyright;

    // Admin Bar
    const admin_info_title = document.querySelector('.admin-info strong');
    const admin_info_desc = document.querySelector('.admin-info span');
    if (admin_info_title) admin_info_title.innerText = t_set.admin_mode;
    if (admin_info_desc) admin_info_desc.innerText = t_set.admin_desc;

    const close_btn = document.querySelector('.admin-actions .btn-secondary');
    if (close_btn) close_btn.innerText = t_set.close;

    const save_btn = document.getElementById('save-prices-btn-bar');
    if (save_btn) save_btn.innerHTML = `💾 ${t_set.save_changes}`;

    // Refresh today's date in correct language
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    state.contact.date = today;
    const dateEl = document.getElementById('cust-date');
    if (dateEl) dateEl.value = today;

    // Update language toggle button text
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) langBtn.innerText = lang === 'en' ? 'Español 🇪🇸' : 'English 🇺🇸';

    // Re-render table items with correct area names
    renderAll();
};

// Language toggle removed as per request (English only)
