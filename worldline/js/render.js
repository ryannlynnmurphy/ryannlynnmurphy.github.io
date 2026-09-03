/* WORLDLINE — signal rendering
 *
 * The visual grammar, one behaviour per kind of phenomenon:
 *   events         points
 *   risk           diffuse fields   (diffusion = 1 − confidence)
 *   climate        continuous field
 *   migration      particles along flows
 *   relationships  lines
 *   infrastructure nodes
 *   space          orbital paths
 *   time           animation
 *
 * Uncertainty is not annotation here. A confident signal is a tight core;
 * an uncertain one is a scatter with no clear centre. You can see the
 * epistemics before you read them.
 */

import { greatCircle } from './geo.js';
import { regionState, globalState, corridorFlows, spaceState, intersections, clamp01, ramp } from './model.js';
import { REGIONS } from './world.js';

export const LAYER_COLOR = {
  power:     [185, 160, 107],
  conflict:  [196, 88, 74],
  climate:   [207, 143, 74],
  migration: [111, 159, 181],
  resources: [127, 160, 106],
  space:     [148, 145, 200],
};

const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/* Deterministic scatter so a signal's field does not jitter between frames. */
function hash(str, i) {
  let h = 2166136261 ^ i;
  for (let k = 0; k < str.length; k++) { h ^= str.charCodeAt(k); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * A field whose shape carries its own confidence.
 * confidence 1 → concentrated core. confidence 0 → diffuse scatter.
 */
function field(ctx, x, y, base, colour, intensity, confidence, seed) {
  const conf = clamp01(confidence);
  const core = base * (0.28 + 0.72 * conf);
  const spread = base * (1.0 + 2.6 * (1 - conf));

  const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(2, core));
  g.addColorStop(0, rgba(colour, 0.42 * intensity * (0.4 + 0.6 * conf)));
  g.addColorStop(0.6, rgba(colour, 0.14 * intensity));
  g.addColorStop(1, rgba(colour, 0));
  ctx.beginPath(); ctx.arc(x, y, Math.max(2, core), 0, Math.PI * 2);
  ctx.fillStyle = g; ctx.fill();

  const n = Math.round(6 + 30 * (1 - conf) * intensity);
  for (let i = 0; i < n; i++) {
    const a = hash(seed, i * 2) * Math.PI * 2;
    const rr = Math.pow(hash(seed, i * 2 + 1), 0.6) * spread;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    const s = 0.5 + 0.9 * (1 - rr / spread);
    ctx.beginPath(); ctx.arc(px, py, s, 0, Math.PI * 2);
    ctx.fillStyle = rgba(colour, 0.30 * intensity * (1 - rr / spread) * (0.35 + 0.65 * (1 - conf)));
    ctx.fill();
  }
}

/* ------------------------------------------------------------ particles */

const particles = new Map();   // corridor key → phases

function corridorPath(f) {
  const key = f.from + '>' + f.to;
  let cache = particles.get(key);
  if (!cache || cache.fromLat !== f.a.lat) {
    cache = { pts: greatCircle(f.a.lat, f.a.lng, f.b.lat, f.b.lng, 46), phases: [], fromLat: f.a.lat };
    particles.set(key, cache);
  }
  return cache;
}

/* ---------------------------------------------------------------- main */

export function drawSignals(ctx, cam, state, t, dt) {
  const { scenario, year, layers, selected, hover } = state;
  const g = globalState(scenario, year);
  const on = l => layers.has(l);
  const hits = [];   // screen-space hit targets for pointer interaction

  /* ---- CLIMATE: a continuous field over the whole near face ---- */
  if (on('climate')) {
    ctx.save();
    ctx.beginPath(); ctx.arc(cam.cx, cam.cy, cam.R, 0, Math.PI * 2); ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of REGIONS) {
      const q = cam.project(p.lat, p.lng);
      if (!q.v) continue;
      const r = regionState(g, p);
      const v = r.index.climate.value / 100;
      if (v < 0.14) continue;
      const conf = clamp01(0.9 * Math.exp(-(year - 2026) / 110) + 0.08);
      field(ctx, q.x, q.y, cam.R * 0.19 * (0.6 + 0.7 * v), LAYER_COLOR.climate, v * q.c, conf, 'cl' + p.id);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  /* ---- CONFLICT: diffuse risk fields, never a marker for a war ---- */
  if (on('conflict')) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of REGIONS) {
      const q = cam.project(p.lat, p.lng);
      if (!q.v) continue;
      const r = regionState(g, p);
      const v = r.index.conflict.value / 100;
      if (v < 0.28) continue;
      const conf = clamp01(0.62 * Math.exp(-(year - 2026) / 80) + 0.06);
      field(ctx, q.x, q.y, cam.R * 0.15 * (0.7 + 0.8 * v), LAYER_COLOR.conflict, (v - 0.2) * 1.4 * q.c, conf, 'cf' + p.id);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  /* ---- MIGRATION: flows, as particles that actually move ---- */
  if (on('migration')) {
    const flows = corridorFlows(scenario, year);
    for (const f of flows) {
      const cache = corridorPath(f);
      const m = f.magnitude / 100;

      // The corridor itself, faint.
      ctx.beginPath();
      let open = false;
      for (const [la, ln] of cache.pts) {
        const q = cam.project(la, ln);
        if (q.v) { open ? ctx.lineTo(q.x, q.y) : (ctx.moveTo(q.x, q.y), open = true); } else open = false;
      }
      ctx.strokeStyle = rgba(LAYER_COLOR.migration, 0.10 + 0.16 * m);
      ctx.lineWidth = 0.6; ctx.stroke();

      // Particle density carries magnitude; speed does not (speed would read as urgency).
      const want = Math.round(2 + 16 * m);
      while (cache.phases.length < want) cache.phases.push(Math.random());
      while (cache.phases.length > want) cache.phases.pop();
      for (let i = 0; i < cache.phases.length; i++) {
        cache.phases[i] += dt * (0.026 + 0.02 * m);
        if (cache.phases[i] > 1) cache.phases[i] -= 1;
        const idx = cache.phases[i] * (cache.pts.length - 1);
        const i0 = Math.floor(idx), fr = idx - i0;
        const a = cache.pts[i0], b = cache.pts[Math.min(i0 + 1, cache.pts.length - 1)];
        const q = cam.project(a[0] + (b[0] - a[0]) * fr, a[1] + (b[1] - a[1]) * fr);
        if (!q.v) continue;
        const fade = Math.sin(cache.phases[i] * Math.PI);
        ctx.beginPath(); ctx.arc(q.x, q.y, 0.9 + 1.0 * m, 0, Math.PI * 2);
        ctx.fillStyle = rgba(LAYER_COLOR.migration, 0.30 + 0.5 * m * fade);
        ctx.fill();
      }
    }
  }

  /* ---- RESOURCES: nodes and the networks they sit in ---- */
  if (on('resources')) {
    for (const p of REGIONS) {
      const q = cam.project(p.lat, p.lng);
      if (!q.v) continue;
      const r = regionState(g, p);
      const v = r.index.resources.value;
      if (v < 42) continue;
      const s = 1.4 + 4.2 * ramp(v, 42, 96);
      ctx.beginPath();
      ctx.moveTo(q.x, q.y - s); ctx.lineTo(q.x + s, q.y); ctx.lineTo(q.x, q.y + s); ctx.lineTo(q.x - s, q.y);
      ctx.closePath();
      ctx.strokeStyle = rgba(LAYER_COLOR.resources, 0.30 + 0.5 * ramp(v, 42, 96));
      ctx.lineWidth = 0.9; ctx.stroke();
      if (r.choke > 60) {
        ctx.beginPath(); ctx.arc(q.x, q.y, s + 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(LAYER_COLOR.resources, 0.16); ctx.lineWidth = 0.6; ctx.stroke();
      }
    }
  }

  /* ---- POWER: weight as concentric mass, relationships as lines ---- */
  if (on('power')) {
    const ranked = REGIONS.map(p => ({ p, r: regionState(g, p) }))
      .sort((a, b) => b.r.index.power.value - a.r.index.power.value).slice(0, 9);
    // Lines between the highest-weight regions: the structure of who matters to whom.
    for (let i = 0; i < ranked.length; i++) {
      for (let j = i + 1; j < Math.min(i + 3, ranked.length); j++) {
        const pts = greatCircle(ranked[i].p.lat, ranked[i].p.lng, ranked[j].p.lat, ranked[j].p.lng, 30);
        ctx.beginPath(); let open = false;
        for (const [la, ln] of pts) {
          const q = cam.project(la, ln);
          if (q.v) { open ? ctx.lineTo(q.x, q.y) : (ctx.moveTo(q.x, q.y), open = true); } else open = false;
        }
        ctx.strokeStyle = rgba(LAYER_COLOR.power, 0.06); ctx.lineWidth = 0.5; ctx.stroke();
      }
    }
    for (const { p, r } of ranked) {
      const q = cam.project(p.lat, p.lng);
      if (!q.v) continue;
      const v = r.index.power.value;
      const s = 2 + 7 * ramp(v, 30, 92);
      ctx.beginPath(); ctx.arc(q.x, q.y, s, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(LAYER_COLOR.power, 0.22 + 0.4 * ramp(v, 30, 92));
      ctx.lineWidth = 0.8; ctx.stroke();
      ctx.beginPath(); ctx.arc(q.x, q.y, 1.1, 0, Math.PI * 2);
      ctx.fillStyle = rgba(LAYER_COLOR.power, 0.65); ctx.fill();
    }
  }

  /* ---- INTERSECTIONS: where several systems are elevated at once ---- */
  const inter = intersections(scenario, year, [...layers]);
  for (const x of inter) {
    const q = cam.project(x.region.lat, x.region.lng);
    if (!q.v) continue;
    const s = 7 + 2.2 * x.count;
    ctx.beginPath(); ctx.arc(q.x, q.y, s, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(235,231,222,0.20)';
    ctx.setLineDash([1.5, 3.5]); ctx.lineWidth = 0.7; ctx.stroke(); ctx.setLineDash([]);
    hits.push({ kind: 'intersection', id: 'x-' + x.region.id, x: q.x, y: q.y, r: s + 4, payload: x });
  }

  /* ---- SIGNALS: discrete propositions, drawn as points ---- */
  for (const sig of state.signals) {
    if (!on(sig.layer)) continue;
    if (sig.layer === 'space') continue;          // handled in the space pass
    const q = cam.project(sig.lat, sig.lng);
    if (!q.v) continue;
    const c = LAYER_COLOR[sig.layer];
    const conf = sig.confidence / 100;
    const sel = selected && selected.id === sig.id;
    const hov = hover && hover.id === sig.id;

    field(ctx, q.x, q.y, cam.R * 0.055 * (0.7 + 0.9 * sig.probability / 100),
      c, 0.5 + 0.5 * sig.probability / 100, conf, sig.id);

    const rr = 2.0 + 2.6 * (sig.probability / 100);
    ctx.beginPath(); ctx.arc(q.x, q.y, rr, 0, Math.PI * 2);
    ctx.fillStyle = rgba(c, 0.55 + 0.4 * conf); ctx.fill();
    if (sel || hov) {
      ctx.beginPath(); ctx.arc(q.x, q.y, rr + 5 + (sel ? 2 * Math.sin(t * 2.2) : 0), 0, Math.PI * 2);
      ctx.strokeStyle = rgba(c, sel ? 0.8 : 0.4); ctx.lineWidth = 0.9; ctx.stroke();
    }
    hits.push({ kind: 'signal', id: sig.id, x: q.x, y: q.y, r: rr + 9, payload: sig });
  }

  /* ---- RELATIONSHIPS: the selected thing's connections, on the map ---- */
  if (selected && selected.region) {
    const flows = corridorFlows(scenario, year)
      .filter(f => f.from === selected.region.id || f.to === selected.region.id);
    for (const f of flows) {
      const pts = greatCircle(f.a.lat, f.a.lng, f.b.lat, f.b.lng, 40);
      ctx.beginPath(); let open = false;
      for (const [la, ln] of pts) {
        const q = cam.project(la, ln);
        if (q.v) { open ? ctx.lineTo(q.x, q.y) : (ctx.moveTo(q.x, q.y), open = true); } else open = false;
      }
      ctx.strokeStyle = 'rgba(235,231,222,0.26)'; ctx.lineWidth = 0.7;
      ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
    }
  }

  return hits;
}

/* ------------------------------------------------------------- the space pass */

const SAT_SHELLS = [
  { id: 'leo', label: 'LEO', r: 1.14, tilt: 0.38, n: 34, speed: 0.32 },
  { id: 'meo', label: 'MEO — navigation', r: 1.34, tilt: 0.18, n: 14, speed: 0.19 },
  { id: 'geo', label: 'GEO', r: 1.62, tilt: 0.05, n: 9, speed: 0.09 },
];

function ellipse(ctx, cx, cy, rx, ry, colour, width) {
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.stroke();
}

export function drawSpace(ctx, cam, state, t) {
  const { scenario, year } = state;
  if (!state.layers.has('space')) return [];
  const sp = spaceState(scenario, year);
  const c = LAYER_COLOR.space;
  const { cx, cy, R } = cam;
  const hits = [];
  const a = state.spaceReveal;
  if (a <= 0.01) return hits;

  ctx.save();
  ctx.globalAlpha = a;

  for (const shell of SAT_SHELLS) {
    const rx = R * shell.r, ry = R * shell.r * shell.tilt;
    const strength = shell.id === 'leo' ? sp.orbital : shell.id === 'meo' ? 0.5 + 0.5 * sp.orbital : 0.4 + 0.6 * sp.launch;
    ellipse(ctx, cx, cy, rx, ry, rgba(c, 0.10 + 0.16 * strength), 0.6);
    const n = Math.round(shell.n * (0.35 + 0.85 * strength));
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + t * shell.speed;
      const x = cx + Math.cos(ang) * rx, y = cy + Math.sin(ang) * ry;
      const front = Math.sin(ang) > 0;
      ctx.beginPath(); ctx.arc(x, y, front ? 1.15 : 0.7, 0, Math.PI * 2);
      ctx.fillStyle = rgba(c, front ? 0.72 : 0.26); ctx.fill();
    }
  }

  // Ground segment: launch access, on the planet.
  for (const p of REGIONS) {
    const r = regionState(globalState(scenario, year), p);
    if (r.spaceCap < 45) continue;
    const q = cam.project(p.lat, p.lng);
    if (!q.v) continue;
    const s = 1.2 + 3 * ramp(r.spaceCap, 45, 100);
    ctx.beginPath(); ctx.moveTo(q.x, q.y + s); ctx.lineTo(q.x - s * 0.9, q.y - s * 0.6); ctx.lineTo(q.x + s * 0.9, q.y - s * 0.6);
    ctx.closePath(); ctx.strokeStyle = rgba(c, 0.5); ctx.lineWidth = 0.8; ctx.stroke();
  }

  // Cislunar and planetary nodes, placed on the pulled-back view.
  const bodies = [
    { id: 'moon', label: 'Moon', dist: 2.35, size: 0.10, strength: sp.lunar, sig: 'lunar-surface' },
    { id: 'mars', label: 'Mars', dist: 3.55, size: 0.13, strength: sp.mars, sig: 'mars-presence' },
  ];
  for (const b of bodies) {
    const ang = -0.42 + (b.id === 'mars' ? 0.30 : 0) + t * (b.id === 'moon' ? 0.012 : 0.005);
    const bx = cx + Math.cos(ang) * R * b.dist;
    const by = cy + Math.sin(ang) * R * b.dist * 0.42;
    const br = Math.max(3, R * b.size);
    const reveal = clamp01((state.spaceReveal - (b.id === 'mars' ? 0.5 : 0.2)) / 0.5);
    if (reveal <= 0) continue;
    ctx.globalAlpha = a * reveal;

    // Path to it — brightness is capability, not distance.
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by);
    ctx.strokeStyle = rgba(c, 0.06 + 0.22 * b.strength); ctx.lineWidth = 0.6;
    ctx.setLineDash([2, 5]); ctx.stroke(); ctx.setLineDash([]);

    const gr = ctx.createRadialGradient(bx - br * 0.4, by - br * 0.4, br * 0.05, bx, by, br);
    gr.addColorStop(0, 'rgba(120,118,132,0.9)');
    gr.addColorStop(1, 'rgba(38,38,46,0.9)');
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fillStyle = gr; ctx.fill();
    ctx.strokeStyle = rgba(c, 0.3); ctx.lineWidth = 0.7; ctx.stroke();

    // Presence: a ring that fills as sustained capability grows.
    if (b.strength > 0.03) {
      ctx.beginPath(); ctx.arc(bx, by, br + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * b.strength);
      ctx.strokeStyle = rgba(c, 0.55); ctx.lineWidth = 1.4; ctx.stroke();
    }

    ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = 'rgba(200,196,188,0.55)';
    ctx.fillText(b.label.toUpperCase(), bx - br, by + br + 15);
    ctx.fillStyle = 'rgba(200,196,188,0.30)';
    ctx.fillText(Math.round(b.strength * 100) + '% sustained', bx - br, by + br + 27);

    hits.push({ kind: 'signal', id: b.sig, x: bx, y: by, r: br + 10, payload: state.signals.find(s => s.id === b.sig) || null });
    ctx.globalAlpha = a;
  }

  // Space-layer signals that belong to orbit rather than to a place.
  for (const sig of state.signals) {
    if (sig.layer !== 'space' || sig.body_) continue;
    const shell = SAT_SHELLS.find(s => s.id === sig.orbit) || SAT_SHELLS[0];
    const ang = 2.1 + (sig.orbit === 'meo' ? 1.4 : 0);
    const x = cx + Math.cos(ang) * R * shell.r, y = cy + Math.sin(ang) * R * shell.r * shell.tilt;
    const sel = state.selected && state.selected.id === sig.id;
    ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = rgba(c, 0.8); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, 3.2 + 5 + (sel ? 2 * Math.sin(t * 2.2) : 0), 0, Math.PI * 2);
    ctx.strokeStyle = rgba(c, sel ? 0.75 : 0.28); ctx.lineWidth = 0.8; ctx.stroke();
    hits.push({ kind: 'signal', id: sig.id, x, y, r: 11, payload: sig });
  }

  ctx.restore();
  return hits;
}

/* --------------------------------------------------------------- starfield */

let STARS = null;
export function drawStars(ctx, w, h, alpha) {
  if (alpha <= 0.005) return;
  if (!STARS || STARS.w !== w || STARS.h !== h) {
    STARS = { w, h, pts: [] };
    for (let i = 0; i < 340; i++) {
      STARS.pts.push([hash('star', i * 3) * w, hash('star', i * 3 + 1) * h, 0.25 + 0.85 * hash('star', i * 3 + 2)]);
    }
  }
  ctx.save();
  for (const [x, y, s] of STARS.pts) {
    ctx.beginPath(); ctx.arc(x, y, s * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(226,222,214,${0.045 + 0.16 * s * alpha})`;
    ctx.fill();
  }
  ctx.restore();
}
