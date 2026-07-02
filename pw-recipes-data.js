:root {
  --bg: #06122f;
  --bg-2: #090b24;
  --card: rgba(255, 255, 255, 0.078);
  --card-strong: rgba(255, 255, 255, 0.12);
  --line: rgba(255, 255, 255, 0.14);
  --text: #f8fafc;
  --muted: #b8bbd0;
  --pink: #e80075;
  --pink-soft: #ff4fa3;
  --gold: #d9a72e;
  --green: #6ee7b7;
  --danger: #f87171;
  --shadow: 0 20px 60px rgba(0,0,0,.35);
  --radius: 26px;
  --nav-h: 82px;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--text);
  background:
    radial-gradient(circle at 15% 8%, rgba(232,0,117,.22), transparent 28%),
    radial-gradient(circle at 90% 10%, rgba(76,29,149,.34), transparent 30%),
    radial-gradient(circle at 70% 90%, rgba(232,0,117,.14), transparent 28%),
    linear-gradient(160deg, var(--bg), var(--bg-2));
  min-height: 100vh;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(ellipse at 10% 30%, rgba(255,255,255,.05) 0 2px, transparent 3px),
    radial-gradient(ellipse at 80% 75%, rgba(255,79,163,.08) 0 3px, transparent 4px);
  opacity: .65;
}

button, input, select, textarea { font: inherit; }
button { cursor: pointer; }

.app-shell {
  width: min(100%, 560px);
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  padding-bottom: calc(var(--nav-h) + env(safe-area-inset-bottom));
}

.app-header { padding: 18px 14px 0; }
.app-brand-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 112px;
  padding: 18px;
  overflow: hidden;
  border-radius: 0 0 30px 30px;
  border: 1px solid rgba(255,255,255,.12);
  background:
    radial-gradient(circle at 12% 20%, rgba(232,0,117,.34), transparent 28%),
    radial-gradient(circle at 88% 0%, rgba(217,167,46,.18), transparent 24%),
    linear-gradient(135deg, rgba(20,13,56,.98), rgba(5,12,39,.96));
  box-shadow: var(--shadow);
}
.app-brand-card::before {
  content: "";
  position: absolute;
  inset: -35% -15% auto auto;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(255,79,163,.18), transparent 45%),
    radial-gradient(circle at 70% 30%, rgba(126,34,206,.22), transparent 38%);
  pointer-events: none;
}
.app-brand-card::after {
  content: "";
  position: absolute;
  right: 18px;
  bottom: 14px;
  color: var(--gold);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .16em;
  font-weight: 900;
  opacity: .92;
}
.brand-mark {
  position: relative;
  width: 72px;
  height: 72px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background:
    radial-gradient(circle at 28% 20%, rgba(255,255,255,.20), transparent 20%),
    linear-gradient(135deg, rgba(232,0,117,.95), rgba(78,24,128,.92));
  border: 1px solid rgba(255,255,255,.20);
  box-shadow: 0 16px 34px rgba(232,0,117,.20);
}
.brand-initials {
  position: relative;
  z-index: 2;
  color: #fff;
  font-size: 21px;
  font-weight: 950;
  letter-spacing: -.04em;
}
.petal {
  position: absolute;
  width: 15px;
  height: 15px;
  border-radius: 999px 999px 999px 0;
  background: var(--pink-soft);
  opacity: .88;
}
.petal-1 { top: -4px; right: 12px; transform: rotate(20deg); }
.petal-2 { right: -5px; top: 28px; background: var(--gold); transform: rotate(92deg); }
.petal-3 { bottom: -5px; left: 20px; background: #7dd3fc; transform: rotate(180deg); }
.petal-4 { left: -5px; top: 26px; background: #c084fc; transform: rotate(265deg); }
.brand-copy { position: relative; z-index: 1; min-width: 0; flex: 1; }
.brand-copy h1 { margin-bottom: 4px; }
.brand-subtitle {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  font-weight: 750;
}
.app-brand-card .icon-button { position: relative; z-index: 1; flex: none; }
.eyebrow {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: .16em;
  font-size: 11px;
  color: var(--muted);
  font-weight: 800;
}
.eyebrow.pink { color: var(--pink-soft); }
.eyebrow.gold { color: var(--gold); }
h1, h2, h3, p { margin-top: 0; }
h1 { margin-bottom: 0; font-size: 30px; line-height: 1.05; }
h2 { margin-bottom: 10px; font-size: 24px; line-height: 1.1; }
h3 { margin-bottom: 8px; font-size: 19px; line-height: 1.15; }
.muted { color: var(--muted); }
.small { font-size: 13px; line-height: 1.45; }
.label { color: var(--muted); margin-bottom: 6px; font-size: 13px; }

.page-wrap { padding: 8px 14px 20px; }
.page { display: none; animation: fadeUp .22s ease-out; }
.page.active { display: block; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.card {
  background: linear-gradient(180deg, var(--card-strong), var(--card));
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px;
  margin: 14px 0;
  box-shadow: 0 10px 35px rgba(0,0,0,.18);
  backdrop-filter: blur(14px);
}
.hero-card {
  background:
    linear-gradient(135deg, rgba(232,0,117,.22), rgba(255,255,255,.08)),
    linear-gradient(180deg, var(--card-strong), var(--card));
}
.soft-card { border-color: rgba(232,0,117,.25); }
.callout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-color: rgba(217,167,46,.35);
}
.grid { display: grid; gap: 14px; }
.grid.two { grid-template-columns: 1fr 1fr; }
.stat-card h3 { font-size: 22px; margin-bottom: 0; }
.card-icon { font-size: 24px; display: inline-block; margin-bottom: 8px; }
.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}
.hero-actions, .button-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
}

