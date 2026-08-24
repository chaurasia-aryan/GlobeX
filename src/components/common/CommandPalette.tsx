import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Store,
  Workflow,
  PlusCircle,
  Package,
  FileCheck2,
  Coins,
  Ship,
  Scale,
  Database,
  Layers,
  Sparkles,
  Globe2,
  TrendingUp,
  Building2,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="bg-[#0C121D] border border-white/[0.12] rounded-2xl overflow-hidden shadow-2xl text-slate-100 font-sans">
        <CommandInput placeholder="Type a command or search workspace..." />
        <CommandList className="max-h-[340px] p-2 space-y-1">
          <CommandEmpty className="py-6 text-center text-xs text-slate-500">
            No matching actions or destinations found.
          </CommandEmpty>

          <CommandGroup heading="Primary Workspaces">
            <CommandItem
              onSelect={() => runCommand(() => navigate("/dashboard"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Operations Command Center</span>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => navigate("/marketplace"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <Store className="w-4 h-4 text-sky-400" />
              <span>Global Exporters Marketplace</span>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => navigate("/trades"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <Workflow className="w-4 h-4 text-indigo-400" />
              <span>Active Trades</span>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => navigate("/trade-requests"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Trade Requests & RFQs</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator className="my-1 bg-white/[0.06]" />

          <CommandGroup heading="Catalog & Operations">
            <CommandItem
              onSelect={() => runCommand(() => navigate("/my-listings"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <Package className="w-4 h-4 text-emerald-400" />
              <span>My Organization's Export Catalog</span>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => navigate("/documents"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-teal-400" />
              <span>Document Verification & OCR Studio</span>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => navigate("/trade-requests?duty=import"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-sky-400" />
              <span>Post New Import RFQ</span>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => navigate("/trade-analysis"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Trade Analysis</span>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => navigate("/counterparties"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>Counterparties</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator className="my-1 bg-white/[0.06]" />

          <CommandGroup heading="Platform Tools & Protocols">
            <CommandItem
              onSelect={() => runCommand(() => navigate("/escrow"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Smart Escrow Multi-Sig Vault</span>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => navigate("/shipments"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <Ship className="w-4 h-4 text-sky-400" />
              <span>Live AIS Shipment Telemetry</span>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => navigate("/disputes"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <Scale className="w-4 h-4 text-rose-400" />
              <span>Disputes & Arbitration Portal</span>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => navigate("/blockchain"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>On-Chain Evidence Audit Ledger</span>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => navigate("/admin"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>System Health & Node Status</span>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => navigate("/"))}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <Globe2 className="w-4 h-4 text-emerald-400" />
              <span>Interactive 3D Globe Radar</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </div>
    </CommandDialog>
  );
};

export default CommandPalette;
