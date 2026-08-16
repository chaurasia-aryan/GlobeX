import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface SpecularButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  variant?: "primary" | "emerald" | "sky" | "amber" | "outline" | "ghost" | "secondary";
  className?: string;
}

const SIZES = {
  xs: "text-[0.75rem] px-3 py-1.5 min-h-[28px] gap-1.5 font-medium",
  sm: "text-[0.8125rem] px-3.5 py-2 min-h-[34px] gap-2 font-medium",
  md: "text-[0.875rem] px-5 py-2.5 min-h-[40px] gap-2.5 font-semibold",
  lg: "text-[0.95rem] px-6 py-3 min-h-[46px] gap-3 font-bold",
  xl: "text-[1.05rem] px-8 py-3.5 min-h-[52px] gap-3.5 font-bold",
};

export const SpecularButton: React.FC<SpecularButtonProps> = ({
  children = "Get Started",
  size = "md",
  radius = 14,
  tint,
  tintOpacity,
  blur = 8,
  textColor,
  lineColor,
  baseColor,
  intensity = 1,
  followMouse = true,
  disabled = false,
  isLoading = false,
  icon,
  iconPosition = "right",
  variant = "primary",
  onClick,
  className = "",
  type = "button",
  style,
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; isHovered: boolean }>({
    x: 50,
    y: 50,
    isHovered: false,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!followMouse || disabled || isLoading) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y, isHovered: true });
    },
    [followMouse, disabled, isLoading]
  );

  const handleMouseEnter = useCallback(() => {
    if (!disabled && !isLoading) {
      setMousePos((prev) => ({ ...prev, isHovered: true }));
    }
  }, [disabled, isLoading]);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 50, y: 50, isHovered: false });
  }, []);

  // Theme styling configurations (Clean, 100% GPU CSS without WebGL context overhead)
  const getVariantStyles = () => {
    switch (variant) {
      case "sky":
        return {
          bg: "bg-[#082338]/90 hover:bg-[#0C324E]/95 active:bg-[#071D2F]",
          border: "border-sky-500/35 hover:border-sky-400/60",
          text: textColor || "text-sky-200 hover:text-white",
          glow: "rgba(56, 189, 248, 0.25)",
          rim: "linear-gradient(135deg, rgba(56, 189, 248, 0.5) 0%, rgba(56, 189, 248, 0.1) 50%, rgba(255, 255, 255, 0.2) 100%)",
        };
      case "amber":
        return {
          bg: "bg-[#2D1604]/90 hover:bg-[#3D1E06]/95 active:bg-[#201003]",
          border: "border-amber-500/35 hover:border-amber-400/60",
          text: textColor || "text-amber-200 hover:text-white",
          glow: "rgba(245, 158, 11, 0.25)",
          rim: "linear-gradient(135deg, rgba(245, 158, 11, 0.5) 0%, rgba(245, 158, 11, 0.1) 50%, rgba(255, 255, 255, 0.2) 100%)",
        };
      case "outline":
        return {
          bg: "bg-[#0C121D]/80 hover:bg-[#111A29]/95 active:bg-[#090E17]",
          border: "border-white/[0.12] hover:border-white/[0.25]",
          text: textColor || "text-slate-300 hover:text-white",
          glow: "rgba(255, 255, 255, 0.15)",
          rim: "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.15) 100%)",
        };
      case "ghost":
        return {
          bg: "bg-transparent hover:bg-white/[0.06] active:bg-white/[0.03]",
          border: "border-transparent hover:border-white/[0.08]",
          text: textColor || "text-slate-400 hover:text-white",
          glow: "rgba(255, 255, 255, 0.1)",
          rim: "transparent",
        };
      case "secondary":
        return {
          bg: "bg-[#111827]/90 hover:bg-[#1F2937]/95 active:bg-[#0B0F19]",
          border: "border-white/[0.08] hover:border-white/[0.16]",
          text: textColor || "text-slate-200 hover:text-white",
          glow: "rgba(148, 163, 184, 0.2)",
          rim: "linear-gradient(135deg, rgba(148, 163, 184, 0.3) 0%, rgba(255, 255, 255, 0.05) 100%)",
        };
      case "primary":
      case "emerald":
      default:
        return {
          bg: "bg-[#062D22]/90 hover:bg-[#0A4132]/95 active:bg-[#042018]",
          border: "border-emerald-500/35 hover:border-emerald-400/60",
          text: textColor || "text-emerald-200 hover:text-white",
          glow: "rgba(52, 211, 153, 0.25)",
          rim: "linear-gradient(135deg, rgba(52, 211, 153, 0.5) 0%, rgba(52, 211, 153, 0.1) 50%, rgba(255, 255, 255, 0.2) 100%)",
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        borderRadius: `${radius}px`,
        ...style,
      }}
      className={cn(
        "relative group inline-flex items-center justify-center font-sans select-none overflow-hidden",
        "border backdrop-blur-md transition-all duration-180 ease-out",
        "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400",
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
        vStyles.bg,
        vStyles.border,
        vStyles.text,
        SIZES[size],
        className
      )}
      {...props}
    >
      {/* Dynamic Specular Hover Light Follower */}
      {followMouse && mousePos.isHovered && !disabled && (
        <span
          className="absolute inset-0 pointer-events-none transition-opacity duration-200 opacity-100"
          style={{
            background: `radial-gradient(circle 80px at ${mousePos.x}% ${mousePos.y}%, ${vStyles.glow}, transparent 70%)`,
          }}
        />
      )}

      {/* Subtle Top Specular Rim Reflection */}
      <span
        className="absolute inset-x-0 top-0 h-[1px] pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-180"
        style={{
          background: vStyles.rim,
        }}
      />

      {/* Content Layer */}
      <span className="relative z-10 flex items-center justify-center gap-2 pointer-events-none">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="shrink-0">{icon}</span>
            )}
            <span>{children}</span>
            {icon && iconPosition === "right" && (
              <span className="shrink-0">{icon}</span>
            )}
          </>
        )}
      </span>
    </button>
  );
};

export default SpecularButton;
