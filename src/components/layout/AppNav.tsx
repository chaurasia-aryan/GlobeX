import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Building2,
  Globe2,
  ChevronDown,
  Search,
  Menu,
  X,
  LogOut,
  ArrowLeftRight,
} from "lucide-react";
import CommandPalette from "@/components/common/CommandPalette";
import LifecycleRail from "@/components/layout/LifecycleRail";

/**
 * Renders only when businessType === "BOTH" (canSwitchDirection). Pinned
 * EXPORTER/IMPORTER orgs get a static, non-interactive badge instead — the
 * direction is a fact about the org, not a user preference.
 */
const DirectionControl: React.FC = () => {
  const { activeDirection, setActiveDirection, canSwitchDirection } = useWorkspace();

  if (!canSwitchDirection) {
    return (
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface-2)] text-xs font-medium text-[var(--text-secondary)]">
        <span>{activeDirection === "Export" ? "Exporter" : "Importer"}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActiveDirection(activeDirection === "Export" ? "Import" : "Export")}
      className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface-1)] hover:border-[var(--brand)]/40 hover:bg-[var(--brand-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors cursor-pointer"
      title="Switch trade direction"
    >
      <ArrowLeftRight className="w-3.5 h-3.5" />
      <span>{activeDirection === "Export" ? "Exporting" : "Importing"}</span>
    </button>
  );
};

export const AppNav: React.FC = () => {
  const { user, logout, isExporterView } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAccountMenuOpen(false);
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setAccountMenuOpen(false);
    await logout();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[var(--surface-1)]/95 backdrop-blur-md border-b border-[var(--hairline)] select-none">
        <div className="w-full px-3 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: brand + org */}
          <div className="flex items-center gap-4 min-w-0">
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--brand-subtle)] border border-[var(--brand)]/25 flex items-center justify-center transition-colors group-hover:border-[var(--brand)]/50">
                <Globe2 className="w-4 h-4 text-[var(--brand)]" />
              </div>
              <span className="font-display font-bold text-base tracking-tight text-[var(--text-primary)]">
                GlobeX<span className="text-[var(--brand)]">AI</span>
              </span>
            </Link>

            <div className="hidden lg:block w-px h-6 bg-[var(--hairline)]" />

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--hairline)] max-w-[200px] text-xs text-[var(--text-secondary)]">
              <Building2 className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
              <span className="truncate font-medium" title={user.companyName}>
                {user.companyName}
              </span>
            </div>
          </div>

          {/* Right: search, direction, account */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs text-[var(--text-tertiary)] transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
              <kbd className="ml-2 text-[10px] font-mono px-1 py-0.5 rounded border border-[var(--hairline)] text-[var(--text-muted)]">
                &#8984;K
              </kbd>
            </button>

            <DirectionControl />

            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-md)] text-xs border transition-colors cursor-pointer",
                  accountMenuOpen
                    ? "bg-[var(--surface-3)] border-[var(--hairline-strong)] text-[var(--text-primary)]"
                    : "bg-[var(--surface-1)] border-[var(--hairline)] hover:bg-[var(--surface-2)] text-[var(--text-secondary)]"
                )}
              >
                <div className="w-6 h-6 rounded-[var(--radius-sm)] flex items-center justify-center text-[11px] font-bold text-white bg-[var(--brand)] shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden sm:block text-left leading-none">
                  <div className="font-semibold text-[var(--text-primary)] text-xs truncate max-w-[90px]">
                    {user.name ? user.name.split(" ")[0] : "User"}
                  </div>
                  <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                    {user.roleTitle || "Admin"}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>

              <AnimatePresence>
                {accountMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-11 w-64 p-2.5 rounded-[var(--radius-lg)] bg-[var(--surface-1)] border border-[var(--hairline-strong)] shadow-xl z-50 space-y-2 text-xs"
                  >
                    <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--hairline)] space-y-1">
                      <div className="font-bold text-[var(--text-primary)] text-sm">{user.name}</div>
                      <div className="text-[var(--text-tertiary)] flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate">{user.companyName}</span>
                      </div>
                      <div className="text-[var(--text-muted)] font-mono text-[10px]">{user.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--hairline)] text-[var(--text-secondary)] hover:border-[var(--red)]/30 hover:bg-[var(--red-dim)] hover:text-[var(--red)] transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => setMobileDrawerOpen((v) => !v)}
              className="lg:hidden p-2 rounded-[var(--radius-md)] border border-[var(--hairline)] text-[var(--text-secondary)] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileDrawerOpen && (
            <div className="fixed inset-0 top-16 z-50 flex justify-end lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileDrawerOpen(false)}
                className="absolute inset-0 bg-black/40"
              />
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 32 }}
                className="relative w-full max-w-xs h-[calc(100vh-4rem)] bg-[var(--surface-1)] border-l border-[var(--hairline)] p-4 overflow-y-auto"
              >
                <LifecycleRail mobile />
              </motion.aside>
            </div>
          )}
        </AnimatePresence>
      </header>

      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </>
  );
};

export default AppNav;
