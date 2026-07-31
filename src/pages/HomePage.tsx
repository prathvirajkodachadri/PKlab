/**
 * HomePage — the editorial landing page template.
 * Every section renders from JSON catalogs: hero, featured calculators,
 * topics-only ticker, categories, features, topics bulletin, materials
 * preview, stats, FAQ and CTA. No page-level hardcoding.
 */
import { ArrowRight, Sparkles, ChevronRight } from "lucide-react";
import {
  categories, calculators, topics, materials,
  stats
} from "../data/db";
import { navigate, openCalculator, openTopic, openCategory, getCrumbs } from "../router/core";
import { getIconComponent } from "../utils/iconMap";
import { useFavorites } from "../hooks/useFavorites";
import Breadcrumbs from "../layouts/Breadcrumbs";
import MovingTicker from "../components/MovingTicker";
import CalculatorCard from "../components/CalculatorCard";
import TopicCard from "../components/TopicCard";
import { Card, Button, Badge } from "../components/ui/Primitives";

export default function HomePage() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const crumbs = getCrumbs({ page: "home", id: null });

  return (
    <div className="space-y-16 pb-20">
      {/* Minimal breadcrumb strip — breadcrumbs render on every page */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumbs items={crumbs} onNavigate={navigate} />
      </div>

      {/* HERO */}
      <section className="relative pt-8 sm:pt-14 pb-12 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-beige-dark bg-brand-beige/50 px-3.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-brand-olive animate-float">
              <Sparkles className="h-3.5 w-3.5" />
              <span>The Engineering Hub for CNC Machine Design</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-brand-charcoal tracking-tight leading-1.1">
              Mathematical Precision. <br />
              <span className="italic font-light text-brand-olive">Calibrated</span> for CNC Performance.
            </h1>

            <p className="text-base sm:text-lg text-brand-charcoal/70 leading-relaxed font-light max-w-2xl mx-auto">
              PKlab is a growing collection of professional engineering calculators, technical references and educational articles specifically developed for CNC Routers and CNC Machining Centres.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button variant="primary" size="md" onClick={() => navigate("calculators")} className="w-full sm:w-auto shadow-md">
                Browse Calculators
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="md" onClick={() => navigate("materials")} className="w-full sm:w-auto">
                Materials Library
              </Button>
            </div>
          </div>

          {/* Featured calculators — auto-generated cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {calculators.slice(0, 3).map((calc) => (
              <CalculatorCard
                key={calc.id}
                calculator={calc}
                isFavorite={isFavorite(calc.id)}
                onToggleFavorite={toggleFavorite}
                onOpen={openCalculator}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Moving rectangles — engineering topics only */}
      <MovingTicker onSelectTopic={openTopic} />

      {/* CALCULATOR CATEGORIES → auto links to category pages */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center sm:text-left mb-10">
          <Badge tone="olive">Fidelity Sectors</Badge>
          <h2 className="text-3xl font-serif font-bold text-brand-charcoal mt-3">Sparsely Crafted Categories</h2>
          <p className="text-sm text-brand-charcoal/65 mt-1">
            Click any division to open its dedicated auto-generated category page.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((cat) => {
            const Icon = getIconComponent(cat.icon);
            return (
              <Card
                key={cat.id}
                interactive
                onClick={() => openCategory(cat.id)}
                className="group p-6 text-center sm:text-left flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-beige/50 text-brand-olive group-hover:bg-brand-olive group-hover:text-brand-ivory transition-all duration-300 mb-4">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-bold font-serif text-brand-charcoal group-hover:text-brand-olive transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-brand-charcoal/55 mt-2 font-light leading-relaxed line-clamp-3">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-beige-dark/40 flex items-center justify-between text-xs text-brand-charcoal/40">
                  <span>{cat.calculatorCount} specialized tools</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform text-brand-olive" />
                </div>
              </Card>
            );
          })}
        </div>
      </section>



      {/* ENGINEERING TOPICS bulletin */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="text-center sm:text-left">
            <Badge tone="olive">Metallurgy & Dynamics</Badge>
            <h2 className="text-3xl font-serif font-bold text-brand-charcoal mt-3">Latest Editorial Topics</h2>
            <p className="text-sm text-brand-charcoal/65 mt-1">
              High-precision engineering manuals from master machinists — each on its own page.
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate("topics")} className="mx-auto sm:mx-0 shrink-0">
            View All Manuals
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {topics.slice(0, 2).map((topic) => (
            <TopicCard key={topic.id} topic={topic} onOpen={openTopic} />
          ))}
        </div>
      </section>

      {/* MATERIALS tabular preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="text-center sm:text-left">
              <Badge tone="olive">Hardness & Modulus</Badge>
              <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-3">
                High-Precision Materials Library
              </h2>
              <p className="text-xs text-brand-charcoal/60 mt-1">
                Quick overview of tensile strengths, elastic modules and recommended surface speeds.
              </p>
            </div>
            <Button variant="ghost" onClick={() => navigate("materials")} className="mx-auto sm:mx-0 shrink-0">
              Explore Materials Matrix
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-brand-beige-dark/50">
              <thead>
                <tr className="text-brand-charcoal/40 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Material Substrate</th>
                  <th className="pb-3 px-4">Group Classification</th>
                  <th className="pb-3 px-4">Brinell Hardness</th>
                  <th className="pb-3 px-4 text-right">Recommended SFM</th>
                  <th className="pb-3 pl-4 text-right">Specific Energy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige-dark/30">
                {materials.slice(0, 4).map((mat) => (
                  <tr key={mat.id} className="hover:bg-brand-beige/10 transition-colors">
                    <td className="py-3.5 pr-4 font-semibold text-brand-charcoal">{mat.name}</td>
                    <td className="py-3.5 px-4 text-brand-charcoal/70">{mat.group}</td>
                    <td className="py-3.5 px-4 text-brand-charcoal/70 font-mono">{mat.hardness}</td>
                    <td className="py-3.5 px-4 text-right text-brand-olive font-mono font-semibold">{mat.recommendedSfm} ft/min</td>
                    <td className="py-3.5 pl-4 text-right text-brand-charcoal/65 font-mono">{mat.specificCuttingEnergy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* STATISTICS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-brand-beige-dark bg-brand-beige/50 p-8 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 h-64 w-64 rounded-full border border-brand-olive/5 pointer-events-none" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 lg:divide-x divide-brand-beige-dark">
            {stats.map((stat, idx) => (
              <div key={stat.id} className={`space-y-2 text-center ${idx > 0 ? "pt-6 sm:pt-0 lg:pl-8" : ""}`}>
                <p className="text-4xl sm:text-5xl font-bold font-serif text-brand-olive tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">{stat.label}</p>
                <p className="text-[11px] text-brand-charcoal/60 leading-relaxed font-light">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-3xl border border-brand-beige-dark bg-brand-panel p-8 sm:p-12 text-center text-brand-ivory relative overflow-hidden shadow-md">
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <Badge tone="neutral" className="bg-brand-panel-accent text-brand-ivory border-white/10">
              Offline Ready Setup Sheets
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
              Bring PKlab to Your Machinery Shop Floor
            </h2>
            <p className="text-xs sm:text-sm text-brand-ivory/80 leading-relaxed font-light">
              Every calculator runs instantly client-side with zero data tracking. Open the directory or
              dive into the engineering handbooks from any workshop tablet.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button variant="panelLight" onClick={() => navigate("calculators")}>
                Instant Calculators
              </Button>
              <Button variant="panel" onClick={() => navigate("topics")}>
                Read Engineering Topics
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
