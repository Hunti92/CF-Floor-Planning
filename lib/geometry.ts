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
