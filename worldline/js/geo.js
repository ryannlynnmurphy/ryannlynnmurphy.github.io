/* WORLDLINE — projection and globe
 *
 * Orthographic projection on a 2D canvas. Deliberately not a 3D engine:
 * the planet should read as a dark astronomical object with faint outlines,
 * and the complexity should come from the signals drawn on it.
 *
 * Geometry: Natural Earth 1:110m, public domain, vendored in data/geo.json.
 * `geo.lines` is the full coastline + border outline used for the base map.
 * `geo.borders` is the subset of those arcs that are actually shared between
 * two countries — i.e. real political boundaries, not coastline — recovered
 * by counting how many country polygons in the source topology reference
 * each arc. That split is what lets the border-stability overlay style only
 * real borders instead of the whole coastline.
 */

import { REGIONS } from './world.js';

const RAD = Math.PI / 180;

export async function loadGeo(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('geometry unavailable (' + res.status + ')');
  return res.json();
}

export class Camera {
  constructor() {
    this.lam0 = -20;     // rotation: longitude at centre
    this.phi0 = 18;      // rotation: latitude at centre
    this.zoom = 1;       // 1 = planet, up to 6 = local
    this.pull = 0;       // 0 = Earth fills view, 1 = pulled back to system scale
    this.cx = 0; this.cy = 0; this.R = 100;
  }

  /** Recompute screen geometry for a viewport. */
  fit(w, h) {
    const base = Math.min(w, h) * 0.38;
    this.R = base * this.zoom * (1 - 0.62 * this.pull);
    this.cx = w * 0.5 - w * 0.16 * this.pull;
    this.cy = h * 0.5 - h * 0.02;
    this.w = w; this.h = h;
    return this;
  }

  /** Project geographic coordinates. Returns {x, y, v} — v true if on the near face. */
  project(lat, lng) {
    const p = lat * RAD, l = (lng - this.lam0) * RAD;
    const p0 = this.phi0 * RAD;
    const sp = Math.sin(p), cp = Math.cos(p), cl = Math.cos(l), sl = Math.sin(l);
    const sp0 = Math.sin(p0), cp0 = Math.cos(p0);
    const cosc = sp0 * sp + cp0 * cp * cl;
    return {
      x: this.cx + this.R * cp * sl,
      y: this.cy - this.R * (cp0 * sp - sp0 * cp * cl),
      v: cosc > 0,
      c: cosc,
    };
  }

  /** Project, but fold points on the far face onto the limb — for fills. */
  projectClamped(lat, lng) {
    const q = this.project(lat, lng);
    if (q.v) return q;
    const dx = q.x - this.cx, dy = q.y - this.cy;
    const d = Math.hypot(dx, dy) || 1;
    return { x: this.cx + dx / d * this.R, y: this.cy + dy / d * this.R, v: false, c: q.c };
  }

  rotate(dx, dy) {
    const k = 0.28 / Math.max(0.55, this.zoom);
    this.lam0 -= dx * k;
    this.phi0 = Math.max(-85, Math.min(85, this.phi0 + dy * k));
    if (this.lam0 > 180) this.lam0 -= 360;
    if (this.lam0 < -180) this.lam0 += 360;
  }

  /** Rotate so a place sits at the centre of the near face. */
  lookAt(lat, lng) { this.targetLam = -lng; this.targetPhi = lat; }
  ease() {
    if (this.targetLam === undefined) return false;
    let d = this.targetLam - this.lam0;
    while (d > 180) d -= 360; while (d < -180) d += 360;
    this.lam0 += d * 0.09;
    this.phi0 += (this.targetPhi - this.phi0) * 0.09;
    if (Math.abs(d) < 0.4 && Math.abs(this.targetPhi - this.phi0) < 0.4) {
      this.targetLam = undefined; return false;
    }
    return true;
  }
}

