import '@fontsource/jost/400.css'; import '@fontsource/jost/500.css'; import '@fontsource/jost/600.css';
import '@fontsource/cormorant-garamond/500.css'; import '@fontsource/cormorant-garamond/600.css'; import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/unifrakturmaguntia/400.css'; import '@fontsource/special-elite/400.css';
import './styles.css';
import { Stage } from './gfx/stage.js';
import { Sound } from './audio.js';
import * as sim from './engine/sim.js';
import { PARTIES, PARTY_ORDER, REGIONS, CHARS, TURN_LABELS } from './engine/data.js';
import { eventsForTurn, ENDINGS } from './engine/events.js';
import { ACTIONS, BILLS, NEWS, billAvailable, decreeThreshold } from './engine/agenda.js';
import { portraitSVG, SVG_DEFS } from './ui/portraits.js';

const SAVE_KEY = 'srg.save.v2', LAST_TURN = 18;
const ui = document.getElementById('ui');
const $ = (s, r = document) => r.querySelector(s);
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = sim.clamp;
const pn = (p) => PARTIES[p].name;
const f1 = (v) => v.toFixed(1);
const roman = ['I', 'II', 'III', 'IV', 'V'];
function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * t);
  return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
}

await Promise.all(['600 20px "Cormorant Garamond"', '500 20px "Cormorant Garamond"', 'italic 500 20px "Cormorant Garamond"', '500 20px Jost', '600 20px Jost', '20px UnifrakturMaguntia', '20px "Special Elite"'].map((f) => document.fonts.load(f).catch(() => {})));
document.body.insertAdjacentHTML('afterbegin', SVG_DEFS + '<div class="letterbox top"></div><div class="letterbox bottom"></div>');
const stage = new Stage(document.getElementById('stage'));
const sound = new Sound();
const G = { state: null, queue: [], mode: 'lead', selected: null, busy: false, prev: {}, hud: null };
window.__game = { G, stage, sim }; // handy for debugging

// ---------------------------------------------------------------- chrome --
const tip = el('<div class="tip"></div>'); document.body.append(tip);
document.addEventListener('mousemove', (e) => {
  const t = e.target.closest?.('[data-tip]');
  if (!t) { tip.classList.remove('on'); return; }
  tip.innerHTML = `${t.dataset.tipTitle ? `<b>${t.dataset.tipTitle}</b>` : ''}${t.dataset.tip}`;
  tip.classList.add('on');
  const r = tip.getBoundingClientRect();
  tip.style.left = clamp(e.clientX + 16, 8, innerWidth - r.width - 8) + 'px'; tip.style.top = clamp(e.clientY + 18, 8, innerHeight - r.height - 8) + 'px';
});
let lastHover = null;
document.addEventListener('mouseover', (e) => { const b = e.target.closest?.('button'); if (b && b !== lastHover && !b.disabled) sound.hover(); lastHover = b; });
document.addEventListener('click', (e) => { if (e.target.closest?.('button')) sound.click(); });
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (/^[1-4]$/.test(e.key)) { const c = document.querySelectorAll('.dossier.on .choice')[+e.key - 1]; if (c && !c.disabled) c.click(); }
  if (e.key === 'Enter' || e.key === ' ') { const b = $('.veil .btn') || $('.dossier.on .outcome .btn'); if (b) { e.preventDefault(); b.click(); } else $('.dossier.on .scroll')?.click(); }
  if (e.key === 'Escape' && G.selected) selectRegion(null);
});
const toasts = el('<div class="toasts"></div>'); document.body.append(toasts);
function toast(html, ms = 5200) {
  const t = el(`<div class="toast">${html}</div>`); toasts.append(t);
  while (toasts.children.length > 3) toasts.firstChild.remove();
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 500); }, ms);
}
const chipHTML = (chips) => chips.map((c, i) => {
  const arrow = c.delta > 0 ? '▲' : c.delta < 0 ? '▼' : '◆';
  return `<span class="chip ${c.soft ? 'soft' : c.good ? 'good' : 'bad'}" style="animation-delay:${i * 70}ms">${arrow} ${c.label}</span>`;
}).join('');

function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.state)); } catch { /* storage unavailable */ } }
function loadSave() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); return s && s.v === 2 && !s.ended ? s : null; } catch { return null; } }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ } }

function mapColors() {
  const st = G.state; const out = {};
  for (const r of REGIONS) {
    const sh = st.support[r.id];
    if (G.mode === 'lead') {
      const ord = PARTY_ORDER.slice().sort((a, b) => sh[b] - sh[a]);
      out[r.id] = mix('#3b332a', PARTIES[ord[0]].color, clamp(0.62 + (sh[ord[0]] - sh[ord[1]]) / 28, 0.62, 1));
    } else out[r.id] = mix('#28231d', PARTIES[G.mode].color, clamp(Math.pow(sh[G.mode] / 44, 0.8), 0.06, 1));
  }
  return out;
}
function updateMood() {
  const s = G.state.stats;
  stage.setMood({ sat: 0.72 + s.legitimacy * 0.004, tint: [1, 0.97 + s.stability * 0.0003, 0.93 + s.stability * 0.0007], vig: 0.56 + (100 - s.stability) * 0.002 });
  sound.setTension((62 - s.legitimacy) / 60 + (50 - s.stability) / 110);
}

