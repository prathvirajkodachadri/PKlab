/**
 * PKlab App — thin application shell.
 * ---------------------------------------------------------------------------
 * After the maintainability refactor, this file intentionally does almost
 * nothing: it resolves the route, injects auto-generated SEO metadata, and
 * hands rendering to the RouteOutlet inside the AppLayout.
 *
 * Pages, breadcrumbs, navigation, related content and JSON-LD are ALL
 * generated from the JSON catalogs elsewhere:
 *   • Routes + crumbs + SEO + nav  → src/router/ (core.ts, RouteOutlet.tsx)
 *   • Page templates               → src/pages/
 *   • Layouts                      → src/layouts/
 *   • Calculator plugins           → src/calculators/ (instances auto-registered)
 *   • Data + typed interfaces      → src/data/db.ts + public/data/*.json
 */
import AppLayout from "./layouts/AppLayout";
import RouteOutlet from "./router/RouteOutlet";
import SEO from "./components/SEO";
import { useHashRoute, getSeo } from "./router/core";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  const route = useHashRoute();          // dynamic hash routing
  const seo = getSeo(route);             // auto-generated SEO (+ JSON-LD)
  const { isDark, toggleTheme } = useTheme();

  return (
    <AppLayout route={route} isDark={isDark} onToggleTheme={toggleTheme}>
      <SEO
        title={seo.title}
        description={seo.description}
        canonical={seo.canonical}
        pageType={seo.pageType}
        schemaData={seo.schemaData}
      />
      <RouteOutlet route={route} />
    </AppLayout>
  );
}
