import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace, RoleType } from "@/context/WorkspaceContext";
import SpecularButton from "@/components/ui/SpecularButton";
import {
  Globe2,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthAccordionProps {
  onSuccess?: () => void;
  className?: string;
  initialMode?: "signin" | "register";
}

export const AuthAccordion: React.FC<AuthAccordionProps> = ({
  onSuccess,
  className = "",
  initialMode = "signin",
}) => {
  const navigate = useNavigate();
  const { login, register } = useWorkspace();

  const [activePanel, setActivePanel] = useState<"signin" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [orgName, setOrgName] = useState<string>("Example Global Trading Ltd.");
  const [adminName, setAdminName] = useState<string>("John Doe");
  const [email, setEmail] = useState<string>("john.doe@example.com");
  const [password, setPassword] = useState<string>("••••••••••••");
  const [role, setSelectedRole] = useState<RoleType>("admin");
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Quick Demo Persona Fillers (Sanitized fictional names)
  const handleQuickPersona = (demoRole: RoleType, demoName: string, demoOrg: string, demoEmail: string) => {
    setSelectedRole(demoRole);
    setAdminName(demoName);
    setOrgName(demoOrg);
    setEmail(demoEmail);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(email, role, orgName);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      else navigate("/dashboard");
    }, 300);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await register({
      adminName,
      organizationName: orgName,
      email,
      role,
    });
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      else navigate("/dashboard");
    }, 300);
  };

  return (
    <div className={cn("w-full flex items-center justify-center p-2 sm:p-4 select-none font-sans", className)}>
      {/* ── Outer Near-Square Shell (Aspect Ratio ~1.08:1, max 760px, subtle hover lift) ─ */}
      <div
        style={{
          background: "rgba(5, 10, 18, 0.78)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        className={cn(
          "w-full max-w-[740px] md:aspect-[1.08/1] max-h-[84vh] rounded-3xl p-3 sm:p-4.5 overflow-hidden flex flex-col justify-between",
          "border border-[rgba(80,180,220,0.12)] hover:border-[rgba(80,180,220,0.22)]",
          "shadow-2xl hover:shadow-[0_18px_50px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:scale-[1.005]",
          "transition-all duration-220 ease-out"
        )}
      >
        {/* Horizontal Expanding Accordion Track (Desktop) / Vertical (Mobile) */}
        <div className="flex-1 flex flex-col md:flex-row items-stretch gap-2.5 min-h-0 overflow-hidden">
          
          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ── PANEL 1: SIGN IN ────────────────────────────────────────── */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={cn(
              "rounded-2xl border transition-all duration-250 overflow-hidden flex flex-col justify-between",
              activePanel === "signin"
                ? "md:flex-[0.72] bg-[#0A0F18]/95 border-white/[0.12] p-5 sm:p-6 shadow-xl cursor-default"
                : "md:flex-[0.28] bg-[#070A0E]/50 border-white/[0.05] hover:bg-white/[0.04] p-4 hover:border-white/[0.12] cursor-pointer"
            )}
            onClick={() => {
              if (activePanel !== "signin") setActivePanel("signin");
            }}
            onMouseEnter={() => {
              if (activePanel !== "signin") setActivePanel("signin");
            }}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setActivePanel("signin");
              }
            }}
            aria-expanded={activePanel === "signin"}
            role="region"
            aria-label="Sign In Panel"
          >
            {activePanel === "signin" ? (
              /* ── EXPANDED SIGN IN FORM ── */
              <div className="h-full flex flex-col justify-between space-y-3 overflow-y-auto pr-1">
                {/* Header */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                        <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <span className="font-display font-bold text-sm text-white">
                        Sign in to GLOBEX
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                      TLS-256
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Access your verified cross-border trade operations workspace.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSignInSubmit} className="space-y-2.5 text-xs">
                  {/* Active Persona Role */}
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-500" />
                      <span>Active Persona Role</span>
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                      className="w-full px-3 py-1.5 rounded-xl bg-[#0C121D] border border-white/[0.08] text-white text-xs outline-none cursor-pointer focus:border-emerald-500/40"
                    >
                      <option value="admin">Admin (John Doe · Example Global)</option>
                      <option value="compliance">Compliance Officer (Jane Doe)</option>
                      <option value="salesman">Trader / Sales Lead (Alex Morgan)</option>
                    </select>
                  </div>

                  {/* Corporate Email */}
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>Corporate Email</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.com"
                      className="w-full px-3 py-1.5 rounded-xl bg-[#0C121D] border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500/40"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <label className="text-slate-400 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>Password</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => alert("Password reset link sent to your corporate email.")}
                        className="text-[10px] text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                      >
                        Forgot?
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-1.5 pr-8 rounded-xl bg-[#0C121D] border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500/40 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember session */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-white/[0.1] bg-[#0C121D] text-emerald-500 cursor-pointer"
                      />
                      <span className="text-[11px]">Remember this session</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">Gateway Hub</span>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1">
                    <SpecularButton
                      type="submit"
                      size="sm"
                      radius={12}
                      variant="emerald"
                      isLoading={isSubmitting}
                      className="w-full justify-center"
                    >
                      Sign In & Launch Workspace →
                    </SpecularButton>
                  </div>
                </form>

                {/* Social Login Strip */}
                <div className="space-y-1.5 pt-1.5 border-t border-white/[0.06]">
                  <div className="text-center text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                    Or continue with
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["Google", "Azure", "GitHub"].map((provider) => (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => alert(`SSO Authentication via ${provider} initiated.`)}
                        className="py-1.5 px-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-slate-300 text-xs font-mono transition-colors cursor-pointer text-center"
                      >
                        {provider}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Demo Quick Fill */}
                <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Demo Fill:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuickPersona("admin", "John Doe", "Example Global Trading Ltd.", "john.doe@example.com")}
                      className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 cursor-pointer transition-colors"
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPersona("compliance", "Jane Doe", "Example Global Trading Ltd.", "jane.doe@example.com")}
                      className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 cursor-pointer transition-colors"
                    >
                      Compliance
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPersona("salesman", "Alex Morgan", "Example Global Trading Ltd.", "alex.morgan@example.com")}
                      className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 cursor-pointer transition-colors"
                    >
                      Trader
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── COLLAPSED SIGN IN STRIP ── */
              <div className="h-full flex flex-col justify-between items-center py-6 text-center">
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                
                <div className="space-y-1 my-auto">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block [writing-mode:vertical-lr] rotate-180 mx-auto">
                    Sign In
                  </span>
                </div>

                <div className="text-[10px] font-mono text-emerald-400">
                  Active Member
                </div>
              </div>
            )}
          </motion.div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ── PANEL 2: REGISTER ORGANIZATION ─────────────────────────── */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={cn(
              "rounded-2xl border transition-all duration-250 overflow-hidden flex flex-col justify-between",
              activePanel === "register"
                ? "md:flex-[0.72] bg-[#0A0F18]/95 border-white/[0.12] p-5 sm:p-6 shadow-xl cursor-default"
                : "md:flex-[0.28] bg-[#070A0E]/50 border-white/[0.05] hover:bg-white/[0.04] p-4 hover:border-white/[0.12] cursor-pointer"
            )}
            onClick={() => {
              if (activePanel !== "register") setActivePanel("register");
            }}
            onMouseEnter={() => {
              if (activePanel !== "register") setActivePanel("register");
            }}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setActivePanel("register");
              }
            }}
            aria-expanded={activePanel === "register"}
            role="region"
            aria-label="Register Panel"
          >
            {activePanel === "register" ? (
              /* ── EXPANDED REGISTER FORM ── */
              <div className="h-full flex flex-col justify-between space-y-3 overflow-y-auto pr-1">
                {/* Header */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                        <Building2 className="w-3.5 h-3.5 text-sky-400" />
                      </div>
                      <span className="font-display font-bold text-sm text-white">
                        Create your GLOBEX account
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-sky-400 px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/40">
                      Enterprise KYC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Create an institutional workspace for verified cross-border trade.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleRegisterSubmit} className="space-y-2.5 text-xs">
                  {/* Organization Legal Name */}
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      <span>Organization Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. Example Global Trading Ltd."
                      className="w-full px-3 py-1.5 rounded-xl bg-[#0C121D] border border-white/[0.08] text-white text-xs outline-none focus:border-sky-500/40"
                    />
                  </div>

                  {/* Role / Entity Type */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-500" />
                        <span>Role / Entity</span>
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                        className="w-full px-3 py-1.5 rounded-xl bg-[#0C121D] border border-white/[0.08] text-white text-xs outline-none cursor-pointer"
                      >
                        <option value="admin">Admin (Org Lead)</option>
                        <option value="compliance">Compliance Officer</option>
                        <option value="salesman">Trader / Sales Lead</option>
                        <option value="exporter">Exporter / Supplier</option>
                        <option value="buyer">Importer / Buyer</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 text-[11px] flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>Representative</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-3 py-1.5 rounded-xl bg-[#0C121D] border border-white/[0.08] text-white text-xs outline-none focus:border-sky-500/40"
                      />
                    </div>
                  </div>

                  {/* Corporate Email */}
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>Corporate Email</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@organization.com"
                      className="w-full px-3 py-1.5 rounded-xl bg-[#0C121D] border border-white/[0.08] text-white text-xs outline-none focus:border-sky-500/40"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>Password</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-1.5 rounded-xl bg-[#0C121D] border border-white/[0.08] text-white text-xs outline-none focus:border-sky-500/40 font-mono"
                    />
                  </div>

                  {/* Register Submit Button */}
                  <div className="pt-1">
                    <SpecularButton
                      type="submit"
                      size="sm"
                      radius={12}
                      variant="sky"
                      isLoading={isSubmitting}
                      className="w-full justify-center"
                    >
                      Register Organization →
                    </SpecularButton>
                  </div>
                </form>

                {/* Social Login Strip */}
                <div className="space-y-1.5 pt-1.5 border-t border-white/[0.06]">
                  <div className="text-center text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                    Or continue with
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["Google", "Azure", "GitHub"].map((provider) => (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => alert(`SSO Authentication via ${provider} initiated.`)}
                        className="py-1.5 px-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-slate-300 text-xs font-mono transition-colors cursor-pointer text-center"
                      >
                        {provider}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ── COLLAPSED REGISTER STRIP ── */
              <div className="h-full flex flex-col justify-between items-center py-6 text-center">
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>

                <div className="space-y-1 my-auto">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block [writing-mode:vertical-lr] rotate-180 mx-auto">
                    Register Org
                  </span>
                </div>

                <div className="text-[10px] font-mono text-sky-400">
                  New Entity
                </div>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default AuthAccordion;
