/**
 * AXIS SERVO MOTOR SELECTION — ENGINEERING PROCEDURE
 * ---------------------------------------------------------------------------
 * Complete 5-Step Engineering Sizing Procedure for CNC Machine Linear Axes:
 *   • Governing Principle: I = m · k²
 *   • Step 1: Define Target Motion (Rapid speed, Lead, Gear ratio, Motor RPM)
 *   • Step 2: Calculate Load Inertia (Rotating Jr, Sliding Js, Reflected JL, Rotor JM, Jtotal)
 *   • Step 3: Check Inertia Ratio (JL / JM: < 2 Die & Mould, 3–5 General CNC)
 *   • Step 4: Solve Angular (θ) and Linear Acceleration (a, G-rating, Ramp time)
 *   • Step 5: Iteration Levers Workbench (Diameter D⁴, Lead L², Gearing 1/z², Table Mass W)
 *   • Worked Reference Check verification from engineering document
 */
import { useEffect, useMemo, useState } from "react";
import {
  Gauge,
  Zap,
  RotateCcw,
  Copy,
  Check,
  BookOpen,
  AlertCircle,
  Award,
  Sliders,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Compass,
  CheckCircle2,
  Settings2,
  Info
} from "lucide-react";
import { Calculator } from "../../data/db";
import Equation from "../../components/Equation";
import EquationPanel from "../../components/EquationPanel";
import { Card, Badge } from "../../components/ui/Primitives";
import { fmt } from "../equations";

/* ---------------------------------------------------------------- Presets */

interface Preset {
  id: string;
  name: string;
  badge: string;
  description: string;
  params: {
    rapidSpeed: number; // m/min
    screwDiameter: number; // mm
    screwLead: number; // mm
    screwLength: number; // mm
    tableMass: number; // kg
    gearRatio: number; // z = motor / screw
    motorInertia: number; // kg·m²
    accelTorque: number; // N·m
    couplingInertia: number; // kg·m²
    jrOverride?: number; // optional direct Jr (kg·m²)
  };
}

const PRESETS: Preset[] = [
  {
    id: "reference-check",
    name: "Worked Check (Reference Document)",
    badge: "Reference Standard",
    description: "X-axis, ball screw Ø36 × 20 lead × 935 mm, 550 kg table, direct drive",
    params: {
      rapidSpeed: 30.0,
      screwDiameter: 36.0,
      screwLead: 20.0,
      screwLength: 935.0,
      tableMass: 550.0,
      gearRatio: 1.0,
      motorInertia: 0.00228,
      accelTorque: 19.0,
      couplingInertia: 0.0002307,
      jrOverride: 0.001441
    }
  },
  {
    id: "die-mould",
    name: "Die & Mould High-Precision Axis",
    badge: "Ratio < 2 (Target)",
    description: "Z-axis, ball screw Ø32 × 10 lead × 650 mm, 220 kg head, tight contouring",
    params: {
      rapidSpeed: 24.0,
      screwDiameter: 32.0,
      screwLead: 10.0,
      screwLength: 650.0,
      tableMass: 220.0,
      gearRatio: 1.0,
      motorInertia: 0.0028,
      accelTorque: 22.0,
      couplingInertia: 0.00018
    }
  },
  {
    id: "geared-gantry",
    name: "Heavy Gantry Axis with 2:1 Reducer",
    badge: "Geared (1/z² Lever)",
    description: "Y-axis portal, Ø50 × 20 lead × 1800 mm, 1200 kg carriage, 2:1 belt stage",
    params: {
      rapidSpeed: 24.0,
      screwDiameter: 50.0,
      screwLead: 20.0,
      screwLength: 1800.0,
      tableMass: 1200.0,
      gearRatio: 2.0,
      motorInertia: 0.0045,
      accelTorque: 36.0,
      couplingInertia: 0.00035
    }
  },
  {
    id: "high-speed-center",
    name: "High-Speed Machining Center (1.0G+)",
    badge: "Snappy 1.0G Rapid",
    description: "X-axis high-acceleration, Ø32 × 25 lead × 850 mm, 320 kg table",
    params: {
      rapidSpeed: 48.0,
      screwDiameter: 32.0,
      screwLead: 25.0,
      screwLength: 850.0,
      tableMass: 320.0,
      gearRatio: 1.0,
      motorInertia: 0.0024,
      accelTorque: 32.0,
      couplingInertia: 0.00019
    }
  }
];

/* ----------------------------------------------------------- Component */

