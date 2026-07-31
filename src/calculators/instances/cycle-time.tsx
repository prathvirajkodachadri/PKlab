/**
 * Machining Cycle Time — instance plugin.
 * Solver: Time = (L / F) + T_aux (auxiliary seconds converted to minutes).
 */
import { mathCalculator } from "../mathCalculator";

export default mathCalculator(({ length = 12, feedRate = 18, auxTime = 12 }) => {
  const cuttingMinutes = feedRate > 0 ? length / feedRate : 0;
  const totalMinutes = cuttingMinutes + auxTime / 60;
  return {
    cycleTimeMinutes: parseFloat(totalMinutes.toFixed(2)),
    cycleTimeSeconds: parseFloat((totalMinutes * 60).toFixed(1))
  };
});
