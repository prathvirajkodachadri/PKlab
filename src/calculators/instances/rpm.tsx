/**
 * Spindle RPM Calculator — instance plugin.
 * Solver: RPM = (SFM × 3.82) / D. UI comes from calculators.json.
 */
import { mathCalculator } from "../mathCalculator";

export default mathCalculator(({ cuttingSpeed = 400, diameter = 0.5 }) => ({
  rpm: diameter > 0 ? Math.round((cuttingSpeed * 3.82) / diameter) : 0
}));
