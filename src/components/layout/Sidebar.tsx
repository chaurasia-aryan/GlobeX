import { Link, useLocation } from "react-router-dom";
import {
  Globe2,
  Search,
  Sparkles,
  ShieldCheck,
  Ship,
  FileCheck2,
  Coins,
  Scale,
  Database,
  Building2,
  FileText,
  Activity,
  Layers,
  ChevronRight,
} from "lucide-react";

export const Sidebar = () => {
  const location = useLocation();

  const lifecycleStages = [
    { stage: "1. DISCOVER", label: "Where to Trade", to: "/market-intelligence", icon: Sparkles },
    { stage: "2. MATCH", label: "AI Marketplace", to: "/marketplace", icon: Search },
    { stage: "3. ASSESS", label: "Trade Analysis", to: "/trade-analysis", icon: ShieldCheck },
    { stage: "4. WORKSPACE", label: "Active Trade Hub", to: "/trades/TRD-IND-UAE-550K", icon: Ship },
    { stage: "5. VERIFY", label: "Doc Verification", to: "/documents", icon: FileCheck2 },
    { stage: "6. ESCROW", label: "USDC Smart Escrow", to: "/escrow", icon: Coins },
    { stage: "7. SHIP", label: "Shipment Tracking", to: "/shipments", icon: Activity },
    { stage: "8. SETTLE / DISPUTE", label: "Dispute Portal", to: "/disputes", icon: Scale },
    { stage: "9. AUDIT", label: "Public Ledger", to: "/blockchain", icon: Database },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border/70 bg-card/60 backdrop-blur-md flex flex-col justify-between p-3 select-none">
      <div className="space-y-4">
        <div>
          <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Trade Lifecycle
          </div>
          <nav className="space-y-1 mt-1">
            {lifecycleStages.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to.includes("trades") && location.pathname.includes("trades"));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/30 font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                    <div className="text-left">
                      <div className="text-[10px] font-mono text-muted-foreground leading-none">{item.stage}</div>
                      <div className="leading-tight mt-0.5">{item.label}</div>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "opacity-100 text-primary" : ""}`} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Live Scenario Pin */}
        <div className="glass-panel p-3 bg-secondary/30 border-cyan-500/20">
          <div className="flex items-center justify-between text-[11px] font-mono text-primary font-semibold mb-1">
            <span>LIVE DEMO SCENARIO</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-xs font-medium text-foreground">
            Basmati Rice (500 Tonnes)
          </div>
          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
            India ➔ UAE • $550,000 USDC
          </div>
          <Link
            to="/trades/TRD-IND-UAE-550K"
            className="mt-2 block text-center py-1.5 px-2 rounded-md bg-primary text-primary-foreground text-xs font-mono font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            Open Flagship Workspace
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-border/50 text-[10px] font-mono text-muted-foreground">
        <div className="flex justify-between items-center">
          <span>Appwrite BaaS</span>
          <span className="text-emerald-400">Connected</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span>FastAPI AI</span>
          <span className="text-cyan-400">Active</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span>EVM Escrow</span>
          <span className="text-emerald-400">Sepolia</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
