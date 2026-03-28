import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { Link, useLocation } from "react-router-dom";

// ══════════════════════════════════════════
// ESTATE LAND — www.estateland.us
// Exclusive real estate lead platform for United States
// Aesthetic: Dark editorial × cinematic luxury
// ══════════════════════════════════════════

const C = {
  void: "#080808",
  surface: "#0f0f0f",
  surfaceLight: "#161616",
  cream: "#f5f0e8",
  creamDim: "rgba(245,240,232,0.95)",
  mute: "rgba(245,240,232,0.82)",
  gold: "#c9a227",
  goldLight: "#d4a574",
  goldDim: "rgba(201,162,39,0.25)",
  white: "#ffffff",
  border: "rgba(240,235,227,0.12)",
  borderHover: "rgba(201,162,39,0.4)",
};

// Section themes: dark = dark bg + light text; light = light bg + dark text
const THEME = {
  dark: {
    bg: C.void,
    text: C.cream,
    textDim: C.creamDim,
    mute: C.mute,
    border: C.border,
    accent: C.gold,
    accentDim: C.goldDim,
  },
  light: {
    bg: "#f5f0e8",
    text: "#0f0f0f",
    textDim: "rgba(15,15,15,0.85)",
    mute: "rgba(15,15,15,0.6)",
    border: "rgba(0,0,0,0.1)",
    accent: "#a67c00",
    accentDim: "rgba(166,124,0,0.2)",
  },
};

const font = {
  display: "'Cormorant Garamond', serif",
  body: "'Plus Jakarta Sans', sans-serif",
};

// ─── HOOKS ───
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useCounter(end, dur = 2200, go) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!go) return;
    let t = 0;
    const step = end / (dur / 16);
    const id = setInterval(() => { t += step; if (t >= end) { setVal(end); clearInterval(id); } else setVal(Math.floor(t)); }, 16);
    return () => clearInterval(id);
  }, [end, dur, go]);
  return val;
}

function useMouseParallax(intensity = 0.02) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e) => {
      const x = (e.clientX - window.innerWidth / 2) * intensity;
      const y = (e.clientY - window.innerHeight / 2) * intensity;
      setOffset({ x, y });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [intensity]);
  return offset;
}

const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

// Shared pricing plan data (used by Plans section and Onboarding)
export const PRICING_PLANS = [
  { id: "launch", name: "Launch", price: "$329", period: "6 months", fee: "20% at closing", popular: false, features: ["Up to 3 exclusive leads / month", "Exclusive buyer & seller leads", "Double-verified seller intent", "Dedicated ZIP code territory", "CRM setup & integration", "Live support & onboarding", "Money-back guarantee"], agreement: "/Estate_Land_Membership_Agreement - Launch.pdf" },
  { id: "growth", name: "Growth", price: "$549", period: "1 year", fee: "15% at closing", popular: true, badge: "Most popular", features: ["Up to 5 exclusive leads / month", "Exclusive buyer & seller leads", "Double-verified seller intent", "Listing appointments set for you", "Agent profile & SEO optimization", "Full CRM setup & automation", "Live call transfer to sellers", "Priority live support", "Weekly campaign reporting", "Money-back guarantee"], agreement: "/Estate_Land_Membership_Agreement -Growth.pdf" },
  { id: "premier", name: "Premier", price: "$1,050", period: "Lifetime", fee: "10% at closing", popular: false, badge: "Best Results", features: ["Up to 7 exclusive leads / month", "Exclusive buyer & seller leads", "Double-verified seller intent", "Listing appointments set for you", "Custom IDX website & branding", "Unified CRM platform & automation", "Live call transfer to sellers", "Priority 24/7 support", "Dedicated account manager", "Quarterly strategy reviews", "Referral network access", "Money-back guarantee"], agreement: "/Estate_Land_Membership_Agreement - Premier.pdf" }
];
export { THEME, font, C };

// —— GLOBAL STYLES ——
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
      *{margin:0;padding:0;box-sizing:border-box}
      html{scroll-behavior:smooth;scroll-padding-top:80px;-webkit-text-size-adjust:100%;-moz-text-size-adjust:100%;text-size-adjust:100%}
      body{background:${C.void};color:${C.cream};overflow-x:hidden;-webkit-font-smoothing:antialiased;-webkit-overflow-scrolling:touch;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
      img,video{max-width:100%;height:auto;display:block}
      a,button{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
      a,button,input,select,textarea{min-height:44px}
      button{cursor:pointer}
      ::selection{background:${C.goldDim};color:${C.goldLight}}
      ::-webkit-scrollbar{width:6px}
      ::-webkit-scrollbar-track{background:${C.surface}}
      ::-webkit-scrollbar-thumb{background:${C.gold};border-radius:3px}
      input::placeholder,textarea::placeholder{color:${C.mute}}
      #contact input::placeholder,#contact textarea::placeholder{color:rgba(15,15,15,0.5)}
      .hover-lift,.plan-card,.service-card,.faq-item{will-change:transform;-webkit-backface-visibility:hidden;backface-visibility:hidden}
      @media (prefers-reduced-motion:reduce){
        *,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;scroll-behavior:auto!important}
        html{scroll-behavior:auto}
        .hover-lift:hover{transform:none!important}
      }
      @media (hover:none){.hover-lift:hover{transform:none!important}}
      @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideLeft{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes expandLine{from{width:0}to{width:64px}}
      @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      @keyframes marqueeScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
      @keyframes marqueeScrollReverse{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
      @keyframes marqueeShine{0%{opacity:0.3}50%{opacity:0.6}100%{opacity:0.3}}
      @keyframes marqueeReveal{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      @keyframes marqueeLineDraw{from{transform:scaleX(0);opacity:0}to{transform:scaleX(1);opacity:1}}
      @keyframes marqueeHeadlineIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes marqueeTrackIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      @keyframes marqueeShineSweep{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
      @keyframes logoGoldGlow{0%,100%{box-shadow:0 0 20px rgba(201,162,39,0.25),0 0 40px rgba(201,162,39,0.12)}50%{box-shadow:0 0 30px rgba(201,162,39,0.35),0 0 60px rgba(201,162,39,0.18)}}
      @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
      @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
      @keyframes spinSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes scaleIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
      @keyframes processStepIn {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes processStepNumPulse{0%,100%{opacity:0.06;transform:scale(1)}50%{opacity:0.12;transform:scale(1.02)}}
      @keyframes processTimelineDraw{from{stroke-dashoffset:1200}to{stroke-dashoffset:0}}
      @keyframes processTimelineGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
      @keyframes processStepIconPop{0%{opacity:0;transform:scale(0.3)}60%{transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}
      @keyframes processStepRing{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(1.15);opacity:0}}
      @keyframes processMapPulse{0%,100%{opacity:0.9;transform:scale(1)}50%{opacity:1;transform:scale(1.03)}}
      @keyframes processCardShine{0%{background-position:200% center}100%{background-position:-200% center}}
      @keyframes faqItemIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      @keyframes faqAccentLine{from{transform:scaleY(0);opacity:0}to{transform:scaleY(1);opacity:1}}
      @keyframes servicesReveal{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes servicesTitleIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      @keyframes servicesOwnUnderline{0%{width:0;opacity:0}70%{opacity:1}100%{width:100%;opacity:1}}
      @keyframes servicesGoldLine{from{transform:scaleX(0);transform-origin:left}to{transform:scaleX(1);transform-origin:left}}
      @keyframes servicesBgShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
      .reveal{opacity:0;transform:translateY(36px);transition:opacity 0.9s cubic-bezier(.22,1,.36,1),transform 0.9s cubic-bezier(.22,1,.36,1)}
      .reveal.visible{opacity:1;transform:translateY(0)}
      .reveal-d1{transition-delay:0.08s}.reveal-d2{transition-delay:0.16s}.reveal-d3{transition-delay:0.24s}.reveal-d4{transition-delay:0.32s}
      .hover-lift{transition:transform 0.4s cubic-bezier(.22,1,.36,1);will-change:transform}
      .hover-lift:hover{transform:translateY(-4px)}
      @media (hover:none){.hover-lift:hover{transform:none}}
      .gold-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 36px;min-height:48px;border:none;cursor:pointer;font-family:${font.body};font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;background:${C.gold};color:${C.void};transition:background 0.35s cubic-bezier(.22,1,.36,1),color 0.35s,transform 0.35s cubic-bezier(.22,1,.36,1),box-shadow 0.35s;position:relative;overflow:hidden}
      .gold-btn:after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);transition:left 0.5s ease}
      .gold-btn:hover{background:${C.goldLight};transform:translateY(-2px);box-shadow:0 8px 32px rgba(201,162,39,0.25)}
      .gold-btn:hover:after{left:100%}
      .gold-btn:active{transform:translateY(0);box-shadow:none}
      .mobile-drawer{position:fixed;top:0;right:0;width:min(320px,85vw);height:100vh;height:100dvh;background:rgba(8,8,8,0.98);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);transform:translateX(100%);transition:transform 0.4s cubic-bezier(0.4,0,0.2,1);z-index:10001;padding:80px 32px 32px;display:flex;flex-direction:column;gap:8px;overflow-y:auto;-webkit-overflow-scrolling:touch}
      .mobile-drawer.open{transform:translateX(0)}
      .mobile-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:10000;opacity:0;pointer-events:none;transition:opacity 0.3s ease}
      .mobile-backdrop.open{opacity:1;pointer-events:auto}
      .plans-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2vw,24px);width:100%;max-width:1200px;margin:0 auto}
      @media(max-width:1024px){.plans-grid{grid-template-columns:repeat(2,1fr)}.plans-grid>*:last-child{grid-column:1/-1;max-width:50%;justify-self:center}}
      @media(max-width:768px){.plans-grid{grid-template-columns:1fr;max-width:480px}.plans-grid>*:last-child{max-width:100%}}
      @media(max-width:640px){body{font-size:15px}}
      @media(max-width:480px){body{font-size:14px}}
      @media(max-height:500px) and (orientation:landscape){.mobile-drawer{width:60vw}}
      @media print{body{background:#fff;color:#000}nav,.mobile-drawer,.mobile-backdrop{display:none!important}}
      .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
      .outline-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:16px 36px;min-height:48px;border:1.5px solid ${C.gold};background:transparent;color:${C.gold};cursor:pointer;font-family:${font.body};font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;transition:background 0.4s cubic-bezier(.22,1,.36,1),color 0.4s,transform 0.35s cubic-bezier(.22,1,.36,1),box-shadow 0.35s;position:relative;overflow:hidden}
      .outline-btn:after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(201,162,39,0.08),transparent);transition:left 0.5s ease}
      .outline-btn:hover{background:${C.gold};color:${C.void};transform:translateY(-2px);box-shadow:0 8px 32px rgba(201,162,39,0.18)}
      .outline-btn:hover:after{left:100%}
      .outline-btn:active{transform:translateY(0);box-shadow:none}
    

/* ══════ NAVBAR RESPONSIVE ══════ */
.desk-nav { display: flex !important; }
.mob-toggle { display: none !important; }

@media (max-width: 768px) {
  .desk-nav { display: none !important; }
  .mob-toggle {
    display: flex !important;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    background: none;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;
    width: 44px;
    height: 44px;
    position: relative;
    z-index: 1001;
  }
  .mob-toggle div {
    width: 20px;
    height: 2px;
    background: #fff;
    border-radius: 2px;
    transition: all 0.3s cubic-bezier(.22,1,.36,1);
  }
}

/* ══════ MOBILE NAV PANEL ══════ */
#mobile-nav {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  width: min(85vw, 380px) !important;
  height: 100dvh !important;
  z-index: 1000 !important;
  overflow-y: auto !important;
  padding: clamp(20px, 5vw, 40px) !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  animation: slideInRight 0.35s cubic-bezier(.22,1,.36,1) both;
}
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* ══════ GRID LAYOUTS ══════ */
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); }
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); }

@media (max-width: 1024px) {
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .grid-3, .grid-2 { grid-template-columns: 1fr !important; }
}

/* ══════ FOOTER GRID ══════ */
.footer-grid {
  display: grid;
  grid-template-columns: 1.8fr 1fr 1fr 1fr;
  gap: clamp(24px, 4vw, 52px);
}
@media (max-width: 900px) {
  .footer-grid { grid-template-columns: 1fr 1fr !important; }
}
@media (max-width: 640px) {
  .footer-grid { grid-template-columns: 1fr !important; text-align: center; }
  .footer-grid > div:first-child { display: flex; flex-direction: column; align-items: center; }
}

