"use client";

import React from "react";
import { PlacedObject, VenueSpec } from "@/lib/types";
import { ftToDisplay, displayToFt } from "@/lib/geometry";
import { COLOR_SWATCHES } from "@/lib/presets";

interface PropertiesPanelProps {
  venue: VenueSpec;
  objects: PlacedObject[];
  selected: PlacedObject | null;
  overlapCount: number;
  onChange: (id: string, patch: Partial<PlacedObject>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const DOOR_OR_WINDOW = new Set(["door-single", "door-double", "window"]);

export default function PropertiesPanel({
  venue,
  objects,
  selected,
  overlapCount,
  onChange,
  onDelete,
  onDuplicate,
}: PropertiesPanelProps) {
  const totalSeats = objects.reduce((sum, o) => sum + (o.seats || 0), 0);
  const unit = venue.unit;

  if (!selected) {
    const counts: Record<string, number> = {};
    objects.forEach((o) => {
      counts[o.label] = (counts[o.label] || 0) + 1;
    });
    return (
      <aside className="properties">
        <div className="properties-header">
          <span className="palette-title">Plan summary</span>
        </div>
        <div className="summary-block">
          <div className="summary-row">
            <span>Objects placed</span>
            <strong>{objects.length}</strong>
          </div>
          <div className="summary-row">
            <span>Total seats</span>
            <strong>{totalSeats}</strong>
          </div>
          <div className={overlapCount > 0 ? "summary-row summary-row-warning" : "summary-row"}>
            <span>Overlapping items</span>
            <strong>{overlapCount}</strong>
          </div>
        </div>
        {overlapCount > 0 && (
          <p className="properties-warning">
            Some pieces are overlapping — this usually means tight or blocked walkways. Select a flagged item
            (outlined in red on the plan) to move or resize it.
          </p>
        )}
        {Object.keys(counts).length > 0 && (
          <div className="summary-list">
            {Object.entries(counts).map(([label, count]) => (
              <div key={label} className="summary-list-row">
                <span>{label}</span>
                <span>× {count}</span>
              </div>
            ))}
          </div>
        )}
        <p className="properties-hint">Select an object on the plan to edit its size, rotation and label.</p>
      </aside>
    );
  }

  const isText = selected.shape === "text";
  const isOpening = DOOR_OR_WINDOW.has(selected.kind);
  const disp = (ft: number) => Math.round(ftToDisplay(ft, unit) * 100) / 100;

  return (
    <aside className="properties">
      <div className="properties-header">
        <span className="palette-title">Object properties</span>
      </div>

      <label className="field">
        <span>{isText ? "Text" : "Label"}</span>
        {isText ? (
          <textarea
            value={selected.label}
            rows={3}
            onChange={(e) => onChange(selected.id, { label: e.target.value })}
          />
        ) : (
          <input
            type="text"
            value={selected.label}
            onChange={(e) => onChange(selected.id, { label: e.target.value })}
          />
        )}
      </label>

      {isText ? (
        <label className="field">
          <span>Font size ({unit})</span>
          <input
            type="number"
            step="0.1"
            min="0.2"
            value={disp(selected.height)}
            onChange={(e) => onChange(selected.id, { height: displayToFt(parseFloat(e.target.value) || 0.2, unit) })}
          />
        </label>
      ) : (
        <div className="field-row">
          <label className="field">
            <span>{isOpening ? `Opening width (${unit})` : `Width (${unit})`}</span>
            <input
              type="number"
              step="0.1"
              value={disp(selected.width)}
              onChange={(e) => onChange(selected.id, { width: displayToFt(parseFloat(e.target.value) || 0, unit) })}
            />
          </label>
          {!isOpening && (
            <label className="field">
              <span>Depth ({unit})</span>
              <input
                type="number"
                step="0.1"
                value={disp(selected.height)}
                onChange={(e) => onChange(selected.id, { height: displayToFt(parseFloat(e.target.value) || 0, unit) })}
              />
            </label>
          )}
        </div>
      )}

      <div className="field-row">
        <label className="field">
          <span>Rotation (°)</span>
          <input
            type="number"
            step="15"
            value={Math.round(selected.rotation)}
            onChange={(e) => onChange(selected.id, { rotation: parseFloat(e.target.value) || 0 })}
          />
        </label>
        {!isText && !isOpening && (
          <label className="field">
            <span>Seats</span>
            <input
              type="number"
              step="1"
              min="0"
              value={selected.seats || 0}
              onChange={(e) => onChange(selected.id, { seats: parseInt(e.target.value, 10) || 0 })}
            />
          </label>
        )}
      </div>

      <div className="field">
        <span>Color</span>
        <div className="swatch-row">
          {COLOR_SWATCHES.map((sw) => (
            <button
              key={sw.value}
              type="button"
              title={sw.label}
              className={selected.color === sw.value ? "swatch swatch-active" : "swatch"}
              style={{ "--sw": sw.value } as React.CSSProperties}
              onClick={() => onChange(selected.id, { color: sw.value })}
            />
          ))}
        </div>
      </div>

      <label className="field-checkbox">
        <input
          type="checkbox"
          checked={!!selected.locked}
          onChange={(e) => onChange(selected.id, { locked: e.target.checked })}
        />
        <span>Lock position</span>
      </label>

      <div className="properties-actions">
        <button type="button" className="btn-secondary" onClick={() => onDuplicate(selected.id)}>
          Duplicate
        </button>
        <button type="button" className="btn-danger" onClick={() => onDelete(selected.id)}>
          Delete
        </button>
      </div>
    </aside>
  );
}