/** Points along the great circle between two places. */
export function greatCircle(lat1, lng1, lat2, lng2, n = 40) {
  const φ1 = lat1 * RAD, λ1 = lng1 * RAD, φ2 = lat2 * RAD, λ2 = lng2 * RAD;
  const d = 2 * Math.asin(Math.sqrt(Math.sin((φ2 - φ1) / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2));
  const out = [];
  if (!d) return [[lat1, lng1], [lat2, lng2]];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    out.push([Math.atan2(z, Math.hypot(x, y)) / RAD, Math.atan2(y, x) / RAD]);
  }
  return out;
}

/* ------------------------------------------------------------- coastline retreat
 *
 * A stylised, not surveyed, coastline. We have no elevation/bathymetry data
 * (that would mean shipping a raster DEM), so retreat is approximated as an
 * inward shift of each vertex, scaled by (a) the modelled sea-level rise for
 * the current year/scenario and (b) how coastally exposed the nearest
 * declared region is (its `coast` parameter in world.js, 0–1). This is
 * honest about what it is: a legible, low-lying-areas-first visualisation
 * driven by the same sea-level number the rest of the interface uses — not
 * a claim about which specific parcel of land goes under first.
 */

const EXPOSURE_ANCHORS = REGIONS.map(r => ({ lat: r.lat, lng: r.lng, w: r.coast }));
const EXPOSURE_FALLOFF_DEG = 13;      // ~1,400km — regional, not continental, spread
const MAX_RETREAT_DEG = 2.0;          // upper bound at full exposure + full sea-level norm
const SEA_LEVEL_NORM_M = 15;          // metres of modelled rise mapped to "1.0" of the scale

function vertexExposure(lng, lat) {
  let best = 0;
  for (const a of EXPOSURE_ANCHORS) {
    if (a.w <= 0.02) continue;
    const dLat = lat - a.lat, dLng = (lng - a.lng) * Math.cos(lat * RAD);
    const d = Math.sqrt(dLat * dLat + dLng * dLng);
    const v = a.w * Math.exp(-d / EXPOSURE_FALLOFF_DEG);
    if (v > best) best = v;
  }
  return best;
}

function ringSignedArea(ring) {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i], [x2, y2] = ring[(i + 1) % ring.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

/** Erode land rings inward. `seaLevel` is metres above the 2000 baseline. */
export function erodeLand(landRings, seaLevel) {
  const norm = Math.max(0, Math.min(1, seaLevel / SEA_LEVEL_NORM_M));
  if (norm < 0.004) return landRings;
  return landRings.map(ring => {
    const n = ring.length;
    if (n < 4) return ring;
    const inward = ringSignedArea(ring) >= 0 ? 1 : -1;   // sign of the left-hand normal
    const out = new Array(n);
    for (let i = 0; i < n; i++) {
      const [lng, lat] = ring[i];
      const [plng, plat] = ring[(i - 1 + n) % n];
      const [nlng, nlat] = ring[(i + 1) % n];
      let tx = nlng - plng, ty = nlat - plat;
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl; ty /= tl;
      const nx = -ty * inward, ny = tx * inward;   // left-hand normal, sign-corrected
      const shift = norm * vertexExposure(lng, lat) * MAX_RETREAT_DEG;
      out[i] = [lng + nx * shift, lat + ny * shift];
    }
    return out;
  });
}

/* ------------------------------------------------------------- graticule */

const GRATICULE = (() => {
  const lines = [];
  for (let lng = -180; lng < 180; lng += 30) {
    const l = [];
    for (let lat = -80; lat <= 80; lat += 5) l.push([lat, lng]);
    lines.push(l);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const l = [];
    for (let lng = -180; lng <= 180; lng += 5) l.push([lat, lng]);
    lines.push(l);
  }
  return lines;
})();

/* ---------------------------------------------------------------- draw */

function strokeVisible(ctx, cam, pts, swapped) {
  let open = false;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const q = swapped ? cam.project(a[1], a[0]) : cam.project(a[0], a[1]);
    if (q.v) {
      if (!open) { ctx.moveTo(q.x, q.y); open = true; }
      else ctx.lineTo(q.x, q.y);
    } else open = false;
  }
}

