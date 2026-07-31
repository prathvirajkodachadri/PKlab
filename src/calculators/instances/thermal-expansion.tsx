/**
 * Thermal Expansion — instance plugin.
 * Solver: ΔL = L × α × ΔT × 10^-6, with micron conversion.
 */
import { mathCalculator } from "../mathCalculator";

export default mathCalculator(({ length = 24, tempDiff = 15, coeff = 13 }) => {
  const expansion = length * coeff * tempDiff * 1e-6;
  return {
    expansion: parseFloat(expansion.toFixed(6)),
    expansionMicrons: parseFloat((expansion * 25400).toFixed(2))
  };
});
