export type ObjectShape = "rect" | "circle" | "ellipse" | "text";

export type ObjectKind =
  | "round-table"
  | "oval-table"
  | "rect-table"
  | "long-table"
  | "cocktail-table"
  | "stage"
  | "bar"
  | "curved-bar"
  | "buffet"
  | "sofa"
  | "dj-booth"
  | "dance-floor"
  | "entrance"
  | "bar-stool-cluster"
  | "lounge-chair"
  | "registration"
  | "coat-check"
  | "gift-table"
  | "backdrop"
  | "door-single"
  | "door-double"
  | "window"
  | "text-label"
  | "custom";

export interface PlacedObject {
  id: string;
  kind: ObjectKind;
  label: string;
  shape: ObjectShape;
  x: number; // feet, CENTER of object, in venue coordinate space
  y: number; // feet, CENTER of object
  width: number; // feet (for text: bounding box width, used as click target)
  height: number; // feet (for text: font size)
  rotation: number; // degrees
  seats?: number;
  color: string;
  locked?: boolean;
}

export interface VenueSpec {
  name: string;
  widthFt: number;
  heightFt: number;
  unit: "ft" | "m";
}

export interface FloorPlanDoc {
  venue: VenueSpec;
  objects: PlacedObject[];
}

export type PresetCategory = "seating" | "production" | "service" | "layout" | "openings" | "annotations";

export interface PalettePreset {
  kind: ObjectKind;
  label: string;
  shape: ObjectShape;
  width: number;
  height: number;
  seats?: number;
  color: string;
  category: PresetCategory;
}
