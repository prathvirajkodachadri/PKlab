/**
 * NotFound — beautiful 404 / empty-state panel used for unknown routes,
 * archived articles, missing categories and "no search results" moments.
 */
import { AlertTriangle, Compass } from "lucide-react";
import { Button } from "./ui/Primitives";

interface NotFoundProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** quick = compact inline card, page = full-height centered hero */
  variant?: "page" | "quick";
  extraActions?: { label: string; onClick: () => void }[];
}

export default function NotFound({
  title,
  message,
  actionLabel,
  onAction,
  variant = "page",
  extraActions = []
}: NotFoundProps) {
  if (variant === "quick") {
    return (
      <div className="rounded-3xl border border-dashed border-brand-beige-dark bg-brand-beige/10 p-10 text-center space-y-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-olive/10 text-brand-olive mx-auto">
          <Compass className="h-6 w-6" />
        </span>
        <h2 className="text-base font-bold font-serif text-brand-charcoal">{title}</h2>
        <p className="text-xs text-brand-charcoal/55 font-light max-w-sm mx-auto leading-relaxed">{message}</p>
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
        )}
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-md px-4 py-24 text-center space-y-6">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-olive/10 text-brand-olive animate-float">
        <AlertTriangle className="h-8 w-8" />
      </span>
      <div className="space-y-2">
        <h1 className="text-4xl font-serif font-bold text-brand-charcoal">{title}</h1>
        <p className="text-sm text-brand-charcoal/60 leading-relaxed font-light">{message}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
        )}
        {extraActions.map((a) => (
          <Button key={a.label} variant="secondary" onClick={a.onClick}>{a.label}</Button>
        ))}
      </div>
    </section>
  );
}
