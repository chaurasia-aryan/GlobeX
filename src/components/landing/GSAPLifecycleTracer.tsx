/**
 * GSAPLifecycleTracer — GSAP ScrollTrigger-driven 6-stage trade lifecycle
 *
 * DISCOVER → ASSESS → VERIFY → SECURE → SHIP → SETTLE
 * This is the signature scroll-driven showcase where GSAP ScrollTrigger
 * scrubs the connecting tracing beam in sync with user scrolling.
 */
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { Search, ShieldAlert, FileCheck2, Lock, Ship, CheckCircle2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const LIFECYCLE_STAGES = [
  {
    id: "DISCOVER",
    label: "Discover",
    num: "01",
    desc: "AI searches thousands of trade listings & global corridors",
    icon: Search,
    color: "var(--accent)",
    bg: "rgba(94,201,219,0.08)",
    border: "rgba(94,201,219,0.25)",
  },
  {
    id: "ASSESS",
    label: "Assess",
    num: "02",
    desc: "Multi-factor counterparty KYC & algorithmic risk scoring",
    icon: ShieldAlert,
    color: "var(--accent)",
    bg: "rgba(94,201,219,0.08)",
    border: "rgba(94,201,219,0.25)",
  },
  {
    id: "VERIFY",
    label: "Verify",
    num: "03",
    desc: "OCR cross-reconciliation & SHA-256 blockchain anchoring",
    icon: FileCheck2,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
  },
  {
    id: "SECURE",
    label: "Secure",
    num: "04",
    desc: "Programmable USDC multi-sig smart contract locks collateral",
    icon: Lock,
    color: "var(--emerald)",
    bg: "rgba(52,199,149,0.08)",
    border: "rgba(52,199,149,0.25)",
  },
  {
    id: "SHIP",
    label: "Ship",
    num: "05",
    desc: "AIS live vessel tracking + IoT milestone telemetry",
    icon: Ship,
    color: "var(--accent)",
    bg: "rgba(94,201,219,0.08)",
    border: "rgba(94,201,219,0.25)",
  },
  {
    id: "SETTLE",
    label: "Settle",
    num: "06",
    desc: "Smart contract auto-releases funds upon verified inspection",
    icon: CheckCircle2,
    color: "var(--emerald)",
    bg: "rgba(52,199,149,0.12)",
    border: "rgba(52,199,149,0.35)",
  },
] as const;

export function GSAPLifecycleTracer({ className }: { className?: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const stages = stageRefs.current.filter(Boolean);
      const dots = dotRefs.current.filter(Boolean);
      const beam = beamRef.current;
      if (!beam || stages.length === 0) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          end: "bottom 25%",
          scrub: 1.2,
        },
      });

      stages.forEach((stage, i) => {
        if (!stage || !dots[i]) return;

        tl.to(
          beam,
          {
            width: `${((i + 1) / stages.length) * 100}%`,
            duration: 1,
            ease: "none",
          },
          i
        );

        tl.to(
          stage,
          {
            backgroundColor: LIFECYCLE_STAGES[i].bg,
            borderColor: LIFECYCLE_STAGES[i].border,
            duration: 0.4,
            ease: "power2.out",
          },
          i
        );

        tl.to(
          dots[i],
          {
            backgroundColor: LIFECYCLE_STAGES[i].color,
            boxShadow: `0 0 14px ${LIFECYCLE_STAGES[i].color}`,
            scale: 1.25,
            duration: 0.3,
            ease: "back.out(1.5)",
          },
          i + 0.2
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className={cn("space-y-8 max-w-6xl mx-auto", className)}>
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[var(--accent)] font-semibold">
          GLOBEX TRADE LIFECYCLE
        </p>
        <h2 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-[var(--text-primary)]">
          Discover. Assess. Verify. Secure. Ship. Settle.
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
          A single continuous trust pipeline powered by AI intelligence and cryptographic settlement.
        </p>
      </div>

      {/* Tracing Beam Rail */}
      <div className="relative px-2">
        {/* Background rail */}
        <div className="absolute top-6 left-12 right-12 h-0.5 bg-[var(--hairline)] rounded-full hidden sm:block" />
        {/* Animated foreground beam */}
        <div
          ref={beamRef}
          className="absolute top-6 left-12 h-0.5 rounded-full hidden sm:block"
          style={{
            width: "0%",
            background: `linear-gradient(to right, var(--accent), var(--emerald))`,
            boxShadow: `0 0 10px var(--accent)`,
            transition: "none",
          }}
        />

        {/* 6 Stages Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
          {LIFECYCLE_STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <div key={stage.id} className="flex flex-col items-center gap-3">
                {/* Dot on rail */}
                <div
                  ref={(el) => { dotRefs.current[i] = el; }}
                  className="w-3 h-3 rounded-full border-2 border-[var(--hairline)] bg-[var(--panel)] hidden sm:block"
                  style={{ transition: "none" }}
                />

                {/* Stage card */}
                <div
                  ref={(el) => { stageRefs.current[i] = el; }}
                  className="p-4 rounded-2xl border w-full text-center space-y-2 cursor-default transition-colors flex flex-col items-center"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    borderColor: "rgba(255,255,255,0.07)",
                    transition: "none",
                  }}
                >
                  <div className="w-8 h-8 rounded-xl bg-[var(--ink)] border border-[var(--hairline)] flex items-center justify-center text-[var(--text-primary)]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-[var(--text-muted)] tracking-widest">
                      {stage.num}
                    </div>
                    <div className="text-sm font-display font-bold text-[var(--text-primary)]">
                      {stage.label}
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-snug font-sans">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GSAPLifecycleTracer;