// ----------------------------------------------------------------- title --
function showTitle() {
  ui.innerHTML = ''; document.body.className = ''; G.state = null; G.hud = null;
  const demo = sim.newState({ name: '', bg: 'statesman' }); G.state = demo; G.mode = 'lead';
  stage.setRegionColors(mapColors(), true); G.state = null;
  stage.interactive = false; stage.selectRegion(null); stage.setBeacon(null); stage.setOffset(0);
  if (stage.view !== 'map') stage.switchView('map');
  stage.titleCam(); stage.setMood({ blur: 7, sat: 0.9, vig: 0.72 }); stage.fadeIn(3);
  const saved = loadSave();
  const t = el(`<div class="title"><div class="title-inner">
    <div class="tricolor"><i></i><i></i><i></i></div>
    <h1><span>Schwarz</span><span>Rot</span><span>Gold</span></h1>
    <p class="sub">A political drama of the Weimar Republic, 1928–1933</p>
    <p class="blurb">Berlin, June 1928. The Republic is nine years old and has never looked safer. You have just been asked to govern it. History gives it four and a half more years.</p>
    <div class="menu">
      ${saved ? `<button data-a="continue">Continue · ${TURN_LABELS[saved.t].text}</button>` : ''}
      <button data-a="new">${saved ? 'New chancellorship' : 'Take office'}</button>
      <button data-a="sound" class="ghost">Sound: on</button>
    </div></div>
    <div class="foot">An original work of interactive historical fiction · best with sound</div></div>`);
  t.addEventListener('click', (e) => {
    const a = e.target.closest('button')?.dataset.a; if (!a) return;
    if (a === 'sound') { e.target.textContent = 'Sound: ' + (sound.toggle() ? 'on' : 'off'); if (sound.enabled) sound.init(); return; }
    if (sound.enabled) sound.init();
    if (a === 'new') showPrologue();
    if (a === 'continue') { G.state = saved; enterGame(true); }
  });
  ui.append(t);
}

function showPrologue() {
  ui.innerHTML = ''; let bg = 'statesman';
  const p = el(`<div class="prologue"><div class="prologue-inner">
    <div class="caps">Berlin · 28 June 1928</div>
    <h2>The President has sent for you.</h2>
    <p class="lead">The Social Democrats have won their greatest victory since the revolution. For the first time in eight years, one of their own will be Chancellor of the German Reich. Before you take the oath — who are you?</p>
    <div class="field"><span class="caps">Your name</span><input maxlength="26" value="Konrad Lenz" spellcheck="false" /></div>
    <div class="bgs">${Object.entries(sim.BACKGROUNDS).map(([k, b]) => `<button class="bg ${k === bg ? 'sel' : ''}" data-bg="${k}"><div class="caps">Background</div><h3>${b.title}</h3><div class="de">${b.sub}</div><p>${b.text}</p><ul>${b.perks.map((x) => `<li>${x}</li>`).join('')}</ul></button>`).join('')}</div>
    <div class="go"><button class="btn">Take the oath of office</button></div></div></div>`);
  p.addEventListener('click', (e) => {
    const b = e.target.closest('.bg'); if (b) { bg = b.dataset.bg; p.querySelectorAll('.bg').forEach((x) => x.classList.toggle('sel', x === b)); }
    if (e.target.closest('.go .btn')) { const name = $('input', p).value.trim() || 'Konrad Lenz'; G.state = sim.newState({ name, bg }); clearSave(); enterGame(false); }
  });
  ui.append(p);
}

// ------------------------------------------------------------------- HUD --
const GAUGES = [
  ['legitimacy', 'Republic', 'Faith in the Republic', 'How many Germans still believe that parliamentary democracy can solve their problems. It falls with unemployment, disorder and rule by decree — and when it is low, the extremes feed on every other party.'],
  ['stability', 'Order', 'Public order', 'Street fighting between SA, Red Front and police drags it down. The Reichsbanner and firm policing hold it up.'],
  ['unemp', 'Jobless', 'Unemployment', 'Share of the workforce without work. The strongest single engine of radicalisation: Protestant villages turn brown, industrial suburbs turn deep red.'],
  ['treasury', 'Treasury', 'Cash position of the Reich', 'In billions of Reichsmark. Unemployment drains it every quarter. Below −8 the Reichsbank will dictate its terms.'],
  ['hindenburg', 'President', 'The President\'s confidence', 'The Reich President can dismiss the Chancellor at will, and signs — or refuses — every emergency decree under Article 48.'],
  ['reichswehr', 'Army', 'Reichswehr loyalty', 'The army regards itself as the guardian of the state, not of the Republic. If it turns against you while the streets burn, it will act.'],
  ['coalition', 'Coalition', 'Coalition cohesion', 'How well the governing parties hold together. Every crisis wears it down. If it collapses, a partner walks out.'],
];
const FORCES = [
  ['unions', 'Unions', 'The ADGB trade unions. Your movement\'s backbone, and the only force that can call a general strike in defence of the Republic.', 1],
  ['industry', 'Industry', 'Heavy industry and the banks. Where their confidence goes, their donations and their newspapers follow.', 1],
  ['reichsbanner', 'Reichsbanner', 'The republican defence league Schwarz-Rot-Gold. Holds the street against the private armies.', 1],
  ['rightStreet', 'SA', 'Strength of Hitler\'s storm troopers on the street.', -1],
  ['leftStreet', 'Red Front', 'Strength of the Communist fighting leagues.', -1],
  ['inflation', 'Inflation fear', 'The memory of 1923. Credit-financed spending revives it, and the middle classes panic.', -1],
];
function gaugeView(key, s, st) {
  const v = s[key];
  if (key === 'unemp') return { txt: f1(v) + '%', fill: (v - 5) / 32, warn: v > 20 };
  if (key === 'treasury') return { txt: (v >= 0 ? '+' : '−') + f1(Math.abs(v)), fill: (v + 16) / 32, warn: v < -5 };
  if (key === 'coalition' && st.gov.length < 2) return { txt: '—', fill: 0, warn: false };
  if (key === 'hindenburg' && st.flags.republicanPresident) return { txt: 'Braun', fill: 0.9, warn: false };
  return { txt: Math.round(v), fill: v / 100, warn: v < 32 };
}

