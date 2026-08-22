import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Building2,
  Globe2,
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
  LogOut,
  UserPlus,
  Mail,
  PlusCircle,
} from "lucide-react";
import CommandPalette from "@/components/common/CommandPalette";
import PillNav, { PillNavItem } from "@/components/ui/PillNav";

export const RoleNavigation: React.FC = () => {
  const { user, logout } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Add Team Member modal state
  const [addTeamModalOpen, setAddTeamModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Trader / Salesman");

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

  // Primary Core Navigation Items
  const pillNavItems: PillNavItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Create Listing", href: "/create-listing" },
    { label: "Trade Requests", href: "/trade-requests" },
    { label: "Active Trades", href: "/trades/TRD-IND-UAE-550K" },
    { label: "Documents", href: "/documents" },
  ];

  // Secondary Tools for drawer
  const secondaryNavItems = [
    { label: "Create Export Listing", href: "/create-listing", icon: PlusCircle, desc: "Add product to global marketplace" },
    { label: "My Export Listings", href: "/my-listings", icon: Package, desc: "Organization export catalog" },
    { label: "Smart Escrow Vault", href: "/escrow", icon: Coins, desc: "Programmable multi-sig settlement" },
    { label: "Shipment Telemetry", href: "/shipments", icon: Ship, desc: "Live AIS satellite tracking" },
    { label: "Disputes & Arbitration", href: "/disputes", icon: Scale, desc: "Human-in-the-loop dispute resolution" },
    { label: "Audit Ledger", href: "/blockchain", icon: Database, desc: "On-chain cryptographic evidence" },
    { label: "System Health", href: "/admin", icon: Layers, desc: "FastAPI, n8n, Appwrite & EVM state" },
  ];

  const handleSignOut = async () => {
    setAccountMenuOpen(false);
    await logout();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleOpenAddTeamModal = () => {
    setAccountMenuOpen(false);
    setAddTeamModalOpen(true);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    toast.success(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
    setAddTeamModalOpen(false);
    setInviteEmail("");
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
          <div className="hidden md:flex items-center justify-center flex-1 max-w-4xl mx-auto">
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

            {/* Account Profile Trigger */}
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

                    {/* Action Buttons: Add Team Members & Sign Out */}
                    <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                      <button
                        type="button"
                        onClick={handleOpenAddTeamModal}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 hover:text-emerald-200 transition-all font-medium text-xs cursor-pointer group"
                      >
                        <UserPlus className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                        <span>Add Team Members</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-rose-500/15 border border-white/[0.06] hover:border-rose-500/30 text-slate-300 hover:text-rose-300 transition-all font-medium text-xs cursor-pointer group"
                      >
                        <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
                        <span>Sign Out</span>
                      </button>
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

      {/* ── Add Team Members Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {addTeamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddTeamModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#0C121D] border border-white/[0.12] rounded-2xl p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Add Team Member</h3>
                    <p className="text-xs text-slate-400">Invite colleagues to {user.companyName || "your organization"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAddTeamModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-emerald-500/50 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Assign Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#070A0E] border border-white/[0.08] focus:border-emerald-500/50 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer"
                  >
                    <option value="Admin (Org Lead)">Admin (Org Lead)</option>
                    <option value="Compliance Officer">Compliance Officer</option>
                    <option value="Trader / Salesman">Trader / Salesman</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddTeamModalOpen(false)}
                    className="flex-1 h-10 rounded-xl border border-white/[0.08] hover:bg-white/[0.05] text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Send Invite</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </>
  );
};

export default RoleNavigation;

