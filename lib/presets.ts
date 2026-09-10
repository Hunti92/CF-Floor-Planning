import { PalettePreset, PresetCategory } from "./types";

// Dimensions in feet. Colors are stroke/accent colors; fills are derived at render time.
export const PALETTE: PalettePreset[] = [
  // Seating
  { kind: "round-table", label: "Round table (60\")", shape: "circle", width: 5, height: 5, seats: 8, color: "#C4922E", category: "seating" },
  { kind: "round-table", label: "Round table (72\")", shape: "circle", width: 6, height: 6, seats: 10, color: "#C4922E", category: "seating" },
  { kind: "oval-table", label: "Oval table", shape: "ellipse", width: 8, height: 4.5, seats: 10, color: "#C4922E", category: "seating" },
  { kind: "rect-table", label: "Rectangular table", shape: "rect", width: 6, height: 3, seats: 8, color: "#C4922E", category: "seating" },
  { kind: "long-table", label: "Banquet table (long)", shape: "rect", width: 8, height: 2.5, seats: 10, color: "#C4922E", category: "seating" },
  { kind: "cocktail-table", label: "Cocktail table", shape: "circle", width: 2.5, height: 2.5, seats: 0, color: "#C4922E", category: "seating" },
  { kind: "sofa", label: "Sofa", shape: "rect", width: 6, height: 2.5, seats: 3, color: "#B8763F", category: "seating" },
  { kind: "lounge-chair", label: "Lounge chair", shape: "rect", width: 2.5, height: 2.5, seats: 1, color: "#B8763F", category: "seating" },

  // Production
  { kind: "stage", label: "Stage", shape: "rect", width: 16, height: 12, seats: 0, color: "#6E4B6E", category: "production" },
  { kind: "dj-booth", label: "DJ booth", shape: "rect", width: 6, height: 4, seats: 0, color: "#6E4B6E", category: "production" },
  { kind: "backdrop", label: "Photo backdrop", shape: "rect", width: 10, height: 1, seats: 0, color: "#6E4B6E", category: "production" },

  // Service
  { kind: "bar", label: "Bar (straight)", shape: "rect", width: 10, height: 3, seats: 0, color: "#3E7C7C", category: "service" },
  { kind: "curved-bar", label: "Bar (curved)", shape: "ellipse", width: 12, height: 5, seats: 0, color: "#3E7C7C", category: "service" },
  { kind: "bar-stool-cluster", label: "Bar stools (x4)", shape: "rect", width: 4, height: 2, seats: 4, color: "#3E7C7C", category: "service" },
  { kind: "buffet", label: "Buffet / food station", shape: "rect", width: 8, height: 2.5, seats: 0, color: "#3E7C7C", category: "service" },

  // Layout
  { kind: "dance-floor", label: "Dance floor", shape: "rect", width: 18, height: 18, seats: 0, color: "#7A9B6E", category: "layout" },
  { kind: "entrance", label: "Entrance / exit marker", shape: "rect", width: 4, height: 1, seats: 0, color: "#7A9B6E", category: "layout" },
  { kind: "registration", label: "Registration / check-in", shape: "rect", width: 6, height: 2.5, seats: 0, color: "#7A9B6E", category: "layout" },
  { kind: "coat-check", label: "Coat check", shape: "rect", width: 5, height: 2.5, seats: 0, color: "#7A9B6E", category: "layout" },
  { kind: "gift-table", label: "Gift / card table", shape: "rect", width: 4, height: 2.5, seats: 0, color: "#7A9B6E", category: "layout" },

  // Openings — placed near a wall, they snap onto it automatically
  { kind: "door-single", label: "Single door", shape: "rect", width: 3, height: 0.3, seats: 0, color: "#14213D", category: "openings" },
  { kind: "door-double", label: "Double door", shape: "rect", width: 6, height: 0.3, seats: 0, color: "#14213D", category: "openings" },
  { kind: "window", label: "Window", shape: "rect", width: 4, height: 0.3, seats: 0, color: "#2E5C8A", category: "openings" },

  // Annotations
  { kind: "text-label", label: "Text label", shape: "text", width: 6, height: 1, seats: 0, color: "#2B2A26", category: "annotations" },
];

export const CATEGORY_LABELS: Record<PresetCategory, string> = {
  seating: "Seating",
  production: "Stage & production",
  service: "Bar & service",
  layout: "Layout markers",
  openings: "Doors & windows",
  annotations: "Text & labels",
};

export const COLOR_SWATCHES: { label: string; value: string }[] = [
  { label: "Amber", value: "#C4922E" },
  { label: "Plum", value: "#6E4B6E" },
  { label: "Teal", value: "#3E7C7C" },
  { label: "Sage", value: "#7A9B6E" },
  { label: "Ink", value: "#14213D" },
  { label: "Blueprint", value: "#2E5C8A" },
  { label: "Graphite", value: "#2B2A26" },
  { label: "Danger", value: "#B0473F" },
];
