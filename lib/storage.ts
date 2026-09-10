import { FloorPlanDoc } from "./types";

const INDEX_KEY = "floorplan:index";
const DOC_PREFIX = "floorplan:doc:";

export interface SavedPlanMeta {
  id: string;
  name: string;
  updatedAt: number;
}

function readIndex(): SavedPlanMeta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as SavedPlanMeta[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(index: SavedPlanMeta[]) {
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

export function listSavedPlans(): SavedPlanMeta[] {
  return readIndex().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function savePlan(id: string, doc: FloorPlanDoc): void {
  window.localStorage.setItem(DOC_PREFIX + id, JSON.stringify(doc));
  const index = readIndex();
  const existing = index.find((p) => p.id === id);
  const meta: SavedPlanMeta = { id, name: doc.venue.name || "Untitled venue", updatedAt: Date.now() };
  if (existing) {
    Object.assign(existing, meta);
  } else {
    index.push(meta);
  }
  writeIndex(index);
}

export function loadPlan(id: string): FloorPlanDoc | null {
  try {
    const raw = window.localStorage.getItem(DOC_PREFIX + id);
    return raw ? (JSON.parse(raw) as FloorPlanDoc) : null;
  } catch {
    return null;
  }
}

export function deletePlan(id: string): void {
  window.localStorage.removeItem(DOC_PREFIX + id);
  writeIndex(readIndex().filter((p) => p.id !== id));
}
