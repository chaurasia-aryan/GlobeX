import React, { useRef, useEffect } from "react";
import { Renderer, Program, Mesh, Triangle, Color } from "ogl";
import { cn } from "@/lib/utils";

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

const PAD = 20;

const SIZES = {
  xs: "text-[0.75rem] px-3 py-1.5 min-h-[28px] gap-1.5",
  sm: "text-[0.85rem] px-4 py-2 min-h-[34px] gap-2",
  md: "text-[0.95rem] px-5 py-2.5 min-h-[42px] gap-2.5 font-semibold",
  lg: "text-[1.05rem] px-7 py-3.5 min-h-[48px] gap-3 font-bold",
  xl: "text-[1.15rem] px-9 py-4 min-h-[54px] gap-3.5 font-bold",
};

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = shapeSDF(p);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  // Dark base stroke hugging the edge for a sense of thickness
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;

  // Symmetric specular: the edges facing toward/away from the light both
  // catch a streak. The angular window (size + fade) is measured with an
  // elliptical normal so it varies continuously along straight edges.
  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`;

export const SpecularButton: React.FC<SpecularButtonProps> = ({
  children = "Get Started",
  size = "md",
  radius = 16,
  tint,
  tintOpacity,
  blur = 0,
  textColor,
  lineColor,
  baseColor,
  intensity = 1,
  shineSize = 12,
  shineFade = 40,
  thickness = 1.2,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  disabled = false,
  isLoading = false,
  icon,
  iconPosition = "right",
  variant = "primary",
  onClick,
  className = "",
  type = "button",
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const fxRef = useRef<HTMLSpanElement>(null);
  const propsRef = useRef<any>({});

  // Preset theme color mappings
  const getThemeDefaults = () => {
    switch (variant) {
      case "sky":
        return {
          tint: tint || "#0369A1",
          tintOpacity: tintOpacity ?? 0.2,
          textColor: textColor || "#BAE6FD",
          lineColor: lineColor || "#38BDF8",
          baseColor: baseColor || "#082F49",
        };
      case "amber":
        return {
          tint: tint || "#B45309",
          tintOpacity: tintOpacity ?? 0.2,
          textColor: textColor || "#FDE68A",
          lineColor: lineColor || "#F59E0B",
          baseColor: baseColor || "#451A03",
        };
      case "outline":
        return {
          tint: tint || "#FFFFFF",
          tintOpacity: tintOpacity ?? 0.04,
          textColor: textColor || "#F1F5F9",
          lineColor: lineColor || "#94A3B8",
          baseColor: baseColor || "#1E293B",
        };
      case "ghost":
        return {
          tint: tint || "#FFFFFF",
          tintOpacity: tintOpacity ?? 0.0,
          textColor: textColor || "#94A3B8",
          lineColor: lineColor || "#525252",
          baseColor: baseColor || "#18181B",
        };
      case "secondary":
        return {
          tint: tint || "#1E293B",
          tintOpacity: tintOpacity ?? 0.85,
          textColor: textColor || "#F8FAFC",
          lineColor: lineColor || "#64748B",
          baseColor: baseColor || "#0F172A",
        };
      case "primary":
      case "emerald":
      default:
        return {
          tint: tint || "#059669",
          tintOpacity: tintOpacity ?? 0.22,
          textColor: textColor || "#ECFDF5",
          lineColor: lineColor || "#34D399",
          baseColor: baseColor || "#064E3B",
        };
    }
  };

  const theme = getThemeDefaults();

  propsRef.current = {
    radius,
    lineColor: theme.lineColor,
    baseColor: theme.baseColor,
    intensity,
    shineSize,
    shineFade,
    thickness,
    speed,
    followMouse,
    proximity,
    autoAnimate,
  };

  useEffect(() => {
    const btn = btnRef.current;
    const fx = fxRef.current;
    if (!btn || !fx) return;

    let renderer: Renderer | null = null;
    let gl: WebGL2RenderingContext | null = null;
    let mesh: Mesh | null = null;
    let program: Program | null = null;
    let ro: ResizeObserver | null = null;
    let raf = 0;
    let onPointerMove: ((e: PointerEvent) => void) | null = null;

    try {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
        dpr,
      });

      gl = renderer.gl as WebGL2RenderingContext;
      if (!gl) return;

      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      const geometry = new Triangle(gl);
      if (geometry.attributes.uv) delete (geometry.attributes as any).uv;

      program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uCenter: { value: [0, 0] },
          uHalfSize: { value: [1, 1] },
          uRadius: { value: 0 },
          uAngle: { value: 2.4 },
          uPx: { value: dpr },
          uLineColor: { value: [1, 1, 1] },
          uBaseColor: { value: [0.32, 0.32, 0.32] },
          uIntensity: { value: 1 },
          uShineSize: { value: 0.17 },
          uShineFade: { value: 0.7 },
          uThickness: { value: 1.2 },
          uBaseWidth: { value: dpr },
        },
      });

      mesh = new Mesh(gl, { geometry, program });
      fx.appendChild(gl.canvas);

      const sizeRef = { w: 1, h: 1 };
      const resize = () => {
        if (!btn || !renderer || !program) return;
        const rect = btn.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        sizeRef.w = w;
        sizeRef.h = h;
        renderer.setSize(w + PAD * 2, h + PAD * 2);
        program.uniforms.uCenter.value = [(PAD + w / 2) * dpr, (PAD + h / 2) * dpr];
        program.uniforms.uHalfSize.value = [(w / 2) * dpr, (h / 2) * dpr];
      };

      ro = new ResizeObserver(resize);
      ro.observe(btn);
      resize();

      let pointerAngle: number | null = null;
      let proximityT = 0;

      onPointerMove = (e: PointerEvent) => {
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
        const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
        const dist = Math.hypot(dx, dy);

        if (dist === 0) {
          const nx = (e.clientX - cx) / (rect.width / 2);
          const ny = (cy - e.clientY) / (rect.height / 2);
          pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
        } else {
          pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
        }
        const t = Math.max(0, 1 - dist / Math.max(propsRef.current.proximity, 1));
        proximityT = t * t * (3 - 2 * t);
      };

      window.addEventListener("pointermove", onPointerMove);

      let angle = 2.4;
      let idleAngle = 2.4;
      let bright = 0;
      let last = performance.now();

      const lineC = new Color();
      const baseC = new Color();

      const update = (now: number) => {
        if (!program || !renderer || !mesh) return;
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const p = propsRef.current;

        idleAngle += p.speed * dt;
        const steer = p.followMouse && pointerAngle != null && (!p.autoAnimate || proximityT > 0);
        const target = steer ? pointerAngle : idleAngle;
        const diff = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        angle += diff * (1 - Math.exp(-dt * 7));

        const brightTarget = p.autoAnimate ? 1 : proximityT;
        bright += (brightTarget - bright) * (1 - Math.exp(-dt * 8));

        lineC.set(p.lineColor);
        baseC.set(p.baseColor);
        program.uniforms.uAngle.value = angle;
        program.uniforms.uRadius.value =
          Math.min(p.radius, Math.min(sizeRef.w, sizeRef.h) / 2) * dpr;
        program.uniforms.uLineColor.value = [lineC.r, lineC.g, lineC.b];
        program.uniforms.uBaseColor.value = [baseC.r, baseC.g, baseC.b];
        program.uniforms.uIntensity.value = p.intensity * bright;
        program.uniforms.uShineSize.value = (p.shineSize * Math.PI) / 180;
        program.uniforms.uShineFade.value = (p.shineFade * Math.PI) / 180;
        program.uniforms.uThickness.value = p.thickness * dpr;

        renderer.render({ scene: mesh });
        raf = requestAnimationFrame(update);
      };

      raf = requestAnimationFrame(update);
    } catch (e) {
      // Graceful fallback for non-WebGL environments (e.g. headless tests)
      console.warn("SpecularButton WebGL initialization skipped:", e);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      if (onPointerMove) window.removeEventListener("pointermove", onPointerMove);
      if (gl && gl.canvas && gl.canvas.parentNode === fx) {
        fx.removeChild(gl.canvas);
      }
      if (gl) {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    };
  }, []);

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        "relative m-0 inline-flex cursor-pointer items-center justify-center font-display tracking-tight outline-none select-none transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        "[color:var(--sb-text-color)] [border-radius:var(--sb-radius)]",
        "bg-[color:var(--sb-tint-bg)]",
        "[backdrop-filter:blur(var(--sb-blur))]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.3)]",
        "focus-visible:outline-2 focus-visible:outline-offset-[2px] focus-visible:outline-emerald-400",
        SIZES[size] || SIZES.md,
        className
      )}
      style={{
        // @ts-ignore
        "--sb-radius": `${radius}px`,
        "--sb-tint-bg": `rgba(${hexToRgb(theme.tint)}, ${theme.tintOpacity})`,
        "--sb-blur": `${blur}px`,
        "--sb-text-color": theme.textColor,
      }}
      {...props}
    >
      {/* OGL Specular WebGL Canvas Layer */}
      <span
        ref={fxRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-5 z-[1] [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full overflow-hidden"
      />

      {/* Button Content */}
      <span className="relative z-[2] flex items-center justify-center gap-2">
        {isLoading ? (
          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
        ) : icon && iconPosition === "left" ? (
          <span className="shrink-0 transition-transform group-hover:scale-110">{icon}</span>
        ) : null}

        <span>{children}</span>

        {!isLoading && icon && iconPosition === "right" ? (
          <span className="shrink-0 transition-transform group-hover:translate-x-0.5">{icon}</span>
        ) : null}
      </span>
    </button>
  );
};

// Simple helper to convert hex to RGB numbers
function hexToRgb(hex: string): string {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return "5, 150, 105";
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

export default SpecularButton;
