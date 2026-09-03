/* WORLDLINE — scenario engine
 *
 * Every number the interface shows is produced here, from the parameters
 * declared in world.js. Nothing is hard-coded as a result. The WHY? panel
 * shows the actual terms of the actual sum: the contributions add up to the
 * composite because the composite is the sum of the contributions.
 *
 * This is a small deterministic model, not a scientific one. It is meant to
 * be argued with. Every weight below is visible, and the interface says so.
 */

import { REGIONS, REGION_BY_ID, SIGNALS, CORRIDORS, ASSUMPTIONS, ACCESSION } from './world.js';

/* ---------------------------------------------------------------- utils */

export const clamp = (v, a = 0, b = 100) => v < a ? a : v > b ? b : v;
export const clamp01 = v => clamp(v, 0, 1);
export const ramp = (v, lo, hi) => clamp01((v - lo) / (hi - lo));
const smooth = t => t * t * (3 - 2 * t);

/** Sum terms into a 0–100 composite whose parts add up exactly to the whole. */
function composite(terms) {
  const raw = terms.reduce((a, t) => a + t.v, 0);
  const value = clamp(raw);
  let scaled = terms;
  if (raw !== 0 && Math.abs(value - raw) > 1e-9) {
    const k = value / raw;
    scaled = terms.map(t => ({ ...t, v: t.v * k }));
  }
  const out = scaled.map(t => ({ ...t, v: Math.round(t.v) }));
  const diff = Math.round(value) - out.reduce((a, t) => a + t.v, 0);
  if (out.length && diff !== 0) {
    let i = 0;
    for (let j = 1; j < out.length; j++) if (Math.abs(out[j].v) > Math.abs(out[i].v)) i = j;
    out[i].v += diff;
  }
  return { value: Math.round(value), terms: out };
}

/* ------------------------------------------------------------- scenario */

export function baseScenario() {
  const s = {};
  for (const a of ASSUMPTIONS) s[a.id] = a.base;
  return s;
}
export const scenarioKey = s => ASSUMPTIONS.map(a => s[a.id].toFixed(3)).join('|');

/* -------------------------------------------------------- global state */

const globalCache = new Map();

/**
 * Global state at a year. Temperature is a single smooth trajectory toward an
 * equilibrium set by the mitigation assumptions; sea level is integrated from
 * it toward a warming-dependent commitment ceiling.
 */
export function globalState(scenario, year) {
  const key = scenarioKey(scenario) + '@' + year;
  const hit = globalCache.get(key);
  if (hit) return hit;

  const s = scenario;
  const mit = clamp01(0.55 * s.energy + 0.45 * s.climate);

  const warmingAt = y => {
    const eq = 4.5 - 3.0 * mit;              // equilibrium anomaly, 1.5 → 4.5 °C
    const tau = 95 - 30 * mit;               // approach time constant, years
    let T = 1.35 + (eq - 1.35) * (1 - Math.exp(-Math.max(0, y - 2026) / tau));
    if (y > 2200) T -= 0.95 * mit * (1 - Math.exp(-(y - 2200) / 420));  // drawdown
    return clamp(T, 0.7, 6.5);
  };

  // Integrate sea level from 2026 with a coarsening step.
  let S = 0.25;                               // m above 2000 baseline
  let y = 2026;
  while (y < year) {
    const step = Math.min(y < 2200 ? 5 : y < 2500 ? 25 : 100, year - y);
    const T = warmingAt(y + step / 2);
    const ceiling = Math.max(0.4, 2.4 * (T - 1.0));   // multi-century commitment
    let rate = 3.6 * Math.max(0, T - 0.7) / 0.65;     // mm/yr
    rate += 0.9 * Math.pow(Math.max(0, T - 2.2), 1.5);
    rate *= Math.max(0, 1 - S / ceiling);
    S += rate * step / 1000;
    y += step;
  }

  const warming = warmingAt(year);
  const horizon = year - 2026;
  const g = {
    year, s, warming, seaLevel: S, mitigation: mit, horizon,
    // Adaptation is a choice in this model, not an automatic consequence of wealth.
    adaptation: clamp01((0.42 * s.climate + 0.28 * s.ai + 0.18 * s.trade + 0.12 * s.energy) * ramp(year, 2026, 2075)),
  };
  globalCache.set(key, g);
  if (globalCache.size > 4000) globalCache.clear();
  return g;
}

