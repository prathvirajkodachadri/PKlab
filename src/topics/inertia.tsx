/**
 * INERTIA — Extended engineering educational topic.
 * ---------------------------------------------------------------------------
 * Faithful rendition of the authored engineering document
 * (Inertia — Prathviraj Kodachadri), typeset with the PKlab design system:
 * serif document title, ruled section headings, indented definition/example
 * entries, italic qualitative notes, centered KaTeX equations and the
 * concluding Summary Table. Purely additive — nothing else is modified.
 */
import { ArrowRight } from "lucide-react";
import Equation from "../components/Equation";
import { navigate } from "../router/core";

/* ------------------------------------------------- Document primitives */

/** Ruled serif section heading — matches the document's headline style. */
function DocHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-olive border-b-2 border-brand-olive/50 pb-1.5 pt-6">
      {children}
    </h2>
  );
}

/** Numbered bold sub-entry with indented body, exactly as in the document. */
function DocSubItem({
  number,
  title,
  children,
  level = 2
}: {
  number: string;
  title: string;
  children: React.ReactNode;
  level?: 2 | 3;
}) {
  return (
    <div className="space-y-1.5">
      <h3 className={`font-bold text-brand-charcoal ${level === 2 ? "text-base sm:text-lg" : "text-base"}`}>
        <span className="mr-1.5">{number}</span>{title}
      </h3>
      <div className={`space-y-1.5 ${level === 2 ? "pl-2 sm:pl-4" : "pl-6 sm:pl-8"}`}>
        {children}
      </div>
    </div>
  );
}

/** Bold "Definition:" / "Example:" lines as they appear in the document. */
function DocDef({ label, text }: { label: string; text: string }) {
  return (
    <p className="text-sm sm:text-[15px] text-brand-charcoal/85">
      <strong className="font-bold text-brand-charcoal">{label}:</strong> {text}
    </p>
  );
}

/** Italic qualitative note, indented like the document's grey italic lines. */
function DocNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="pl-2 sm:pl-4 text-xs sm:text-sm italic text-brand-charcoal/55 leading-relaxed">
      {children}
    </p>
  );
}

/** Centered italic variable-definition line printed beneath each equation. */
function DocVars({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center text-xs sm:text-sm italic text-brand-charcoal/70 leading-relaxed">
      {children}
    </p>
  );
}

/** Centered italic free-text note printed beneath equation blocks. */
function DocFootnote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center text-xs sm:text-sm italic text-brand-charcoal/55 leading-relaxed max-w-3xl mx-auto">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ Page */

