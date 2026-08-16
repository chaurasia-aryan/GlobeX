import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import SpecularButton from "./SpecularButton";
import StarBorder from "./star-border";
import { motion } from "framer-motion";

export interface InteractiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "specular" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  color?: string;
  lineColor?: string;
  baseColor?: string;
}

export const InteractiveButton = ({
  children,
  className,
  variant = "specular",
  size = "md",
  color = "#34C795",
  lineColor = "#34C795",
  baseColor = "#1e293b",
  ...props
}: InteractiveButtonProps) => {
  if (variant === "specular") {
    return (
      <SpecularButton
        size={size}
        radius={14}
        lineColor={lineColor}
        baseColor={baseColor}
        textColor="#F1F5F9"
        intensity={1.2}
        shineSize={12}
        shineFade={40}
        followMouse={true}
        proximity={250}
        className={className}
        onClick={props.onClick}
      >
        {children}
      </SpecularButton>
    );
  }

  if (variant === "primary") {
    return (
      <StarBorder color={color} className={className} speed="3.5s" {...props}>
        {children}
      </StarBorder>
    );
  }

  const sizeStyles = {
    sm: "h-9 px-3.5 text-xs rounded-lg gap-1.5",
    md: "h-11 px-5 text-xs sm:text-sm rounded-xl gap-2",
    lg: "h-12 px-6 text-sm sm:text-base rounded-xl gap-2.5",
  }[size];

  const variantStyles = {
    secondary:
      "bg-[#111824]/90 text-[var(--text-primary)] font-semibold border border-white/[0.12] hover:border-emerald-500/40 hover:bg-[#162232] backdrop-blur-md shadow-sm",
    outline:
      "bg-transparent text-[var(--text-primary)] font-semibold border border-white/[0.15] hover:border-[var(--emerald)] hover:bg-white/[0.04]",
    ghost:
      "bg-transparent text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-white/[0.05]",
  }[variant] || "";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden font-display transition-all duration-200 cursor-pointer select-none",
        sizeStyles,
        variantStyles,
        className
      )}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};

export default InteractiveButton;
