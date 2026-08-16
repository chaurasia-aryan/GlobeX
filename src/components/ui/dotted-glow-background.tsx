"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DottedGlowBackgroundProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  gap?: number;
  glowColor?: string;
  children?: React.ReactNode;
}

export const DottedGlowBackground = ({
  className,
  dotColor = "rgba(14, 165, 233, 0.15)",
  dotSize = 1.5,
  gap = 24,
  glowColor = "rgba(14, 165, 233, 0.08)",
  children,
}: DottedGlowBackgroundProps) => {
  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${gap}px ${gap}px`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${glowColor} 0%, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
};

export default DottedGlowBackground;
