/**
 * Breadcrumbs — semantic navigation trail rendered on every page.
 * Crumbs are auto-assembled by `src/router/core.ts` from the JSON catalogs.
 */
import { ChevronRight, Home } from "lucide-react";
import { cn } from "../utils/cn";

export interface Crumb {
  /** Display label (usually pulled straight from the JSON entry title). */
  label: string;
  /** Route page key to navigate to; omitted = current page (not clickable). */
  page?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  onNavigate: (page: string) => void;
  className?: string;
}

export default function Breadcrumbs({ items, onNavigate, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center flex-wrap gap-y-1", className)}>
      <ol className="flex items-center flex-wrap gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
        {items.map((crumb, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="h-3 w-3 text-brand-charcoal/30 shrink-0" aria-hidden="true" />}
              {isLast || !crumb.page ? (
                <span
                  aria-current="page"
                  className="text-brand-charcoal/80 inline-flex items-center gap-1 max-w-[240px] sm:max-w-xs truncate"
                >
                  {idx === 0 && crumb.page === undefined && <Home className="h-3 w-3" />}
                  {crumb.label}
                </span>
              ) : (
                <button
                  onClick={() => onNavigate(crumb.page!)}
                  className="text-brand-charcoal/45 hover:text-brand-olive transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  {idx === 0 && <Home className="h-3 w-3" />}
                  {crumb.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
