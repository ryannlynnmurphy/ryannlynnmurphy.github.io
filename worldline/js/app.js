/* WORLDLINE — application shell
 *
 * Wires the model (model.js/world.js), the globe (geo.js), and the
 * visual grammar (render.js) into the interaction the brief describes:
 * drag the timeline, watch the world change, click something, ask why,
 * follow the connection, change an assumption, watch another future
 * emerge, zoom out.
 */

import { REGIONS, REGION_BY_ID, LAYERS, ASSUMPTIONS, PRESETS, SOURCES, NODE_BY_ID, EDGES, ACCESSION } from './world.js';
import {
  baseScenario, globalState, regionState, activeSignals, signalById,
  timeStep, snapYear, horizonBand, yearToT, tToYear, MIN_YEAR, MAX_YEAR,
  epistemic, EPISTEMIC_NOTE, spaceState, snapshot, borderStability, territorialShift,
} from './model.js';
import { loadGeo, Camera, erodeLand, floodBands } from './geo.js';
import { drawGlobe, drawHalo, drawBorders, drawTerritorialShifts } from './geo.js';
import { drawSignals, drawSpace, drawStars, LAYER_COLOR } from './render.js';

/* ------------------------------------------------------------------ state */

const state = {
  year: 2038,
  scenario: baseScenario(),
  layers: new Set(['power', 'conflict', 'climate', 'migration', 'resources']),
  selected: null,
  hover: null,
  signals: [],
  spaceReveal: 0,
  worldlines: loadWorldlines(),
  activeWorldline: 'baseline',
};

function loadWorldlines() {
  try {
    const raw = localStorage.getItem('worldline.saved');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveWorldlines() {
  try { localStorage.setItem('worldline.saved', JSON.stringify(state.worldlines)); } catch {}
}

/* --------------------------------------------------------------- canvas */

const canvas = document.getElementById('globe');
const ctx = canvas.getContext('2d');
const cam = new Camera();
let geo = null;
let dpr = Math.min(2, window.devicePixelRatio || 1);

function resize() {
  const r = canvas.getBoundingClientRect();
  canvas.width = r.width * dpr; canvas.height = r.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cam.fit(r.width, r.height);
}
window.addEventListener('resize', resize);

const THEME = {
  ocean: '#0d1013', oceanHi: '#171c21', oceanLo: '#07090b',
  land: 'rgba(226,222,214,0.05)',
  grat: 'rgba(226,222,214,0.045)',
  outline: 'rgba(226,222,214,0.16)',
  limb: 'rgba(226,222,214,0.10)',
  halo: 'rgba(120,140,160,0.10)',
  retreatGhost: 'rgba(120,170,196,0.55)',
  flood: 'rgba(84,138,168,0.34)',
  borderStable: 'rgba(226,222,214,0.16)',
};

/* ------------------------------------------------------------ coastline cache */

let erosionCache = { key: null, rings: null, bands: null };
function currentErosion() {
  if (!geo) return { rings: null, bands: null };
  const g = globalState(state.scenario, state.year);
  const key = g.seaLevel.toFixed(3);
  if (erosionCache.key !== key) {
    const rings = erodeLand(geo.land, g.seaLevel);
    erosionCache = { key, rings, bands: floodBands(geo.land, rings) };
  }
  return erosionCache;
}

/* -------------------------------------------------------------- pointer */

let hits = [];
let dragging = false, dragMoved = false, lastX = 0, lastY = 0;

canvas.addEventListener('pointerdown', e => {
  dragging = true; dragMoved = false; lastX = e.clientX; lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if (dragging) {
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) dragMoved = true;
    cam.rotate(dx, dy);
    lastX = e.clientX; lastY = e.clientY;
    return;
  }
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  const hit = pick(x, y);
  state.hover = hit ? hit.payload : null;
  canvas.style.cursor = hit ? 'pointer' : (dragging ? 'grabbing' : 'grab');
  renderHoverCard(hit, e.clientX, e.clientY);
});
canvas.addEventListener('pointerup', e => {
  dragging = false;
  if (!dragMoved) {
    const r = canvas.getBoundingClientRect();
    const hit = pick(e.clientX - r.left, e.clientY - r.top);
    if (hit) select(hit.payload, hit.kind);
    else deselect();
  }
});
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  cam.zoom = Math.max(0.6, Math.min(7, cam.zoom * (1 - e.deltaY * 0.0012)));
}, { passive: false });

