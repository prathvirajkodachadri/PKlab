/**
 * Feed per Tooth (Chip Load) — instance plugin.
 * Solver: Fz = F / (RPM × Z) — inverse of the feed rate equation.
 */
import { mathCalculator } from "../mathCalculator";

export default mathCalculator(({ feedRate = 36, rpm = 3000, flutes = 4 }) => ({
  feedPerTooth: rpm * flutes > 0 ? parseFloat((feedRate / (rpm * flutes)).toFixed(5)) : 0
}));
