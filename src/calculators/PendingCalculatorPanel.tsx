/**
 * PendingCalculatorPanel — the "solver in calibration" surface.
 * ---------------------------------------------------------------------------
 * Rendered for calculator entries flagged `"status": "pending"` in
 * calculators.json. The page is a REAL page (SEO, breadcrumbs, related
 * instruments auto-generate identically to live ones) but its interactive
 * parameter console is replaced by an honest engineering roadmap card —
 * no fake math is ever shown. Shipping the solver later only requires
 * dropping an instance file into `src/calculators/instances/`.
 */
import { FlaskConical, BookOpen, AlertCircle, Award } from "lucide-react";
import { Calculator } from "../data/db";
import { Badge } from "../components/ui/Primitives";
import Equation from "../components/Equation";
import EquationPanel from "../components/EquationPanel";
import { getEquationSpec } from "./equations";

interface PendingCalculatorPanelProps {
  calculator: Calculator;
}

export default function PendingCalculatorPanel({ calculator }: PendingCalculatorPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ---------------- LEFT: calibration state card */}
      <div className="lg:col-span-7 rounded-3xl border border-brand-beige-dark bg-brand-ivory p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-8 -top-8 opacity-5 pointer-events-none">
          <FlaskConical className="h-48 w-48 text-brand-olive" />
        </div>

        <div className="relative space-y-6">
          <div>
            <Badge tone="amber">Calibration In Progress</Badge>
            <h2 className="text-xl font-bold text-brand-charcoal font-serif mt-3">
              Instrument Under Laboratory Calibration
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed font-light">
            This instrument's physical model is registered in the PKlab catalog and is currently
            being validated by the research laboratory — boundary conditions, unit envelopes and
            solver constants are being benchmarked against shop-floor telemetry before release.
          </p>

          {/* Governing relationship — professional display equation */}
          <div className="bg-brand-beige/40 p-5 rounded-2xl border border-brand-beige-dark/50">
            <span className="text-xs block text-brand-charcoal/40 uppercase tracking-widest font-bold mb-1 text-center">
              Governing Relationship
            </span>
            <Equation latex={getEquationSpec(calculator).latex} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-brand-olive" />
              Planned Model Behavior
            </h3>
            <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed font-light">
              {calculator.formulaExplanation}
            </p>
          </div>

          {/* Full textbook documentation: symbol definitions, units, assumptions */}
          <div className="border-t border-brand-beige-dark/50 pt-6">
            <EquationPanel calculator={calculator} mode="reference" />
          </div>
        </div>
      </div>

      {/* ---------------- RIGHT: notes + applications */}
      <div className="lg:col-span-5 space-y-6">
        <div className="rounded-3xl border border-brand-beige-dark bg-brand-beige/50 p-6 sm:p-8 shadow-sm">
          <h3 className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-brand-olive" />
            Engineering Notes
          </h3>
          <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed font-light">
            {calculator.engineeringNotes}
          </p>
        </div>

        <div className="rounded-3xl border border-brand-beige-dark bg-brand-ivory p-6 shadow-sm">
          <h4 className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-brand-olive" />
            Target Shop-Floor Implementations
          </h4>
          <ul className="space-y-2.5">
            {calculator.applications.map((app, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs sm:text-sm">
                <span className="h-5 w-5 rounded-full bg-brand-olive/10 text-brand-olive flex items-center justify-center text-xs shrink-0 font-bold font-mono">
                  {idx + 1}
                </span>
                <span className="text-brand-charcoal/85">{app}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