function pick(x, y) {
  let best = null, bd = Infinity;
  for (const h of hits) {
    const d = Math.hypot(h.x - x, h.y - y);
    if (d <= h.r && d < bd) { bd = d; best = h; }
  }
  return best;
}

function select(payload, kind) {
  if (kind === 'intersection') { openIntersection(payload); return; }
  state.selected = payload;
  if (payload.lat != null) cam.lookAt(payload.lat, payload.lng);
  else if (payload.region) cam.lookAt(payload.region.lat, payload.region.lng);
  openPanel(payload);
}
function deselect() {
  state.selected = null;
  closePanel();
}

/* ------------------------------------------------------------ hover card */

const hoverCard = document.getElementById('hoverCard');
function renderHoverCard(hit, cx, cy) {
  if (!hit || dragging) { hoverCard.hidden = true; return; }
  const p = hit.payload;
  let title, sub;
  if (hit.kind === 'signal' && p) { title = p.title; sub = `${p.probability}% · ${p.epistemic}`; }
  else if (hit.kind === 'intersection') { title = p.region.name; sub = `${p.count} systems intersect`; }
  else { hoverCard.hidden = true; return; }
  hoverCard.textContent = title + '  ·  ' + sub;
  hoverCard.style.left = (cx + 14) + 'px';
  hoverCard.style.top = (cy + 14) + 'px';
  hoverCard.hidden = false;
}
canvas.addEventListener('pointerleave', () => { hoverCard.hidden = true; state.hover = null; });

/* -------------------------------------------------------------- animate */

let t0 = performance.now() / 1000;
function frame(now) {
  const t = now / 1000, dt = Math.min(0.05, t - t0); t0 = t;

  cam.ease();
  const targetReveal = state.layers.has('space') ? 1 : 0;
  state.spaceReveal += (targetReveal - state.spaceReveal) * Math.min(1, dt * 2.4);
  const targetPull = state.layers.has('space') ? 1 : 0;
  cam.pull += (targetPull - cam.pull) * Math.min(1, dt * 1.6);

  cam.fit(canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height);

  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  drawStars(ctx, canvas.width / dpr, canvas.height / dpr, 0.5 + 0.5 * cam.pull);
  if (cam.pull > 0.02) drawHalo(ctx, cam, THEME, cam.pull);

  if (geo) {
    const erosion = currentErosion();
    drawGlobe(ctx, cam, geo, THEME, erosion.rings, erosion.bands);
    const showStability = state.layers.has('conflict') || state.layers.has('power');
    const stabilityFn = showStability
      ? (lat, lng) => borderStability(state.scenario, state.year, lat, lng)
      : () => 0;
    const showShift = state.layers.has('conflict');
    const shiftFn = showShift
      ? (lat, lng) => territorialShift(state.scenario, state.year, lat, lng)
      : null;
    drawBorders(ctx, cam, geo, stabilityFn, THEME, t, shiftFn);
    if (showShift) drawTerritorialShifts(ctx, cam, geo, shiftFn, THEME, t);
  }

  state.signals = activeSignals(state.scenario, state.year);
  const hitsA = drawSignals(ctx, cam, state, t, dt);
  const hitsB = drawSpace(ctx, cam, state, t);
  hits = hitsA.concat(hitsB);

  requestAnimationFrame(frame);
}

/* ---------------------------------------------------------------- timeline */

const track = document.getElementById('track');
const handle = document.getElementById('handle');
const yearLabel = document.getElementById('yearLabel');
const yearInput = document.getElementById('yearInput');
const horizonLabel = document.getElementById('horizonLabel');
const stepLabel = document.getElementById('stepLabel');
const seaLevelLabel = document.getElementById('seaLevelLabel');
const deepBanner = document.getElementById('deepBanner');