export function drawGlobe(ctx, cam, geo, theme, erodedLand) {
  const { cx, cy, R } = cam;
  const landRings = erodedLand || geo.land;
  const retreating = erodedLand && erodedLand !== geo.land;

  // Ocean body — a dark object, lit faintly from the upper left.
  const g = ctx.createRadialGradient(cx - R * 0.42, cy - R * 0.45, R * 0.06, cx, cy, R * 1.02);
  g.addColorStop(0, theme.oceanHi);
  g.addColorStop(0.55, theme.ocean);
  g.addColorStop(1, theme.oceanLo);
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();

  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();

  // Land — very slightly raised from the ocean, no borders in the fill pass.
  // Under a retreated coastline, land uses the modelled (eroded) rings.
  ctx.beginPath();
  for (const ring of landRings) {
    for (let i = 0; i < ring.length; i++) {
      const q = cam.projectClamped(ring[i][1], ring[i][0]);
      if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
    }
    ctx.closePath();
  }
  ctx.fillStyle = theme.land;
  ctx.fill('evenodd');

  // Where the coastline has retreated, show today's line as a ghost —
  // the gap between the two is what has been lost.
  if (retreating) {
    ctx.beginPath();
    for (const ring of geo.land) {
      for (let i = 0; i < ring.length; i++) {
        const q = cam.projectClamped(ring[i][1], ring[i][0]);
        if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
      }
      ctx.closePath();
    }
    ctx.strokeStyle = theme.retreatGhost;
    ctx.setLineDash([1.2, 2.4]); ctx.lineWidth = 0.6; ctx.stroke(); ctx.setLineDash([]);
  }

  // Graticule beneath the outlines.
  ctx.beginPath();
  for (const l of GRATICULE) strokeVisible(ctx, cam, l, false);
  ctx.strokeStyle = theme.grat; ctx.lineWidth = 0.5; ctx.stroke();

  // Political and coastal outlines.
  ctx.beginPath();
  for (const l of geo.lines) strokeVisible(ctx, cam, l, true);
  ctx.strokeStyle = theme.outline;
  ctx.lineWidth = cam.zoom > 2 ? 0.75 : 0.55;
  ctx.stroke();

  ctx.restore();

  // Limb.
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = theme.limb; ctx.lineWidth = 0.8; ctx.stroke();
}

/**
 * Border-stability overlay: real political-border arcs only (see the note
 * at the top of this file), styled by how contested the ground either side
 * of them is right now. `stabilityFn(midLat, midLng)` returns 0 (stable) to
 * 1 (actively contested) and is supplied by the caller — this file only
 * draws, it never decides what a border is worth.
 */
export function drawBorders(ctx, cam, geo, stabilityFn, theme, t) {
  for (const seg of geo.borders) {
    const midI = Math.floor(seg.length / 2);
    const [midLng, midLat] = seg[midI];
    const s = stabilityFn(midLat, midLng);

    ctx.beginPath();
    strokeVisible(ctx, cam, seg, true);
    if (s < 0.16) {
      ctx.strokeStyle = theme.borderStable;
      ctx.lineWidth = 0.55;
      ctx.stroke();
    } else {
      const pulse = 0.7 + 0.3 * Math.sin(t * 1.6 + midLat * 0.3);
      ctx.strokeStyle = `rgba(196,88,74,${(0.18 + 0.55 * s) * pulse})`;
      ctx.lineWidth = 0.6 + 1.6 * s;
      ctx.stroke();
    }
  }
}

/** Faint atmospheric halo — drawn under the planet, only when pulled back. */
export function drawHalo(ctx, cam, theme, strength = 1) {
  const { cx, cy, R } = cam;
  const g = ctx.createRadialGradient(cx, cy, R * 0.98, cx, cy, R * 1.5);
  g.addColorStop(0, theme.halo);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = strength;
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = g; ctx.fill();
  ctx.globalAlpha = 1;
}
