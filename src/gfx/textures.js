// Procedural canvas textures: paper map, wood, grain, labels.
import * as THREE from 'three';
import { P, REGIONS, SAAR, NORTH_SEA, BALTIC, ISLANDS, MAP_LABELS } from '../engine/data.js';

export const S = 10, LON0 = 12.6, LAT0 = 51.3, KX = 0.63;
export const proj = ([lon, lat]) => [(lon - LON0) * KX * S, (lat - LAT0) * S];

function hash2(x, y) { const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return h - Math.floor(h); }

function subdivide(a, b, depth, amp, out) {
  if (depth === 0) return;
  const flip = a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]);
  const p = flip ? b : a, q = flip ? a : b;
  const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
  const dx = q[0] - p[0], dy = q[1] - p[1];
  const r = (hash2(mx * 3.1 + depth, my * 2.7 - depth) - 0.5) * 2 * amp;
  const m = [mx - dy * r, my + dx * r];
  subdivide(a, m, depth - 1, amp * 0.6, out); out.push(m); subdivide(m, b, depth - 1, amp * 0.6, out);
}

/** Turn a ring of lon/lat (or '@key' / key refs) into a roughened ring of projected points. */
export function roughRing(ring, depth = 3, amp = 0.17) {
  const pts = ring.map((k) => (typeof k === 'string' ? P[k.replace('@', '')] : k));
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    out.push(a); subdivide(a, b, depth, amp, out);
  }
  return out.map(proj);
}

export function pointInRing(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function noiseCanvas(size, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size); return c;
}

