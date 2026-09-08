import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModernSidebar from "@/components/layout/ModernSidebar";
import ModernTopBar from "@/components/layout/ModernTopBar";
import { useWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  showHeader?: boolean;
  hideRail?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  maxWidth = "full",
  className,
  showHeader = true,
  hideRail = false,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { activeDirection } = useWorkspace();

  const maxWidthClasses = {
    sm: "max-w-3xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  }[maxWidth];

  return (
    <div className="min-h-screen bg-[var(--surface-0)] text-[var(--text-primary)] font-sans flex antialiased selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* 1. Desktop Sidebar */}
      {!hideRail && (
        <div className="hidden lg:block h-screen sticky top-0 z-30">
          <ModernSidebar />
        </div>
      )}

      {/* 2. Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {!hideRail && mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative w-72 max-w-[85vw] h-full bg-[var(--surface-1)] z-10 shadow-2xl flex flex-col"
            >
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-3 p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-white bg-[var(--surface-2)] border border-[var(--hairline)] z-20 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
              <ModernSidebar onCloseMobile={() => setMobileSidebarOpen(false)} className="w-full" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Main Stage */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Direction status line indicator */}
        <div className="h-[2px] w-full bg-[var(--hairline)] relative overflow-hidden">
          <motion.div
            key={activeDirection}
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "absolute inset-0",
              activeDirection === "Export"
                ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500"
                : "bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400"
            )}
          />
        </div>

        {/* Modern TopBar */}
        {showHeader && (
          <ModernTopBar onToggleSidebar={() => setMobileSidebarOpen((v) => !v)} />
        )}

        {/* Main Body */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
          <motion.div
            key={activeDirection}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn("w-full mx-auto space-y-6", maxWidthClasses, className)}
          >
            {children}
          </motion.div>
        </main>

        {/* Sleek FinTech Terminal Footer */}
        <footer className="border-t border-[var(--hairline)] py-4 px-6 text-xs text-[var(--text-tertiary)] font-mono bg-[var(--surface-1)]/50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[var(--text-secondary)]">
                GlobeX OS · Verified Bilateral Settlement &amp; Programmable Escrow
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>EVM Smart Contract: 0x5FbD...aa3B</span>
              <span>·</span>
              <span>CEPA Rule Engine v2.4</span>
              <span>·</span>
              <span className="text-emerald-400">TLS 1.3 Strict</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppShell;