/* -------------------------------------------------------- region state */

function popIndex(p, year) {
  const [, peak, factor] = p.pop;
  if (year <= 2026) return 1;
  if (year <= peak) return 1 + (factor - 1) * smooth(clamp01((year - 2026) / Math.max(1, peak - 2026)));
  const decline = 0.32 * (1 - Math.exp(-(year - peak) / 200));
  return factor * (1 - decline);
}

const regionCache = new Map();

export function regionState(g, region) {
  const p = typeof region === 'string' ? REGION_BY_ID[region] : region;
  const key = scenarioKey(g.s) + '@' + g.year + '#' + p.id;
  const hit = regionCache.get(key);
  if (hit) return hit;

  const dT = g.warming - 1.35;
  const adapt = g.adaptation * (0.55 + 0.45 * (p.gov / 100));   // capacity gates adaptation
  const pIdx = popIndex(p, g.year);
  const heat = 1.35 + dT * p.heat;

  const water = clamp(p.water + p.waterSens * 24 * dT + 12 * (pIdx - 1) - 26 * adapt);
  const crop = clamp(p.crop + p.cropSens * 15 * dT + 14 * adapt);
  const coastal = clamp(p.coast * 100 * clamp01(0.14 + (g.seaLevel - 0.25) / 1.5));
  const food = clamp(0.55 * (100 - crop) + 0.45 * water - 26 * adapt);

  const convergence = 1 + (p.econ < 50 ? 0.55 : 0.22) * ramp(g.year, 2026, 2110);
  const econ = clamp(p.econ * (0.82 + 0.24 * g.s.trade + 0.22 * g.s.ai) * convergence);
  const tech = clamp(p.tech * (0.80 + 0.40 * g.s.ai) * (1 + 0.18 * ramp(g.year, 2026, 2110)));
  const gov = clamp(p.gov + 10 * (g.s.trade - 0.5) + 14 * adapt);
  const mil = clamp(p.mil * (0.62 + 0.72 * g.s.military));
  const energy = clamp(p.energy * (1 - 0.55 * g.s.energy * ramp(g.year, 2026, 2085)));
  const minerals = clamp(p.minerals * (0.68 + 0.62 * g.s.energy * ramp(g.year, 2026, 2075)));
  let choke = clamp(p.choke * (0.68 + 0.62 * g.s.trade));
  // A route that opens elsewhere reduces the salience of the route it bypasses.
  const arcticOpen = ramp(g.warming, 1.5, 3.2) * ramp(g.year, 2035, 2090);
  if (p.id === 'malacca' || p.id === 'red-sea' || p.id === 'panama') choke *= (1 - 0.22 * arcticOpen);
  if (p.id === 'arctic') choke = clamp(choke + 55 * arcticOpen);
  const spaceCap = clamp(p.launch * (0.55 + 0.85 * g.s.space) * (1 + 0.7 * ramp(g.year, 2026, 2130)));
  const demog = clamp(100 * Math.min(1, (p.pop[0] * pIdx) / 700));

  const r = { p, id: p.id, name: p.name, lat: p.lat, lng: p.lng, kind: p.kind,
    heat, water, crop, coastal, food, econ, tech, gov, mil, energy, minerals,
    choke, spaceCap, demog, popIndex: pIdx, adapt,
    population: p.pop[0] * pIdx };

  /* Composites. Migration and conflict feed each other, so the model runs the
     loop to a fixed point rather than cutting it — four passes is plenty. */
  let migration = 0, conflict = 0, climate = 0;
  const strategic = clamp(0.38 * choke + 0.34 * econ + 0.28 * minerals);
  let cP, mP, cR;
  for (let i = 0; i < 4; i++) {
    cP = composite([
      { k: 'heat', label: 'Extreme heat', v: 27 * ramp(heat, 1.25, 4.2) },
      { k: 'water', label: 'Water stress', v: 0.30 * water },
      { k: 'crop', label: 'Agricultural loss', v: 22 * ramp(p.crop - crop, 0, 28) },
      { k: 'coastal', label: 'Coastal exposure', v: 0.22 * coastal },
      { k: 'adaptation', label: 'Adaptation', v: -30 * adapt },
    ]);
    climate = cP.value;

    mP = composite([
      { k: 'climate', label: 'Climate pressure', v: 0.30 * climate },
      { k: 'food', label: 'Food insecurity', v: 0.20 * food },
      { k: 'conflict', label: 'Conflict risk', v: 0.22 * conflict },
      { k: 'population', label: 'Demographic pressure', v: 17 * ramp(pIdx, 1.0, 2.4) },
      { k: 'economy', label: 'Economic deficit', v: 0.15 * (100 - econ) },
      { k: 'governance', label: 'State capacity', v: -0.26 * gov },
    ]);
    migration = mP.value;

    cR = composite([
      { k: 'governance', label: 'State capacity deficit', v: 0.27 * (100 - gov) },
      { k: 'resources', label: 'Resource competition', v: 0.20 * (0.5 * energy + 0.5 * minerals) },
      { k: 'militarisation', label: 'Military posture', v: 0.21 * mil },
      { k: 'migration', label: 'Migration pressure', v: 0.15 * migration },
      { k: 'strategic', label: 'Strategic salience', v: 0.18 * strategic },
      { k: 'trade', label: 'Trade interdependence', v: -15 * g.s.trade },
    ]);
    conflict = cR.value;
  }

  const rS = composite([
    { k: 'energy', label: 'Energy endowment', v: 0.30 * energy },
    { k: 'minerals', label: 'Critical minerals', v: 0.32 * minerals },
    { k: 'choke', label: 'Chokepoint position', v: 0.26 * choke },
    { k: 'demand', label: 'Demand growth', v: 13 * ramp(g.year, 2026, 2090) * g.s.trade },
  ]);

  const pW = composite([
    { k: 'economy', label: 'Economic weight', v: 0.28 * econ },
    { k: 'tech', label: 'Technological capability', v: 0.24 * tech },
    { k: 'demog', label: 'Demographic weight', v: 0.14 * demog },
    { k: 'mil', label: 'Military capability', v: 0.14 * mil },
    { k: 'resources', label: 'Resource access', v: 0.10 * (0.5 * energy + 0.5 * minerals) },
    { k: 'space', label: 'Space capability', v: 0.10 * spaceCap },
  ]);

  r.index = { climate: cP, migration: mP, conflict: cR, resources: rS, power: pW };
  r.strategic = strategic;
  regionCache.set(key, r);
  if (regionCache.size > 20000) regionCache.clear();
  return r;
}

