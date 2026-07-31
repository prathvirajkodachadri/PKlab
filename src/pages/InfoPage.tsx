/**
 * InfoPage — ONE reusable template for static reading pages (privacy/terms).
 * Content arrives as declarative blocks; the layout handles breadcrumbs,
 * typography and the highlighting of warning lines automatically.
 */
import { navigate, getCrumbs } from "../router/core";
import PageShell from "../layouts/PageShell";

export interface InfoBlock {
  /** Standard paragraph. */
  type: "paragraph" | "heading" | "warning";
  text: string;
}

export interface InfoPageContent {
  page: string; // route key — drives auto breadcrumbs
  title: string;
  eyebrow: string;
  blocks: InfoBlock[];
}

export const PRIVACY_PAGE: InfoPageContent = {
  page: "privacy",
  title: "Privacy Policy",
  eyebrow: "Last Updated: March 2026",
  blocks: [
    {
      type: "paragraph",
              text: "At PKlab, we are firmly committed to protecting your shop-floor metrics and computational confidentiality. This platform does not collect, record, index or transmit any inputs configured inside our mechanical calculators."
    },
    { type: "heading", text: "1. Local Processing Architecture" },
    {
      type: "paragraph",
      text: "All mathematics, limits checking and structural simulations execute strictly client-side inside your web browser. There are no external analytics libraries, SQL databases or tracking cookies observing your parameters. Newsletter drafts and contact inquiries are stored in your browser's localStorage."
    },
    { type: "heading", text: "2. Data Integrity & Bookmarking" },
    {
      type: "paragraph",
      text: "URL parameter queries present in calculator deep links operate entirely as stateless queries parsed locally on browser load. No user configurations are logged onto servers."
    },
    {
      type: "paragraph",
      text: "For questions regarding offline deployment packages or private network instances, contact us at privacy@pklab.engineering."
    }
  ]
};

export const TERMS_PAGE: InfoPageContent = {
  page: "terms",
  title: "Terms of Use & Mechanical Liability Waiver",
  eyebrow: "Last Updated: March 2026",
  blocks: [
    {
      type: "paragraph",
      text: "By utilizing PKlab calculators, you acknowledge and agree to comply with the structural liability constraints outlined below."
    },
    { type: "heading", text: "1. Calculations Calibration" },
    {
      type: "paragraph",
      text: "The calculated values represent theoretical mechanical scenarios derived from ideal ISO and ASME equations. Real-world machinery conditions — including holder runout, cutter wear, material impurities, spindle bearing play and workpiece clamping stability — can cause high physical deviations."
    },
    {
      type: "warning",
      text: "LIMITATION OF LIABILITY: Under no circumstances shall PKlab or its developers be liable for direct, indirect, incidental or crash-related hardware damages, tooling breakage, spindle degradation, workpiece scrap rates, or labor injuries arising from machining sequences executed against theoretical computed values."
    },
    {
      type: "paragraph",
      text: "Machinists must calibrate feeds incrementally and follow standard industry safety procedures, including wearing proper safety eyewear and keeping physical guard enclosures locked during operations."
    }
  ]
};

export function InfoPage({ content }: { content: InfoPageContent }) {
  const crumbs = getCrumbs({ page: content.page, id: null });

  return (
    <PageShell crumbs={crumbs} onNavigate={navigate} eyebrow={content.eyebrow} title={content.title}>
      <div className="max-w-3xl mx-auto text-xs sm:text-sm text-brand-charcoal/80 space-y-4 font-light leading-relaxed border-t border-brand-beige-dark/50 pt-6">
        {content.blocks.map((block, idx) => {
          if (block.type === "heading") {
            return (
              <p key={idx} className="font-bold text-brand-charcoal">{block.text}</p>
            );
          }
          if (block.type === "warning") {
            return (
              <div key={idx} className="font-bold text-brand-warning-text bg-brand-warning-bg p-3.5 rounded-xl border border-brand-warning-border text-xs">
                {block.text}
              </div>
            );
          }
          return <p key={idx}>{block.text}</p>;
        })}
      </div>
    </PageShell>
  );
}
