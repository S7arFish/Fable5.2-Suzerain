// Pure simulation: no DOM. State creation, effects, quarterly tick, elections, votes.
import { PARTY_ORDER, REGIONS, NATIONAL_1928, SEATS_1928 } from './data.js';

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const STAT_META = {
  stability: { label: 'Public order', up: true, min: 0, max: 100 },
  legitimacy: { label: 'Faith in the Republic', up: true, min: 0, max: 100 },
  hindenburg: { label: 'Hindenburg\'s confidence', up: true, min: 0, max: 100 },
  reichswehr: { label: 'Reichswehr loyalty', up: true, min: 0, max: 100 },
  coalition: { label: 'Coalition cohesion', up: true, min: 0, max: 100 },
  unions: { label: 'Trade unions', up: true, min: 0, max: 100 },
  industry: { label: 'Industry', up: true, min: 0, max: 100 },
  treasury: { label: 'Treasury', up: true, min: -40, max: 40, unit: ' bn' },
  unemp: { label: 'Unemployment', up: false, min: 5, max: 45, unit: '%' },
  inflation: { label: 'Inflation fears', up: false, min: 0, max: 100 },
  rightStreet: { label: 'SA strength', up: false, min: 0, max: 100 },
  leftStreet: { label: 'Red Front strength', up: false, min: 0, max: 100 },
  reichsbanner: { label: 'Reichsbanner', up: true, min: 0, max: 100 },
  nsMomentum: { label: 'Nazi momentum', up: false, min: 0.3, max: 2.2, hidden: true },
  kpdMomentum: { label: 'Communist momentum', up: false, min: 0.3, max: 2.2, hidden: true },
};

// Exogenous change in unemployment (points) at the end of each quarter, before policy.
const SHOCK = [0.8, 2.0, -2.0, 0, 1.6, 3.0, 0.6, 0.6, 2.0, 3.0, -0.8, 1.0, 2.4, 3.3, -1.0, 0, 0, 0.4, 0];

export const BACKGROUNDS = {
  union: { title: 'The Trade Unionist', sub: 'Der Gewerkschafter',
    text: 'Apprenticed as a lathe operator in Chemnitz, risen through the metalworkers\' union. The shop floor trusts you. The drawing rooms of Berlin do not.',
    perks: ['Trade unions +15', 'SPD voters hold firmer against the KPD', 'Industry −10 · Hindenburg −6'] },
  statesman: { title: 'The Statesman', sub: 'Der Staatsmann',
    text: 'A Prussian administrative jurist, district president under Braun and Severing. You know how the machinery of state turns, and who oils it.',
    perks: ['Hindenburg +8 · Reichswehr +8', 'One extra point of political capital each quarter in office', 'Trade unions −8'] },
  tribune: { title: 'The Tribune', sub: 'Der Volksredner',
    text: 'Editor, pamphleteer, the best platform speaker the party has had since Bebel. Crowds love you. Committees find you exhausting.',
    perks: ['Faith in the Republic +6', 'Speaking tours and radio addresses are far more effective', 'Coalition cohesion −8'] },
};

