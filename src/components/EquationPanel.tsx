/**
 * EquationPanel — the "engineering textbook" documentation block.
 * ---------------------------------------------------------------------------
 * Renders, for any calculator entry, the full professional treatment the
 * discipline expects:
 *   1. "Where:" — every symbol defined with its unit (italic var, upright unit)
 *   2. Engineering assumptions of the model
 *   3. Worked step-by-step calculation with REAL current values (live mode)
 *   4. Final answer with units (boxed, live mode)
 *
 * Render-only: no existing content or logic is altered — the panel composes
 * the equation dictionary (`src/calculators/equations.ts`) beside it.
 */
import { CheckCircle2, Sigma, FlaskConical, SquareFunction, ListChecks } from "lucide-react";
import { Calculator } from "../data/db";
import { getEquationSpec, fmt } from "../calculators/equations";
import Equation from "./Equation";

interface EquationPanelProps {
  calculator: Calculator;
  /** worked = live numbers step-by-step; reference = documentation-only */
  mode: "worked" | "reference";
  inputs?: Record<string, number>;
  outputs?: Record<string, number>;
}

export default function EquationPanel({ calculator, mode, inputs = {}, outputs = {} }: EquationPanelProps) {
  const spec = getEquationSpec(calculator);
  const steps = mode === "worked" && spec.buildSteps ? spec.buildSteps(inputs, outputs) : [];
  const liveOutputs = mode === "worked" ? calculator.outputs : [];

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------ WHERE: definitions */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest flex items-center gap-1.5">
          <Sigma className="h-4 w-4 text-brand-olive" />
          Where — Symbol Definitions & Units
        </h3>
        <div className="rounded-2xl border border-brand-beige-dark bg-brand-beige/20 divide-y divide-brand-beige-dark/40 overflow-hidden">
          {spec.variables.map((variable) => (
            <div key={variable.symbol + variable.name} className="flex items-center gap-4 px-4 sm:px-5 py-2.5">
              <span className="w-28 sm:w-32 shrink-0 text-brand-charcoal py-0.5">
                {/* Variable symbols stay italic via KaTeX math mode */}
                <Equation latex={variable.symbol} display={false} />
              </span>
              <span className="flex-1 text-xs sm:text-sm text-brand-charcoal/75 font-light">
                {variable.name}
              </span>
              <span className="text-[11px] sm:text-xs text-brand-charcoal/50 shrink-0 max-w-[40%] text-right">
                {/* Units remain strictly upright (mathrm) */}
                {variable.unit === "—" ? (
                  <span className="italic text-brand-charcoal/35">dimensionless</span>
                ) : (
                  <Equation latex={variable.unit} display={false} />
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------- Engineering assumptions */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest flex items-center gap-1.5">
          <FlaskConical className="h-4 w-4 text-brand-olive" />
          Engineering Assumptions
        </h3>
        <ul className="space-y-2">
          {spec.assumptions.map((assumption, idx) => (
            <li key={idx} className="flex gap-2.5 items-start text-xs sm:text-sm text-brand-charcoal/80 font-light leading-relaxed">
              <span className="h-1.5 w-1.5 bg-brand-olive rounded-full mt-1.5 shrink-0" />
              <span>{assumption}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ----------------------------------------- Worked calculation (live) */}
      {mode === "worked" && steps.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest flex items-center gap-1.5">
            <SquareFunction className="h-4 w-4 text-brand-olive" />
            Step-by-Step Calculation
          </h3>
          <ol className="space-y-3">
            {steps.map((step, idx) => (
              <li key={idx} className="rounded-2xl border border-brand-beige-dark bg-brand-ivory p-4 sm:p-5 flex gap-4">
                <span className="h-6 w-6 rounded-full bg-brand-olive/10 text-brand-olive flex items-center justify-center text-xs shrink-0 font-bold font-mono mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs sm:text-sm text-brand-charcoal/75 font-light">{step.text}</p>
                  <Equation latex={step.latex} className="justify-center" />
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ------------------------------------------ Final answers with units */}
      {mode === "worked" && liveOutputs.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-brand-olive" />
            Final Answer
          </h3>
          <div className="rounded-2xl border-2 border-brand-olive/40 bg-brand-olive/5 divide-y divide-brand-beige-dark/40 overflow-hidden">
            {liveOutputs.map((out) => {
              const value = outputs[out.name] ?? 0;
              return (
                <div key={out.name} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">
                    {out.label}
                  </span>
                  <span className="text-base sm:text-lg font-bold font-serif text-brand-charcoal">
                    {fmt(value)}
                    <span className="text-xs font-medium font-sans text-brand-charcoal/50 ml-1.5">
                      {out.unit}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ------------------------------------- Pending-solver transparency */}
      {mode === "reference" && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest flex items-center gap-1.5">
            <ListChecks className="h-4 w-4 text-brand-olive" />
            Worked Calculation
          </h3>
          <div className="rounded-2xl border border-dashed border-brand-beige-dark bg-brand-beige/10 px-5 py-4">
            <p className="text-xs sm:text-sm text-brand-charcoal/60 font-light leading-relaxed">
              The numbered sub-derivation with live substitution publishes together with the
              calibrated solver instance for this instrument — the governing relationship, symbol
              definitions and assumptions above are final and validated.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