button, .button {
  border: 0;
  border-radius: 999px;
  padding: 12px 16px;
  color: white;
  min-height: 45px;
  font-weight: 800;
}
button.primary {
  background: linear-gradient(135deg, var(--pink), var(--pink-soft));
  box-shadow: 0 12px 24px rgba(232,0,117,.24);
}
button.secondary {
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.16);
}
button.danger {
  background: rgba(248,113,113,.15);
  border: 1px solid rgba(248,113,113,.45);
  color: #fecaca;
}
button.text-button {
  background: transparent;
  color: var(--pink-soft);
  padding: 4px 0;
  min-height: auto;
}
button.icon-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  padding: 0;
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.16);
}
button.full { width: 100%; margin-top: 14px; }

.meter {
  height: 9px;
  background: rgba(255,255,255,.11);
  border-radius: 999px;
  overflow: hidden;
  margin-top: 10px;
}
.meter.large { height: 14px; }
.meter span {
  display: block;
  height: 100%;
  width: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--pink), var(--gold));
  transition: width .2s ease;
}
.ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex: none;
  font-weight: 900;
  background: conic-gradient(var(--pink) var(--pct, 0deg), rgba(255,255,255,.10) 0);
  border: 1px solid rgba(255,255,255,.16);
}

.weekly-strip {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-top: 12px;
}
.day-dot {
  min-height: 72px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  border-radius: 18px;
  padding: 8px 6px;
  text-align: center;
}
.day-dot strong { display: block; font-size: 12px; margin-bottom: 5px; }
.day-dot span { display: block; font-size: 13px; line-height: 1.2; }
.day-dot.done { border-color: rgba(110,231,183,.45); background: rgba(110,231,183,.10); }

input, select, textarea {
  width: 100%;
  margin-top: 7px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,.16);
  background: rgba(2,6,23,.42);
  color: var(--text);
  padding: 13px 14px;
  outline: none;
}
textarea { resize: vertical; }
input::placeholder, textarea::placeholder { color: rgba(184,187,208,.7); }
label { color: var(--text); font-size: 13px; font-weight: 800; }
.field-label { display: block; margin-top: 14px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-grid label:first-child:last-child { grid-column: 1 / -1; }

.movement-options, .filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0;
}
.movement-options button, .filter-row button {
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.14);
  padding: 10px 12px;
  min-height: 40px;
}
.movement-options button.active, .filter-row button.active {
  background: rgba(232,0,117,.25);
  border-color: rgba(255,79,163,.65);
}

