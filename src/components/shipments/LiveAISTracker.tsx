import React, { useState } from "react";
import { Ship, Navigation, Wind, Compass, MapPin, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Waves, RefreshCw } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LiveAISTrackerProps {
  tradeId?: string;
  className?: string;
}

export const LiveAISTracker: React.FC<LiveAISTrackerProps> = ({
  tradeId = "TRD-IND-UAE-550K",
  className,
}) => {
  const [vesselSpeed, setVesselSpeed] = useState<number>(16.4);
  const [etaHours, setEtaHours] = useState<number>(18);
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [isSimulating, setIsSimulating] = useState(false);

  const WAYPOINTS = [
    { title: "Berth Departure (JNPT Nhava Sheva)", status: "COMPLETED", date: "Aug 22, 14:30 UTC", loc: "18°57'N, 72°57'E" },
    { title: "Arabian Sea Deep Water Corridor", status: "IN_TRANSIT", date: "Current Position", loc: "23°48'N, 61°14'E" },
    { title: "Strait of Hormuz Ingress Lane", status: "UPCOMING", date: "ETA Aug 26, 06:00 UTC", loc: "26°34'N, 56°15'E" },
    { title: "Jebel Ali Container Terminal Berth 4", status: "PENDING", date: "ETA Aug 26, 15:30 UTC", loc: "24°59'N, 55°03'E" },
  ];

  const handleSimulateDischarge = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setCurrentStep(4);
      setEtaHours(0);
      setIsSimulating(false);
      toast.success("Vessel Discharged at Jebel Ali Port: Automated Escrow Condition 2 cleared!");
    }, 800);
  };

  const handleReset = () => {
    setCurrentStep(2);
    setEtaHours(18);
    toast.info("Vessel telemetry reset to Sea Transit mode.");
  };

  return (
    <div className={cn("rounded-2xl bg-[var(--surface-1)] border border-[var(--hairline)] p-5 sm:p-6 space-y-6 select-none", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--hairline)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500">
              <Ship className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                Live AIS Satellite Vessel Telemetry & Geofence Tracker
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Direct maritime tracking of MSC ANNA (IMO 9400234) with automated milestone smart contract triggers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge
            status={currentStep === 4 ? "verified" : "in_transit"}
            label={currentStep === 4 ? "CARGO DISCHARGED" : "SEA TRANSIT (ON TIME)"}
            size="md"
          />
        </div>
      </div>

      {/* Vessel Telemetry Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase flex items-center gap-1">
            <Compass className="w-3 h-3 text-sky-400" /> Vessel Name / IMO
          </span>
          <div className="text-sm font-bold text-[var(--text-primary)] truncate">MSC ANNA</div>
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">IMO 9400234 · Panama</span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase flex items-center gap-1">
            <Navigation className="w-3 h-3 text-emerald-400" /> Speed & Heading
          </span>
          <div className="text-sm font-bold text-emerald-400">{vesselSpeed} Knots</div>
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">Course 284° WNW</span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> Destination ETA
          </span>
          <div className="text-sm font-bold text-[var(--text-primary)]">
            {etaHours === 0 ? "Discharged" : `in ${etaHours} Hours`}
          </div>
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">Jebel Ali Berth 4</span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase flex items-center gap-1">
            <Waves className="w-3 h-3 text-indigo-400" /> Sea & Weather Risk
          </span>
          <div className="text-sm font-bold text-emerald-500">Calm (Sea State 2)</div>
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">Wind: 11 kts NE</span>
        </div>
      </div>

      {/* Geofence Waypoint Progress Rail */}
      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Corridor Waypoint Geofences & Discharges
        </h4>

        <div className="space-y-3">
          {WAYPOINTS.map((wp, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep - 1 && currentStep < 4;

            return (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="flex flex-col items-center mt-1">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-sky-500 text-white animate-pulse"
                        : "bg-[var(--surface-3)] text-[var(--text-tertiary)]"
                    )}
                  >
                    {isDone ? "✓" : idx + 1}
                  </div>
                  {idx < WAYPOINTS.length - 1 && (
                    <div className={cn("w-0.5 h-7 mt-1", isDone ? "bg-emerald-500/50" : "bg-[var(--hairline)]")} />
                  )}
                </div>

                <div className="flex-1 p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--hairline)] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[var(--text-primary)]">{wp.title}</span>
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">
                      {wp.loc} · {wp.date}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-mono font-bold px-2 py-0.5 rounded",
                      isDone
                        ? "bg-emerald-500/10 text-emerald-600"
                        : isCurrent
                        ? "bg-sky-500/10 text-sky-400"
                        : "text-[var(--text-tertiary)]"
                    )}
                  >
                    {isDone ? "PASSED" : isCurrent ? "CURRENT" : "PENDING"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulator Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--hairline)]">
        <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
          AIS Source: Global Maritime Satellite Constellation (Spire + MarineTraffic API)
        </span>

        <div className="flex items-center gap-2">
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleSimulateDischarge}
              disabled={isSimulating}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Ship className="w-3.5 h-3.5" />
              <span>Simulate Port Berth Discharge</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--hairline)] text-xs font-mono text-[var(--text-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Telemetry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveAISTracker;
