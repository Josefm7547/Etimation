import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, X, ChevronLeft, Lock
} from 'lucide-react';
import {
  INITIAL_ZONES, SPECIAL_SERVICE_IDS, i18n,
  EMAILJS_CONFIG, ADMIN_PASSWORD
} from './data/config';
import './styles/App.css';

const App = () => {
  const [screen, setScreen] = useState(1);
  const [lang] = useState('en');
  const [condition, setCondition] = useState('good');
  const [frequency, setFrequency] = useState('monthly');
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [clientQtys, setClientQtys] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [contact, setContact] = useState({
    name: '', email: '', phone: '', address: '',
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  });
  const [loading, setLoading] = useState(true);

  const t = i18n[lang];

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const priceDoc = await getDoc(doc(db, "settings", "prices"));
        if (priceDoc.exists()) {
          const data = priceDoc.data();
          setZones(prev => prev.map(z => ({
            ...z,
            price: data[z.id] !== undefined ? parseFloat(data[z.id]) : z.price
          })));
        }
      } catch (e) { console.error("Error loading prices:", e); }
      finally { setLoading(false); }
    };
    fetchPrices();
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }, []);

  const totals = useMemo(() => {
    let subtotal = 0;
    let hours = 0;
    zones.forEach(zone => {
      const q = clientQtys[zone.id] || { std: 0, deep: 0 };
      const isSpecial = SPECIAL_SERVICE_IDS.includes(zone.id);
      const qtyStd = isSpecial ? 0 : (q.std || 0);
      const qtyDeep = q.deep || 0;
      subtotal += (qtyStd * zone.price) + (qtyDeep * (zone.price * 1.5));
      hours += (qtyStd + qtyDeep);
    });
    const mult = { poor: 1.5, fair: 1.25, good: 1.0, verygood: 0.85, pristine: 0.75 }[condition] || 1;
    return { price: Math.round(subtotal * mult), time: Math.round(hours * mult * 10) / 10 };
  }, [zones, clientQtys, condition]);

  const updateQty = (id, type, val) => {
    setClientQtys(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { std: 0, deep: 0 }), [type]: Math.max(0, parseInt(val) || 0) }
    }));
  };

  const handleSavePrices = async () => {
    try {
      const prices = {};
      zones.forEach(z => prices[z.id] = z.price);
      await setDoc(doc(db, "settings", "prices"), prices);
      alert("✅ Prices saved!");
    } catch (e) { alert("Error: " + e.message); }
  };

  const toggleAdmin = () => {
    if (isAdmin) { setIsAdmin(false); return; }
    const pass = prompt("Admin Password:");
    if (pass === ADMIN_PASSWORD) { setIsAdmin(true); }
    else if (pass !== null) { alert("❌ Incorrect"); }
  };

  if (loading) return <div className="loading">StarClean Loading...</div>;

  return (
    <div className={`app-container ${isAdmin ? 'admin-active' : ''}`}>
      {isAdmin && (
        <div className="admin-bar active">
          <div className="admin-bar-content">
            <div className="admin-info"><strong>🔐 ADMIN MODE</strong></div>
            <div className="admin-actions">
              <button className="btn-save" onClick={handleSavePrices}><Save size={16} /> Save Cloud</button>
              <button className="btn-close" onClick={() => setIsAdmin(false)}><X size={16} /></button>
            </div>
          </div>
        </div>
      )}

      <header>
        <div className="logo-container">
          <h1 className="logo-text">StarClean</h1>
          <p className="tagline">{t.tagline}</p>
        </div>
      </header>

      <main className="container">
        <AnimatePresence mode="wait">
          {screen === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="screen">
              <h2 className="section-title"><span>✦</span> {t.screen1_title}</h2>
              <div className="card-grid">
                {['poor', 'fair', 'good', 'verygood', 'pristine'].map(c => (
                  <div key={c} className={`selection-card ${condition === c ? 'active' : ''}`} onClick={() => setCondition(c)}>
                    <div className="card-letter">{c[0].toUpperCase()}</div>
                    <div className="card-info"><strong>{t[`cond_${c}_title`]}</strong><p>{t[`cond_${c}_desc`]}</p></div>
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={() => setScreen(2)}>{t.next}</button>
            </motion.div>
          )}

          {screen === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="screen">
              <button className="btn-back" onClick={() => setScreen(1)}><ChevronLeft size={16} /> {t.back}</button>
              <h2 className="section-title"><span>✦</span> {t.screen2_title}</h2>
              <div className="card-grid">
                {['weekly', 'biweekly', 'monthly', 'once', 'hiring'].map(f => (
                  <div key={f} className={`selection-card ${frequency === f ? 'active' : ''}`} onClick={() => setFrequency(f)}>
                    <div className="card-letter">{f[0].toUpperCase()}</div>
                    <div className="card-info"><strong>{t[`freq_${f}_title`]}</strong><p>{t[`freq_${f}_desc`]}</p></div>
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={() => setScreen(3)}>{t.next}</button>
            </motion.div>
          )}

          {screen === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="screen">
              <button className="btn-back" onClick={() => setScreen(2)}><ChevronLeft size={16} /> {t.back}</button>
              <h2 className="section-title"><span>✦</span> {t.screen3_title}</h2>
              <div className="info-block"><h3>{t.std_clean_title}</h3><p>{t.std_clean_desc}</p></div>
              <div className="info-block"><h3>{t.deep_clean_title}</h3><p>{t.deep_clean_desc}</p></div>
              <button className="btn-primary" onClick={() => setScreen(4)}>{t.next}</button>
            </motion.div>
          )}

          {screen === 4 && (
            <motion.div key="s4" initial={{ opacity: 1 }} className="screen full-width">
              <div className="calc-layout">
                <div className="calc-main">
                  <div className="modern-table">
                    <div className="t-header">
                      <div>{t.table_header_area}</div>
                      <div>{t.table_header_qty_std}</div>
                      <div>{t.table_header_price_std}</div>
                      <div>{t.table_header_qty_deep}</div>
                      <div>{t.table_header_price_deep}</div>
                      <div>{t.table_header_total}</div>
                    </div>
                    <div className="t-body">
                      {zones.map((zone) => {
                        const isSpecial = SPECIAL_SERVICE_IDS.includes(zone.id);
                        const q = clientQtys[zone.id] || { std: 0, deep: 0 };
                        return (
                          <React.Fragment key={zone.id}>
                            {zone.id === 'refrigerators' && (
                              <div className="t-category-row">
                                <div className="special-services-title">✦ {t.special_services} ✦</div>
                              </div>
                            )}
                            <div className="t-row">
                              <div className="area-name">{t[zone.id]} {isSpecial && <span className="badge">DEEP</span>}</div>
                              {!isSpecial ? (
                                <>
                                  <div className="input-cell"><input type="number" value={q.std || ''} onChange={e => updateQty(zone.id, 'std', e.target.value)} className={q.std > 0 ? 'v-std' : ''} /></div>
                                  <div className="price-cell">
                                    {isAdmin ? <input type="number" value={zone.price} onChange={e => setZones(z => z.map(x => x.id === zone.id ? { ...x, price: parseFloat(e.target.value) } : x))} /> : `$${zone.price}`}
                                  </div>
                                </>
                              ) : (<><div className="empty">-</div><div className="empty">-</div></>)}
                              <div className="input-cell"><input type="number" value={q.deep || ''} onChange={e => updateQty(zone.id, 'deep', e.target.value)} className={q.deep > 0 ? 'v-deep' : ''} /></div>
                              <div className="price-cell">${Math.round(zone.price * 1.5)}</div>
                              <div className="total-cell">${Math.round((isSpecial ? 0 : q.std) * zone.price + q.deep * (zone.price * 1.5))}</div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <aside className="calc-aside">
                  <div className="summary-box">
                    <div className="total-grid">
                      <div className="total-item"><span>Time</span><strong>{totals.time}h</strong></div>
                      <div className="total-item"><span>Total</span><strong className="price-big">${totals.price}</strong></div>
                    </div>
                    <div className="contact-fields">
                      <input placeholder={t.cust_name_placeholder} value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} />
                      <input placeholder={t.cust_phone_placeholder} value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} />
                      <input placeholder="Email Address" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} />
                      <input placeholder={t.cust_address_placeholder} value={contact.address} onChange={e => setContact({ ...contact, address: e.target.value })} />
                    </div>
                    <button className="btn-primary" onClick={() => window.print()}>Save PDF / Print</button>
                  </div>
                </aside>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="admin-trigger" onClick={toggleAdmin}><Lock size={16} /></div>
      <footer><p dangerouslySetInnerHTML={{ __html: t.copyright }} /></footer>
    </div>
  );
};

export default App;