canvas {
  width: 100%;
  height: 230px;
  display: block;
  background: rgba(2,6,23,.22);
  border: 1px solid rgba(255,255,255,.10);
  border-radius: 22px;
}
.summary-list { display: grid; gap: 10px; margin-top: 12px; }
.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255,255,255,.06);
}

.photo-inputs { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 12px; }
.photo-gallery { display: grid; gap: 14px; }
.photo-set { margin-top: 0; }
.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
}
.photo-tile {
  min-height: 110px;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.12);
  display: grid;
  place-items: center;
  color: var(--muted);
  font-size: 12px;
}
.photo-tile img { width: 100%; height: 150px; object-fit: cover; display: block; }
.photo-preview-empty {
  min-height: 120px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  color: var(--muted);
  border: 1px dashed rgba(255,255,255,.20);
  background: rgba(255,255,255,.04);
}

.recipe-list { display: grid; gap: 14px; }
.recipe-card {
  margin: 0;
  display: grid;
  gap: 10px;
}
.recipe-tags { display: flex; flex-wrap: wrap; gap: 7px; }
.tag {
  font-size: 12px;
  color: #ffd4e9;
  background: rgba(232,0,117,.18);
  border: 1px solid rgba(255,79,163,.24);
  padding: 5px 8px;
  border-radius: 999px;
}
.macro-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.macro-row span {
  background: rgba(255,255,255,.06);
  border-radius: 14px;
  padding: 9px 6px;
  text-align: center;
  font-size: 12px;
}
.recipe-modal {
  width: min(94vw, 520px);
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 28px;
  background: #080d29;
  color: var(--text);
  padding: 18px;
  box-shadow: var(--shadow);
}
.recipe-modal::backdrop { background: rgba(0,0,0,.65); }
.recipe-modal ul, .recipe-modal ol { padding-left: 20px; }

.bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(100%, 560px);
  min-height: var(--nav-h);
  padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  background: rgba(5,10,31,.92);
  border-top: 1px solid rgba(255,255,255,.13);
  backdrop-filter: blur(18px);
  z-index: 20;
}
.nav-btn {
  border-radius: 20px;
  padding: 8px 4px;
  min-height: 58px;
  background: transparent;
  color: var(--muted);
  font-size: 10px;
  font-weight: 800;
}
.nav-btn span { display: block; font-size: 20px; margin-bottom: 3px; }
.nav-btn.active {
  color: white;
  background: rgba(232,0,117,.22);
  border: 1px solid rgba(255,79,163,.25);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: calc(var(--nav-h) + 16px);
  transform: translateX(-50%);
  width: min(92%, 480px);
  padding: 12px 16px;
  border-radius: 999px;
  background: rgba(232,0,117,.95);
  color: white;
  text-align: center;
  font-weight: 800;
  z-index: 50;
  box-shadow: var(--shadow);
}

@media (max-width: 420px) {
  .grid.two, .form-grid { grid-template-columns: 1fr; }
  .callout { align-items: flex-start; flex-direction: column; }
  .macro-row { grid-template-columns: repeat(2, 1fr); }
  .photo-grid { grid-template-columns: 1fr; }
  .photo-tile img { height: 220px; }
  h1 { font-size: 26px; }
  h2 { font-size: 22px; }
}

