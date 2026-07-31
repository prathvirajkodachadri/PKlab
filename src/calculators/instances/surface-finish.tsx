/**
 * Theoretical Surface Finish (Ra) — instance plugin.
 * Solver: Ra = (f² / (32 × R)) × 10^6, with micron conversion.
 */
import { mathCalculator } from "../mathCalculator";

export default mathCalculator(({ feedRate = 0.006, noseRadius = 0.0312 }) => {
  const microIn = noseRadius > 0 ? (Math.pow(feedRate, 2) / (32 * noseRadius)) * 1e6 : 0;
  return {
    roughnessMicroIn: parseFloat(microIn.toFixed(2)),
    roughnessMicrons: parseFloat((microIn * 0.0254).toFixed(3))
  };
});