/* ══════ CONTACT GRID ══════ */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(24px, 4vw, 48px);
}
.contact-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
@media (max-width: 768px) {
  .contact-grid { grid-template-columns: 1fr !important; }
  .contact-form-grid { grid-template-columns: 1fr !important; }
}

/* ══════ STATS ROW ══════ */
.stats-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(16px, 3vw, 32px);
}
@media (max-width: 640px) {
  .stats-row { flex-direction: column; align-items: center; }
}

/* ══════ FAQ GRID ══════ */
@media (max-width: 640px) {
  .faq-grid { grid-template-columns: 1fr !important; }
}

/* ══════ SERVICES GRID ══════ */
@media (max-width: 768px) {
  .services-grid { grid-template-columns: repeat(2, 1fr) !important; }
}
@media (max-width: 480px) {
  .services-grid { grid-template-columns: 1fr !important; }
}

/* ══════ RECORDINGS GRID ══════ */
@media (max-width: 640px) {
  .recordings-grid { grid-template-columns: 1fr !important; }
}

/* ══════ PROCESS STEPS ══════ */
@media (max-width: 768px) {
  .process-steps-flow { flex-direction: column !important; align-items: stretch !important; }
  .process-step-connector { display: none !important; }
  .process-step-card { width: 100% !important; max-width: 100% !important; }
}

/* ══════ NAV LINK BUTTONS ══════ */
.nav-link-btn {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: clamp(10px, 0.75vw, 13px);
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(.22,1,.36,1);
  white-space: nowrap;
  cursor: pointer;
}
.nav-link-btn:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
  border-color: rgba(255,255,255,0.25);
}

/* ══════ NAV CTA BUTTON ══════ */
.nav-cta-btn {
  font-size: clamp(11px, 0.8vw, 14px) !important;
  padding: 10px 22px !important;
  white-space: nowrap;
}

/* ══════ MARQUEE ══════ */
.marquee-section { overflow: hidden; width: 100%; }
.marquee-stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ══════ LISTEN BUTTON ══════ */
.listen-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.listen-btn:hover { opacity: 0.8; }

/* ══════ CONTACT FORM PANEL ══════ */
.contact-form-panel {
  border-radius: clamp(16px, 2vw, 24px);
  padding: clamp(24px, 4vw, 48px);
}

/* ══════ GLOBAL MOBILE OVERRIDES ══════ */
@media (max-width: 768px) {
  nav > div { padding: 0 16px !important; }
  section, [id] > div { padding-left: clamp(16px, 4vw, 40px) !important; padding-right: clamp(16px, 4vw, 40px) !important; }
  h1, h2, h3 { word-break: break-word; overflow-wrap: break-word; }
}
@media (max-width: 480px) {
  h1 { font-size: clamp(28px, 8vw, 42px) !important; }
  h2 { font-size: clamp(24px, 7vw, 36px) !important; }
  h3 { font-size: clamp(18px, 5vw, 28px) !important; }
  p, span, li { font-size: clamp(14px, 3.5vw, 16px) !important; }
}

/* ══════ IMAGE & OVERFLOW FIX ══════ */
img, video, svg { max-width: 100%; height: auto; }
* { box-sizing: border-box; }
body { overflow-x: hidden; }

/* ══════ HERO SECTION MOBILE ══════ */
@media (max-width: 768px) {
  [style*="0.48fr"] { grid-template-columns: 1fr !important; }
}

/* ══════ PLANS GRID MOBILE ══════ */
@media (max-width: 480px) {
  .plans-grid { grid-template-columns: 1fr !important; }
  .plans-grid > * { width: 100% !important; max-width: 100% !important; }
}

.reviews-why-grid { }
@media (max-width: 768px) {
  .reviews-why-grid { grid-template-columns: 1fr !important; }
}
@media (max-width: 640px) {
  .recording-card { padding: 16px !important; }
}
@media (max-width: 768px) {
  .process-map-stage { flex-direction: column !important; text-align: center; }
}
@media (max-width: 768px) {
  .gold-btn, .outline-btn { width: 100%; text-align: center; justify-content: center; display: flex; }
}
@media (max-width: 480px) {
  .gold-btn, .outline-btn { padding: 14px 24px !important; font-size: 13px !important; }
}


/* ══════ GOLD SEPARATOR ══════ */
.gold-separator {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0;
  overflow: visible;
  z-index: 1;
}
.gold-separator-line {
  position: relative;
  flex: 1;
  max-width: min(42%, 560px);
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.08) 15%, rgba(201,162,39,0.5) 50%, rgba(212,165,116,0.8) 80%, rgba(201,162,39,0.9) 100%);
  border-radius: 999px;
}
.gold-separator-line:last-child {
  background: linear-gradient(90deg, rgba(201,162,39,0.9) 0%, rgba(212,165,116,0.8) 20%, rgba(201,162,39,0.5) 50%, rgba(201,162,39,0.08) 85%, transparent 100%);
}
.gold-separator-line::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  height: 8px;
  background: linear-gradient(90deg, transparent, rgba(201,162,39,0.3), rgba(201,162,39,0.15), transparent);
  filter: blur(4px);
  border-radius: 999px;
}
.gold-separator-line::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  transform: translateY(-50%);
  height: 16px;
  background: linear-gradient(90deg, transparent, rgba(201,162,39,0.15), transparent);
  filter: blur(10px);
  border-radius: 999px;
}
.gold-separator-diamond {
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, rgba(212,165,116,0.9), rgba(201,162,39,1), rgba(212,165,116,0.9));
  transform: rotate(45deg);
  flex-shrink: 0;
  margin: 0 16px;
  box-shadow: 0 0 8px rgba(201,162,39,0.5), 0 0 20px rgba(201,162,39,0.2), 0 0 40px rgba(201,162,39,0.1);
  border-radius: 2px;
  animation: diamondPulse 3s ease-in-out infinite;
}
@keyframes diamondPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(201,162,39,0.5), 0 0 20px rgba(201,162,39,0.2); opacity: 0.85; }
  50% { box-shadow: 0 0 12px rgba(201,162,39,0.7), 0 0 30px rgba(201,162,39,0.35), 0 0 50px rgba(201,162,39,0.15); opacity: 1; }
}
@media (max-width: 768px) {
  .gold-separator-line { max-width: 40%; }
  .gold-separator-diamond { width: 8px; height: 8px; margin: 0 12px; }
}

/* ══════ ENHANCED SERVICES CARDS ══════ */
#services {
  background: #f5f0e8 !important;
}
.services-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: clamp(20px, 3vw, 28px) !important;
}
.services-grid > * {
  background: #fff !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(201,162,39,0.1) !important;
  border-radius: clamp(16px, 2vw, 20px) !important;
  padding: clamp(32px, 4vw, 44px) clamp(28px, 3.5vw, 36px) !important;
  position: relative !important;
  overflow: hidden !important;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1) !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.06) !important;
}
.services-grid > *::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.4) 20%, rgba(201,162,39,0.9) 50%, rgba(201,162,39,0.4) 80%, transparent 100%);
  opacity: 0;
  transition: opacity 0.5s ease;
}
.services-grid > *::after {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(circle at 80% -20%, rgba(201,162,39,0.06) 0%, transparent 60%);
  pointer-events: none;
}
.services-grid > *:hover {
  border-color: rgba(201,162,39,0.25) !important;
  transform: translateY(-8px) scale(1.01) !important;
  box-shadow: 0 8px 30px rgba(201,162,39,0.1), 0 20px 50px rgba(0,0,0,0.08) !important;
}
.services-grid > *:hover::before { opacity: 1; }
.services-grid > * h3 {
  color: #1a1a1a !important;
  font-size: clamp(18px, 1.4vw, 22px) !important;
}
.services-grid > * p {
  color: rgba(30,30,30,0.55) !important;
  font-size: clamp(13px, 1vw, 15px) !important;
  line-height: 1.75 !important;
}
#services h2, #services h2 * { color: #1a1a1a !important; }
#services h2 em, #services h2 i, #services h2 span[style*="italic"] { color: #c9a227 !important; }
#services span[style*="uppercase"] { color: #c9a227 !important; }
@media (max-width: 1024px) {
  .services-grid { grid-template-columns: repeat(2, 1fr) !important; }
}
@media (max-width: 640px) {
  .services-grid { grid-template-columns: 1fr !important; }
}
`}</style>
  );
}

// ─── GRAIN OVERLAY ───

// ─── GOLD SEPARATOR ───
function GoldSeparator() {
  return (
    <div className="gold-separator" aria-hidden="true">
      <div className="gold-separator-line" />
      <div className="gold-separator-diamond" />
      <div className="gold-separator-line" />
    </div>
  );
}


function GrainOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.03,
        mixBlendMode: "overlay",
        contain: "strict",
        isolation: "isolate",
      }}
      aria-hidden="true"
    />
  );
}

// ─── NAVBAR ───
// ─── LOADING OVERLAY ───────────────────────────────────────────
export function LoadingOverlay({ message } = {}) {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: C.void,
      zIndex: 99999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      animation: "loadingFadeIn 0.3s ease",
    }}>
      <style>{`
        @keyframes loadingFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes loadingSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes loadingPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
      <div style={{
        width: 48,
        height: 48,
        border: "2px solid rgba(201,162,39,0.2)",
        borderTop: "2px solid " + C.gold,
        borderRadius: "50%",
        animation: "loadingSpin 0.8s linear infinite",
        marginBottom: 24,
      }} />
      <div style={{
        fontFamily: font.serif,
        fontSize: 18,
        color: C.gold,
        letterSpacing: 2,
        animation: "loadingPulse 1.5s ease-in-out infinite",
      }}>
        ESTATE LAND
      </div>
      <div style={{
        fontSize: 11,
        color: C.mute,
        marginTop: 8,
        letterSpacing: 1,
      }}>
        {message || "Loading Dashboard..."}
      </div>
    </div>
  );
}

