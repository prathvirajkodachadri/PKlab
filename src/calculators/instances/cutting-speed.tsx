/**
 * Cutting Speed (SFM / Vc) — instance plugin.
 * Solver: SFM = (RPM × π × D) / 12, with metric conversion.
 */
import { mathCalculator } from "../mathCalculator";

export default mathCalculator(({ rpm = 3000, diameter = 0.5 }) => {
  const sfm = (rpm * Math.PI * diameter) / 12;
  return {
    cuttingSpeed: parseFloat(sfm.toFixed(1)),
    cuttingSpeedMetric: parseFloat((sfm * 0.3048).toFixed(1))
  };
});
