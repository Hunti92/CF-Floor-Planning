export const FT_PER_M = 3.28084;

export function ftToDisplay(ft: number, unit: "ft" | "m"): number {
  return unit === "m" ? ft / FT_PER_M : ft;
}

export function displayToFt(val: number, unit: "ft" | "m"): number {
  return unit === "m" ? val * FT_PER_M : val;
}

export function snapVal(val: number, step: number, enabled: boolean): number {
  if (!enabled || step <= 0) return val;
  return Math.round(val / step) * step;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export function genId(prefix = "obj"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// Rotate a point (px, py) around origin (ox, oy) by degrees.
export function rotatePoint(px: number, py: number, ox: number, oy: number, deg: number) {
  const rad = toRad(deg);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = px - ox;
  const dy = py - oy;
  return {
    x: ox + dx * cos - dy * sin,
    y: oy + dx * sin + dy * cos,
  };
}

export function formatFeetInches(ft: number): string {
  const totalInches = Math.round(ft * 12);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return inches === 0 ? `${feet}'` : `${feet}'${inches}"`;
}

export interface Pt {
  x: number;
  y: number;
}

// Corners of an object's (rotated) bounding box, in world (feet) coordinates.
export function getOBBCorners(cx: number, cy: number, w: number, h: number, rotationDeg: number): Pt[] {
  const hw = w / 2;
  const hh = h / 2;
  const local: Pt[] = [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh },
  ];
  return local.map((p) => rotatePoint(p.x, p.y, 0, 0, rotationDeg)).map((p) => ({ x: p.x + cx, y: p.y + cy }));
}

function project(corners: Pt[], axis: Pt): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const c of corners) {
    const val = c.x * axis.x + c.y * axis.y;
    if (val < min) min = val;
    if (val > max) max = val;
  }
  return [min, max];
}

function edgeAxes(corners: Pt[]): Pt[] {
  const axes: Pt[] = [];
  for (let i = 0; i < corners.length; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % corners.length];
    const edge = { x: b.x - a.x, y: b.y - a.y };
    const len = Math.hypot(edge.x, edge.y) || 1;
    axes.push({ x: -edge.y / len, y: edge.x / len });
  }
  return axes;
}

// Separating Axis Theorem test between two rotated rectangles.
export function obbsOverlap(cornersA: Pt[], cornersB: Pt[]): boolean {
  const axes = [...edgeAxes(cornersA), ...edgeAxes(cornersB)];
  for (const axis of axes) {
    const [minA, maxA] = project(cornersA, axis);
    const [minB, maxB] = project(cornersB, axis);
    if (maxA < minB || maxB < minA) return false;
  }
  return true;
}
