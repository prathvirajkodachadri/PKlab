/**
 * Cutter Tool Deflection — instance plugin.
 * Solver: δ = (F × L³) / (3 × E × I), with I = πD⁴/64.
 */
import { mathCalculator } from "../mathCalculator";

export default mathCalculator(({ force = 120, overhang = 1.5, diameter = 0.5, modulus = 87 }) => {
  const e = modulus * 1e6; // Mpsi → psi
  const I = (Math.PI * Math.pow(diameter, 4)) / 64;
  const delta = 3 * e * I > 0 ? (force * Math.pow(overhang, 3)) / (3 * e * I) : 0;
  return { deflection: parseFloat(delta.toFixed(6)) };
});
