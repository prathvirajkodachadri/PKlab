/**
 * Cutting Horsepower / Power — instance plugin.
 * Solver: HP = (Torque × RPM) / 5252, with kW conversion.
 */
import { mathCalculator } from "../mathCalculator";

export default mathCalculator(({ torqueNm = 15, rpm = 3000 }) => {
  const hp = ((torqueNm / 1.3558179) * rpm) / 5252;
  return {
    horsepower: parseFloat(hp.toFixed(2)),
    kilowatts: parseFloat((hp * 0.745699872).toFixed(2))
  };
});
