/**
 * CalculatorCard — auto-generated card for any calculator JSON entry.
 * Used by the Home showcase, directory grid, category pages and results.
 */
import { ArrowRight, Cpu, Star } from "lucide-react";
import { Calculator, getCalculatorDifficulty, getCategoryById } from "../data/db";
import { Card, Badge, difficultyTone } from "./ui/Primitives";

interface CalculatorCardProps {
  calculator: Calculator;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpen: (id: string) => void;
}

export default function CalculatorCard({
  calculator: calc,
  isFavorite,
  onToggleFavorite,
  onOpen
}: CalculatorCardProps) {
  const difficulty = getCalculatorDifficulty(calc);
  const category = getCategoryById(calc.categoryId);

  return (
    <Card interactive onClick={() => onOpen(calc.id)} className="group relative p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="p-3 rounded-2xl bg-brand-beige/40 text-brand-olive transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:bg-brand-beige">
            <Cpu className="h-5 w-5" />
          </span>
          <div className="flex items-center gap-2">
            <Badge tone={difficultyTone(difficulty)}>{difficulty}</Badge>
            <button
              onClick={(e) => onToggleFavorite(calc.id, e)}
              className="p-2 rounded-xl text-brand-charcoal/20 hover:text-brand-olive transition-colors shrink-0 cursor-pointer"
              title="Save to favorites"
              aria-label={`Toggle favorite for ${calc.title}`}
            >
              <Star className={`h-4.5 w-4.5 ${isFavorite ? "fill-brand-olive text-brand-olive" : ""}`} />
            </button>
          </div>
        </div>

        <h3 className="text-base font-bold font-serif text-brand-charcoal group-hover:text-brand-olive transition-colors">
          {calc.title}
        </h3>
        <p className="text-xs text-brand-charcoal/60 mt-2 font-light line-clamp-2 leading-relaxed">
          {calc.description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-brand-beige-dark/50 flex items-center justify-between gap-2 text-xs">
        <code className="font-mono text-brand-olive/80 font-bold truncate">{calc.formula}</code>
        <span className="text-[10px] uppercase font-bold text-brand-charcoal/40 group-hover:text-brand-olive flex items-center gap-1 transition-colors shrink-0">
          {category ? category.name.split(" ")[0] : "Run"} <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Card>
  );
}