function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navigatingToDashboard, setNavigatingToDashboard] = useState(false);

  const handleStartNow = (e) => {
    e.preventDefault();
    setMobileOpen(false);
    setNavigatingToDashboard(true);
    setTimeout(() => {
      window.location.href = "/dashboard/login";
    }, 1200);
  };
  const isHome = location.pathname === "/";
  const handleSectionClick = (id) => {
    if (!isHome) return;
    const el = id === "hero" ? document.documentElement : document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", id === "hero" ? "/" : `/#${id}`);
    }
  };
  const mobileRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const h = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 60);
        ticking = false;
      });
    };
    window.addEventListener("scroll", h, { passive: true });
    h();
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileOpen && mobileRef.current && !mobileRef.current.contains(e.target) && !e.target.closest(".mob-toggle")) setMobileOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [mobileOpen]);

  const links = ["Home:hero", "About:about", "Services:services", "Process:process", "Results:results", "Why Estate Land:reviews", "Plans:plans", "FAQ:faq", "Contact:contact"];

  const navLinkBase = {
    fontFamily: font.body,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    cursor: "pointer",
    color: C.cream,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "12px 20px",
    borderRadius: 999,
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
    textDecoration: "none",
    display: "inline-block",
  };

  return (
    <>
    {navigatingToDashboard && <LoadingOverlay />}
    <nav role="banner" aria-label="Main navigation" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(8,8,8,0.94)" : "transparent",
      backdropFilter: scrolled ? "blur(24px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
      transition: "background 0.4s cubic-bezier(.22,1,.36,1), backdrop-filter 0.4s, padding 0.4s, border-color 0.4s",
      padding: scrolled ? "14px 0" : "26px 0",
      borderBottom: scrolled ? `1px solid rgba(255,255,255,0.06)` : "none",
    }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 clamp(16px, 4vw, 40px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div style={{
            width: 42, height: 42, border: `1px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center",
            transform: "rotate(45deg)",
          }}>
            <span style={{ transform: "rotate(-45deg)", fontFamily: font.display, fontSize: 20, color: C.gold, fontWeight: 500 }}>E</span>
          </div>
          <div>
            <div style={{ fontFamily: font.display, fontSize: 20, color: C.cream, letterSpacing: 3, transition: "color 0.4s" }}>ESTATE</div>
            <div style={{ fontFamily: font.body, fontSize: 9, color: C.gold, letterSpacing: 5, fontWeight: 600, marginTop: -1 }}>LAND</div>
          </div>
        </Link>

        <div className="desk-nav" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {links.map((l) => {
            const [label, id] = l.split(":");
            return (
              <Link
                key={id}
                to={id === "hero" ? "/" : `/#${id}`}
                className="nav-link-btn"
                style={navLinkBase}
                onClick={(e) => {
                  if (isHome) {
                    e.preventDefault();
                    handleSectionClick(id);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = C.gold;
                  e.currentTarget.style.borderColor = "rgba(201,162,39,0.5)";
                  e.currentTarget.style.background = "rgba(201,162,39,0.12)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(201,162,39,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = C.cream;
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {label}
              </Link>
            );
          })}
          <a
            href="/dashboard/login"
            className="gold-btn nav-cta-btn"
            onClick={handleStartNow}
            style={{
              padding: "14px 32px",
              fontSize: 11,
              letterSpacing: 0.15,
              textDecoration: "none",
              borderRadius: 999,
              boxShadow: "0 4px 24px rgba(201,162,39,0.25)",
              cursor: "pointer",
            }}
          >
            Start Now
          </a>
        </div>

        <button type="button" className="mob-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-controls="mobile-nav" aria-label="Toggle menu" style={{
          display: "none", flexDirection: "column", gap: 5, cursor: "pointer", padding: 12, minWidth: 44, minHeight: 44, justifyContent: "center", background: "transparent", border: "none",
        }}>
          <div style={{ width: 24, height: 1.5, background: C.gold, transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", transform: mobileOpen ? "rotate(45deg) translate(3px,4px)" : "none" }} />
          <div style={{ width: 24, height: 1.5, background: C.gold, transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", opacity: mobileOpen ? 0 : 1 }} />
            <div style={{ width: mobileOpen ? 24 : 18, height: 1.5, background: C.gold, transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", transform: mobileOpen ? "rotate(-45deg) translate(4px,-4px)" : "none" }} />
        </button>
      </div>

      {mobileOpen && (
        <div ref={mobileRef} id="mobile-nav" style={{ background: C.surface, padding: "clamp(20px, 5vw, 28px) clamp(20px, 5vw, 40px)", display: "flex", flexDirection: "column", gap: 10, borderTop: `1px solid ${C.border}` }}>
          {links.map((l) => {
            const [label, id] = l.split(":");
            return (
              <Link
                key={id}
                to={id === "hero" ? "/" : `/#${id}`}
                onClick={(e) => {
                  setMobileOpen(false);
                  if (isHome) {
                    e.preventDefault();
                    handleSectionClick(id);
                  }
                }}
                style={{
                  fontFamily: font.body,
                  fontSize: 14,
                  color: C.cream,
                  letterSpacing: 0.12,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: "16px 24px",
                  borderRadius: 12,
                  textAlign: "left",
                  textDecoration: "none",
                  transition: "all 0.25s ease",
                }}
              >
                {label}
              </Link>
            );
          })}
          <a
            href="/dashboard/login"
            className="gold-btn"
            onClick={handleStartNow}
            style={{
              padding: "16px 28px",
              fontSize: 12,
              letterSpacing: 0.15,
              marginTop: 8,
              textDecoration: "none",
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(201,162,39,0.3)",
              cursor: "pointer",
            }}
          >
            Start Now
          </a>
        </div>
      )}
    </nav>
    </>
  );
}

// ─── HERO ───
function Hero() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setTimeout(() => setLoaded(true), 200); }, []);

  return (
    <section id="hero" style={{
      minHeight: "100dvh", display: "flex", alignItems: "center",
      background: C.void, position: "relative", overflow: "hidden",
    }}>
      {/* Full hero video — muted, autoplay, loop */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        src="/Videos/homepage.mp4"
        title="Estate Land"
      />
      {/* Dark overlay so text stays readable */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(90deg, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.5) 50%, rgba(8,8,8,0.2) 100%)",
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: 1440, margin: "0 auto", padding: "clamp(100px, 12vw, 140px) clamp(20px, 5vw, 40px) clamp(60px, 10vw, 100px)", width: "100%",
        position: "relative", zIndex: 2,
      }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 14, marginBottom: 32,
            opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(.22,1,.36,1) 0.2s",
          }}>
            <div style={{ width: 64, height: 1, background: C.gold, animation: loaded ? "expandLine 0.8s ease forwards" : "none" }} />
            <span style={{ fontFamily: font.body, fontSize: 10, color: C.gold, letterSpacing: 0.2, textTransform: "uppercase", fontWeight: 600 }}>
              estateland.us · United States
            </span>
          </div>

          <h1 style={{
            fontFamily: font.display, fontSize: "clamp(48px, 6vw, 82px)", color: C.cream,
            lineHeight: 1.02, fontWeight: 500, marginBottom: 28,
            opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(40px)",
            transition: "all 1s cubic-bezier(.22,1,.36,1) 0.35s",
          }}>
            Stop chasing.
            <br />
            <em style={{ color: C.gold, fontStyle: "italic", fontWeight: 500 }}>Start closing.</em>
            <br />
            Own your market.
          </h1>

          <p style={{
            fontFamily: font.body, fontSize: 17, color: C.creamDim, lineHeight: 1.75,
            maxWidth: 440, fontWeight: 400, marginBottom: 44,
            opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(30px)",
            transition: "all 0.9s cubic-bezier(.22,1,.36,1) 0.5s",
          }}>
            Estate Land delivers exclusive, double-verified seller leads directly to your CRM with listing appointments already booked. 500+ top-producing realtors trust us across all 50 states. Zero competition. Zero shared leads. Just closings.
          </p>

          <div style={{
            display: "flex", gap: 14, flexWrap: "wrap",
            opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)",
            transition: "all 0.9s cubic-bezier(.22,1,.36,1) 0.65s",
          }}>
            <button className="gold-btn" onClick={() => go("contact")}>
              Get Exclusive Leads <span style={{ fontSize: 14 }}>→</span>
            </button>
            <button className="outline-btn" onClick={() => go("process")}>
              How It Works
            </button>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 28, marginTop: 52, paddingTop: 28,
            borderTop: `1px solid ${C.border}`,
            opacity: loaded ? 1 : 0, transition: "all 0.9s ease 1s",
          }}>
            <div style={{ display: "flex" }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{
                  width: 34, height: 34, borderRadius: "50%", border: `2px solid ${C.surface}`,
                  marginLeft: i > 1 ? -8 : 0,
                  background: `url(https://i.pravatar.cc/80?img=${i + 10})`, backgroundSize: "cover",
                }} />
              ))}
            </div>
            <div>
              <div style={{ fontFamily: font.body, fontSize: 14, color: C.cream, fontWeight: 600 }}>500+ Realtors</div>
              <div style={{ fontFamily: font.body, fontSize: 12, color: C.mute, fontWeight: 400 }}>Closing more deals across all 50 states</div>
            </div>
          </div>
        </div>
      </div>

      <a href="#main-content" aria-label="Scroll to content" style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", textAlign: "center", animation: "float 2.5s ease-in-out infinite", zIndex: 2, color: "inherit", textDecoration: "none" }}>
        <div style={{ fontFamily: font.body, fontSize: 9, color: C.mute, letterSpacing: 0.2, textTransform: "uppercase", marginBottom: 8, fontWeight: 500 }}>Scroll</div>
        <div style={{ width: 1, height: 28, background: `linear-gradient(to bottom, ${C.gold}, transparent)`, margin: "0 auto" }} />
      </a>
    </section>
  );
}

// ─── MARQUEE ICON (building) ───
// Brokerage logos: Clearbit logo API (real brand logos). Fallback to text if image fails.
const BROKERAGE_LOGO_ITEMS = [
  { name: "Coldwell Banker", domain: "coldwellbanker.com" },
  { name: "Compass", domain: "compass.com" },
  { name: "Century 21", domain: "century21.com" },
  { name: "eXp Realty", domain: "exprealty.com" },
  { name: "Berkshire Hathaway", domain: "berkshirehathaway.com" },
  { name: "Sotheby's", domain: "sothebysrealty.com" },
];

function BrokerageLogo({ name, domain, index, theme, size }) {
  const [imgFailed, setImgFailed] = useState(false);
  const T = theme || THEME.dark;
  const isLight = T.bg === THEME.light.bg;
  const large = size === "large";
  const logoUrl = `https://logo.clearbit.com/${domain}`;
  const goldGlow = "0 0 20px rgba(201,162,39,0.3), 0 0 40px rgba(201,162,39,0.15), 0 0 60px rgba(201,162,39,0.08)";
  const goldGlowHover = "0 0 28px rgba(201,162,39,0.5), 0 0 56px rgba(201,162,39,0.25), 0 0 80px rgba(201,162,39,0.12), 0 8px 32px rgba(0,0,0,0.1)";
  const tileStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    minWidth: large ? 180 : 140,
    height: large ? 56 : 44,
    padding: large ? "0 28px" : "0 20px",
    border: isLight ? `1px solid rgba(201,162,39,0.25)` : `1px solid ${T.border}`,
    borderRadius: large ? 12 : 8,
    background: isLight ? "rgba(255,255,255,0.85)" : "transparent",
    boxShadow: isLight ? goldGlow : "none",
    animation: isLight ? "logoGoldGlow 4s ease-in-out infinite" : "none",
    transition: "box-shadow 0.4s ease, border-color 0.3s ease, background 0.3s ease, transform 0.3s ease",
  };
  if (imgFailed) {
    return (
      <span style={{ ...tileStyle, fontFamily: font.body, fontSize: large ? 13 : 12, color: T.mute, letterSpacing: 0.06, fontWeight: 500 }}>
        {name}
      </span>
    );
  }
  return (
    <span
      style={tileStyle}
      onMouseEnter={e => {
        if (isLight) {
          e.currentTarget.style.animation = "none";
          e.currentTarget.style.boxShadow = goldGlowHover;
          e.currentTarget.style.borderColor = "rgba(201,162,39,0.5)";
          e.currentTarget.style.background = "rgba(255,255,255,0.98)";
          e.currentTarget.style.transform = "scale(1.04)";
        }
      }}
      onMouseLeave={e => {
        if (isLight) {
          e.currentTarget.style.animation = "logoGoldGlow 4s ease-in-out infinite";
          e.currentTarget.style.boxShadow = goldGlow;
          e.currentTarget.style.borderColor = "rgba(201,162,39,0.25)";
          e.currentTarget.style.background = "rgba(255,255,255,0.85)";
          e.currentTarget.style.transform = "scale(1)";
        }
      }}
    >
      <img
        src={logoUrl}
        alt={name}
        width={large ? 140 : 120}
        height={large ? 36 : 32}
        style={{ objectFit: "contain", maxHeight: large ? 36 : 32, width: "auto", opacity: 0.95, filter: isLight ? "brightness(0.15)" : "none" }}
        onError={() => setImgFailed(true)}
      />
    </span>
  );
}

