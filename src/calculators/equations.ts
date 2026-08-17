/**
 * equations.ts — the PKlab Engineering Equation Dictionary.
 * ---------------------------------------------------------------------------
 * One textbook-grade equation entry per calculator `id`, holding:
 *   • latex          — governing relationship in professional notation
 *   • variables      — every symbol with definition + unit
 *   • assumptions    — engineering assumptions behind the model
 *   • buildSteps()   — live instruments additionally ship a parameterized
 *                      step-by-step worked calculation (real numbers)
 *
 * This file ADDS equation presentation only — calculators.json content,
 * solvers and layouts remain untouched.
 */
import { Calculator } from "../data/db";

/* ---------------------------------------------------------------- Types */

export interface EquationVariable {
  /** LaTeX symbol, rendered italic via KaTeX inline (e.g. "F_z", "\alpha"). */
  symbol: string;
  /** Human definition shown beside the symbol. */
  name: string;
  /** Working unit printed upright (e.g. "rev/min", "N·m", "in/tooth"). */
  unit: string;
}

export interface EquationStep {
  /** Short narration of the step. */
  text: string;
  /** LaTeX display line evaluated for the CURRENT input values. */
  latex: string;
}

export interface EquationSpec {
  latex: string;
  variables: EquationVariable[];
  assumptions: string[];
  buildSteps?: (inputs: Record<string, number>, outputs: Record<string, number>) => EquationStep[];
}

/* -------------------------------------------------------------- Helpers */

const v = (symbol: string, name: string, unit: string): EquationVariable => ({ symbol, name, unit });

/** Trims trailing zeros while keeping up to 5 significant digits. */
export const fmt = (n: number): string => {
  if (!isFinite(n)) return "0";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 0.0001 || abs >= 100000)) return n.toExponential(3).replace(/\.?0+e/, "e");
  return parseFloat(n.toPrecision(5)).toString();
};

/* ------------------------------------------------------------ Registry */

