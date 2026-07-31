/**
 * AboutPage — professional founder introduction and platform mission.
 */
import { navigate, getCrumbs } from "../router/core";
import PageShell from "../layouts/PageShell";
import { Card } from "../components/ui/Primitives";

export default function AboutPage() {
  const crumbs = getCrumbs({ page: "about", id: null });

  return (
    <PageShell
      crumbs={crumbs}
      onNavigate={navigate}
      title="ABOUT PKlab"
      description="Welcome to PKlab."
    >
      <Card className="p-6 sm:p-10 space-y-6">
        <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed font-light">
          Hello! I'm Prathviraj Kodachadri, a Mechanical Design Engineer with over a decade of experience in the CNC machine tool industry.
        </p>

        <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed font-light">
          I began my professional career in 2015, working in the design and development of CNC Routers and CNC Machining Centres. Throughout my career, I have been involved in designing machine components, developing mechanical systems, performing engineering calculations, preparing design documentation, and supporting machine development from concept to production.
        </p>

        <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed font-light">
          During my daily engineering work, I repeatedly performed calculations for spindle systems, ball screws, servo motors, linear guideways, bearings, tooling, structural components, and machining parameters. Although many online calculators exist, I found that most were incomplete, difficult to use, or lacked proper engineering explanations.
        </p>

        <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed font-light">
          To solve this problem, I created PKlab.
        </p>

        <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed font-light">
          This website is a growing collection of professional engineering calculators, technical references, educational articles, design guidelines, and practical tools specifically developed for CNC Routers and CNC Machining Centres.
        </p>

        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed font-light">
            Every calculator is designed with the following principles:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-brand-charcoal/70 font-light">
            {[
              "Accurate engineering formulas",
              "Standard SI units",
              "Professional mathematical equations",
              "Step-by-step calculations",
              "Engineering assumptions",
              "Practical design guidance",
              "Fast and responsive user experience",
              "Free access for students and engineers"
            ].map((principle) => (
              <li key={principle} className="flex gap-2.5 items-start">
                <span className="h-1.5 w-1.5 bg-brand-olive rounded-full mt-1.5 shrink-0" />
                <span>{principle}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed font-light">
          The purpose of this website is to provide a reliable engineering resource for Mechanical Design Engineers, Manufacturing Engineers, CNC Application Engineers, Service Engineers, Students, Researchers, and anyone interested in CNC machine design.
        </p>

        <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed font-light">
          New calculators, engineering articles, and technical references will continue to be added as the platform grows.
        </p>

        <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed font-light">
          Thank you for visiting PKlab. I hope these engineering tools help simplify your daily design calculations and contribute to better engineering decisions.
        </p>

        <div className="pt-2 text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed">
          <p className="font-serif font-bold text-brand-charcoal">— Prathviraj Kodachadri</p>
          <p className="font-light">Mechanical Design Engineer</p>
          <p className="font-light">Founder, PKlab</p>
        </div>
      </Card>
    </PageShell>
  );
}
