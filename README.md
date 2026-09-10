# Venue Floor Plan Designer

A to-scale floor plan tool for planning venue layouts: set your room dimensions, then drag in round/rectangular tables, a stage, bar, sofas, dance floor, DJ booth, and entrances to design and check the flow of an event space.

## Features

- **Set venue dimensions** in feet or meters — the canvas is drawn to scale on a grid (major lines every 5 ft, ruler along the top/left edges).
- **Object tray** grouped by category:
  - Seating — round, oval, rectangular & banquet tables, cocktail tables, sofas, lounge chairs
  - Stage & production — stage, DJ booth, photo backdrop
  - Bar & service — straight/curved bar, bar stools, buffet/food station
  - Layout markers — dance floor, entrance/exit, registration/check-in, coat check, gift/card table
  - **Doors & windows** — single door, double door, and window, each with an editable opening width and a proper architectural swing-arc symbol; drag one near a wall and it snaps flush onto it, oriented correctly
  - **Text & labels** — freeform, multi-line, resizable, recolorable annotations for room names, zone labels, signage notes, etc.
- **Drag to place and move**, with snap-to-grid (toggle on/off, 0.5 ft increments).
- **Resize and rotate** any object using the corner and top handles (rotation snaps to 15°); dragging a text label's corner resizes its font size live.
- **Collision warnings** — furniture and fixtures that overlap are outlined in red and counted in the summary panel, so you can catch tight or blocked walkways before the event.
- **Recolor anything** from a small curated swatch palette, to build your own zoning/color-coding scheme.
- **Properties panel** to edit label/text, exact dimensions (or opening width, or font size), rotation, seat count, color, and lock an object in place.
- **Live plan summary** — object counts, total seat count, and overlap count.
- **Save/load plans** to your browser (localStorage), start a **New** plan, **Export/Import as JSON** (to back up or share a plan file), and **Export as PNG** (to share an image).
- Keyboard shortcuts: `Delete`/`Backspace` to remove the selected object, `Ctrl/Cmd+D` to duplicate, `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z` to undo/redo.

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploying to Vercel

**Option A — Vercel CLI**
```bash
npm i -g vercel
vercel
```
Follow the prompts (accept the detected Next.js settings). Run `vercel --prod` to push to production.

**Option B — GitHub + Vercel dashboard**
1. Push this folder to a new GitHub repository.
2. Go to https://vercel.com/new and import that repository.
3. Vercel auto-detects Next.js — no config needed. Click **Deploy**.

No environment variables or backend are required; saved plans live in the browser's localStorage, and JSON export/import lets you move a plan between devices or share it with a teammate.

## Project structure

```
app/                 Next.js App Router entry (layout, page, global styles)
components/
  FloorPlanEditor.tsx  Top-level state: venue, objects, undo/redo, save/export
  TopBar.tsx           Venue name/dimensions, snap & zoom controls, save/load/export menu
  Palette.tsx           Left-hand object tray
  Canvas.tsx             SVG canvas: grid, rulers, drag/resize/rotate interactions
  PropertiesPanel.tsx    Right-hand panel for editing the selected object
lib/
  types.ts        Shared TypeScript types
  presets.ts      Object tray presets (dimensions, seat counts, colors, swatches)
  geometry.ts     Unit conversion, grid snapping, rotation math, OBB corner math
  overlap.ts      Collision detection between placed furniture/fixtures
  storage.ts      localStorage save/load helpers
```

## Notes on scale & units

Internally every measurement is stored in feet; the unit toggle (ft/m) only affects what's displayed in the dimension fields. One SVG unit equals one foot, so the grid, snapping, and exported PNG are all drawn precisely to scale based on the venue width/depth you enter.
