/**
 * L10 Spindle Bearing Life — instance plugin.
 * Solver: L10h = (10^6 / (60 × RPM)) × (C / P)^3  (ball bearings).
 */
import { mathCalculator } from "../mathCalculator";

export default mathCalculator(({ dynamicLoad = 15000, radialLoad = 1800, rpm = 6000 }) => {
  const lifeRevolutions = radialLoad > 0 ? Math.pow(dynamicLoad / radialLoad, 3) : 0;
  const lifeHours = rpm > 0 ? (1000000 / (60 * rpm)) * lifeRevolutions : 0;
  return {
    lifeHours: Math.round(lifeHours),
    lifeRevolutions: parseFloat(lifeRevolutions.toFixed(2))
  };
});
