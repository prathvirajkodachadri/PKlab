/**
 * CalculatorPage — ONE reusable template for every calculator detail route.
 * Receives a validated Calculator entity; header, difficulty badge,
 * category chip, favorite star, breadcrumbs (via PageShell) and the
 * plugin-rendered interactive surface all auto-generate from the JSON entry.
 */
import { ArrowRight, Star } from "lucide-react";
import { Calculator, getCategoryById, getCalculatorDifficulty } from "../data/db";
import { navigate, openCalculator, openCategory, getCrumbs } from "../router/core";
import { useFavorites } from "../hooks/useFavorites";
import PageShell from "../layouts/PageShell";
import CalculatorView from "../components/CalculatorView";
import { Button, Badge, difficultyTone } from "../components/ui/Primitives";

interface CalculatorPageProps {
  calculator: Calculator;
}

export default function CalculatorPage({ calculator }: CalculatorPageProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const crumbs = getCrumbs({ page: "calculator-detail", id: calculator.id });
  const difficulty = getCalculatorDifficulty(calculator);

  return (
    <PageShell wide crumbs={crumbs} onNavigate={navigate}>
      <div className="space-y-6">
        {/* Auto-generated header: title, difficulty, category, favorite */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-beige-dark/50 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge tone={difficultyTone(difficulty)}>{difficulty}</Badge>
              <button onClick={() => openCategory(calculator.categoryId)}>
                <Badge tone="neutral" className="hover:text-brand-olive cursor-pointer">
                  {getCategoryById(calculator.categoryId)?.name ?? "General"}
                </Badge>
              </button>
            </div>
            <h1 className="text-3xl font-serif font-bold text-brand-charcoal flex items-center gap-2">
              {calculator.title}
              <button
                onClick={(e) => toggleFavorite(calculator.id, e)}
                className="p-1.5 text-brand-charcoal/20 hover:text-brand-olive transition-colors cursor-pointer"
                aria-label="Toggle favorite"
              >
                <Star className={`h-5 w-5 ${isFavorite(calculator.id) ? "fill-brand-olive text-brand-olive" : ""}`} />
              </button>
            </h1>
            <p className="text-sm text-brand-charcoal/65 mt-1 max-w-2xl font-light">
              {calculator.description}
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate("calculators")} className="self-start md:self-auto shrink-0">
            Back to Directory
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Plugin-rendered interactive surface (auto-resolved by registry) */}
        <CalculatorView calculator={calculator} onSelectCalculator={openCalculator} />
      </div>
    </PageShell>
  );
}