function mulberry(state) {
  let a = (state.seed = (state.seed + 0x6d2b79f5) | 0);
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const rand = mulberry;

function normalize(row) {
  let sum = 0;
  for (const p of PARTY_ORDER) { row[p] = Math.max(0.05, row[p] || 0); sum += row[p]; }
  for (const p of PARTY_ORDER) row[p] = (row[p] / sum) * 100;
  return row;
}

export function national(support) {
  const out = {}; let pop = 0;
  for (const p of PARTY_ORDER) out[p] = 0;
  for (const r of REGIONS) { pop += r.pop; for (const p of PARTY_ORDER) out[p] += support[r.id][p] * r.pop; }
  for (const p of PARTY_ORDER) out[p] /= pop;
  return out;
}

function initSupport() {
  const sup = {};
  for (const r of REGIONS) sup[r.id] = normalize({ ...r.base });
  for (let i = 0; i < 16; i++) {
    const nat = national(sup);
    for (const r of REGIONS) { for (const p of PARTY_ORDER) sup[r.id][p] *= NATIONAL_1928[p] / nat[p]; normalize(sup[r.id]); }
  }
  return sup;
}

export function newState(player) {
  const state = {
    v: 2, t: 0, seed: (Math.random() * 2 ** 31) | 0, player,
    stats: { stability: 62, legitimacy: 56, unemp: 8.2, treasury: 2, hindenburg: 52, reichswehr: 48, coalition: 60, unions: 62, industry: 42,
      inflation: 5, rightStreet: 18, leftStreet: 30, reichsbanner: 40, nsMomentum: 1, kpdMomentum: 1 },
    policy: { austerity: 0, works: 0, taxes: 0, osthilfe: 0 },
    capital: 3,
    seats: { ...SEATS_1928 }, totalSeats: 491, prevSeats: null,
    gov: ['SPD', 'DDP', 'Z', 'DVP'],
    rel: { KPD: -70, SPD: 60, DDP: 35, Z: 25, DVP: 5, OTH: -15, DNVP: -55, NSDAP: -90 },
    support: initSupport(),
    flags: {}, bills: {}, cooldown: {}, done: {}, decrees: 0,
    lastElection: -1, electionDue: 15, electionPending: false,
    log: [], history: [], ended: null,
  };
  const s = state.stats, bg = player.bg;
  if (bg === 'union') { s.unions += 15; s.industry -= 10; s.hindenburg -= 6; s.kpdMomentum -= 0.12; }
  if (bg === 'statesman') { s.hindenburg += 8; s.reichswehr += 8; s.unions -= 8; }
  if (bg === 'tribune') { s.legitimacy += 6; s.coalition -= 8; }
  snapshot(state);
  return state;
}

export function snapshot(state) {
  state.history[state.t] = { t: state.t, nat: national(state.support), unemp: state.stats.unemp, legitimacy: state.stats.legitimacy, stability: state.stats.stability };
}

export const govSeats = (state) => state.gov.reduce((a, p) => a + state.seats[p], 0);
export const hasMajority = (state) => govSeats(state) > state.totalSeats / 2;
export function hostileSeats(state) {
  let n = 0;
  for (const p of PARTY_ORDER) if (!state.gov.includes(p) && state.rel[p] < 15) n += state.seats[p];
  return n;
}
export const capitalPerTurn = (state) => clamp(3 + (state.player.bg === 'statesman' ? 1 : 0) + (state.stats.coalition >= 70 ? 1 : 0) - (state.stats.stability < 30 ? 1 : 0), 2, 5);

const WEIGHTS = {
  urban: (r) => 0.25 + r.urban * 1.4, rural: (r) => 0.25 + r.agr * 1.5, cath: (r) => 0.1 + r.cath * 2.2,
  prot: (r) => 1.25 - r.cath, east: (r) => (['OPR', 'POM', 'MEC', 'BRA', 'SIL'].includes(r.id) ? 2.6 : 0.3),
};

/** Move `pts` national percentage points from one party to another, weighted by region profile. */
export function swing(state, from, to, pts, weight) {
  const wf = typeof weight === 'string' && WEIGHTS[weight] ? WEIGHTS[weight] : (r) => (weight && weight === r.id ? 1 : weight && typeof weight === 'string' ? 0 : 1);
  let wsum = 0, pop = 0;
  for (const r of REGIONS) { wsum += wf(r) * r.pop; pop += r.pop; }
  const isRegion = typeof weight === 'string' && !WEIGHTS[weight];
  for (const r of REGIONS) {
    const w = isRegion ? (r.id === weight ? 1 : 0) : (wf(r) * pop) / wsum;
    if (!w) continue;
    const sh = state.support[r.id];
    const sources = from === '*' ? PARTY_ORDER.filter((p) => p !== to) : [from];
    const tot = sources.reduce((a, p) => a + sh[p], 0);
    for (const p of sources) {
      const amt = Math.min(sh[p] * 0.85, pts * w * (sh[p] / tot));
      sh[p] -= amt; sh[to] += amt;
    }
    normalize(sh);
  }
}

/** Apply an effect object. Returns chips describing what changed for the UI. */
export function applyEffects(state, eff) {
  const chips = [];
  if (!eff) return chips;
  const s = state.stats;
  for (const k of Object.keys(eff)) {
    if (k in STAT_META) {
      const m = STAT_META[k];
      const before = s[k];
      s[k] = clamp(s[k] + eff[k], m.min, m.max);
      if (!m.hidden && Math.abs(s[k] - before) > 1e-6) chips.push({ label: m.label, delta: eff[k], good: eff[k] > 0 === m.up });
      else if (m.hidden) chips.push({ label: m.label, delta: eff[k], good: eff[k] > 0 === m.up, soft: true });
    }
  }
  if (eff.rel) for (const p of Object.keys(eff.rel)) {
    state.rel[p] = clamp(state.rel[p] + eff.rel[p], -100, 100);
    chips.push({ label: `Relations: ${p === 'Z' ? 'Zentrum' : p === 'OTH' ? 'small parties' : p}`, delta: eff.rel[p], good: eff.rel[p] > 0 });
  }
  if (eff.policy) for (const k of Object.keys(eff.policy)) state.policy[k] = clamp(state.policy[k] + eff.policy[k], 0, 4);
  if (eff.flags) Object.assign(state.flags, eff.flags);
  if (eff.swing) for (const [from, to, pts, w] of eff.swing) {
    swing(state, from, to, pts, w);
    const nm = (p) => (p === 'Z' ? 'Zentrum' : p === 'OTH' ? 'small parties' : p === '*' ? 'all parties' : p);
    chips.push({ label: `Voters drift ${nm(from)} → ${nm(to)}`, delta: 0, good: ['SPD', 'DDP', 'Z'].includes(to), soft: true });
  }
  if (eff.capital) state.capital = Math.max(0, state.capital + eff.capital);
  if (eff.gov) { state.gov = [...eff.gov]; }
  if (eff.leave) { state.gov = state.gov.filter((p) => p !== eff.leave); }
  if (eff.election) state.electionPending = true;
  if (eff.decree) state.decrees += eff.decree;
  if (eff.end) state.ended = eff.end;
  return chips;
}

function move(sh, from, to, amt) { amt = Math.min(amt, sh[from] * 0.5); sh[from] -= amt; sh[to] += amt; }

export function crisisLevel(state) { return clamp((state.stats.unemp - 9) / 21, 0, 1.3); }

function drift(state) {
  const s = state.stats, pol = state.policy;
  const crisis = crisisLevel(state);
  const despair = clamp((60 - s.legitimacy) / 60, -0.35, 1);
  const ext = clamp(0.3 + crisis * 2.0 + despair * 0.9, 0.12, 2.6);
  const unionBond = state.player.bg === 'union' ? 0.8 : 1;
  for (const r of REGIONS) {
    const sh = state.support[r.id];
    const prot = 1 - r.cath * 0.78;
    const rural = 0.6 + r.agr * 0.7;
    const ns = ext * s.nsMomentum * prot * rural;
    move(sh, 'DNVP', 'NSDAP', sh.DNVP * 0.034 * ns);
    move(sh, 'DVP', 'NSDAP', sh.DVP * 0.05 * ns);
    move(sh, 'DDP', 'NSDAP', sh.DDP * 0.034 * ns);
    move(sh, 'OTH', 'NSDAP', sh.OTH * 0.06 * ns);
    move(sh, 'SPD', 'NSDAP', sh.SPD * 0.007 * ns * (1 - r.urban * 0.6));
    sh.NSDAP += 0.5 * crisis * ns;
    const kp = ext * s.kpdMomentum * (0.35 + r.urban) * (1 + 0.3 * pol.austerity - 0.18 * pol.works) * unionBond;
    move(sh, 'SPD', 'KPD', sh.SPD * 0.008 * Math.max(0, kp));
    sh.KPD += 0.06 * crisis * Math.max(0, kp);
    move(sh, 'DDP', 'SPD', sh.DDP * 0.012);
    move(sh, 'DVP', 'Z', sh.DVP * 0.004);
    if (ext < 0.75) {
      const calm = 0.75 - ext;
      move(sh, 'NSDAP', 'DNVP', sh.NSDAP * 0.07 * calm); move(sh, 'NSDAP', 'OTH', sh.NSDAP * 0.05 * calm);
      move(sh, 'KPD', 'SPD', sh.KPD * 0.05 * calm);
    }
    // Good government is rewarded a little.
    if (s.legitimacy > 60) move(sh, 'OTH', 'SPD', sh.OTH * 0.004 * (s.legitimacy - 60) / 10);
    normalize(sh);
  }
}

/** Advance the world by one quarter. Returns a report of deltas. */
export function tick(state) {
  const s = state.stats, pol = state.policy, f = state.flags, t = state.t;
  const before = { ...s };
  const majority = hasMajority(state);

  let du = SHOCK[t] ?? 0.2;
  du += 0.4 * pol.austerity - 0.42 * pol.works * (f.creditFinance ? 1.35 : 1);
  if (f.bankCollapse && t >= 12 && t <= 14) du += 0.9;
  if (f.tradeWar) du += 0.25;
  if (f.fortyHour) du -= 0.12;
  if (f.youngRejected && t >= 5) du += 0.35;
  s.unemp = clamp(s.unemp + du, 5, 45);

  const bal = 0.9 - 0.2 * (s.unemp - 8) + 1.0 * pol.austerity - (f.creditFinance ? 0.35 : 1.1) * pol.works + 0.55 * pol.taxes
    - (f.reparationsEnded ? 0 : 0.35) - 0.25 * pol.osthilfe - (f.youngRejected ? 0.4 : 0);
  s.treasury = clamp(s.treasury + bal, -40, 40);
  s.inflation = clamp(s.inflation + (f.creditFinance ? 1.6 * pol.works : -1.2), 0, 100);

  const crisis = crisisLevel(state);
  const nat = national(state.support);
  const rT = clamp(8 + nat.NSDAP * 1.7 + crisis * 12 - (f.saBanned ? 26 : 0), 0, 100);
  const lT = clamp(12 + nat.KPD * 2.0 + crisis * 12 - (f.rfbBanned ? 9 : 0), 0, 100);
  s.rightStreet += (rT - s.rightStreet) * 0.3;
  s.leftStreet += (lT - s.leftStreet) * 0.3;

  s.stability = clamp(s.stability + 0.6 - 0.07 * Math.max(0, s.rightStreet + s.leftStreet - 45) + 0.035 * (s.reichsbanner - 40) - crisis * 1.2, 0, 100);
  s.legitimacy = clamp(s.legitimacy - 0.1 * Math.max(0, s.unemp - 10) + 0.04 * (s.stability - 50) - 0.07 * Math.max(0, s.inflation - 20)
    + 0.45 * pol.works - 0.7 * pol.austerity - (du > 0 ? du * 0.25 : du * 0.9) - (state.decrees > 2 ? 0.5 : 0), 0, 100);
  s.hindenburg = clamp(s.hindenburg + (f.republicanPresident ? 0 : (t >= 6 ? -1.3 : -0.4) - (majority ? 0 : 1.2) + 0.5 * pol.osthilfe - (s.stability < 35 ? 1 : 0)), 0, 100);
  s.coalition = clamp(s.coalition - 0.8 - crisis * 1.6 - (state.gov.includes('DVP') ? 0.9 * pol.works + (f.creditFinance ? 1.2 : 0) + 0.6 * pol.taxes : 0)
    - 0.5 * pol.austerity * (state.gov.includes('DVP') ? 0 : 1), 0, 100);
  s.unions = clamp(s.unions - 1.8 * pol.austerity + 1.3 * pol.works - crisis * 0.9, 0, 100);
  s.industry = clamp(s.industry + 0.8 * pol.austerity - 0.7 * pol.works - 0.5 * pol.taxes - crisis * 0.4, 0, 100);
  s.reichswehr = clamp(s.reichswehr + (46 - s.reichswehr) * 0.04 - (s.stability < 35 ? 1.2 : 0), 0, 100);
  s.reichsbanner = clamp(s.reichsbanner - 1, 0, 100);
  s.nsMomentum += (1 - s.nsMomentum) * 0.06;
  s.kpdMomentum += (1 - s.kpdMomentum) * 0.06;
  for (const p of PARTY_ORDER) if (state.gov.includes(p) && p !== 'SPD') state.rel[p] += (20 + (s.coalition - 50) * 0.6 - state.rel[p]) * 0.2;

  drift(state);
  for (const k of Object.keys(state.cooldown)) if (state.cooldown[k] > 0) state.cooldown[k]--;
  state.t++;
  snapshot(state);
  return { before, after: { ...s }, du, bal };
}

export function allocateSeats(nat, total) {
  const raw = {}, seats = {}; let used = 0;
  for (const p of PARTY_ORDER) { raw[p] = (nat[p] / 100) * total; seats[p] = Math.floor(raw[p]); used += seats[p]; }
  const rem = PARTY_ORDER.slice().sort((a, b) => (raw[b] - seats[b]) - (raw[a] - seats[a]));
  for (let i = 0; used < total; i++, used++) seats[rem[i % rem.length]]++;
  return seats;
}

export function runElection(state) {
  const s = state.stats;
  const crisis = crisisLevel(state);
  const prevNat = national(state.support);
  for (const r of REGIONS) {
    const sh = state.support[r.id];
    const prot = 1 - r.cath * 0.78;
    sh.NSDAP += 4.0 * crisis * s.nsMomentum * prot * (0.6 + r.agr * 0.7);
    sh.KPD += 0.6 * crisis * s.kpdMomentum * (0.35 + r.urban);
    sh.SPD += clamp((s.legitimacy - 50) * 0.06, -2.5, 3) + (s.unions - 50) * 0.02;
    sh.Z += 0.4;
    normalize(sh);
  }
  const nat = national(state.support);
  const total = 491 + Math.round(clamp(crisis, 0, 1) * 110);
  const prev = { ...state.seats }, prevTotal = state.totalSeats;
  state.prevSeats = prev;
  state.seats = allocateSeats(nat, total);
  state.totalSeats = total;
  state.lastElection = state.t;
  state.electionDue = state.t + 16;
  state.electionPending = false;
  snapshot(state);
  return { nat, prevNat, seats: state.seats, prev, total, prevTotal };
}

// ---- Reichstag votes -----------------------------------------------------
export function partyScore(state, bill, p, sway = {}) {
  let sc = (bill.stance[p] || 0) * 30;
  if (state.gov.includes(p)) sc += 22 + (state.stats.coalition - 50) * 0.5;
  else sc += state.rel[p] * 0.35;
  if (p === 'SPD') sc += 18;
  return sc + (sway[p] || 0);
}

export function predictVote(state, bill, sway = {}, jitter = false) {
  const by = {}; let yes = 0, no = 0, abstain = 0;
  for (const p of PARTY_ORDER) {
    let sc = partyScore(state, bill, p, sway);
    if (jitter) sc += (rand(state) - 0.5) * 14;
    const n = state.seats[p];
    let y = 0, x = 0, a = 0;
    if (sc >= 12) {
      const dissent = state.gov.includes(p) && p !== 'SPD' ? clamp((62 - state.stats.coalition) / 220, 0, 0.3) : sc < 30 ? 0.08 : 0.02;
      a = Math.round(n * dissent * (jitter ? 0.6 + rand(state) * 0.8 : 1)); y = n - a;
    } else if (sc <= -12) { x = n; } else { a = n; }
    by[p] = { score: sc, pos: sc >= 12 ? 'yes' : sc <= -12 ? 'no' : 'abstain', firm: Math.abs(sc) >= 32, yes: y, no: x, abstain: a };
    yes += y; no += x; abstain += a;
  }
  const passes = bill.twoThirds ? yes >= Math.ceil(((yes + no) * 2) / 3) && yes + no >= (state.totalSeats * 2) / 3 : yes > no;
  return { by, yes, no, abstain, passes };
}

// ---- Endings -------------------------------------------------------------
export function successionEnding(state) {
  const s = state.stats;
  const ns = Math.max((state.seats.NSDAP / state.totalSeats) * 100, national(state.support).NSDAP * 0.92);
  if (ns >= 27 && s.legitimacy < 58) return 'machtergreifung';
  if (s.reichswehr < 42 || s.stability < 38) return 'general';
  return 'herrenklub';
}

export function finalEnding(state) {
  const s = state.stats, nat = national(state.support), maj = hasMajority(state);
  const ns = nat.NSDAP;
  if (ns >= 33 && !maj && s.hindenburg < 45 && !state.flags.republicanPresident) return 'machtergreifung';
  if (s.legitimacy >= 55 && ns < 24 && maj) return state.policy.works >= 2 && s.unemp < 24 ? 'social_republic' : 'republic';
  if (state.decrees >= 3 || !maj) return ns >= 30 ? 'abyss' : 'fortress';
  return ns >= 30 || s.legitimacy < 40 ? 'abyss' : 'republic';
}

export function score(state) {
  const s = state.stats, nat = national(state.support);
  return Math.round(clamp(s.legitimacy * 0.4 + s.stability * 0.2 + (45 - nat.NSDAP) * 0.6 + (35 - s.unemp) * 0.8 + (hasMajority(state) ? 10 : 0), 0, 100));
}
