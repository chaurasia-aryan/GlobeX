import { useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Balancer from "react-wrap-balancer";
import TradeGlobe, { TradeGlobeRef } from "@/components/TradeGlobe";
import { SAMPLE_DATA, aggregateByCountry } from "@/lib/tradeData";
import SplitText from "@/components/ui/split-text";
import RoleNavigation from "@/components/layout/RoleNavigation";
import AuthShell from "@/components/auth/AuthShell";
import {
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

type LandingPhase = "idle" | "rotating" | "zooming" | "mumbai" | "auth-reveal" | "auth-ready";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<TradeGlobeRef>(null);
  const initialPovRef = useRef<{ lat: number; lng: number; altitude: number } | null>(null);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const aggregatedData = useMemo(() => aggregateByCountry(SAMPLE_DATA, null), []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Spring damping for buttery-smooth scroll response
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 26,
    mass: 0.5,
    restDelta: 0.0001,
  });

  const [landingPhase, setLandingPhase] = useState<LandingPhase>("idle");

  // Dynamic Camera transitions as scroll progresses into Mumbai
  useMotionValueEvent(smoothProgress, "change", (progress) => {
    if (prefersReducedMotion) return;

    if (progress < 0.25) {
      setLandingPhase("rotating");
    } else if (progress < 0.55) {
      setLandingPhase("zooming");
    } else if (progress < 0.78) {
      setLandingPhase("mumbai");
    } else {
      setLandingPhase("auth-ready");
    }

    if (!globeRef.current) return;

    if (!initialPovRef.current && progress > 0.001) {
      initialPovRef.current = globeRef.current.getCurrentPointOfView() || { lat: 20, lng: 55, altitude: 2.2 };
    }

    const startLat = initialPovRef.current?.lat ?? 20;
    const startLng = initialPovRef.current?.lng ?? 55;
    const startAlt = initialPovRef.current?.altitude ?? 2.2;

    const indiaLat = 20.5937;
    const indiaLng = 78.9629;
    const indiaAlt = 1.55;

    const mumbaiLat = 18.9438;
    const mumbaiLng = 72.9463;
    const mumbaiAlt = 0.55;

    let lat, lng, altitude;

    if (progress <= 0.45) {
      const t1 = progress / 0.45;
      const ease1 = 1 - Math.pow(1 - t1, 2.5);
      lat = startLat + (indiaLat - startLat) * ease1;
      lng = startLng + (indiaLng - startLng) * ease1;
      altitude = startAlt + (indiaAlt - startAlt) * ease1;
    } else {
      const t2 = (progress - 0.45) / 0.55;
      const ease2 = 1 - Math.pow(1 - t2, 2.8);
      lat = indiaLat + (mumbaiLat - indiaLat) * ease2;
      lng = indiaLng + (mumbaiLng - indiaLng) * ease2;
      altitude = indiaAlt + (mumbaiAlt - indiaAlt) * ease2;
    }

    globeRef.current.pointOfView({ lat, lng, altitude }, 0);
  });

  // Stage 1 Hero Transitions
  const heroOpacity = useTransform(smoothProgress, [0, 0.25], [1, 0]);
  const heroY = useTransform(smoothProgress, [0, 0.25], [0, -40]);
  const heroPointerEvents = useTransform(smoothProgress, (v) => (v < 0.25 ? "auto" : "none"));

  // Stage 2 Globe Zoom & Spatial Dimming
  const globeScale = useTransform(smoothProgress, [0, 0.45, 0.85], [1, 1.35, 1.8]);
  const globeX = useTransform(smoothProgress, [0, 0.45, 0.85], ["18%", "4%", "-4%"]);
  const globeOpacity = useTransform(smoothProgress, [0.65, 0.95], [1, 0.25]);

  // Stage 2 HUD Telemetry Pill
  const hudOpacity = useTransform(smoothProgress, [0.15, 0.32, 0.55, 0.72], [0, 1, 1, 0]);
  const hudY = useTransform(smoothProgress, [0.15, 0.32], [-20, 0]);

  // Navigation Bar on Login Stage
  const navOpacity = useTransform(smoothProgress, [0.35, 0.6], [0, 1]);
  const navY = useTransform(smoothProgress, [0.35, 0.6], [-20, 0]);
  const navPointerEvents = useTransform(smoothProgress, (v) => (v >= 0.35 ? "auto" : "none"));

  // Stage 3 Dynamic Floating Auth Cockpit Emergence
  const authOpacity = useTransform(smoothProgress, [0.38, 0.6], [0, 1]);
  const authScale = useTransform(smoothProgress, [0.38, 0.65], [0.96, 1.0]);
  const authX = useTransform(smoothProgress, [0.38, 0.65], [40, 0]);
  const authY = useTransform(smoothProgress, [0.38, 0.65], [10, 0]);
  const authPointerEvents = useTransform(smoothProgress, (v) => (v >= 0.5 ? "auto" : "none"));

  const handleLoginSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[320vh] bg-[#070A0E] text-[var(--text-primary)] font-sans select-none"
    >
      {/* ─── STICKY FULLSCREEN VIEWPORT CONTAINER ─────────────────────────────────── */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-between overflow-hidden">
        
        {/* Background ambient lighting glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 -z-10"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, rgba(56, 189, 248, 0.14) 0%, transparent 65%), radial-gradient(circle at 80% 80%, rgba(52, 199, 149, 0.1) 0%, transparent 50%)",
          }}
        />

        {/* ── TOP NAVIGATION BAR ──────────────────────────────────────────── */}
        <motion.div
          style={{
            opacity: prefersReducedMotion ? 1 : navOpacity,
            y: prefersReducedMotion ? 0 : navY,
            pointerEvents: prefersReducedMotion ? "auto" : navPointerEvents,
          }}
          className="w-full z-50 sticky top-0"
        >
          <RoleNavigation />
        </motion.div>

        {/* ── 3D EARTH GLOBE LAYER (Optimized Lifecycle & Auto-Paused on Auth) ─ */}
        {!prefersReducedMotion && (
          <motion.div
            style={{
              scale: globeScale,
              x: globeX,
              opacity: globeOpacity,
            }}
            className="absolute inset-0 flex items-center justify-center pointer-events-auto z-10"
          >
            <div className="w-[950px] h-[950px] sm:w-[1150px] sm:h-[1150px] lg:w-[1350px] lg:h-[1350px] xl:w-[1550px] xl:h-[1550px] flex items-center justify-center">
              <TradeGlobe
                ref={globeRef}
                aggregatedData={aggregatedData}
                selectedCountry="India"
                showArcs={true}
                autoRotate={landingPhase === "idle" || landingPhase === "rotating"}
                disableCountryAutoFocus={true}
                isPaused={landingPhase === "auth-ready"}
                lifecyclePhase={landingPhase}
              />
            </div>
          </motion.div>
        )}

        {/* ── STAGE 1: HERO VIEW (Headline, Subtext, Scroll Cue) ──────────── */}
        {!prefersReducedMotion && (
          <motion.div
            style={{
              opacity: heroOpacity,
              y: heroY,
              pointerEvents: heroPointerEvents,
            }}
            className="absolute left-6 sm:left-12 lg:left-20 top-1/2 -translate-y-1/2 max-w-[620px] xl:max-w-[680px] space-y-7 z-20 pointer-events-none"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-[4.3rem] xl:text-[4.75rem] font-display font-extrabold tracking-tight leading-[1.02] text-[var(--text-primary)] pointer-events-auto">
              <Balancer>
                <SplitText text="Trade globally." delay={0.1} className="justify-start font-display font-extrabold" />
                <span className="font-serif italic text-[var(--emerald)] text-6xl sm:text-7xl lg:text-[5.2rem] xl:text-[5.75rem] inline-block mt-1 font-normal tracking-wide">
                  <SplitText text="With confidence." delay={0.4} className="justify-start font-serif italic" />
                </span>
              </Balancer>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-sans pointer-events-auto max-w-[540px]">
              Connect with verified international buyers and sellers, verify trade papers automatically, and protect every payment with programmable escrow.
            </p>

            {/* Pulsing Scroll Cue */}
            <div className="pt-2 flex items-center gap-3 text-xs sm:text-sm font-mono text-[var(--text-secondary)] pointer-events-auto">
              <div className="w-8 h-8 rounded-full border border-white/[0.15] bg-[#111824]/90 flex items-center justify-center animate-bounce shadow-lg text-[var(--emerald)]">
                <ChevronDown className="w-4 h-4" />
              </div>
              <span className="text-slate-300">Scroll to sign in & access enterprise workspace</span>
            </div>
          </motion.div>
        )}

        {/* ── STAGE 2: ORBITAL HUD TELEMETRY PILL ─────────────────────────── */}
        {!prefersReducedMotion && (
          <motion.div
            style={{
              opacity: hudOpacity,
              y: hudY,
            }}
            className="absolute top-24 z-20 pointer-events-none px-4"
          >
            <div className="p-3.5 rounded-2xl border border-cyan-500/30 bg-[#0C121D]/90 backdrop-blur-xl shadow-2xl flex items-center gap-3 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[var(--text-secondary)]">
                {landingPhase === "idle" || landingPhase === "rotating" ? (
                  <>
                    Global Radar: <strong className="text-cyan-400">India Trade Hubs</strong>
                  </>
                ) : (
                  <>
                    Zooming to Gateway: <strong className="text-emerald-400">Mumbai Port Hub (JNPT)</strong>
                  </>
                )}
              </span>
            </div>
          </motion.div>
        )}

        {/* ── STAGE 3: TRANSLUCENT FLOATING AUTH COCKPIT (Emerges from Mumbai) ─ */}
        <motion.div
          style={{
            opacity: prefersReducedMotion ? 1 : authOpacity,
            scale: prefersReducedMotion ? 1 : authScale,
            x: prefersReducedMotion ? 0 : authX,
            y: prefersReducedMotion ? 0 : authY,
            pointerEvents: prefersReducedMotion ? "auto" : authPointerEvents,
          }}
          className="absolute inset-0 z-40 w-full h-full min-h-screen flex items-center justify-center p-4 sm:p-6"
        >
          {/* Translucent Floating Auth Shell */}
          <AuthShell onSuccess={handleLoginSuccess} />
        </motion.div>

        {/* Minimal Bottom Bar */}
        <div className="w-full py-2 px-6 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-slate-500 z-30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>GLOBEX Protocol · India ⇄ UAE ⇄ Global Trade</span>
          </div>
          <span>CEPA Schedule Rules · EVM Verified</span>
        </div>

      </div>
    </div>
  );
}
