import { useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Balancer from "react-wrap-balancer";
import TradeGlobe, { TradeGlobeRef } from "@/components/TradeGlobe";
import { SAMPLE_DATA, aggregateByCountry } from "@/lib/tradeData";
import { appwriteService, OrganizationRole, UploadedDoc } from "@/services/appwrite/client";
import SplitText from "@/components/ui/split-text";
import BorderBeam from "@/components/ui/border-beam";
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  Upload,
  FileText,
  CheckCircle2,
  Trash2,
  User,
  Mail,
  Shield,
  Briefcase,
  ChevronDown,
  ExternalLink,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<TradeGlobeRef>(null);
  const initialPovRef = useRef<{ lat: number; lng: number; altitude: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Auth Form State
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [orgName, setOrgName] = useState("ABC Global Exports & Imports Ltd");
  const [adminName, setAdminName] = useState("Rajesh Sharma");
  const [email, setEmail] = useState("admin@abcglobaltrade.com");
  const [role, setSelectedRole] = useState<OrganizationRole>("admin");
  const [country, setCountry] = useState("India (JNPT / Nhava Sheva)");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Document Upload State
  const [documents, setDocuments] = useState<UploadedDoc[]>([
    {
      id: "doc_1",
      name: "IEC_Certificate_GovIndia.pdf",
      size: "2.4 MB",
      type: "IEC License",
      uploadTime: "Verified",
    },
    {
      id: "doc_2",
      name: "GSTIN_Incorporation_27AABCA.pdf",
      size: "1.1 MB",
      type: "GSTIN Registration",
      uploadTime: "Verified",
    },
  ]);

  // Dynamic Multi-Stage Camera: Starts from exact live screen point -> Centers India -> Zooms into Mumbai
  useMotionValueEvent(smoothProgress, "change", (progress) => {
    const isPastThreshold = progress >= 0.62;
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
      // Stage 2: Gentle zoom into Mumbai Port
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

  // Handle file picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file, idx) => ({
        id: `doc_${Date.now()}_${idx}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.name.toLowerCase().includes("iec")
          ? "IEC License"
          : file.name.toLowerCase().includes("gst")
          ? "GSTIN Registration"
          : "Commercial Trade Doc",
        uploadTime: "Uploaded",
      }));
      setDocuments((prev) => [...newFiles, ...prev]);
    }
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (authMode === "signup") {
      await appwriteService.register({
        adminName,
        organizationName: orgName,
        email,
        role,
        country,
        documents,
      });
    } else {
      await appwriteService.login(email, role, orgName);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/dashboard");
    }, 400);
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
            <span>Scroll down to register organization & enter workspace</span>
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

        {/* ── STAGE 3: INTERACTIVE SIGN UP & SIGN IN PORTAL ───── */}
        <AnimatePresence>
          {showPersona && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 30 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute z-40 w-full max-w-[760px] px-4 sm:px-6 max-h-[92vh] overflow-y-auto"
            >
              <div className="relative rounded-3xl border border-white/[0.12] bg-[#0A0E17]/95 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl overflow-hidden">
                <BorderBeam size={260} duration={10} delay={0} colorFrom="#34C795" colorTo="#38BDF8" />
                
                {/* Header & Mode Switcher */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/[0.08] pb-5 mb-5">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>ENTERPRISE TRADE GATEWAY</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white mt-1">
                      {authMode === "signup" ? "Create Organization Account" : "Sign In to Workspace"}
                    </h2>
                  </div>

                  {/* Mode Pill Toggle */}
                  <div className="flex items-center p-1 rounded-xl bg-[#111824] border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        authMode === "signup"
                          ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Sign Up
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode("signin")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        authMode === "signin"
                          ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Sign In
                    </button>
                  </div>
                </div>

                {/* Main Auth Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === "signup" ? (
                    <>
                      {/* Sign Up Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Organization Name */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Organization Name</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            placeholder="e.g. ABC Global Exports & Imports Ltd"
                            className="w-full px-3 py-2 rounded-xl bg-[#121824] border border-white/[0.08] focus:border-emerald-500 text-xs text-white outline-none transition-colors"
                          />
                        </div>

                        {/* Admin Name (Full Name) */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Admin Name (Full Name)</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            placeholder="e.g. Rajesh Sharma (Org Admin)"
                            className="w-full px-3 py-2 rounded-xl bg-[#121824] border border-white/[0.08] focus:border-emerald-500 text-xs text-white outline-none transition-colors"
                          />
                        </div>

                        {/* Corporate Email */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Corporate Email</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@organization.com"
                            className="w-full px-3 py-2 rounded-xl bg-[#121824] border border-white/[0.08] focus:border-emerald-500 text-xs text-white outline-none transition-colors"
                          />
                        </div>

                        {/* Organization Role Dropdown */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Organization Role</span>
                          </label>
                          <select
                            value={role}
                            onChange={(e) => setSelectedRole(e.target.value as OrganizationRole)}
                            className="w-full px-3 py-2 rounded-xl bg-[#121824] border border-white/[0.08] focus:border-emerald-500 text-xs text-white outline-none cursor-pointer transition-colors"
                          >
                            <option value="admin" className="bg-[#0C121D] text-white">
                              Admin (Full Enterprise Access)
                            </option>
                            <option value="compliance" className="bg-[#0C121D] text-white">
                              Compliance Officer (Regulatory & Verification)
                            </option>
                            <option value="salesman" className="bg-[#0C121D] text-white">
                              Salesman (Commercial Contracts & Orders)
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* ADD DOCUMENTS SECTION */}
                      <div className="pt-2">
                        <div className="p-3.5 rounded-2xl bg-[#0D1420] border border-white/[0.08] space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="text-xs font-display font-bold text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-sky-400" />
                                <span>Add Documents & KYC Credentials</span>
                              </div>
                              <p className="text-[11px] text-slate-400">
                                Upload IEC, GSTIN, Company Incorporation, or Trade Licenses
                              </p>
                            </div>

                            {/* Hidden file input */}
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                              onChange={handleFileChange}
                              className="hidden"
                            />

                            {/* Upload Button */}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-xs font-medium transition-all cursor-pointer shadow-sm shrink-0"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Add Documents</span>
                            </button>
                          </div>

                          {/* Uploaded Document Chips */}
                          <div className="space-y-1.5">
                            {documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#111824] border border-white/[0.06] text-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  <span className="text-white font-mono truncate max-w-[200px] sm:max-w-[280px]">
                                    {doc.name}
                                  </span>
                                  <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] text-slate-400 font-mono">
                                    {doc.size}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                                    {doc.type}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDoc(doc.id)}
                                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                                  title="Remove document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Sign In Fields */}
                      <div className="space-y-3.5">
                        {/* Organization Name */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Registered Organization</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            placeholder="e.g. ABC Global Exports & Imports Ltd"
                            className="w-full px-3 py-2.5 rounded-xl bg-[#121824] border border-white/[0.08] focus:border-emerald-500 text-xs text-white outline-none transition-colors"
                          />
                        </div>

                        {/* Role Dropdown */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Your Role</span>
                          </label>
                          <select
                            value={role}
                            onChange={(e) => setSelectedRole(e.target.value as OrganizationRole)}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#121824] border border-white/[0.08] focus:border-emerald-500 text-xs text-white outline-none cursor-pointer transition-colors"
                          >
                            <option value="admin" className="bg-[#0C121D] text-white">
                              Admin (Full Enterprise Workspace)
                            </option>
                            <option value="compliance" className="bg-[#0C121D] text-white">
                              Compliance Officer (Regulatory & Verification)
                            </option>
                            <option value="salesman" className="bg-[#0C121D] text-white">
                              Salesman (Commercial Contracts & Orders)
                            </option>
                          </select>
                        </div>

                        {/* Corporate Email */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Corporate Email</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@organization.com"
                            className="w-full px-3 py-2.5 rounded-xl bg-[#121824] border border-white/[0.08] focus:border-emerald-500 text-xs text-white outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Submit Action Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-display font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                          <span>Connecting Workspace...</span>
                        </div>
                      ) : (
                        <>
                          <span>
                            {authMode === "signup"
                              ? "Create Organization Account & Launch Workspace"
                              : "Sign In to Organization Workspace"}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer Switcher */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CEPA Verified · Zero-Backend Local Sandbox</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === "signup" ? "signin" : "signup")}
                    className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium cursor-pointer"
                  >
                    {authMode === "signup"
                      ? "Already registered? Sign In →"
                      : "New Organization? Sign Up & Add Docs →"}
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

