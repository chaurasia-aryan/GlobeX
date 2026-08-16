import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWorkspace, RoleType } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Briefcase,
  ShieldCheck,
  Globe2,
  FileCheck2,
  Search,
  ChevronDown,
  Package,
  Coins,
  Ship,
  Scale,
  Database,
  Layers,
  Menu,
  X,
  Command,
  RefreshCw,
  LogOut,
} from "lucide-react";
import CommandPalette from "@/components/common/CommandPalette";
import PillNav, { PillNavItem } from "@/components/ui/PillNav";

export const RoleNavigation: React.FC = () => {
  const {
    user,
    role,
    setRole,
    logout,
  } = useWorkspace();
  const location = useLocation();

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route changes
  useEffect(() => {
    setAccountMenuOpen(false);
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Primary 5 Core Navigation Items
  const pillNavItems: PillNavItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Trade Requests", href: "/trade-requests" },
    { label: "Active Trades", href: "/trades/TRD-IND-UAE-550K" },
    { label: "Documents", href: "/documents" },
  ];

  // Secondary Tools for drawer
  const secondaryNavItems = [
    { label: "My Export Listings", href: "/my-listings", icon: Package, desc: "Organization export catalog" },
    { label: "Smart Escrow Vault", href: "/escrow", icon: Coins, desc: "Programmable multi-sig settlement" },
    { label: "Shipment Telemetry", href: "/shipments", icon: Ship, desc: "Live AIS satellite tracking" },
    { label: "Disputes & Arbitration", href: "/disputes", icon: Scale, desc: "Human-in-the-loop dispute resolution" },
    { label: "Audit Ledger", href: "/blockchain", icon: Database, desc: "On-chain cryptographic evidence" },
    { label: "System Health", href: "/admin", icon: Layers, desc: "FastAPI, n8n, Appwrite & EVM state" },
  ];

  const handleSwitchRole = (targetRole: RoleType) => {
    setRole(targetRole);
    setAccountMenuOpen(false);
  };

  return (
    <>
      {/* ── Seamless Header (80px desktop height, NO visible bottom border) ─ */}
      <header className="sticky top-0 z-40 w-full bg-[#070A0E]/95 backdrop-blur-md select-none">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-5">
          
          {/* ── Left: Brand Logo & Organization Breathing Room ───────────── */}
          <div className="flex items-center gap-4 shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 border border-emerald-500/30 group-hover:border-emerald-400/60 flex items-center justify-center transition-all shadow-sm">
                <Globe2 className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg tracking-wider text-white">
                  GLOBEX
                </span>
                <span className="hidden sm:inline text-[9px] font-mono text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                  AI
                </span>
              </div>
            </Link>

            {/* Separator Pipe */}
            <div className="hidden lg:block w-px h-7 bg-white/[0.08]" />

            {/* Organization Context Pill */}
            <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0C121D] border border-white/[0.06] max-w-[240px] text-xs">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-200 truncate font-medium text-xs" title={user.companyName}>
                {user.companyName}
              </span>
            </div>
          </div>

          {/* ── Center: Restrained Global Navigation Group ─────────────────── */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-2xl mx-auto">
            <PillNav
              items={pillNavItems}
              activeHref={location.pathname}
              embedded={true}
              hideLogo={true}
              baseColor="#070A0E"
              pillColor="rgba(255, 255, 255, 0.05)"
              hoveredPillTextColor="#19D3AE"
              pillTextColor="#94A3B8"
              initialLoadAnimation={false}
            />
          </div>

          {/* ── Right: Search Command Trigger & User Profile ───────────── */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Global Search Trigger (Ctrl + K) */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2.5 h-10 px-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] text-slate-400 hover:text-white transition-all text-xs cursor-pointer"
              title="Search workspaces, corridors, and tools (Ctrl + K)"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden xl:inline text-slate-400 text-xs">Search</span>
              <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white/[0.04] border border-white/[0.08] rounded">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </kbd>
            </button>

            {/* Account & Role Switcher */}
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans transition-all cursor-pointer border",
                  accountMenuOpen
                    ? "bg-white/[0.1] border-white/[0.15] text-white"
                    : "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] text-slate-300"
                )}
              >
                <div className="w-6.5 h-6.5 rounded-lg flex items-center justify-center text-xs font-bold text-black bg-emerald-400 shrink-0">
                  {user.name ? user.name.charAt(0) : "J"}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-white text-xs leading-none truncate max-w-[90px]">
                    {user.name ? user.name.split(" ")[0] : "John"}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 leading-tight mt-0.5">
                    {user.roleTitle || "Admin"}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Account Popover Menu */}
              <AnimatePresence>
                {accountMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-12 w-72 p-3 rounded-2xl bg-[#0C121D] border border-white/[0.1] shadow-2xl z-50 space-y-3 text-xs font-sans"
                  >
                    {/* Organization & User entity details */}
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                          {user.roleTitle}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="font-bold text-white text-sm">{user.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        <span className="truncate">{user.companyName}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">{user.email}</div>
                    </div>

                    {/* Switch Organization Role */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 font-bold">
                        Switch Role
                      </div>

                      <div className="grid grid-cols-1 gap-1">
                        <button
                          type="button"
                          onClick={() => handleSwitchRole("admin")}
                          className={cn(
                            "w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer text-xs",
                            role === "admin"
                              ? "bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30"
                              : "hover:bg-white/[0.04] text-slate-300"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Admin (Org Lead)</span>
                          </div>
                          {role === "admin" && <span className="text-[10px] font-mono text-emerald-400 font-bold">ACTIVE</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSwitchRole("compliance")}
                          className={cn(
                            "w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer text-xs",
                            role === "compliance"
                              ? "bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30"
                              : "hover:bg-white/[0.04] text-slate-300"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Compliance Officer</span>
                          </div>
                          {role === "compliance" && <span className="text-[10px] font-mono text-indigo-400 font-bold">ACTIVE</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSwitchRole("salesman")}
                          className={cn(
                            "w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer text-xs",
                            role === "salesman"
                              ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30"
                              : "hover:bg-white/[0.04] text-slate-300"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                            <span>Trader / Salesman</span>
                          </div>
                          {role === "salesman" && <span className="text-[10px] font-mono text-amber-400 font-bold">ACTIVE</span>}
                        </button>
                      </div>
                    </div>

                    {/* Secondary platform links */}
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                      <Link
                        to="/login"
                        className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Switch Account</span>
                      </Link>
                      <Link
                        to="/"
                        className="hover:text-white transition-colors"
                      >
                        Globe View
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Navigation Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="md:hidden p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Navigation Menu"
              aria-label="Toggle navigation menu"
            >
              {mobileDrawerOpen ? <X className="w-4 h-4 text-emerald-400" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* ── Mobile Slide-Over Navigation Drawer ───────────────────────── */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <div className="fixed inset-0 top-20 z-50 flex justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileDrawerOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              />

              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 32 }}
                className="relative w-full max-w-sm h-[calc(100vh-5rem)] bg-[#0C121D] border-l border-white/[0.08] p-5 overflow-y-auto flex flex-col justify-between"
              >
                <div className="space-y-5">
                  {/* Primary Workspaces */}
                  <div className="space-y-2 border-b border-white/[0.06] pb-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 font-bold">
                      Primary Workspace
                    </span>
                    <div className="space-y-1">
                      {pillNavItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setMobileDrawerOpen(false)}
                            className={cn(
                              "flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors",
                              isActive
                                ? "bg-white/[0.08] text-white font-semibold border border-white/[0.1]"
                                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                            )}
                          >
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Secondary Modules */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 font-bold">
                      Secondary Modules & Tools
                    </span>
                    <div className="space-y-1">
                      {secondaryNavItems.map((sec) => {
                        const Icon = sec.icon;
                        const isActive = location.pathname.startsWith(sec.href);
                        return (
                          <Link
                            key={sec.href}
                            to={sec.href}
                            onClick={() => setMobileDrawerOpen(false)}
                            className={cn(
                              "flex items-start gap-3 p-2.5 rounded-xl border transition-all",
                              isActive
                                ? "bg-white/[0.06] border-white/[0.12] text-white"
                                : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.03] text-slate-400 hover:text-white"
                            )}
                          >
                            <div className="w-7 h-7 rounded-lg bg-[#111A29] border border-white/[0.06] flex items-center justify-center text-slate-300 mt-0.5 shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-white">
                                {sec.label}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {sec.desc}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-white/[0.06] text-[11px] font-mono text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>EVM Node Active</span>
                  </span>
                  <span className="text-slate-400">CEPA Engine</span>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </>
  );
};

export default RoleNavigation;
