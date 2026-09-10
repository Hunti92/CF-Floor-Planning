export type ObjectShape = "rect" | "circle" | "ellipse";

export type ObjectKind =
  | "round-table"
  | "rect-table"
  | "long-table"
  | "cocktail-table"
  | "stage"
  | "bar"
  | "sofa"
  | "dj-booth"
  | "dance-floor"
  | "entrance"
  | "bar-stool-cluster"
  | "lounge-chair"
  | "custom";

export interface PlacedObject {
  id: string;
  kind: ObjectKind;
  label: string;
  shape: ObjectShape;
  x: number; // feet, CENTER of object, in venue coordinate space
  y: number; // feet, CENTER of object
  width: number; // feet
  height: number; // feet
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

export interface PalettePreset {
  kind: ObjectKind;
  label: string;
  shape: ObjectShape;
  width: number;
  height: number;
  seats?: number;
  color: string;
  category: "seating" | "production" | "service" | "layout";
}