function buildHud() {
  const hud = el(`<div class="hud">
    <div class="topbar"><div class="date"><span class="flag"></span><div><b></b><small class="caps"></small></div></div>
      <div class="gauges">${GAUGES.map(([k, lab, title, desc]) => `<div class="gauge" data-k="${k}" data-tip-title="${title}" data-tip="${desc}"><div class="row"><span class="caps">${lab}</span><span class="v"></span></div><div class="bar"><i></i></div></div>`).join('')}</div>
      <div class="tools"><div class="pips" data-tip-title="Political capital" data-tip="What you can get done in one quarter. Spend it on actions, on tabling bills, and on lobbying before a vote."></div>
        <button class="icon-btn" data-a="sound" data-tip="Toggle sound">♪</button><button class="icon-btn" data-a="quit" data-tip="Save and return to the title">≡</button></div></div>
    <div class="left panel"></div><div class="right panel agenda"></div>
    <div class="modes panel"><span class="caps">Map</span><button class="mode" data-m="lead">Leading party</button>${PARTY_ORDER.map((p) => `<button class="mode" data-m="${p}"><i style="background:${PARTIES[p].color}"></i>${pn(p)}</button>`).join('')}</div></div>`);
  hud.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.m) { G.mode = b.dataset.m; refresh(); }
    if (b.dataset.a === 'sound') { sound.toggle(); if (sound.enabled) sound.init(); }
    if (b.dataset.a === 'quit') { save(); showTitle(); }
    if (b.dataset.a === 'end') endTurn();
    if (b.dataset.a === 'chamber') openChamber();
    if (b.dataset.a === 'close-region') selectRegion(null);
    if (b.dataset.act) doAction(b.dataset.act);
  });
  ui.append(hud); G.hud = hud; G.prev = {};
  void hud.offsetWidth; setTimeout(() => hud.classList.add('on'), 30);
}

function refresh() {
  const st = G.state, s = st.stats, hud = G.hud; if (!hud) return;
  const lab = TURN_LABELS[Math.min(st.t, LAST_TURN)];
  $('.date b', hud).textContent = lab.text;
  $('.date small', hud).textContent = `Cabinet ${st.player.name.split(' ').pop()} · quarter ${Math.min(st.t, LAST_TURN) + 1} of ${LAST_TURN + 1}`;
  for (const [k] of GAUGES) {
    const g = $(`.gauge[data-k="${k}"]`, hud), v = gaugeView(k, s, st);
    $('.v', g).textContent = v.txt; $('.bar i', g).style.width = clamp(v.fill, 0, 1) * 100 + '%'; g.classList.toggle('warn', v.warn);
    const prev = G.prev[k]; const good = sim.STAT_META[k].up;
    if (prev != null && Math.abs(s[k] - prev) > 0.05) { g.classList.remove('flash-up', 'flash-down'); void g.offsetWidth; g.classList.add(s[k] > prev === good ? 'flash-up' : 'flash-down'); }
    G.prev[k] = s[k];
  }
  $('.pips', hud).innerHTML = Array.from({ length: Math.max(sim.capitalPerTurn(st), st.capital) }, (_, i) => `<i class="${i < st.capital ? 'on' : ''}"></i>`).join('');
  hud.querySelectorAll('.mode').forEach((m) => m.classList.toggle('on', m.dataset.m === G.mode));

  // Left: Reichstag, mood, forces
  const nat = sim.national(st.support), prevNat = st.history[st.t - 1]?.nat || nat;
  const maj = sim.hasMajority(st), gs = sim.govSeats(st);
  const due = st.electionPending ? 'at the end of this quarter' : st.electionDue <= LAST_TURN ? TURN_LABELS[st.electionDue].text : 'not before 1934';
  $('.left', hud).innerHTML = `
    <div class="sect"><span class="caps">Reichstag</span><span class="tag ${maj ? 'ok' : 'no'}">${maj ? 'Majority' : 'Minority'}</span></div>
    <div class="seatbar" data-tip-title="Seats in the Reichstag" data-tip="${PARTY_ORDER.map((p) => `${pn(p)} ${st.seats[p]}`).join(' · ')}. The white line marks the majority.">${PARTY_ORDER.map((p) => `<i class="${st.gov.includes(p) ? '' : 'out'}" style="flex-grow:${st.seats[p]};background:${PARTIES[p].color}"></i>`).join('')}</div>
    <div class="govline">Government: <b>${st.gov.map(pn).join(' · ')}</b><br>${gs} of ${st.totalSeats} seats · next election ${due}</div>
    <hr class="rule"><div class="sect"><span class="caps">Mood of the country</span><span class="caps" style="color:var(--dim)">±qtr</span></div>
    ${PARTY_ORDER.map((p) => { const d = nat[p] - prevNat[p]; return `<div class="poll" data-tip-title="${PARTIES[p].full}" data-tip="${PARTIES[p].blurb}"><span class="nm">${pn(p)}</span><span class="track"><i style="width:${clamp(nat[p] / 45, 0, 1) * 100}%;background:${PARTIES[p].color}"></i></span><span class="pc">${f1(nat[p])}</span><span class="d ${d > 0.15 ? 'up' : d < -0.15 ? 'dn' : ''}">${Math.abs(d) < 0.05 ? '' : (d > 0 ? '+' : '−') + f1(Math.abs(d))}</span></div>`; }).join('')}
    <hr class="rule"><div class="sect"><span class="caps">Forces</span></div>
    <div class="forces">${FORCES.map(([k, l, d, dir]) => `<div class="force ${dir > 0 ? (s[k] < 35 ? 'bad' : s[k] > 60 ? 'good' : '') : s[k] > 50 ? 'bad' : ''}" data-tip-title="${sim.STAT_META[k].label}" data-tip="${d}"><div class="row"><span>${l}</span><b>${Math.round(s[k])}</b></div><div class="bar"><i style="width:${clamp(s[k], 0, 100)}%"></i></div></div>`).join('')}</div>`;

  renderRight();
  stage.setRegionColors(mapColors());
}

