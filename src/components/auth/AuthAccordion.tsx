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

export interface AuthAccordionProps {
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

  const [activeTab, setActiveTab] = useState<"signin" | "register">(initialMode);
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
      {/* ── Enterprise Institutional Auth Card (Consistent Semantic Surface) ── */}
      <div
        className={cn(
          "w-full max-w-[540px] rounded-3xl p-5 sm:p-7 overflow-hidden flex flex-col justify-between",
          "bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)]",
          "shadow-2xl shadow-black/10 dark:shadow-black/50 transition-all duration-200"
        )}
      >
        {/* ── SEGMENTED TOP TOGGLE SWITCH ──────────────────────────────────── */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("signin")}
            className={cn(
              "py-2 px-3 sm:px-4 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center gap-2",
              activeTab === "signin"
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Globe2 className="w-3.5 h-3.5 text-[var(--brand-teal)]" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={cn(
              "py-2 px-3 sm:px-4 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center gap-2",
              activeTab === "register"
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Building2 className="w-3.5 h-3.5 text-[var(--brand-cyan)]" />
            <span>Register Org</span>
          </button>
        </div>

        {/* ── ACTIVE FORM CONTAINER WITH MOTION TRANSITION ──────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "signin" ? (
            /* ══════════════════════════════════════════════════════════════ */
            /* ── VIEW 1: SIGN IN FORM ────────────────────────────────────── */
            /* ══════════════════════════════════════════════════════════════ */
            <motion.div
              key="signin-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                    Sign in to GLOBEX
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--brand-teal)] px-2 py-0.5 rounded bg-[var(--success-bg)] border border-[var(--brand-teal)]/30 font-semibold">
                    TLS-256
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Access verified cross-border trade operations & smart escrow.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSignInSubmit} className="space-y-3 text-xs">
                {/* Active Persona Role */}
                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] text-[11px] flex items-center gap-1.5 font-medium">
                    <Briefcase className="w-3 h-3 text-[var(--text-tertiary)]" />
                    <span>Active Persona Role</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs outline-none cursor-pointer focus:border-[var(--brand-teal)]"
                  >
                    <option value="admin">Admin (John Doe · Example Global)</option>
                    <option value="compliance">Compliance Officer (Jane Doe)</option>
                    <option value="salesman">Trader / Sales Lead (Alex Morgan)</option>
                  </select>
                </div>

                {/* Corporate Email */}
                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] text-[11px] flex items-center gap-1.5 font-medium">
                    <Mail className="w-3 h-3 text-[var(--text-tertiary)]" />
                    <span>Corporate Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--brand-teal)]"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <label className="text-[var(--text-secondary)] flex items-center gap-1.5 font-medium">
                      <Lock className="w-3 h-3 text-[var(--text-tertiary)]" />
                      <span>Password</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("Password reset link sent to your corporate email.")}
                      className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--brand-teal)] transition-colors cursor-pointer"
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
                      className="w-full px-3 py-2 pr-9 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--brand-teal)] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Remember session */}
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--brand-teal)] cursor-pointer"
                    />
                    <span className="text-[11px]">Remember session</span>
                  </label>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[var(--brand-teal)]" />
                    <span>EVM Escrow</span>
                  </span>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <SpecularButton
                    type="submit"
                    size="md"
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
              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                <div className="text-center text-[10px] text-[var(--text-tertiary)] uppercase font-mono tracking-wider">
                  Or continue with SSO
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Google", "Azure", "GitHub"].map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => alert(`SSO Authentication via ${provider} initiated.`)}
                      className="py-2 px-2 rounded-xl bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-mono transition-colors cursor-pointer text-center"
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              </div>

              {/* Demo Quick Fill Pills */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
                <span>Demo Fill:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickPersona("admin", "John Doe", "Example Global Trading Ltd.", "john.doe@example.com")}
                    className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPersona("compliance", "Jane Doe", "Example Global Trading Ltd.", "jane.doe@example.com")}
                    className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                  >
                    Compliance
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPersona("salesman", "Alex Morgan", "Example Global Trading Ltd.", "alex.morgan@example.com")}
                    className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                  >
                    Trader
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ══════════════════════════════════════════════════════════════ */
            /* ── VIEW 2: REGISTER ORGANIZATION FORM ───────────────────────── */
            /* ══════════════════════════════════════════════════════════════ */
            <motion.div
              key="register-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                    Register Organization
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--brand-cyan)] px-2 py-0.5 rounded bg-[var(--info-bg)] border border-[var(--brand-cyan)]/30 font-semibold">
                    Enterprise KYC
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Create an institutional workspace for global export & trade.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                {/* Organization Legal Name */}
                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] text-[11px] flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3 h-3 text-[var(--text-tertiary)]" />
                    <span>Organization Legal Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Example Global Trading Ltd."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--brand-cyan)]"
                  />
                </div>

                {/* Role / Representative Row */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[var(--text-secondary)] text-[11px] flex items-center gap-1.5 font-medium">
                      <Briefcase className="w-3 h-3 text-[var(--text-tertiary)]" />
                      <span>Entity Type</span>
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs outline-none cursor-pointer"
                    >
                      <option value="admin">Admin (Org Lead)</option>
                      <option value="compliance">Compliance Officer</option>
                      <option value="salesman">Trader / Sales Lead</option>
                      <option value="exporter">Exporter / Supplier</option>
                      <option value="buyer">Importer / Buyer</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[var(--text-secondary)] text-[11px] flex items-center gap-1.5 font-medium">
                      <User className="w-3 h-3 text-[var(--text-tertiary)]" />
                      <span>Representative</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--brand-cyan)]"
                    />
                  </div>
                </div>

                {/* Corporate Email */}
                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] text-[11px] flex items-center gap-1.5 font-medium">
                    <Mail className="w-3 h-3 text-[var(--text-tertiary)]" />
                    <span>Corporate Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@organization.com"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--brand-cyan)]"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] text-[11px] flex items-center gap-1.5 font-medium">
                    <Lock className="w-3 h-3 text-[var(--text-tertiary)]" />
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--brand-cyan)] font-mono"
                  />
                </div>

                {/* Register Submit Button */}
                <div className="pt-2">
                  <SpecularButton
                    type="submit"
                    size="md"
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
              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                <div className="text-center text-[10px] text-[var(--text-tertiary)] uppercase font-mono tracking-wider">
                  Or continue with SSO
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Google", "Azure", "GitHub"].map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => alert(`SSO Authentication via ${provider} initiated.`)}
                      className="py-2 px-2 rounded-xl bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-mono transition-colors cursor-pointer text-center"
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthAccordion;