/* Onboarding */
.onboarding-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: none;
  align-items: flex-start;
  justify-content: center;
  padding: 18px 14px calc(22px + env(safe-area-inset-bottom));
  background: rgba(3, 7, 28, .86);
  backdrop-filter: blur(18px);
  overflow-y: auto;
}
.onboarding-overlay.active { display: flex; }
.onboarding-card {
  width: min(100%, 560px);
  margin: auto 0;
  border-radius: 32px;
  padding: 20px;
  background:
    radial-gradient(circle at 0% 0%, rgba(232,0,117,.26), transparent 32%),
    radial-gradient(circle at 100% 0%, rgba(217,167,46,.16), transparent 30%),
    linear-gradient(160deg, rgba(20,13,56,.98), rgba(5,12,39,.98));
  border: 1px solid rgba(255,255,255,.16);
  box-shadow: var(--shadow);
}
.onboarding-top {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 16px;
}
.small-mark { width: 58px; height: 58px; border-radius: 20px; }
.full-text { width: 100%; color: var(--muted); }
.install-help { margin-top: 18px; }
.install-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}
.mini-card {
  border-radius: 20px;
  padding: 13px;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.13);
}
.mini-card h3 { margin-bottom: 6px; }
.mini-card p { margin-bottom: 0; color: var(--muted); font-size: 13px; line-height: 1.45; }
code { color: #ffd4e9; }

/* Movement improvements */
.saved-status {
  margin: 12px 0 6px;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.12);
  color: var(--muted);
  font-size: 13px;
  font-weight: 800;
}
.saved-status.done {
  color: #dcfce7;
  background: rgba(110,231,183,.12);
  border-color: rgba(110,231,183,.35);
}
.quick-movement-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 12px;
}
.movement-history { display: grid; gap: 10px; margin-top: 12px; }
.movement-row small { color: var(--muted); font-weight: 650; }

.movement-delta-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}
.delta-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 74px;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.08);
  color: var(--muted);
}
.delta-pill.up {
  color: #dcfce7;
  background: rgba(110,231,183,.12);
  border-color: rgba(110,231,183,.35);
}
.delta-pill.down {
  color: #fecaca;
  background: rgba(248,113,113,.12);
  border-color: rgba(248,113,113,.35);
}
.delta-pill.same {
  color: #fde68a;
  background: rgba(217,167,46,.12);
  border-color: rgba(217,167,46,.32);
}

/* Camera/photo controls */
.photo-slot {
  border-radius: 22px;
  padding: 14px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.13);
}
.photo-slot h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.camera-badge {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(232,0,117,.24);
  border: 1px solid rgba(255,79,163,.32);
}
.photo-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.photo-action {
  display: grid;
  place-items: center;
  min-height: 48px;
  border-radius: 999px;
  color: white;
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.16);
  font-weight: 900;
  text-align: center;
  cursor: pointer;
}
.photo-action.primary-photo {
  background: linear-gradient(135deg, var(--pink), var(--pink-soft));
  box-shadow: 0 12px 24px rgba(232,0,117,.20);
}
.photo-action input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

@media (max-width: 420px) {
  .install-grid { grid-template-columns: 1fr; }
  .photo-actions { grid-template-columns: 1fr; }
  .onboarding-top { align-items: flex-start; }
}

/* V1.0.4 visual refresh: premium floral brand system */
:root {
  --bg: #05071f;
  --bg-2: #09042a;
  --card: rgba(255, 255, 255, 0.072);
  --card-strong: rgba(255, 255, 255, 0.13);
  --line: rgba(255, 255, 255, 0.16);
  --pink: #e80075;
  --pink-soft: #ff4fa3;
  --gold: #d9a72e;
  --aqua: #21d4e8;
  --shadow: 0 24px 70px rgba(0,0,0,.42);
}

body {
  background:
    radial-gradient(circle at 12% -4%, rgba(33,212,232,.16), transparent 28%),
    radial-gradient(circle at 18% 18%, rgba(232,0,117,.28), transparent 34%),
    radial-gradient(circle at 88% 8%, rgba(217,167,46,.13), transparent 26%),
    radial-gradient(circle at 74% 86%, rgba(139,92,246,.22), transparent 34%),
    linear-gradient(155deg, #05071f 0%, #09042a 48%, #040918 100%);
}

body::before {
  background-image:
    radial-gradient(circle at 8% 16%, rgba(255,255,255,.08) 0 1px, transparent 2px),
    radial-gradient(circle at 84% 18%, rgba(255,79,163,.10) 0 2px, transparent 3px),
    radial-gradient(circle at 78% 76%, rgba(217,167,46,.09) 0 2px, transparent 3px),
    linear-gradient(115deg, transparent 0 42%, rgba(255,255,255,.025) 42% 43%, transparent 43% 100%);
  opacity: .82;
}

body::after {
  content: "";
  position: fixed;
  inset: auto -90px -120px auto;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232,0,117,.18), transparent 62%);
  pointer-events: none;
  filter: blur(2px);
}

