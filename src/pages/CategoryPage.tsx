/**
 * CategoryPage — ONE reusable template for every category route.
 * Header, instrument counts and the calculator grid are auto-generated
 * from the category JSON entry + calculators.json filtering.
 */
import { Category, getCalculatorsByCategory } from "../data/db";
import { navigate, openCalculator, getCrumbs } from "../router/core";
import { getIconComponent } from "../utils/iconMap";
import { useFavorites } from "../hooks/useFavorites";
import PageShell from "../layouts/PageShell";
import CalculatorCard from "../components/CalculatorCard";
import { Card, Button, Badge } from "../components/ui/Primitives";

interface CategoryPageProps {
  category: Category;
}

export default function CategoryPage({ category }: CategoryPageProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const crumbs = getCrumbs({ page: "category-detail", id: category.id });
  const Icon = getIconComponent(category.icon);
  const categoryCalcs = getCalculatorsByCategory(category.id);

  return (
    <PageShell wide crumbs={crumbs} onNavigate={navigate}>
      <div className="space-y-8">
        <Card className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-brand-beige/30">
          <div className="flex items-center gap-4">
            <span className="h-14 w-14 rounded-2xl bg-brand-olive text-brand-ivory flex items-center justify-center shrink-0">
              <Icon className="h-7 w-7" />
            </span>
            <div>
              <Badge tone="olive">Category Division</Badge>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-charcoal mt-2">
                {category.name}
              </h1>
            </div>
          </div>
          <div className="sm:text-right space-y-2">
            <p className="text-xs text-brand-charcoal/60 font-light max-w-sm">{category.description}</p>
            <p className="text-xs font-bold text-brand-olive">{categoryCalcs.length} live instruments</p>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryCalcs.map((calc) => (
            <CalculatorCard
              key={calc.id}
              calculator={calc}
              isFavorite={isFavorite(calc.id)}
              onToggleFavorite={toggleFavorite}
              onOpen={openCalculator}
            />
          ))}
        </div>

        <div className="text-center">
          <Button variant="secondary" onClick={() => navigate("calculators")}>
            Back to Full Directory
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
