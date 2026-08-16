import { useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Balancer from "react-wrap-balancer";
import TradeGlobe, { TradeGlobeRef } from "@/components/TradeGlobe";
import { SAMPLE_DATA, aggregateByCountry } from "@/lib/tradeData";
import { appwriteService } from "@/services/appwrite/client";
import SplitText from "@/components/ui/split-text";
import BorderBeam from "@/components/ui/border-beam";
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  ShoppingBag,
  Coins,
  Anchor,
  MapPin,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<TradeGlobeRef>(null);
  const initialPovRef = useRef<{ lat: number; lng: number; altitude: number } | null>(null);
  const navigate = useNavigate();
  const aggregatedData = useMemo(() => aggregateByCountry(SAMPLE_DATA, null), []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Buttery-smooth spring damping on scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.5,
    restDelta: 0.0001,
  });

  const [showPersona, setShowPersona] = useState(false);
  const [isOverviewStage, setIsOverviewStage] = useState(true);

  // Dynamic Multi-Stage Camera: Starts from exact live screen point -> Centers India -> Zooms into Mumbai
  useMotionValueEvent(smoothProgress, "change", (progress) => {
    const isPastThreshold = progress >= 0.65;
    setShowPersona((prev) => (prev !== isPastThreshold ? isPastThreshold : prev));

    const isOverview = progress < 0.45;
    setIsOverviewStage((prev) => (prev !== isOverview ? isOverview : prev));

    if (!globeRef.current) return;

    // Capture exact initial point on screen when scroll begins
    if (!initialPovRef.current && progress > 0.001) {
      initialPovRef.current = globeRef.current.getCurrentPointOfView() || { lat: 20, lng: 55, altitude: 2.2 };
    }

    const startLat = initialPovRef.current?.lat ?? 20;
    const startLng = initialPovRef.current?.lng ?? 55;
    const startAlt = initialPovRef.current?.altitude ?? 2.2;

    // Milestone 1: India Country Overview (Macro View)
    const indiaLat = 20.5937;
    const indiaLng = 78.9629;
    const indiaAlt = 1.55;

    // Milestone 2: Mumbai Trade Hub (Nhava Sheva Port)
    const mumbaiLat = 18.9438;
    const mumbaiLng = 72.9463;
    const mumbaiAlt = 0.55;

    let lat, lng, altitude;

    if (progress <= 0.45) {
      // Stage 1: Fast orbital sweep from live screen angle to frame whole of India
      const t1 = progress / 0.45;
      const ease1 = 1 - Math.pow(1 - t1, 2.5); // Fast when far
      lat = startLat + (indiaLat - startLat) * ease1;
      lng = startLng + (indiaLng - startLng) * ease1;
      altitude = startAlt + (indiaAlt - startAlt) * ease1;
    } else {
      // Stage 2: Gentle ("aaram se") zoom from India overview into Mumbai Port
      const t2 = (progress - 0.45) / 0.55;
      const ease2 = 1 - Math.pow(1 - t2, 2.8); // Gentle ease-out
      lat = indiaLat + (mumbaiLat - indiaLat) * ease2;
      lng = indiaLng + (mumbaiLng - indiaLng) * ease2;
      altitude = indiaAlt + (mumbaiAlt - indiaAlt) * ease2;
    }

    globeRef.current.pointOfView({ lat, lng, altitude }, 0);
  });

  // Transforms for animations based on smooth spring progress
  const heroOpacity = useTransform(smoothProgress, [0, 0.22], [1, 0]);
  const heroY = useTransform(smoothProgress, [0, 0.22], [0, -35]);
  const heroPointerEvents = useTransform(smoothProgress, (v) => (v < 0.22 ? "auto" : "none"));

  const globeScale = useTransform(smoothProgress, [0, 0.45, 0.85], [1, 1.4, 1.9]);
  const globeX = useTransform(smoothProgress, [0, 0.45, 0.85], ["18%", "4%", "-6%"]);

  const hudOpacity = useTransform(smoothProgress, [0.15, 0.32, 0.70, 0.85], [0, 1, 1, 0]);
  const hudY = useTransform(smoothProgress, [0.15, 0.32], [-20, 0]);

  const handleSelectRole = (role: "buyer" | "exporter") => {
    appwriteService.setRole(role);
    navigate(`/get-started?role=${role}`);
  };

  return (
    <div ref={containerRef} className="relative h-[320vh] bg-transparent text-[var(--text-primary)] font-sans select-none">
      
      {/* ─── STICKY FULLSCREEN VIEWPORT ────────────────────────────────────────── */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* Deep ambient radial lighting behind globe */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.12) 0%, transparent 65%)",
          }}
        />

        {/* ── 3D EARTH GLOBE LAYER (Interactive 3D Hover & Smooth Zoom) ──── */}
        <motion.div
          style={{
            scale: globeScale,
            x: globeX,
          }}
          className="absolute w-[950px] h-[950px] sm:w-[1150px] sm:h-[1150px] lg:w-[1350px] lg:h-[1350px] xl:w-[1550px] xl:h-[1550px] flex items-center justify-center pointer-events-auto z-10"
        >
          <TradeGlobe
            ref={globeRef}
            aggregatedData={aggregatedData}
            selectedCountry="India"
            showArcs={true}
            autoRotate={isOverviewStage}
            disableCountryAutoFocus={true}
          />
        </motion.div>

        {/* ── STAGE 1: CLEAN HERO VIEW (Headline, Subtext, Smooth Scroll Cue) ── */}
        <motion.div
          style={{
            opacity: heroOpacity,
            y: heroY,
            pointerEvents: heroPointerEvents,
          }}
          className="absolute left-6 sm:left-12 lg:left-20 max-w-[620px] xl:max-w-[680px] space-y-7 z-20 pointer-events-none"
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
            Connect with verified international buyers and sellers, verify trade papers automatically, and protect every payment safely.
          </p>

          {/* Smooth Pulsing Scroll Cue */}
          <div className="pt-4 flex items-center gap-3.5 text-xs sm:text-sm font-mono text-[var(--text-secondary)] pointer-events-auto">
            <div className="w-9 h-9 rounded-full border border-white/[0.15] bg-[#111824]/80 flex items-center justify-center animate-bounce shadow-lg text-[var(--emerald)]">
              <ChevronDown className="w-5 h-5" />
            </div>
            <span>Scroll down to explore world trade routes</span>
          </div>
        </motion.div>

        {/* ── STAGE 2: ORBITAL HUD TELEMETRY (Transitions from India to Mumbai) ── */}
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
              {isOverviewStage ? (
                <>
                  Global View: <strong className="text-cyan-400">India Trade Hubs</strong>
                </>
              ) : (
                <>
                  Zooming into: <strong className="text-emerald-400">Mumbai Port Hub</strong>
                </>
              )}
            </span>
          </div>
        </motion.div>

        {/* ── STAGE 3: SELECT WORKSPACE MODAL (Clean, Focused, Premium) ───── */}
        <AnimatePresence>
          {showPersona && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 30 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute z-40 w-full max-w-[840px] px-6"
            >
              <div className="relative rounded-3xl border border-white/[0.12] bg-[#0A0E17]/95 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl overflow-hidden">
                <BorderBeam size={250} duration={12} delay={9} colorFrom="#34C795" colorTo="#38BDF8" />
                
                <div className="text-center space-y-3 mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Cross-Border B2B Intelligence Engine</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--text-primary)]">
                    Select Your Trade Perspective
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
                    Customized escrow protocols, real-time customs intelligence, and automated document verification.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Option 1: Importer Persona */}
                  <button
                    onClick={() => handleSelectRole("buyer")}
                    className="p-6 rounded-2xl border border-white/[0.08] bg-[#121824]/60 hover:bg-[#162030] hover:border-cyan-500/50 text-left transition-all group flex flex-col justify-between space-y-5 cursor-pointer shadow-lg hover:shadow-cyan-500/10"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display font-bold text-lg text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors">
                          I am an Importer
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          Source agricultural commodities, lock escrow safely, and verify supplier credentials before release.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Source Commodities</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Option 2: Exporter Persona */}
                  <button
                    onClick={() => handleSelectRole("exporter")}
                    className="p-6 rounded-2xl border border-white/[0.08] bg-[#121824]/60 hover:bg-[#162030] hover:border-emerald-500/50 text-left transition-all group flex flex-col justify-between space-y-5 cursor-pointer shadow-lg hover:shadow-emerald-500/10"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display font-bold text-lg text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
                          I am an Exporter
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          List verified product batches, match with global buyer demand, and receive guaranteed escrow payouts.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                      <span>List Export Catalog</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between text-xs text-[var(--text-secondary)] font-mono">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Multi-Sig Smart Vault Protected</span>
                  </div>
                  <Link
                    to="/dashboard"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
                  >
                    <span>Direct Demo Command Center</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