export function grainTexture() {
  const c = noiseCanvas(512, (g, n) => {
    g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 26000; i++) {
      const v = 200 + Math.random() * 55; g.fillStyle = `rgba(${v},${v - 4},${v - 12},${0.05 + Math.random() * 0.12})`;
      g.fillRect(Math.random() * n, Math.random() * n, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
    for (let i = 0; i < 500; i++) {
      g.strokeStyle = `rgba(90,70,40,${Math.random() * 0.07})`; g.lineWidth = 0.6; g.beginPath();
      const x = Math.random() * n, y = Math.random() * n, a = Math.random() * 6.28, l = 6 + Math.random() * 26;
      g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
  });
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function woodTexture() {
  const c = noiseCanvas(1024, (g, n) => {
    const grd = g.createLinearGradient(0, 0, n, 0); grd.addColorStop(0, '#24150c'); grd.addColorStop(0.5, '#2e1b0f'); grd.addColorStop(1, '#22130a');
    g.fillStyle = grd; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 900; i++) {
      const y = Math.random() * n, l = 100 + Math.random() * 700, x = Math.random() * n - 200;
      const dark = Math.random() > 0.45;
      g.strokeStyle = dark ? `rgba(8,4,2,${0.1 + Math.random() * 0.22})` : `rgba(120,72,36,${0.04 + Math.random() * 0.1})`;
      g.lineWidth = 0.5 + Math.random() * 2.4; g.beginPath(); g.moveTo(x, y);
      g.bezierCurveTo(x + l * 0.3, y + (Math.random() - 0.5) * 9, x + l * 0.6, y + (Math.random() - 0.5) * 9, x + l, y + (Math.random() - 0.5) * 5); g.stroke();
    }
  });
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(3, 2.2); t.anisotropy = 8; return t;
}

// Paper map extent (lon/lat window).
export const MAP_EXT = { lon0: 0.6, lon1: 27.6, lat0: 45.3, lat1: 58.1 };

export function paperMapTexture() {
  const [x0, y0] = proj([MAP_EXT.lon0, MAP_EXT.lat0]), [x1, y1] = proj([MAP_EXT.lon1, MAP_EXT.lat1]);
  const W = 4096, H = Math.round((W * (y1 - y0)) / (x1 - x0));
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const sx = W / (x1 - x0);
  const X = (p) => (p[0] - x0) * sx, Y = (p) => H - (p[1] - y0) * sx;
  const path = (pts) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(X(p), Y(p)) : g.moveTo(X(p), Y(p)))); g.closePath(); };

  // Paper
  const base = g.createRadialGradient(W * 0.45, H * 0.45, W * 0.1, W * 0.5, H * 0.5, W * 0.75);
  base.addColorStop(0, '#e6d9b8'); base.addColorStop(0.7, '#d9c9a2'); base.addColorStop(1, '#bfa97c');
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) {
    const r = 8 + Math.random() * 90; g.fillStyle = Math.random() > 0.5 ? `rgba(120,90,40,${Math.random() * 0.028})` : `rgba(255,248,225,${Math.random() * 0.035})`;
    g.beginPath(); g.arc(Math.random() * W, Math.random() * H, r, 0, 6.3); g.fill();
  }
  for (let i = 0; i < 60000; i++) { g.fillStyle = `rgba(70,50,20,${Math.random() * 0.09})`; g.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4); }

  // Seas
  const seas = [roughRing(NORTH_SEA, 3, 0.12), roughRing(BALTIC, 3, 0.12)];
  const islands = ISLANDS.map((r) => roughRing(r, 3, 0.14));
  g.save();
  g.beginPath();
  for (const s of seas) { s.forEach((p, i) => (i ? g.lineTo(X(p), Y(p)) : g.moveTo(X(p), Y(p)))); g.closePath(); }
  for (const s of islands) { s.slice().reverse().forEach((p, i) => (i ? g.lineTo(X(p), Y(p)) : g.moveTo(X(p), Y(p)))); g.closePath(); }
  g.clip('evenodd');
  g.fillStyle = 'rgba(58,98,110,0.62)'; g.fillRect(0, 0, W, H);
  g.lineJoin = 'round';
  for (const [w, a] of [[110, 0.035], [70, 0.05], [40, 0.06], [20, 0.08], [8, 0.12]]) {
    g.strokeStyle = `rgba(226,214,180,${a * 2.2})`; g.lineWidth = w;
    for (const s of [...seas, ...islands]) { path(s); g.stroke(); }
  }
  g.strokeStyle = 'rgba(40,66,74,0.1)'; g.lineWidth = 1.2;
  for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.restore();
  g.strokeStyle = 'rgba(42,48,46,0.75)'; g.lineWidth = 2.6;
  for (const s of [...seas, ...islands]) { path(s); g.stroke(); }

  // Graticule
  g.font = '500 22px Jost'; g.fillStyle = 'rgba(60,42,20,0.55)'; g.textAlign = 'center';
  for (let lon = 2; lon <= 27; lon++) {
    g.strokeStyle = `rgba(70,50,24,${lon % 5 === 0 ? 0.2 : 0.09})`; g.lineWidth = 1.4;
    const a = proj([lon, MAP_EXT.lat0]), b = proj([lon, MAP_EXT.lat1]);
    g.beginPath(); g.moveTo(X(a), Y(a)); g.lineTo(X(b), Y(b)); g.stroke();
    if (lon % 2 === 0) { g.fillText(lon + '°', X(a), H - 46); g.fillText(lon + '°', X(a), 62); }
  }
  for (let lat = 46; lat <= 58; lat++) {
    g.strokeStyle = `rgba(70,50,24,${lat % 5 === 0 ? 0.2 : 0.09})`;
    const a = proj([MAP_EXT.lon0, lat]), b = proj([MAP_EXT.lon1, lat]);
    g.beginPath(); g.moveTo(X(a), Y(a)); g.lineTo(X(b), Y(b)); g.stroke();
    g.fillText(lat + '°', 58, Y(a) + 8); g.fillText(lat + '°', W - 58, Y(a) + 8);
  }

  // Germany's footprint (visible in the grooves between the lacquered pieces)
  g.fillStyle = '#1d140c';
  for (const r of REGIONS) for (const ring of r.rings) { path(roughRing(ring)); g.fill(); }
  path(roughRing(SAAR.ring)); g.fillStyle = '#6d5f47'; g.fill();
  g.strokeStyle = 'rgba(30,20,10,0.8)'; g.lineWidth = 2; g.setLineDash([10, 7]); g.stroke(); g.setLineDash([]);

  // Labels
  const spaced = (txt, x, y, px, spacing, font, color, italic) => {
    g.font = `${italic ? 'italic ' : ''}${font}`.replace('PX', px);
    g.fillStyle = color; g.textAlign = 'left';
    const widths = [...txt].map((ch) => g.measureText(ch).width + spacing);
    let cx = x - widths.reduce((a, b) => a + b, 0) / 2;
    [...txt].forEach((ch, i) => { g.fillText(ch, cx, y); cx += widths[i]; });
  };
  for (const l of MAP_LABELS) {
    const p = proj(l.at); const px = Math.round(58 * l.size);
    if (l.it) spaced(l.t, X(p), Y(p), px, 2, '500 PXpx "Cormorant Garamond"', 'rgba(50,34,16,0.75)', true);
    else spaced(l.t, X(p), Y(p), px, px * 0.55, '600 PXpx "Cormorant Garamond"', l.sea ? 'rgba(38,70,80,0.62)' : 'rgba(66,44,20,0.5)', l.sea);
  }
  { const p = proj(SAAR.label); spaced('Saar', X(p), Y(p) + 6, 26, 1, '600 PXpx "Cormorant Garamond"', 'rgba(240,230,205,0.85)', true); }

  // Neatline
  g.strokeStyle = 'rgba(50,34,16,0.8)'; g.lineWidth = 7; g.strokeRect(84, 84, W - 168, H - 168);
  g.lineWidth = 2; g.strokeRect(100, 100, W - 200, H - 200);

  // Cartouche
  const cx = W - 760, cy = H - 470;
  g.fillStyle = 'rgba(228,214,178,0.96)'; g.fillRect(cx - 340, cy - 150, 680, 330);
  g.strokeStyle = 'rgba(50,34,16,0.85)'; g.lineWidth = 4; g.strokeRect(cx - 340, cy - 150, 680, 330); g.lineWidth = 1.5; g.strokeRect(cx - 326, cy - 136, 652, 302);
  g.textAlign = 'center'; g.fillStyle = '#2a1c0e';
  g.font = '92px UnifrakturMaguntia'; g.fillText('Deutsches Reich', cx, cy - 34);
  g.font = '600 30px "Cormorant Garamond"'; spaced('POLITISCHE ÜBERSICHTSKARTE', cx, cy + 22, 30, 6, '600 PXpx "Cormorant Garamond"', '#2a1c0e');
  g.font = 'italic 500 28px "Cormorant Garamond"'; g.textAlign = 'center'; g.fillText('nach dem Stande vom 1. Juli 1928', cx, cy + 66);
  g.font = '500 22px Jost'; g.fillText('Maßstab 1 : 2 500 000  ·  Reichsamt für Landesaufnahme, Berlin', cx, cy + 122);
  g.fillStyle = '#2a1c0e'; for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#2a1c0e' : 'rgba(0,0,0,0)'; g.fillRect(cx - 180 + i * 60, cy + 136, 60, 9); }
  g.strokeStyle = '#2a1c0e'; g.lineWidth = 1.5; g.strokeRect(cx - 180, cy + 136, 360, 9);

  // Compass rose
  const rx = 420, ry = H - 440;
  g.save(); g.translate(rx, ry); g.strokeStyle = 'rgba(50,34,16,0.75)'; g.fillStyle = 'rgba(50,34,16,0.75)';
  g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 150, 0, 6.3); g.stroke(); g.beginPath(); g.arc(0, 0, 138, 0, 6.3); g.stroke();
  for (let i = 0; i < 16; i++) {
    g.save(); g.rotate((i * Math.PI) / 8); const L = i % 4 === 0 ? 190 : i % 2 === 0 ? 120 : 70;
    g.beginPath(); g.moveTo(0, -L); g.lineTo(13, 0); g.lineTo(-13, 0); g.closePath(); i % 2 ? g.stroke() : g.fill();
    g.fillStyle = 'rgba(230,217,184,1)'; g.beginPath(); g.moveTo(0, -L); g.lineTo(0, 0); g.lineTo(-13, 0); g.closePath(); if (i % 2 === 0) g.fill();
    g.restore(); g.fillStyle = 'rgba(50,34,16,0.75)';
  }
  g.font = '64px UnifrakturMaguntia'; g.textAlign = 'center'; g.fillText('N', 0, -204); g.restore();

  // Folds
  for (const fx of [W * 0.335, W * 0.668]) {
    const f = g.createLinearGradient(fx - 16, 0, fx + 16, 0); f.addColorStop(0, 'rgba(0,0,0,0)'); f.addColorStop(0.45, 'rgba(60,40,10,0.13)'); f.addColorStop(0.55, 'rgba(255,250,230,0.16)'); f.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = f; g.fillRect(fx - 16, 0, 32, H);
  }
  { const fy = H * 0.5; const f = g.createLinearGradient(0, fy - 16, 0, fy + 16); f.addColorStop(0, 'rgba(0,0,0,0)'); f.addColorStop(0.45, 'rgba(60,40,10,0.13)'); f.addColorStop(0.55, 'rgba(255,250,230,0.16)'); f.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = f; g.fillRect(0, fy - 16, W, 32); }

  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; t.generateMipmaps = true;
  return { texture: t, width: x1 - x0, height: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

/** Flat text label as a textured plane lying on the map. */
export function makeLabel(text, { px = 64, font = '600 PXpx "Cormorant Garamond"', color = '#f4ead2', spacing = 0, shadow = 'rgba(10,6,2,0.85)', italic = false, height = 1 } = {}) {
  const c = document.createElement('canvas'); const g = c.getContext('2d');
  const f = `${italic ? 'italic ' : ''}${font.replace('PX', px)}`;
  g.font = f;
  const chars = [...text];
  const widths = chars.map((ch) => g.measureText(ch).width + spacing);
  const w = Math.ceil(widths.reduce((a, b) => a + b, 0) + px * 0.8), h = Math.ceil(px * 1.6);
  c.width = w; c.height = h;
  g.font = f; g.textBaseline = 'middle';
  let x = px * 0.4 + spacing / 2;
  g.shadowColor = shadow; g.shadowBlur = px * 0.16; g.shadowOffsetY = px * 0.04;
  g.fillStyle = color;
  for (let pass = 0; pass < 2; pass++) { let cx = x; chars.forEach((ch, i) => { g.fillText(ch, cx, h / 2); cx += widths[i]; }); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -4 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry((height * w) / h, height), mat);
  mesh.rotation.x = -Math.PI / 2; mesh.renderOrder = 5;
  return mesh;
}

export function glowTexture() {
  const c = noiseCanvas(128, (g, n) => {
    const r = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,255,255,0.35)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, n, n);
  });
  return new THREE.CanvasTexture(c);
}

export function beamTexture() {
  const c = document.createElement('canvas'); c.width = 4; c.height = 128; const g = c.getContext('2d');
  const r = g.createLinearGradient(0, 0, 0, 128); r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(1, 'rgba(255,255,255,0.9)');
  g.fillStyle = r; g.fillRect(0, 0, 4, 128);
  return new THREE.CanvasTexture(c);
}

export function flagTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 96; const g = c.getContext('2d');
  ['#0b0b0b', '#b3231a', '#d9a521'].forEach((col, i) => { g.fillStyle = col; g.fillRect(0, i * 32, 64, 32); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
