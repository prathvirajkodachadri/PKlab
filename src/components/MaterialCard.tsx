/**
 * MaterialCard — metallurgical profile card auto-generated from
 * materials.json entries inside the Materials Library.
 */
import { ArrowRight } from "lucide-react";
import { Material } from "../data/db";
import { Card, Badge, Button } from "./ui/Primitives";

interface MaterialCardProps {
  material: Material;
  onExploreCalculators: () => void;
}

export default function MaterialCard({ material: mat, onExploreCalculators }: MaterialCardProps) {
  return (
    <Card
      id={`material-${mat.id}`}
      className="p-6 sm:p-8 flex flex-col justify-between hover:border-brand-olive/50 transition-all duration-300"
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 border-b border-brand-beige-dark/50 pb-4">
          <div>
            <Badge tone="olive">{mat.group}</Badge>
            <h3 className="text-xl font-bold font-serif text-brand-charcoal mt-2.5">{mat.name}</h3>
          </div>
          <span className="text-xs bg-brand-beige/50 border border-brand-beige-dark/60 rounded-xl px-3 py-1.5 font-mono font-bold text-brand-charcoal">
            HB: {mat.hardness}
          </span>
        </div>

        {/* Key mechanical property grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          {[
            { label: "Tensile Strength", value: mat.tensileStrength },
            { label: "Elastic Modulus", value: mat.elasticModulus },
            { label: "Recommended Speed", value: `${mat.recommendedSfm} SFM`, olive: true },
            { label: "Specific Cut Energy", value: mat.specificCuttingEnergy }
          ].map((cell) => (
            <div key={cell.label} className="rounded-xl bg-brand-beige/20 p-3.5 border border-brand-beige-dark/40">
              <span className="text-brand-charcoal/45 font-bold uppercase tracking-wider block text-[10px]">
                {cell.label}
              </span>
              <span className={`text-sm font-bold mt-1 block font-mono ${cell.olive ? "text-brand-olive" : "text-brand-charcoal"}`}>
                {cell.value}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <h4 className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest">
            Master Machinist Notes
          </h4>
          <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light">{mat.notes}</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-brand-beige-dark/50 flex items-center justify-between gap-3">
        <span className="text-[10px] text-brand-charcoal/40 font-mono">
          Thermal Coeff: {mat.thermalExpansion} ×10⁻⁶ /°F
        </span>
        <Button variant="ghost" onClick={onExploreCalculators}>
          Calculate Feed Rate
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}
