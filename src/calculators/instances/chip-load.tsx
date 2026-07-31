/**
 * Radial Chip Thinning — instance plugin.
 * Solver: geometric thinning factor when Ae < D/2.
 *   thinningFactor = D / (2 × √(D×Ae − Ae²))
 *   effectiveChipLoad = Fz / thinningFactor
 */
import { mathCalculator } from "../mathCalculator";

export default mathCalculator(({ feedPerTooth = 0.003, diameter = 0.5, radialDepth = 0.05 }) => {
  let thinningFactor = 1.0;
  if (radialDepth < diameter / 2 && radialDepth > 0 && diameter > 0) {
    const denominator = 2 * Math.sqrt(diameter * radialDepth - radialDepth * radialDepth);
    if (denominator > 0) thinningFactor = diameter / denominator;
  }
  return {
    effectiveChipLoad: parseFloat((feedPerTooth / thinningFactor).toFixed(5)),
    thinningFactor: parseFloat(thinningFactor.toFixed(3))
  };
});
