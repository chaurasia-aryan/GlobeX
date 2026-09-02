import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "@/context/AuthContext";
import SpecularButton from "@/components/ui/SpecularButton";
import { Globe2, Building2, Mail, Lock, Eye, EyeOff, User, ShieldCheck, AlertCircle, Zap } from "lucide-react";
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
  const { signIn, signUp } = useAuthContext();

  const [activeTab, setActiveTab] = useState<"signin" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [fullName, setFullName] = useState<string>("");
  const [organizationName, setOrganizationName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [registrationFile, setRegistrationFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read selected document."));
    reader.readAsDataURL(file);
  });

  const handleRegistrationFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    if (!["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Upload a PDF, JPEG, PNG, or WebP document.");
      event.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFormError("Document must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }
    setFormError(null);
    setRegistrationFile(file);
  };

  const splitName = (name: string): [string, string] => {
    const parts = name.trim().split(/\s+/);
    return [parts[0] || "New", parts.slice(1).join(" ") || "Member"];
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      if (onSuccess) onSuccess();
      else navigate("/home");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoSignIn = async (demoEmail: string) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      setEmail(demoEmail);
      setPassword("demo1234");
      await signIn(demoEmail, "demo1234");
      if (onSuccess) onSuccess();
      else navigate("/home");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const [firstName, lastName] = splitName(fullName);
      if (!organizationName.trim()) {
        throw new Error("Organization name is required.");
      }
      const document = registrationFile
        ? {
            fileName: registrationFile.name,
            mimeType: registrationFile.type,
            documentType: "COMPANY_REGISTRATION",
            data: await readFileAsDataUrl(registrationFile),
          }
        : null;
      await signUp(email, password, firstName, lastName, organizationName.trim(), document);
      navigate("/home");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("w-full flex items-center justify-center p-2 sm:p-4 select-none font-sans", className)}>
      <div
        className={cn(
          "w-full max-w-[460px] rounded-3xl p-5 sm:p-7 overflow-hidden flex flex-col justify-between",
          "bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)]",
          "shadow-2xl shadow-black/10 dark:shadow-black/50 transition-all duration-200"
        )}
      >
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] mb-5">
          <button
            type="button"
            onClick={() => { setActiveTab("signin"); setFormError(null); }}
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
            onClick={() => { setActiveTab("register"); setFormError(null); }}
            className={cn(
              "py-2 px-3 sm:px-4 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center gap-2",
              activeTab === "register"
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Building2 className="w-3.5 h-3.5 text-[var(--brand-cyan)]" />
            <span>Create Account</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "signin" ? (
            <motion.div
              key="signin-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                    Sign in to GlobeX
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--brand-teal)] px-2 py-0.5 rounded bg-[var(--success-bg)] border border-[var(--brand-teal)]/30 font-semibold">
                    TLS-256
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Access verified cross-border trade operations &amp; smart escrow.
                </p>
              </div>

              {/* ⚡ Quick 1-Click Demo Profiles */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    Instant Portfolio Sample Access
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">1-Click Auto Login</span>
                </div>

                {/* Primary Aryan Credential Button */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoSignIn("aryan@1980")}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs transition flex items-center justify-between shadow-md cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>👑</span>
                    <span>Sign In as Aryan</span>
                  </span>
                  <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded font-mono">aryan@1980</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoSignIn("exporter.demo@globex.org")}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                  >
                    🇮🇳 Exporter Org
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoSignIn("importer.uae@globex.ae")}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-50 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-[11px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                  >
                    🇦🇪 Importer Org
                  </button>
                </div>
              </div>

              <form onSubmit={handleSignInSubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] text-[11px] flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-[var(--text-tertiary)]" />
                      <span>Username / Email</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Sample: aryan@1980</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aryan@1980 or name@organization.com"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--brand-teal)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] text-[11px] flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-[var(--text-tertiary)]" />
                      <span>Password</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Sample: password123</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
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

                {formError && (
                  <div className="flex items-start gap-2 text-[11px] text-[var(--status-blocked)] bg-[var(--status-blocked-bg)] rounded-lg px-2.5 py-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-0.5">
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[var(--brand-teal)]" />
                    <span>EVM Escrow Protocol</span>
                  </span>
                </div>

                <div className="pt-2">
                  <SpecularButton
                    type="submit"
                    size="md"
                    radius={12}
                    variant="emerald"
                    isLoading={isSubmitting}
                    className="w-full justify-center"
                  >
                    Sign In &amp; Launch Workspace &#8594;
                  </SpecularButton>
                </div>
              </form>

              <button
                type="button"
                onClick={() => navigate("/super-admin/login")}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 text-[11px] font-mono font-semibold text-[var(--text-secondary)] hover:border-red-500/40 hover:text-red-500 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Super Admin Login (Verification Portal)
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="register-tab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                    Create your account
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--brand-cyan)] px-2 py-0.5 rounded bg-[var(--info-bg)] border border-[var(--brand-cyan)]/30 font-semibold">
                    Instant Setup
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Register your trading enterprise and access bilateral AI intelligence.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] text-[11px] flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3 h-3 text-[var(--text-tertiary)]" />
                    <span>Organization Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="e.g. Apex Commodities Global Ltd"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--brand-cyan)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] text-[11px] flex items-center gap-1.5 font-medium">
                    <User className="w-3 h-3 text-[var(--text-tertiary)]" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--brand-cyan)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] text-[11px] flex items-center gap-1.5 font-medium">
                    <Mail className="w-3 h-3 text-[var(--text-tertiary)]" />
                    <span>Business Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trader@organization.com"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--brand-cyan)]"
                  />
                </div>

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
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--brand-cyan)] font-mono"
                  />
                </div>

                {formError && (
                  <div className="flex items-start gap-2 text-[11px] text-[var(--status-blocked)] bg-[var(--status-blocked-bg)] rounded-lg px-2.5 py-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="pt-2">
                  <SpecularButton
                    type="submit"
                    size="md"
                    radius={12}
                    variant="cyan"
                    isLoading={isSubmitting}
                    className="w-full justify-center"
                  >
                    Complete Registration &#8594;
                  </SpecularButton>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthAccordion;
