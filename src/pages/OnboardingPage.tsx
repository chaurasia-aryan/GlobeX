import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWorkspace, RoleType } from "@/context/WorkspaceContext";
import { ShoppingBag, Building2, ArrowRight, ShieldCheck } from "lucide-react";
import PrimaryAction from "@/components/common/PrimaryAction";

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useWorkspace();
  const [selectedRole, setSelectedRole] = useState<RoleType>("buyer");

  const handleSelectAndProceed = (role: RoleType) => {
    setSelectedRole(role);
    setRole(role);
    navigate(role === "buyer" ? "/marketplace" : "/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#070A0E] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none relative">
      {/* Background ambient glow (very subtle) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(56, 189, 248, 0.08), transparent 70%)",
        }}
      />

      <div className="w-full max-w-xl space-y-8 relative z-10">
        
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>GLOBEX AI PROTOCOL</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Choose your workspace
          </h1>

          <p className="text-sm text-slate-400">
            What are you doing?
          </p>
        </div>

        {/* The Two Choices (One Decision Philosophy) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Choice 1: Importing */}
          <button
            type="button"
            onClick={() => handleSelectAndProceed("buyer")}
            className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121D] hover:bg-[#101726] hover:border-sky-500/50 text-left transition-all group flex flex-col justify-between space-y-5 cursor-pointer shadow-lg"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h2 className="font-display font-bold text-lg text-white group-hover:text-sky-400 transition-colors">
                  IMPORTING
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Buy goods from verified international suppliers.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-sky-400 group-hover:translate-x-0.5 transition-transform">
              <span>Open Buyer Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Choice 2: Exporting */}
          <button
            type="button"
            onClick={() => handleSelectAndProceed("exporter")}
            className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121D] hover:bg-[#101726] hover:border-emerald-500/50 text-left transition-all group flex flex-col justify-between space-y-5 cursor-pointer shadow-lg"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h2 className="font-display font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                  EXPORTING
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sell goods to verified international buyers.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
              <span>Open Exporter Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

        </div>

        {/* Calm footnote */}
        <div className="text-center space-y-4 pt-2">
          <p className="text-xs text-slate-400 font-sans">
            You can switch workspace anytime from your account menu.
          </p>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-center gap-4 text-xs text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">
              Sign in with existing credentials →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OnboardingPage;