export const layerValue = (g, region, layer) => {
  if (layer === 'space') return { value: Math.round(regionState(g, region).spaceCap), terms: [] };
  return regionState(g, region).index[layer];
};

/* ------------------------------------------------- confidence & class */

const LAYER_QUALITY = { climate: 1.0, resources: 0.86, power: 0.8, migration: 0.8, conflict: 0.68, space: 0.74 };

export function confidence(year, layer, dataQuality = 0.8, penalty = 1) {
  const h = Math.max(0, year - 2026);
  const base = 94 * Math.exp(-h / 85) + 5;
  return Math.round(clamp(base * dataQuality * (LAYER_QUALITY[layer] ?? 0.8) * penalty, 2, 96));
}

export function epistemic(year, conf) {
  if (year <= 2026) return 'OBSERVED';
  if (conf >= 60) return 'PROJECTED';
  if (conf >= 26) return 'MODELED';
  return 'SPECULATIVE';
}

export const EPISTEMIC_NOTE = {
  OBSERVED: 'Drawn from current or historical measurement.',
  PROJECTED: 'A present trend extended forward under stated assumptions.',
  MODELED: 'An output of this prototype\'s model, under assumptions you can change.',
  SPECULATIVE: 'A structurally possible future, not a forecast. Treat the number as a shape, not a quantity.',
};

