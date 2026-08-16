"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  children?: React.ReactNode;
  className?: string;
  glowColor?: string;
  spread?: number;
  borderWidth?: number;
}

export const GlowingEffect = ({
  children,
  className,
  glowColor = "rgba(14, 165, 233, 0.4)",
  spread = 40,
  borderWidth = 1,
}: GlowingEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-2xl p-[1px] overflow-hidden transition-all duration-300",
        className
      )}
      style={{
        background: `radial-gradient(${spread}0px circle at 50% 50%, ${glowColor}, transparent 70%)`,
      }}
    >
      <div className="relative w-full h-full bg-card rounded-[inherit]">
        {children}
      </div>
    </div>
  );
};

export default GlowingEffect;
