import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StarBorderProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: any;
  className?: string;
  color?: string;
  speed?: string;
  children?: React.ReactNode;
}

export const StarBorder: React.FC<StarBorderProps> = ({
  as: Component = motion.button,
  className = "",
  color = "#34C795",
  speed = "4s",
  children,
  ...rest
}) => {
  return (
    <Component
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative inline-block py-[1px] px-[1px] overflow-hidden rounded-xl cursor-pointer select-none group",
        className
      )}
      {...rest}
    >
      <div
        className="absolute w-[300%] h-[60%] opacity-80 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 20%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="absolute w-[300%] h-[60%] opacity-80 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 20%)`,
          animationDuration: speed,
        }}
      />
      <div className="relative z-10 bg-gradient-to-b from-[#141E2D]/95 via-[#0E1522]/95 to-[#090E17]/95 border border-white/[0.12] group-hover:border-emerald-500/40 text-[var(--text-primary)] font-display font-semibold text-xs sm:text-sm py-2.5 px-5 rounded-[11px] flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all duration-300">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
