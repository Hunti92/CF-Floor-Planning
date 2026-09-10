import { PlacedObject } from "./types";
import { getOBBCorners, obbsOverlap } from "./geometry";

// Kinds excluded from collision checking: wall-mounted openings and free text
// annotations aren't meant to be "clear floor space", so flagging them as
// overlaps would just be noise.
const EXCLUDED_KINDS = new Set(["door-single", "door-double", "window", "text-label"]);

export function computeOverlaps(objects: PlacedObject[]): Set<string> {
  const flagged = new Set<string>();
  const relevant = objects.filter((o) => !EXCLUDED_KINDS.has(o.kind) && o.shape !== "text");
  for (let i = 0; i < relevant.length; i++) {
    for (let j = i + 1; j < relevant.length; j++) {
      const a = relevant[i];
      const b = relevant[j];
      const cornersA = getOBBCorners(a.x, a.y, a.width, a.height, a.rotation);
      const cornersB = getOBBCorners(b.x, b.y, b.width, b.height, b.rotation);
      if (obbsOverlap(cornersA, cornersB)) {
        flagged.add(a.id);
        flagged.add(b.id);
      }
    }
  }
  return flagged;
}