.app-header { padding: 14px 12px 0; }
.app-brand-card {
  min-height: 118px;
  padding: 14px 14px;
  gap: 14px;
  border-radius: 0 0 34px 34px;
  border: 1px solid rgba(255,255,255,.18);
  background:
    radial-gradient(circle at 8% 18%, rgba(232,0,117,.30), transparent 34%),
    radial-gradient(circle at 62% -10%, rgba(33,212,232,.14), transparent 30%),
    radial-gradient(circle at 95% 75%, rgba(217,167,46,.16), transparent 26%),
    linear-gradient(135deg, rgba(22,9,56,.96), rgba(4,10,34,.98));
  box-shadow: 0 26px 70px rgba(0,0,0,.46), inset 0 1px 0 rgba(255,255,255,.08);
}
.app-brand-card::before {
  inset: -70px -78px auto auto;
  width: 260px;
  height: 260px;
  background:
    radial-gradient(circle, rgba(255,79,163,.22), transparent 42%),
    radial-gradient(circle at 72% 22%, rgba(217,167,46,.16), transparent 33%);
}
.app-brand-card::after { content: ""; display: none; }

.topbar-logo-wrap {
  position: relative;
  z-index: 1;
  width: 94px;
  height: 94px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 30px;
  background:
    radial-gradient(circle at 42% 36%, rgba(255,255,255,.13), transparent 42%),
    linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.035));
  border: 1px solid rgba(255,255,255,.18);
  box-shadow: 0 18px 38px rgba(0,0,0,.30), 0 0 0 1px rgba(232,0,117,.11);
  overflow: visible;
}
.topbar-logo-wrap::after {
  content: "";
  position: absolute;
  inset: 10px;
  border-radius: 24px;
  background: radial-gradient(circle, rgba(232,0,117,.12), transparent 65%);
  pointer-events: none;
}
.brand-logo {
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 10px 18px rgba(0,0,0,.35));
}
.topbar-logo {
  position: relative;
  z-index: 2;
  width: 108px;
  height: 108px;
  max-width: none;
}
.small-logo {
  width: 76px;
  height: 76px;
  flex: none;
  border-radius: 24px;
  padding: 4px;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.16);
}

.brand-copy h1 {
  font-size: 32px;
  letter-spacing: -.045em;
  text-shadow: 0 8px 30px rgba(0,0,0,.32);
}
.brand-subtitle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  margin-top: 4px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,.075);
  border: 1px solid rgba(255,255,255,.10);
  color: #e9d7ff;
  font-size: 12px;
}
.brand-subtitle::before {
  content: "✦";
  color: var(--gold);
  font-size: 11px;
}

.card {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.064)),
    radial-gradient(circle at 100% 0%, rgba(255,79,163,.09), transparent 32%);
  border: 1px solid rgba(255,255,255,.16);
  box-shadow: 0 14px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.055);
}
.card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent);
  pointer-events: none;
}
.hero-card {
  background:
    radial-gradient(circle at 12% 18%, rgba(232,0,117,.33), transparent 40%),
    radial-gradient(circle at 88% 2%, rgba(217,167,46,.16), transparent 30%),
    linear-gradient(135deg, rgba(95,33,102,.55), rgba(255,255,255,.07));
  border-color: rgba(255,79,163,.22);
}
.soft-card {
  background:
    radial-gradient(circle at 16% 14%, rgba(217,167,46,.14), transparent 34%),
    linear-gradient(180deg, rgba(255,255,255,.11), rgba(255,255,255,.06));
}
.stat-card {
  min-height: 132px;
}
.stat-card .card-icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.10);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}

