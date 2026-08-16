import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ship, ShieldCheck, Coins, FileCheck2, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface LiveEvent {
  id: string;
  icon: any;
  iconColor: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  time: string;
  link: string;
}

const LIVE_EVENTS: LiveEvent[] = [
  {
    id: "evt-1",
    icon: Ship,
    iconColor: "text-[var(--emerald)]",
    badge: "AIS SATELLITE",
    badgeColor: "text-[var(--emerald)] bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)]",
    title: "MV Sagarika berthed at Jebel Ali Port (AEJEA)",
    subtitle: "500 Tonnes Basmati Rice • Berth discharge verified",
    time: "Just now",
    link: "/trades/TRD-IND-UAE-550K",
  },
  {
    id: "evt-2",
    icon: Coins,
    iconColor: "text-[var(--accent)]",
    badge: "SMART ESCROW",
    badgeColor: "text-[var(--accent)] bg-[rgba(56,189,248,0.1)] border-[rgba(56,189,248,0.2)]",
    title: "$550,000 USDC Collateral Locked on EVM Testnet",
    subtitle: "Consignee: Al-Futtaim Global Trade LLC (UAE)",
    time: "2 mins ago",
    link: "/escrow",
  },
  {
    id: "evt-3",
    icon: FileCheck2,
    iconColor: "text-[var(--gold)]",
    badge: "CEPA TARIFF",
    badgeColor: "text-[var(--gold)] bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]",
    title: "0.0% CEPA Origin Certificate Authenticated",
    subtitle: "Certificate #CEPA-2024-88492 registered on-chain",
    time: "4 mins ago",
    link: "/documents",
  },
  {
    id: "evt-4",
    icon: ShieldCheck,
    iconColor: "text-[var(--emerald)]",
    badge: "KYC TIER-1",
    badgeColor: "text-[var(--emerald)] bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)]",
    title: "Acme Exports Ltd upgraded to 96/100 Trust Score",
    subtitle: "Zero dispute record across 342 verified maritime shipments",
    time: "6 mins ago",
    link: "/marketplace",
  },
];

export const LiveTradeActivityTicker = () => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % LIVE_EVENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const event = LIVE_EVENTS[currentIdx];
  const Icon = event.icon;

  return (
    <div className="relative w-full max-w-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="p-4 rounded-xl border border-[var(--hairline-strong)] bg-[var(--panel-raised)]/95 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[var(--ink)] border border-[var(--hairline)] flex items-center justify-center flex-shrink-0">
              <Icon className={`w-4 h-4 ${event.iconColor}`} />
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono font-semibold px-2 py-0.2 rounded border ${event.badgeColor}`}>
                  {event.badge}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{event.time}</span>
              </div>
              <h5 className="font-sans font-semibold text-xs text-[var(--text-primary)] truncate">
                {event.title}
              </h5>
              <p className="text-[11px] text-[var(--text-secondary)] font-sans truncate">
                {event.subtitle}
              </p>
            </div>
          </div>

          <Link
            to={event.link}
            className="w-8 h-8 rounded-lg bg-[var(--panel)] hover:bg-[var(--ink)] border border-[var(--hairline)] flex items-center justify-center text-[var(--accent)] hover:scale-105 transition-all flex-shrink-0"
            title="Inspect on-chain"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LiveTradeActivityTicker;
