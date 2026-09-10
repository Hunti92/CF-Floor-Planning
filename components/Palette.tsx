"use client";

import React from "react";
import { PALETTE, CATEGORY_LABELS } from "@/lib/presets";
import { PalettePreset } from "@/lib/types";

interface PaletteProps {
  onAdd: (preset: PalettePreset) => void;
}

function PresetIcon({ preset }: { preset: PalettePreset }) {
  const ratio = preset.width / preset.height;
  const w = ratio >= 1 ? 28 : 28 * ratio;
  const h = ratio >= 1 ? 28 / ratio : 28;
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" className="preset-icon-svg">
      {preset.shape === "circle" ? (
        <circle cx={16} cy={16} r={Math.min(w, h) / 2} style={{ "--obj-color": preset.color } as React.CSSProperties} className="preset-shape" />
      ) : (
        <rect
          x={16 - w / 2}
          y={16 - h / 2}
          width={w}
          height={h}
          rx={2}
          style={{ "--obj-color": preset.color } as React.CSSProperties}
          className="preset-shape"
        />
      )}
    </svg>
  );
}

export default function Palette({ onAdd }: PaletteProps) {
  const categories = Array.from(new Set(PALETTE.map((p) => p.category)));

  return (
    <aside className="palette">
      <div className="palette-header">
        <span className="palette-title">Object tray</span>
        <span className="palette-sub">Tap to place on plan</span>
      </div>
      {categories.map((cat) => (
        <div key={cat} className="palette-group">
          <div className="palette-group-label">{CATEGORY_LABELS[cat]}</div>
          <div className="palette-grid">
            {PALETTE.filter((p) => p.category === cat).map((preset, i) => (
              <button
                key={`${preset.kind}-${i}`}
                className="palette-item"
                onClick={() => onAdd(preset)}
                type="button"
              >
                <PresetIcon preset={preset} />
                <span className="palette-item-label">{preset.label}</span>
                {preset.seats ? <span className="palette-item-seats">{preset.seats}</span> : null}
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