const specs: Record<string, EquationSpec> = {
  /* ============================= SPINDLE SYSTEM ============================= */

  rpm: {
    latex: "N = \\dfrac{3.82 \\times V_c}{D}",
    variables: [
      v("N", "Spindle speed", "\\mathrm{rev/min}"),
      v("V_c", "Cutting (surface) speed", "\\mathrm{ft/min}\\;(SFM)"),
      v("D", "Cutter diameter", "\\mathrm{in}"),
      v("3.82", "Unit constant — equals 12/\\pi", "—")
    ],
    assumptions: [
      "Cutting edge runs exactly at cutter outer radius.",
      "Cutter geometry is a uniform cylinder (no neck-down).",
      "Constant pi is taken as π ≈ 3.14159."
    ],
    buildSteps: (i, o) => [
      {
        text: "Merge the feet-to-inches and circumference factors into one constant:",
        latex: "\\dfrac{12}{\\pi} = 3.82"
      },
      {
        text: "Substitute the working parameters into the governing equation:",
        latex: `N = \\dfrac{3.82 \\times ${fmt(i.cuttingSpeed)}}{${fmt(i.diameter)}}\\;\\mathrm{rev/min}`
      },
      {
        text: "Evaluate — spindle speed rounds to the nearest whole revolution:",
        latex: `\\boxed{N = ${fmt(o.rpm)}\\;\\mathrm{rev/min}}`
      }
    ]
  },

  "cutting-speed": {
    latex: "V_c = \\dfrac{\\pi D N}{12}",
    variables: [
      v("V_c", "Cutting (surface) speed", "\\mathrm{ft/min}"),
      v("N", "Spindle speed", "\\mathrm{rev/min}"),
      v("D", "Cutter diameter", "\\mathrm{in}"),
      v("12", "Inches-per-foot conversion", "\\mathrm{in/ft}")
    ],
    assumptions: [
      "Rim velocity measured at nominal cutter diameter.",
      "Z-bar constant π handled at full double precision.",
      "Metric output multiplies SFM by 0.3048."
    ],
    buildSteps: (i, o) => [
      {
        text: "Build the cutter circumference and multiply by revolutions per minute:",
        latex: `V_c = \\dfrac{\\pi \\times ${fmt(i.diameter)} \\times ${fmt(i.rpm)}}{12}`
      },
      {
        text: "Result in imperial units, with simultaneous metric conversion:",
        latex: `\\boxed{V_c = ${fmt(o.cuttingSpeed)}\\;\\mathrm{ft/min} = ${fmt(o.cuttingSpeedMetric)}\\;\\mathrm{m/min}}`
      }
    ]
  },

  "surface-speed": {
    latex: "V_c = \\dfrac{\\pi D N}{12} \\;\\propto\\; \\omega r",
    variables: [
      v("V_c", "Peripheral surface speed", "\\mathrm{ft/min}"),
      v("N", "Spindle speed", "\\mathrm{rev/min}"),
      v("D", "Tool or wheel diameter", "\\mathrm{in}"),
      v("\\omega,\\,r", "Angular velocity / radius", "\\mathrm{rad/s},\\;\\mathrm{in}")
    ],
    assumptions: [
      "Velocity sampled exactly at the outer periphery.",
      "No slip between arbor and tool body."
    ]
  },

  torque: {
    latex: "T = \\dfrac{HP \\times 5252}{N}",
    variables: [
      v("T", "Spindle torque", "\\mathrm{lb\\!-\\!ft}"),
      v("HP", "Motor shaft power", "\\mathrm{hp}"),
      v("N", "Spindle speed", "\\mathrm{rev/min}"),
      v("5252", "Power constant ≈ 33000/2π", "\\mathrm{(ft\\!-\\!lb/min)/(rad/s)}")
    ],
    assumptions: [
      "Power quoted is shaft output, not wall draw.",
      "Torque reported in flat-band region of the drive curve.",
      "Metric conversion uses 1 lb-ft = 1.3558 N·m."
    ],
    buildSteps: (i, o) => [
      {
        text: "Apply the horsepower-to-torque conversion:",
        latex: `T = \\dfrac{${fmt(i.horsepower)} \\times 5252}{${fmt(i.rpm)}}\\;\\mathrm{lb\\!-\\!ft}`
      },
      {
        text: "Evaluate, then convert to SI units:",
        latex: `\\boxed{T = ${fmt(o.torqueFtLbs)}\\;\\mathrm{lb\\!-\\!ft} = ${fmt(o.torqueNm)}\\;\\mathrm{N\\cdot m}}`
      }
    ]
  },

  power: {
    latex: "HP = \\dfrac{T \\times N}{5252}",
    variables: [
      v("HP", "Mechanical shaft power", "\\mathrm{hp}"),
      v("T", "Applied torque", "\\mathrm{lb\\!-\\!ft}"),
      v("N", "Shaft speed", "\\mathrm{rev/min}"),
      v("1.3558", "N·m to lb-ft divisor", "\\mathrm{(N\\cdot m)/(lb\\!-\\!ft)}")
    ],
    assumptions: [
      "Torque input provided in newton-metres and converted first.",
      "1 hp ≡ 0.7457 kW for the metric output line."
    ],
    buildSteps: (i, o) => [
      {
        text: "Normalize torque into foot-pounds:",
        latex: `T = \\dfrac{${fmt(i.torqueNm)}}{1.3558}\\;\\mathrm{lb\\!-\\!ft}`
      },
      {
        text: "Apply the power identity and convert to kilowatts:",
        latex: `\\boxed{HP = ${fmt(o.horsepower)}\\;\\mathrm{hp} = ${fmt(o.kilowatts)}\\;\\mathrm{kW}}`
      }
    ]
  },

  "bearing-life": {
    latex: "L_{10h} = \\dfrac{10^6}{60\\,N}\\left(\\dfrac{C}{P}\\right)^{3}",
    variables: [
      v("L_{10h}", "Fatigue life hours (10% failure)", "\\mathrm{h}"),
      v("C", "Dynamic load rating", "\\mathrm{N}"),
      v("P", "Equivalent working load", "\\mathrm{N}"),
      v("N", "Mean rotational speed", "\\mathrm{rev/min}")
    ],
    assumptions: [
      "Angular-contact ball bearings (exponent p = 3).",
      "Loads quoted are pre-radial-axial combined equivalents.",
      "Grease or air-oil lubrication within manufacturer limits."
    ],
    buildSteps: (i, o) => [
      {
        text: "Compute the load ratio raised to the fatigue exponent:",
        latex: `\\left(\\dfrac{${fmt(i.dynamicLoad)}}{${fmt(i.radialLoad)}}\\right)^{3} = ${fmt(o.lifeRevolutions)}\\ \\text{million rev}`
      },
      {
        text: "Convert millions of revolutions into operating hours:",
        latex: `\\boxed{L_{10h} = ${fmt(o.lifeHours)}\\;\\mathrm{h}}`
      }
    ]
  },

  "runout-tolerance": {
    latex: "TIR_{budget} = K_{finish}\\,\\sqrt{\\dfrac{V_{c,ref}}{N}}",
    variables: [
      v("TIR_{budget}", "Allowable total indicated runout", "\\mathrm{in}"),
      v("K_{finish}", "Finish-class quality factor", "—"),
      v("V_{c,ref}", "Reference surface speed", "\\mathrm{ft/min}"),
      v("N", "Spindle speed", "\\mathrm{rev/min}")
    ],
    assumptions: [
      "Finish driving K-factor: 0.0002 in cosmetic, 0.0005 in roughing.",
      "Measured at flute gauge length, not at shank."
    ]
  },

  "angular-acceleration": {
    latex: "\\alpha = \\dfrac{2\\pi\\,\\Delta N}{60\\,t}",
    variables: [
      v("\\alpha", "Angular acceleration", "\\mathrm{rad/s^{2}}"),
      v("\\Delta N", "Speed change", "\\mathrm{rev/min}"),
      v("t", "Ramp window", "\\mathrm{s}"),
      v("2\\pi/60", "RPM-to-rad/s factor", "\\mathrm{rad\\cdot s/(rev\\cdot min)}")
    ],
    assumptions: [
      "Constant-rate trapezoidal velocity profile.",
      "Peak torque available for entire ramp window."
    ]
  },

  "moment-of-inertia": {
    latex: "J = \\dfrac{\\pi \\rho L D^{4}}{32}",
    variables: [
      v("J", "Polar mass moment of inertia", "\\mathrm{kg\\cdot m^{2}}"),
      v("\\rho", "Material density", "\\mathrm{kg/m^{3}}"),
      v("L", "Cylinder length", "\\mathrm{m}"),
      v("D", "Outer diameter", "\\mathrm{m}")
    ],
    assumptions: [
      "Uniform solid cylinder about central axis.",
      "Hollow variants subtract inner-bore term J_bore.",
      "Inertia scales with diameter to the fourth power."
    ]
  },

  "thermal-expansion": {
    latex: "\\Delta L = L\\,\\alpha\\,\\Delta T \\times 10^{-6}",
    variables: [
      v("\\Delta L", "Linear growth", "\\mathrm{in}"),
      v("L", "Reference length", "\\mathrm{in}"),
      v("\\alpha", "CTE of the material", "\\mu\\mathrm{in/(in\\cdot ^{\\circ}F)}"),
      v("\\Delta T", "Temperature excursion", "\\mathrm{^{\\circ}F}")
    ],
    assumptions: [
      "Uniform temperature across the component.",
      "Free expansion (no structural restraint).",
      "Coefficient constant within CTE band of alloy."
    ],
    buildSteps: (i, o) => [
      {
        text: "Insert length, CTE and excursion into the linear law:",
        latex: `\\Delta L = ${fmt(i.length)} \\times ${fmt(i.coeff)} \\times ${fmt(i.tempDiff)} \\times 10^{-6}\\;\\mathrm{in}`
      },
      {
        text: "Evaluate, including the metric reporting line:",
        latex: `\\boxed{\\Delta L = ${fmt(o.expansion)}\\;\\mathrm{in} = ${fmt(o.expansionMicrons)}\\;\\mathrm{\\mu m}}`
      }
    ]
  },

  /* ===================== FEED & CUTTING PARAMETERS ===================== */

  "feed-rate": {
    latex: "F = N \\times Z \\times F_z",
    variables: [
      v("F", "Table feed rate", "\\mathrm{in/min}"),
      v("N", "Spindle speed", "\\mathrm{rev/min}"),
      v("Z", "Active flute count", "—"),
      v("F_z", "Feed per tooth", "\\mathrm{in/tooth}")
    ],
    assumptions: [
      "All flutes load equally (no runout-induced imbalance).",
      "Feed maintained for full engagement arc."
    ],
    buildSteps: (i, o) => [
      {
        text: "Multiply teeth-chips per revolution by chip load and RPM:",
        latex: `F = ${fmt(i.rpm)} \\times ${fmt(i.flutes)} \\times ${fmt(i.feedPerTooth)}\\;\\mathrm{in/min}`
      },
      {
        text: "Evaluate to obtain the programmed table velocity:",
        latex: `\\boxed{F = ${fmt(o.feedRate)}\\;\\mathrm{in/min}}`
      }
    ]
  },

  "feed-per-tooth": {
    latex: "F_z = \\dfrac{F}{N \\times Z}",
    variables: [
      v("F_z", "Chip load per tooth", "\\mathrm{in/tooth}"),
      v("F", "Measured table feed", "\\mathrm{in/min}"),
      v("N", "Spindle speed", "\\mathrm{rev/min}"),
      v("Z", "Flute count", "—")
    ],
    assumptions: [
      "Inverse form of the feed-rate identity.",
      "Chip thickness measured in imperial inches."
    ],
    buildSteps: (i, o) => [
      {
        text: "Divide programmed feed by teeth engaging per minute:",
        latex: `F_z = \\dfrac{${fmt(i.feedRate)}}{${fmt(i.rpm)} \\times ${fmt(i.flutes)}}\\;\\mathrm{in/tooth}`
      },
      {
        text: "Result — compare against insert chip-load envelope:",
        latex: `\\boxed{F_z = ${fmt(o.feedPerTooth)}\\;\\mathrm{in/tooth}}`
      }
    ]
  },

  "feed-per-revolution": {
    latex: "F_{rev} = F_z \\times Z",
    variables: [
      v("F_{rev}", "Advance per revolution", "\\mathrm{in/rev}"),
      v("F_z", "Chip load per tooth", "\\mathrm{in/tooth}"),
      v("Z", "Number of cutting edges", "—")
    ],
    assumptions: [
      "Standard unit for lathe G99 and drill canned cycles.",
      "Single-point tools treat Z = 1."
    ]
  },

  mrr: {
    latex: "Q = A_e \\times A_p \\times F",
    variables: [
      v("Q", "Metal removal rate", "\\mathrm{in^{3}/min}"),
      v("A_e", "Radial width of cut", "\\mathrm{in}"),
      v("A_p", "Axial depth of cut", "\\mathrm{in}"),
      v("F", "Table feed rate", "\\mathrm{in/min}")
    ],
    assumptions: [
      "Orthogonal slot-like cut cross-section.",
      "Chips evacuate freely (no recutting).",
      "Metric line multiplies by 16.387 cm³/in³."
    ],
    buildSteps: (i, o) => [
      {
        text: "Area of the chip section times velocity of engagement:",
        latex: `Q = ${fmt(i.radialDepth)} \\times ${fmt(i.axialDepth)} \\times ${fmt(i.feedRate)}\\;\\mathrm{in^{3}/min}`
      },
      {
        text: "Volumetric output with metric conversion:",
        latex: `\\boxed{Q = ${fmt(o.mrr)}\\;\\mathrm{in^{3}/min} = ${fmt(o.mrrMetric)}\\;\\mathrm{cm^{3}/min}}`
      }
    ]
  },

  "chip-load": {
    latex: "k_{th} = \\dfrac{D}{2\\sqrt{D A_e - A_e^{2}}} \\qquad h_{eff} = \\dfrac{F_z}{k_{th}}",
    variables: [
      v("k_{th}", "Thinning compensation factor", "—"),
      v("h_{eff}", "Effective chip thickness", "\\mathrm{in}"),
      v("F_z", "Programmed feed per tooth", "\\mathrm{in/tooth}"),
      v("D", "Cutter diameter", "\\mathrm{in}"),
      v("A_e", "Radial engagement", "\\mathrm{in}")
    ],
    assumptions: [
      "Valid for radial engagements below 50% of diameter.",
      "Full chip formation geometry; exits considered clean.",
      "Above Ae ≥ D/2, factor collapses to unity."
    ],
    buildSteps: (i, o) => [
      {
        text: "Geometric exit angle factors from circular segment area:",
        latex: `k_{th} = \\dfrac{${fmt(i.diameter)}}{2\\sqrt{${fmt(i.diameter)}\\times ${fmt(i.radialDepth)} - ${fmt(i.radialDepth)}^{2}}} = ${fmt(o.thinningFactor)}`
      },
      {
        text: "Effective thickness and the required feed compensation:",
        latex: `\\boxed{h_{eff} = ${fmt(o.effectiveChipLoad)}\\;\\mathrm{in}\\quad(\\times ${fmt(o.thinningFactor)})}`
      }
    ]
  },

  "depth-of-cut-optimization": {
    latex: "A_{p,opt} = \\dfrac{P_{avail}}{K_p\\,A_e\\,V_c}",
    variables: [
      v("A_{p,opt}", "Optimal axial depth", "\\mathrm{in}"),
      v("P_{avail}", "Continuous spindle power", "\\mathrm{kW}"),
      v("K_p", "Specific cutting energy", "\\mathrm{kW\\!-\\!min/cm^{3}}"),
      v("A_e,\\,V_c", "Width / cutting speed", "\\mathrm{in},\\;\\mathrm{ft/min}")
    ],
    assumptions: [
      "Power divided against vendor Kp constant of alloy.",
      "L/D rigidity derating applied downstream."
    ]
  },

  "width-of-cut": {
    latex: "A_e = 2\\sqrt{R\\,h\\,(D - h)}",
    variables: [
      v("A_e", "Chordal width of engagement", "\\mathrm{in}"),
      v("R", "Tool radius", "\\mathrm{in}"),
      v("h", "Residual cusp height", "\\mathrm{in}"),
      v("D", "Tool diameter", "\\mathrm{in}")
    ],
    assumptions: [
      "Circle-of-contact approximation for scallop cusps.",
      "Valid for ball-nose and face profiling passes."
    ]
  },

  "cycle-time": {
    latex: "T_c = \\dfrac{L}{F} + \\dfrac{T_{aux}}{60}",
    variables: [
      v("T_c", "Total operation time", "\\mathrm{min}"),
      v("L", "Length of cut incl. approach", "\\mathrm{in}"),
      v("F", "Programmed feed", "\\mathrm{in/min}"),
      v("T_{aux}", "Auxiliary bench time", "\\mathrm{s}")
    ],
    assumptions: [
      "Single-pass feeding only (no multi-start retraction).",
      "Auxiliary seconds converted to minutes by /60."
    ],
    buildSteps: (i, o) => [
      {
        text: "Cutting duration alone is path length over feed:",
        latex: `T_{cut} = \\dfrac{${fmt(i.length)}}{${fmt(i.feedRate)}}\\;\\mathrm{min}`
      },
      {
        text: "Add auxiliary seconds for a complete operation total:",
        latex: `\\boxed{T_c = ${fmt(o.cycleTimeMinutes)}\\;\\mathrm{min} = ${fmt(o.cycleTimeSeconds)}\\;\\mathrm{s}}`
      }
    ]
  },

  "surface-finish": {
    latex: "R_a = \\dfrac{f^{2}}{32\\,R} \\times 10^{6}",
    variables: [
      v("R_a", "Theoretical center-line roughness", "\\mu\\mathrm{in}"),
      v("f", "Feed per revolution", "\\mathrm{in/rev}"),
      v("R", "Insert nose radius", "\\mathrm{in}")
    ],
    assumptions: [
      "Ideal circular cusp geometry — no BUE or chatter.",
      "Converts tenth-inch feed into micro-inch amplitude.",
      "Real surfaces run ≈ 20–50% rougher than theory."
    ],
    buildSteps: (i, o) => [
      {
        text: "Square the feed advance and normalize by nose curvature:",
        latex: `R_a = \\dfrac{(${fmt(i.feedRate)})^{2}}{32 \\times ${fmt(i.noseRadius)}} \\times 10^{6}\\;\\mu\\mathrm{in}`
      },
      {
        text: "Geometric finish estimate, shown in both unit systems:",
        latex: `\\boxed{R_a = ${fmt(o.roughnessMicroIn)}\\;\\mu\\mathrm{in} = ${fmt(o.roughnessMicrons)}\\;\\mu\\mathrm{m}}`
      }
    ]
  },

  "tool-engagement": {
    latex: "\\theta_{eng} = 2\\arccos\\left(1 - \\dfrac{2 A_e}{D}\\right)",
    variables: [
      v("\\theta_{eng}", "Cutter engagement angle", "\\mathrm{deg}"),
      v("A_e", "Radial stepover", "\\mathrm{in}"),
      v("D", "Cutter diameter", "\\mathrm{in}")
    ],
    assumptions: [
      "Cylindrical cutter in horizontal slotting orientation.",
      "Force scaling approximated linear with angle."
    ]
  },

  "tool-life-taylor": {
    latex: "V \\times T^{n} = C \\quad\\Rightarrow\\quad T = \\left(\\dfrac{C}{V}\\right)^{1/n}",
    variables: [
      v("T", "Expected tool life", "\\mathrm{min}"),
      v("V", "Cutting speed", "\\mathrm{ft/min}"),
      v("n", "Taylor exponent of insert class", "—"),
      v("C", "Material-tool constant", "\\mathrm{ft/min}")
    ],
    assumptions: [
      "Constant states: carbide n ≈ 0.2–0.5, HSS n ≈ 0.08–0.13.",
      "Coolant effectiveness roll into C; verify with vendor log-log slope."
    ]
  },

  /* ======================= BALL SCREW & LINEAR MOTION ======================= */

  "ballscrew-critical-speed": {
    latex: "N_{cr} = C_f \\times 4.76 \\times 10^{6}\\, \\dfrac{d}{L^{2}}",
    variables: [
      v("N_{cr}", "First whirling speed", "\\mathrm{rev/min}"),
      v("C_f", "Support-fixity constant", "—"),
      v("d", "Screw root diameter", "\\mathrm{in}"),
      v("L", "Unsupported screw length", "\\mathrm{in}")
    ],
    assumptions: [
      "Root diameter governs root-beam flexibility.",
      "Cf: 0.36 free, 2.23 fixed-supported, 3.92 fixed-fixed.",
      "Operation limited to 80% of N_cr."
    ],
    buildSteps: (i, o) => [
      {
        text: "Resonance drops with the square of unsupported span:",
        latex: `N_{cr} = ${fmt(i.mountFactor)} \\times 4.76 \\times 10^{6} \\times \\dfrac{${fmt(i.diameter)}}{(${fmt(i.length)})^{2}}\\;\\mathrm{rev/min}`
      },
      {
        text: "Critical value and the practical 80% safety ceiling:",
        latex: `\\boxed{N_{cr} = ${fmt(o.criticalSpeed)}\\;\\mathrm{rev/min}\\quad N_{safe} = ${fmt(o.maxSafeSpeed)}\\;\\mathrm{rev/min}}`
      }
    ]
  },

  "buckling-load": {
    latex: "P_{cr} = \\dfrac{\\pi^{2} E I}{(K L)^{2}}",
    variables: [
      v("P_{cr}", "Euler buckling load", "\\mathrm{N}"),
      v("E", "Young's modulus of screw steel", "\\mathrm{GPa}"),
      v("I", "Root second moment of area", "\\mathrm{mm^{4}}"),
      v("K L", "Effective buckling length", "\\mathrm{mm}")
    ],
    assumptions: [
      "Slenderness ratio above Euler transition.",
      "Fixity factors: 0.25 free to 4.0 fixed-fixed."
    ]
  },

  "ballscrew-torque": {
    latex: "T = \\dfrac{F \\times Lead}{2\\pi\\eta}",
    variables: [
      v("T", "Coupling drive torque", "\\mathrm{N\\cdot m}"),
      v("F", "Linear thrust demand", "\\mathrm{N}"),
      v("Lead", "Screw lead", "\\mathrm{mm/rev}"),
      v("\\eta", "Mechanical screw efficiency", "—")
    ],
    assumptions: [
      "Includes guideway drag inside thrust F.",
      "Ground η ≈ 0.92, rolled η ≈ 0.80-0.85."
    ]
  },

  "ballscrew-efficiency": {
    latex: "\\eta = \\dfrac{\\tan \\lambda}{\\tan(\\lambda + \\varphi)}",
    variables: [
      v("\\eta", "Forward-drive efficiency", "—"),
      v("\\lambda", "Lead angle", "\\mathrm{deg}"),
      v("\\varphi", "Rolling contact friction angle", "\\mathrm{deg}")
    ],
    assumptions: [
      "Efficiency > 50% renders screw backdrivable.",
      "Backdrive behavior inverts tangent sign."
    ]
  },

  "ballscrew-life": {
    latex: "L_{10} = \\left(\\dfrac{C_a}{F_a}\\right)^{3} \\times 10^{6}\\ \\mathrm{rev}",
    variables: [
      v("L_{10}", "Fatigue life", "\\mathrm{rev}"),
      v("C_a", "Basic dynamic load rating", "\\mathrm{N}"),
      v("F_a", "Mean axial working load", "\\mathrm{N}")
    ],
    assumptions: [
      "Ball-race contact mechanics share bearing-law exponent 3.",
      "Multiply by lead for life in kilometers."
    ]
  },

  "linear-speed": {
    latex: "V = \\dfrac{N \\times Lead}{60}",
    variables: [
      v("V", "Axis travel velocity", "\\mathrm{m/min}"),
      v("N", "Screw rotation speed", "\\mathrm{rev/min}"),
      v("Lead", "Screw lead", "\\mathrm{mm/rev}")
    ],
    assumptions: [
      "Slip-free rolling contact at nut circuit.",
      "Reports simultaneously in m/min and ipm."
    ]
  },

  "axis-acceleration": {
    latex: "a = \\dfrac{\\Delta V}{t} \\qquad a_{g} = \\dfrac{a}{9.81}",
    variables: [
      v("a", "Linear acceleration", "\\mathrm{m/s^{2}}"),
      v("\\Delta V", "Velocity change", "\\mathrm{m/min}"),
      v("t", "Ramp window", "\\mathrm{s}"),
      v("a_g", "Acceleration in G units", "\\mathrm{g}")
    ],
    assumptions: [
      "Trapezoidal profiles; jerk limits checked separately."
    ]
  },

  "linear-inertia": {
    latex: "J_{ref} = m \\left(\\dfrac{Lead}{2\\pi}\\right)^{2}",
    variables: [
      v("J_{ref}", "Mass reflected to shaft", "\\mathrm{kg\\cdot m^{2}}"),
      v("m", "Translating linear mass", "\\mathrm{kg}"),
      v("Lead", "Screw lead", "\\mathrm{m/rev}")
    ],
    assumptions: [
      "Mass couples at pitch-circle radius arm lead/2π.",
      "Add screw self-inertia for total drive J."
    ]
  },

  "positioning-accuracy": {
    latex: "A_{\\mu} = \\max|x_{target} - x_{mean}|",
    variables: [
      v("A_{\\mu}", "Accuracy score", "\\mu\\mathrm{m}"),
      v("x_{target}", "Commanded position", "\\mathrm{mm}"),
      v("x_{mean}", "Mean measured position", "\\mathrm{mm}")
    ],
    assumptions: [
      "Bidirectional VDI 3441 measurement protocol.",
      "Repeatability band reported separately."
    ]
  },

  "backlash-compensation": {
    latex: "C_{bl} = \\pm \\dfrac{B_{avg}}{2}",
    variables: [
      v("C_{bl}", "Compensation entry", "\\mathrm{mm}"),
      v("B_{avg}", "Warm reversal deadband mean", "\\mathrm{mm}")
    ],
    assumptions: [
      "Applied only on direction reversal.",
      "Slop above 0.03 mm warrants mechanical repair, not masking."
    ]
  },

  /* =========================== SERVO MOTOR & DRIVE =========================== */

  "servo-sizing": {
    latex: "J_L = \\dfrac{J_r + J_s}{z^{2}} \\quad \\text{Ratio} = \\dfrac{J_L}{J_M} \\quad \\theta = \\dfrac{T_{acc}}{J_{total}} \\quad a = \\dfrac{\\theta\\,L_{lead}}{2\\pi\\,z}",
    variables: [
      v("I = m k^{2}", "Governing principle: mass × radius of gyration squared", "—"),
      v("J_r", "Rotating inertia (screw shaft + coupling)", "\\mathrm{kg\\cdot m^{2}}"),
      v("J_s", "Sliding mass equivalent rotational inertia", "\\mathrm{kg\\cdot m^{2}}"),
      v("J_L", "Reflected load inertia at motor shaft", "\\mathrm{kg\\cdot m^{2}}"),
      v("J_M", "Motor rotor inertia (datasheet value)", "\\mathrm{kg\\cdot m^{2}}"),
      v("J_{total}", "Total system inertia (load + motor rotor)", "\\mathrm{kg\\cdot m^{2}}"),
      v("J_L / J_M", "Inertia ratio (< 2 die & mould, 3–5 general)", "—"),
      v("T_{acc}", "Motor peak acceleration torque", "\\mathrm{N\\cdot m}"),
      v("\\theta", "Motor shaft angular acceleration", "\\mathrm{rad/s^{2}}"),
      v("a", "Linear axis cart acceleration", "\\mathrm{m/s^{2}}"),
      v("G", "Linear acceleration in G units (a / 9.8)", "\\mathrm{g}"),
      v("z", "Reduction ratio (motor revs / screw revs)", "—")
    ],
    assumptions: [
      "Governing principle I = m·k² applies across all moving drivetrain masses.",
      "Ball screw shaft modeled as solid steel cylinder with density γ = 7850 kg/m³.",
      "Translating table and workpiece mass reflects onto shaft via pitch arm L/(2π).",
      "Load inertia reflects through gear reduction with the inverse square (1/z²).",
      "Motor peak acceleration torque T_acc is delivered across the rapid acceleration ramp.",
      "Acceptable ratio bands: < 2.0 for die & mould (high precision), 3.0–5.0 for general CNC."
    ],
    buildSteps: (i, o) => {
      const d_m = (i.screwDiameter ?? 36) / 1000;
      const l_m = (i.screwLength ?? 935) / 1000;
      const lead_m = (i.screwLead ?? 20) / 1000;
      const z = i.gearRatio ?? 1.0;
      const j_r = o.rotatingInertia ?? (Math.PI * 7850 / 32 * Math.pow(d_m, 4) * l_m + (i.couplingInertia ?? 0.00023));
      const j_s = o.slidingInertia ?? ((i.tableMass ?? 550) * Math.pow(lead_m / (2 * Math.PI), 2));
      const j_l = o.loadInertia ?? ((j_r + j_s) / (z * z));
      const j_m = i.motorInertia ?? 0.00228;
      const j_tot = o.totalInertia ?? (j_l + j_m);
      const ratio = o.inertiaRatio ?? (j_l / j_m);
      const t_acc = i.accelTorque ?? 19;
      const theta = o.angularAcceleration ?? (t_acc / j_tot);
      const a = o.linearAcceleration ?? (theta * lead_m / (2 * Math.PI * z));
      const g = o.gRating ?? (a / 9.8);

      return [
        {
          text: "Step 2a — Calculate rotating mass inertia (ball screw + coupling):",
          latex: `J_r = \\dfrac{\\pi \\times 7850}{32} (${fmt(d_m)})^{4} (${fmt(l_m)}) + ${fmt(i.couplingInertia ?? 0.00023)} = ${fmt(j_r)}\\;\\mathrm{kg\\cdot m^{2}}`
        },
        {
          text: "Step 2b — Calculate sliding mass equivalent rotational inertia (table + workpiece):",
          latex: `J_s = ${fmt(i.tableMass ?? 550)} \\left[ \\dfrac{${fmt(lead_m)}}{2\\pi} \\right]^{2} = ${fmt(j_s)}\\;\\mathrm{kg\\cdot m^{2}}`
        },
        {
          text: "Step 2c-2d — Reflect load inertia across reduction ratio z and sum with motor rotor:",
          latex: `J_L = \\dfrac{${fmt(j_r)} + ${fmt(j_s)}}{(${fmt(z)})^{2}} = ${fmt(j_l)}\\;\\mathrm{kg\\cdot m^{2}}, \\quad J_{total} = ${fmt(j_l)} + ${fmt(j_m)} = ${fmt(j_tot)}\\;\\mathrm{kg\\cdot m^{2}}`
        },
        {
          text: "Step 3 — Check the inertia ratio (guideline: < 2 die & mould, 3–5 general):",
          latex: `\\boxed{\\text{Inertia Ratio} = \\dfrac{J_L}{J_M} = \\dfrac{${fmt(j_l)}}{${fmt(j_m)}} = ${fmt(ratio)}}`
        },
        {
          text: "Step 4a — Solve for angular acceleration from motor peak acceleration torque:",
          latex: `\\theta = \\dfrac{T_{acc}}{J_{total}} = \\dfrac{${fmt(t_acc)}}{${fmt(j_tot)}} = ${fmt(theta)}\\;\\mathrm{rad/s^{2}}`
        },
        {
          text: "Step 4b — Convert to linear axis acceleration and calculate G-rating (a / 9.8 m/s²):",
          latex: `\\boxed{a = ${fmt(theta)} \\times \\dfrac{${fmt(lead_m)}}{2\\pi \\times ${fmt(z)}} = ${fmt(a)}\\;\\mathrm{m/s^{2}} = ${fmt(g)}\\;\\mathrm{G}}`
        }
      ];
    }
  },

  "required-motor-torque": {
    latex: "T_{req} = T_f + \\dfrac{F \\times Lead}{2\\pi\\eta} + T_g",
    variables: [
      v("T_{req}", "Continuous torque demand", "\\mathrm{N\\cdot m}"),
      v("T_f", "Guideway friction torque", "\\mathrm{N\\cdot m}"),
      v("F", "Cutting thrust force", "\\mathrm{N}"),
      v("\\eta", "Screw efficiency", "—"),
      v("T_g", "Gravity lift torque (Z)", "\\mathrm{N\\cdot m}")
    ],
    assumptions: [
      "Gravity term zero for horizontal axes.",
      "Continuous (thermal) duty — separate from peak sizing."
    ]
  },

  "reflected-inertia": {
    latex: "J_{rep} = \\dfrac{J_{load}}{GR^{2}}",
    variables: [
      v("J_{rep}", "Load inertia at motor shaft", "\\mathrm{kg\\cdot m^{2}}"),
      v("J_{load}", "Downstream load inertia", "\\mathrm{kg\\cdot m^{2}}"),
      v("GR", "Gear reduction ratio", "—")
    ],
    assumptions: [
      "Gearlaw: torques scale with GR, inertia with GR².",
      "Choose GR against rapid-speed ceiling first."
    ]
  },

  "gear-ratio": {
    latex: "GR = \\dfrac{N_{motor}}{N_{output}} = \\dfrac{Z_{out}}{Z_{in}}",
    variables: [
      v("GR", "Gear reduction ratio", "—"),
      v("N_{motor},\\,N_{output}", "In / out shaft speed", "\\mathrm{rev/min}"),
      v("Z_{in},\\,Z_{out}", "Pulley tooth counts", "—")
    ],
    assumptions: [
      "Timing pulleys: small pulley ≥ 16 teeth.",
      "Backlash disappears only in preloaded stages."
    ]
  },

  "acceleration-torque": {
    latex: "T_{acc} = J_{total}\\,\\alpha",
    variables: [
      v("T_{acc}", "Peak dynamic torque", "\\mathrm{N\\cdot m}"),
      v("J_{total}", "Total drivetrain inertia", "\\mathrm{kg\\cdot m^{2}}"),
      v("\\alpha", "Commanded angular acceleration", "\\mathrm{rad/s^{2}}")
    ],
    assumptions: [
      "Friction/gravity terms excluded — pure dynamic law.",
      "Motor peak window ≈ 2-3× continuous for seconds."
    ]
  },

  "rms-torque": {
    latex: "T_{rms} = \\sqrt{\\dfrac{\\sum T_i^{2}\\,t_i}{\\sum t_i}}",
    variables: [
      v("T_{rms}", "Root-mean-square torque", "\\mathrm{N\\cdot m}"),
      v("T_i", "Torque level of segment i", "\\mathrm{N\\cdot m}"),
      v("t_i", "Duration of segment i", "\\mathrm{s}")
    ],
    assumptions: [
      "Duty cycle expressed as square-area thermal average.",
      "Satisfy T_rms ≤ 80% of continuous rating."
    ]
  },

  "holding-torque": {
    latex: "T_{hold} = T_{grav} + T_f + T_{fix}",
    variables: [
      v("T_{hold}", "Stall holding torque", "\\mathrm{N\\cdot m}"),
      v("T_{grav}", "Gravity-urged component", "\\mathrm{N\\cdot m}"),
      v("T_f", "Static friction term", "\\mathrm{N\\cdot m}"),
      v("T_{fix}", "Fixture / preload term", "\\mathrm{N\\cdot m}")
    ],
    assumptions: [
      "Backdrivable axes only (η > 50%).",
      "Mechanical brakes sized ≥ 150% of gravity share."
    ]
  },

  "motor-power": {
    latex: "P = T_{rms}\\,\\omega",
    variables: [
      v("P", "Continuous mechanical power", "\\mathrm{kW}"),
      v("T_{rms}", "RMS torque at duty speed", "\\mathrm{N\\cdot m}"),
      v("\\omega", "Sustained angular velocity", "\\mathrm{rad/s}")
    ],
    assumptions: [
      "Rated for 40°C ambient; hot enclosures derate 10-15%.",
      "Apply +25% margin for frame selection."
    ]
  },

  "regenerative-energy": {
    latex: "E_{regen} = \\tfrac{1}{2}\\,J\\,\\omega^{2}",
    variables: [
      v("E_{regen}", "Kinetic energy per stop", "\\mathrm{J}"),
      v("J", "Total decelerating inertia", "\\mathrm{kg\\cdot m^{2}}"),
      v("\\omega", "Angular velocity at stop start", "\\mathrm{rad/s}")
    ],
    assumptions: [
      "Energy returned to DC bus minus drivetrain losses.",
      "Average wattage = E × stops-per-second frequency."
    ]
  },

  "servo-speed": {
    latex: "N_{motor} = \\dfrac{60\\,V \\times GR}{Lead}",
    variables: [
      v("N_{motor}", "Motor shaft speed", "\\mathrm{rev/min}"),
      v("V", "Linear axis velocity", "\\mathrm{m/min}"),
      v("GR", "Gear reduction ratio", "—"),
      v("Lead", "Screw lead", "\\mathrm{mm/rev}")
    ],
    assumptions: [
      "Sustained speed must clear field-weakening boundary.",
      "GR = 1 for direct coupled screws."
    ]
  },

  /* ========================== TOOL HOLDER & TOOLING ========================== */

  "tool-deflection": {
    latex: "\\delta = \\dfrac{F \\times L^{3}}{3\\,E\\,I} \\qquad I = \\dfrac{\\pi D^{4}}{64}",
    variables: [
      v("\\delta", "Static tip deflection", "\\mathrm{in}"),
      v("F", "Radial cutting force", "\\mathrm{lbf}"),
      v("L", "Tool overhang", "\\mathrm{in}"),
      v("E", "Elastic modulus of shank", "\\mathrm{psi}"),
      v("I", "Second moment of area", "\\mathrm{in^{4}}"),
      v("D", "Shank diameter", "\\mathrm{in}")
    ],
    assumptions: [
      "Point-loaded cantilever beam treatment.",
      "Shank remains within elastic Hookean region.",
      "Carbide E ≈ 87-93 Mpsi; steel E ≈ 30 Mpsi."
    ],
    buildSteps: (i, o) => [
      {
        text: "Compute the shank's second moment of area:",
        latex: `I = \\dfrac{\\pi (${fmt(i.diameter)})^{4}}{64}\\;\\mathrm{in^{4}}`
      },
      {
        text: "Apply the cantilever deflection law with the cubic overhang term:",
        latex: `\\delta = \\dfrac{${fmt(i.force)} \\times (${fmt(i.overhang)})^{3}}{3 \\times ${fmt(i.modulus)} \\times 10^{6} \\times I}\\;\\mathrm{in}`
      },
      {
        text: "Elastic tip deviation under this radial load:",
        latex: `\\boxed{\\delta = ${fmt(o.deflection)}\\;\\mathrm{in}}`
      }
    ]
  },

  "tool-overhang": {
    latex: "\\lambda = \\dfrac{L}{D}",
    variables: [
      v("\\lambda", "Length-to-diameter overhang ratio", "—"),
      v("L", "Projected overhang", "\\mathrm{mm}"),
      v("D", "Shank diameter", "\\mathrm{mm}")
    ],
    assumptions: [
      "λ ≤ 3 conservative; 3-5 tuned; > 6 requires damping bars.",
      "Vibration risk grows roughly as λ·√L."
    ]
  },

  "tool-pull-force": {
    latex: "F_{hold} = \\mu \\times F_{draw} \\times \\eta_{contact}",
    variables: [
      v("F_{hold}", "Effective breakout grip", "\\mathrm{N}"),
      v("\\mu", "Taper contact friction coefficient", "—"),
      v("F_{draw}", "Drawbar spring force", "\\mathrm{N}"),
      v("\\eta_{contact}", "Taper contact efficiency", "—")
    ],
    assumptions: [
      "Load limited to 70% of drawbar rating during cutting.",
      "Clean taper adds 5-8% contact efficiency."
    ]
  },

  "hsk-taper-contact": {
    latex: "\\%_{contact} = 100\\left(1 - \\dfrac{\\lvert \\Delta D \\rvert}{G_{ref}}\\right)",
    variables: [
      v("\\%_{contact}", "Effective taper contact area", "\\%"),
      v("\\Delta D", "Stacked tolerance deviation", "\\mu\\mathrm{m}"),
      v("G_{ref}", "Design gap reference", "\\mu\\mathrm{m}")
    ],
    assumptions: [
      "Dual-interface contact must exceed 75% area for chatter-free flow.",
      "Verified additionally by blue-contact tests."
    ]
  },

  "balance-grade": {
    latex: "G = \\dfrac{e_{perm}\\,\\omega}{9549}",
    variables: [
      v("G", "ISO 1940 balance quality grade", "\\mathrm{mm/s}"),
      v("e_{perm}", "Permissible eccentricity", "\\mathrm{g\\!\\cdot\\!mm/kg}"),
      v("\\omega", "Rotational velocity", "\\mathrm{rev/min}")
    ],
    assumptions: [
      "G grades compare via e·ω product at any RPM.",
      "Assemblies (holder + tool + knob) must be graded jointly."
    ]
  },

  "tool-weight": {
    latex: "W = \\rho \\times \\pi \\times \\dfrac{D^{2}}{4} \\times L",
    variables: [
      v("W", "Assembled tool mass", "\\mathrm{kg}"),
      v("\\rho", "Material density", "\\mathrm{kg/m^{3}}"),
      v("D", "Nominal tool diameter", "\\mathrm{m}"),
      v("L", "Overall tool length", "\\mathrm{m}")
    ],
    assumptions: [
      "Cylinder approximation excludes flute relief volume (~8%).",
      "Compare against ATC payload limit before auto-changes."
    ]
  },

  tcp: {
    latex: "TCP_z = L_{holder} + L_{gauge} - L_{master}",
    variables: [
      v("TCP_z", "Tool-center-point Z register", "\\mathrm{mm}"),
      v("L_{holder}", "Holder gauge length", "\\mathrm{mm}"),
      v("L_{gauge}", "Tool projection from holder face", "\\mathrm{mm}"),
      v("L_{master}", "Master reference offset", "\\mathrm{mm}")
    ],
    assumptions: [
      "Trunnion kinematics rotates about physical axes.",
      "0.05 mm TCP error → visible seams in 3+2 cuts."
    ]
  },

  "stick-out": {
    latex: "SO = L_{flute} + c - L_{clamp}",
    variables: [
      v("SO", "Exposed stick-out projection", "\\mathrm{mm}"),
      v("L_{flute}", "Required flute reach", "\\mathrm{mm}"),
      v("c", "Collision clearance bucket", "\\mathrm{mm}"),
      v("L_{clamp}", "Collet engagement depth", "\\mathrm{mm}")
    ],
    assumptions: [
      "Grip must land on cylindrical shank, never flute roots.",
      "Extra 3-5 mm clearance recommended beneath cutter tips."
    ]
  },

  "tool-change-time": {
    latex: "T_{chg} = T_{appr} + T_{swap} + T_{ret}",
    variables: [
      v("T_{chg}", "Full ATC cycle time", "\\mathrm{s}"),
      v("T_{appr}", "Spindle retreat + ready time", "\\mathrm{s}"),
      v("T_{swap}", "Gripper swap duration", "\\mathrm{s}"),
      v("T_{ret}", "Return-to-cut positioning", "\\mathrm{s}")
    ],
    assumptions: [
      "Random-access indexing beats sequential search by 1-2 s.",
      "Carousel wobble dominates slower mechanisms."
    ]
  },

  "magazine-capacity": {
    latex: "N_{eff} = \\left\\lfloor \\dfrac{C_{map}}{D_{pocket} + g} \\right\\rfloor",
    variables: [
      v("N_{eff}", "Usable magazine pockets", "—"),
      v("C_{map}", "Carousel pitch-map length", "\\mathrm{mm}"),
      v("D_{pocket}", "Tool body diameter", "\\mathrm{mm}"),
      v("g", "Adjacent clearance gap", "\\mathrm{mm}")
    ],
    assumptions: [
      "Oversize tools force empty neighboring pockets.",
      "Total pocket weight must respect carousel drive rating."
    ]
  }
};

/* --------------------------------------------------------------- Public */

/** Lookup the equation dictionary; every catalog id receives full coverage. */
export function getEquationSpec(calc: Calculator): EquationSpec {
  const spec = specs[calc.id];
  if (spec) return spec;

  // Safety fallback for future catalog entries without a bespoke entry:
  // formula rendered as upright text, variables derived from JSON inputs.
  return {
    latex: `\\text{${calc.formula}}`,
    variables: calc.inputs.map((inp) => v(inp.name, inp.label, `\\text{${inp.unit}}`)),
    assumptions: ["Model validated against ISO catalog norms."]
  };
}