button.primary {
  background: linear-gradient(135deg, #e80075 0%, #ff4fa3 58%, #f59ac6 100%);
  box-shadow: 0 14px 28px rgba(232,0,117,.30), inset 0 1px 0 rgba(255,255,255,.18);
}
button.secondary {
  background: linear-gradient(180deg, rgba(255,255,255,.13), rgba(255,255,255,.075));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
}
button.icon-button {
  background: rgba(255,255,255,.11);
  box-shadow: 0 12px 24px rgba(0,0,0,.22);
}
button:active { transform: translateY(1px); }
button.text-button { color: #ff8fc8; }

input:focus, select:focus, textarea:focus {
  border-color: rgba(255,79,163,.62);
  box-shadow: 0 0 0 4px rgba(232,0,117,.12);
}

.meter, canvas, .summary-row, .day-dot, .photo-slot, .mini-card, .saved-status {
  box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
}
.ring {
  background:
    radial-gradient(circle at center, rgba(7,13,39,.92) 0 54%, transparent 55%),
    conic-gradient(var(--pink) var(--pct, 0deg), rgba(255,255,255,.12) 0);
  box-shadow: 0 10px 26px rgba(0,0,0,.20);
}
canvas {
  background:
    radial-gradient(circle at 12% 18%, rgba(232,0,117,.08), transparent 36%),
    rgba(2,6,23,.28);
}

.bottom-nav {
  background: linear-gradient(180deg, rgba(8,9,36,.82), rgba(4,7,25,.96));
  border-top: 1px solid rgba(255,255,255,.15);
  box-shadow: 0 -20px 50px rgba(0,0,0,.34);
}
.nav-btn {
  transition: background .18s ease, color .18s ease, transform .18s ease;
}
.nav-btn.active {
  background:
    radial-gradient(circle at 50% 0%, rgba(255,79,163,.28), transparent 54%),
    linear-gradient(180deg, rgba(232,0,117,.28), rgba(232,0,117,.16));
  border-color: rgba(255,79,163,.35);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}
.nav-btn.active span { filter: drop-shadow(0 6px 12px rgba(232,0,117,.35)); }

.photo-action.primary-photo {
  background: linear-gradient(135deg, #e80075, #ff4fa3 70%, #f7a7cf);
}
.recipe-card {
  border-color: rgba(255,255,255,.14);
}
.tag {
  background: rgba(232,0,117,.20);
  border-color: rgba(255,79,163,.30);
}
.onboarding-card {
  background:
    radial-gradient(circle at 10% 0%, rgba(232,0,117,.28), transparent 34%),
    radial-gradient(circle at 95% 12%, rgba(217,167,46,.14), transparent 32%),
    linear-gradient(160deg, rgba(20,13,56,.98), rgba(5,12,39,.99));
}

@media (max-width: 420px) {
  .app-brand-card { min-height: 104px; padding: 12px; gap: 11px; }
  .topbar-logo-wrap { width: 78px; height: 78px; border-radius: 25px; }
  .topbar-logo { width: 92px; height: 92px; }
  .brand-copy h1 { font-size: 28px; }
  .brand-subtitle { font-size: 11px; padding: 4px 8px; }
}

@media (max-width: 340px) {
  .topbar-logo-wrap { width: 68px; height: 68px; }
  .topbar-logo { width: 82px; height: 82px; }
  .brand-copy h1 { font-size: 25px; }
}

/* V1.0.5: professional SVG icon system + photo comparison */
.ui-icon {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  color: currentColor;
  line-height: 1;
  flex: none;
}
.ui-icon svg {
  width: 100%;
  height: 100%;
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}
.icon-button .ui-icon { width: 20px; height: 20px; }
.card-icon.ui-icon {
  width: 40px;
  height: 40px;
  color: #f8fafc;
}
.card-icon.ui-icon svg { width: 23px; height: 23px; }
.with-icon,
.photo-action {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.with-icon .ui-icon,
.photo-action .ui-icon { width: 18px; height: 18px; }
.camera-badge.ui-icon {
  color: #fff;
}
.camera-badge.ui-icon svg { width: 18px; height: 18px; }
.nav-btn .ui-icon {
  display: grid;
  margin: 0 auto 4px;
  width: 23px;
  height: 23px;
}
.nav-btn span.ui-icon { font-size: initial; }
.nav-btn.active .ui-icon { filter: drop-shadow(0 6px 12px rgba(232,0,117,.35)); }
.nav-btn.active span { filter: none; }
.brand-subtitle::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--gold);
  box-shadow: 0 0 0 4px rgba(217,167,46,.12);
}
.day-dot span { font-size: inherit; }
.day-icons {
  display: flex !important;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}
.day-icon {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: grid !important;
  place-items: center;
  color: rgba(184,187,208,.42);
  background: rgba(255,255,255,.055);
  border: 1px solid rgba(255,255,255,.08);
}
.day-icon svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.day-icon.on {
  color: #fff;
  background: linear-gradient(135deg, rgba(232,0,117,.70), rgba(217,167,46,.45));
  border-color: rgba(255,255,255,.18);
  box-shadow: 0 8px 18px rgba(232,0,117,.18);
}
.photo-compare-card { overflow: visible; }
.photo-compare-panel { display: grid; gap: 14px; }
.photo-compare-panel[hidden] { display: none !important; }
.compare-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.angle-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.angle-btn {
  border-radius: 999px;
  min-height: 40px;
  padding: 9px 14px;
  background: rgba(255,255,255,.09);
  border: 1px solid rgba(255,255,255,.13);
  color: var(--muted);
  font-weight: 900;
}
.angle-btn.active {
  color: white;
  background: linear-gradient(135deg, rgba(232,0,117,.72), rgba(255,79,163,.46));
  border-color: rgba(255,79,163,.45);
  box-shadow: 0 12px 26px rgba(232,0,117,.20);
}
.compare-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.compare-frame-card {
  border-radius: 24px;
  padding: 12px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.13);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
}
.compare-label {
  margin: 0 0 10px;
  color: #ffd4e9;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: .06em;
  text-transform: uppercase;
}
.compare-frame {
  aspect-ratio: 4 / 5;
  border-radius: 20px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 20% 0%, rgba(232,0,117,.14), transparent 42%),
    radial-gradient(circle at 100% 0%, rgba(217,167,46,.10), transparent 40%),
    rgba(2,6,23,.34);
  border: 1px solid rgba(255,255,255,.11);
}
.compare-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.compare-placeholder {
  min-height: 100%;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 10px;
  text-align: center;
  color: rgba(248,250,252,.72);
  padding: 20px;
}
.compare-placeholder .ui-icon {
  width: 42px;
  height: 42px;
  color: rgba(255,255,255,.55);
  border-radius: 18px;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.10);
}
.compare-placeholder .ui-icon svg { width: 22px; height: 22px; }
@media (max-width: 520px) {
  .compare-controls,
  .compare-grid { grid-template-columns: 1fr; }
}

