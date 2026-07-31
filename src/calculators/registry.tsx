/**
 * Calculator Plugin Registry — AUTO-DISCOVERING.
 * ---------------------------------------------------------------------------
 * Every `src/calculators/instances/<id>.tsx` file self-registers here at
 * build time via Vite's `import.meta.glob`. The FILE NAME is the calculator's
 * JSON `id`, so no registry edits are ever needed to add calculators.
 *
 * Instances are standard `mathCalculator` factories, or fully bespoke
 * components accepting `{ calculator: Calculator }` for exotic instruments.
 */
import { Calculator } from "../data/db";
import { CalculatorComponent } from "./mathCalculator";
import { Card, Badge } from "../components/ui/Primitives";

/* ---------------------------------------------------------------- Globe */

// Eagerly import every instance file at build time (code-splitting kept by
// Vite at the route level; instances are tiny equation closures).
const instanceModules = import.meta.glob("./instances/*.tsx", { eager: true });

const instancePlugins: Record<string, CalculatorComponent> = {};
for (const path in instanceModules) {
  // "./instances/rpm.tsx" → "rpm"
  const id = path.replace("./instances/", "").replace(/\.tsx$/, "");
  const component = (instanceModules[path] as { default?: CalculatorComponent }).default;
  if (component) instancePlugins[id] = component;
}

/** Registry inspection (useful for future admin console / exports). */
export function getRegisteredCalculatorIds(): string[] {
  return Object.keys(instancePlugins);
}

/* -------------------------------------------------- Fallback (edge case) */

function MissingCalculatorPlugin({ calculator }: { calculator: Calculator }) {
  return (
    <Card className="p-8 text-center space-y-3">
      <Badge tone="amber">Plugin Not Registered</Badge>
      <h2 className="text-xl font-serif font-bold text-brand-charcoal">{calculator.title}</h2>
      <p className="text-xs text-brand-charcoal/60 max-w-md mx-auto font-light leading-relaxed">
        This calculator exists in the JSON catalog but its instance file is missing.
        Create <code className="font-mono font-bold text-brand-olive">src/calculators/instances/{calculator.id}.tsx</code>{" "}
        exporting <code className="font-mono font-bold text-brand-olive">mathCalculator(solver)</code>.
      </p>
    </Card>
  );
}

/* --------------------------------------------------------------- Resolve */

/**
 * resolveCalculatorPlugin — returns the independent component that renders
 * the given calculator. Discovery order: instance file → safe fallback.
 */
export function resolveCalculatorPlugin(calc: Calculator): CalculatorComponent {
  return instancePlugins[calc.id] ?? MissingCalculatorPlugin;
}