export default function InertiaTopic() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">

      {/* Breadcrumbs */}
      <nav className="flex items-center flex-wrap gap-y-1" aria-label="Breadcrumb">
        <ol className="flex items-center flex-wrap gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
          <li className="flex items-center gap-1">
            <button onClick={() => navigate("home")} className="hover:text-brand-olive transition-colors cursor-pointer">
              Home
            </button>
          </li>
          <li className="flex items-center gap-1 text-brand-charcoal/30">
            <ArrowRight className="h-3 w-3" />
          </li>
          <li className="flex items-center gap-1">
            <button onClick={() => navigate("topics")} className="hover:text-brand-olive transition-colors cursor-pointer">
              Engineering Topics
            </button>
          </li>
          <li className="flex items-center gap-1 text-brand-charcoal/30">
            <ArrowRight className="h-3 w-3" />
          </li>
          <li className="text-brand-charcoal/80">Inertia</li>
        </ol>
      </nav>

      {/* Document masthead line (as in the uploaded page header) */}
      <div className="border-t border-brand-beige-dark/60 pt-3 text-right">
        <span className="text-xs italic font-serif text-brand-charcoal/50">
          Inertia — Prathviraj Kodachadri
        </span>
      </div>

      {/* ----------------------------------------------- Document page 1 */}

      {/* Title + opening statement */}
      <header className="space-y-4 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-wide text-brand-olive">
          INERTIA
        </h1>
        <p className="font-serif italic text-sm sm:text-base text-brand-charcoal/85 leading-relaxed max-w-3xl mx-auto">
          “Every object continues in its state of rest, or of uniform motion in a straight line, unless it is compelled by an external force.”
          — Newton's First Law of Motion
        </p>
        <p className="text-sm sm:text-base font-bold text-brand-charcoal text-left">
          Inertia means: resistance to change its state.
        </p>
      </header>

      {/* Types of Inertia */}
      <div className="space-y-4">
        <DocHeading>Types of Inertia</DocHeading>

        <DocSubItem number="1." title="Inertia of Rest">
          <DocDef label="Definition" text="Resistance to starting motion" />
          <DocDef label="Example" text="When a stationary bus suddenly starts moving, passengers fall backward" />
          <DocNote>
            (Qualitative — no separate formula; governed by <Equation latex="F = ma" display={false} />)
          </DocNote>
        </DocSubItem>

        <DocSubItem number="2." title="Inertia of Motion">
          <DocDef label="Definition" text="Resistance to stopping or changing motion" />
          <DocDef label="Example" text="When a moving bus suddenly applies the brakes, passengers lurch forward" />
          <DocNote>
            (Qualitative — no separate formula; governed by <Equation latex="F = ma" display={false} />)
          </DocNote>
        </DocSubItem>

        <DocSubItem number="3." title="Inertia of Direction">
          <DocDef label="Definition" text="Resistance to changing direction" />
          <DocDef label="Example" text="When a bus takes a sharp turn, passengers slide to the outer side of the seat" />
          <DocNote>(Qualitative — no separate formula; governed by centripetal force)</DocNote>
        </DocSubItem>
      </div>

      {/* Measure of Inertia */}
      <DocHeading>Measure of Inertia</DocHeading>

      {/* 1. Linear Inertia */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-olive border-b border-brand-olive/40 pb-1.5">
          1. Linear Inertia- Newton's Second Law
        </h2>

        <DocSubItem number="1." title="Linear Inertia" level={3}>
          <DocDef label="Definition" text="Mass is the measure of an object's resistance to a push or pull" />
          <DocDef label="Example" text="A heavier box needs more force to move than a lighter one" />

          <div className="space-y-1 py-1">
            <Equation latex="F = ma" />
            <Equation latex="m = F/a" />
          </div>

          <DocVars>
            <Equation latex="F" display={false} /> = force (N),{" "}
            <Equation latex="m" display={false} /> = mass (kg),{" "}
            <Equation latex="a" display={false} /> = acceleration (m/s²)
          </DocVars>
          <DocFootnote>
            For straight-line motion, inertia is defined simply as Mass (<Equation latex="m" display={false} />).
            There is no radius involved.
          </DocFootnote>
        </DocSubItem>
      </div>

      {/* 2. Rotational Inertia */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-olive border-b border-brand-olive/40 pb-1.5 pt-2">
          2. Rotational Inertia
        </h2>

        <DocSubItem number="1." title="Mass Moment of Inertia" level={3}>
          <DocDef label="Definition" text="Resistance to change in rotational (spinning) motion" />
          <DocDef label="Example" text="A heavy flywheel is hard to start or stop spinning" />

          <div className="space-y-1 py-1">
            <Equation latex="I = mr^{2}" />
            <p className="text-center font-serif italic font-bold text-brand-charcoal/85">
              For Cont. Body
            </p>
            <Equation latex="I = \int r^{2}\, dm" />
          </div>

          <DocVars>
            <Equation latex="I" display={false} /> = mass moment of inertia (kg·m²),{" "}
            <Equation latex="m" display={false} /> = mass (kg),{" "}
            <Equation latex="r" display={false} /> = distance from axis (m)
          </DocVars>

          <p className="text-sm sm:text-[15px] text-brand-charcoal/80 leading-7 font-light pt-2">
            For rotational motion, inertia depends on both the mass and how far that mass is from the axis.
            This is why the Radius of Gyration (<Equation latex="k" display={false} />) is included in the definition.
            Moment of Inertia is the product of mass and square of radius of gyration.
          </p>

          <div className="space-y-1 py-1">
            <Equation latex="I = m\,k^{2}" />
          </div>

          <p className="text-sm sm:text-[15px] text-brand-charcoal/80 leading-7 font-light">
            The radius of gyration is a hypothetical distance. It represents the distance from the axis of rotation
            at which the entire mass of the object could be concentrated to produce the same moment of inertia
            as the actual distribution of mass.
          </p>
        </DocSubItem>
      </div>

      {/* ----------------------------------------------- Document page 2 */}

      {/* 3. Structural Inertia */}
      <div className="space-y-5 border-t border-brand-beige-dark/60 pt-8">
        <DocHeading>3. Structural Inertia</DocHeading>

        <DocSubItem number="1." title="Polar Moment of Inertia" level={3}>
          <DocDef label="Definition" text="Resistance to twisting (torsion)" />
          <DocDef label="Example" text="A thick steel rod resists twisting more than a thin one" />

          <div className="space-y-1 py-1">
            <Equation latex="J = \int r^{2}\, dA" />
            <Equation latex="\text{or}\;\; I_{x} + I_{\gamma}" />
          </div>

          <DocVars>
            <Equation latex="J" display={false} /> = polar moment of inertia (m⁴),{" "}
            <Equation latex="d" display={false} /> = diameter of circular shaft (m)
          </DocVars>
        </DocSubItem>

        <DocSubItem number="2." title="Area Moment of Inertia" level={3}>
          <DocDef label="Definition" text="Resistance to bending" />
          <DocDef label="Example" text="A tall beam resists sagging more than a flat, wide beam of the same material" />

          <div className="space-y-1 py-1">
            <Equation latex="I_{x} = \int y^{2}\, dA," />
            <Equation latex="I_{y} = \int x^{2}\, dA" />
          </div>

          <DocVars>
            <Equation latex="I" display={false} /> = area moment of inertia (m⁴),{" "}
            <Equation latex="b" display={false} /> = width of section (m),{" "}
            <Equation latex="h" display={false} /> = height of section (m)
          </DocVars>
        </DocSubItem>

        <DocSubItem number="3." title="Product Moment of Inertia" level={3}>
          <DocDef label="Definition" text="Tendency to twist while bending (only in unsymmetrical shapes)" />
          <DocDef label="Example" text="An L-shaped bracket twists slightly when you try to bend it straight" />

          <div className="space-y-1 py-1">
            <Equation latex="I_{xy} = \int x\, y\, dA" />
          </div>

          <DocVars>
            <Equation latex="I_{xy}" display={false} /> = product moment of inertia (m⁴),{" "}
            <Equation latex="x,y" display={false} /> = coordinates from centroidal axes (m),{" "}
            <Equation latex="dA" display={false} /> = small area element (m²)
          </DocVars>
        </DocSubItem>
      </div>

      {/* -------------------------------------------------- Summary Table */}
      <div className="space-y-4">
        <DocHeading>Summary Table</DocHeading>

        <div className="overflow-x-auto rounded-2xl border border-brand-beige-dark">
          <table className="w-full text-left text-[11px] sm:text-xs divide-y divide-brand-beige-dark/60 min-w-[760px]">
            <thead>
              <tr className="bg-brand-olive text-brand-ivory font-bold">
                <th className="px-3 py-2.5">Type of Inertia</th>
                <th className="px-3 py-2.5">Definition</th>
                <th className="px-3 py-2.5">Example</th>
                <th className="px-3 py-2.5">Formula</th>
                <th className="px-3 py-2.5">Unit</th>
                <th className="px-3 py-2.5">Terms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-beige-dark/50">
              {[
                {
                  type: "Linear Inertia (Newton's 2nd Law)",
                  def: "Mass = measure of resistance to a push/pull",
                  example: "Heavier box needs more force to move",
                  formula: <>F = ma<br />m = F/A</>,
                  unit: "N or Kg",
                  terms: "F=force(N), m=mass(kg), a=acceleration(m/s²)"
                },
                {
                  type: "Rotational Inertia (Mass Moment of Inertia)",
                  def: "Resistance to angular acceleration",
                  example: "Heavy flywheel is hard to start/stop spinning",
                  formula: <>I = mr²<br />For Cont. Body<br />I = ∫ r² dm</>,
                  unit: "kg·m²",
                  terms: "I=moment of inertia(kg·m²), m=mass(kg), r=distance from axis(m)"
                },
                {
                  type: "Polar Moment of Inertia",
                  def: "Resistance to twisting (torsion)",
                  example: "Thick rod resists twisting more than thin rod",
                  formula: <>J = ∫ r² dA<br />or Ix + Iγ</>,
                  unit: "m⁴",
                  terms: "J=polar moment of inertia(m⁴), d=shaft diameter(m)"
                },
                {
                  type: "Area Moment of Inertia",
                  def: "Resistance to bending",
                  example: "Tall beam sags less than a flat, wide beam",
                  formula: <>Ix = ∫ y² dA,<br />Iy = ∫ x² dA</>,
                  unit: "m⁴",
                  terms: "I=area moment of inertia(m⁴), b=width(m), h=height(m)"
                },
                {
                  type: "Product Moment of Inertia",
                  def: "Tendency to twist while bending (unsymmetrical shapes)",
                  example: "L-shaped bracket twists slightly when bent",
                  formula: <>Ixy = ∫ xy dA</>,
                  unit: "m⁴",
                  terms: "Ixy=product of inertia(m⁴), x,y=distance from centroidal axes(m), dA=area element(m²)"
                }
              ].map((row, idx) => (
                <tr key={row.type} className={idx % 2 === 0 ? "bg-brand-beige/20" : "bg-brand-ivory"}>
                  <td className="px-3 py-3 font-bold text-brand-charcoal align-top">{row.type}</td>
                  <td className="px-3 py-3 text-brand-charcoal/80 align-top">{row.def}</td>
                  <td className="px-3 py-3 text-brand-charcoal/80 align-top">{row.example}</td>
                  <td className="px-3 py-3 text-brand-charcoal/85 align-top font-medium italic">{row.formula}</td>
                  <td className="px-3 py-3 text-brand-charcoal/80 align-top whitespace-nowrap">{row.unit}</td>
                  <td className="px-3 py-3 text-brand-charcoal/70 align-top">{row.terms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom CTA — same chrome as every topic page */}
      <div className="rounded-3xl bg-brand-panel border border-brand-beige-dark p-6 sm:p-8 text-center text-brand-ivory flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h3 className="font-serif text-lg font-bold">Apply Inertia Theory in the Workshop</h3>
          <p className="text-xs text-brand-ivory/70 font-light mt-1">
            Open the full PKlab calculator directory to compute servo sizing, reflected inertia
            and structural parameters with live interactive inputs.
          </p>
        </div>
        <button
          onClick={() => navigate("calculators")}
          className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-brand-ivory text-xs font-bold text-brand-olive hover:bg-brand-beige transition-colors cursor-pointer shrink-0"
        >
          Open Calculator Directory
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

    </div>
  );
}