function renderRight() {
  const st = G.state, hud = G.hud, right = $('.right', hud);
  const idle = !G.busy && !G.queue.length && !document.body.classList.contains('cine');
  if (G.selected) {
    const r = REGIONS.find((x) => x.id === G.selected), sh = st.support[r.id];
    const tour = ACTIONS.find((a) => a.id === 'tour');
    right.className = 'right panel region';
    right.innerHTML = `<button class="x" data-a="close-region">×</button>
      <div class="caps">${r.seat}</div><h3>${r.name}</h3><div class="en">${r.en}</div><p>${r.note}</p>
      <div class="demo"><div><b>${f1(r.pop)}%</b>of voters</div><div><b>${Math.round(r.urban * 100)}</b>urban</div><div><b>${Math.round(r.cath * 100)}</b>catholic</div><div><b>${Math.round(r.agr * 100)}</b>agrarian</div></div>
      ${PARTY_ORDER.slice().sort((a, b) => sh[b] - sh[a]).map((p) => `<div class="poll"><span class="nm">${pn(p)}</span><span class="track"><i style="width:${clamp(sh[p] / 50, 0, 1) * 100}%;background:${PARTIES[p].color}"></i></span><span class="pc">${f1(sh[p])}</span><span></span></div>`).join('')}
      <hr class="rule"><button class="act" data-act="tour" ${st.capital < 1 || !idle ? 'disabled' : ''} data-tip="${tour.desc}"><b>${tour.name} in ${r.name}</b><small>${tour.de}</small><span class="cost"><i></i></span></button>`;
    return;
  }
  right.className = 'right panel agenda';
  right.innerHTML = `<div class="sect"><span class="caps">Agenda for the quarter</span><span class="caps" style="color:var(--brass)">${st.capital} capital</span></div>
    ${ACTIONS.filter((a) => !a.region && (!a.avail || a.avail(st))).map((a) => { const cd = st.cooldown['act_' + a.id] > 0; return `<button class="act" data-act="${a.id}" ${st.capital < a.cost || cd || !idle ? 'disabled' : ''} data-tip-title="${a.name}" data-tip="${a.desc}${cd ? ' <em>Not again so soon.</em>' : ''}"><b>${a.name}</b><small>${a.de}</small><span class="cost">${'<i></i>'.repeat(a.cost)}</span></button>`; }).join('')}
    <div class="govline" style="margin-top:8px"><em>Select a region on the map to campaign there.</em></div>
    <div class="endrow"><button class="btn quiet" data-a="chamber" ${idle ? '' : 'disabled'}>Reichstag</button><button class="btn" data-a="end" ${idle ? '' : 'disabled'}>End quarter</button></div>`;
}

function selectRegion(id) {
  if (!G.hud || document.body.classList.contains('cine') || document.body.classList.contains('chamber')) return;
  G.selected = id; stage.selectRegion(id); if (id) sound.click(); renderRight();
}
stage.onSelect = (id) => selectRegion(id);

function doAction(id) {
  const st = G.state, a = ACTIONS.find((x) => x.id === id); if (!a || st.capital < a.cost || G.busy) return;
  const region = a.region ? REGIONS.find((r) => r.id === G.selected) : null; if (a.region && !region) return;
  st.capital -= a.cost; if (a.cooldown) st.cooldown['act_' + a.id] = a.cooldown;
  const res = a.run(st, region); const chips = sim.applyEffects(st, res.eff);
  sound.stamp(); toast(`${res.text}<div class="chips" style="margin:8px 0 0;justify-content:center">${chipHTML(chips)}</div>`);
  save(); refresh(); updateMood();
}

// ------------------------------------------------------------- game flow --
function enterGame(resume) {
  ui.innerHTML = ''; document.body.className = '';
  buildHud(); stage.stopDrift(); stage.setInsets(300, 364); stage.overview(); stage.interactive = true; stage.setRegionColors(mapColors(), true);
  G.selected = null; G.busy = false; updateMood();
  startTurn(resume ? 'resume' : 'first');
}

async function dateCard() {
  const st = G.state, lab = TURN_LABELS[st.t];
  const c = el(`<div class="datecard"><div><b>${lab.text}</b><span>Quarter ${st.t + 1} of ${LAST_TURN + 1}</span></div></div>`); document.body.append(c); sound.swell();
  await sleep(1900); c.classList.add('out'); await sleep(750); c.remove();
}

async function startTurn(how) {
  const st = G.state;
  if (st.t > LAST_TURN) { st.ended = sim.finalEnding(st); return showEnding(); }
  if (how !== 'resume') st.capital = sim.capitalPerTurn(st);
  G.queue = eventsForTurn(st); G.busy = true; save(); refresh(); updateMood();
  if (how !== 'resume') { await dateCard(); await showNewspaper(); }
  G.busy = false; nextEvent();
}

