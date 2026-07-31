/**
 * Table Feed Rate — instance plugin.
 * Solver: F = RPM × Z × Fz (linear IPM from teeth & chip load).
 */
import { mathCalculator } from "../mathCalculator";

export default mathCalculator(({ rpm = 3000, flutes = 4, feedPerTooth = 0.003 }) => ({
  feedRate: parseFloat((rpm * flutes * feedPerTooth).toFixed(2))
}));
