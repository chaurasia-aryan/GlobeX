import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWorkspace, RoleType } from "@/context/WorkspaceContext";
import { appwriteService } from "@/services/appwrite/client";
import { ArrowRight, ShoppingBag, Building2 } from "lucide-react";
import PrimaryAction from "@/components/common/PrimaryAction";

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useWorkspace();
  const [role, setSelectedRole] = useState<RoleType>("buyer");
  const [email, setEmail] = useState("tariq.mansoor@alfuttaim-global.ae");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRole(role);
    await appwriteService.login(email, role);
    setTimeout(() => {
      navigate("/dashboard");
    }, 300);
  };

  const handleRoleChange = (newRole: RoleType) => {
    setSelectedRole(newRole);
    if (newRole === "buyer") {
      setEmail("tariq.mansoor@alfuttaim-global.ae");
    } else {
      setEmail("rajesh.sharma@abcglobaltrade.com");
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0E] text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans select-none relative">
      <div className="w-full max-w-md p-8 rounded-3xl border border-white/[0.08] bg-[#0C121D] shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>INSTITUTIONAL LOGIN</span>
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-white">
            Sign in to GLOBEX
          </h1>
          <p className="text-xs text-slate-400">
            Access your active trade workspace & escrow contracts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Workspace Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange("buyer")}
                className={`py-2 px-3 rounded-xl text-xs font-sans transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                  role === "buyer"
                    ? "bg-sky-500/15 border-sky-500/40 text-sky-300 font-semibold"
                    : "bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buyer (Importer)</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("exporter")}
                className={`py-2 px-3 rounded-xl text-xs font-sans transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                  role === "exporter"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold"
                    : "bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Exporter (Seller)</span>
              </button>
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Corporate Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#101726] border border-white/[0.08] focus:border-emerald-500 text-xs text-white outline-none font-sans"
            />
          </div>

          <PrimaryAction
            type="submit"
            isLoading={isSubmitting}
            className="w-full"
          >
            <span>Sign In to Workspace</span>
          </PrimaryAction>
        </form>

        <div className="text-center pt-2 border-t border-white/[0.06]">
          <span className="text-xs text-slate-400">First time trading on GLOBEX? </span>
          <Link to="/onboarding" className="text-xs text-emerald-400 hover:underline font-medium">
            Choose workspace →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