function showNewspaper() {
  return new Promise((done) => {
    const st = G.state, n = NEWS[Math.min(st.t, NEWS.length - 1)](st), nat = sim.national(st.support), lab = TURN_LABELS[st.t];
    const top = PARTY_ORDER.slice().sort((a, b) => nat[b] - nat[a]).slice(0, 5);
    const v = el(`<div class="veil"><div class="paper">
      <div class="mast"><span>No. ${1830 + st.t * 91}<br>${lab.season} edition</span><h1>Berliner Rundschau</h1><span style="text-align:right">Berlin, ${lab.year}<br>20 Pfennig</span></div>
      <div class="dbl"></div><h2>${n.head}</h2><p class="deck">${n.deck}</p>
      <div class="cols">${n.items.map((x, i) => `<div><b>${['Reich', 'Abroad & culture', 'In brief'][i] || 'News'}</b>${x}</div>`).join('')}
        <div class="baro"><b>Barometer</b>${top.map((p) => `<div class="r"><span>${pn(p)}</span><i style="width:${clamp(nat[p] / 42, 0.02, 1) * 100}%"></i><span>${f1(nat[p])}</span></div>`).join('')}<div class="r" style="margin-top:5px;border-top:1px solid rgba(0,0,0,.4);padding-top:3px"><span>Jobless</span><i style="width:${clamp(st.stats.unemp / 42, 0, 1) * 100}%"></i><span>${f1(st.stats.unemp)}</span></div></div></div>
      <div class="cont"><span>“${['Der Staat sind wir.', 'Einigkeit und Recht und Freiheit.', 'Nie wieder Krieg.', 'Die Staatsgewalt geht vom Volke aus.'][st.t % 4]}”</span><button class="btn">To the Chancellery</button></div></div></div>`);
    $('.btn', v).onclick = () => { sound.paper(); v.style.animation = 'fadeOut .4s both'; setTimeout(() => { v.remove(); done(); }, 380); };
    ui.append(v); sound.paper();
  });
}

function exitCine() {
  document.body.classList.remove('cine'); stage.setBeacon(null); stage.overview(); stage.interactive = true; refresh();
}

function nextEvent() {
  const st = G.state;
  if (st.ended) return showEnding();
  const e = G.queue.shift();
  if (e) openEvent(e); else { exitCine(); if (st.t === 0 && !st.flags.tutorial) { st.flags.tutorial = true; toast('The quarter is yours. Spend political capital on the agenda at right, table bills in the Reichstag, or click a region to campaign — then end the quarter.', 9000); } }
}

function truncateHTML(html, n) {
  let out = '', count = 0, i = 0;
  while (i < html.length && count < n) { if (html[i] === '<') { const j = html.indexOf('>', i); out += html.slice(i, j + 1); i = j + 1; } else { out += html[i++]; count++; } }
  return { html: out + (i < html.length ? '' : ''), done: i >= html.length };
}

function openEvent(e) {
  const st = G.state; G.busy = true;
  document.body.classList.add('cine'); stage.interactive = false; G.selected = null; stage.selectRegion(null);
  const w = Math.min(600, innerWidth * 0.52);
  stage.flyTo(e.loc, 88, { tilt: 0.9, az: -0.2 + (e.loc[0] - 12) * 0.012 }); stage.setBeacon(e.loc); stage.setOffset(w * 0.46);
  const who = CHARS[e.speakerFn ? e.speakerFn(st) : e.speaker], whoId = e.speakerFn ? e.speakerFn(st) : e.speaker;
  const paras = typeof e.text === 'function' ? e.text(st) : e.text;
  const d = el(`<div class="dossier"><div class="kicker">${e.place} · ${TURN_LABELS[st.t].text}</div><h2>${e.title}</h2>
    <div class="who">${portraitSVG(whoId, 92)}<div><b>${who.name}</b><small class="caps">${who.role}</small></div></div>
    <div class="scroll"><div class="prose">${paras.filter(Boolean).map(() => '<p class="dim"></p>').join('')}</div><div class="after"></div></div></div>`);
  ui.append(d); void d.offsetWidth; setTimeout(() => d.classList.add('on'), 30); sound.chime();
  const ps = [...d.querySelectorAll('.prose p')], texts = paras.filter(Boolean), scroll = $('.scroll', d);
  let skip = false, finished = false;
  scroll.addEventListener('click', () => { if (!finished) skip = true; });

  (async () => {
    await sleep(650);
    for (let k = 0; k < ps.length; k++) {
      const p = ps[k]; p.classList.remove('dim'); p.classList.add('typing');
      let n = 0; const total = texts[k].replace(/<[^>]+>/g, '').length;
      while (n < total && !skip) { n += 3; p.innerHTML = truncateHTML(texts[k], n).html; sound.type(); scroll.scrollTop = scroll.scrollHeight; await sleep(22); }
      p.innerHTML = texts[k]; p.classList.remove('typing');
      if (!skip) await sleep(260);
    }
    finished = true;
    const box = el(`<div class="choices">${e.choices.map((c, i) => {
      const ok = !c.req || c.req(st); const hint = !ok ? c.reqText : typeof c.hint === 'function' ? c.hint(st) : c.hint;
      return `<button class="choice" data-i="${i}" ${ok ? '' : 'disabled'}><span class="n">${roman[i]}</span><span class="t">${c.label}${hint ? `<span class="h">${hint}</span>` : ''}</span></button>`;
    }).join('')}</div>`);
    $('.after', d).append(box); scroll.scrollTop = scroll.scrollHeight;
    box.addEventListener('click', (ev) => {
      const b = ev.target.closest('.choice'); if (!b || b.disabled) return;
      const c = e.choices[+b.dataset.i];
      const chips = sim.applyEffects(st, c.eff);
      let text = c.fn ? c.fn(st) : null; if (text == null || text === '') text = c.fn && text === '' ? '' : c.result || '';
      st.done[e.id] = true; if (e.cond) st.cooldown['ev_' + e.id] = e.cooldown || 99;
      st.log.push({ t: st.t, id: e.id, choice: +b.dataset.i });
      save(); refresh(); updateMood();
      const bad = chips.filter((x) => !x.soft && !x.good).length > chips.filter((x) => !x.soft && x.good).length;
      if (st.ended) sound.swell(); else bad ? sound.bad() : sound.good();
      const fin = () => { d.classList.remove('on'); setTimeout(() => d.remove(), 900); G.busy = false; setTimeout(nextEvent, st.ended ? 600 : 420); };
      if (!text && !chips.length) return fin();
      box.remove(); ps.forEach((p) => (p.style.opacity = 0.45));
      const out = el(`<div class="outcome"><p class="picked">${c.label}</p><div class="prose">${text ? `<p>${text}</p>` : ''}</div><div class="chips">${chipHTML(chips)}</div><button class="btn">${st.ended ? 'So it ends' : 'Continue'}</button></div>`);
      $('.after', d).append(out); $('.btn', out).onclick = fin; setTimeout(() => (scroll.scrollTop = scroll.scrollHeight), 60);
    });
  })();
}

