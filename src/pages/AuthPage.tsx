import React from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#070A0E] text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans select-none overflow-x-hidden relative">
      {/* Background ambient lighting */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(56, 189, 248, 0.12) 0%, transparent 60%), radial-gradient(circle at 75% 75%, rgba(52, 199, 149, 0.08) 0%, transparent 50%)",
        }}
      />
      <AuthShell onSuccess={() => navigate("/dashboard")} />
    </div>
  );
};

export default AuthPage;