export default function AxisServoMotorSelectionCalculator({
  calculator
}: {
  calculator: Calculator;
}) {
  // Primary operational tuning inputs
  const [rapidSpeed, setRapidSpeed] = useState<number>(30.0); // m/min
  const [screwDiameter, setScrewDiameter] = useState<number>(36.0); // mm
  const [screwLead, setScrewLead] = useState<number>(20.0); // mm
  const [screwLength, setScrewLength] = useState<number>(935.0); // mm
  const [tableMass, setTableMass] = useState<number>(550.0); // kg
  const [gearRatio, setGearRatio] = useState<number>(1.0); // z (motor revs / screw revs)
  const [motorInertia, setMotorInertia] = useState<number>(0.00228); // kg·m²
  const [accelTorque, setAccelTorque] = useState<number>(19.0); // N·m
  const [couplingInertia, setCouplingInertia] = useState<number>(0.0002307); // kg·m²

  // Jr calculation mode: "geometric" (from D, L) or "direct" (custom value)
  const [jrMode, setJrMode] = useState<"geometric" | "direct">("geometric");
  const [directJr, setDirectJr] = useState<number>(0.001441);

  // Active knowledge tab
  const [activeTab, setActiveTab] = useState<"procedure" | "levers" | "worked" | "guidelines">(
    "procedure"
  );
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>("reference-check");

  // Step 5 Lever experimenters
  const [leverD, setLeverD] = useState<number>(32.0);
  const [leverLead, setLeverLead] = useState<number>(16.0);
  const [leverZ, setLeverZ] = useState<number>(1.5);
  const [leverMass, setLeverMass] = useState<number>(450.0);

  // Material density for steel screw: 7850 kg/m³
  const STEEL_DENSITY = 7850;
  const GRAVITY = 9.8; // m/s² (as specified in procedure: 9.8 m/s²)

  /* ------------------------------------------------------------- URL sync */
  useEffect(() => {
    const qIndex = window.location.hash.indexOf("?");
    if (qIndex > -1) {
      const params = new URLSearchParams(window.location.hash.slice(qIndex + 1));
      const getNum = (k: string) => {
        const v = params.get(k);
        return v !== null && !isNaN(parseFloat(v)) ? parseFloat(v) : null;
      };
      const r = getNum("rapidSpeed");
      const d = getNum("screwDiameter");
      const l = getNum("screwLead");
      const len = getNum("screwLength");
      const w = getNum("tableMass");
      const z = getNum("gearRatio");
      const jm = getNum("motorInertia");
      const ta = getNum("accelTorque");
      const jc = getNum("couplingInertia");

      if (r !== null) setRapidSpeed(r);
      if (d !== null) setScrewDiameter(d);
      if (l !== null) setScrewLead(l);
      if (len !== null) setScrewLength(len);
      if (w !== null) setTableMass(w);
      if (z !== null) setGearRatio(z);
      if (jm !== null) setMotorInertia(jm);
      if (ta !== null) setAccelTorque(ta);
      if (jc !== null) setCouplingInertia(jc);
    }
  }, []);

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setRapidSpeed(preset.params.rapidSpeed);
    setScrewDiameter(preset.params.screwDiameter);
    setScrewLead(preset.params.screwLead);
    setScrewLength(preset.params.screwLength);
    setTableMass(preset.params.tableMass);
    setGearRatio(preset.params.gearRatio);
    setMotorInertia(preset.params.motorInertia);
    setAccelTorque(preset.params.accelTorque);
    setCouplingInertia(preset.params.couplingInertia);

    if (preset.params.jrOverride) {
      setDirectJr(preset.params.jrOverride);
      setJrMode("direct");
    } else {
      setJrMode("geometric");
    }

    setLeverD(preset.params.screwDiameter * 0.9);
    setLeverLead(preset.params.screwLead * 0.8);
    setLeverZ(preset.params.gearRatio > 1 ? preset.params.gearRatio : 1.5);
    setLeverMass(preset.params.tableMass * 0.85);
  };

  const handleReset = () => {
    const ref = PRESETS[0];
    applyPreset(ref);
  };

  /* ------------------------------------------------- Physics Calculations */
  const calculations = useMemo(() => {
    // STEP 1 — Target Motion
    const v_mps = rapidSpeed / 60; // m/s
    const lead_m = screwLead / 1000; // m per rev
    const z = Math.max(gearRatio, 0.01);
    const screwRpm = (rapidSpeed * 1000) / (screwLead * 60); // RPM
    const motorRpm = screwRpm * z; // RPM
    const omega = (2 * Math.PI * motorRpm) / 60; // rad/s

    // STEP 2 — Load Inertia
    // 2a. Rotating mass inertia Jr
    const d_m = screwDiameter / 1000; // m
    const l_m = screwLength / 1000; // m
    const j_screw_geo = (Math.PI * STEEL_DENSITY / 32) * Math.pow(d_m, 4) * l_m; // kg·m²
    const j_r = jrMode === "direct" ? directJr : j_screw_geo + couplingInertia;

    // 2b. Sliding mass inertia Js
    // Js = W * [L / (2π)]²
    const j_s = tableMass * Math.pow(lead_m / (2 * Math.PI), 2); // kg·m²

    // 2c. Reflected load inertia JL
    // JL = (Jr + Js) / z²
    const j_load_unreflected = j_r + j_s;
    const j_l = j_load_unreflected / (z * z);

    // 2d. Total system inertia Jtotal
    const j_m = Math.max(motorInertia, 0.000001);
    const j_total = j_l + j_m;

    // STEP 3 — Inertia Ratio Check
    const ratio = j_l / j_m;

    // Classification band
    let ratioBand: "die-mould" | "general" | "marginal" | "undersized";
    let ratioLabel: string;
    let ratioTone: "emerald" | "olive" | "amber" | "rose";

    if (ratio < 2.0) {
      ratioBand = "die-mould";
      ratioLabel = "Die & Mould (< 2.0) — High Precision";
      ratioTone = "emerald";
    } else if (ratio <= 5.0) {
      ratioBand = "general";
      ratioLabel = "General Application (3.0 – 5.0) — Compliant";
      ratioTone = "olive";
    } else if (ratio <= 10.0) {
      ratioBand = "marginal";
      ratioLabel = "Marginal Ratio (5.0 – 10.0) — High Inertia Mismatch";
      ratioTone = "amber";
    } else {
      ratioBand = "undersized";
      ratioLabel = "Undersized Motor (> 10.0) — Severe Control Lag";
      ratioTone = "rose";
    }

    // STEP 4 — Accelerations
    // 4a. Angular acceleration θ = Tacc / Jtotal
    const t_acc = Math.max(accelTorque, 0.1);
    const theta = t_acc / j_total; // rad/s²

    // 4b. Linear acceleration a = θ * L / (2π * z)
    const a = (theta * lead_m) / (2 * Math.PI * z); // m/s²
    const gRating = a / GRAVITY; // G

    // Ramp time and distance
    const accelTime = a > 0 ? v_mps / a : 0; // seconds
    const accelDist = 0.5 * a * Math.pow(accelTime, 2) * 1000; // mm

    // Proportions for visual distribution bar
    const jr_reflected = j_r / (z * z);
    const js_reflected = j_s / (z * z);
    const pct_screw = Math.min(100, Math.max(0, (jr_reflected / j_total) * 100));
    const pct_table = Math.min(100, Math.max(0, (js_reflected / j_total) * 100));
    const pct_motor = Math.min(100, Math.max(0, (j_m / j_total) * 100));

    return {
      v_mps,
      lead_m,
      z,
      screwRpm,
      motorRpm,
      omega,
      d_m,
      l_m,
      j_screw_geo,
      j_r,
      j_s,
      j_load_unreflected,
      j_l,
      j_m,
      j_total,
      ratio,
      ratioBand,
      ratioLabel,
      ratioTone,
      t_acc,
      theta,
      a,
      gRating,
      accelTime,
      accelDist,
      jr_reflected,
      js_reflected,
      pct_screw,
      pct_table,
      pct_motor
    };
  }, [
    rapidSpeed,
    screwDiameter,
    screwLead,
    screwLength,
    tableMass,
    gearRatio,
    motorInertia,
    accelTorque,
    couplingInertia,
    jrMode,
    directJr
  ]);

  // Dynamic calculations for Step 5 What-If Lever simulation
  const leverSim = useMemo(() => {
    // Lever 1: Diameter change
    const d1_m = leverD / 1000;
    const l1_m = screwLength / 1000;
    const j_screw_1 = (Math.PI * STEEL_DENSITY / 32) * Math.pow(d1_m, 4) * l1_m;
    const jr_1 = j_screw_1 + couplingInertia;
    const jl_1 = (jr_1 + calculations.j_s) / (calculations.z * calculations.z);
    const ratio_1 = jl_1 / calculations.j_m;
    const a_1 = ((accelTorque / (jl_1 + calculations.j_m)) * calculations.lead_m) / (2 * Math.PI * calculations.z);

    // Lever 2: Lead change
    const lead2_m = leverLead / 1000;
    const js_2 = tableMass * Math.pow(lead2_m / (2 * Math.PI), 2);
    const jl_2 = (calculations.j_r + js_2) / (calculations.z * calculations.z);
    const ratio_2 = jl_2 / calculations.j_m;
    const a_2 = ((accelTorque / (jl_2 + calculations.j_m)) * lead2_m) / (2 * Math.PI * calculations.z);
    const motorRpm_2 = ((rapidSpeed * 1000) / (leverLead * 60)) * calculations.z;

    // Lever 3: Gear ratio change
    const z3 = Math.max(leverZ, 0.01);
    const jl_3 = calculations.j_load_unreflected / (z3 * z3);
    const ratio_3 = jl_3 / calculations.j_m;
    const a_3 = ((accelTorque / (jl_3 + calculations.j_m)) * calculations.lead_m) / (2 * Math.PI * z3);
    const motorRpm_3 = calculations.screwRpm * z3;

    // Lever 4: Table mass change
    const js_4 = leverMass * Math.pow(calculations.lead_m / (2 * Math.PI), 2);
    const jl_4 = (calculations.j_r + js_4) / (calculations.z * calculations.z);
    const ratio_4 = jl_4 / calculations.j_m;
    const a_4 = ((accelTorque / (jl_4 + calculations.j_m)) * calculations.lead_m) / (2 * Math.PI * calculations.z);

    return {
      d: { jr: jr_1, jl: jl_1, ratio: ratio_1, a: a_1, g: a_1 / GRAVITY },
      lead: { js: js_2, jl: jl_2, ratio: ratio_2, a: a_2, g: a_2 / GRAVITY, rpm: motorRpm_2 },
      z: { jl: jl_3, ratio: ratio_3, a: a_3, g: a_3 / GRAVITY, rpm: motorRpm_3 },
      mass: { js: js_4, jl: jl_4, ratio: ratio_4, a: a_4, g: a_4 / GRAVITY }
    };
  }, [
    leverD,
    leverLead,
    leverZ,
    leverMass,
    screwLength,
    couplingInertia,
    tableMass,
    accelTorque,
    rapidSpeed,
    calculations
  ]);

  const handleCopySummary = () => {
    const text = `=====================================================
PKlab AXIS SERVO MOTOR SELECTION REPORT
Governing Law: I = m · k²
=====================================================
Target Motion:
• Rapid Traverse Rate: ${rapidSpeed} m/min (${calculations.v_mps.toFixed(3)} m/s)
• Ball Screw Lead: ${screwLead} mm (${calculations.lead_m} m)
• Reduction Ratio (z): ${gearRatio}:1
• Screw Speed: ${calculations.screwRpm.toFixed(0)} RPM | Motor Shaft Speed: ${calculations.motorRpm.toFixed(0)} RPM

Inertia Calculation:
• Rotating Mass Inertia (Jr): ${(calculations.j_r * 1000).toFixed(4)} × 10⁻³ kg·m²
• Sliding Mass Inertia (Js): ${(calculations.j_s * 1000).toFixed(4)} × 10⁻³ kg·m²
• Reflected Load Inertia (JL): ${(calculations.j_l * 1000).toFixed(4)} × 10⁻³ kg·m²
• Motor Rotor Inertia (JM): ${(calculations.j_m * 1000).toFixed(4)} × 10⁻³ kg·m²
• Total System Inertia (Jtotal): ${(calculations.j_total * 1000).toFixed(4)} × 10⁻³ kg·m²

Inertia Ratio Check:
• JL / JM Ratio: ${calculations.ratio.toFixed(2)} [${calculations.ratioLabel}]

Acceleration Dynamics:
• Motor Accel Torque (Tacc): ${accelTorque} N·m
• Angular Acceleration (θ): ${calculations.theta.toFixed(1)} rad/s²
• Linear Acceleration (a): ${calculations.a.toFixed(2)} m/s² (${calculations.gRating.toFixed(2)} G)
• Acceleration Ramp Time (t_acc): ${(calculations.accelTime * 1000).toFixed(1)} ms
• Acceleration Distance (s_acc): ${calculations.accelDist.toFixed(2)} mm
=====================================================
Generated via PKlab (https://prathvirajkodachadri.github.io/PKlab/#/calculator/servo-sizing)`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    });
  };

  return (
    <div className="space-y-8">
      {/* ------------------------------------------- TOP HERO PRINCIPLE CARD */}
      <div className="rounded-3xl border-2 border-brand-olive/30 bg-radial from-brand-olive/10 via-brand-beige/25 to-brand-ivory p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-brand-olive text-brand-ivory">
                <Compass className="h-3.5 w-3.5" />
                Axis Servo Motor Selection
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-brand-beige-dark/50 text-brand-charcoal">
                5-Step Engineering Procedure
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-charcoal tracking-tight">
              Governing Principle: <span className="text-brand-olive">I = m · k²</span>
            </h2>

            <p className="text-xs sm:text-sm text-brand-charcoal/75 font-light leading-relaxed max-w-3xl">
              <strong>Inertia equals mass times the square of the radius of gyration.</strong> Every
              moving part in the drivetrain contributes to the total inertia the motor has to accelerate.
              Follow the rigorous 5-step loop:{" "}
              <span className="font-medium text-brand-charcoal">
                Target Motion → Load Inertia → Ratio Check → Acceleration Dynamics → Iterate Levers.
              </span>
            </p>
          </div>

          {/* Quick Action Presets */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/50 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-brand-olive" />
              Reference Presets
            </div>
            <div className="grid grid-cols-2 gap-1.5 min-w-[280px]">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p)}
                  className={`px-3 py-2 rounded-xl text-left text-xs font-medium border transition-all cursor-pointer ${
                    activePreset === p.id
                      ? "border-brand-olive bg-brand-olive text-brand-ivory shadow-xs font-semibold"
                      : "border-brand-beige-dark bg-brand-ivory/80 text-brand-charcoal hover:border-brand-olive hover:bg-brand-beige/50"
                  }`}
                >
                  <div className="truncate font-bold">{p.name.split("(")[0]}</div>
                  <div
                    className={`text-[9px] truncate ${
                      activePreset === p.id ? "text-brand-ivory/80" : "text-brand-charcoal/50"
                    }`}
                  >
                    {p.badge}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------- MAIN 2-COLUMN WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================================================= LEFT: 5-STEP INPUTS */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1 */}
          <Card className="p-6 sm:p-7 space-y-5 border-brand-beige-dark">
            <div className="flex items-center justify-between border-b border-brand-beige-dark/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="h-7 w-7 rounded-full bg-brand-olive text-brand-ivory flex items-center justify-center text-xs font-bold font-mono">
                  1
                </span>
                <div>
                  <h3 className="text-base font-bold font-serif text-brand-charcoal">
                    STEP 1 — Define Target Motion
                  </h3>
                  <p className="text-[11px] text-brand-charcoal/55 font-light">
                    Sets linear velocity target and converts to screw & motor shaft rotational speed.
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-brand-beige-dark text-[11px] font-semibold text-brand-charcoal/70 hover:text-brand-olive hover:bg-brand-beige/30 transition-all cursor-pointer"
                title="Reset to Worked Check Standard"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            <div className="space-y-4">
              {/* Rapid Traverse Rate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label className="text-brand-charcoal">Rapid Traverse Rate (V_rapid)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-brand-charcoal/45 font-mono">
                      = {(rapidSpeed / 60).toFixed(2)} m/s
                    </span>
                    <div className="rounded-md border border-brand-beige-dark bg-brand-beige/20 px-2 py-0.5 w-20 text-right">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        step="1"
                        value={rapidSpeed}
                        onChange={(e) => setRapidSpeed(parseFloat(e.target.value) || 0)}
                        className="w-full text-right text-xs font-mono font-bold text-brand-charcoal outline-hidden bg-transparent"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="80"
                    step="1"
                    value={rapidSpeed}
                    onChange={(e) => setRapidSpeed(parseFloat(e.target.value))}
                    className="flex-1 accent-brand-olive cursor-pointer h-1.5 bg-brand-beige rounded-lg"
                  />
                  <span className="text-xs font-mono text-brand-charcoal/60 w-14 text-right">
                    m/min
                  </span>
                </div>
              </div>

              {/* Ball Screw Lead */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label className="text-brand-charcoal">Ball Screw Lead (L)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-brand-charcoal/45 font-mono">
                      = {(screwLead / 1000).toFixed(3)} m/rev
                    </span>
                    <div className="rounded-md border border-brand-beige-dark bg-brand-beige/20 px-2 py-0.5 w-20 text-right">
                      <input
                        type="number"
                        min="2"
                        max="50"
                        step="1"
                        value={screwLead}
                        onChange={(e) => setScrewLead(parseFloat(e.target.value) || 0)}
                        className="w-full text-right text-xs font-mono font-bold text-brand-charcoal outline-hidden bg-transparent"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="1"
                    value={screwLead}
                    onChange={(e) => setScrewLead(parseFloat(e.target.value))}
                    className="flex-1 accent-brand-olive cursor-pointer h-1.5 bg-brand-beige rounded-lg"
                  />
                  <span className="text-xs font-mono text-brand-charcoal/60 w-14 text-right">
                    mm/rev
                  </span>
                </div>
              </div>

              {/* Reduction Ratio z */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label className="text-brand-charcoal">Reduction Ratio (z = Motor : Load)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-brand-charcoal/45 font-mono">
                      {gearRatio === 1 ? "Direct Drive" : `${gearRatio.toFixed(2)}:1 Reducer`}
                    </span>
                    <div className="rounded-md border border-brand-beige-dark bg-brand-beige/20 px-2 py-0.5 w-20 text-right">
                      <input
                        type="number"
                        min="0.2"
                        max="10"
                        step="0.1"
                        value={gearRatio}
                        onChange={(e) => setGearRatio(parseFloat(e.target.value) || 1)}
                        className="w-full text-right text-xs font-mono font-bold text-brand-charcoal outline-hidden bg-transparent"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    value={gearRatio}
                    onChange={(e) => setGearRatio(parseFloat(e.target.value))}
                    className="flex-1 accent-brand-olive cursor-pointer h-1.5 bg-brand-beige rounded-lg"
                  />
                  <span className="text-xs font-mono text-brand-charcoal/60 w-14 text-right">
                    ratio
                  </span>
                </div>
              </div>

              {/* Step 1 Derived Speed Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-brand-beige-dark/40 text-center">
                <div className="bg-brand-beige/25 p-2 rounded-xl border border-brand-beige-dark/50">
                  <p className="text-[10px] uppercase font-bold text-brand-charcoal/50">Screw Speed</p>
                  <p className="text-sm font-mono font-bold text-brand-charcoal">
                    {calculations.screwRpm.toFixed(0)}{" "}
                    <span className="text-[10px] font-sans font-normal text-brand-charcoal/60">
                      RPM
                    </span>
                  </p>
                </div>
                <div className="bg-brand-beige/25 p-2 rounded-xl border border-brand-beige-dark/50">
                  <p className="text-[10px] uppercase font-bold text-brand-charcoal/50">Motor Shaft Speed</p>
                  <p className="text-sm font-mono font-bold text-brand-olive">
                    {calculations.motorRpm.toFixed(0)}{" "}
                    <span className="text-[10px] font-sans font-normal text-brand-charcoal/60">
                      RPM
                    </span>
                  </p>
                </div>
                <div className="bg-brand-beige/25 p-2 rounded-xl border border-brand-beige-dark/50 col-span-2 sm:col-span-1">
                  <p className="text-[10px] uppercase font-bold text-brand-charcoal/50">Angular Velocity (ω)</p>
                  <p className="text-sm font-mono font-bold text-brand-charcoal">
                    {calculations.omega.toFixed(1)}{" "}
                    <span className="text-[10px] font-sans font-normal text-brand-charcoal/60">
                      rad/s
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* STEP 2 */}
          <Card className="p-6 sm:p-7 space-y-6 border-brand-beige-dark">
            <div className="flex items-center justify-between border-b border-brand-beige-dark/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="h-7 w-7 rounded-full bg-brand-olive text-brand-ivory flex items-center justify-center text-xs font-bold font-mono">
                  2
                </span>
                <div>
                  <h3 className="text-base font-bold font-serif text-brand-charcoal">
                    STEP 2 — Calculate Load Inertia (JL & Jtotal)
                  </h3>
                  <p className="text-[11px] text-brand-charcoal/55 font-light">
                    Sum rotating mass (screw + coupling) and sliding carriage mass, reflected by (1/z)².
                  </p>
                </div>
              </div>
            </div>

            {/* 2a. Rotating Mass */}
            <div className="space-y-3.5 bg-brand-beige/20 p-4 rounded-2xl border border-brand-beige-dark/60">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-olive flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  2a. Inertia of Rotating Mass (Jr = Screw + Coupling)
                </span>
                <div className="flex rounded-lg border border-brand-beige-dark bg-brand-ivory p-0.5 text-[10px] font-bold">
                  <button
                    onClick={() => setJrMode("geometric")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      jrMode === "geometric"
                        ? "bg-brand-olive text-brand-ivory"
                        : "text-brand-charcoal/60 hover:text-brand-olive"
                    }`}
                  >
                    Geometric (D, L)
                  </button>
                  <button
                    onClick={() => setJrMode("direct")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      jrMode === "direct"
                        ? "bg-brand-olive text-brand-ivory"
                        : "text-brand-charcoal/60 hover:text-brand-olive"
                    }`}
                  >
                    Direct Catalog Jr
                  </button>
                </div>
              </div>

              {jrMode === "geometric" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Screw Diameter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Screw Diameter (D)</span>
                      <span className="font-mono font-bold">{screwDiameter} mm</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="80"
                      step="1"
                      value={screwDiameter}
                      onChange={(e) => setScrewDiameter(parseFloat(e.target.value))}
                      className="w-full accent-brand-olive h-1.5 bg-brand-beige rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Screw Length */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Screw Length (L_s)</span>
                      <span className="font-mono font-bold">{screwLength} mm</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="3000"
                      step="25"
                      value={screwLength}
                      onChange={(e) => setScrewLength(parseFloat(e.target.value))}
                      className="w-full accent-brand-olive h-1.5 bg-brand-beige rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Coupling Inertia */}
                  <div className="space-y-1 sm:col-span-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Coupling Inertia (JC)</span>
                      <span className="font-mono font-bold">
                        {(couplingInertia * 1000).toFixed(4)} × 10⁻³ kg·m²
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.00005"
                      max="0.002"
                      step="0.00001"
                      value={couplingInertia}
                      onChange={(e) => setCouplingInertia(parseFloat(e.target.value))}
                      className="w-full accent-brand-olive h-1.5 bg-brand-beige rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium">Direct Catalog Jr (Screw + Coupling):</span>
                    <div className="rounded-md border border-brand-beige-dark bg-brand-ivory px-2 py-0.5 w-28 text-right">
                      <input
                        type="number"
                        step="0.00001"
                        value={directJr}
                        onChange={(e) => setDirectJr(parseFloat(e.target.value) || 0)}
                        className="w-full text-right text-xs font-mono font-bold outline-hidden bg-transparent"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-brand-charcoal/50 font-light">
                    Enter combined inertia of ball screw shaft + bearing journals + coupling from
                    manufacturer catalog.
                  </p>
                </div>
              )}

              {/* Jr Subtotal display */}
              <div className="flex items-center justify-between pt-2 border-t border-brand-beige-dark/50 text-xs">
                <span className="text-brand-charcoal/70">
                  Computed Jr ={" "}
                  <code className="font-mono text-[11px]">
                    (πγ/32) D⁴L + JC
                  </code>
                </span>
                <span className="font-mono font-bold text-brand-charcoal">
                  {(calculations.j_r * 1000).toFixed(4)} × 10⁻³ kg·m²
                </span>
              </div>
            </div>

            {/* 2b. Sliding Mass */}
            <div className="space-y-3.5 bg-brand-beige/20 p-4 rounded-2xl border border-brand-beige-dark/60">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-olive flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5" />
                2b. Inertia of Sliding Mass (Js = Table + Workpiece)
              </span>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label className="text-brand-charcoal">Moving Weight / Table Mass (W)</label>
                  <div className="rounded-md border border-brand-beige-dark bg-brand-ivory px-2 py-0.5 w-24 text-right">
                    <input
                      type="number"
                      min="10"
                      max="10000"
                      step="10"
                      value={tableMass}
                      onChange={(e) => setTableMass(parseFloat(e.target.value) || 0)}
                      className="w-full text-right text-xs font-mono font-bold text-brand-charcoal outline-hidden bg-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="10"
                    value={tableMass}
                    onChange={(e) => setTableMass(parseFloat(e.target.value))}
                    className="flex-1 accent-brand-olive cursor-pointer h-1.5 bg-brand-beige rounded-lg"
                  />
                  <span className="text-xs font-mono text-brand-charcoal/60 w-10 text-right">
                    kg
                  </span>
                </div>
              </div>

              {/* Js Subtotal display */}
              <div className="flex items-center justify-between pt-2 border-t border-brand-beige-dark/50 text-xs">
                <span className="text-brand-charcoal/70">
                  Computed Js ={" "}
                  <code className="font-mono text-[11px]">
                    W · [L / 2π]²
                  </code>
                </span>
                <span className="font-mono font-bold text-brand-charcoal">
                  {(calculations.j_s * 1000).toFixed(4)} × 10⁻³ kg·m²
                </span>
              </div>
            </div>

            {/* 2c-2d. Total Reflected & Motor Rotor Inertia */}
            <div className="space-y-3.5 bg-brand-olive/5 p-4 rounded-2xl border border-brand-olive/20">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-olive flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                2c & 2d. Motor Rotor Inertia (JM) & Reflected Drivetrain Jtotal
              </span>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label className="text-brand-charcoal">Motor Rotor Inertia (JM)</label>
                  <div className="rounded-md border border-brand-beige-dark bg-brand-ivory px-2 py-0.5 w-28 text-right">
                    <input
                      type="number"
                      step="0.0001"
                      value={motorInertia}
                      onChange={(e) => setMotorInertia(parseFloat(e.target.value) || 0.0001)}
                      className="w-full text-right text-xs font-mono font-bold text-brand-charcoal outline-hidden bg-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.0005"
                    max="0.015"
                    step="0.0001"
                    value={motorInertia}
                    onChange={(e) => setMotorInertia(parseFloat(e.target.value))}
                    className="flex-1 accent-brand-olive cursor-pointer h-1.5 bg-brand-beige rounded-lg"
                  />
                  <span className="text-xs font-mono text-brand-charcoal/60 w-16 text-right">
                    kg·m²
                  </span>
                </div>
              </div>

              {/* Total Inertia Banner */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-olive/20 text-xs">
                <div className="bg-brand-ivory p-2.5 rounded-xl border border-brand-beige-dark/60">
                  <p className="text-[10px] uppercase font-bold text-brand-charcoal/50">
                    Reflected Load Inertia (JL)
                  </p>
                  <p className="text-sm font-mono font-bold text-brand-charcoal">
                    {(calculations.j_l * 1000).toFixed(3)}{" "}
                    <span className="text-[10px] font-normal text-brand-charcoal/60">
                      ×10⁻³ kg·m²
                    </span>
                  </p>
                  {gearRatio !== 1 && (
                    <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">
                      Shrunk by 1/({gearRatio.toFixed(1)})² ={" "}
                      {(1 / (gearRatio * gearRatio)).toFixed(3)}×
                    </span>
                  )}
                </div>
                <div className="bg-brand-ivory p-2.5 rounded-xl border border-brand-beige-dark/60">
                  <p className="text-[10px] uppercase font-bold text-brand-charcoal/50">
                    Total System Inertia (Jtotal)
                  </p>
                  <p className="text-sm font-mono font-bold text-brand-olive">
                    {(calculations.j_total * 1000).toFixed(3)}{" "}
                    <span className="text-[10px] font-normal text-brand-charcoal/60">
                      ×10⁻³ kg·m²
                    </span>
                  </p>
                  <span className="text-[9px] text-brand-charcoal/50 block mt-0.5">
                    = JL + JM
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* STEP 3 & 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* STEP 3 */}
            <Card className="p-6 space-y-4 border-brand-beige-dark">
              <div className="flex items-center gap-2.5 border-b border-brand-beige-dark/60 pb-3">
                <span className="h-7 w-7 rounded-full bg-brand-olive text-brand-ivory flex items-center justify-center text-xs font-bold font-mono">
                  3
                </span>
                <div>
                  <h3 className="text-sm font-bold font-serif text-brand-charcoal">
                    STEP 3 — Inertia Ratio
                  </h3>
                  <p className="text-[10px] text-brand-charcoal/55 font-light">
                    Ratio = JL / JM benchmark
                  </p>
                </div>
              </div>

              <div className="text-center py-2 space-y-1">
                <div className="text-3xl font-serif font-bold text-brand-charcoal">
                  {calculations.ratio.toFixed(2)}
                  <span className="text-xs font-sans font-medium text-brand-charcoal/50 ml-1">
                    : 1
                  </span>
                </div>
                <Badge tone={calculations.ratioTone}>
                  {calculations.ratioBand === "die-mould" && "Die & Mould (< 2)"}
                  {calculations.ratioBand === "general" && "General CNC (3–5)"}
                  {calculations.ratioBand === "marginal" && "Marginal (5–10)"}
                  {calculations.ratioBand === "undersized" && "Undersized (> 10)"}
                </Badge>
              </div>

              {/* Visual meter */}
              <div className="space-y-1">
                <div className="h-2.5 w-full bg-brand-beige rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 w-[20%]" title="Die & Mould (< 2)" />
                  <div className="bg-brand-olive w-[30%]" title="General (2-5)" />
                  <div className="bg-amber-400 w-[50%]" title="Marginal (5-10)" />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-brand-charcoal/45">
                  <span>0</span>
                  <span>2.0 (Die/Mould)</span>
                  <span>5.0 (General)</span>
                  <span>10+</span>
                </div>
              </div>

              <p className="text-[11px] text-brand-charcoal/70 leading-relaxed font-light">
                {calculations.ratio < 2.0
                  ? "✓ Outstanding dynamic bandwidth. Perfect for high-speed die & mould contouring without overshoot."
                  : calculations.ratio <= 5.0
                  ? "✓ Within general-application range (3–5). Motor maintains solid control authority during rapid transitions."
                  : calculations.ratio <= 10.0
                  ? "⚠ High inertia ratio. May require soft S-curve acceleration filtering or gain scheduling."
                  : "✗ Motor is undersized relative to load. High settling times and contouring error. Use Step 5 levers!"}
              </p>
            </Card>

            {/* STEP 4 */}
            <Card className="p-6 space-y-4 border-brand-beige-dark">
              <div className="flex items-center gap-2.5 border-b border-brand-beige-dark/60 pb-3">
                <span className="h-7 w-7 rounded-full bg-brand-olive text-brand-ivory flex items-center justify-center text-xs font-bold font-mono">
                  4
                </span>
                <div>
                  <h3 className="text-sm font-bold font-serif text-brand-charcoal">
                    STEP 4 — Acceleration
                  </h3>
                  <p className="text-[10px] text-brand-charcoal/55 font-light">
                    θ = Tacc / Jtotal & a = θ·L / 2πz
                  </p>
                </div>
              </div>

              {/* Accel Torque input */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <label>Peak Accel Torque (Tacc)</label>
                  <div className="rounded-md border border-brand-beige-dark bg-brand-beige/20 px-2 py-0.5 w-18 text-right">
                    <input
                      type="number"
                      min="1"
                      max="150"
                      step="0.5"
                      value={accelTorque}
                      onChange={(e) => setAccelTorque(parseFloat(e.target.value) || 1)}
                      className="w-full text-right text-xs font-mono font-bold outline-hidden bg-transparent"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="2"
                  max="60"
                  step="1"
                  value={accelTorque}
                  onChange={(e) => setAccelTorque(parseFloat(e.target.value))}
                  className="w-full accent-brand-olive h-1.5 bg-brand-beige rounded-lg cursor-pointer"
                />
              </div>

              {/* Dynamic results */}
              <div className="space-y-2 pt-1 border-t border-brand-beige-dark/40">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-charcoal/60">Angular Accel (θ):</span>
                  <span className="font-mono font-bold text-brand-charcoal">
                    {calculations.theta.toFixed(1)} rad/s²
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-charcoal/60">Linear Accel (a):</span>
                  <span className="font-mono font-bold text-brand-olive text-sm">
                    {calculations.a.toFixed(2)} m/s² ({calculations.gRating.toFixed(2)} G)
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-charcoal/60">Ramp Time to Rapid:</span>
                  <span className="font-mono font-bold text-brand-charcoal">
                    {(calculations.accelTime * 1000).toFixed(1)} ms
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ================================================= RIGHT: LIVE OUTPUT DASHBOARD */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-brand-beige-dark bg-brand-beige/45 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block text-[10px] font-bold text-brand-olive uppercase tracking-widest bg-brand-ivory border border-brand-beige-dark px-2.5 py-0.5 rounded-full mb-1">
                  Live Solution Summary
                </span>
                <h3 className="text-lg font-bold font-serif text-brand-charcoal">
                  Drivetrain Performance
                </h3>
              </div>
              <button
                onClick={handleCopySummary}
                className="p-2.5 rounded-xl border border-brand-beige-dark bg-brand-ivory hover:bg-brand-olive hover:text-brand-ivory transition-all cursor-pointer shadow-2xs"
                title="Copy Full Engineering Report"
              >
                {copiedSummary ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {/* HERO KPI 1: Inertia Ratio */}
            <div className="rounded-2xl border-2 border-brand-olive/40 bg-brand-ivory p-5 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-charcoal/50 flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-brand-olive" />
                  Inertia Ratio (JL / JM)
                </span>
                <Badge tone={calculations.ratioTone}>
                  {calculations.ratio < 2 ? "High Precision" : calculations.ratio <= 5 ? "General Application" : "Check Levers"}
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-serif font-bold text-brand-charcoal tracking-tight">
                  {calculations.ratio.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-brand-charcoal/50">
                  (JL = {(calculations.j_l * 1000).toFixed(2)} / JM = {(calculations.j_m * 1000).toFixed(2)} mkg·m²)
                </span>
              </div>

              {/* Inertia Distribution Bar */}
              <div className="pt-2 space-y-1">
                <div className="text-[10px] text-brand-charcoal/50 font-bold uppercase flex justify-between">
                  <span>Inertia Share</span>
                  <span>Total: {(calculations.j_total * 1000).toFixed(2)} × 10⁻³ kg·m²</span>
                </div>
                <div className="h-2 w-full bg-brand-beige rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${calculations.pct_screw}%` }}
                    className="bg-brand-olive/80"
                    title={`Screw & Coupling: ${calculations.pct_screw.toFixed(1)}%`}
                  />
                  <div
                    style={{ width: `${calculations.pct_table}%` }}
                    className="bg-amber-600/70"
                    title={`Sliding Table: ${calculations.pct_table.toFixed(1)}%`}
                  />
                  <div
                    style={{ width: `${calculations.pct_motor}%` }}
                    className="bg-emerald-600/70"
                    title={`Motor Rotor: ${calculations.pct_motor.toFixed(1)}%`}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-brand-charcoal/60 pt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-brand-olive/80 rounded-full" />
                    Screw ({calculations.pct_screw.toFixed(0)}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-amber-600/70 rounded-full" />
                    Table ({calculations.pct_table.toFixed(0)}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-emerald-600/70 rounded-full" />
                    Rotor ({calculations.pct_motor.toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* HERO KPI 2: Linear Acceleration */}
            <div className="rounded-2xl border border-brand-beige-dark bg-brand-ivory p-5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-charcoal/50 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-brand-olive" />
                Axis Linear Acceleration (a & G-Rating)
              </span>

              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-serif font-bold text-brand-charcoal">
                  {calculations.a.toFixed(2)}{" "}
                  <span className="text-xs font-sans font-medium text-brand-charcoal/50">m/s²</span>
                </div>
                <div className="text-2xl font-serif font-bold text-brand-olive">
                  {calculations.gRating.toFixed(2)}{" "}
                  <span className="text-xs font-sans font-bold">G</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-beige-dark/50 text-xs">
                <div>
                  <span className="text-brand-charcoal/50 block text-[10px] uppercase font-bold">
                    Ramp Time to Rapid
                  </span>
                  <span className="font-mono font-bold text-brand-charcoal">
                    {(calculations.accelTime * 1000).toFixed(1)} ms
                  </span>
                </div>
                <div>
                  <span className="text-brand-charcoal/50 block text-[10px] uppercase font-bold">
                    Acceleration Stroke
                  </span>
                  <span className="font-mono font-bold text-brand-charcoal">
                    {calculations.accelDist.toFixed(2)} mm
                  </span>
                </div>
              </div>
            </div>

            {/* Complete Engineering Metric List */}
            <div className="rounded-2xl border border-brand-beige-dark bg-brand-ivory p-4 divide-y divide-brand-beige-dark/50 text-xs space-y-0">
              <div className="flex justify-between py-2">
                <span className="text-brand-charcoal/65">Angular Acceleration (θ)</span>
                <span className="font-mono font-bold text-brand-charcoal">
                  {calculations.theta.toFixed(1)} rad/s²
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-brand-charcoal/65">Rotating Mass Inertia (Jr)</span>
                <span className="font-mono font-bold text-brand-charcoal">
                  {(calculations.j_r * 1000).toFixed(4)} × 10⁻³ kg·m²
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-brand-charcoal/65">Sliding Mass Inertia (Js)</span>
                <span className="font-mono font-bold text-brand-charcoal">
                  {(calculations.j_s * 1000).toFixed(4)} × 10⁻³ kg·m²
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-brand-charcoal/65">Reflected Load Inertia (JL)</span>
                <span className="font-mono font-bold text-brand-charcoal">
                  {(calculations.j_l * 1000).toFixed(4)} × 10⁻³ kg·m²
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-brand-charcoal/65">Motor Shaft Speed at Rapid</span>
                <span className="font-mono font-bold text-brand-olive">
                  {calculations.motorRpm.toFixed(0)} RPM
                </span>
              </div>
            </div>

            {/* Worked Check Reference Comparison */}
            <div className="rounded-2xl bg-brand-olive/10 border border-brand-olive/30 p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-brand-olive">
                <CheckCircle2 className="h-4 w-4" />
                <span>Reference Document Worked Check Verification</span>
              </div>
              <p className="text-[11px] text-brand-charcoal/75 leading-relaxed font-light">
                {Math.abs(calculations.ratio - 3.1) < 0.2 &&
                Math.abs(calculations.a - 6.45) < 0.3
                  ? "✓ Current parameters match the reference document check: Ratio 3.1, θ = 2025 rad/s², a = 6.45 m/s² (0.66G)."
                  : "Compare your custom axis results against the reference standard (X-axis Ø36×20 lead, 550kg table, 0.66G) in the knowledge tabs below."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------- STEP 5: OPTIMIZATION LEVERS WORKBENCH */}
      <Card className="p-6 sm:p-8 space-y-6 border-brand-olive/40 bg-brand-ivory">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-beige-dark/60 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-6 w-6 rounded-full bg-brand-olive text-brand-ivory flex items-center justify-center text-xs font-bold font-mono">
                5
              </span>
              <h3 className="text-lg font-serif font-bold text-brand-charcoal">
                STEP 5 — If Acceleration is Insufficient, Iterate (The 4 Levers)
              </h3>
            </div>
            <p className="text-xs text-brand-charcoal/65 font-light">
              Interactive sensitivity simulator: test how modifying diameter, lead, gear reduction,
              or moving mass reshapes the inertia ratio and acceleration.
            </p>
          </div>
          <Badge tone="olive">Impact Ranked 1 → 4</Badge>
        </div>

        {/* 4 Levers Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Lever 1: Diameter */}
          <div className="rounded-2xl border border-brand-beige-dark bg-brand-beige/20 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-olive">
                  Lever 1 (D⁴ Impact)
                </span>
                <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <h4 className="text-xs font-bold text-brand-charcoal">Reduce Screw Diameter</h4>
              <p className="text-[10px] text-brand-charcoal/60 leading-relaxed font-light">
                Lowers rotating Jr since inertia scales with diameter to the fourth power (D⁴).
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-brand-beige-dark/50">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Try D:</span>
                <span className="font-mono text-brand-olive">{leverD} mm</span>
              </div>
              <input
                type="range"
                min="16"
                max="60"
                step="1"
                value={leverD}
                onChange={(e) => setLeverD(parseFloat(e.target.value))}
                className="w-full accent-brand-olive h-1.5 bg-brand-beige rounded-lg cursor-pointer"
              />
              <div className="text-[10px] text-brand-charcoal/70 space-y-0.5 font-mono pt-1">
                <div>New Ratio: <strong>{leverSim.d.ratio.toFixed(2)}</strong></div>
                <div>New Accel: <strong>{leverSim.d.g.toFixed(2)} G</strong></div>
              </div>
              <button
                onClick={() => setScrewDiameter(leverD)}
                className="w-full py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-brand-ivory border border-brand-beige-dark hover:bg-brand-olive hover:text-brand-ivory transition-colors cursor-pointer"
              >
                Apply Diameter
              </button>
            </div>
          </div>

          {/* Lever 2: Lead */}
          <div className="rounded-2xl border border-brand-beige-dark bg-brand-beige/20 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-olive">
                  Lever 2 (L² Impact)
                </span>
                <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <h4 className="text-xs font-bold text-brand-charcoal">Reduce Screw Lead</h4>
              <p className="text-[10px] text-brand-charcoal/60 leading-relaxed font-light">
                Lowers sliding Js (scales with L²), but requires higher motor RPM for rapids.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-brand-beige-dark/50">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Try Lead:</span>
                <span className="font-mono text-brand-olive">{leverLead} mm</span>
              </div>
              <input
                type="range"
                min="5"
                max="32"
                step="1"
                value={leverLead}
                onChange={(e) => setLeverLead(parseFloat(e.target.value))}
                className="w-full accent-brand-olive h-1.5 bg-brand-beige rounded-lg cursor-pointer"
              />
              <div className="text-[10px] text-brand-charcoal/70 space-y-0.5 font-mono pt-1">
                <div>New Ratio: <strong>{leverSim.lead.ratio.toFixed(2)}</strong></div>
                <div>Motor RPM: <strong>{leverSim.lead.rpm.toFixed(0)}</strong></div>
              </div>
              <button
                onClick={() => setScrewLead(leverLead)}
                className="w-full py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-brand-ivory border border-brand-beige-dark hover:bg-brand-olive hover:text-brand-ivory transition-colors cursor-pointer"
              >
                Apply Lead
              </button>
            </div>
          </div>

          {/* Lever 3: Gear Reduction */}
          <div className="rounded-2xl border-2 border-brand-olive/40 bg-brand-olive/5 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-olive">
                  Lever 3 (1/z² Quadratic)
                </span>
                <Sparkles className="h-3.5 w-3.5 text-brand-olive" />
              </div>
              <h4 className="text-xs font-bold text-brand-charcoal">Add Gear / Belt Reducer</h4>
              <p className="text-[10px] text-brand-charcoal/60 leading-relaxed font-light">
                Divides reflected load inertia quadratically by z². The most powerful gantry lever!
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-brand-olive/20">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Try Ratio (z):</span>
                <span className="font-mono text-brand-olive">{leverZ.toFixed(1)}:1</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="4.0"
                step="0.1"
                value={leverZ}
                onChange={(e) => setLeverZ(parseFloat(e.target.value))}
                className="w-full accent-brand-olive h-1.5 bg-brand-beige rounded-lg cursor-pointer"
              />
              <div className="text-[10px] text-brand-charcoal/70 space-y-0.5 font-mono pt-1">
                <div>New Ratio: <strong>{leverSim.z.ratio.toFixed(2)}</strong></div>
                <div>Motor RPM: <strong>{leverSim.z.rpm.toFixed(0)}</strong></div>
              </div>
              <button
                onClick={() => setGearRatio(leverZ)}
                className="w-full py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-brand-olive text-brand-ivory hover:bg-brand-olive-dark transition-colors cursor-pointer"
              >
                Apply Gearing
              </button>
            </div>
          </div>

          {/* Lever 4: Moving Mass */}
          <div className="rounded-2xl border border-brand-beige-dark bg-brand-beige/20 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-olive">
                  Lever 4 (Linear Mass)
                </span>
                <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <h4 className="text-xs font-bold text-brand-charcoal">Reduce Moving Mass (W)</h4>
              <p className="text-[10px] text-brand-charcoal/60 leading-relaxed font-light">
                Lightens table/fixtures linearly. Verify carriage rigidity under cutting loads.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-brand-beige-dark/50">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>Try Mass (W):</span>
                <span className="font-mono text-brand-olive">{leverMass} kg</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="10"
                value={leverMass}
                onChange={(e) => setLeverMass(parseFloat(e.target.value))}
                className="w-full accent-brand-olive h-1.5 bg-brand-beige rounded-lg cursor-pointer"
              />
              <div className="text-[10px] text-brand-charcoal/70 space-y-0.5 font-mono pt-1">
                <div>New Ratio: <strong>{leverSim.mass.ratio.toFixed(2)}</strong></div>
                <div>New Accel: <strong>{leverSim.mass.g.toFixed(2)} G</strong></div>
              </div>
              <button
                onClick={() => setTableMass(leverMass)}
                className="w-full py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-brand-ivory border border-brand-beige-dark hover:bg-brand-olive hover:text-brand-ivory transition-colors cursor-pointer"
              >
                Apply Mass
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* ------------------------------------------- COMPREHENSIVE KNOWLEDGE TABS */}
      <div className="rounded-3xl border border-brand-beige-dark bg-brand-ivory overflow-hidden shadow-sm">
        <div className="flex border-b border-brand-beige-dark bg-brand-beige/30 overflow-x-auto">
          {[
            { id: "procedure", label: "Engineering Procedure & Equations", icon: BookOpen },
            { id: "levers", label: "The 4 Optimization Levers", icon: Sliders },
            { id: "worked", label: "Worked Reference Check", icon: CheckCircle2 },
            { id: "guidelines", label: "Inertia Ratio & Sizing Guidelines", icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-4 px-5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "border-brand-olive text-brand-olive bg-brand-ivory"
                    : "border-transparent text-brand-charcoal/60 hover:text-brand-olive hover:bg-brand-beige/15"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-brand-charcoal text-sm leading-relaxed">
          {/* TAB 1: Procedure & Math */}
          {activeTab === "procedure" && (
            <div className="space-y-8">
              <div className="bg-brand-beige/40 p-5 rounded-2xl border border-brand-beige-dark/50 text-center space-y-2">
                <span className="text-xs uppercase tracking-widest font-bold text-brand-olive">
                  Governing Principle & Mathematical Synthesis
                </span>
                <Equation latex="I = m\,k^{2} \qquad J_{L} = \dfrac{J_r + J_s}{z^{2}} \qquad \theta = \dfrac{T_{acc}}{J_{total}} \qquad a = \dfrac{\theta\,L}{2\pi\,z}" />
              </div>

              {/* Full Step-by-Step Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-brand-charcoal/50 uppercase tracking-widest">
                  Five-Step Motion Engineering Procedure
                </h4>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="p-4 rounded-xl bg-brand-beige/20 border border-brand-beige-dark space-y-1">
                    <strong className="text-brand-olive font-bold">Step 1 — Define Target Motion:</strong>
                    <p className="font-light text-brand-charcoal/80">
                      Specify the rapid traverse rate <Equation latex="V_{rapid}" display={false} /> from the machine
                      specification. This sets the target linear speed the axis must achieve and dictates the required
                      screw speed <Equation latex="N_{screw} = V_{rapid} / L" display={false} /> and motor RPM{" "}
                      <Equation latex="N_{motor} = N_{screw} \times z" display={false} />.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-brand-beige/20 border border-brand-beige-dark space-y-2">
                    <strong className="text-brand-olive font-bold">Step 2 — Calculate Load Inertia:</strong>
                    <div className="space-y-2 pl-2">
                      <p className="font-light text-brand-charcoal/80">
                        <strong>2a. Inertia of rotating mass:</strong> For solid cylindrical ball screws,{" "}
                        <Equation latex="J_r = \dfrac{\pi \gamma}{32} D^{4} L + J_C" display={false} />. For stepped shafts:{" "}
                        <Equation latex="J_r = \sum \left[ \dfrac{\pi \gamma}{32}(D_{out}^{4} - D_{in}^{4})L_i \right]" display={false} />.
                      </p>
                      <p className="font-light text-brand-charcoal/80">
                        <strong>2b. Inertia of sliding mass:</strong> Table, workpiece and fixtures translated into rotary equivalent:{" "}
                        <Equation latex="J_s = W \left[ \dfrac{L}{2\pi} \right]^{2}" display={false} />.
                      </p>
                      <p className="font-light text-brand-charcoal/80">
                        <strong>2c. Total reflected load inertia:</strong> When geared through ratio <Equation latex="z" display={false} />:{" "}
                        <Equation latex="J_L = \dfrac{J_r + J_s}{z^{2}}" display={false} />.
                      </p>
                      <p className="font-light text-brand-charcoal/80">
                        <strong>2d. Total system inertia:</strong>{" "}
                        <Equation latex="J_{total} = J_L + J_M" display={false} /> (sum with motor rotor inertia).
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-brand-beige/20 border border-brand-beige-dark space-y-1">
                    <strong className="text-brand-olive font-bold">Step 3 — Check the Inertia Ratio:</strong>
                    <p className="font-light text-brand-charcoal/80">
                      Compare <Equation latex="J_L / J_M" display={false} /> against guideline bands:{" "}
                      <strong>&lt; 2 for Die & Mould</strong> (high precision contouring), and{" "}
                      <strong>3–5 for General CNC Machinery</strong>. Ratios &gt; 10 cause control hunting and oscillation.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-brand-beige/20 border border-brand-beige-dark space-y-1">
                    <strong className="text-brand-olive font-bold">Step 4 — Solve for Dynamic Acceleration:</strong>
                    <p className="font-light text-brand-charcoal/80">
                      Solve angular acceleration <Equation latex="\theta = T_{acc} / J_{total}\;(\text{rad/s}^{2})" display={false} />,
                      and linear acceleration <Equation latex="a = \theta \cdot L / (2\pi z)\;(\text{m/s}^{2})" display={false} />. Express
                      as G-rating <Equation latex="G = a / 9.8" display={false} />.
                    </p>
                  </div>
                </div>
              </div>

              {/* Textbook Step-by-step substitution */}
              <div className="border-t border-brand-beige-dark/50 pt-6">
                <EquationPanel
                  calculator={calculator}
                  mode="worked"
                  inputs={{
                    rapidSpeed,
                    screwDiameter,
                    screwLead,
                    screwLength,
                    tableMass,
                    gearRatio,
                    motorInertia,
                    accelTorque,
                    couplingInertia
                  }}
                  outputs={{
                    inertiaRatio: calculations.ratio,
                    linearAcceleration: calculations.a,
                    gRating: calculations.gRating,
                    angularAcceleration: calculations.theta,
                    totalInertia: calculations.j_total,
                    loadInertia: calculations.j_l,
                    rotatingInertia: calculations.j_r,
                    slidingInertia: calculations.j_s,
                    motorRpm: calculations.motorRpm,
                    accelTime: calculations.accelTime
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: The 4 Levers */}
          {activeTab === "levers" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-brand-olive font-serif text-base font-bold">
                <Sliders className="h-5 w-5" />
                Four Levers in Order of Typical Engineering Impact
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-brand-beige-dark bg-brand-beige/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-brand-charcoal text-sm">1. Reduce Ball Screw Diameter</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-olive text-brand-ivory">
                      D⁴ Impact
                    </span>
                  </div>
                  <p className="text-xs text-brand-charcoal/80 font-light leading-relaxed">
                    Lowers rotating inertia <Equation latex="J_r" display={false} /> dramatically because inertia scales with the fourth
                    power of diameter (<Equation latex="D^{4}" display={false} />). For example, dropping from Ø40mm to Ø32mm cuts screw
                    inertia by nearly <strong>60%</strong>.
                  </p>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-300">
                    <strong>Design Check:</strong> Verify nut rigidity, critical whirling speed (<Equation latex="N_{cr}" display={false} />),
                    and column buckling load (<Equation latex="P_{cr}" display={false} />) are not violated.
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-brand-beige-dark bg-brand-beige/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-brand-charcoal text-sm">2. Reduce the Screw Lead (L)</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-olive text-brand-ivory">
                      L² Impact
                    </span>
                  </div>
                  <p className="text-xs text-brand-charcoal/80 font-light leading-relaxed">
                    Lowers sliding inertia <Equation latex="J_s" display={false} /> quadratically (<Equation latex="L^{2}" display={false} />).
                    Halving lead from 20 mm to 10 mm shrinks table reflected inertia by <strong>75%</strong>.
                  </p>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-300">
                    <strong>Tradeoff:</strong> Reduces linear speed per motor revolution; the motor must spin faster to maintain the rapid
                    traverse rate (throughput vs RPM ceiling).
                  </div>
                </div>

                <div className="p-5 rounded-2xl border-2 border-brand-olive/40 bg-brand-olive/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-brand-olive text-sm">3. Add a Reduction Gear/Belt (z)</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-olive text-brand-ivory">
                      1/z² Reflected
                    </span>
                  </div>
                  <p className="text-xs text-brand-charcoal/80 font-light leading-relaxed">
                    Divides total downstream load inertia by the gear ratio squared (<Equation latex="J_{reflected} = J_{load} / z^{2}" display={false} />).
                    A 2:1 reduction cuts apparent load inertia seen by the motor by a factor of <strong>4×</strong>!
                  </p>
                  <div className="p-2.5 rounded-lg bg-brand-olive/10 border border-brand-olive/20 text-[11px] text-brand-olive">
                    <strong>Key Note:</strong> Re-verify that the motor's rated maximum RPM can still achieve the commanded rapid traverse target.
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-brand-beige-dark bg-brand-beige/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-brand-charcoal text-sm">4. Reduce Moving Mass (W)</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-olive text-brand-ivory">
                      Linear Impact
                    </span>
                  </div>
                  <p className="text-xs text-brand-charcoal/80 font-light leading-relaxed">
                    Lightens the carriage, table, or saddle. Inertia <Equation latex="J_s" display={false} /> drops linearly with mass reduction.
                  </p>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-300">
                    <strong>Tradeoff:</strong> Check for structural deflection, resonance, and damping under peak cutting forces.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Worked Reference Check */}
          {activeTab === "worked" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand-olive" />
                  Worked Check from the Reference Document
                </h3>
                <button
                  onClick={() => applyPreset(PRESETS[0])}
                  className="px-3 py-1.5 rounded-xl bg-brand-olive text-brand-ivory text-xs font-semibold hover:bg-brand-olive-dark transition-all cursor-pointer"
                >
                  Load Reference Values Into Form
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-brand-beige/30 border border-brand-beige-dark text-xs space-y-1 font-mono">
                <p className="font-bold text-brand-charcoal font-sans text-sm">Case Specification:</p>
                <p>• Machine: CNC Milling Center X-Axis</p>
                <p>• Ball screw: Ø36 mm diameter × 20 mm lead × 935 mm rotating length</p>
                <p>• Moving mass (W): 550 kg (table + fixture + workpiece)</p>
                <p>• Motor rotor inertia (JM): 0.00228 kg·m²</p>
                <p>• Motor peak acceleration torque (Tacc): 19 N·m</p>
              </div>

              {/* Step by step exact reproduction */}
              <div className="space-y-3 font-mono text-xs sm:text-sm bg-brand-ivory p-5 rounded-2xl border border-brand-beige-dark">
                <div className="p-2.5 rounded-lg bg-brand-beige/20">
                  <strong className="text-brand-charcoal font-sans block text-xs mb-1">Rotating Inertia:</strong>
                  <code>Jr = JB + JC = 1.441 × 10⁻³ kg·m²</code>
                </div>
                <div className="p-2.5 rounded-lg bg-brand-beige/20">
                  <strong className="text-brand-charcoal font-sans block text-xs mb-1">Sliding Inertia:</strong>
                  <code>Js = 550 [0.020 / 2π]² = 5.57 × 10⁻³ ≈ 6 × 10⁻³ kg·m²</code>
                </div>
                <div className="p-2.5 rounded-lg bg-brand-beige/20">
                  <strong className="text-brand-charcoal font-sans block text-xs mb-1">Total Load Inertia:</strong>
                  <code>JL = Js + Jr = 7.1 × 10⁻³ kg·m²</code>
                </div>
                <div className="p-2.5 rounded-lg bg-brand-olive/10 border border-brand-olive/30">
                  <strong className="text-brand-olive font-sans block text-xs mb-1">Inertia Ratio Check:</strong>
                  <code>JL / JM = 7.1 × 10⁻³ / 0.00228 = 3.1 (within general-application range 3–5)</code>
                </div>
                <div className="p-2.5 rounded-lg bg-brand-beige/20">
                  <strong className="text-brand-charcoal font-sans block text-xs mb-1">Angular Acceleration:</strong>
                  <code>θ = 19 / (9.38 × 10⁻³) = 2025 rad/s²</code>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <strong className="text-emerald-800 dark:text-emerald-300 font-sans block text-xs mb-1">
                    Linear Axis Acceleration & G-Rating:
                  </strong>
                  <code>a = 2025 × 0.020 / 2π = 6.45 m/s² = 0.66G (relative to g = 9.8 m/s²)</code>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Sizing Guidelines */}
          {activeTab === "guidelines" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="font-serif text-base font-bold text-brand-charcoal">
                  Inertia Ratio Application Guidelines
                </h4>
                <p className="text-xs text-brand-charcoal/70 font-light">
                  If the inertia ratio is too high, the motor is undersized relative to the load and will struggle
                  to control it precisely during directional reversals and high-speed cornering.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-brand-beige-dark">
                <table className="w-full text-left text-xs divide-y divide-brand-beige-dark/60">
                  <thead>
                    <tr className="bg-brand-olive text-brand-ivory font-bold">
                      <th className="px-4 py-3">Machine Application</th>
                      <th className="px-4 py-3">Acceptable Inertia Ratio (JL / JM)</th>
                      <th className="px-4 py-3">Dynamic Characteristics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-beige-dark/50">
                    <tr className="bg-brand-beige/20">
                      <td className="px-4 py-3 font-bold text-brand-charcoal">Die & Mould (High Precision)</td>
                      <td className="px-4 py-3 font-bold text-emerald-700 dark:text-emerald-400">&lt; 2.0</td>
                      <td className="px-4 py-3 text-brand-charcoal/80">
                        Ultra-tight contouring, sharp 3D corners, minimal quadrant glitches and following errors.
                      </td>
                    </tr>
                    <tr className="bg-brand-ivory">
                      <td className="px-4 py-3 font-bold text-brand-charcoal">General CNC Application</td>
                      <td className="px-4 py-3 font-bold text-brand-olive">3.0 – 5.0</td>
                      <td className="px-4 py-3 text-brand-charcoal/80">
                        Standard vertical machining centers, CNC lathes, and industrial automation slides.
                      </td>
                    </tr>
                    <tr className="bg-brand-beige/20">
                      <td className="px-4 py-3 font-bold text-brand-charcoal">Heavy Portal / Gantry Slides</td>
                      <td className="px-4 py-3 font-bold text-amber-700 dark:text-amber-400">5.0 – 10.0</td>
                      <td className="px-4 py-3 text-brand-charcoal/80">
                        Requires soft jerk-limited S-curve acceleration filtering and active vibration damping.
                      </td>
                    </tr>
                    <tr className="bg-brand-ivory">
                      <td className="px-4 py-3 font-bold text-brand-charcoal">Excessive / Undersized Motor</td>
                      <td className="px-4 py-3 font-bold text-rose-700 dark:text-rose-400">&gt; 10.0</td>
                      <td className="px-4 py-3 text-brand-charcoal/80">
                        Unstable servo loop, hunting, resonance, and motor overheating. Must iterate Step 5!
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Selection Loop Summary */}
              <div className="p-5 rounded-2xl bg-brand-panel text-brand-ivory space-y-2">
                <h4 className="font-serif text-sm font-bold flex items-center gap-2">
                  <Compass className="h-4 w-4 text-brand-ivory" />
                  The Complete Engineering Selection Loop
                </h4>
                <p className="text-xs text-brand-ivory/80 font-mono">
                  inertia (Jr + Js) → ratio check (JL / JM) → acceleration (θ, a, G) → iterate levers if insufficient
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
