/**
 * StandardsPage — one reusable template for the standards index.
 * Compliance cards auto-generate from standards.json.
 */
import { standards } from "../data/db";
import { navigate, getCrumbs } from "../router/core";
import PageShell from "../layouts/PageShell";
import { Card, Badge } from "../components/ui/Primitives";

export default function StandardsPage() {
  const crumbs = getCrumbs({ page: "standards", id: null });

  return (
    <PageShell
      crumbs={crumbs}
      onNavigate={navigate}
      eyebrow="Regulatory Compliance"
      title="Mechanical Engineering Standards Index"
      description="Official standards parameters used to model PKlab mathematical limits. Ensures blueprint and GD&T tolerance compliance."
    >
      <div className="space-y-6 pt-2">
        {standards.map((std) => (
          <Card key={std.id} className="p-6 sm:p-8 space-y-5 hover:border-brand-olive/40 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-beige-dark/50 pb-4">
              <div>
                <Badge tone="olive">{std.scope} • {std.organization}</Badge>
                <h3 className="text-xl font-bold font-serif text-brand-charcoal mt-2.5">{std.title}</h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed font-light">
              {std.description}
            </p>

            <div className="space-y-2.5 bg-brand-beige/20 p-5 rounded-2xl border border-brand-beige-dark/40">
              <h4 className="text-[10px] font-bold text-brand-charcoal/50 uppercase tracking-widest">
                Key Compliance Parameters
              </h4>
              <ul className="space-y-1.5 text-xs text-brand-charcoal/80">
                {std.keyMetrics.map((met, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <span className="h-1.5 w-1.5 bg-brand-olive rounded-full mt-1.5 shrink-0" />
                    <span>{met}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-brand-charcoal/60 italic leading-relaxed border-l-2 border-brand-olive pl-3 font-light">
              <span className="font-bold text-brand-charcoal not-italic block text-[10px] uppercase tracking-wider mb-0.5">
                Shop-Floor Implementation
              </span>
              {std.applicationNote}
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