/* ═════════════════════════════════════════════════════════════════════════
   ── ACCORDION IMPLEMENTATION (PRESERVED FOR ROLLBACK IF NEEDED) ─────────
   ═════════════════════════════════════════════════════════════════════════

export const AuthAccordionPrevious: React.FC<AuthAccordionProps> = ({
  onSuccess,
  className = "",
  initialMode = "signin",
}) => {
  const navigate = useNavigate();
  const { login, register } = useWorkspace();
  const [activePanel, setActivePanel] = useState<"signin" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orgName, setOrgName] = useState<string>("Example Global Trading Ltd.");
  const [adminName, setAdminName] = useState<string>("John Doe");
  const [email, setEmail] = useState<string>("john.doe@example.com");
  const [password, setPassword] = useState<string>("••••••••••••");
  const [role, setSelectedRole] = useState<RoleType>("admin");
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  return (
    <div className={cn("w-full flex items-center justify-center p-2 sm:p-4 select-none font-sans", className)}>
      <div
        style={{
          background: "rgba(5, 10, 18, 0.78)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        className="w-full max-w-[740px] md:aspect-[1.08/1] max-h-[84vh] rounded-3xl p-3 sm:p-4.5 overflow-hidden flex flex-col justify-between border border-[rgba(80,180,220,0.12)] shadow-2xl"
      >
        <div className="flex-1 flex flex-col md:flex-row items-stretch gap-2.5 min-h-0 overflow-hidden">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={cn(
              "rounded-2xl border transition-all duration-250 overflow-hidden flex flex-col justify-between",
              activePanel === "signin"
                ? "md:flex-[0.72] bg-[#0A0F18]/95 border-white/[0.12] p-5 sm:p-6 shadow-xl cursor-default"
                : "md:flex-[0.28] bg-[#070A0E]/50 border-white/[0.05] hover:bg-white/[0.04] p-4 hover:border-white/[0.12] cursor-pointer"
            )}
            onClick={() => { if (activePanel !== "signin") setActivePanel("signin"); }}
          >
            {activePanel === "signin" ? (
              <div>Sign In Active Panel Content</div>
            ) : (
              <div className="h-full flex flex-col justify-between items-center py-6 text-center">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 [writing-mode:vertical-lr] rotate-180">Sign In</span>
                <span className="text-[10px] font-mono text-emerald-400">Active Member</span>
              </div>
            )}
          </motion.div>

          <motion.div
            layout
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={cn(
              "rounded-2xl border transition-all duration-250 overflow-hidden flex flex-col justify-between",
              activePanel === "register"
                ? "md:flex-[0.72] bg-[#0A0F18]/95 border-white/[0.12] p-5 sm:p-6 shadow-xl cursor-default"
                : "md:flex-[0.28] bg-[#070A0E]/50 border-white/[0.05] hover:bg-white/[0.04] p-4 hover:border-white/[0.12] cursor-pointer"
            )}
            onClick={() => { if (activePanel !== "register") setActivePanel("register"); }}
          >
            {activePanel === "register" ? (
              <div>Register Org Active Panel Content</div>
            ) : (
              <div className="h-full flex flex-col justify-between items-center py-6 text-center">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 [writing-mode:vertical-lr] rotate-180">Register Org</span>
                <span className="text-[10px] font-mono text-sky-400">New Entity</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
═════════════════════════════════════════════════════════════════════════ */
