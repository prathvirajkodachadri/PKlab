/**
 * CalculatorsPage — the calculator directory template.
 * Filter chips auto-generate from categories.json; cards auto-generate
 * from calculators.json. Adding a calculator only edits the data files.
 */
import { useState } from "react";
import { Star } from "lucide-react";
import { categories, calculators, getCalculatorsByCategory } from "../data/db";
import { navigate, openCalculator, getCrumbs } from "../router/core";
import { useFavorites } from "../hooks/useFavorites";
import PageShell from "../layouts/PageShell";
import NotFound from "../components/NotFound";
import CalculatorCard from "../components/CalculatorCard";

export default function CalculatorsPage() {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const crumbs = getCrumbs({ page: "calculators", id: null });

  const filtered =
    selectedCategoryFilter === "favorites"
      ? calculators.filter((c) => favorites.includes(c.id))
      : selectedCategoryFilter === "all"
      ? calculators
      : getCalculatorsByCategory(selectedCategoryFilter);

  return (
    <PageShell
      wide
      crumbs={crumbs}
      onNavigate={navigate}
      eyebrow="Machining Solvers"
      title="CNC Mathematical Directory"
      description="Browse or search our industrial-grade calculators — auto-generated from the catalog. Star any instrument for quick access."
    >
      <div className="space-y-8">
        {/* Filter chips — auto-generated from categories.json */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 border-b border-brand-beige-dark/50 pb-4">
          <button
            onClick={() => setSelectedCategoryFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedCategoryFilter === "all" ? "bg-brand-olive text-brand-ivory" : "bg-brand-beige/40 text-brand-charcoal/70 hover:bg-brand-beige"}`}
          >
            All Systems ({calculators.length})
          </button>
          <button
            onClick={() => setSelectedCategoryFilter("favorites")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer ${selectedCategoryFilter === "favorites" ? "bg-brand-olive text-brand-ivory" : "bg-brand-beige/40 text-brand-charcoal/70 hover:bg-brand-beige"}`}
          >
            <Star className="h-3.5 w-3.5" />
            Favorites ({favorites.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedCategoryFilter === cat.id ? "bg-brand-olive text-brand-ivory" : "bg-brand-beige/40 text-brand-charcoal/70 hover:bg-brand-beige"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <NotFound
            variant="quick"
            title="No calculators match criteria"
            message="Click the star icon on any instrument card to pin it into your quick-access favorites panel."
            actionLabel="Browse All Calculators"
            onAction={() => setSelectedCategoryFilter("all")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((calc) => (
              <CalculatorCard
                key={calc.id}
                calculator={calc}
                isFavorite={isFavorite(calc.id)}
                onToggleFavorite={toggleFavorite}
                onOpen={openCalculator}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
