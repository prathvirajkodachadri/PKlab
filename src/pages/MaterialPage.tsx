/**
 * MaterialPage — one reusable template rendering the full materials
 * library. Cards auto-generate from materials.json.
 */
import { materials } from "../data/db";
import { navigate, getCrumbs } from "../router/core";
import PageShell from "../layouts/PageShell";
import MaterialCard from "../components/MaterialCard";

export default function MaterialPage() {
  const crumbs = getCrumbs({ page: "materials", id: null });

  return (
    <PageShell
      wide
      crumbs={crumbs}
      onNavigate={navigate}
      eyebrow="Substrate Classification"
      title="Metallurgical Materials Library"
      description="Standard mechanical profiles for shop-floor setups. Hardness metrics, elastic modules and speed caps — loaded straight from local JSON catalogs."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {materials.map((mat) => (
          <MaterialCard
            key={mat.id}
            material={mat}
            onExploreCalculators={() => navigate("calculators")}
          />
        ))}
      </div>
    </PageShell>
  );
}
