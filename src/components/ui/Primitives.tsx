/**
 * PKlab UI Primitives
 * ---------------------------------------------------------------------------
 * Shared Card, Button and Badge building blocks used across every page
 * so visual language, radii, borders and hover physics stay consistent.
 */
import { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

/* ------------------------------------------------------------------ Card */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: ReactNode;
}

export function Card({ interactive = false, className, children, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        "rounded-3xl border border-brand-beige-dark bg-brand-ivory shadow-xs",
        interactive &&
          "cursor-pointer transition-all duration-300 hover:border-brand-olive hover:shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- Button */

type ButtonVariant = "primary" | "secondary" | "ghost" | "panel" | "panelLight";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-brand-olive text-brand-ivory hover:bg-brand-olive-dark shadow-xs",
  secondary:
    "border border-brand-beige-dark bg-brand-beige/25 text-brand-charcoal hover:bg-brand-beige/60",
  ghost: "text-brand-olive hover:bg-brand-beige/30",
  panel:
    "bg-brand-panel-accent text-brand-ivory border border-white/10 hover:bg-brand-panel-accent-hover",
  panelLight: "bg-brand-ivory text-brand-olive hover:bg-brand-beige"
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs rounded-xl",
  md: "px-6 py-3.5 text-sm rounded-2xl"
};

export function Button({
  variant = "primary",
  size = "sm",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
    >
      {children}
    </button>
  );
}

/* ----------------------------------------------------------------- Badge */

type BadgeTone = "olive" | "neutral" | "amber" | "rose" | "emerald";

const badgeTones: Record<BadgeTone, string> = {
  olive: "bg-brand-beige text-brand-olive border border-brand-beige-dark/60",
  neutral: "bg-brand-beige/60 text-brand-charcoal/60 border border-brand-beige-dark/60",
  amber: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20",
  rose: "bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20",
  emerald: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: ReactNode;
}

export function Badge({ tone = "olive", className, children, ...rest }: BadgeProps) {
  return (
    <span
      {...rest}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Maps an engineering difficulty level onto a Badge tone. */
export function difficultyTone(level: string): BadgeTone {
  if (level === "Advanced") return "rose";
  if (level === "Intermediate") return "amber";
  return "emerald";
}
