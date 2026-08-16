import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { appwriteService, UserSession } from "@/services/appwrite/client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search,
  LayoutDashboard,
  Store,
  TrendingUp,
  Workflow,
  Command,
  ChevronDown,
  Menu,
  X,
  FileCheck2,
  Coins,
  Ship,
  Scale,
  Database,
  ShieldAlert,
  PlusCircle,
  ExternalLink,
  Layers,
  Zap,
} from "lucide-react";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserSession>(appwriteService.getCurrentUser());
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(appwriteService.getCurrentUser());
    setIsDrawerOpen(false); // Close drawer on route change
  }, [location]);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Marketplace", href: "/marketplace", icon: Store },
    { label: "New Trade", href: "/get-started", icon: PlusCircle },
    { label: "Workspace", href: "/trades/TRD-IND-UAE-550K", icon: Workflow, isLive: true },
  ];

  const drawerGroups = [
    {
      group: "Trade Actions",
      items: [
        { label: "Trade Workspace", href: "/trades/TRD-IND-UAE-550K", icon: Workflow, desc: "Manage your active trade, papers & safe payment" },
        { label: "Start a New Trade", href: "/get-started", icon: PlusCircle, desc: "Find best verified partners and calculate tax savings" },
      ],
    },
    {
      group: "Browse & Portfolio",
      items: [
        { label: "Product Marketplace", href: "/marketplace", icon: Store, desc: "Browse verified products & trusted sellers" },
        { label: "My Dashboard", href: "/dashboard", icon: LayoutDashboard, desc: "Trade overview, active shipments & alerts" },
      ],
    },
    {
      group: "System & Proofs",
      items: [
        { label: "System Health & Logs", href: "/admin", icon: Layers, desc: "Payment contract status & document verification logs" },
      ],
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <div className="sticky top-3.5 inset-x-0 z-50 px-4 sm:px-6 max-w-6xl mx-auto pointer-events-none">
        <motion.header
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto h-14 px-4 sm:px-5 rounded-2xl bg-[#090E17]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_50px_rgba(0,0,0,0.65)] flex items-center justify-between gap-4 select-none"
        >
          {/* ── Brand Logo ────────────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#1A2638] via-[#101826] to-[#0B1019] border border-white/[0.15] group-hover:border-emerald-500/50 flex items-center justify-center transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_16px_rgba(52,199,149,0.25)]">
              <svg
                className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" strokeOpacity="0.4" />
                <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
                <path d="M3 12h18" strokeOpacity="0.6" />
              </svg>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-sm tracking-[0.14em] text-[var(--text-primary)] group-hover:text-white transition-colors">
                GLOBEX
              </span>
              <span className="text-[9px] font-mono font-bold tracking-widest text-[var(--emerald)] px-1.5 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/40">
                AI
              </span>
            </div>
          </Link>

          {/* ── Spotlight Search Trigger Pill ─────────────────────────────────────── */}
          <form
            onSubmit={handleSearchSubmit}
            className={cn(
              "relative hidden md:flex items-center flex-1 max-w-[260px] lg:max-w-[300px] h-9 px-3 rounded-xl bg-[#111824]/80 border transition-all duration-200",
              searchFocused
                ? "border-emerald-500/50 bg-[#141F30] shadow-[0_0_12px_rgba(52,199,149,0.15)]"
                : "border-white/[0.08] hover:border-white/[0.15]"
            )}
          >
            <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search corridors, HS codes..."
              className="w-full bg-transparent border-none outline-none text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] font-sans"
            />
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-tertiary)] bg-white/[0.04] border border-white/[0.08] rounded">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </kbd>
          </form>

          {/* ── Segmented Navigation Tabs ─────────────────────────────────────────── */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link key={item.href} to={item.href} className="relative">
                  <div
                    className={cn(
                      "relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display font-semibold transition-colors duration-200",
                      isActive
                        ? "text-white"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.03]"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 text-current opacity-80" />
                    <span>{item.label}</span>
                    {item.isLive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] animate-pulse" />
                    )}
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="navbar-pill"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      className="absolute inset-0 z-0 rounded-xl bg-white/[0.08] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Role Selector & Hamburger Action Drawer Button ────────────────────── */}
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/[0.08]">
            <div className="relative hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#111824]/90 border border-white/[0.08] hover:border-white/[0.16] transition-colors text-xs text-[var(--text-secondary)] cursor-pointer">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)]" />
              <select
                value={currentUser.role}
                onChange={(e) => {
                  const newRole = e.target.value as "exporter" | "buyer" | "arbitrator" | "admin";
                  appwriteService.setRole(newRole);
                  setCurrentUser(appwriteService.getCurrentUser());
                }}
                className="bg-transparent text-[11px] font-mono text-[var(--text-primary)] outline-none cursor-pointer pr-1 appearance-none"
              >
                <option value="buyer" className="bg-[#0D131F] text-white">Buyer (Importer)</option>
                <option value="exporter" className="bg-[#0D131F] text-white">Seller (Exporter)</option>
                <option value="arbitrator" className="bg-[#0D131F] text-white">Arbitrator</option>
                <option value="admin" className="bg-[#0D131F] text-white">Admin</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[var(--text-tertiary)] pointer-events-none" />
            </div>

            {/* Hamburger Drawer Trigger */}
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-2 rounded-xl bg-[#111824]/80 border border-white/[0.08] hover:border-emerald-500/40 hover:bg-[#162232] text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer"
              title="All Modules & Tools"
            >
              {isDrawerOpen ? <X className="w-4 h-4 text-emerald-400" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </motion.header>
      </div>

      {/* ── Slide-Over Grouped Command Drawer (Reduces Clutter) ────────────────── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="relative w-full max-w-md h-full bg-[#0A1019]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-6">
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-[var(--emerald)]">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">Platform Modules</h3>
                      <p className="text-[11px] font-mono text-[var(--text-tertiary)]">Globex Protocol Suite</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-white hover:bg-white/[0.05]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Grouped Module List */}
                <div className="space-y-6">
                  {drawerGroups.map((group) => (
                    <div key={group.group} className="space-y-2">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-tertiary)] px-1">
                        {group.group}
                      </h4>
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setIsDrawerOpen(false)}
                              className={cn(
                                "flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-150 group",
                                isActive
                                  ? "bg-white/[0.06] border-emerald-500/40 text-white"
                                  : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.03] text-[var(--text-secondary)]"
                              )}
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#111824] border border-white/[0.08] flex items-center justify-center text-[var(--emerald)] group-hover:scale-105 transition-transform mt-0.5">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
                                  {item.label}
                                </div>
                                <div className="text-[11px] text-[var(--text-tertiary)] truncate">
                                  {item.desc}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Drawer Footer Telemetry */}
              <div className="pt-6 border-t border-white/[0.08] mt-6 space-y-3">
                <div className="p-3 rounded-xl bg-[#101726] border border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--emerald)] animate-pulse" />
                    <span className="text-[var(--text-secondary)]">EVM Node & Appwrite</span>
                  </div>
                  <span className="text-[var(--emerald)]">Operational (28ms)</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
