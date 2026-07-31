/**
 * Equation — professional mathematical equation renderer.
 * ---------------------------------------------------------------------------
 * Wraps KaTeX so every engineering formula displays exactly like a
 * mechanical engineering handbook: stacked fractions, true superscripts and
 * subscripts, Greek letters, italic variables and upright units.
 * Equations are centered; inline variants sit inside text flows.
 */
import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cn } from "../utils/cn";

interface EquationProps {
  /** LaTeX source of the equation. */
  latex: string;
  /** true = centered display equation, false = inline inside a sentence. */
  display?: boolean;
  className?: string;
}

export default function Equation({ latex, display = true, className }: EquationProps) {
  const html = useMemo(
    () =>
      katex.renderToString(latex, {
        displayMode: display,
        throwOnError: false,
        strict: "ignore"
      }),
    [latex, display]
  );

  if (display) {
    return (
      <div
        role="math"
        aria-label={latex}
        className={cn("equation-display flex justify-center overflow-x-auto py-2", className)}
        // Safe: formula strings are authored locally, never user input.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      role="math"
      aria-label={latex}
      className={cn("equation-inline", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
