"use client";

import React, { useRef, useCallback } from "react";
import { PlacedObject, VenueSpec } from "@/lib/types";
import { snapVal, clamp, toRad, formatFeetInches } from "@/lib/geometry";

interface CanvasProps {
  venue: VenueSpec;
  objects: PlacedObject[];
  selectedId: string | null;
  gridSnap: boolean;
  zoom: number; // pixels per foot
  overlappingIds: Set<string>;
  onSelect: (id: string | null) => void;
  onChangeObject: (id: string, patch: Partial<PlacedObject>) => void;
  onCommit: () => void; // called on pointerup to push undo/save state
}

const SNAP_STEP = 0.5; // feet
const ROTATE_SNAP = 15; // degrees
const MARGIN = 3; // feet of ruler margin around venue
const WALL_SNAP_DIST = 2.5; // feet — how close a door/window must be to a wall to snap onto it

const DOOR_KINDS = new Set(["door-single", "door-double"]);
const WALL_MOUNTED_KINDS = new Set(["door-single", "door-double", "window"]);

type DragState =
  | { type: "move"; id: string; offsetX: number; offsetY: number }
  | { type: "resize"; id: string; corner: "nw" | "ne" | "sw" | "se" }
  | { type: "rotate"; id: string };

// Standard architectural door swing symbol, drawn in the object's local
// (unrotated) frame with the opening centered on the x-axis at y=0.
function DoorSymbol({ halfW, double: isDouble }: { halfW: number; double: boolean }) {
  if (!isDouble) {
    const r = halfW * 2;
    return (
      <>
        <line x1={-halfW} y1={0} x2={-halfW} y2={-r} className="door-leaf" />
        <path d={`M ${-halfW} ${-r} A ${r} ${r} 0 0 1 ${halfW} 0`} className="door-arc" />
        <line x1={-halfW} y1={-0.18} x2={-halfW} y2={0.18} className="door-jamb" />
        <line x1={halfW} y1={-0.18} x2={halfW} y2={0.18} className="door-jamb" />
      </>
    );
  }
  const r = halfW;
  return (
    <>
      <line x1={-halfW} y1={0} x2={-halfW} y2={-r} className="door-leaf" />
      <path d={`M ${-halfW} ${-r} A ${r} ${r} 0 0 1 0 0`} className="door-arc" />
      <line x1={halfW} y1={0} x2={halfW} y2={-r} className="door-leaf" />
      <path d={`M ${halfW} ${-r} A ${r} ${r} 0 0 0 0 0`} className="door-arc" />
      <line x1={-halfW} y1={-0.18} x2={-halfW} y2={0.18} className="door-jamb" />
      <line x1={halfW} y1={-0.18} x2={halfW} y2={0.18} className="door-jamb" />
    </>
  );
}

function WindowSymbol({ halfW }: { halfW: number }) {
  return (
    <>
      <line x1={-halfW} y1={-0.13} x2={halfW} y2={-0.13} className="window-line" />
      <line x1={-halfW} y1={0.13} x2={halfW} y2={0.13} className="window-line" />
      <line x1={-halfW} y1={0} x2={halfW} y2={0} className="window-line-thin" />
      <line x1={-halfW} y1={-0.18} x2={-halfW} y2={0.18} className="door-jamb" />
      <line x1={halfW} y1={-0.18} x2={halfW} y2={0.18} className="door-jamb" />
    </>
  );
}

