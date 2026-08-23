# Globe Architecture & Adaptation — GLOBEX AI

## 1. Overview
The GLOBEX AI 3D visualization is built on the existing `react-globe.gl` and Three.js implementation located in `src/components/TradeGlobe.tsx`. In accordance with **RULE 1 (NON-NEGOTIABLE)**, the underlying WebGL canvas, lighting, camera controls, and GeoJSON country polygon geometry have been strictly preserved, while extending its capabilities into a multi-mode **Global Trade Intelligence** command center.

---

## 2. Globe Files & Dependencies
- **Core Component**: `src/components/TradeGlobe.tsx`
- **Tooltip Component**: `src/components/GlobeTooltip.tsx`
- **Dependencies**:
  - `react-globe.gl` (v2.37.0)
  - `three` (v0.183.0)
  - `d3-scale`, `d3-interpolate`
  - `GeoJSON dataset`: `ne_110m_admin_0_countries.geojson`

---

## 3. What Was Preserved
- **WebGL Geometry & Rendering Engine**: Direct Three.js scene management with dark space background and atmospheric cyan glow (`hsl(187, 100%, 50%)`).
- **Country Polygon Extrusion**: Polygon cap colors, side colors, and altitude elevation calculated dynamically using min-max value normalization.
- **Camera Controls**: OrbitControls with smooth auto-rotation (`autoRotateSpeed = 0.5`), altitude point-of-view positioning (`altitude = 2.5`), and zoom damping.
- **Resize Observer**: Fluid responsive dimension tracking based on parent container width/height.

---

## 4. What Was Extended & Modified
- **Multi-Mode Operation Switcher**:
  1. **Mode 1: Market Intelligence**
     - Renders country polygons color-coded by market opportunity index (UAE: 94/100, Saudi Arabia: 89/100, UK: 81/100, Germany: 68/100).
     - Hovering opens detailed bilateral opportunity metrics.
  2. **Mode 2: Trade Partners**
     - Renders 3D coordinate pins for key manufacturing & buying hubs (Mumbai, Delhi, Ahmedabad, Surat, Chennai, Dubai, Riyadh, Singapore, London, Hamburg).
     - Clicking pins opens counterparty trust and AI match dossiers.
  3. **Mode 3: Active Trades**
     - Renders animated 3D quadratic bezier arcs between trade corridors (e.g., Mumbai ➔ Dubai, 500 tonnes Basmati Rice, $550,000 USDC).
     - Arc dash animations indicate live transaction flow and risk status (Emerald = Low Risk).
  4. **Mode 4: Shipments**
     - Real-time maritime cargo tracking with moving vessel markers, GPS coordinates, and customs clearance checkpoints.

---

## 5. Data Flow & Integration
```
GlobeMode Selection (UI) ───► TradeGlobe Props ───► Dynamic Three.js Layers
                                                 ├─ Polygons (GeoJSON)
                                                 ├─ Arcs (Trade Corridors)
                                                 ├─ HTML / 3D Points (Hubs)
                                                 └─ Tooltip / Drawer Event Emitter
```

---
STATUS: IMPLEMENTED
