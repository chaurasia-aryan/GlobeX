import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWorkspace, RoleType, DutyMode } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  Workflow,
  FileCheck2,
  Search,
  ChevronDown,
  User,
  LogOut,
  RefreshCw,
  Coins,
  Ship,
  Scale,
  Database,
  Layers,
  Menu,
  X,
  Building2,
  Briefcase,
  ShieldCheck,
  Globe2,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Package,
} from "lucide-react";

export const RoleNavigation: React.FC = () => {
  const {
    user,
    role,
    setRole,
    dutyMode,
    setDutyMode,
    roleLabel,
    roleAccentColor,
  } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route changes
  useEffect(() => {
    setAccountMenuOpen(false);
    setDrawerOpen(false);
  }, [location.pathname]);

  // Click outside to close account menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Unified Single-Page Navigation Links (Combines both Import and Export duties with distinct tags)
  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      dutyBadge: "Dual",
      dutyColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      label: "Marketplace",
      href: "/marketplace",
      icon: Store,
      dutyBadge: "Import Duty",
      dutyColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    },
    {
      label: "My Export Listings",
      href: "/my-listings",
      icon: Package,
      dutyBadge: "Export Duty",
      dutyColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      label: "Trade Requests",
      href: "/trade-requests",
      icon: PlusCircle,
      dutyBadge: "RFQs & Orders",
      dutyColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
    {
      label: "Active Trades",
      href: "/trades/TRD-IND-UAE-550K",
      icon: Workflow,
      isLive: true,
      dutyBadge: "Inbound & Outbound",
      dutyColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    },
    {
      label: "Documents",
      href: "/documents",
      icon: FileCheck2,
      dutyBadge: "Customs & COO",
      dutyColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    },
  ];


  const secondaryModules = [
    { label: "Smart Escrow Vault", href: "/escrow", icon: Coins, desc: "Multi-sig collateral & conditional release", duty: "Escrow Protocol" },
    { label: "Live Shipment Telemetry", href: "/shipments", icon: Ship, desc: "AIS vessel tracking & container sensors", duty: "Inbound & Outbound" },
    { label: "Disputes & Arbitration", href: "/disputes", icon: Scale, desc: "Human-in-the-loop dispute resolution", duty: "Arbitration" },
    { label: "Blockchain Audit Ledger", href: "/blockchain", icon: Database, desc: "On-chain document & hash verification", duty: "Immutable Proof" },
    { label: "System Health & Architecture", href: "/admin", icon: Layers, desc: "EVM node, FastAPI, n8n, & Appwrite state", duty: "Infrastructure" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSwitchRole = (targetRole: RoleType) => {
    setRole(targetRole);
    setAccountMenuOpen(false);
  };

  const handleSwitchDuty = (mode: DutyMode) => {
    setDutyMode(mode);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070A0E]/85 backdrop-blur-2xl border-b border-white/[0.06] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* ── Brand Logo + Organization Tag ─────────────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 border border-emerald-500/40 group-hover:border-emerald-400 flex items-center justify-center transition-all shadow-[0_0_12px_rgba(52,199,149,0.15)]">
              <Globe2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-sm tracking-[0.14em] text-white">
                GLOBEX
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold -mt-0.5 tracking-wider">
                TRADE AI
              </span>
            </div>
          </Link>

          {/* Active Organization Pill in Header */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#0D1420] border border-white/[0.08] max-w-[210px] text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-200 truncate font-sans text-[11px]" title={user.companyName}>
              {user.companyName}
            </span>
          </div>
        </div>

        {/* ── Duty Distinction Filter Pill Switcher (Central) ───────────────── */}
        <div className="flex items-center p-1 rounded-xl bg-[#0C121D] border border-white/[0.08] shrink-0">
          <button
            type="button"
            onClick={() => handleSwitchDuty("dual")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer",
              dutyMode === "dual"
                ? "bg-gradient-to-r from-emerald-500/20 to-sky-500/20 border border-emerald-500/40 text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            )}
            title="Unified View: Both Import & Export Operations"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Dual View</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchDuty("import")}
            className={cn(
              "flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer",
              dutyMode === "import"
                ? "bg-sky-500/20 border border-sky-500/40 text-sky-300 shadow-sm font-bold"
                : "text-slate-400 hover:text-sky-300"
            )}
            title="Focus on Inbound Imports & Sourcing"
          >
            <ArrowDownLeft className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">Import Duty</span>
            <span className="sm:hidden">Import</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchDuty("export")}
            className={cn(
              "flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer",
              dutyMode === "export"
                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-sm font-bold"
                : "text-slate-400 hover:text-emerald-300"
            )}
            title="Focus on Outbound Exports & Listings"
          >
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Export Duty</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>

        {/* ── Primary Navigation Links (Desktop) ─────────────────────────── */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all",
                  isActive
                    ? "bg-white/[0.08] text-white border border-white/[0.12]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <Icon className="w-3.5 h-3.5 opacity-80 shrink-0" />
                <span>{item.label}</span>
                {item.isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Search, Role Switcher & Account Menu ───────────────────────── */}
        <div className="flex items-center gap-2">
          
          {/* Quick Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden 2xl:flex items-center w-44 h-8 px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.07] focus-within:bg-white/[0.08] transition-all border border-white/[0.06]"
          >
            <Search className="w-3 h-3 text-slate-500 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search corridor, HS..."
              className="w-full bg-transparent border-none outline-none text-[11px] text-white placeholder:text-slate-500 font-sans"
            />
          </form>

          {/* Account & Role Switcher Popover */}
          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-sans transition-all cursor-pointer border",
                accountMenuOpen
                  ? "bg-white/[0.12] border-white/[0.2] text-white"
                  : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] text-slate-300"
              )}
            >
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold text-black bg-emerald-400 shrink-0"
              >
                {user.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-white leading-none truncate max-w-[100px]">
                  {user.name.split(" ")[0]}
                </div>
                <div className="text-[10px] font-mono text-emerald-400 leading-tight">
                  {user.roleTitle || "Admin"}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Account Popover Menu */}
            <AnimatePresence>
              {accountMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 w-72 p-3 rounded-2xl bg-[#0C121D] border border-white/[0.12] shadow-2xl z-50 space-y-3 text-xs font-sans"
                >
                  {/* Organization & User entity details */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                        {user.roleTitle}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="font-bold text-white text-sm">{user.name}</div>
                    <div className="text-[11px] text-slate-300 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{user.companyName}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">{user.email}</div>
                  </div>

                  {/* Switch Organization Role */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1 font-bold">
                      Switch Role (Frontend Preview)
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
                        {role === "admin" && <span className="text-[10px] font-mono font-bold text-emerald-400">ACTIVE</span>}
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
                        {role === "compliance" && <span className="text-[10px] font-mono font-bold text-indigo-400">ACTIVE</span>}
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
                          <span>Salesman</span>
                        </div>
                        {role === "salesman" && <span className="text-[10px] font-mono font-bold text-amber-400">ACTIVE</span>}
                      </button>
                    </div>
                  </div>

                  {/* Registered Documents */}
                  {user.documents && user.documents.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.06] space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1 font-bold">
                        Verified KYC Documents ({user.documents.length})
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {user.documents.map((doc) => (
                          <div key={doc.id} className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[10px] font-mono flex items-center justify-between">
                            <span className="truncate text-slate-300 max-w-[150px]">{doc.name}</span>
                            <span className="text-emerald-400">{doc.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
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

          {/* Mobile / All Tools Drawer Trigger */}
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-all cursor-pointer"
            title="All Tools & Secondary Modules"
            aria-label="Toggle navigation drawer"
          >
            {drawerOpen ? <X className="w-4 h-4 text-emerald-400" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* ── Slide-Over Unified Modules Drawer ─────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 top-14 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="relative w-full max-w-sm h-[calc(100vh-3.5rem)] bg-[#090E17] border-l border-white/[0.08] p-5 overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-5">
                {/* Navigation Links for Mobile */}
                <div className="space-y-2 border-b border-white/[0.08] pb-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1 font-bold">
                    Primary Operations
                  </span>
                  <div className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => setDrawerOpen(false)}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors",
                            isActive
                              ? "bg-white/[0.08] text-white font-semibold border border-white/[0.1]"
                              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-slate-300" />
                            <span>{item.label}</span>
                          </div>
                          <span className={cn("text-[9px] font-mono px-2 py-0.5 rounded-full border", item.dutyColor)}>
                            {item.dutyBadge}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Secondary Platform Modules */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1 font-bold">
                    Platform Tools & Modules
                  </span>
                  <div className="space-y-1">
                    {secondaryModules.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => setDrawerOpen(false)}
                          className={cn(
                            "flex items-start gap-3 p-2.5 rounded-xl border transition-all group",
                            isActive
                              ? "bg-white/[0.06] border-emerald-500/40 text-white"
                              : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.03] text-slate-400 hover:text-white"
                          )}
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#101726] border border-white/[0.08] flex items-center justify-center text-emerald-400 mt-0.5 shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                {item.label}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">
                                {item.duty}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {item.desc}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-white/[0.08] text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>EVM Node & CEPA Engine</span>
                </span>
                <span className="text-emerald-400 font-bold">Verified</span>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default RoleNavigation;