function setYear(y, snap = true) {
  y = Math.max(MIN_YEAR, Math.min(MAX_YEAR, y));
  state.year = snap ? snapYear(y) : y;
  const t = yearToT(state.year);
  handle.style.left = (t * 100) + '%';
  yearLabel.textContent = fmtYear(state.year);
  yearInput.value = state.year;
  const band = horizonBand(state.year);
  horizonLabel.textContent = band.label.toUpperCase();
  horizonLabel.title = band.note;
  stepLabel.textContent = stepDesc(state.year);
  deepBanner.hidden = band.id !== 'deep';
  document.body.dataset.horizon = band.id;
  const g = globalState(state.scenario, state.year);
  seaLevelLabel.textContent = `+${g.seaLevel.toFixed(2)}m SEA LEVEL · +${g.warming.toFixed(1)}°C`;
  if (state.selected) refreshPanel();
  renderLegendCounts();
}
function fmtYear(y) { return y < 0 ? Math.abs(y) + ' BCE' : String(y); }
function stepDesc(y) {
  const st = timeStep(y);
  return st === 1 ? 'yearly resolution' : st + '-year increments';
}

let trackDragging = false;
function trackToT(clientX) {
  const r = track.getBoundingClientRect();
  return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
}
track.addEventListener('pointerdown', e => {
  trackDragging = true; track.setPointerCapture(e.pointerId);
  setYear(tToYear(trackToT(e.clientX)));
});
track.addEventListener('pointermove', e => { if (trackDragging) setYear(tToYear(trackToT(e.clientX))); });
track.addEventListener('pointerup', e => { trackDragging = false; });

yearInput.addEventListener('change', () => {
  const v = parseInt(yearInput.value, 10);
  if (!isNaN(v)) setYear(v, false);
});

document.querySelectorAll('.tick').forEach(el => {
  el.addEventListener('click', () => setYear(parseInt(el.dataset.year, 10)));
});

/* -------------------------------------------------------------- layers */

const layersEl = document.getElementById('layers');
for (const l of LAYERS) {
  const row = document.createElement('button');
  row.className = 'layerRow';
  row.dataset.layer = l.id;
  row.innerHTML = `<span class="dot" style="--c:${LAYER_COLOR[l.id].join(',')}"></span>
    <span class="layerIndex">${l.index}</span><span class="layerLabel">${l.label}</span>
    <span class="layerCount" data-count="${l.id}"></span>`;
  row.classList.toggle('on', state.layers.has(l.id));
  row.addEventListener('click', () => {
    if (state.layers.has(l.id)) state.layers.delete(l.id); else state.layers.add(l.id);
    row.classList.toggle('on');
    renderLegendCounts();
  });
  layersEl.appendChild(row);
}
function renderLegendCounts() {
  for (const l of LAYERS) {
    const n = state.signals.filter(s => s.layer === l.id).length;
    const el = layersEl.querySelector(`[data-count="${l.id}"]`);
    if (el) el.textContent = n ? n : '';
  }
}

/* --------------------------------------------------------------- panel */

const panel = document.getElementById('panel');
function closePanel() { panel.classList.remove('open'); }

function openPanel(payload) {
  if (payload && payload.title !== undefined && payload.chain) openSignal(payload);
  else if (payload && payload.name !== undefined) openRegion(payload);
}

function chainHtml(chain) {
  return chain.map((id, i) => {
    const n = NODE_BY_ID[id];
    const arrow = i < chain.length - 1 ? '<div class="chainArrow">↓</div>' : '';
    return `<div class="chainNode" data-node="${id}" title="${n ? n.about.replace(/"/g,'&quot;') : ''}">${n ? n.label : id}</div>${arrow}`;
  }).join('');
}

function sourcesHtml(ids) {
  return ids.map(id => {
    const s = SOURCES[id];
    if (!s) return '';
    return `<a class="sourceRow" href="${s.url}" target="_blank" rel="noopener">
      <span class="sourceOrg">${s.org}</span><span class="sourceTitle">${s.title}</span>${s.year ? `<span class="sourceYear">${s.year}</span>` : ''}
    </a>`;
  }).join('');
}

