/**
 * Ballscrew Critical Speed — instance plugin.
 * Solver: N = Cf × 4.76 × 10^6 × (d / L²), with 80% safe operating limit.
 */
import { mathCalculator } from "../mathCalculator";

export default mathCalculator(({ diameter = 0.75, length = 36, mountFactor = 2.23 }) => {
  const critical = length > 0 ? mountFactor * 4.76e6 * (diameter / Math.pow(length, 2)) : 0;
  return {
    criticalSpeed: Math.round(critical),
    maxSafeSpeed: Math.round(critical * 0.8)
  };
});