// ─── MARQUEE (light theme) — Premium trust strip, next-level ───
function Marquee() {
  const [ref, vis] = useInView(0.12);
  const T = THEME.light;
  const duplicated = [...BROKERAGE_LOGO_ITEMS, ...BROKERAGE_LOGO_ITEMS, ...BROKERAGE_LOGO_ITEMS];
  return (
    <section
      ref={ref}
      aria-label="Trusted by agents from top brokerages"
      className="marquee-section"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "clamp(72px, 10vw, 100px) 0 clamp(80px, 10vw, 112px)",
        background: `linear-gradient(165deg, ${T.bg} 0%, #f0ebe3 35%, #e8e2d8 70%, ${T.bg} 100%)`,
        borderTop: `2px solid ${T.accent}`,
        borderBottom: `2px solid ${T.accent}`,
      }}
    >
      {/* Strong top/bottom glow */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent 0%, ${T.accent} 20%, ${T.accent} 80%, transparent 100%)`,
        opacity: 0.4,
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent 0%, ${T.accent} 20%, ${T.accent} 80%, transparent 100%)`,
        opacity: 0.4,
      }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Headline block — bold, editorial */}
        <div style={{
          maxWidth: 900,
          margin: "0 auto 56px",
          padding: "0 24px",
          textAlign: "center",
        }}>
          <p
            style={{
              fontFamily: font.body,
              fontSize: 12,
              color: T.mute,
              letterSpacing: 0.35,
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: 12,
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(20px)",
              animation: vis ? "marqueeHeadlineIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards" : "none",
            }}
          >
            Trusted by agents from
          </p>
          <h2
            style={{
              fontFamily: font.display,
              fontSize: "clamp(38px, 5vw, 58px)",
              color: T.text,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 20,
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(20px)",
              animation: vis ? "marqueeHeadlineIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards" : "none",
            }}
          >
            The world's leading <em style={{ color: T.accent, fontStyle: "italic", fontWeight: 600 }}>brokerages</em>
          </h2>
          <div
            style={{
              width: 100,
              height: 3,
              margin: "0 auto",
              background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`,
              borderRadius: 2,
              opacity: vis ? 1 : 0,
              animation: vis ? "marqueeLineDraw 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.25s forwards" : "none",
              transformOrigin: "center",
            }}
          />
        </div>

        {/* Stat pill — credibility in one line */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 48,
            opacity: vis ? 1 : 0,
            animation: vis ? "marqueeHeadlineIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards" : "none",
          }}
        >
          <div className="marquee-stat-pill" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 24,
            padding: "10px 28px",
            background: "rgba(255,255,255,0.85)",
            border: `1px solid ${T.border}`,
            borderRadius: 999,
            boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
            fontFamily: font.body,
            fontSize: 12,
            fontWeight: 600,
            color: T.text,
            letterSpacing: 0.08,
          }}>
            <span>500+ Realtors</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: T.accent }} aria-hidden />
            <span>$2.4B+ in Closed Volume</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: T.accent }} aria-hidden />
            <span>All 50 States</span>
          </div>
        </div>

        {/* Full-bleed logo track — single row, larger logos, stronger container */}
        <div
          style={{
            position: "relative",
            padding: "40px 0",
            margin: "0 -24px",
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop: `1px solid ${T.border}`,
            borderBottom: `1px solid ${T.border}`,
            boxShadow: "0 8px 48px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
            opacity: vis ? 1 : 0,
            transform: vis ? "translateY(0)" : "translateY(16px)",
            animation: vis ? "marqueeTrackIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards" : "none",
          }}
        >
          {/* Edge fades — stronger */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 120, zIndex: 3,
            background: "linear-gradient(to right, rgba(248,246,242,0.98), transparent)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: 120, zIndex: 3,
            background: "linear-gradient(to left, rgba(248,246,242,0.98), transparent)",
            pointerEvents: "none",
          }} />

          {/* Row 1 — scroll left */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 64,
              animation: "marqueeScroll 45s linear infinite",
              whiteSpace: "nowrap",
              padding: "0 48px",
              marginBottom: 36,
            }}
          >
            {duplicated.map((item, i) => (
              <BrokerageLogo key={`a-${item.domain}-${i}`} name={item.name} domain={item.domain} index={i} theme={T} size="large" />
            ))}
          </div>
          {/* Row 2 — scroll right */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 64,
              animation: "marqueeScrollReverse 50s linear infinite",
              whiteSpace: "nowrap",
              padding: "0 48px",
            }}
          >
            {duplicated.map((item, i) => (
              <BrokerageLogo key={`b-${item.domain}-${i}`} name={item.name} domain={item.domain} index={i} theme={T} size="large" />
            ))}
          </div>
        </div>

        {/* Footer disclaimer */}
        <p style={{
          fontFamily: font.body,
          fontSize: 11,
          color: T.mute,
          textAlign: "center",
          marginTop: 32,
          padding: "0 24px",
          letterSpacing: 0.12,
        }}>
          Agents from these and 200+ other top brokerages use Estate Land for exclusive seller leads and listing appointments.
        </p>
      </div>
    </section>
  );
}

// ─── ABOUT (dark theme) ───
function About() {
  const [ref, vis] = useInView();
  const T = THEME.dark;
  return (
    <section id="about" ref={ref} style={{ background: T.bg, padding: "clamp(60px, 10vw, 120px) clamp(20px, 5vw, 40px)", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 1, height: 80, background: `linear-gradient(to bottom, ${T.accent}, transparent)` }} />
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <div className={`grid-2 reveal ${vis ? "visible" : ""}`} style={{ display: "grid", gridTemplateColumns: "0.48fr 0.52fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 48, height: 1, background: T.accent }} />
              <span style={{ fontFamily: font.body, fontSize: 10, color: T.accent, letterSpacing: 0.15, textTransform: "uppercase", fontWeight: 600 }}>Who We Are</span>
            </div>
            <h2 style={{ fontFamily: font.display, fontSize: "clamp(34px, 4vw, 50px)", color: T.text, lineHeight: 1.1, marginBottom: 24 }}>
              The only partner
              <br /><em style={{ color: T.accent }}>your listing business</em>
              <br />will ever need.
            </h2>
            <p style={{ fontFamily: font.body, fontSize: 16, color: T.textDim, lineHeight: 1.8, fontWeight: 400, marginBottom: 18 }}>
              Estate Land was built by top-producing agents and marketing veterans who understand the #1 problem in real estate: inconsistent deal flow. We engineered a lead generation system that eliminates cold calling, door knocking, and fighting over shared portal leads.
            </p>
            <p style={{ fontFamily: font.body, fontSize: 16, color: T.textDim, lineHeight: 1.8, fontWeight: 400, marginBottom: 36 }}>
              Every lead is 100% exclusive to you -- no sharing, no recycling, no competing with other agents. We double-verify every seller's identity, property ownership, and motivation. On premium plans, our ISA team books the listing appointment directly on your calendar so you show up to motivated, ready-to-list homeowners.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 14 }}>
              {["Exclusive Territory Rights", "Double-Verified Sellers", "Listing Appointments Set For You", "Full CRM & Pipeline Setup", "Serving All 50 States", "Money-Back Guarantee", "No Shared Leads Ever", "Dedicated Account Manager"].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: T.accentDim, border: `1px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: T.accent, fontSize: 10, fontWeight: 700 }}>✓</span>
                  </div>
                  <span style={{ fontFamily: font.body, fontSize: 13, color: T.textDim, fontWeight: 400 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{
              width: "100%", paddingTop: "108%", position: "relative",
              backgroundImage: "url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=85)",
              backgroundSize: "cover", backgroundPosition: "center",
            }}>
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: `linear-gradient(to top, ${T.bg}ee, transparent)`,
                padding: "56px 36px 32px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16,
              }}>
                {[
                  { n: "500+", l: "Realtors" },
                  { n: "$2.4B", l: "Closed Volume" },
                  { n: "8+ Yrs", l: "Experience" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: font.display, fontSize: 28, color: T.accent }}>{s.n}</div>
                    <div style={{ fontFamily: font.body, fontSize: 9, color: T.mute, letterSpacing: 0.12, textTransform: "uppercase", fontWeight: 500 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: "absolute", top: -16, left: -16, width: 52, height: 52, borderTop: `2px solid ${T.accent}`, borderLeft: `2px solid ${T.accent}` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SERVICES ───
const SVC_BG = "#0b0f14";
const SVC_GOLD = "#d4af37";

function Services() {
  const [ref, vis] = useInView();
  const [hovered, setHovered] = useState(null);

  const services = [
    { num: "01", title: "Exclusive Seller Leads", desc: "Every lead is 100% yours -- never shared with another agent. We use AI-powered targeting to identify homeowners in your ZIP codes who are actively considering selling and deliver them straight to your pipeline. Average conversion rate: 12-18%." },
    { num: "02", title: "Appointment Setting", desc: "Our trained ISA team qualifies every lead through a rigorous screening process -- confirming seller intent, gathering property details, and booking the listing appointment directly on your calendar. You walk in to motivated, ready-to-list homeowners." },
    { num: "03", title: "CRM & Pipeline Automation", desc: "We build your entire lead management system from scratch -- automated follow-up sequences, AI-powered text and email drips, task reminders, pipeline tracking, and reporting dashboards. No lead ever falls through the cracks." },
    { num: "04", title: "Hyper-Local Ad Campaigns", desc: "Multi-channel campaigns across Facebook, Instagram, Google, YouTube, and direct mail, laser-targeted to your farm area. We handle creative production, audience targeting, A/B testing, and continuous optimization." },
    { num: "05", title: "Agent Branding & Digital Presence", desc: "Professional IDX websites, social media branding, listing presentations, video content strategy, and SEO optimization that position you as THE authority in your market. Stand out from every other agent." },
    { num: "06", title: "Nationwide Referral Network", desc: "Tap into our network of 500+ verified agents for cross-market referrals -- relocations, out-of-state buyers, commercial investors, and luxury clients. Earn referral fees on deals nationwide." },
  ];

  const T = THEME.light;
  return (
    <section
      id="services"
      ref={ref}
      style={{
        background: T.bg,
        padding: "clamp(60px, 10vw, 120px) clamp(20px, 5vw, 40px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle animated gradient background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${T.bg} 0%, rgba(0,0,0,0.04) 25%, ${T.bg} 50%, rgba(0,0,0,0.04) 75%, ${T.bg} 100%)`,
          backgroundSize: "400% 400%",
          animation: vis ? "servicesBgShift 25s ease infinite" : "none",
          opacity: 1,
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1440, margin: "0 auto", position: "relative", zIndex: 2 }}>
        {/* Section header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 64,
            opacity: 0,
            transform: "translateY(24px)",
            animation: vis ? "servicesTitleIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards" : "none",
          }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 48, height: 1, background: T.accent }} />
            <span style={{ fontFamily: font.body, fontSize: 10, color: T.accent, letterSpacing: 0.15, textTransform: "uppercase", fontWeight: 600 }}>Our Services</span>
            <div style={{ width: 48, height: 1, background: T.accent }} />
          </div>
          <h2 style={{ fontFamily: font.display, fontSize: "clamp(34px, 4vw, 50px)", color: T.text, lineHeight: 1.2 }}>
            Everything you need to{" "}
            <span style={{ color: T.accent, position: "relative", display: "inline-block" }}>
              own
              <span
                style={{
                  position: "absolute",
                  bottom: -4,
                  left: 0,
                  height: 2,
                  background: `linear-gradient(90deg, ${T.accent}, ${T.accentDim})`,
                  boxShadow: `0 0 12px ${T.accent}`,
                  width: 0,
                  opacity: 0,
                  animation: vis ? "servicesOwnUnderline 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.4s forwards" : "none",
                }}
              />
            </span>{" "}
            your market.
          </h2>
        </div>

        {/* Service cards */}
        <div className="grid-3 services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: 24 }}>
          {services.map((s, i) => {
            const isHovered = hovered === i;
            return (
              <div
                key={i}
                className={`services-card ${isHovered ? "services-card-hover" : ""}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  padding: "44px 36px",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                  background: isHovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${isHovered ? "rgba(166,124,0,0.5)" : T.border}`,
                  boxShadow: isHovered ? "0 0 30px rgba(166,124,0,0.12), inset 0 0 60px rgba(166,124,0,0.04)" : "0 1px 0 rgba(0,0,0,0.06)",
                  opacity: 0,
                  transform: "translateY(20px)",
                  animation: vis ? `servicesReveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${0.15 + i * 0.15}s forwards` : "none",
                  transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s, border-color 0.4s, background 0.4s",
                }}
              >
                {/* Top gold line sweep on hover */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${T.accent}, ${T.accentDim}, transparent)`,
                    transform: isHovered ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                    boxShadow: isHovered ? `0 0 12px ${T.accent}` : "none",
                  }}
                />

                {/* Inner radial gradient on hover */}
                {isHovered && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${T.accentDim} 0%, transparent 70%)`,
                      pointerEvents: "none",
                    }}
                  />
                )}

                {/* Large background number */}
                <div
                  style={{
                    position: "absolute",
                    top: -8,
                    right: 12,
                    fontFamily: font.display,
                    fontSize: 100,
                    fontWeight: 500,
                    color: isHovered ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.03)",
                    lineHeight: 1,
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                    transition: "color 0.4s, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  {s.num}
                </div>

                {/* Card number — opacity increases on hover */}
                <div
                  style={{
                    fontFamily: font.body,
                    fontSize: 10,
                    color: T.accent,
                    letterSpacing: 0.12,
                    marginBottom: 16,
                    fontWeight: 600,
                    opacity: isHovered ? 1 : 0.8,
                    transition: "opacity 0.4s",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  — {s.num}
                </div>
                <h3
                  style={{
                    fontFamily: font.display,
                    fontSize: 22,
                    marginBottom: 12,
                    color: isHovered ? T.text : T.textDim,
                    transition: "color 0.4s",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontFamily: font.body,
                    fontSize: 14,
                    lineHeight: 1.7,
                    fontWeight: 400,
                    color: T.mute,
                    transition: "color 0.4s",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .services-card-hover {
          transform: translateY(-8px) scale(1.02) !important;
        }
        @media (max-width: 1024px) {
          .services-grid { grid-template-columns: 1fr !important; }
        }
        @media (hover: none) {
          .services-card-hover { transform: none !important; }
        }
      `}</style>

      {/* ── Sample Leads Recordings ── */}
      <div
        style={{
          marginTop: 80,
          padding: "0 24px",
          maxWidth: 1440,
          margin: "80px auto 0",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 48, height: 1, background: T.accent }} />
            <span style={{ fontFamily: font.body, fontSize: 10, color: T.accent, letterSpacing: 0.15, textTransform: "uppercase", fontWeight: 600 }}>Hear The Proof</span>
            <div style={{ width: 48, height: 1, background: T.accent }} />
          </div>
          <h2 style={{ fontFamily: font.display, fontSize: "clamp(28px, 3.5vw, 42px)", color: T.text, lineHeight: 1.15, marginBottom: 12 }}>
            Sample Leads{" "}
            <span style={{ color: T.accent, position: "relative", display: "inline-block" }}>
              Recordings
              <span
                style={{
                  position: "absolute",
                  bottom: -3,
                  left: 0,
                  height: 2,
                  width: "100%",
                  background: `linear-gradient(90deg, ${T.accent}, ${T.accentDim})`,
                  borderRadius: 2,
                }}
              />
            </span>
          </h2>
          <p style={{ fontFamily: font.body, fontSize: 15, color: T.textDim, maxWidth: 520, margin: "0 auto", lineHeight: 1.6, fontWeight: 400 }}>
            Listen to real conversations with verified seller leads — this is the quality you can expect from every lead we deliver.
          </p>
        </div>

        {/* Recording cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
            gap: 24,
          }}
          className="recordings-grid"
        >
          {[
            {
              num: "01",
              title: "Motivated Seller",
              subtitle: "Pre-qualified homeowner",
              duration: "3:24",
              url: "https://drive.google.com/file/d/1u0MOvGQ9CtYri4TCXkX9oeC-x8vGCmk0/view?usp=sharing",
              gradient: "linear-gradient(135deg, rgba(201,162,39,0.1) 0%, rgba(201,162,39,0.03) 100%)",
            },
            {
              num: "02",
              title: "Listing Appointment",
              subtitle: "Appointment confirmed",
              duration: "4:12",
              url: "https://drive.google.com/file/d/1c8zYOAGTuCgX-w10fzKLTKuSI3uG7Kq9/view?usp=sharing",
              gradient: "linear-gradient(135deg, rgba(201,162,39,0.12) 0%, rgba(201,162,39,0.04) 100%)",
            },
            {
              num: "03",
              title: "Warm Transfer",
              subtitle: "Live call handoff",
              duration: "2:58",
              url: "https://drive.google.com/file/d/1yI4KxavdERmrm0S0bp-8Jpikcadh3ouv/view?usp=sharing",
              gradient: "linear-gradient(135deg, rgba(201,162,39,0.08) 0%, rgba(201,162,39,0.02) 100%)",
            },
          ].map((rec, i) => (
            <a
              key={i}
              href={rec.url}
              target="_blank"
              rel="noopener noreferrer"
              className="recording-card"
              style={{
                display: "block",
                textDecoration: "none",
                padding: "36px 32px",
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${T.border}`,
                borderRadius: 16,
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {/* Top accent line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`,
                  opacity: 0.6,
                }}
              />

              {/* Background glow */}
              <div
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: rec.gradient,
                  filter: "blur(40px)",
                  pointerEvents: "none",
                }}
              />

              {/* Number badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${T.accent}, ${T.accentDim})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 16px rgba(201,162,39,0.25)`,
                  }}
                >
                  {/* Play icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5.14v13.72a1 1 0 001.5.86l11.14-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z" fill="#fff" />
                  </svg>
                </div>
                <span style={{ fontFamily: font.body, fontSize: 11, color: T.accent, fontWeight: 600, letterSpacing: 0.08, background: "rgba(201,162,39,0.08)", padding: "4px 12px", borderRadius: 20 }}>{rec.duration}</span>
              </div>

              {/* Recording number */}
              <div style={{ fontFamily: font.body, fontSize: 10, color: T.accent, letterSpacing: 0.12, fontWeight: 600, marginBottom: 8, position: "relative", zIndex: 1 }}>
                RECORDING {rec.num}
              </div>

              {/* Title */}
              <h3 style={{ fontFamily: font.display, fontSize: 20, color: T.text, marginBottom: 6, lineHeight: 1.2, position: "relative", zIndex: 1 }}>
                {rec.title}
              </h3>

              {/* Subtitle */}
              <p style={{ fontFamily: font.body, fontSize: 13, color: T.textDim, fontWeight: 400, marginBottom: 24, position: "relative", zIndex: 1 }}>
                {rec.subtitle}
              </p>

              {/* Sound wave visualization */}
              <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 20, position: "relative", zIndex: 1 }}>
                {Array.from({ length: 24 }, (_, j) => {
                  const h = Math.sin((j + i * 8) * 0.5) * 12 + 14;
                  return (
                    <div
                      key={j}
                      style={{
                        width: 3,
                        height: h,
                        borderRadius: 2,
                        background: `linear-gradient(to top, ${T.accent}, ${T.accentDim})`,
                        opacity: 0.3 + Math.sin((j + i * 5) * 0.4) * 0.35,
                      }}
                    />
                  );
                })}
              </div>

              {/* Listen button */}
              <div
                className="listen-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: font.body,
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.accent,
                  letterSpacing: 0.06,
                  textTransform: "uppercase",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <span>Listen Now</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ transition: "transform 0.3s" }} className="listen-arrow">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        .recordings-grid a.recording-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(201,162,39,0.3);
          border-color: rgba(201,162,39,0.4);
          background: rgba(255,255,255,0.9);
        }
        .recordings-grid a.recording-card:hover .listen-arrow {
          transform: translate(3px, -3px);
        }
        @media (max-width: 1024px) {
          .recordings-grid { grid-template-columns: 1fr !important; max-width: 480px; margin: 0 auto; }
        }
        @media (min-width: 601px) and (max-width: 1024px) {
          .recordings-grid { grid-template-columns: repeat(2, 1fr) !important; max-width: 720px; }
        }
      `}</style>

    </section>
  );
}


// USA map — continental outline (smooth, recognizable shape) viewBox 0 0 959 593
const USA_MAP_PATH = "M 95 72 L 118 88 L 128 140 L 138 220 L 145 320 L 152 420 L 162 500 L 200 555 L 300 572 L 450 570 L 580 558 L 680 520 L 760 450 L 820 360 L 848 250 L 845 140 L 800 75 L 650 48 L 450 40 L 260 48 L 95 72 Z M 738 408 L 752 460 L 765 510 L 742 542 L 705 535 L 698 478 L 712 422 Z";

function ProcessMap({ T }) {
  return (
    <div className="process-map-stage" style={{ position: "relative", width: "100%", maxWidth: 720, height: 380, margin: "0 auto 48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", maxWidth: 560 }}>
        <svg viewBox="0 0 959 593" style={{ width: "100%", height: "100%", display: "block" }} aria-label="United States map">
          <defs>
            <linearGradient id="usa-map-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={T.accent} stopOpacity="0.12" />
              <stop offset="100%" stopColor={T.accent} stopOpacity="0.04" />
            </linearGradient>
            <filter id="usa-map-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={USA_MAP_PATH}
            fill="url(#usa-map-fill)"
            stroke={T.accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#usa-map-glow)"
            style={{ transition: "opacity 0.3s" }}
          />
        </svg>
      </div>
    </div>
  );
}

// Step icon paths (24x24 viewBox) — map-pin, rocket, shield, calendar, handshake
const PROCESS_STEP_ICON_PATHS = [
  "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z",
  "M9.5 21c.07.5.5.5.5.5s.43 0 .5-.5l1-4.5-1.5-1.5-1 4.5-1 2.5zm5.5-9.5c0-2.76-2.24-5-5-5S5 8.74 5 11.5c0 1.5.5 2.9 1.4 4 .2.3.5.5.8.5h.8l1.5-1.5 1.5 1.5h.8c.3 0 .6-.2.8-.5.9-1.1 1.4-2.5 1.4-4z",
  "M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14l-3-3 1.41-1.41L11 13.17l3.59-3.59L16 11l-5 5z",
  "M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z",
  "M18 9V7c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2c-1.65 0-3 1.35-3 3v5c0 1.65 1.35 3 3 3h10c1.65 0 3-1.35 3-3v-5c0-1.65-1.35-3-3-3zm-2 0h-4V7h4v2zm4 8c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-5c0-.55.45-1 1-1h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h4v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c.55 0 1 .45 1 1v5z",
];

// ─── PROCESS — Real map + animated steps ───
function Process() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [inViewRef, vis] = useInView(0.1);
  const setSectionRef = useCallback((el) => {
    sectionRef.current = el;
    if (inViewRef) inViewRef.current = el;
  }, [inViewRef]);
  const T = THEME.dark;

  const steps = [
    { num: "01", title: "Claim Your Territory", desc: "Choose your exclusive ZIP codes, neighborhoods, and property types. No other Estate Land agent will operate in your area -- you own it completely. We map your farm area and build a custom campaign strategy." },
    { num: "02", title: "We Launch Multi-Channel Campaigns", desc: "AI-optimized ad campaigns across Facebook, Google, Instagram, YouTube, and targeted direct mail to reach active and pre-market sellers in your farm area. We handle all creative, targeting, and budget optimization." },
    { num: "03", title: "Every Lead Is Double-Verified", desc: "Our ISA team screens every response within 5 minutes -- verifying homeowner identity, property ownership, selling timeline, price expectations, and genuine motivation. Only qualified sellers reach your pipeline." },
    { num: "04", title: "Listing Appointments Booked For You", desc: "Our trained inside sales agents contact every verified seller, handle initial objections, gather detailed property info, and book the listing appointment directly on your calendar with a confirmed date and time." },
    { num: "05", title: "You Close & Get Paid", desc: "Walk into pre-qualified, motivated seller appointments with full background info. We provide transaction support through closing and only collect our referral fee when YOU get paid. Average first closing: 45-60 days." },
  ];

  // Floating gold particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !vis) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    Array.from({ length: 28 }, () => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.12 + 0.04,
    })).forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 162, 39, ${p.opacity})`;
      ctx.fill();
    });
  }, [vis]);

  return (
    <section id="process" ref={setSectionRef}
      style={{
        background: T.bg,
        padding: "clamp(60px, 10vw, 120px) clamp(20px, 5vw, 24px) clamp(80px, 12vw, 140px)",
        position: "relative",
        overflow: "hidden",
        minHeight: "100dvh",
      }}
    >
      {/* Deep navy gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(11,15,20,0.4) 0%, rgba(15,25,40,0.6) 50%, rgba(11,15,20,0.8) 100%)",
        pointerEvents: "none",
      }} />

      {/* Floating particles */}
      <canvas ref={canvasRef} style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        opacity: 0.7, pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
        {/* Hero headline */}
        <div style={{ textAlign: "center", marginBottom: 64, paddingTop: 20 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 48, height: 1, background: T.accent }} />
            <span style={{ fontFamily: font.body, fontSize: 10, color: T.accent, letterSpacing: 0.15, textTransform: "uppercase", fontWeight: 600 }}>The Process</span>
            <div style={{ width: 48, height: 1, background: T.accent }} />
          </div>
          <h2 style={{ fontFamily: font.display, fontSize: "clamp(36px, 5vw, 56px)", color: T.text, lineHeight: 1.15 }}>
            Own The Map.
            <br />
            <span style={{ color: T.accent, position: "relative", display: "inline-block" }}>
              Not Just The Leads.
              <span style={{ position: "absolute", bottom: -4, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`, opacity: 0.7 }} />
            </span>
          </h2>
          <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute, marginTop: 16 }}>
            From sign-up to closed deal in five proven steps. Average time to first listing appointment: 14 days.
          </p>
        </div>

        {/* USA map — clean outline, theme-styled */}
        <ProcessMap T={T} />

        {/* Steps — vertical flow: 1 → 2 → 3 → 4 → 5 */}
        <div className="process-steps-flow" style={{ maxWidth: 680, margin: "0 auto 80px" }}>
          {steps.map((s, i) => (
            <div
              key={i}
              className="process-step-card"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 24,
                position: "relative",
                opacity: 0,
                transform: "translateY(24px)",
                animation: vis ? `processStepIn 0.6s cubic-bezier(0.22,1,0.36,1) ${0.2 + i * 0.1}s forwards` : "none",
              }}
            >
              {/* Vertical connector line (except after last) */}
              {i < steps.length - 1 && (
                <div className="process-step-connector" style={{
                  position: "absolute", left: 27, top: 56, bottom: -24, width: 2,
                  background: `linear-gradient(to bottom, ${T.accent}, ${T.border})`,
                  borderRadius: 1,
                }} />
              )}
              {/* Step number circle */}
              <div style={{
                flexShrink: 0, width: 56, height: 56, borderRadius: "50%", border: `2px solid ${T.accent}`,
                background: "rgba(201,162,39,0.08)", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: font.body, fontSize: 14, fontWeight: 700, color: T.accent,
              }}>
                {s.num}
              </div>
              {/* Content */}
              <div style={{
                flex: 1, paddingBottom: 40,
                background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)",
                border: `1px solid ${T.border}`, borderRadius: 12, padding: "24px 28px",
                transition: "border-color 0.3s, box-shadow 0.3s, background 0.3s",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(201,162,39,0.4)";
                  e.currentTarget.style.boxShadow = "0 0 24px rgba(201,162,39,0.1)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.border;
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
              >
                <p style={{ fontFamily: font.body, fontSize: 10, color: T.accent, letterSpacing: 0.2, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Step {s.num}</p>
                <h3 style={{ fontFamily: font.display, fontSize: 20, color: T.text, marginBottom: 12, lineHeight: 1.25, fontWeight: 600 }}>{s.title}</h3>
                <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA — glass morphism */}
        <div style={{ textAlign: "center" }}>
          <button
            className="gold-btn"
            onClick={() => go("contact")}
            style={{
              background: "rgba(201,162,39,0.1)",
              border: `1px solid ${T.accent}`,
              color: T.accent,
              boxShadow: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 30px ${T.accentDim}, 0 0 60px ${T.accentDim}`;
              e.currentTarget.style.background = "rgba(201,162,39,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "rgba(201,162,39,0.1)";
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = ""; }}
          >
            Claim Your Territory
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .process-map-stage { height: 280px !important; }
          .process-steps-flow { padding: 0 16px !important; }
          .process-step-card { flex-direction: column; align-items: center; text-align: center !important; }
          .process-step-card > div:last-child { margin-left: 0 !important; }
          .process-step-connector { left: 50% !important; transform: translateX(-1px) !important; }
        }
        @media (max-width: 640px) {
          [id="process"] canvas { opacity: 0.4; }
          [id="process"] .process-map-stage { height: 220px !important; }
        }
      `}</style>
    </section>
  );
}

// ─── RESULTS (light theme) ───
function Results() {
  const [ref, vis] = useInView();
  const T = THEME.light;

  const stats = [
    { val: "500+", label: "Active Realtors", sub: "Top producers across all 50 states" },
    { val: "$2.4B+", label: "Closed Volume", sub: "Total transaction volume generated" },
    { val: "14%", label: "Avg. Conversion", sub: "Lead to closed deal rate" },
    { val: "12 Days", label: "First Leads", sub: "Average time to first verified lead" },
  ];

  return (
    <section id="results" ref={ref} style={{ position: "relative", padding: "clamp(60px, 10vw, 120px) clamp(20px, 5vw, 40px)", overflow: "hidden", background: T.bg }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 48, height: 1, background: T.accent }} />
            <span style={{ fontFamily: font.body, fontSize: 10, color: T.accent, letterSpacing: 0.15, textTransform: "uppercase", fontWeight: 600 }}>Our Impact</span>
            <div style={{ width: 48, height: 1, background: T.accent }} />
          </div>
          <h2 style={{ fontFamily: font.display, fontSize: "clamp(34px, 4vw, 50px)", color: T.text, lineHeight: 1.1 }}>
            Numbers that <em style={{ color: T.accent }}>realtors trust.</em>
          </h2>
        </div>

        <div className="stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 24 }}>
          {stats.map((s, i) => (
            <div key={i} className={`reveal ${vis ? "visible" : ""}`} style={{
              background: "rgba(255,255,255,0.8)", padding: "40px 28px", textAlign: "center",
              border: `1px solid ${T.border}`,
              transition: "opacity 0.6s ease, transform 0.6s ease",
              transitionDelay: `${i * 0.1}s`,
            }}>
              <div style={{ fontFamily: font.display, fontSize: 40, color: T.accent, lineHeight: 1, marginBottom: 10, fontWeight: 500 }}>{s.val}</div>
              <div style={{ fontFamily: font.body, fontSize: 14, color: T.text, fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: font.body, fontSize: 12, color: T.mute, fontWeight: 400 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WHY US (dark theme) ───
function Reviews() {
  const [ref, vis] = useInView();
  const T = THEME.dark;

  const pillars = [
    { title: "100% Exclusive Leads", desc: "Every seller lead belongs only to you in your territory. No sharing with other agents, no bidding wars, no recycled contacts. Your ZIP codes, your leads, period." },
    { title: "Double-Verified Before Delivery", desc: "Our ISA team screens every lead for identity, property ownership, selling timeline, and genuine motivation. You only talk to real homeowners who are ready to list." },
    { title: "Listing Appointments Set For You", desc: "We do not just hand you a phone number. Our inside sales team books qualified listing appointments directly on your calendar. You show up and close." },
    { title: "Money-Back Guarantee", desc: "We put our money where our mouth is. If you do not receive quality leads within your plan period, you are eligible for a full refund. Zero risk." },
    { title: "Full Tech Stack Included", desc: "CRM setup, automated follow-ups, pipeline tracking, IDX website, and reporting dashboard -- all configured and managed for you at no extra cost." },
    { title: "Dedicated Success Manager", desc: "A real person on your side who knows your market, optimizes your campaigns weekly, and ensures your pipeline stays full month after month." },
  ];

  return (
    <section id="reviews" ref={ref} role="region" aria-label="Why choose us" style={{ background: T.bg, padding: "clamp(60px, 10vw, 120px) clamp(20px, 5vw, 40px)", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 48, height: 1, background: T.accent }} />
            <span style={{ fontFamily: font.body, fontSize: 10, color: T.accent, letterSpacing: 0.15, textTransform: "uppercase", fontWeight: 600 }}>Why Estate Land</span>
            <div style={{ width: 48, height: 1, background: T.accent }} />
          </div>
          <h2 style={{ fontFamily: font.display, fontSize: "clamp(32px, 4vw, 46px)", color: T.text, lineHeight: 1.1 }}>
            Built for agents who <em style={{ color: T.accent }}>close.</em>
          </h2>
          <p style={{ fontFamily: font.body, fontSize: 15, color: T.mute, marginTop: 16, maxWidth: 520, margin: "16px auto 0", lineHeight: 1.6 }}>
            Six reasons why top-producing realtors choose Estate Land over every other lead source.
          </p>
        </div>

        <div className={`reveal ${vis ? "visible" : ""} reviews-why-grid`} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {pillars.map((p, i) => (
            <div key={i} style={{
              padding: "28px 24px", border: `1px solid ${T.border}`, background: T.bg,
              borderLeft: `3px solid ${T.accent}`,
            }}>
              <h3 style={{ fontFamily: font.display, fontSize: 18, color: T.text, marginBottom: 10, fontWeight: 600 }}>{p.title}</h3>
              <p style={{ fontFamily: font.body, fontSize: 14, color: T.textDim, lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function Plans() {
  const [ref, vis] = useInView(0.15);
  const T = THEME.light;
  const plans = PRICING_PLANS;

  return (
    <section id="plans" ref={ref} style={{ background: T.bg, padding: "clamp(60px, 10vw, 120px) clamp(20px, 5vw, 40px)", position: "relative", overflow: "hidden" }}>
      {/* Subtle background gradient */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(166,124,0,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 40, height: 2, background: T.accent, borderRadius: 1 }} />
            <span style={{ fontFamily: font.body, fontSize: 11, color: T.accent, letterSpacing: 0.2, textTransform: "uppercase", fontWeight: 600 }}>Plans</span>
            <div style={{ width: 40, height: 2, background: T.accent, borderRadius: 1 }} />
          </div>
          <h2 style={{ fontFamily: font.display, fontSize: "clamp(36px, 4.5vw, 52px)", color: T.text, lineHeight: 1.1, marginBottom: 14 }}>
            Simple <em style={{ color: T.accent, fontStyle: "italic" }}>plans.</em> Big results.
          </h2>
          <p style={{ fontFamily: font.body, fontSize: 16, color: T.mute, maxWidth: 540, margin: "0 auto" }}>One transparent fee for your plan term. Referral fee only when you close and get paid. Money-back guarantee on every plan.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: 28, alignItems: "stretch" }}>
          {plans.map((p, i) => (
            <div
              key={i}
              role="article"
              aria-label={`${p.name} plan — ${p.price} ${p.period}`}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                background: (p.popular || p.badge) ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.92)",
                borderRadius: 20,
                padding: (p.popular || p.badge) ? "40px 32px 36px" : "36px 28px 32px",
                border: (p.popular || p.badge) ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
                boxShadow: (p.popular || p.badge) ? "0 24px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)" : "0 12px 40px rgba(0,0,0,0.06)",
                opacity: vis ? 1 : 0,
                transform: vis ? "translateY(0)" : "translateY(32px)",
                animation: vis ? `processStepIn 0.7s cubic-bezier(0.22,1,0.36,1) ${0.15 + i * 0.12}s forwards` : "none",
                transition: "transform 0.35s ease, box-shadow 0.35s ease, border-color 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = (p.popular || p.badge) ? "0 32px 72px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)" : "0 20px 50px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = (p.popular || p.badge) ? "0 24px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)" : "0 12px 40px rgba(0,0,0,0.06)";
              }}
            >
              {(p.popular || p.badge) && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: T.accent, color: T.bg, fontFamily: font.body, fontSize: 10, fontWeight: 700, letterSpacing: 0.15, padding: "6px 18px", borderRadius: 20,
                }}>
                  {p.badge || "Most popular"}
                </div>
              )}
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <h3 style={{ fontFamily: font.display, fontSize: 26, color: T.text, marginBottom: 12, fontWeight: 600 }}>{p.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
                    <span style={{ fontFamily: font.display, fontSize: 42, color: T.accent, fontWeight: 700, lineHeight: 1 }}>
                      {p.price}
                    </span>
                </div>
                <p style={{ fontFamily: font.body, fontSize: 13, color: T.mute, marginTop: 8 }}>{p.period}</p>
                <p style={{ fontFamily: font.body, fontSize: 12, color: T.mute, marginTop: 4, opacity: 0.9 }}>{p.fee}</p>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", borderTop: `1px solid ${T.border}`, paddingTop: 24 }}>
                {p.features.map((f, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, fontFamily: font.body, fontSize: 14, color: T.textDim }}>
                    <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", background: "rgba(166,124,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, fontSize: 11, fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={`/get-started?plan=${p.id}`}
                className="gold-btn"
                style={{
                  marginTop: "auto", width: "100%", justifyContent: "center", padding: "18px 28px", fontSize: 13, textDecoration: "none",
                  background: (p.popular || p.badge) ? T.accent : "transparent",
                  color: (p.popular || p.badge) ? T.bg : T.text,
                  border: (p.popular || p.badge) ? "none" : `2px solid ${T.border}`,
                }}
                onMouseEnter={(e) => {
                  if ((p.popular || p.badge)) { e.currentTarget.style.background = "#8a6910"; e.currentTarget.style.color = T.bg; }
                  else { e.currentTarget.style.background = T.text; e.currentTarget.style.color = T.bg; e.currentTarget.style.borderColor = T.text; }
                }}
                onMouseLeave={(e) => {
                  if ((p.popular || p.badge)) { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = T.bg; }
                  else { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.border; }
                }}
              >
                Get started
              </Link>
              {p.agreement && (
                <a
                  href={p.agreement}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "center",
                    padding: "12px 18px",
                    fontSize: 13,
                    fontFamily: font.body,
                    color: T.accent,
                    textDecoration: "none",
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    marginTop: 10,
                    transition: "background 0.3s ease, border-color 0.3s ease",
                    fontWeight: 500,
                    letterSpacing: 0.3,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(201,162,39,0.08)";
                    e.currentTarget.style.borderColor = T.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = T.border;
                  }}
                >
                  View Agreement
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Money-Back Guarantee */}
        <div style={{
          marginTop: 48,
          padding: "36px 40px",
          background: "rgba(255,255,255,0.95)",
          borderRadius: 20,
          border: `1.5px solid rgba(166,124,0,0.35)`,
          boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "flex-start",
          gap: 24,
          maxWidth: 800,
          margin: "48px auto 0",
        }}>
          <div style={{
            flexShrink: 0,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(166,124,0,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
          }}>
            🛡️
          </div>
          <div>
            <h3 style={{
              fontFamily: font.display,
              fontSize: 22,
              color: T.text,
              fontWeight: 600,
              marginBottom: 10,
              letterSpacing: "-0.01em",
            }}>
              Money-Back Guarantee
            </h3>
            <p style={{
              fontFamily: font.body,
              fontSize: 15,
              color: T.textDim,
              lineHeight: 1.65,
              margin: 0,
            }}>
              We stand behind our system 100%. If you have not closed any leads or received meaningful services within your plan period, or received six instances of bad or bogus leads, you are eligible for a full refund of your one-time fee. No questions asked. Contact{" "}
              <a
                href="mailto:support@estaeland.us"
                style={{ color: T.accent, textDecoration: "none", fontWeight: 500 }}
              >
                support@estaeland.us
              </a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #plans [style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            max-width: 480px;
            margin: 0 auto;
            gap: 20px !important;
          }
        }
        @media (max-width: 768px) {
          #plans {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          #plans [style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            max-width: 100% !important;
            margin: 0 auto;
            gap: 16px !important;
          }
          #plans [role="article"] {
            padding: 28px 20px 24px !important;
            border-radius: 16px !important;
          }
          #plans h2 {
            font-size: clamp(28px, 6vw, 36px) !important;
          }
        }
        @media (max-width: 480px) {
          #plans {
            padding-top: 48px !important;
            padding-bottom: 48px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          #plans [style*="grid-template-columns"] {
            gap: 14px !important;
          }
          #plans [role="article"] {
            padding: 24px 16px 20px !important;
            border-radius: 14px !important;
          }
        }
      `}</style>
    </section>
  );
}

