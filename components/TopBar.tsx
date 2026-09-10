"use client";

import React, { useRef, useState } from "react";
import { VenueSpec } from "@/lib/types";
import { ftToDisplay, displayToFt } from "@/lib/geometry";
import { SavedPlanMeta } from "@/lib/storage";

interface TopBarProps {
  venue: VenueSpec;
  onVenueChange: (patch: Partial<VenueSpec>) => void;
  gridSnap: boolean;
  onToggleSnap: () => void;
  zoom: number;
  onZoomChange: (z: number) => void;
  savedPlans: SavedPlanMeta[];
  onSave: () => void;
  onLoad: (id: string) => void;
  onDeletePlan: (id: string) => void;
  onNew: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
}

export default function TopBar({
  venue,
  onVenueChange,
  gridSnap,
  onToggleSnap,
  zoom,
  onZoomChange,
  savedPlans,
  onSave,
  onLoad,
  onDeletePlan,
  onNew,
  onExportPng,
  onExportJson,
  onImportJson,
}: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const unit = venue.unit;
  const disp = (ft: number) => Math.round(ftToDisplay(ft, unit) * 100) / 100;

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="brand-mark">◈</span>
        <input
          className="venue-name-input"
          value={venue.name}
          onChange={(e) => onVenueChange({ name: e.target.value })}
          placeholder="Venue name"
        />
      </div>

      <div className="topbar-dims">
        <label className="dim-field">
          <span>W</span>
          <input
            type="number"
            step="0.5"
            value={disp(venue.widthFt)}
            onChange={(e) => onVenueChange({ widthFt: displayToFt(parseFloat(e.target.value) || 0, unit) })}
          />
        </label>
        <span className="dim-x">×</span>
        <label className="dim-field">
          <span>D</span>
          <input
            type="number"
            step="0.5"
            value={disp(venue.heightFt)}
            onChange={(e) => onVenueChange({ heightFt: displayToFt(parseFloat(e.target.value) || 0, unit) })}
          />
        </label>
        <div className="unit-toggle">
          <button
            type="button"
            className={unit === "ft" ? "unit-btn active" : "unit-btn"}
            onClick={() => onVenueChange({ unit: "ft" })}
          >
            ft
          </button>
          <button
            type="button"
            className={unit === "m" ? "unit-btn active" : "unit-btn"}
            onClick={() => onVenueChange({ unit: "m" })}
          >
            m
          </button>
        </div>
      </div>

      <div className="topbar-controls">
        <button type="button" className={gridSnap ? "chip active" : "chip"} onClick={onToggleSnap}>
          Snap {gridSnap ? "on" : "off"}
        </button>
        <div className="zoom-control">
          <button type="button" onClick={() => onZoomChange(Math.max(6, zoom - 2))}>
            −
          </button>
          <span>{Math.round((zoom / 18) * 100)}%</span>
          <button type="button" onClick={() => onZoomChange(Math.min(40, zoom + 2))}>
            +
          </button>
        </div>
      </div>

      <div className="topbar-actions">
        <button type="button" className="btn-secondary" onClick={onNew}>
          New
        </button>
        <button type="button" className="btn-primary" onClick={onSave}>
          Save
        </button>
        <div className="menu-wrap">
          <button type="button" className="btn-secondary" onClick={() => setMenuOpen((v) => !v)}>
            Plans ▾
          </button>
          {menuOpen && (
            <div className="menu-dropdown" onMouseLeave={() => setMenuOpen(false)}>
              {savedPlans.length === 0 && <div className="menu-empty">No saved plans yet</div>}
              {savedPlans.map((p) => (
                <div key={p.id} className="menu-row">
                  <button type="button" className="menu-row-name" onClick={() => { onLoad(p.id); setMenuOpen(false); }}>
                    {p.name}
                  </button>
                  <button type="button" className="menu-row-delete" onClick={() => onDeletePlan(p.id)}>
                    ✕
                  </button>
                </div>
              ))}
              <div className="menu-divider" />
              <button type="button" className="menu-row-name" onClick={() => { onExportJson(); setMenuOpen(false); }}>
                Export as JSON
              </button>
              <button type="button" className="menu-row-name" onClick={() => fileInputRef.current?.click()}>
                Import JSON
              </button>
              <button type="button" className="menu-row-name" onClick={() => { onExportPng(); setMenuOpen(false); }}>
                Export as PNG
              </button>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden-file-input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportJson(file);
            e.target.value = "";
            setMenuOpen(false);
          }}
        />
      </div>
    </header>
  );
}
