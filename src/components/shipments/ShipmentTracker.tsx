import { useState } from "react";
import { ShipmentEvent } from "@/types/trade";
import { DEMO_SHIPMENT_EVENT } from "@/data/mockTradeData";
import { Ship, Navigation, Thermometer, Droplets, MapPin, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

interface ShipmentTrackerProps {
  shipment?: ShipmentEvent;
}

export const ShipmentTracker = ({ shipment = DEMO_SHIPMENT_EVENT }: ShipmentTrackerProps) => {
  return (
    <div className="glass-panel p-5 bg-card/90 border-border/80 rounded-2xl space-y-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-primary">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                Live Multi-Modal Cargo & IoT Telemetry
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-400 border border-cyan-800/60">
                AIS LIVE TRACKING
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Vessel: <strong className="text-foreground">{shipment.vesselName}</strong> • Voyage: {shipment.voyageNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-muted-foreground">Carrier:</span>
          <span className="text-foreground font-semibold">{shipment.carrier}</span>
        </div>
      </div>

      {/* Real-time Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-secondary/50 border border-border/70 space-y-0.5">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Current Coordinates</div>
          <div className="text-sm font-mono font-bold text-foreground">
            {shipment.coordinates[0]}°N, {shipment.coordinates[1]}°E
          </div>
          <div className="text-[10px] font-mono text-primary truncate">{shipment.location}</div>
        </div>

        <div className="p-3 rounded-xl bg-secondary/50 border border-border/70 space-y-0.5">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Estimated Arrival (ETA)</div>
          <div className="text-sm font-mono font-bold text-emerald-400">Aug 18, 2026 08:00</div>
          <div className="text-[10px] font-mono text-muted-foreground">Jebel Ali Berth 2</div>
        </div>

        <div className="p-3 rounded-xl bg-secondary/50 border border-border/70 space-y-0.5">
          <div className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-cyan-400" /> Container Temp
          </div>
          <div className="text-sm font-mono font-bold text-foreground">
            {shipment.temperatureCelsius}°C
          </div>
          <div className="text-[10px] font-mono text-emerald-400">Within Optimal Spec (20-25°C)</div>
        </div>

        <div className="p-3 rounded-xl bg-secondary/50 border border-border/70 space-y-0.5">
          <div className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" /> Relative Humidity
          </div>
          <div className="text-sm font-mono font-bold text-foreground">
            {shipment.humidityPercent}%
          </div>
          <div className="text-[10px] font-mono text-emerald-400">Controlled Agri Grade</div>
        </div>
      </div>

      {/* Step-by-Step Waypoint Milestones */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-semibold uppercase text-muted-foreground tracking-wider">
          Voyage Milestones & Checkpoints
        </div>

        <div className="space-y-2 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-border/60">
          {shipment.milestones.map((ms, index) => (
            <div key={ms.title} className="relative flex items-start gap-4 pl-8">
              <div
                className={`absolute left-1.5 top-1 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  ms.completed
                    ? "bg-emerald-500 border-background text-slate-950"
                    : ms.current
                    ? "bg-cyan-500 border-background animate-pulse"
                    : "bg-secondary border-border"
                }`}
              />
              <div className="flex-1 p-3 rounded-xl bg-secondary/30 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-2">
                    <span>{ms.title}</span>
                    {ms.current && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                        IN TRANSIT
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" /> {ms.location}
                  </div>
                </div>
                <div className="text-[11px] font-mono text-slate-400">{ms.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShipmentTracker;
