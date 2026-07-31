/**
 * CNC Servo Motor Torque Sizing — instance plugin.
 * Solver: T_total = J × α + T_friction.
 */
import { mathCalculator } from "../mathCalculator";

export default mathCalculator(({ inertia = 0.0012, acceleration = 150, friction = 0.45 }) => ({
  totalTorque: parseFloat((inertia * acceleration + friction).toFixed(3))
}));
