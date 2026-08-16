import { useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Balancer from "react-wrap-balancer";
import TradeGlobe, { TradeGlobeRef } from "@/components/TradeGlobe";
import { SAMPLE_DATA, aggregateByCountry } from "@/lib/tradeData";
import { appwriteService } from "@/services/appwrite/client";
import SplitText from "@/components/ui/split-text";
import BorderBeam from "@/components/ui/border-beam";
import SpecularButton from "@/components/ui/SpecularButton";
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
    const mumbaiLat = 19.0760;
    const mumbaiLng = 72.8777;
    const mumbaiAlt = 0.36;

    let lat = startLat;
    let lng = startLng;
    let altitude = startAlt;

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
          className="absolute w-[800px] h-[800px] sm:w-[950px] sm:h-[950px] lg:w-[1100px] lg:h-[1100px] flex items-center justify-center pointer-events-auto z-10"
        >
          <TradeGlobe
            ref={globeRef}
            aggregatedData={aggregatedData}
            selectedCountry="India"
            showArcs={true}
            autoRotate={isOverviewStage}
          />
        </motion.div>

        {/* ── STAGE 1: CLEAN HERO VIEW (Headline, Subtext, Smooth Scroll Cue) ── */}
        <motion.div
          style={{
            opacity: heroOpacity,
            y: heroY,
            pointerEvents: heroPointerEvents,
          }}
          className="absolute left-6 sm:left-12 lg:left-20 max-w-[540px] space-y-6 z-20 pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121822]/85 border border-white/[0.12] text-xs text-[var(--text-secondary)] backdrop-blur-md shadow-md pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-[var(--emerald)] animate-pulse" />
            <span>Global Trade Made Simple & Safe</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-display font-extrabold tracking-tight leading-[1.05] text-[var(--text-primary)] pointer-events-auto">
            <Balancer>
              <SplitText text="Trade globally." delay={0.1} className="justify-start font-display font-extrabold" />
              <span className="font-serif italic text-[var(--emerald)] text-5xl sm:text-6xl inline-block mt-1 font-normal tracking-wide">
                <SplitText text="With confidence." delay={0.4} className="justify-start font-serif italic" />
              </span>
            </Balancer>
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-sans pointer-events-auto">
            Connect with verified international buyers and sellers, verify trade papers automatically, and protect every payment safely.
          </p>

          {/* Smooth Pulsing Scroll Cue */}
          <div className="pt-8 flex items-center gap-3 text-xs font-mono text-[var(--text-secondary)] pointer-events-auto">
            <div className="w-8 h-8 rounded-full border border-white/[0.15] bg-[#111824]/80 flex items-center justify-center animate-bounce shadow-lg text-[var(--emerald)]">
              <ChevronDown className="w-4 h-4" />
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

        {/* ── STAGE 3: DESTINATION VIEW — BUTTER-SMOOTH PERSONA POPUP ─────────── */}
        <AnimatePresence>
          {showPersona && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 24,
                mass: 0.7,
              }}
              className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 lg:p-8 pointer-events-auto"
            >
              <div className="w-full max-w-4xl space-y-6">
                
                {/* Header with Mumbai Port Badge */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-xs font-mono text-[var(--emerald)] backdrop-blur-md shadow-lg">
                    <Anchor className="w-3.5 h-3.5" />
                    <span>MUMBAI TRADE GATEWAY (JNPT NHAVA SHEVA · INNSA)</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight text-[var(--text-primary)]">
                    Select Your Trade Role
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans max-w-lg mx-auto">
                    Connect your enterprise to the trusted cross-border execution network with automated compliance & smart escrow.
                  </p>
                </div>

                {/* Two Big High-Tech Persona Cards with Spring Hover */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Option 1: Importer (Buyer) */}
                  <motion.div
                    whileHover={{ scale: 1.025, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => handleSelectRole("buyer")}
                    className="group relative p-6 sm:p-8 rounded-3xl border border-cyan-500/25 bg-[#101726]/95 backdrop-blur-2xl hover:border-cyan-400/60 hover:bg-[#141E30] transition-all cursor-pointer shadow-[0_20px_60px_rgba(0,0,0,0.65)] space-y-5 overflow-hidden"
                  >
                    <BorderBeam size={220} duration={9} colorFrom="#0ea5e9" colorTo="#38bdf8" />

                    <div className="flex items-center justify-between relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40">
                        BUYER SOURCING
                      </span>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <h3 className="text-xl sm:text-2xl font-display font-bold text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors">
                        I am an Importer
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                        Source verified agri-commodities, textiles, and materials from India. Enjoy automated OCR verification, cargo inspection tracking, and conditional escrow release.
                      </p>
                    </div>

                    <div className="pt-3 flex items-center justify-between relative z-10 border-t border-white/[0.08]">
                      <span className="text-xs text-[var(--text-tertiary)] font-mono">0% CEPA Preferential Duty</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] group-hover:translate-x-1.5 transition-transform">
                        <span>Enter as Importer</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Option 2: Exporter (Seller) */}
                  <motion.div
                    whileHover={{ scale: 1.025, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => handleSelectRole("exporter")}
                    className="group relative p-6 sm:p-8 rounded-3xl border border-emerald-500/25 bg-[#0F1A24]/95 backdrop-blur-2xl hover:border-emerald-400/60 hover:bg-[#13222E] transition-all cursor-pointer shadow-[0_20px_60px_rgba(0,0,0,0.65)] space-y-5 overflow-hidden"
                  >
                    <BorderBeam size={220} duration={9} colorFrom="#10b981" colorTo="#34d399" />

                    <div className="flex items-center justify-between relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-[var(--emerald)] group-hover:scale-110 transition-transform">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40">
                        EXPORTER SELLER
                      </span>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <h3 className="text-xl sm:text-2xl font-display font-bold text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
                        I am an Exporter
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                        List verified catalog inventory, access global Tier-1 international buyers, and guarantee 100% upfront multi-sig escrow collateral before dispatch.
                      </p>
                    </div>

                    <div className="pt-3 flex items-center justify-between relative z-10 border-t border-white/[0.08]">
                      <span className="text-xs text-[var(--text-tertiary)] font-mono">100% Guaranteed Escrow</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--emerald)] group-hover:translate-x-1.5 transition-transform">
                        <span>Enter as Exporter</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Quick Flagship Demo Callout */}
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0A1018]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--emerald)] animate-pulse" />
                    <span className="text-[var(--text-secondary)]">
                      Live Corridor:{" "}
                      <strong className="text-[var(--text-primary)]">
                        500t Basmati Rice · India (Nhava Sheva) ➔ UAE (Jebel Ali) · $550,000 USDC
                      </strong>
                    </span>
                  </div>
                  <Link to="/trades/TRD-IND-UAE-550K">
                    <SpecularButton size="sm" radius={10} lineColor="#5EC9DB" baseColor="#132235">
                      <span>Open Flagship Workspace</span>
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    </SpecularButton>
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
