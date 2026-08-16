import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { appwriteService } from "@/services/appwrite/client";
import { Building, ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck, Upload } from "lucide-react";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"exporter" | "buyer" | null>(null);
  const [step, setStep] = useState<"role-select" | "kyc" | "complete">("role-select");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("India");
  const [taxId, setTaxId] = useState("");

  const handleRoleSelect = (role: "exporter" | "buyer") => {
    setSelectedRole(role);
    if (role === "exporter") {
      setCompanyName("ABC Global Exports Ltd");
      setEmail("rajesh.sharma@abcglobaltrade.com");
      setCountry("India");
      setTaxId("27AABCA1234F1Z9");
    } else {
      setCompanyName("Al-Futtaim Global LLC");
      setEmail("tariq.mansoor@alfuttaim-import.ae");
      setCountry("United Arab Emirates");
      setTaxId("100294829100003");
    }
    setStep("kyc");
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    await appwriteService.login(email, selectedRole);
    setStep("complete");
    setTimeout(() => {
      navigate("/dashboard");
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--text-primary)] flex items-center justify-center p-6 sm:p-10 font-sans select-none">
      <div className="w-full max-w-xl p-8 rounded-2xl border border-[var(--hairline)] bg-[var(--panel)] shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--panel-raised)] border border-[var(--hairline)] text-xs text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)]" />
            <span>GLOBEX ONBOARDING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-[var(--text-primary)]">
            {step === "role-select" && "What is your role in global trade?"}
            {step === "kyc" && "Corporate Profile & KYC Verification"}
            {step === "complete" && "Verification Complete"}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            {step === "role-select" && "Select your trading capacity to configure your verified workspace."}
            {step === "kyc" && `Configure corporate entity details for ${selectedRole === "exporter" ? "Exporter / Seller" : "Importer / Buyer"}.`}
            {step === "complete" && "Your institutional identity has been established on-chain."}
          </p>
        </div>

        {/* STEP 1: Role Selection (Exporter vs Importer ONLY) */}
        {step === "role-select" && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Exporter Option */}
              <button
                type="button"
                onClick={() => handleRoleSelect("exporter")}
                className="p-5 rounded-xl border border-[var(--hairline)] bg-[var(--panel-raised)] hover:border-[var(--hairline-strong)] text-left space-y-3 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-dim)] text-[var(--emerald)] flex items-center justify-center border border-[var(--hairline)] group-hover:scale-105 transition-transform">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--text-primary)]">Exporter / Seller</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    List export commodities, discover international buyers, manage document verification, and lock USDC escrow.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 text-xs text-[var(--accent)] font-medium pt-1">
                  <span>Continue as Exporter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Importer Option */}
              <button
                type="button"
                onClick={() => handleRoleSelect("buyer")}
                className="p-5 rounded-xl border border-[var(--hairline)] bg-[var(--panel-raised)] hover:border-[var(--hairline-strong)] text-left space-y-3 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-dim)] text-[var(--accent)] flex items-center justify-center border border-[var(--hairline)] group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--text-primary)]">Importer / Buyer</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    Source verified commodities, evaluate counterparty trust scores, and deposit programmable smart escrow.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 text-xs text-[var(--accent)] font-medium pt-1">
                  <span>Continue as Importer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* Existing User Link */}
            <div className="text-center pt-4 border-t border-[var(--hairline)]">
              <span className="text-xs text-[var(--text-secondary)]">Already registered? </span>
              <Link
                to="/login"
                className="text-xs text-[var(--accent)] hover:underline font-medium"
              >
                Sign in to your dashboard →
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: KYC Details */}
        {step === "kyc" && (
          <form onSubmit={handleKycSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--panel-raised)] border border-[var(--hairline)] text-xs text-[var(--text-primary)] focus:border-[var(--hairline-strong)] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Country of Origin</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--panel-raised)] border border-[var(--hairline)] text-xs text-[var(--text-primary)] focus:border-[var(--hairline-strong)] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="space-y-1">
                <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Tax Registration / GSTIN / TIN</label>
                <input
                  type="text"
                  required
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--panel-raised)] border border-[var(--hairline)] text-xs text-[var(--text-primary)] font-mono focus:border-[var(--hairline-strong)] outline-none"
                />
              </div>
            </div>

            {/* Document Upload Simulator */}
            <div className="p-3.5 rounded-xl border border-dashed border-[var(--hairline-strong)] bg-[var(--panel-raised)] text-center space-y-1">
              <Upload className="w-5 h-5 text-[var(--text-secondary)] mx-auto" />
              <div className="text-xs text-[var(--text-primary)]">
                Certificate of Incorporation & Trade License
              </div>
              <div className="text-[11px] text-[var(--emerald)] font-medium">Pre-verified demo certificate attached</div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep("role-select")}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-[var(--ink)] font-semibold text-xs transition-opacity shadow-md"
              >
                Submit KYC & Launch Workspace
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Complete State */}
        {step === "complete" && (
          <div className="p-6 rounded-xl bg-[var(--panel-raised)] border border-[var(--hairline)] text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[var(--emerald)] mx-auto" />
            <h3 className="font-semibold text-[var(--text-primary)] text-sm">Identity & KYC Verified</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Welcome to GLOBEX AI. Redirecting to your {selectedRole?.toUpperCase()} workspace...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