async function endTurn() {
  const st = G.state; if (G.busy || G.queue.length) return;
  G.busy = true; selectRegion(null); G.selected = null; stage.selectRegion(null); renderRight();
  if (st.electionPending || st.t + 1 >= st.electionDue) await electionNight();
  sim.tick(st);
  G.busy = false; startTurn();
}

// -------------------------------------------------------------- election --
async function electionNight() {
  const st = G.state; const before = sim.national(st.support);
  const res = sim.runElection(st);
  document.body.classList.add('cine'); stage.interactive = false; stage.overview(); stage.setOffset(Math.min(470, innerWidth * 0.46) * 0.5);
  G.mode = 'lead'; const finalCols = mapColors();
  stage.setRegionColors(Object.fromEntries(REGIONS.map((r) => [r.id, '#2a251f'])));
  const row = (p) => `<div class="erow" data-p="${p}"><i style="background:${PARTIES[p].color}"></i><span>${pn(p)}</span><span class="track"><u style="width:0;background:${PARTIES[p].color}"></u></span><span class="pc">–</span><span class="s"></span><span class="ds"></span></div>`;
  const panel = el(`<div class="election panel"><div class="caps">${TURN_LABELS[st.t].text} · the nation votes</div><h2>Election Night</h2><div class="tick">Polls have closed.</div>${PARTY_ORDER.map(row).join('')}<div class="after" style="margin-top:16px"></div></div>`);
  ui.append(panel); sound.drum(); await sleep(1500);
  const order = REGIONS.slice().sort((a, b) => a.pop - b.pop); let pop = 0; const acc = {}; PARTY_ORDER.forEach((p) => (acc[p] = 0));
  for (const r of order) {
    pop += r.pop; PARTY_ORDER.forEach((p) => (acc[p] += st.support[r.id][p] * r.pop));
    stage.setRegionColors({ [r.id]: finalCols[r.id] }); stage.selectRegion(r.id); sound.type();
    $('.tick', panel).textContent = `${r.seat} reporting …  ${Math.round((pop / 101) * 100)}% counted`;
    PARTY_ORDER.forEach((p) => { const v = acc[p] / pop, e = $(`.erow[data-p="${p}"]`, panel); $('u', e).style.width = clamp(v / 42, 0, 1) * 100 + '%'; $('.pc', e).textContent = f1(v); });
    await sleep(420);
  }
  stage.selectRegion(null); await sleep(500);
  PARTY_ORDER.forEach((p) => { const e = $(`.erow[data-p="${p}"]`, panel), d = res.seats[p] - res.prev[p]; $('.pc', e).textContent = f1(res.nat[p]); $('.s', e).textContent = res.seats[p]; const ds = $('.ds', e); ds.textContent = d ? (d > 0 ? '+' : '−') + Math.abs(d) : '±0'; ds.className = 'ds ' + (d > 0 ? 'up' : d < 0 ? 'dn' : ''); });
  const nsUp = res.nat.NSDAP - before.NSDAP;
  $('.tick', panel).textContent = `Final result · ${res.total} seats · majority ${Math.floor(res.total / 2) + 1}`;
  res.seats.NSDAP > res.prev.NSDAP * 2 && res.seats.NSDAP > 50 ? sound.bad() : sound.chime();
  await new Promise((go) => { const b = el('<button class="btn">Form a government</button>'); b.onclick = go; $('.after', panel).append(b); });

  // Government formation in the chamber
  await stage.switchView('chamber'); stage.setSeats(st.seats, st.totalSeats); document.body.classList.add('chamber');
  const opts = [
    { name: 'Great Coalition', gov: ['SPD', 'DDP', 'Z', 'DVP'], ok: st.rel.DVP > -28 && st.rel.Z > -35, why: 'The People\'s Party will not sit at your table.', coh: 46 },
    { name: 'Weimar Coalition', gov: ['SPD', 'DDP', 'Z'], ok: st.rel.Z > -35, why: 'Zentrum refuses.', coh: 58 },
    { name: 'Social Democratic minority cabinet', gov: ['SPD', 'DDP'], ok: true, coh: 72 },
  ];
  const half = st.totalSeats / 2;
  panel.innerHTML = `<div class="caps">The new Reichstag · ${st.totalSeats} seats</div><h2>Form a Government</h2><div class="tick">${nsUp > 5 ? 'The brown benches have filled.' : 'The arithmetic, once more.'}</div>
    ${opts.map((o, i) => { const n = o.gov.reduce((a, p) => a + st.seats[p], 0); return `<button class="coal" data-i="${i}" ${o.ok ? '' : 'disabled'}><b>${o.name}</b><span class="tag ${n > half ? 'ok' : 'no'}">${n} seats</span><small>${o.gov.map(pn).join(' · ')}${o.ok ? (n > half ? '' : ' — no majority: you will depend on toleration, or on the President.') : ' — ' + o.why}</small></button>`; }).join('')}`;
  await new Promise((go) => panel.addEventListener('click', (e) => {
    const b = e.target.closest('.coal'); if (!b || b.disabled) return; const o = opts[+b.dataset.i];
    st.gov = [...o.gov]; st.stats.coalition = o.coh; o.gov.forEach((p) => { if (p !== 'SPD') st.rel[p] = Math.max(st.rel[p], 12); }); go();
  }));
  panel.remove(); document.body.classList.remove('chamber'); await stage.switchView('map'); stage.overview(); document.body.classList.remove('cine'); refresh();
}

