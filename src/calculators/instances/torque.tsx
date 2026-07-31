/**
 * Spindle Torque — instance plugin.
 * Solver: T = (HP × 5252) / RPM, with N·m conversion.
 */
import { mathCalculator } from "../mathCalculator";

export default mathCalculator(({ horsepower = 7.5, rpm = 3000 }) => {
  const ftLbs = rpm > 0 ? (horsepower * 5252) / rpm : 0;
  return {
    torqueFtLbs: parseFloat(ftLbs.toFixed(1)),
    torqueNm: parseFloat((ftLbs * 1.3558179).toFixed(1))
  };
});
