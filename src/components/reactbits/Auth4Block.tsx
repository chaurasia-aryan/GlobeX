import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWorkspace, RoleType } from "@/context/WorkspaceContext";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  Globe2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import PrimaryAction from "@/components/common/PrimaryAction";
import { cn } from "@/lib/utils";

export interface Auth4BlockProps {
  onSuccess?: () => void;
  className?: string;
  isCompact?: boolean;
}

export const Auth4Block: React.FC<Auth4BlockProps> = ({
  onSuccess,
  className = "",
}) => {
  const navigate = useNavigate();
  const { login, register } = useWorkspace();

  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [orgName, setOrgName] = useState<string>("Acme Global Trading Ltd.");
  const [adminName, setAdminName] = useState<string>("John Doe");
  const [email, setEmail] = useState<string>("john.doe@acmeglobaltrade.com");
  const [password, setPassword] = useState<string>("••••••••••••");
  const [role, setSelectedRole] = useState<RoleType>("admin");
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState<boolean>(false);

  // Quick Demo Account switcher
  const handleQuickDemo = (demoRole: RoleType, demoName: string, demoOrg: string, demoEmail: string) => {
    setSelectedRole(demoRole);
    setAdminName(demoName);
    setOrgName(demoOrg);
    setEmail(demoEmail);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (authMode === "signup") {
      await register({
        adminName,
        organizationName: orgName,
        email,
        role,
      });
    } else {
      await login(email, role, orgName);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard");
      }
    }, 300);
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsSubmitting(true);
    await login(`sso.${provider.toLowerCase()}@${orgName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`, role, orgName);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard");
      }
    }, 300);
  };

  return (
    <div className={cn("w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#070A0E] text-slate-100 font-sans selection:bg-emerald-500/20 selection:text-emerald-300", className)}>
      
      {/* ── LEFT COLUMN: AUTHENTICATION FORM (Primary Task) ────────────── */}
      <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen bg-[#070A0E] border-r border-white/[0.06] relative z-10">
        
        {/* Top Brand Bar */}
        <div className="flex items-center justify-between gap-4 w-full">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Globe2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-sm tracking-wider text-white">
                GLOBEX
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                AI
              </span>
            </div>
          </Link>

          {/* Segmented Auth Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#0C121D] border border-white/[0.07]">
            <button
              type="button"
              onClick={() => setAuthMode("signin")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer",
                authMode === "signin"
                  ? "bg-white/[0.1] text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer",
                authMode === "signup"
                  ? "bg-emerald-500 text-black font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8 space-y-6">
          
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              {authMode === "signin" ? "Sign in to GLOBEX" : "Register Organization"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Access your cross-border trade operations workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {/* Registration fields */}
            {authMode === "signup" && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <label className="text-xs font-sans font-medium text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Organization Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Al-Futtaim Global Trade LLC"
                    className="w-full px-3 py-2 rounded-xl bg-[#0C121D] border border-white/[0.08] focus:border-white/[0.2] text-xs text-white outline-none transition-colors placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-sans font-medium text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Role / Perspective</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0C121D] border border-white/[0.08] focus:border-white/[0.2] text-xs text-white outline-none transition-colors cursor-pointer"
                  >
                    <option value="admin" className="bg-[#0C121D] text-white">
                      Admin (Full Corporate Access)
                    </option>
                    <option value="compliance" className="bg-[#0C121D] text-white">
                      Compliance Officer
                    </option>
                    <option value="salesman" className="bg-[#0C121D] text-white">
                      Trader / Sales Executive
                    </option>
                    <option value="buyer" className="bg-[#0C121D] text-white">
                      Importer / Buyer
                    </option>
                    <option value="exporter" className="bg-[#0C121D] text-white">
                      Exporter / Supplier
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-sans font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Corporate Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-2 rounded-xl bg-[#0C121D] border border-white/[0.08] focus:border-white/[0.2] text-xs text-white outline-none transition-colors placeholder:text-slate-500"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-sans font-medium text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Password</span>
                </label>
                {authMode === "signin" && (
                  <button
                    type="button"
                    onClick={() => alert("Password reset link sent to your registered email.")}
                    className="text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 pr-9 rounded-xl bg-[#0C121D] border border-white/[0.08] focus:border-white/[0.2] text-xs text-white outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/[0.1] bg-[#0C121D] text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span>Remember this session</span>
              </label>
              <span className="text-[11px] font-mono text-slate-500">256-bit TLS</span>
            </div>

            {/* Primary Submit Button */}
            <div className="pt-1">
              <PrimaryAction
                type="submit"
                isLoading={isSubmitting}
                className="w-full justify-center"
              >
                <span>{authMode === "signin" ? "Sign In & Launch Workspace" : "Register Organization"}</span>
              </PrimaryAction>
            </div>

          </form>

          {/* Alternate SSO Logins */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <div className="h-px bg-white/[0.06] flex-1" />
              <span className="text-[11px] font-sans text-slate-500">
                Or continue with
              </span>
              <div className="h-px bg-white/[0.06] flex-1" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleOAuthSignIn("Google")}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-3.1z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 16.1C3.5 20 7.4 23 12 23z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignIn("Microsoft")}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span>Azure</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignIn("GitHub")}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>

          {/* Progressive Disclosure: Demo Accounts */}
          <div className="pt-2 border-t border-white/[0.04]">
            <button
              type="button"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-300 transition-colors py-1 cursor-pointer"
            >
              <span>Demo Persona Quick Fill</span>
              {showDemoAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDemoAccounts && (
              <div className="mt-2 p-2.5 rounded-xl bg-[#0C121D] border border-white/[0.06] space-y-1 text-xs font-mono animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={() => handleQuickDemo("admin", "John Doe", "Acme Global Trading Ltd.", "john.doe@acmeglobaltrade.com")}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-white/[0.04] text-slate-300 hover:text-emerald-400 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>John Doe (Admin)</span>
                  <span className="text-[10px] text-emerald-400 font-bold">LOAD</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo("compliance", "Jane Doe", "Acme Global Trading Ltd.", "jane.doe@acmeglobaltrade.com")}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-white/[0.04] text-slate-300 hover:text-sky-400 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Jane Doe (Compliance)</span>
                  <span className="text-[10px] text-sky-400 font-bold">LOAD</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo("salesman", "Alex Morgan", "Acme Global Trading Ltd.", "alex.morgan@acmeglobaltrade.com")}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-white/[0.04] text-slate-300 hover:text-amber-400 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Alex Morgan (Trader)</span>
                  <span className="text-[10px] text-amber-400 font-bold">LOAD</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Footer Reassurance */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>CEPA Schedule Rules · EVM Verified</span>
          </div>
          <span className="text-[11px] font-mono text-slate-600">© 2026 GLOBEX</span>
        </div>

      </div>

      {/* ── RIGHT COLUMN: CALM, SUBORDINATE VALUE PROPOSITION PANEL ─────── */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col justify-between p-10 lg:p-12 xl:p-14 min-h-screen bg-[#0A0E17] relative">
        
        {/* Network Status */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Cross-Border Trade Network Live</span>
        </div>

        {/* Core Value Props (Max 3, concise) */}
        <div className="space-y-8 my-auto py-6 max-w-[360px]">
          
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">
              Enterprise Trade Infrastructure
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Precision bilateral intelligence, cryptographic escrow settlement, and automated regulatory compliance.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                01 · AI Tariff & Corridor Intelligence
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Automated preferential tariff calculations and instant HS code validation for CEPA corridors.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-sky-400">
                02 · Autonomous Risk & OCR Verification
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Continuous counterparty KYB verification, multi-document cross-reconciliation, and sanction screening.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-400">
                03 · Programmable Escrow Settlement
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Multi-sig smart vaults release collateral upon verified port arrival and customs clearance.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Note */}
        <div className="text-xs text-slate-500 font-sans">
          Institutional infrastructure for global importers, exporters, and trade desks.
        </div>

      </div>

    </div>
  );
};

export default Auth4Block;
