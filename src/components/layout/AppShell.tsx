import React from "react";
import RoleNavigation from "@/components/layout/RoleNavigation";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  showHeader?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  maxWidth = "lg",
  className,
  showHeader = true,
}) => {
  const maxWidthClasses = {
    sm: "max-w-3xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  }[maxWidth];

  return (
    <div className="min-h-screen bg-[#070A0E] text-slate-100 font-sans flex flex-col antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Subtle ambient lighting layer (non-distracting, calm) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.08), transparent 70%)",
        }}
      />

      {showHeader && <RoleNavigation />}

      <main
        className={cn(
          "flex-1 w-full mx-auto px-4 sm:px-6 py-6 space-y-6",
          maxWidthClasses,
          className
        )}
      >
        {children}
      </main>

      {/* Clean minimal footer */}
      <footer className="border-t border-white/[0.06] py-6 px-4 text-center text-xs text-slate-400 font-sans">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GLOBEX AI — Verified Cross-Border Trade & Programmable Escrow Settlement</span>
          <span className="font-mono text-[11px] text-slate-400">CEPA Schedule Rules · EVM Verified</span>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