function whyBreakdown(index) {
  return index.terms.map(t => {
    const bar = Math.min(100, Math.abs(t.v) * 2.2);
    const sign = t.v >= 0 ? '+' : '−';
    return `<div class="whyRow">
      <span class="whyLabel">${t.label.toUpperCase()}</span>
      <span class="whyBar"><span style="width:${bar}%; background:${t.v>=0?'rgba(200,196,188,.55)':'rgba(196,88,74,.55)'}"></span></span>
      <span class="whyVal">${sign}${Math.abs(t.v)}</span>
    </div>`;
  }).join('') + `<div class="whyRow whyTotal"><span class="whyLabel">COMPOSITE</span><span class="whyBar"></span><span class="whyVal">${index.value}</span></div>`;
}

function openSignal(sig) {
  const live = signalById(state.scenario, state.year, sig.id) || sig;
  const band = horizonBand(state.year);
  panel.innerHTML = `
    <button class="panelClose" id="panelClose">×</button>
    <div class="panelEyebrow">${live.region ? live.region.name.toUpperCase() : 'ORBITAL'} · ${live.from}–${live.to}</div>
    <h2 class="panelTitle">${live.title}</h2>
    <div class="panelKind">${live.kind}</div>
    <div class="panelStats">
      <div class="stat"><div class="statVal">${live.probability}%</div><div class="statLabel">Probability</div></div>
      <div class="stat"><div class="statVal">${live.confidence}%</div><div class="statLabel">Confidence</div></div>
      <div class="stat"><div class="statVal epi-${live.epistemic}">${live.epistemic}</div><div class="statLabel">${EPISTEMIC_NOTE[live.epistemic]}</div></div>
    </div>
    <p class="panelBody">${live.body}</p>
    <div class="panelSectionLabel">CAUSAL CHAIN</div>
    <div class="chain">${chainHtml(live.chain)}</div>
    <button class="whyBtn" id="whyBtn">WHY? ${live.probability}% CONFIDENCE ${live.confidence}%</button>
    <div class="whyPanel" id="whyPanel" hidden></div>
    <button class="sourcesBtn" id="sourcesBtn">VIEW SOURCES (${live.sources.length})</button>
    <div class="sourcesPanel" id="sourcesPanel" hidden>${sourcesHtml(live.sources)}</div>
    <div class="methodNote">${horizonBand(live.from > state.year ? live.from : state.year).note}</div>
  `;
  panel.classList.add('open');
  document.getElementById('panelClose').onclick = deselect;
  document.getElementById('whyBtn').onclick = () => {
    const p = document.getElementById('whyPanel');
    if (p.hidden) {
      const idx = live.region ? live.region.index[live.layer] : null;
      p.innerHTML = idx ? whyBreakdown(idx) : `<div class="whyRow"><span class="whyLabel">PROBABILITY</span><span class="whyBar"></span><span class="whyVal">${live.probability}</span></div>`;
    }
    p.hidden = !p.hidden;
  };
  document.getElementById('sourcesBtn').onclick = () => {
    document.getElementById('sourcesPanel').hidden = !document.getElementById('sourcesPanel').hidden;
  };
  panel.querySelectorAll('.chainNode').forEach(el => {
    el.addEventListener('click', () => showNodeInfo(el.dataset.node, el));
  });
}

function showNodeInfo(id, el) {
  const n = NODE_BY_ID[id];
  if (!n) return;
  const affects = EDGES.filter(e => e.source === id).map(e => NODE_BY_ID[e.target]?.label).filter(Boolean);
  const affectedBy = EDGES.filter(e => e.target === id).map(e => NODE_BY_ID[e.source]?.label).filter(Boolean);
  let tip = document.getElementById('nodeTip');
  if (!tip) { tip = document.createElement('div'); tip.id = 'nodeTip'; tip.className = 'nodeTip'; document.body.appendChild(tip); }
  tip.innerHTML = `<b>${n.label}</b><p>${n.about}</p>
    ${affectedBy.length ? `<div class="tipRow"><span>AFFECTED BY</span> ${affectedBy.join(', ')}</div>` : ''}
    ${affects.length ? `<div class="tipRow"><span>AFFECTS</span> ${affects.join(', ')}</div>` : ''}`;
  const r = el.getBoundingClientRect();
  tip.style.left = Math.min(window.innerWidth - 300, r.right + 12) + 'px';
  tip.style.top = r.top + 'px';
  tip.hidden = false;
  const closeTip = ev => { if (!tip.contains(ev.target) && ev.target !== el) { tip.hidden = true; document.removeEventListener('pointerdown', closeTip); } };
  setTimeout(() => document.addEventListener('pointerdown', closeTip), 0);
}

