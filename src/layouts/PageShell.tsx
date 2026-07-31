/**
 * PageShell — the reusable Layout wrapper for every content page.
 * Renders automatic breadcrumb navigation plus an optional editorial
 * header (eyebrow pill / serif title / description) before page content.
 */
import { ReactNode } from "react";
import { cn } from "../utils/cn";
import Breadcrumbs, { Crumb } from "./Breadcrumbs";

interface PageShellProps {
  crumbs: Crumb[];
  onNavigate: (page: string) => void;
  eyebrow?: string;
  title?: string;
  description?: string;
  /** wide = max-w-7xl (grid pages), default = max-w-5xl (reading pages) */
  wide?: boolean;
  children: ReactNode;
}

export default function PageShell({
  crumbs,
  onNavigate,
  eyebrow,
  title,
  description,
  wide = false,
  children
}: PageShellProps) {
  return (
    <section
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8",
        wide ? "max-w-7xl" : "max-w-5xl"
      )}
    >
      <Breadcrumbs items={crumbs} onNavigate={onNavigate} />

      {title && (
        <header className="text-center max-w-2xl mx-auto space-y-3 pt-2">
          {eyebrow && (
            <span className="inline-block text-[10px] font-bold text-brand-olive uppercase tracking-widest bg-brand-beige px-2.5 py-1 rounded-full">
              {eyebrow}
            </span>
          )}
          <h1 className="text-3xl sm:text-[2.2rem] font-serif font-bold text-brand-charcoal leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-brand-charcoal/65 font-light leading-relaxed">{description}</p>
          )}
        </header>
      )}

      <div>{children}</div>
    </section>
  );
}
