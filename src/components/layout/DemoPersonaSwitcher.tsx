import { useState, useEffect } from "react";
import { appwriteService, UserSession } from "@/services/appwrite/client";
import { UserCheck, ChevronUp, Shield, Wrench, Building, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export const DemoPersonaSwitcher = () => {
  const [currentUser, setCurrentUser] = useState<UserSession>(appwriteService.getCurrentUser());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      setCurrentUser(appwriteService.getCurrentUser());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleSwitch = (role: "exporter" | "buyer" | "arbitrator" | "admin") => {
    appwriteService.setRole(role);
    setCurrentUser(appwriteService.getCurrentUser());
    setIsOpen(false);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "exporter":
        return "Exporter (Seller)";
      case "buyer":
        return "Importer (Buyer)";
      case "arbitrator":
        return "Arbitrator";
      case "admin":
        return "System Admin";
      default:
        return role;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans select-none">
      {/* Popover Menu */}
      {isOpen && (
        <div className="mb-2 w-72 p-3.5 rounded-xl border border-[var(--hairline-strong)] bg-[var(--panel)] shadow-2xl space-y-3 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)] font-semibold">
                Hackathon Demo Control
              </span>
              <p className="text-[11px] text-[var(--text-secondary)]">Simulate platform personas</p>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--hairline)]">
              FAST-SWITCH
            </span>
          </div>

          {/* Section 1: Marketplace Roles */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-mono text-[var(--text-tertiary)] px-1">
              Marketplace Roles
            </div>
            <button
              onClick={() => handleSwitch("exporter")}
              className={cn(
                "w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors",
                currentUser.role === "exporter"
                  ? "bg-[var(--panel-raised)] text-[var(--accent)] font-medium border border-[var(--hairline)]"
                  : "hover:bg-[var(--panel-raised)] text-[var(--text-primary)]"
              )}
            >
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-[var(--emerald)]" />
                <div>
                  <div className="font-medium">Exporter / Seller</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">Acme Exports Ltd</div>
                </div>
              </div>
              {currentUser.role === "exporter" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              )}
            </button>

            <button
              onClick={() => handleSwitch("buyer")}
              className={cn(
                "w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors",
                currentUser.role === "buyer"
                  ? "bg-[var(--panel-raised)] text-[var(--accent)] font-medium border border-[var(--hairline)]"
                  : "hover:bg-[var(--panel-raised)] text-[var(--text-primary)]"
              )}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-[var(--accent)]" />
                <div>
                  <div className="font-medium">Importer / Buyer</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">Al-Futtaim Global LLC</div>
                </div>
              </div>
              {currentUser.role === "buyer" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              )}
            </button>
          </div>

          <div className="hairline-divider" />

          {/* Section 2: Back Office (Demo Only) */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-mono text-[var(--text-tertiary)] px-1">
              Back Office (Demo Only)
            </div>
            <button
              onClick={() => handleSwitch("arbitrator")}
              className={cn(
                "w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors",
                currentUser.role === "arbitrator"
                  ? "bg-[var(--panel-raised)] text-[var(--accent)] font-medium border border-[var(--hairline)]"
                  : "hover:bg-[var(--panel-raised)] text-[var(--text-primary)]"
              )}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[var(--amber)]" />
                <div>
                  <div className="font-medium">Arbitrator</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">ICC Arbitration Portal</div>
                </div>
              </div>
              {currentUser.role === "arbitrator" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              )}
            </button>

            <button
              onClick={() => handleSwitch("admin")}
              className={cn(
                "w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors",
                currentUser.role === "admin"
                  ? "bg-[var(--panel-raised)] text-[var(--accent)] font-medium border border-[var(--hairline)]"
                  : "hover:bg-[var(--panel-raised)] text-[var(--text-primary)]"
              )}
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <div>
                  <div className="font-medium">System Admin</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">Infrastructure & Logs</div>
                </div>
              </div>
              {currentUser.role === "admin" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--panel)] hover:bg-[var(--panel-raised)] border border-[var(--hairline-strong)] shadow-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
      >
        <UserCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span>Demo: viewing as <strong className="text-[var(--text-primary)] font-medium">{getRoleDisplayName(currentUser.role)}</strong></span>
        <ChevronUp className={cn("w-3 h-3 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>
    </div>
  );
};

export default DemoPersonaSwitcher;
