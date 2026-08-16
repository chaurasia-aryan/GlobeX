import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { appwriteService } from "@/services/appwrite/client";
import { Globe2, ArrowRight, CheckCircle2 } from "lucide-react";

export const AuthPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"exporter" | "buyer">("exporter");
  const [email, setEmail] = useState("rajesh.sharma@abcglobaltrade.com");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await appwriteService.login(email, role);
    setTimeout(() => {
      navigate("/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--text-primary)] flex items-center justify-center p-6 font-sans select-none">
      <div className="w-full max-w-md p-8 rounded-2xl border border-[var(--hairline)] bg-[var(--panel)] shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--panel-raised)] border border-[var(--hairline)] text-xs text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)]" />
            <span>INSTITUTIONAL LOGIN</span>
          </div>
          <h1 className="text-2xl font-display font-medium tracking-tight text-[var(--text-primary)]">
            Sign in to GLOBEX
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Access your active trade workspaces, escrow contracts, and telemetry.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Trading Capacity (Exporter vs Importer) */}
          <div className="space-y-1.5">
            <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Trading Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole("exporter");
                  setEmail("rajesh.sharma@abcglobaltrade.com");
                }}
                className={`py-2 px-3 rounded-lg text-xs font-sans transition-all border ${
                  role === "exporter"
                    ? "bg-[var(--panel-raised)] border-[var(--hairline-strong)] text-[var(--text-primary)] font-semibold"
                    : "bg-[var(--ink)] border-[var(--hairline)] text-[var(--text-secondary)]"
                }`}
              >
                Exporter (Seller)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("buyer");
                  setEmail("tariq.mansoor@alfuttaim-import.ae");
                }}
                className={`py-2 px-3 rounded-lg text-xs font-sans transition-all border ${
                  role === "buyer"
                    ? "bg-[var(--panel-raised)] border-[var(--hairline-strong)] text-[var(--text-primary)] font-semibold"
                    : "bg-[var(--ink)] border-[var(--hairline)] text-[var(--text-secondary)]"
                }`}
              >
                Importer (Buyer)
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Corporate Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[var(--panel-raised)] border border-[var(--hairline)] text-xs text-[var(--text-primary)] focus:border-[var(--hairline-strong)] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-[var(--ink)] font-semibold text-xs flex items-center justify-center gap-2 transition-opacity shadow-md"
          >
            <span>{isSubmitting ? "Authenticating..." : "Sign In to Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[var(--hairline)]">
          <span className="text-xs text-[var(--text-secondary)]">New to GLOBEX? </span>
          <Link to="/onboarding" className="text-xs text-[var(--accent)] hover:underline font-medium">
            Start role onboarding →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
