"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Canvas from "./Canvas";
import Palette from "./Palette";
import PropertiesPanel from "./PropertiesPanel";
import TopBar from "./TopBar";
import { FloorPlanDoc, PalettePreset, PlacedObject, VenueSpec } from "@/lib/types";
import { genId } from "@/lib/geometry";
import { deletePlan, listSavedPlans, loadPlan, savePlan, SavedPlanMeta } from "@/lib/storage";

const DEFAULT_VENUE: VenueSpec = {
  name: "Untitled venue",
  widthFt: 60,
  heightFt: 40,
  unit: "ft",
};

const DEFAULT_ZOOM = 18; // px per foot

function makeObjectFromPreset(preset: PalettePreset, venue: VenueSpec, existingCount: number): PlacedObject {
  const offset = (existingCount % 6) * 1.5;
  return {
    id: genId(),
    kind: preset.kind,
    label: preset.label,
    shape: preset.shape,
    width: preset.width,
    height: preset.height,
    x: venue.widthFt / 2 + offset,
    y: venue.heightFt / 2 + offset,
    rotation: 0,
    seats: preset.seats,
    color: preset.color,
  };
}

export default function FloorPlanEditor() {
  const [venue, setVenue] = useState<VenueSpec>(DEFAULT_VENUE);
  const [objects, setObjects] = useState<PlacedObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [gridSnap, setGridSnap] = useState(true);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [planId, setPlanId] = useState<string>(() => genId("plan"));
  const [savedPlans, setSavedPlans] = useState<SavedPlanMeta[]>([]);

  const past = useRef<PlacedObject[][]>([]);
  const future = useRef<PlacedObject[][]>([]);

  useEffect(() => {
    setSavedPlans(listSavedPlans());
  }, []);

  const pushHistory = useCallback((snapshot: PlacedObject[]) => {
    past.current.push(snapshot);
    if (past.current.length > 50) past.current.shift();
    future.current = [];
  }, []);

  const selected = objects.find((o) => o.id === selectedId) || null;

  const handleAdd = (preset: PalettePreset) => {
    pushHistory(objects);
    const obj = makeObjectFromPreset(preset, venue, objects.length);
    setObjects((prev) => [...prev, obj]);
    setSelectedId(obj.id);
  };

  const handleChangeObject = (id: string, patch: Partial<PlacedObject>) => {
    setObjects((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  const dragSnapshotTaken = useRef(false);
  const handleChangeObjectWithHistory = (id: string, patch: Partial<PlacedObject>) => {
    if (!dragSnapshotTaken.current) {
      pushHistory(objects);
      dragSnapshotTaken.current = true;
    }
    handleChangeObject(id, patch);
  };
  const handleCommitWithReset = () => {
    dragSnapshotTaken.current = false;
  };

  const handleDelete = (id: string) => {
    pushHistory(objects);
    setObjects((prev) => prev.filter((o) => o.id !== id));
    setSelectedId(null);
  };

  const handleDuplicate = (id: string) => {
    const obj = objects.find((o) => o.id === id);
    if (!obj) return;
    pushHistory(objects);
    const copy: PlacedObject = { ...obj, id: genId(), x: obj.x + 1.5, y: obj.y + 1.5 };
    setObjects((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  const handlePropertiesChange = (id: string, patch: Partial<PlacedObject>) => {
    pushHistory(objects);
    handleChangeObject(id, patch);
  };

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(objects);
    setObjects(prev);
  }, [objects]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(objects);
    setObjects(next);
  }, [objects]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (isTyping) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        handleDelete(selectedId);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d" && selectedId) {
        e.preventDefault();
        handleDuplicate(selectedId);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, objects, undo, redo]);

  const handleVenueChange = (patch: Partial<VenueSpec>) => {
    setVenue((v) => ({ ...v, ...patch }));
  };

  const handleSave = () => {
    const doc: FloorPlanDoc = { venue, objects };
    savePlan(planId, doc);
    setSavedPlans(listSavedPlans());
  };

  const handleLoad = (id: string) => {
    const doc = loadPlan(id);
    if (!doc) return;
    setVenue(doc.venue);
    setObjects(doc.objects);
    setPlanId(id);
    setSelectedId(null);
    past.current = [];
    future.current = [];
  };

  const handleDeletePlan = (id: string) => {
    deletePlan(id);
    setSavedPlans(listSavedPlans());
  };

  const handleNew = () => {
    setVenue(DEFAULT_VENUE);
    setObjects([]);
    setSelectedId(null);
    setPlanId(genId("plan"));
    past.current = [];
    future.current = [];
  };

  const handleExportJson = () => {
    const doc: FloorPlanDoc = { venue, objects };
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${venue.name || "floorplan"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const doc = JSON.parse(reader.result as string) as FloorPlanDoc;
        setVenue(doc.venue);
        setObjects(doc.objects);
        setSelectedId(null);
        past.current = [];
        future.current = [];
      } catch {
        alert("Could not read that file — please choose a valid floor plan JSON export.");
      }
    };
    reader.readAsText(file);
  };

  const handleExportPng = () => {
    const svgEl = document.querySelector(".fp-canvas") as SVGSVGElement | null;
    if (!svgEl) return;
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const bgRect = clone.querySelector(".canvas-bg");
    if (bgRect) bgRect.setAttribute("fill", "#FAF8F1");

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scaleFactor = 2;
      const canvas = document.createElement("canvas");
      canvas.width = svgEl.width.baseVal.value * scaleFactor;
      canvas.height = svgEl.height.baseVal.value * scaleFactor;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#FAF8F1";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `${venue.name || "floorplan"}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
      });
    };
    img.src = url;
  };

  return (
    <div className="app-shell">
      <TopBar
        venue={venue}
        onVenueChange={handleVenueChange}
        gridSnap={gridSnap}
        onToggleSnap={() => setGridSnap((v) => !v)}
        zoom={zoom}
        onZoomChange={setZoom}
        savedPlans={savedPlans}
        onSave={handleSave}
        onLoad={handleLoad}
        onDeletePlan={handleDeletePlan}
        onNew={handleNew}
        onExportPng={handleExportPng}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />
      <div className="app-body">
        <Palette onAdd={handleAdd} />
        <main className="canvas-viewport">
          <Canvas
            venue={venue}
            objects={objects}
            selectedId={selectedId}
            gridSnap={gridSnap}
            zoom={zoom}
            onSelect={setSelectedId}
            onChangeObject={handleChangeObjectWithHistory}
            onCommit={handleCommitWithReset}
          />
        </main>
        <PropertiesPanel
          venue={venue}
          objects={objects}
          selected={selected}
          onChange={handlePropertiesChange}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      </div>
    </div>
  );
}