// ------------------------------------------------------------- Reichstag --
async function openChamber() {
  const st = G.state; if (G.busy) return; G.busy = true; selectRegion(null);
  document.body.classList.add('chamber'); stage.interactive = false;
  await stage.switchView('chamber'); stage.setSeats(st.seats, st.totalSeats); stage.setOffset(Math.min(430, innerWidth * 0.44) * 0.5);
  const root = el(`<div class="chamber-ui"><div class="chamber-head"><div class="caps">Platz der Republik</div><h2>The Reichstag</h2><p></p></div>
    <div class="legend panel"></div><div class="bills panel"></div></div>`);
  ui.append(root);
  const head = () => { $('.chamber-head p', root).textContent = `${st.totalSeats} deputies · majority ${Math.floor(st.totalSeats / 2) + 1} · your government holds ${sim.govSeats(st)}`;
    $('.legend', root).innerHTML = PARTY_ORDER.map((p) => `<div class="${st.gov.includes(p) ? 'gov' : ''}"><i style="background:${PARTIES[p].color}"></i>${pn(p)}<b>${st.seats[p]}</b></div>`).join(''); };
  const close = async () => { root.remove(); document.body.classList.remove('chamber'); await stage.switchView('map'); stage.overview(); stage.interactive = true; G.busy = false; refresh(); };
  const panel = $('.bills', root);

  const list = () => {
    head(); stage.clearVote();
    const vis = BILLS.filter((b) => st.t >= b.from);
    panel.innerHTML = `<div class="sect"><span class="caps">Order paper</span><span class="caps" style="color:var(--brass)">${st.capital} capital</span></div>
      <div class="list">${vis.length ? vis.map((b) => { const done = st.bills[b.id], cd = st.cooldown['bill_' + b.id] > 0, locked = b.req && !b.req(st);
        return `<button class="bill ${done ? 'done' : ''}" data-id="${b.id}" ${done || cd || locked ? 'disabled' : ''}><span class="st tag ${done ? 'ok' : cd ? 'no' : ''}" style="${done || cd ? '' : 'border-color:var(--line);color:var(--muted)'}">${done ? (done === 'decree' ? 'Decreed' : 'Law') : cd ? 'Defeated' : locked ? 'Locked' : b.twoThirds ? '⅔ needed' : 'Draft'}</span><b>${b.name}</b><small>${b.de}${locked ? ' — ' + b.reqText : ''}</small></button>`; }).join('')
        : '<p class="govline"><em>The government has no bills ready. Drafts will arrive as events demand them.</em></p>'}</div>
      <div class="foot"><button class="btn quiet" data-a="back">Return to the map</button></div>`;
  };

  const view = (b, sway = {}) => {
    const pred = sim.predictVote(st, b, sway);
    const thr = decreeThreshold(b), canDecree = !b.twoThirds && (st.flags.republicanPresident || st.stats.hindenburg >= thr);
    panel.innerHTML = `<div class="billview"><div class="caps">Bill before the house</div><h3>${b.name}</h3><div class="de">${b.de}</div><p>${b.desc}</p><div class="line">${b.line}</div></div>
      <div class="list">${PARTY_ORDER.map((p) => { const v = pred.by[p]; const fund = (p === 'KPD' || p === 'NSDAP') && v.score < -40;
        return `<div class="whip"><i style="background:${PARTIES[p].color}"></i><span>${pn(p)}</span><span class="pos ${v.pos}">${v.pos === 'yes' ? 'Aye' : v.pos === 'no' ? 'No' : 'Abstain'}${v.firm ? '' : ' · wavering'}</span><span class="n">${st.seats[p]}</span>
          <button data-lobby="${p}" ${sway[p] || fund || (v.pos === 'yes' && v.firm) || st.capital < 1 ? 'disabled' : ''} data-tip="Spend 1 capital on concessions and persuasion to move this party.">Lobby</button></div>`; }).join('')}</div>
      <div class="tally"><div class="y"><b>${pred.yes}</b>Aye</div><div class="n"><b>${pred.no}</b>No</div><div class="a"><b>${pred.abstain}</b>Abstain</div></div>
      <div class="stampbox"><span class="caps">${b.twoThirds ? 'Needs two-thirds of votes cast' : 'Whips\' forecast'} · ${pred.passes ? 'should pass' : 'would fail'}</span></div>
      <div class="foot"><button class="btn quiet small" data-a="list">Back</button>
        ${b.twoThirds ? '' : `<button class="btn quiet small" data-a="decree" ${canDecree ? '' : 'disabled'} data-tip="${b.hind < 0 ? 'The President will never sign this.' : `Enact by presidential emergency decree. Needs Hindenburg\'s confidence ${thr}; costs his patience and the Republic\'s legitimacy.`}">Article 48</button>`}
        <button class="btn small" data-a="vote" ${st.capital < b.cost ? 'disabled' : ''}>Call the vote · ${b.cost}</button></div>`;
    panel.onclick = async (e) => {
      const t = e.target.closest('button'); if (!t || t.disabled) return;
      if (t.dataset.lobby) { st.capital--; sway[t.dataset.lobby] = 24; st.rel[t.dataset.lobby] = clamp(st.rel[t.dataset.lobby] + 3, -100, 100); view(b, sway); refresh(); return; }
      if (t.dataset.a === 'list') { panel.onclick = main; list(); return; }
      if (t.dataset.a === 'vote') {
        st.capital -= b.cost; const r = sim.predictVote(st, b, sway, true);
        panel.querySelectorAll('button').forEach((x) => (x.disabled = true));
        stage.showVote(r.by); sound.gavel();
        const ty = $('.tally .y b', panel), tn = $('.tally .n b', panel), ta = $('.tally .a b', panel); const t0 = performance.now();
        await new Promise((go) => { const step = () => { const k = clamp((performance.now() - t0) / 3000, 0, 1); ty.textContent = Math.round(r.yes * k); tn.textContent = Math.round(r.no * k); ta.textContent = Math.round(r.abstain * k); if (k < 1) { if (Math.random() > 0.6) sound.type(); setTimeout(step, 40); } else go(); }; step(); });
        await sleep(350);
        let chips = [];
        if (r.passes) { chips = sim.applyEffects(st, b.eff); st.bills[b.id] = 'passed'; sound.stamp(); setTimeout(() => sound.good(), 200); }
        else { st.cooldown['bill_' + b.id] = 3; chips = sim.applyEffects(st, { coalition: -4, legitimacy: -1 }); sound.stamp(); setTimeout(() => sound.bad(), 200); }
        $('.stampbox', panel).innerHTML = `<span class="stamp ${r.passes ? 'pass' : 'fail'}">${r.passes ? 'Angenommen' : 'Abgelehnt'}</span>`;
        $('.foot', panel).innerHTML = `<div class="chips" style="margin:0 0 6px;width:100%">${chipHTML(chips)}</div><button class="btn small" data-a="list">Continue</button>${!r.passes && canDecree ? '<button class="btn quiet small" data-a="decree">Enact by Article 48</button>' : ''}`;
        save(); refresh(); updateMood(); head(); return;
      }
      if (t.dataset.a === 'decree') {
        const chips = [...sim.applyEffects(st, b.eff), ...sim.applyEffects(st, st.flags.republicanPresident ? { legitimacy: -3, decree: 1 } : { hindenburg: -6, legitimacy: -3, decree: 1 })];
        st.bills[b.id] = 'decree'; delete st.cooldown['bill_' + b.id]; sound.stamp();
        $('.stampbox', panel).innerHTML = '<span class="stamp fail" style="color:var(--brass-hi)">Notverordnung</span>';
        $('.foot', panel).innerHTML = `<div class="chips" style="margin:0 0 6px;width:100%">${chipHTML(chips)}</div><button class="btn small" data-a="list">Continue</button>`;
        save(); refresh(); updateMood(); return;
      }
    };
  };
  const main = (e) => {
    const t = e.target.closest('button'); if (!t || t.disabled) return;
    if (t.dataset.a === 'back') return close();
    if (t.dataset.id) view(BILLS.find((b) => b.id === t.dataset.id));
  };
  panel.onclick = main; list();
}