/* V1.0.7: mini meal generator + spin wheel */
.meal-generator-card {
  border-color: rgba(217,167,46,.28);
  background:
    radial-gradient(circle at 15% 8%, rgba(217,167,46,.14), transparent 32%),
    radial-gradient(circle at 88% 18%, rgba(232,0,117,.18), transparent 36%),
    linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.065));
}
.meal-generator-grid {
  display: grid;
  grid-template-columns: 1.12fr .88fr;
  gap: 16px;
  align-items: center;
  margin-top: 12px;
}
.meal-wheel-wrap {
  min-height: 184px;
  display: grid;
  place-items: center;
}
.meal-wheel {
  --spin: 0deg;
  width: min(184px, 48vw);
  aspect-ratio: 1;
  border-radius: 50%;
  display: grid;
  place-items: center;
  position: relative;
  transform: rotate(var(--spin));
  transition: transform 1.85s cubic-bezier(.08,.86,.16,1.02);
  background:
    conic-gradient(from 10deg,
      #e80075 0 45deg,
      #d9a72e 45deg 90deg,
      #21d4e8 90deg 135deg,
      #a855f7 135deg 180deg,
      #ff4fa3 180deg 225deg,
      #f59e0b 225deg 270deg,
      #10b981 270deg 315deg,
      #e80075 315deg 360deg);
  border: 5px solid rgba(255,255,255,.13);
  box-shadow: 0 22px 44px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.20);
}
.meal-wheel::before {
  content: "";
  position: absolute;
  inset: 16px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 20%, rgba(255,255,255,.18), transparent 32%),
    linear-gradient(160deg, rgba(5,7,31,.95), rgba(17,12,53,.96));
  border: 1px solid rgba(255,255,255,.18);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}