export default function Canvas({
  venue,
  objects,
  selectedId,
  gridSnap,
  zoom,
  overlappingIds,
  onSelect,
  onChangeObject,
  onCommit,
}: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const toSvgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const transformed = pt.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const obj = objects.find((o) => o.id === drag.id);
      if (!obj) return;
      const p = toSvgPoint(e.clientX, e.clientY);

      if (drag.type === "move") {
        let nx = p.x - drag.offsetX;
        let ny = p.y - drag.offsetY;
        nx = snapVal(nx, SNAP_STEP, gridSnap);
        ny = snapVal(ny, SNAP_STEP, gridSnap);

        if (WALL_MOUNTED_KINDS.has(obj.kind)) {
          const dLeft = Math.abs(nx - 0);
          const dRight = Math.abs(nx - venue.widthFt);
          const dTop = Math.abs(ny - 0);
          const dBottom = Math.abs(ny - venue.heightFt);
          const minD = Math.min(dLeft, dRight, dTop, dBottom);
          if (minD < WALL_SNAP_DIST) {
            let rotation = obj.rotation;
            if (minD === dLeft) {
              nx = 0;
              rotation = 90;
            } else if (minD === dRight) {
              nx = venue.widthFt;
              rotation = 90;
            } else if (minD === dTop) {
              ny = 0;
              rotation = 0;
            } else {
              ny = venue.heightFt;
              rotation = 0;
            }
            onChangeObject(obj.id, { x: nx, y: ny, rotation });
            return;
          }
        }
        onChangeObject(obj.id, { x: nx, y: ny });
      } else if (drag.type === "resize") {
        const rad = toRad(-obj.rotation);
        const dx = p.x - obj.x;
        const dy = p.y - obj.y;
        const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
        const localY = dx * Math.sin(rad) + dy * Math.cos(rad);
        const isText = obj.shape === "text";
        let newW = clamp(Math.abs(localX) * 2, 1, 60);
        let newH = clamp(Math.abs(localY) * 2, isText ? 0.3 : 1, isText ? 5 : 60);
        newW = snapVal(newW, SNAP_STEP, gridSnap);
        newH = isText ? Math.round(newH * 20) / 20 : snapVal(newH, SNAP_STEP, gridSnap);
        onChangeObject(obj.id, { width: newW, height: newH });
      } else if (drag.type === "rotate") {
        const dx = p.x - obj.x;
        const dy = p.y - obj.y;
        let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        angle = ((angle % 360) + 360) % 360;
        angle = Math.round(angle / ROTATE_SNAP) * ROTATE_SNAP;
        onChangeObject(obj.id, { rotation: angle });
      }
    },
    [objects, gridSnap, onChangeObject, toSvgPoint, venue.widthFt, venue.heightFt]
  );

  const endDrag = useCallback(() => {
    if (dragRef.current) {
      dragRef.current = null;
      onCommit();
    }
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", endDrag);
  }, [handlePointerMove, onCommit]);

  const startDrag = (drag: DragState) => {
    dragRef.current = drag;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endDrag);
  };

  const onObjectPointerDown = (e: React.PointerEvent, obj: PlacedObject) => {
    e.stopPropagation();
    if (obj.locked) {
      onSelect(obj.id);
      return;
    }
    onSelect(obj.id);
    const p = toSvgPoint(e.clientX, e.clientY);
    startDrag({ type: "move", id: obj.id, offsetX: p.x - obj.x, offsetY: p.y - obj.y });
  };

  const onHandlePointerDown = (e: React.PointerEvent, obj: PlacedObject, corner: "nw" | "ne" | "sw" | "se") => {
    e.stopPropagation();
    startDrag({ type: "resize", id: obj.id, corner });
  };

  const onRotateHandlePointerDown = (e: React.PointerEvent, obj: PlacedObject) => {
    e.stopPropagation();
    startDrag({ type: "rotate", id: obj.id });
  };

  const vbX = -MARGIN;
  const vbY = -MARGIN;
  const vbW = venue.widthFt + MARGIN * 2;
  const vbH = venue.heightFt + MARGIN * 2;

  const gridLines: JSX.Element[] = [];
  for (let x = 0; x <= venue.widthFt; x += 1) {
    const major = x % 5 === 0;
    gridLines.push(
      <line
        key={`v${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={venue.heightFt}
        className={major ? "grid-line-major" : "grid-line-minor"}
      />
    );
  }
  for (let y = 0; y <= venue.heightFt; y += 1) {
    const major = y % 5 === 0;
    gridLines.push(
      <line
        key={`h${y}`}
        x1={0}
        y1={y}
        x2={venue.widthFt}
        y2={y}
        className={major ? "grid-line-major" : "grid-line-minor"}
      />
    );
  }

  const rulerTicksX: JSX.Element[] = [];
  for (let x = 0; x <= venue.widthFt; x += 5) {
    rulerTicksX.push(
      <text key={`rx${x}`} x={x} y={-0.6} className="ruler-label" textAnchor="middle">
        {x}
      </text>
    );
  }
  const rulerTicksY: JSX.Element[] = [];
  for (let y = 0; y <= venue.heightFt; y += 5) {
    rulerTicksY.push(
      <text key={`ry${y}`} x={-0.6} y={y} className="ruler-label" textAnchor="end" dominantBaseline="middle">
        {y}
      </text>
    );
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width={vbW * zoom}
      height={vbH * zoom}
      className="fp-canvas"
      onPointerDown={() => onSelect(null)}
    >
      <rect x={vbX} y={vbY} width={vbW} height={vbH} className="canvas-bg" />
      <rect x={0} y={0} width={venue.widthFt} height={venue.heightFt} className="venue-bounds" />
      {gridLines}
      {rulerTicksX}
      {rulerTicksY}

      {objects.map((obj) => {
        const isSelected = obj.id === selectedId;
        const halfW = obj.width / 2;
        const halfH = obj.height / 2;
        const isText = obj.shape === "text";
        const isDoor = DOOR_KINDS.has(obj.kind);
        const isWindow = obj.kind === "window";
        const isOpening = isDoor || isWindow;
        const isOverlapping = overlappingIds.has(obj.id);
        const lines = isText ? obj.label.split("\n") : [obj.label];

        return (
          <g
            key={obj.id}
            transform={`translate(${obj.x} ${obj.y}) rotate(${obj.rotation})`}
            onPointerDown={(e) => onObjectPointerDown(e, obj)}
            style={{ cursor: obj.locked ? "not-allowed" : "grab" }}
          >
            {isOverlapping && !isText && (
              <rect
                x={-halfW - 0.35}
                y={-halfH - 0.35}
                width={obj.width + 0.7}
                height={obj.height + 0.7}
                rx={0.3}
                className="overlap-flag"
              />
            )}

            {isText ? (
              <>
                <rect x={-halfW} y={-halfH} width={obj.width} height={obj.height} fill="transparent" />
                <text textAnchor="middle" fontSize={obj.height} className="free-text" fill={obj.color}>
                  {lines.map((line, i) => (
                    <tspan key={i} x={0} y={(i - (lines.length - 1) / 2) * obj.height * 1.2 + obj.height * 0.32}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </>
            ) : isOpening ? (
              <>
                <rect x={-halfW} y={-0.09} width={obj.width} height={0.18} className="wall-break" />
                {isDoor ? (
                  <DoorSymbol halfW={halfW} double={obj.kind === "door-double"} />
                ) : (
                  <WindowSymbol halfW={halfW} />
                )}
              </>
            ) : obj.shape === "circle" ? (
              <circle r={halfW} className="fp-object" style={{ "--obj-color": obj.color } as React.CSSProperties} />
            ) : obj.shape === "ellipse" ? (
              <ellipse
                rx={halfW}
                ry={halfH}
                className="fp-object"
                style={{ "--obj-color": obj.color } as React.CSSProperties}
              />
            ) : (
              <rect
                x={-halfW}
                y={-halfH}
                width={obj.width}
                height={obj.height}
                rx={Math.min(0.25, halfH * 0.3)}
                className="fp-object"
                style={{ "--obj-color": obj.color } as React.CSSProperties}
              />
            )}

            {!isText && !isOpening && (
              <text y={0.13} textAnchor="middle" className="obj-label">
                {obj.label}
              </text>
            )}
            {!isText && !isOpening && obj.seats ? (
              <text y={halfH > 1 ? 0.7 : halfH + 0.6} textAnchor="middle" className="obj-seats">
                {obj.seats} seats
              </text>
            ) : null}

            {isSelected && (
              <>
                {!isText && (
                  <rect
                    x={-halfW - 0.3}
                    y={-halfH - 0.3}
                    width={obj.width + 0.6}
                    height={obj.height + 0.6}
                    className="selection-outline"
                  />
                )}
                {!obj.locked && (
                  <>
                    <line x1={0} y1={-halfH - 0.3} x2={0} y2={-halfH - 1.4} className="rotate-stem" />
                    <circle
                      cx={0}
                      cy={-halfH - 1.6}
                      r={0.35}
                      className="rotate-handle"
                      onPointerDown={(e) => onRotateHandlePointerDown(e, obj)}
                    />
                    {(["nw", "ne", "sw", "se"] as const).map((corner) => {
                      const cx = corner.includes("w") ? -halfW : halfW;
                      const cy = corner.includes("n") ? -halfH : halfH;
                      return (
                        <rect
                          key={corner}
                          x={cx - 0.28}
                          y={cy - 0.28}
                          width={0.56}
                          height={0.56}
                          className="resize-handle"
                          onPointerDown={(e) => onHandlePointerDown(e, obj, corner)}
                        />
                      );
                    })}
                  </>
                )}
                {!isText && (
                  <text x={0} y={halfH + 1.1} textAnchor="middle" className="dim-label">
                    {isOpening ? `${formatFeetInches(obj.width)} opening` : `${formatFeetInches(obj.width)} × ${formatFeetInches(obj.height)}`}
                  </text>
                )}
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
