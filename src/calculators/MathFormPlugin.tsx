/**
 * MathFormPlugin — the default "mathForm" calculator plugin.
 * ---------------------------------------------------------------------------
 * A fully declarative, interactive computation surface generated
 * strictly from the calculator's JSON entry:
 *   • Dual input system (direct numeric field + drag slider) with range rules
 *   • Live dual-unit outputs (Imperial + Metric) with copy-to-clipboard
 *   • Reset-to-baseline & URL-parameter deep links (?input=value)
 *   • Knowledge tabs: Mathematical Explanation / Engineering Notes / Applications
 *
 * Any calculator registered with `"plugin": "mathForm"` in
 * `public/data/calculators.json` renders here with zero page changes.
 * A bespoke calculator can ship its own plugin component instead —
 * register it once in `src/calculators/registry.tsx`.
 */
import { useEffect, useState } from "react";
import {
  Copy, RotateCcw, Check, BookOpen, AlertCircle, Award
} from "lucide-react";
import { Calculator, CalculatorInput } from "../data/db";
import Equation from "../components/Equation";
import EquationPanel from "../components/EquationPanel";
import { getEquationSpec } from "./equations";

/** A calculator solver: raw input map → unit-annotated output map. */
export type SolverFn = (inputs: Record<string, number>) => Record<string, number>;

export interface CalculatorPluginProps {
  calculator: Calculator;
  /** The physics equation is INJECTED by the calculator's instance file
   *  (`src/calculators/instances/<id>.tsx`) — never hard-coded here. */
  solve: SolverFn;
}