.meal-wheel::after {
  content: "";
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 18px solid #fff;
  filter: drop-shadow(0 8px 12px rgba(0,0,0,.28));
}
.meal-wheel span {
  position: relative;
  z-index: 1;
  width: 86px;
  height: 86px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.18);
  color: #fff;
  font-weight: 950;
  font-size: 14px;
  letter-spacing: .12em;
  text-align: center;
  transform: rotate(calc(var(--spin) * -1));
  transition: transform 1.85s cubic-bezier(.08,.86,.16,1.02);
}
.meal-wheel.spinning span {
  color: #ffd4e9;
}
.meal-result {
  margin-top: 16px;
  padding: 16px;
  border-radius: 24px;
  background: rgba(2,6,23,.28);
  border: 1px solid rgba(255,255,255,.12);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
}
.meal-structure {
  display: inline-flex;
  width: fit-content;
  margin: 0 0 10px;
  padding: 7px 10px;
  border-radius: 999px;
  color: #fde68a;
  background: rgba(217,167,46,.12);
  border: 1px solid rgba(217,167,46,.30);
  font-size: 12px;
  font-weight: 900;
}
.meal-idea-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}
.meal-idea-list[hidden] { display: none !important; }
.meal-option-card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 22px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.12);
}
button:disabled {
  opacity: .72;
  cursor: wait;
}
@media (max-width: 520px) {
  .meal-generator-grid { grid-template-columns: 1fr; }
  .meal-wheel-wrap { min-height: 150px; }
  .meal-wheel { width: 158px; }
}

/* V1.1.0: 8-week walking program */
.walking-home-card,
.walking-program-card,
.walking-progress-card {
  border-color: rgba(217,167,46,.28);
  background:
    radial-gradient(circle at 12% 10%, rgba(217,167,46,.13), transparent 34%),
    radial-gradient(circle at 88% 0%, rgba(232,0,117,.12), transparent 36%),
    linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.062));
}
.walk-mini-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
}
.walk-mini-stats span,
.program-pill {
  border-radius: 999px;
  padding: 9px 10px;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.12);
  color: rgba(248,250,252,.82);
  font-size: 12px;
  font-weight: 850;
  text-align: center;
}
.program-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fde68a;
  background: rgba(217,167,46,.12);
  border-color: rgba(217,167,46,.28);
  white-space: nowrap;
}
.grid.three,
.walk-stats-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.mini-stat {
  padding: 13px;
  border-radius: 22px;
  background: rgba(2,6,23,.28);
  border: 1px solid rgba(255,255,255,.12);
}
.mini-stat span {
  display: block;
  color: rgba(248,250,252,.62);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-bottom: 6px;
}
.mini-stat strong {
  color: #fff;
  font-size: 20px;
}
.walking-start,
.walking-active {
  display: grid;
  gap: 14px;
}
.walking-start[hidden],
.walking-active[hidden] { display: none !important; }
.walk-advice {
  border-radius: 22px;
  padding: 13px 14px;
  background: rgba(232,0,117,.10);
  border: 1px solid rgba(232,0,117,.24);
  color: rgba(248,250,252,.86);
  font-size: 14px;
  font-weight: 750;
}
.danger-link {
  color: #fca5a5 !important;
  min-width: auto;
  padding: 0 0 0 8px;
}
#walkingChart {
  width: 100%;
  max-width: 100%;
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,.10);
  overflow: hidden;
  margin-top: 10px;
}
@media (max-width: 620px) {
  .walk-mini-stats,
  .grid.three,
  .walk-stats-grid { grid-template-columns: 1fr; }
  .program-pill { width: 100%; }
}


/* V1.1.1: Programs tab + install prompt */
.install-now-btn[hidden] { display: none !important; }
.install-now-btn { margin-top: 12px; }
#installStatusText, #onboardingInstallStatus { margin-top: 10px; }
@media (max-width: 380px) {
  .bottom-nav { gap: 3px; padding-left: 5px; padding-right: 5px; }
  .nav-btn { font-size: 9px; padding-left: 2px; padding-right: 2px; }
  .nav-btn .ui-icon { width: 21px; height: 21px; }
}
