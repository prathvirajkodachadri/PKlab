/**
 * mathCalculator — factory for standard equation-based calculator instances.
 * ---------------------------------------------------------------------------
 * Each calculator lives as ONE independent component file inside
 * `src/calculators/instances/`, default-exporting a pre-wired plugin created
 * here. The file NAME must equal the calculator's JSON `id` — instances are
 * auto-discovered by `import.meta.glob` in `src/calculators/registry.tsx`.
 *
 * ADDING A NEW CALCULATOR = exactly two edits, nothing else:
 *   1. JSON entry appended to `public/data/calculators.json`
 *      (`"plugin": "mathForm"` — inputs, outputs, formula, notes are the UI).
 *   2. One instance file: src/calculators/instances/<id>.tsx containing only
 *      `export default mathCalculator((inputs) => ({ ...outputs }))`.
 * Cards, category pages, breadcrumbs, SEO, related links and routing all
 * generate automatically from those two sources.
 */
import { ComponentType } from "react";
import MathFormPlugin, { SolverFn } from "./MathFormPlugin";
import { Calculator } from "../data/db";

/** Instances accept only the JSON entity — the solver is bound internally. */
export type CalculatorComponent = ComponentType<{ calculator: Calculator }>;

export function mathCalculator(solve: SolverFn): CalculatorComponent {
  const MathCalculatorInstance = ({ calculator }: { calculator: Calculator }) => (
    <MathFormPlugin calculator={calculator} solve={solve} />
  );
  MathCalculatorInstance.displayName = "MathCalculatorInstance";
  return MathCalculatorInstance;
}