export default function MathFormPlugin({ calculator, solve }: CalculatorPluginProps) {
  const [inputsState, setInputsState] = useState<{ [name: string]: number }>({});
  const [activeTab, setActiveTab] = useState<"formula" | "notes" | "applications">("formula");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  /* Initialise parameters — honoring pre-configured URLs (?name=value). */
  useEffect(() => {
    const initial: { [name: string]: number } = {};
    calculator.inputs.forEach((input) => (initial[input.name] = input.value));

    // Parse hash query string so shared links restore the exact configuration
    const qIndex = window.location.hash.indexOf("?");
    if (qIndex > -1) {
      const params = new URLSearchParams(window.location.hash.slice(qIndex + 1));
      calculator.inputs.forEach((input) => {
        const raw = params.get(input.name);
        if (raw !== null && !isNaN(parseFloat(raw))) initial[input.name] = parseFloat(raw);
      });
    }

    setInputsState(initial);
    setActiveTab("formula");
    setCopiedField(null);
  }, [calculator]);

  const handleInputChange = (name: string, valueStr: string) => {
    const val = parseFloat(valueStr);
    setInputsState((prev) => ({ ...prev, [name]: isNaN(val) ? 0 : val }));
  };

  const handleReset = () => {
    const initial: { [name: string]: number } = {};
    calculator.inputs.forEach((input) => (initial[input.name] = input.value));
    setInputsState(initial);
    setCopiedField(null);
  };

  const handleCopy = (label: string, value: number, unit: string) => {
    navigator.clipboard
      .writeText(`${calculator.title} result: ${value} ${unit} (Computed via PKlab)`)
      .then(() => {
        setCopiedField(label);
        setTimeout(() => setCopiedField(null), 2000);
      });
  };

  // Physics is injected by this calculator's instance component
  const computedOutputs = solve(inputsState);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ------------------------------------------------ LEFT: parameters + knowledge */}
      <div className="lg:col-span-7 space-y-6">
        {/* Parameter console */}
        <div className="rounded-3xl border border-brand-beige-dark bg-brand-ivory p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6 border-b border-brand-beige-dark/50 pb-5">
            <div>
              <span className="inline-block text-[10px] font-bold text-brand-olive uppercase tracking-widest bg-brand-beige px-2.5 py-1 rounded-full mb-2">
                Operational Tuning Parameters
              </span>
              <h2 className="text-xl font-bold text-brand-charcoal font-serif">
                Configure Mathematical Boundaries
              </h2>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-beige-dark bg-brand-beige/20 text-xs font-semibold text-brand-charcoal hover:bg-brand-beige/50 hover:text-brand-olive transition-all cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          <div className="space-y-6">
            {calculator.inputs.map((input: CalculatorInput) => {
              const value = inputsState[input.name] ?? input.value;
              const outOfRange = value < input.min || value > input.max;

              return (
                <div key={input.name} className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-sm font-semibold text-brand-charcoal">{input.label}</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-brand-charcoal/40 font-medium font-mono hidden sm:inline">
                        [{input.min} – {input.max}]
                      </span>
                      <div className="relative rounded-lg border border-brand-beige-dark bg-brand-beige/10 px-2.5 py-1 w-24">
                        <input
                          type="number"
                          value={value}
                          step={input.step}
                          onChange={(e) => handleInputChange(input.name, e.target.value)}
                          aria-label={input.label}
                          className="w-full text-right text-xs font-mono font-bold text-brand-charcoal outline-hidden bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={value}
                      onChange={(e) => handleInputChange(input.name, e.target.value)}
                      aria-label={`${input.label} slider`}
                      className="flex-1 accent-brand-olive cursor-pointer h-1.5 bg-brand-beige rounded-lg outline-hidden"
                    />
                    <span className="text-xs font-medium text-brand-charcoal/60 w-16 shrink-0 text-left font-mono">
                      {input.unit}
                    </span>
                  </div>

                  {input.help && (
                    <p className="text-[11px] text-brand-charcoal/50 leading-relaxed font-light">{input.help}</p>
                  )}

                  {outOfRange && (
                    <div className="flex items-center gap-1.5 text-[11px] text-brand-warning-text bg-brand-warning-bg p-2 rounded-lg font-medium border border-brand-warning-border">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      Parameter drifts outside typical machining constraints. Exercise caution.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Knowledge tabs */}
        <div className="rounded-3xl border border-brand-beige-dark bg-brand-ivory overflow-hidden shadow-sm">
          <div className="flex border-b border-brand-beige-dark bg-brand-beige/30">
            {[
              { id: "formula", label: "Mathematical Explanation", icon: BookOpen },
              { id: "notes", label: "Engineering Notes", icon: AlertCircle },
              { id: "applications", label: "Physical Applications", icon: Award }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "border-brand-olive text-brand-olive bg-brand-ivory"
                      : "border-transparent text-brand-charcoal/60 hover:text-brand-olive hover:bg-brand-beige/15"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6 sm:p-8 space-y-4 text-brand-charcoal text-sm leading-relaxed">
            {activeTab === "formula" && (
              <div className="space-y-8">
                {/* Professional stacking-notation display equation (KaTeX) */}
                <div className="bg-brand-beige/40 p-5 rounded-2xl border border-brand-beige-dark/50">
                  <span className="text-xs block text-brand-charcoal/40 uppercase tracking-widest font-bold mb-1 text-center">
                    Mathematical Formula
                  </span>
                  <Equation latex={getEquationSpec(calculator).latex} />
                </div>

                <p className="font-light text-brand-charcoal/80 whitespace-pre-line leading-relaxed">
                  {calculator.formulaExplanation}
                </p>

                {/* Full textbook treatment: definitions, SI units, assumptions,
                    worked step-by-step calculation and final answers */}
                <div className="border-t border-brand-beige-dark/50 pt-8">
                  <EquationPanel
                    calculator={calculator}
                    mode="worked"
                    inputs={inputsState}
                    outputs={computedOutputs}
                  />
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-3">
                <div className="flex gap-3 bg-brand-warning-bg p-4 rounded-2xl border border-brand-warning-border text-brand-warning-text">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs uppercase tracking-widest font-bold mb-1">Operational Warning Limits</h4>
                    <p className="text-xs leading-relaxed">
                      Ensure physical safety guard enclosures are locked before initiating cutting sequences matching these spindle metrics.
                    </p>
                  </div>
                </div>
                <p className="font-light text-brand-charcoal/80 leading-relaxed whitespace-pre-line">
                  {calculator.engineeringNotes}
                </p>
              </div>
            )}

            {activeTab === "applications" && (
              <div>
                <h4 className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest mb-3">
                  Target Shop-Floor Implementations
                </h4>
                <ul className="space-y-2.5">
                  {calculator.applications.map((app, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start">
                      <span className="h-5 w-5 rounded-full bg-brand-olive/10 text-brand-olive flex items-center justify-center text-xs shrink-0 font-bold font-mono">
                        {idx + 1}
                      </span>
                      <span className="text-brand-charcoal/85">{app}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ RIGHT: live outputs */}
      <div className="lg:col-span-5">
        <div className="rounded-3xl border border-brand-beige-dark bg-brand-beige/50 p-6 sm:p-8 shadow-sm text-brand-charcoal relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full border border-brand-olive/5 pointer-events-none" />

          <span className="inline-block text-[10px] font-bold text-brand-olive uppercase tracking-widest bg-brand-ivory border border-brand-beige-dark px-2.5 py-1 rounded-full mb-4">
            Live Math Outputs
          </span>

          <h3 className="text-lg font-bold font-serif mb-6 text-brand-charcoal">
            Computed Spindle Solutions
          </h3>

          <div className="space-y-5">
            {calculator.outputs.map((out) => {
              const rawVal = computedOutputs[out.name] ?? 0;
              const isCopied = copiedField === out.label;
              return (
                <div
                  key={out.name}
                  className="rounded-2xl border border-brand-beige-dark bg-brand-ivory p-5 flex items-center justify-between gap-4 transition-all hover:border-brand-olive hover:shadow-xs group"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-charcoal/45">
                      {out.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold font-serif text-brand-charcoal mt-1 tracking-tight">
                      {rawVal.toLocaleString(undefined, { maximumFractionDigits: 5 })}
                      <span className="text-xs font-medium font-sans text-brand-charcoal/50 ml-1.5">
                        {out.unit}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(out.label, rawVal, out.unit)}
                    className="p-3.5 rounded-xl border border-brand-beige-dark bg-brand-beige/20 text-brand-charcoal/60 hover:bg-brand-olive hover:text-brand-ivory hover:border-brand-olive transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0"
                    title="Copy result to clipboard"
                    aria-label={`Copy ${out.label}`}
                  >
                    {isCopied ? <Check className="h-4.5 w-4.5" /> : <Copy className="h-4.5 w-4.5" />}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <span className="text-[10px] text-brand-charcoal/40 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              Continuous Microsecond Solving
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