// ─── FAQ ───
function FAQ() {
  const [open, setOpen] = useState(null);
  const [ref, vis] = useInView(0.08);
  const items = [
    { q: "How are Estate Land leads different from Zillow, Realtor.com, or other portals?", a: "Portal leads are shared among 5-10+ agents, creating a race to the bottom. Estate Land leads are 100% exclusive to you -- no other agent gets the same lead. Every seller is double-verified for identity, property ownership, selling timeline, and genuine motivation before delivery. Our agents report a 14% average conversion rate compared to 1-3% on portal leads." },
    { q: "What areas of the United States do you currently serve?", a: "We operate in all 50 states with 500+ active agents. During onboarding, you select your preferred ZIP codes, counties, or metro areas. Our marketing campaigns are built specifically and exclusively around your territory -- from rural markets to major metros like NYC, LA, Chicago, Miami, and Dallas." },
    { q: "What is the typical ROI for Estate Land agents?", a: "Our agents typically see 8-15x return on their investment. For example, a Growth plan member paying $549 who closes just one $300K listing earns roughly $9,000 in commission after our referral fee -- a 16x return. Most agents close their first Estate Land deal within 45-60 days." },
    { q: "How fast will I start getting leads after signing up?", a: "Most agents receive their first verified seller leads within 7-14 days. We use the onboarding period to configure your CRM, build your ad campaigns, calibrate targeting to your specific market, and set up your automated follow-up sequences. After launch, leads flow consistently each week." },
    { q: "What exactly does the appointment setting service include?", a: "Our trained ISA team contacts every verified seller lead within 5 minutes of submission. They confirm the homeowner's intent, gather detailed property information (bedrooms, bathrooms, condition, renovations, asking price range), qualify motivation and timeline, handle objections, and schedule a listing appointment directly on your calendar with a confirmed date and time." },
    { q: "Can my team or brokerage use Estate Land?", a: "Absolutely. Our Growth and Premier plans support multi-agent teams and brokerages. Each agent gets their own exclusive territory, dedicated lead flow, individual CRM pipeline, and performance reporting. We currently serve teams of 2-50+ agents. Contact us for custom team pricing and onboarding." },
    { q: "What happens if I get a bad lead?", a: "Every lead goes through our double-verification process, but if a lead turns out to be invalid (wrong number, not a real seller, etc.), report it through your dashboard and we replace it at no cost. If you receive six instances of bad leads within your plan period without any closings, you are eligible for our full money-back guarantee." },
    { q: "Do you offer any guarantees?", a: "Yes. Estate Land offers a money-back guarantee on all plans. If you have not closed any leads or received any meaningful services within your plan period, or received six instances of verified bad leads, you are eligible for a full refund of your one-time fee. We are that confident in our system." },
  ];

  const T = THEME.dark;
  return (
    <section id="faq" ref={ref} style={{
      position: "relative",
      background: T.bg,
      padding: "clamp(80px, 10vw, 140px) 24px clamp(100px, 12vw, 160px)",
      overflow: "hidden",
    }}>
      {/* Subtle gradient orbs */}
      <div style={{
        position: "absolute", top: "10%", left: "-8%", width: "min(400px, 50vw)", height: "min(400px, 50vw)",
        background: `radial-gradient(circle, ${T.accentDim} 0%, transparent 70%)`, pointerEvents: "none", opacity: 0.6,
      }} />
      <div style={{
        position: "absolute", bottom: "5%", right: "-5%", width: "min(320px, 40vw)", height: "min(320px, 40vw)",
        background: `radial-gradient(circle, ${T.accentDim} 0%, transparent 70%)`, pointerEvents: "none", opacity: 0.4,
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.15fr)",
          gap: "clamp(48px, 6vw, 80px)",
          alignItems: "start",
        }} className="faq-grid">
          {/* Left: headline + support */}
          <div className={`reveal ${vis ? "visible" : ""}`} style={{ position: "sticky", top: 100 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 56, height: 2, background: `linear-gradient(90deg, ${T.accent}, transparent)` }} />
              <span style={{ fontFamily: font.body, fontSize: 11, color: T.accent, letterSpacing: 0.2, textTransform: "uppercase", fontWeight: 600 }}>FAQ</span>
            </div>
            <h2 style={{
              fontFamily: font.display,
              fontSize: "clamp(36px, 4.2vw, 52px)",
              color: T.text,
              lineHeight: 1.08,
              marginBottom: 20,
              fontWeight: 500,
            }}>
              Common <em style={{ color: T.accent, fontStyle: "italic" }}>questions.</em>
            </h2>
            <p style={{
              fontFamily: font.body,
              fontSize: 15,
              color: T.mute,
              lineHeight: 1.7,
              maxWidth: 320,
              marginBottom: 32,
            }}>
              Everything you need to know about exclusive leads, territory, and working with Estate Land.
            </p>
            <a href="#contact" className="outline-btn" style={{ textDecoration: "none" }}>
              Still have questions? Get in touch
            </a>
          </div>

          {/* Right: accordion cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((f, i) => (
              <div
                key={i}
                style={{
                  opacity: vis ? 1 : 0,
                  transform: vis ? "translateY(0)" : "translateY(24px)",
                  animation: vis ? `faqItemIn 0.6s cubic-bezier(0.22,1,0.36,1) ${0.12 + i * 0.08}s forwards` : "none",
                  background: "rgba(22,22,22,0.6)",
                  border: `1px solid ${open === i ? "rgba(201,162,39,0.35)" : T.border}`,
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "border-color 0.35s, box-shadow 0.35s, transform 0.3s",
                  boxShadow: open === i ? `0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px ${T.accentDim}` : "0 4px 20px rgba(0,0,0,0.08)",
                }}
                onMouseEnter={(e) => {
                  if (open !== i) {
                    e.currentTarget.style.borderColor = "rgba(240,235,227,0.18)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (open !== i) {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                  }
                }}
              >
                <button
                  type="button"
                  aria-expanded={open === i}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-question-${i}`}
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 20,
                    padding: "22px 24px",
                    cursor: "pointer",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    fontFamily: font.display,
                    fontSize: "clamp(16px, 1.8vw, 18px)",
                    color: open === i ? T.accent : T.textDim,
                    fontWeight: 500,
                    lineHeight: 1.35,
                    transition: "color 0.3s",
                  }}
                >
                  <span style={{
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: font.body,
                    fontSize: 11,
                    fontWeight: 700,
                    color: open === i ? T.accent : T.mute,
                    border: `1px solid ${open === i ? T.accent : T.border}`,
                    borderRadius: 8,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ flex: 1, paddingTop: 2 }}>{f.q}</span>
                  <span style={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: open === i ? T.accent : T.accentDim,
                    borderRadius: 8,
                    transition: "all 0.35s",
                  }}>
                    <span style={{
                      display: "block",
                      color: open === i ? T.bg : T.accent,
                      fontSize: 18,
                      lineHeight: 1,
                      transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
                    }}>+</span>
                  </span>
                </button>
                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-labelledby={`faq-question-${i}`}
                  style={{
                    display: "grid",
                    gridTemplateRows: open === i ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.5s cubic-bezier(0.22,1,0.36,1)",
                  }}
                >
                  <div style={{ overflow: "hidden", minHeight: 0 }}>
                    <div style={{
                      padding: "0 24px 24px 80px",
                      borderTop: open === i ? `1px solid ${T.border}` : "none",
                    }}>
                      <p style={{
                        fontFamily: font.body,
                        fontSize: 15,
                        color: T.mute,
                        lineHeight: 1.75,
                        fontWeight: 400,
                        margin: 0,
                        paddingTop: 16,
                      }}>{f.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .faq-grid { grid-template-columns: 1fr !important; }
          #faq .outline-btn { margin-bottom: 24px; }
        }
      `}</style>
    </section>
  );
}

// ─── CONTACT (light theme) ───
function Contact() {
  const [ref, vis] = useInView();
  const T = THEME.light;

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    console.log("Form data:", data);
    // TODO: Integrate with backend
  };

  const inputStyle = {
    padding: "14px 18px", border: `1px solid ${T.border}`,
    background: "rgba(255,255,255,0.9)", fontFamily: font.body, fontSize: 14, fontWeight: 400,
    color: T.text, outline: "none", transition: "border-color 0.3s",
  };

  return (
    <section id="contact" ref={ref} style={{ position: "relative", overflow: "hidden", background: T.bg }}>
      <div className="grid-2 contact-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", minHeight: "100dvh" }}>
        <div style={{
          background: T.bg, padding: "clamp(40px, 8vw, 90px) clamp(20px, 5vw, 52px)", display: "flex", flexDirection: "column", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&q=80)",
            backgroundSize: "cover", backgroundPosition: "center", opacity: 0.08,
          }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div className={`reveal ${vis ? "visible" : ""}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 48, height: 1, background: T.accent }} />
                <span style={{ fontFamily: font.body, fontSize: 10, color: T.accent, letterSpacing: 0.15, textTransform: "uppercase", fontWeight: 600 }}>Get In Touch</span>
              </div>
              <h2 style={{ fontFamily: font.display, fontSize: "clamp(34px, 4vw, 48px)", color: T.text, lineHeight: 1.1, marginBottom: 20 }}>
                Build your
                <br /><em style={{ color: T.accent }}>lead machine.</em>
              </h2>
              <p style={{ fontFamily: font.body, fontSize: 16, color: T.textDim, lineHeight: 1.75, fontWeight: 400, marginBottom: 52, maxWidth: 400 }}>
                Join 500+ top-producing realtors across all 50 states who trust Estate Land for exclusive seller leads. Schedule a free strategy call and see how we can fill your pipeline in 14 days or less.
              </p>
            </div>

            <div className={`reveal ${vis ? "visible" : ""} reveal-d2`} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, background: T.accentDim, border: `1px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }} aria-hidden>📞</div>
                <div>
                  <a href="tel:+18005551234" style={{ fontFamily: font.body, fontSize: 16, color: T.text, fontWeight: 500, textDecoration: "none" }}>+1 312-778-5505</a>
                  <div style={{ fontFamily: font.body, fontSize: 12, color: T.mute, fontWeight: 400 }}>Mon – Fri, 8:00 AM – 8:00 PM EST</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, background: T.accentDim, border: `1px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }} aria-hidden>✉️</div>
                <div>
                  <a href="mailto:support@estateland.us" style={{ fontFamily: font.body, fontSize: 16, color: T.text, fontWeight: 500, textDecoration: "none" }}>support@estateland.us</a>
                  <div style={{ fontFamily: font.body, fontSize: 12, color: T.mute, fontWeight: 400 }}>Response within 2 business hours</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, background: T.accentDim, border: `1px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }} aria-hidden>📍</div>
                <div>
                  <div style={{ fontFamily: font.body, fontSize: 16, color: T.text, fontWeight: 500 }}>United States</div>
                  <div style={{ fontFamily: font.body, fontSize: 12, color: T.mute, fontWeight: 400 }}>Serving all 50 states</div>
                </div>
              </div>
            </div>

            <div className={`reveal ${vis ? "visible" : ""} reveal-d4`} style={{ display: "flex", gap: 12, marginTop: 44 }}>
              {[
                { label: "LinkedIn", href: "https://linkedin.com/company/estateland", aria: "LinkedIn" },
                { label: "Instagram", href: "https://instagram.com/estateland", aria: "Instagram" },
                { label: "Facebook", href: "https://facebook.com/estateland", aria: "Facebook" },
                { label: "X", href: "https://x.com/estateland", aria: "X" },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.aria} style={{
                  padding: "10px 18px", border: `1px solid ${T.border}`, cursor: "pointer",
                  fontFamily: font.body, fontSize: 11, color: T.accent, letterSpacing: 0.1, fontWeight: 500,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", textDecoration: "none",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = T.bg; e.currentTarget.style.borderColor = T.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.accent; e.currentTarget.style.borderColor = T.border; }}
                >{s.label}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="contact-form-panel" style={{ background: "rgba(255,255,255,0.5)", padding: "clamp(40px, 8vw, 90px) clamp(20px, 5vw, 52px)", display: "flex", flexDirection: "column", justifyContent: "center", borderLeft: `1px solid ${T.border}` }}>
          <div className={`reveal ${vis ? "visible" : ""} reveal-d1`}>
            <h3 style={{ fontFamily: font.display, fontSize: 28, color: T.text, marginBottom: 6 }}>Schedule Your Free Consultation</h3>
            <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute, fontWeight: 400, marginBottom: 36 }}>Fill in the details below. Our team will reach out within 2 hours.</p>

            <form onSubmit={handleSubmit}>
              <div className="contact-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 14 }}>
                <label className="sr-only" htmlFor="firstName">First Name</label>
                <input id="firstName" name="firstName" type="text" placeholder="First Name" required aria-required="true" autoComplete="given-name" style={{ ...inputStyle, gridColumn: "auto" }}
                  onFocus={e => { e.target.style.borderColor = T.accent; }} onBlur={e => { e.target.style.borderColor = T.border; }} />
                <label className="sr-only" htmlFor="lastName">Last Name</label>
                <input id="lastName" name="lastName" type="text" placeholder="Last Name" autoComplete="family-name" style={{ ...inputStyle, gridColumn: "auto" }}
                  onFocus={e => { e.target.style.borderColor = T.accent; }} onBlur={e => { e.target.style.borderColor = T.border; }} />
                <label className="sr-only" htmlFor="email">Email Address</label>
                <input id="email" name="email" type="email" placeholder="Email Address" required aria-required="true" autoComplete="email" style={{ ...inputStyle, gridColumn: "1 / -1" }}
                  onFocus={e => { e.target.style.borderColor = T.accent; }} onBlur={e => { e.target.style.borderColor = T.border; }} />
                <label className="sr-only" htmlFor="phone">Phone Number</label>
                <input id="phone" name="phone" type="tel" placeholder="Phone Number" required aria-required="true" autoComplete="tel" style={{ ...inputStyle, gridColumn: "auto" }}
                  onFocus={e => { e.target.style.borderColor = T.accent; }} onBlur={e => { e.target.style.borderColor = T.border; }} />
                <label className="sr-only" htmlFor="brokerage">Your Brokerage</label>
                <input id="brokerage" name="brokerage" type="text" placeholder="Your Brokerage" style={{ ...inputStyle, gridColumn: "auto" }}
                  onFocus={e => { e.target.style.borderColor = T.accent; }} onBlur={e => { e.target.style.borderColor = T.border; }} />
                <label className="sr-only" htmlFor="market">Preferred Market / ZIP Code</label>
                <input id="market" name="market" type="text" placeholder="Preferred Market / ZIP Code" style={{ ...inputStyle, gridColumn: "1 / -1" }}
                  onFocus={e => { e.target.style.borderColor = T.accent; }} onBlur={e => { e.target.style.borderColor = T.border; }} />
                <label className="sr-only" htmlFor="dealsClosed">Deals Closed Per Year</label>
                <select id="dealsClosed" name="dealsClosed" style={{
                  gridColumn: "1 / -1", padding: "14px 18px", border: `1px solid ${T.border}`, background: "rgba(255,255,255,0.9)",
                  fontFamily: font.body, fontSize: 14, fontWeight: 400, color: T.mute, outline: "none", appearance: "none",
                }}>
                  <option value="">Deals Closed Per Year</option>
                  <option value="1-5">1 – 5 deals</option>
                  <option value="6-15">6 – 15 deals</option>
                  <option value="16-30">16 – 30 deals</option>
                  <option value="30+">30+ deals</option>
                </select>
                <label className="sr-only" htmlFor="goals">Tell us about your business goals</label>
                <textarea id="goals" name="goals" placeholder="Tell us about your business goals..." rows={4} style={{
                  gridColumn: "1 / -1", ...inputStyle, resize: "vertical",
                }} onFocus={e => { e.target.style.borderColor = T.accent; }} onBlur={e => { e.target.style.borderColor = T.border; }} />
              </div>

              <button type="submit" className="gold-btn" style={{ width: "100%", justifyContent: "center", marginTop: 22, padding: "18px 36px", fontSize: 12 }}>
                Book My Free Strategy Call →
              </button>
            </form>

            <p style={{ fontFamily: font.body, fontSize: 11, color: T.mute, textAlign: "center", marginTop: 14, fontWeight: 400 }}>
              No obligation · No contracts · 100% free consultation
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───
function Footer() {
  const [email, setEmail] = useState("");
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const footerLinkStyle = { fontFamily: font.body, fontSize: 13, color: C.mute, fontWeight: 400, textDecoration: "none", transition: "all 0.3s cubic-bezier(.4,0,.2,1)", display: "inline-block" };
  const footerLinks = [
    { title: "Company", items: [
      { label: "About Us", to: "/#about" },
      { label: "Services", to: "/#services" },
      { label: "Plans", to: "/#plans" },
      { label: "Results", to: "/#results" },
      { label: "Careers", to: "/careers" },
    ]},
    { title: "Resources", items: [
      { label: "Blog", to: "/blog" },
      { label: "Agent Guide", to: "/agent-guide" },
      { label: "Market Reports", to: "/market-reports" },
      { label: "Referral Program", to: "/referral" },
      { label: "FAQ", to: "/#faq" },
      { label: "Info about Estate Land", to: "/info" },
    ]},
    { title: "Legal", items: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Cookie Policy", to: "/cookies" },
      { label: "Contact Us", to: "/#contact" },
    ]},
  ];

  const socialLinks = [
    { name: "Facebook", href: "https://facebook.com/estateland", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
    { name: "Instagram", href: "https://instagram.com/estateland", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
    { name: "LinkedIn", href: "https://linkedin.com/company/estateland", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
    { name: "Twitter", href: "https://x.com/estateland", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    { name: "YouTube", href: "https://youtube.com/@estateland", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  ];

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer role="contentinfo" style={{ background: `linear-gradient(180deg, ${C.void} 0%, #050505 100%)`, position: "relative", overflow: "hidden" }}>
      {/* Decorative top gold line */}
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent 0%, ${C.gold} 20%, ${C.goldLight} 50%, ${C.gold} 80%, transparent 100%)` }} />

      {/* CTA Banner Section */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(48px, 6vw, 80px) clamp(20px, 5vw, 40px) 0" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.surface} 0%, ${C.surfaceLight} 100%)`, borderRadius: 16, padding: "clamp(32px, 5vw, 56px)", border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
          {/* Decorative corner accent */}
          <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: `radial-gradient(circle at top right, ${C.goldDim}, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: 150, height: 150, background: `radial-gradient(circle at bottom left, ${C.goldDim}, transparent 70%)`, pointerEvents: "none" }} />
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 32, position: "relative", zIndex: 1 }}>
            <div style={{ maxWidth: 500 }}>
              <div style={{ fontFamily: font.display, fontSize: "clamp(22px, 3vw, 32px)", color: C.cream, letterSpacing: 1, lineHeight: 1.3 }}>
                Ready to Dominate Your Market?
              </div>
              <p style={{ fontFamily: font.body, fontSize: 14, color: C.mute, marginTop: 10, lineHeight: 1.6 }}>
                Join 500+ top-performing realtors who close more deals with Estate Land's exclusive, double-verified seller leads.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/#plans" className="gold-btn" style={{ padding: "14px 32px", fontSize: 13, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>
                View Plans
              </Link>
              <Link to="/#contact" style={{ padding: "14px 32px", fontSize: 13, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600, fontFamily: font.body, color: C.cream, border: `1px solid ${C.border}`, borderRadius: 6, textDecoration: "none", transition: "all 0.3s", display: "inline-flex", alignItems: "center", gap: 8 }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.cream; }}
              >
                Book a Call <span style={{ fontSize: 16 }}>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(48px, 6vw, 72px) clamp(20px, 5vw, 40px) 32px" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr", gap: 52, marginBottom: 52 }}>
          {/* Brand Column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, border: `1px solid ${C.gold}`, transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ transform: "rotate(-45deg)", fontFamily: font.display, fontSize: 16, color: C.gold, fontWeight: 500 }}>E</span>
              </div>
              <div>
                <div style={{ fontFamily: font.display, fontSize: 16, color: C.cream, letterSpacing: 2 }}>ESTATE</div>
                <div style={{ fontFamily: font.body, fontSize: 8, color: C.gold, letterSpacing: 4, fontWeight: 600 }}>LAND</div>
              </div>
            </div>
            <p style={{ fontFamily: font.body, fontSize: 13, color: C.mute, lineHeight: 1.75, fontWeight: 400, maxWidth: 280 }}>
              The #1 exclusive lead platform for top-producing realtors across all 50 states. 500+ agents trust Estate Land for verified seller leads, listing appointments, and full CRM automation.
            </p>
            <a href="https://estateland.us" target="_blank" rel="noopener noreferrer" style={{ ...footerLinkStyle, color: C.gold, display: "inline-block", marginTop: 14, fontWeight: 500 }}>www.estateland.us</a>
            
            {/* Social Icons */}
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              {socialLinks.map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.name}
                  onMouseEnter={() => setHoveredSocial(i)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: `1px solid ${hoveredSocial === i ? C.gold : C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: hoveredSocial === i ? C.gold : C.mute,
                    background: hoveredSocial === i ? C.goldDim : "transparent",
                    transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
                    transform: hoveredSocial === i ? "translateY(-2px)" : "translateY(0)",
                  }}
                >{social.icon}</a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((col, i) => (
            <div key={i}>
              <div style={{ fontFamily: font.body, fontSize: 11, color: C.gold, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 16, height: 1, background: C.gold, display: "inline-block" }} />
                {col.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {col.items.map((item, j) => (
                  <Link key={j} to={item.to} style={footerLinkStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.color = C.gold; e.currentTarget.style.transform = "translateX(4px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = C.mute; e.currentTarget.style.transform = "translateX(0)"; }}
                  >{item.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter / Email Signup */}
        <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "32px 0", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontFamily: font.display, fontSize: 16, color: C.cream, letterSpacing: 0.5 }}>Stay Ahead of the Market</div>
            <p style={{ fontFamily: font.body, fontSize: 12, color: C.mute, marginTop: 4 }}>Get exclusive insights and lead generation tips delivered weekly.</p>
          </div>
          <div style={{ display: "flex", gap: 0, maxWidth: 400, width: "100%" }}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" style={{
              flex: 1, padding: "12px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRight: "none", borderRadius: "6px 0 0 6px",
              fontFamily: font.body, fontSize: 13, color: C.cream, outline: "none", transition: "border-color 0.3s",
            }}
            onFocus={(e) => e.target.style.borderColor = C.gold}
            onBlur={(e) => e.target.style.borderColor = C.border}
            />
            <button className="gold-btn" style={{ padding: "12px 24px", fontSize: 12, borderRadius: "0 6px 6px 0", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <span style={{ fontFamily: font.body, fontSize: 11, color: C.mute, fontWeight: 400 }}>
            © 2026 Estate Land. All rights reserved. | estateland.us
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontFamily: font.body, fontSize: 11, color: C.mute, fontWeight: 400, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              United States · Serving all 50 states
            </span>
            <button onClick={scrollToTop} aria-label="Back to top"
              style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.border}`, background: "transparent", color: C.mute, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mute; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════
// LAYOUT & PAGES
// ═══════════════════
export function Layout({ children }) {
  return (
    <div>
      <Styles />
      <GrainOverlay />
      <Navbar />
      <main id="main-content" role="main">{children}</main>
      <Footer />
    </div>
  );
}

export function HomePage() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [hash]);

  return (
    <>
      <Hero />
          <GoldSeparator />
      <Services />
          <GoldSeparator />
      <About />
          <GoldSeparator />
      <Marquee />
          <GoldSeparator />
      <Process />
          <GoldSeparator />
      <Results />
          <GoldSeparator />
      <Reviews />
          <GoldSeparator />
      <Plans />
          <GoldSeparator />
      <FAQ />
          <GoldSeparator />
      <Contact />
    </>
  );
}

export default function EstateLandApp() {
  return (
    <Layout>
      <HomePage />
    </Layout>
  );
}
