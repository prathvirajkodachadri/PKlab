/**
 * CalculatorView — the host page body for calculator detail routes.
 * ---------------------------------------------------------------------------
 * It stays completely generic: it resolves the calculator's plugin component
 * from the registry and renders it, then auto-appends host-level surfaces
 * (related calculators, calibration safety guidance) derived from JSON.
 * Individual plugin files own their full interactive behaviour.
 */
import { AlertCircle, ArrowRight } from "lucide-react";
import { Calculator, getRelatedCalculators } from "../data/db";
import { resolveCalculatorPlugin } from "../calculators/registry";
import PendingCalculatorPanel from "../calculators/PendingCalculatorPanel";

interface CalculatorViewProps {
  calculator: Calculator;
  onSelectCalculator: (id: string) => void;
}

export default function CalculatorView({ calculator, onSelectCalculator }: CalculatorViewProps) {
  const relatedCalcs = getRelatedCalculators(calculator);

  // Pending catalog entries render the honest calibration-state panel
  const isPending = calculator.status === "pending" || calculator.inputs.length === 0;

  // Plugin resolution keeps the host agnostic of concrete calculators
  const livePlugin = isPending ? null : resolveCalculatorPlugin(calculator);
  const LiveSurface = livePlugin;

  return (
    <div className="space-y-10">
      {/* Interactive surface — live plugin, or the calibration-state panel */}
      {LiveSurface ? (
        <LiveSurface calculator={calculator} />
      ) : (
        <PendingCalculatorPanel calculator={calculator} />
      )}

      {/* Host-level companions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calibration safety guidance */}
        <div className="lg:col-span-7 rounded-3xl border border-brand-beige-dark bg-brand-ivory p-6 shadow-sm">
          <h4 className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-brand-olive" />
            PKlab Calibration Guidelines
          </h4>
          <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light">
            Always calibrate inputs against your tool vendor catalog. PKlab does not assume liability
            for physical crash damage or thermal degradation resulting from tooling runs executed at
            theoretical calculations. Increase parameters incrementally on the control panel, and wear
            proper safety PPE.
          </p>
        </div>

        {/* Related calculators — auto-generated from the entry's relations */}
        {relatedCalcs.length > 0 && (
          <div className="lg:col-span-5 rounded-3xl border border-brand-beige-dark bg-brand-ivory p-6 shadow-sm">
            <h4 className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest mb-4">
              Related Engineering Tools
            </h4>
            <div className="space-y-2.5">
              {relatedCalcs.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectCalculator(c.id)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-brand-beige-dark/50 hover:border-brand-olive hover:bg-brand-beige/10 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-brand-charcoal group-hover:text-brand-olive transition-colors">
                      {c.title}
                    </p>
                    <p className="text-[10px] text-brand-charcoal/50 mt-0.5 font-light line-clamp-1">
                      {c.description}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-brand-charcoal/30 group-hover:text-brand-olive group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