function openRegion(p) {
  const g = globalState(state.scenario, state.year);
  const r = regionState(g, p);
  const rows = ['power', 'conflict', 'climate', 'migration', 'resources'];
  const sigs = state.signals.filter(s => s.region && s.region.id === p.id);
  panel.innerHTML = `
    <button class="panelClose" id="panelClose">×</button>
    <div class="panelEyebrow">${p.kind.toUpperCase()} · ${state.year}</div>
    <h2 class="panelTitle">${p.name}</h2>
    <div class="panelStats regionGrid">
      ${rows.map(k => `<div class="stat"><div class="statVal" style="color:rgb(${LAYER_COLOR[k].join(',')})">${r.index[k].value}</div><div class="statLabel">${k}</div></div>`).join('')}
    </div>
    <div class="panelSectionLabel">POPULATION</div>
    <p class="panelBody">${Math.round(r.population)}M · warming here ${r.heat.toFixed(1)}°C · adaptation investment ${Math.round(r.adapt*100)}%</p>
    ${sigs.length ? `<div class="panelSectionLabel">SIGNALS HERE</div>${sigs.map(s => `<div class="sigLink" data-id="${s.id}">${s.title} <span>${s.probability}%</span></div>`).join('')}` : ''}
  `;
  panel.classList.add('open');
  document.getElementById('panelClose').onclick = deselect;
  panel.querySelectorAll('.sigLink').forEach(el => el.addEventListener('click', () => {
    const s = state.signals.find(x => x.id === el.dataset.id);
    if (s) select(s, 'signal');
  }));
}

function refreshPanel() {
  if (!state.selected) return;
  if (state.selected.chain) {
    const live = signalById(state.scenario, state.year, state.selected.id);
    if (live) { state.selected = live; openSignal(live); } else deselect();
  } else {
    openRegion(state.selected.p ? state.selected.p : state.selected);
  }
}

function openIntersection(x) {
  select(REGION_BY_ID[x.region.id], 'region');
}

/* ---------------------------------------------------------------- assumptions */

const assumptionsEl = document.getElementById('assumptions');
for (const a of ASSUMPTIONS) {
  const row = document.createElement('div');
  row.className = 'assumRow';
  row.innerHTML = `
    <div class="assumHead"><span>${a.label}</span><span class="assumVal" id="av-${a.id}"></span></div>
    <input type="range" min="0" max="100" step="1" id="ar-${a.id}" class="assumSlider">
    <div class="assumEnds"><span>${a.low}</span><span>${a.high}</span></div>
  `;
  assumptionsEl.appendChild(row);
}
function syncAssumptionUI() {
  for (const a of ASSUMPTIONS) {
    document.getElementById(`ar-${a.id}`).value = Math.round(state.scenario[a.id] * 100);
    document.getElementById(`av-${a.id}`).textContent = Math.round(state.scenario[a.id] * 100) + '%';
  }
}
for (const a of ASSUMPTIONS) {
  document.getElementById(`ar-${a.id}`).addEventListener('input', e => {
    state.scenario[a.id] = e.target.value / 100;
    document.getElementById(`av-${a.id}`).textContent = e.target.value + '%';
    setActivePreset(null);
    setYear(state.year, false);
  });
}
syncAssumptionUI();

const presetsEl = document.getElementById('presets');
for (const p of PRESETS) {
  const btn = document.createElement('button');
  btn.className = 'presetBtn'; btn.dataset.preset = p.id;
  btn.innerHTML = `<span class="presetName">${p.name}</span><span class="presetDesc">${p.desc}</span>`;
  btn.addEventListener('click', () => applyPreset(p));
  presetsEl.appendChild(btn);
}
function applyPreset(p) {
  state.scenario = p.values ? { ...p.values } : baseScenario();
  syncAssumptionUI();
  setActivePreset(p.id);
  setYear(state.year, false);
}
function setActivePreset(id) {
  state.activeWorldline = id;
  presetsEl.querySelectorAll('.presetBtn').forEach(b => b.classList.toggle('on', b.dataset.preset === id));
}
setActivePreset('baseline');

/* ---------------------------------------------------------------- worldlines (save/compare) */

