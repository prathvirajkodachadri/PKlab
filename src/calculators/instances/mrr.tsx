/**
 * Metal Removal Rate (MRR) — instance plugin.
 * Solver: MRR = Ae × Ap × F, with metric conversion.
 */
import { mathCalculator } from "../mathCalculator";

export default mathCalculator(({ radialDepth = 0.1, axialDepth = 0.5, feedRate = 36 }) => {
  const mrr = radialDepth * axialDepth * feedRate;
  return {
    mrr: parseFloat(mrr.toFixed(3)),
    mrrMetric: parseFloat((mrr * 16.387064).toFixed(1))
  };
});
