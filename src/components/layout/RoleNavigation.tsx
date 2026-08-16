import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWorkspace, RoleType } from "@/context/WorkspaceContext";
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
  ShoppingBag,
} from "lucide-react";

export const RoleNavigation: React.FC = () => {
  const { user, role, setRole, isBuyer, isExporter, roleLabel, roleAccentColor } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route changes
  useEffect(() => {
    setAccountMenuOpen(false);
    setDrawerOpen(false);
    setSearchOpen(false);
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

  // Role-specific navigation links
  const navItems = isBuyer
    ? [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Find Suppliers", href: "/marketplace", icon: Store },
        { label: "New Import", href: "/get-started", icon: PlusCircle },
        { label: "Active Trades", href: "/trades/TRD-IND-UAE-550K", icon: Workflow, isLive: true },
        { label: "Documents", href: "/documents", icon: FileCheck2 },
      ]
    : [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "My Listings", href: "/marketplace", icon: Store },
        { label: "Trade Requests", href: "/get-started", icon: PlusCircle },
        { label: "Active Exports", href: "/trades/TRD-IND-UAE-550K", icon: Workflow, isLive: true },
        { label: "Documents", href: "/documents", icon: FileCheck2 },
      ];

  const secondaryModules = [
    { label: "Smart Escrow Vault", href: "/escrow", icon: Coins, desc: "Multi-sig collateral & conditional release" },
    { label: "Live Shipment Telemetry", href: "/shipments", icon: Ship, desc: "AIS vessel tracking & container sensors" },
    { label: "Disputes & Arbitration", href: "/disputes", icon: Scale, desc: "Human-in-the-loop dispute resolution" },
    { label: "Blockchain Audit Ledger", href: "/blockchain", icon: Database, desc: "On-chain document & hash verification" },
    { label: "System Health & Architecture", href: "/admin", icon: Layers, desc: "EVM node, FastAPI, n8n, & Appwrite state" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleSwitchRole = (targetRole: RoleType) => {
    setRole(targetRole);
    setAccountMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#070A0E]/90 backdrop-blur-xl select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* ── Brand Logo + Role Workspace Tag ─────────────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[#101726] border border-white/[0.12] group-hover:border-emerald-500/50 flex items-center justify-center transition-all">
              <svg
                className="w-3.5 h-3.5 text-emerald-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" strokeOpacity="0.4" />
                <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
                <path d="M3 12h18" strokeOpacity="0.6" />
              </svg>
            </div>
            <span className="font-display font-black text-sm tracking-[0.14em] text-white">
              GLOBEX
            </span>
          </Link>

          {/* Role Indicator Pill in Header */}
          <div
            className={cn(
              "hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border select-none",
              isBuyer
                ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                : isExporter
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-slate-800 text-slate-300 border-slate-700"
            )}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: roleAccentColor }}
            />
            <span>{isBuyer ? "Buyer" : isExporter ? "Exporter" : role}</span>
          </div>
        </div>

        {/* ── Primary Navigation Links (Role Dependent) ───────────────────── */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/" &&
                item.href !== "/dashboard" &&
                location.pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-colors",
                  isActive
                    ? "text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon className="w-3.5 h-3.5 opacity-80 shrink-0" />
                <span>{item.label}</span>
                {item.isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}

                {isActive && (
                  <motion.div
                    layoutId="role-nav-pill"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.12] -z-10"
                  />
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
            className="relative hidden lg:flex items-center w-48 h-8 px-2.5 rounded-xl bg-[#0F1724] border border-white/[0.08] focus-within:border-white/[0.2] transition-colors"
          >
            <Search className="w-3 h-3 text-slate-500 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trades, HS..."
              className="w-full bg-transparent border-none outline-none text-[11px] text-white placeholder:text-slate-500 font-sans"
            />
          </form>

          {/* Account & Role Switcher Popover */}
          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-sans transition-all cursor-pointer",
                accountMenuOpen
                  ? "bg-[#141F30] border-white/[0.2] text-white"
                  : "bg-[#0F1724] border-white/[0.08] hover:border-white/[0.15] text-slate-300"
              )}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black"
                style={{ backgroundColor: roleAccentColor }}
              >
                {user.name.charAt(0)}
              </div>
              <span className="hidden sm:inline font-medium truncate max-w-[100px]">
                {user.name.split(" ")[0]}
              </span>
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
                  className="absolute right-0 top-11 w-64 p-2 rounded-2xl bg-[#0C121D] border border-white/[0.12] shadow-2xl z-50 space-y-2 text-xs font-sans"
                >
                  {/* User entity details */}
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] space-y-1">
                    <div className="font-semibold text-white truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user.companyName}</div>
                    <div className="text-[10px] font-mono text-slate-500">{user.email}</div>
                  </div>

                  {/* Role Switch Section */}
                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2">
                      Switch Active Workspace
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSwitchRole("buyer")}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer",
                        isBuyer
                          ? "bg-sky-500/15 text-sky-300 font-semibold"
                          : "hover:bg-white/[0.04] text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-sky-400" />
                        <div>
                          <div className="text-xs">Buyer Workspace</div>
                          <div className="text-[10px] text-slate-400">Import & buy products</div>
                        </div>
                      </div>
                      {isBuyer && <span className="text-[10px] font-mono text-sky-400 font-bold">ACTIVE</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSwitchRole("exporter")}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer",
                        isExporter
                          ? "bg-emerald-500/15 text-emerald-300 font-semibold"
                          : "hover:bg-white/[0.04] text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="text-xs">Exporter Workspace</div>
                          <div className="text-[10px] text-slate-400">Sell & manage listings</div>
                        </div>
                      </div>
                      {isExporter && <span className="text-[10px] font-mono text-emerald-400 font-bold">ACTIVE</span>}
                    </button>
                  </div>

                  {/* Secondary Links / Onboarding */}
                  <div className="pt-2 border-t border-white/[0.08] space-y-1">
                    <Link
                      to="/onboarding"
                      className="flex items-center gap-2 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Role Setup & Onboarding</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Secondary Tools Drawer Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="p-2 rounded-xl bg-[#0F1724] border border-white/[0.08] hover:border-white/[0.2] text-slate-400 hover:text-white transition-all cursor-pointer"
            title="All Tools & Secondary Modules"
            aria-label="Toggle navigation drawer"
          >
            {drawerOpen ? <X className="w-4 h-4 text-emerald-400" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* ── Slide-Over Secondary Modules Drawer ─────────────────────────── */}
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
                {/* Mobile Navigation Links (if on small screen) */}
                <div className="md:hidden space-y-2 border-b border-white/[0.08] pb-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1">
                    {roleLabel} Navigation
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
                            "flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium transition-colors",
                            isActive
                              ? "bg-white/[0.08] text-white font-semibold"
                              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Secondary Platform Modules */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1">
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
                            <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                              {item.label}
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

              {/* Drawer Footer Telemetry */}
              <div className="pt-4 border-t border-white/[0.08] text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>EVM Node & Fast API</span>
                </span>
                <span className="text-emerald-400 font-bold">28ms latency</span>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default RoleNavigation;