const savedEl = document.getElementById('savedWorldlines');
function renderSaved() {
  savedEl.innerHTML = '';
  if (!state.worldlines.length) { savedEl.innerHTML = '<div class="emptyNote">No saved worldlines yet.</div>'; return; }
  state.worldlines.forEach((w, i) => {
    const row = document.createElement('div');
    row.className = 'savedRow';
    row.innerHTML = `<span>${w.name}</span><button data-i="${i}" class="loadBtn">LOAD</button><button data-i="${i}" class="delBtn">×</button>`;
    savedEl.appendChild(row);
  });
  savedEl.querySelectorAll('.loadBtn').forEach(b => b.addEventListener('click', () => {
    const w = state.worldlines[+b.dataset.i];
    state.scenario = { ...w.scenario }; syncAssumptionUI(); setActivePreset(null); setYear(w.year, false);
  }));
  savedEl.querySelectorAll('.delBtn').forEach(b => b.addEventListener('click', () => {
    state.worldlines.splice(+b.dataset.i, 1); saveWorldlines(); renderSaved();
  }));
}
document.getElementById('saveWorldline').addEventListener('click', () => {
  const name = prompt('Name this worldline:', 'Worldline ' + (state.worldlines.length + 1));
  if (!name) return;
  state.worldlines.push({ name, scenario: { ...state.scenario }, year: state.year });
  saveWorldlines(); renderSaved();
});
renderSaved();

/* ---------------------------------------------------------------- search */

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
searchInput.addEventListener('input', () => {
  const q = searchInput.value;
  if (!q) { searchResults.hidden = true; return; }
  import('./model.js').then(({ search }) => {
    const res = search(q, state.scenario, state.year);
    searchResults.innerHTML = res.map(r => `<div class="searchRow" data-kind="${r.kind}" data-id="${r.id}"><span>${r.label}</span><span class="searchSub">${r.sub}</span></div>`).join('') || '<div class="searchEmpty">No matches.</div>';
    searchResults.hidden = false;
    searchResults.querySelectorAll('.searchRow').forEach(el => el.addEventListener('click', () => {
      if (el.dataset.kind === 'region') select(REGION_BY_ID[el.dataset.id], 'region');
      else { const s = state.signals.find(x => x.id === el.dataset.id) || activeSignals(state.scenario, state.year).find(x=>x.id===el.dataset.id); if (s) { if (s.from > state.year) setYear(s.from); select(signalById(state.scenario, state.year, s.id) || s, 'signal'); } }
      searchResults.hidden = true; searchInput.value = '';
    }));
  });
});
document.addEventListener('click', e => {
  if (!e.target.closest('.searchWrap')) searchResults.hidden = true;
});

/* ---------------------------------------------------------------- accession + compare */

const accessionEl = document.getElementById('accession');
function renderAccession() {
  const sp = spaceState(state.scenario, state.year);
  accessionEl.innerHTML = sp.domains.map(d => {
    const pct = Math.round((d.reached ? (d.sustained || (d.year !== undefined ? 1 : 0)) : 0) * 100);
    return `<div class="accStep ${d.reached ? 'reached' : ''}">
      <div class="accLabel">${d.label}</div>
      <div class="accBar"><span style="width:${pct}%"></span></div>
    </div>`;
  }).join('');
}

/* ---------------------------------------------------------------- panels toggle */

document.querySelectorAll('[data-toggle]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.toggle);
    target.classList.toggle('open');
    document.querySelectorAll('[data-toggle]').forEach(b => b.classList.toggle('on', b.dataset.toggle === target.id && target.classList.contains('open')));
  });
});

/* ---------------------------------------------------------------- intro */

const intro = document.getElementById('intro');
document.getElementById('introEnter').addEventListener('click', () => {
  intro.classList.add('gone');
  setTimeout(() => intro.remove(), 900);
});

/* ---------------------------------------------------------------- boot */

async function boot() {
  try {
    geo = await loadGeo('data/geo.json');
  } catch (e) {
    console.error(e);
  }
  resize();
  setYear(state.year);
  renderAccession();
  requestAnimationFrame(t => { t0 = t / 1000; frame(t); });
}
boot();

const yearObserver = setInterval(renderAccession, 800);