/* ------------------------------------------------------- time handling */

export function timeStep(year) {
  if (year < 2035) return 1;
  if (year < 2075) return 5;
  if (year < 2100) return 10;
  if (year < 2200) return 25;
  if (year < 2500) return 50;
  if (year < 5000) return 100;
  return 500;
}
export const snapYear = y => {
  const st = timeStep(y);
  return Math.round(y / st) * st;
};

export function horizonBand(year) {
  if (year <= 2035) return { id: 'near', label: 'Near horizon', note: 'Forecasting and observable trend.' };
  if (year <= 2075) return { id: 'mid', label: 'Projection', note: 'Present trends extended forward.' };
  if (year <= 2100) return { id: 'scenario', label: 'Scenario', note: 'Model output under stated assumptions.' };
  if (year <= 2200) return { id: 'long', label: 'Long-range scenario', note: 'Structure rather than event.' };
  if (year <= 2500) return { id: 'civ', label: 'Civilisational futures', note: 'What kinds of futures remain available.' };
  return { id: 'deep', label: 'Deep future', note: 'Speculative scenarios under defined assumptions. Not a forecast.' };
}

// Non-linear timeline: near years get most of the track.
const SEGMENTS = [[2026, 2050, 0.32], [2050, 2100, 0.26], [2100, 2200, 0.15], [2200, 2500, 0.12], [2500, 5000, 0.09], [5000, 10000, 0.06]];
export const MIN_YEAR = 2026, MAX_YEAR = 10000;

export function yearToT(year) {
  let acc = 0;
  for (const [a, b, w] of SEGMENTS) {
    if (year <= b) return acc + w * (year - a) / (b - a);
    acc += w;
  }
  return 1;
}
export function tToYear(t) {
  t = clamp01(t); let acc = 0;
  for (const [a, b, w] of SEGMENTS) {
    if (t <= acc + w) return a + (b - a) * (t - acc) / w;
    acc += w;
  }
  return MAX_YEAR;
}

/* -------------------------------------------------------------- signals */

export function activeSignals(scenario, year) {
  const g = globalState(scenario, year);
  const out = [];
  for (const sig of SIGNALS) {
    if (year < sig.from || year > sig.to) continue;
    const r = sig.region ? regionState(g, sig.region) : null;
    const prob = clamp01(sig.p(g, r ?? {}));
    if (prob < 0.06) continue;
    const conf = confidence(year, sig.layer, r ? r.p.q : 0.75, sig.confidencePenalty ?? 1);
    const severity = r ? Math.round(layerValue(g, r.p, sig.layer).value) : Math.round(prob * 100);
    out.push({
      ...sig, g, region: r, probability: Math.round(prob * 100), confidence: conf,
      severity, epistemic: epistemic(year, conf),
      lat: r ? r.lat : null, lng: r ? r.lng : null,
    });
  }
  return out;
}

export function signalById(scenario, year, id) {
  return activeSignals(scenario, year).find(s => s.id === id) || null;
}

/* ------------------------------------------------------------ corridors */

export function corridorFlows(scenario, year) {
  const g = globalState(scenario, year);
  return CORRIDORS.map(c => {
    const a = regionState(g, c.from), b = regionState(g, c.to);
    const push = a.index.migration.value;
    const pull = clamp(0.45 * b.econ + 0.3 * b.gov + 0.25 * (100 - b.index.climate.value));
    const feasibility = c.kind === 'internal' ? 0.95 : c.kind === 'labour' ? 0.7 : 0.5 + 0.3 * g.s.trade;
    const magnitude = clamp(push * (0.45 + 0.55 * pull / 100) * feasibility);
    return { ...c, a, b, magnitude, push, pull: Math.round(pull) };
  }).filter(f => f.magnitude > 8);
}

/* ---------------------------------------------------------------- space */

