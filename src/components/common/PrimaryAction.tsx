import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface PrimaryActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  to?: string;
  asLink?: boolean;
}

export const PrimaryAction: React.FC<PrimaryActionProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "right",
  isLoading = false,
  to,
  asLink = false,
  className,
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-sans font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080C14] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  const sizeClasses = {
    sm: "text-xs px-3.5 py-1.5 gap-1.5",
    md: "text-xs sm:text-sm px-4.5 py-2.5 gap-2",
    lg: "text-sm sm:text-base px-6 py-3.5 gap-2.5",
  }[size];

  const variantClasses = {
    primary:
      "bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-[#070A0E] shadow-[0_4px_20px_rgba(52,199,149,0.25)] hover:shadow-[0_6px_25px_rgba(52,199,149,0.35)] focus:ring-emerald-400 font-bold",
    secondary:
      "bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/[0.06] text-white border border-white/[0.12] hover:border-white/[0.2] shadow-sm focus:ring-white/40",
    outline:
      "bg-transparent hover:bg-white/[0.05] active:bg-white/[0.02] text-slate-300 hover:text-white border border-white/[0.12] hover:border-white/[0.25] focus:ring-white/30",
    ghost:
      "bg-transparent hover:bg-white/[0.06] active:bg-white/[0.03] text-slate-400 hover:text-white border-transparent focus:ring-white/20",
    danger:
      "bg-red-500/90 hover:bg-red-500 active:bg-red-600 text-white shadow-md focus:ring-red-400",
  }[variant];

  const content = (
    <>
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon && iconPosition === "left" ? (
        <span className="shrink-0">{icon}</span>
      ) : null}

      <span>{children}</span>

      {!isLoading && icon && iconPosition === "right" ? (
        <span className="shrink-0">{icon}</span>
      ) : !isLoading && !icon && variant === "primary" && iconPosition === "right" ? (
        <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
      ) : null}
    </>
  );

  if (to && asLink) {
    return (
      <Link
        to={to}
        className={cn(baseClasses, sizeClasses, variantClasses, "group", className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={cn(baseClasses, sizeClasses, variantClasses, "group", className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </button>
  );
};

export default PrimaryAction;
