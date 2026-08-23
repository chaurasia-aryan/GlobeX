# Globe Integration Manual — GLOBEX AI

This document provides developer guidelines for consuming and customizing the adapted `TradeGlobe` component within GLOBEX AI.

---

## 1. Component Usage

```tsx
import TradeGlobe from "@/components/TradeGlobe";
import { GlobeMode } from "@/types/trade";

export function TradeOverview() {
  const [activeMode, setActiveMode] = useState<GlobeMode>("active-trades");
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  return (
    <div className="relative w-full h-[600px]">
      <TradeGlobe
        mode={activeMode}
        onSelectEntity={(entity) => setSelectedEntity(entity)}
      />
    </div>
  );
}
```

---

## 2. Supported Coordinates & Corridors

### Manufacturing & Export Hubs (India)
- **Mumbai Port (Nhava Sheva)**: `[18.9438, 72.8347]`
- **New Delhi (ICD Tughlakabad)**: `[28.6139, 77.2090]`
- **Ahmedabad / Mundra**: `[23.0225, 72.5714]`
- **Surat Diamond & Textile Hub**: `[21.1702, 72.8311]`
- **Chennai Port**: `[13.0827, 80.2707]`

### Major Import & Trading Hubs
- **Dubai / Jebel Ali Port (UAE)**: `[25.2048, 55.2708]`
- **Riyadh (Saudi Arabia)**: `[24.7136, 46.6753]`
- **Port of Singapore**: `[1.3521, 103.8198]`
- **London Gateway (UK)**: `[51.5074, -0.1278]`
- **Port of Hamburg (Germany)**: `[53.5511, 9.9937]`

---

## 3. Interaction Events
- `onHover(entity | null)`: Updates mouse tracking position for floating tooltip.
- `onSelectEntity(entity)`: Triggers detail drawer with counterparty telemetry, risk score, and active trade milestones.
- `onModeChange(mode)`: Shifts active Three.js rendering pipelines smoothly without unmounting WebGL context.

---
STATUS: IMPLEMENTED