export function spaceState(scenario, year) {
  const g = globalState(scenario, year);
  const s = g.s;
  const launch = clamp01(0.3 + 0.6 * s.space * ramp(year, 2026, 2080));
  const orbital = clamp01(0.35 + 0.6 * s.space * ramp(year, 2026, 2070));
  const lunar = ramp(s.space, 0.25, 0.95) * ramp(year, 2032, 2080);
  const mars = ramp(s.space, 0.5, 1.0) * ramp(year, 2055, 2145);
  const deep = ramp(s.space, 0.6, 1.0) * ramp(year, 2085, 2280);
  const domains = ACCESSION.map(d => {
    if (d.year !== undefined) return { ...d, reached: 1, sustained: 1 };
    const sustained = d.id === 'moon' ? lunar : d.id === 'mars' ? mars : deep;
    return { ...d, reached: year >= d.reach ? 1 : 0, sustained: clamp01(sustained) };
  });
  return { launch, orbital, lunar, mars, deep, domains, year, g };
}

/* -------------------------------------------------------------- borders */

/**
 * How contested the ground either side of a border point is, from 0 (quiet)
 * to 1 (elevated conflict risk on at least one side). This never invents a
 * border or moves one — it reads the same conflict-risk composite every
 * other part of the interface uses, blended between the one or two nearest
 * declared regions, and lets the renderer decide how to draw that.
 */
export function borderStability(scenario, year, lat, lng) {
  const g = globalState(scenario, year);
  let best = null, bestD = Infinity, second = null, secondD = Infinity;
  for (const p of REGIONS) {
    const dLat = lat - p.lat, dLng = (lng - p.lng) * Math.cos(lat * Math.PI / 180);
    const d = Math.sqrt(dLat * dLat + dLng * dLng);
    if (d < bestD) { second = best; secondD = bestD; best = p; bestD = d; }
    else if (d < secondD) { second = p; secondD = d; }
  }
  if (!best) return 0;
  const rBest = regionState(g, best);
  if (!second || secondD > bestD * 2.4) return clamp01(rBest.index.conflict.value / 100);
  const rSecond = regionState(g, second);
  const wBest = 1 / (bestD + 0.25), wSecond = 1 / (secondD + 0.25);
  const val = (rBest.index.conflict.value * wBest + rSecond.index.conflict.value * wSecond) / (wBest + wSecond);
  return clamp01(val / 100);
}

/* -------------------------------------------------------- intersections */

/** Regions where several layers are simultaneously elevated. */
export function intersections(scenario, year, layers, threshold = 55) {
  const g = globalState(scenario, year);
  const active = layers.filter(l => l !== 'space');
  const out = [];
  for (const p of REGIONS) {
    const r = regionState(g, p);
    const hits = active.filter(l => r.index[l].value >= threshold);
    if (hits.length >= 3) out.push({ region: r, layers: hits, count: hits.length });
  }
  return out.sort((a, b) => b.count - a.count);
}

/* --------------------------------------------------------------- search */

export function search(query, scenario, year) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const g = globalState(scenario, year);
  const res = [];
  for (const p of REGIONS) {
    if (p.name.toLowerCase().includes(q) || p.id.includes(q)) res.push({ kind: 'region', id: p.id, label: p.name, sub: p.kind });
  }
  for (const s of SIGNALS) {
    if (s.title.toLowerCase().includes(q) || s.kind.toLowerCase().includes(q) || s.body.toLowerCase().includes(q))
      res.push({ kind: 'signal', id: s.id, label: s.title, sub: `${s.layer} · ${s.from}–${s.to === 2200 ? '2200' : s.to}` });
  }
  return res.slice(0, 12);
}

/* ------------------------------------------------------------ comparing */

export function snapshot(scenario, year) {
  const g = globalState(scenario, year);
  const rows = ['climate', 'migration', 'conflict', 'resources', 'power'];
  const avg = {};
  for (const k of rows) {
    let sum = 0;
    for (const p of REGIONS) sum += regionState(g, p).index[k].value;
    avg[k] = Math.round(sum / REGIONS.length);
  }
  const sp = spaceState(scenario, year);
  avg.space = Math.round(100 * (0.4 * sp.orbital + 0.3 * sp.lunar + 0.2 * sp.mars + 0.1 * sp.deep));
  return { year, warming: g.warming, seaLevel: g.seaLevel, avg, space: sp };
}