// ---------------------------------------------------------------- ending --
function showEnding() {
  const st = G.state, e = ENDINGS[st.ended] || ENDINGS.abyss, nat = sim.national(st.support);
  clearSave(); G.busy = true; G.hud?.classList.remove('on');
  document.body.classList.add('cine'); stage.interactive = false; stage.setBeacon(null); stage.setOffset(0); stage.titleCam();
  stage.setMood(e.tone === 'bad' ? { sat: 0.12, blur: 8, vig: 0.85, tint: [1, 0.95, 0.9] } : e.tone === 'good' ? { sat: 1.1, blur: 6, vig: 0.6, tint: [1.04, 1, 0.92] } : { sat: 0.55, blur: 7, vig: 0.75 });
  e.tone === 'good' ? sound.good() : sound.bad(); sound.swell(); sound.setTension(e.tone === 'bad' ? 1 : 0);
  const paras = e.text(st);
  const v = el(`<div class="ending ${e.tone}"><div class="ending-inner"><div class="tricolor"><i></i><i></i><i></i></div>
    <div class="caps">${TURN_LABELS[Math.min(st.t, LAST_TURN)].text} · the chancellorship of ${st.player.name}</div><h1>${e.title}</h1><div class="sub">${e.sub}</div>
    <div class="body">${paras.map((p, i) => `<p style="animation-delay:${1.6 + i * 0.9}s">${p}</p>`).join('')}</div>
    <div class="stats"><div><b>${st.t + 1}</b><span class="caps">quarters in office</span></div><div><b>${f1(st.stats.unemp)}%</b><span class="caps">unemployed</span></div><div><b>${f1(nat.NSDAP)}%</b><span class="caps">NSDAP support</span></div><div><b>${Math.round(st.stats.legitimacy)}</b><span class="caps">faith in the Republic</span></div></div>
    <button class="btn">Return to the title</button></div></div>`);
  $('.btn', v).onclick = () => { stage.setMood(); sound.setTension(0); showTitle(); };
  setTimeout(() => ui.append(v), 700);
}

showTitle();
