import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SpecularButton, { SpecularButtonProps } from "@/components/ui/SpecularButton";

export interface PrimaryActionProps extends Omit<SpecularButtonProps, "onClick"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  to?: string;
  asLink?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
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
  onClick,
  lineColor,
  baseColor,
  textColor,
  radius = 16,
  ...specularProps
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    if (onClick) onClick(e);
    if (to) {
      navigate(to);
    }
  };

  // Preset specular colors based on enterprise design tokens
  const isPrimary = variant === "primary";
  const computedLineColor = lineColor || (isPrimary ? "#34C795" : "#ffffff");
  const computedBaseColor = baseColor || (isPrimary ? "#133E2E" : "#334155");
  const computedTextColor = textColor || (isPrimary ? "#FFFFFF" : "#E2E8F0");

  const content = (
    <div className="flex items-center justify-center gap-2 font-semibold">
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon && iconPosition === "left" ? (
        <span className="shrink-0">{icon}</span>
      ) : null}

      <span>{children}</span>

      {!isLoading && icon && iconPosition === "right" ? (
        <span className="shrink-0">{icon}</span>
      ) : !isLoading && !icon && isPrimary && iconPosition === "right" ? (
        <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
      ) : null}
    </div>
  );

  return (
    <SpecularButton
      size={size}
      radius={radius}
      tint="#ffffff"
      tintOpacity={0}
      blur={0}
      textColor={computedTextColor}
      lineColor={computedLineColor}
      baseColor={computedBaseColor}
      intensity={1.2}
      shineSize={12}
      shineFade={40}
      thickness={1.2}
      speed={0.35}
      followMouse
      proximity={250}
      autoAnimate={false}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={cn(className)}
      {...specularProps}
    >
      {content}
    </SpecularButton>
  );
};

export default PrimaryAction;
