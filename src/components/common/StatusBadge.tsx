import React from "react";
import { cn } from "@/lib/utils";

export type StatusVariant =
  | "verified"
  | "completed"
  | "active"
  | "in_transit"
  | "pending"
  | "warning"
  | "rejected"
  | "disputed"
  | "muted";

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  size?: "sm" | "md";
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = "sm",
  showDot = true,
  className,
}) => {
  const normalized = (status || "").toLowerCase().replace(/[\s-]/g, "_");

  let colorClasses = "bg-slate-800/60 text-slate-300 border-slate-700/50";
  let dotColor = "bg-slate-400";
  let defaultLabel = label || status;

  if (
    normalized === "verified" ||
    normalized === "completed" ||
    normalized === "settled" ||
    normalized === "operational" ||
    normalized === "success" ||
    normalized === "kyc_verified"
  ) {
    colorClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    dotColor = "bg-emerald-400";
    defaultLabel = label || (normalized === "kyc_verified" ? "KYC Verified" : "Verified");
  } else if (
    normalized === "active" ||
    normalized === "in_transit" ||
    normalized === "in_progress" ||
    normalized === "live"
  ) {
    colorClasses = "bg-sky-500/10 text-sky-400 border-sky-500/30";
    dotColor = "bg-sky-400 animate-pulse";
    defaultLabel = label || (normalized === "in_transit" ? "In Transit" : "Active");
  } else if (
    normalized === "pending" ||
    normalized === "review" ||
    normalized === "warning" ||
    normalized === "discrepancy" ||
    normalized === "attention"
  ) {
    colorClasses = "bg-amber-500/10 text-amber-300 border-amber-500/30";
    dotColor = "bg-amber-400";
    defaultLabel = label || (normalized === "discrepancy" ? "Discrepancy" : "Pending");
  } else if (
    normalized === "rejected" ||
    normalized === "disputed" ||
    normalized === "failed" ||
    normalized === "critical"
  ) {
    colorClasses = "bg-red-500/10 text-red-400 border-red-500/30";
    dotColor = "bg-red-400";
    defaultLabel = label || (normalized === "disputed" ? "Disputed" : "Rejected");
  }

  const sizeClasses =
    size === "md"
      ? "text-xs px-2.5 py-1 gap-1.5"
      : "text-[11px] px-2 py-0.5 gap-1.5";

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-medium rounded-md border tracking-wide whitespace-nowrap select-none",
        sizeClasses,
        colorClasses,
        className
      )}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
      )}
      <span>{defaultLabel}</span>
    </span>
  );
};

export default StatusBadge;
