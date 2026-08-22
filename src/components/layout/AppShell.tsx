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
  maxWidth = "full",
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
    <div className="min-h-screen bg-[var(--surface-0)] text-[var(--text-primary)] font-sans flex flex-col antialiased selection:bg-emerald-500/20 selection:text-emerald-300 transition-colors duration-200">
      {/* Subtle ambient lighting layer (non-distracting, calm) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 -z-10 dark:block hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.08), transparent 70%)",
        }}
      />

      {showHeader && <RoleNavigation />}

      <div className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-6 py-4 relative">
        {/* Full-width Main Operations Surface */}
        <main
          className={cn(
            "w-full min-w-0 space-y-6",
            maxWidthClasses,
            className
          )}
        >
          {children}
        </main>
      </div>

      {/* Clean minimal footer */}
      <footer className="border-t border-[var(--hairline)] py-5 px-4 text-center text-xs text-[var(--text-tertiary)] font-sans transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GLOBEX AI — Verified Cross-Border Trade & Programmable Escrow Settlement</span>
          <span className="font-mono text-[11px] text-[var(--text-muted)]">CEPA Schedule Rules · EVM Verified</span>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
