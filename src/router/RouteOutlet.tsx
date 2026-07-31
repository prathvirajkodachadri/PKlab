/**
 * RouteOutlet — resolves the current Route into the matching page template.
 * ---------------------------------------------------------------------------
 * Static pages map 1:1 onto templates inside `src/pages/`. Dynamic entity
 * routes (calculator / topic / category) validate the JSON entity first:
 * registered? render the template with its id — otherwise render NotFound.
 */
import { Route, navigate, openCalculator, openTopic } from "./core";
import { getCalculatorById, getCategoryById, getTopicById } from "../data/db";
import NotFound from "../components/NotFound";

import HomePage from "../pages/HomePage";
import CalculatorsPage from "../pages/CalculatorsPage";
import CalculatorPage from "../pages/CalculatorPage";
import CategoryPage from "../pages/CategoryPage";
import TopicsPage from "../pages/TopicsPage";
import TopicPage from "../pages/TopicPage";
import MaterialPage from "../pages/MaterialPage";
import MachinesPage from "../pages/MachinesPage";
import StandardsPage from "../pages/StandardsPage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import { InfoPage, PRIVACY_PAGE, TERMS_PAGE } from "../pages/InfoPage";
import { ComponentType } from "react";

/** Static page registry — page key → template component. */
const staticPages: Record<string, ComponentType> = {
  home: HomePage,
  calculators: CalculatorsPage,
  topics: TopicsPage,
  materials: MaterialPage,
  machines: MachinesPage,
  standards: StandardsPage,
  about: AboutPage,
  contact: ContactPage,
  privacy: () => <InfoPage content={PRIVACY_PAGE} />,
  terms: () => <InfoPage content={TERMS_PAGE} />
};

export default function RouteOutlet({ route }: { route: Route }) {
  /* ------- Dynamic entity routes (auto-generated from JSON catalogs) */
  if (route.page === "calculator-detail") {
    const calc = route.id ? getCalculatorById(route.id) : undefined;
    return calc ? (
      <CalculatorPage calculator={calc} />
    ) : (
      <NotFound
        title="Instrument Not Registered"
        message="This calculator ID has not been registered in the PKlab plugin catalog. Browse the live directory for valid instruments."
        actionLabel="Open Calculator Directory"
        onAction={() => navigate("calculators")}
      />
    );
  }

  if (route.page === "topic-detail") {
    const topic = route.id ? getTopicById(route.id) : undefined;
    return topic ? (
      <TopicPage topic={topic} />
    ) : (
      <NotFound
        title="Article Not Found"
        message="This engineering topic has been archived or its coordinates were mistyped. Return to the topics index to browse the live handbook catalog."
        actionLabel="Browse All Topics"
        onAction={() => navigate("topics")}
      />
    );
  }

  if (route.page === "category-detail") {
    const cat = route.id ? getCategoryById(route.id) : undefined;
    return cat ? (
      <CategoryPage category={cat} />
    ) : (
      <NotFound
        title="Category Out of Range"
        message="This calculator division does not exist in the PKlab coordinate system. Return to the directory to browse valid categories."
        actionLabel="Open Full Directory"
        onAction={() => navigate("calculators")}
      />
    );
  }

  /* ------- Static pages */
  const Page = staticPages[route.page];
  if (Page) return <Page />;

  /* ------- Beautiful 404 */
  return (
    <NotFound
      title="404 — Out of Bounds"
      message="The mechanical coordinates you requested fall outside the physical workspace of PKlab. Back off feed rate and re-center your coordinates."
      actionLabel="Return Home Coordinates"
      onAction={() => navigate("home")}
      extraActions={[
        { label: "Calculator Directory", onClick: () => openCalculator("rpm") },
        { label: "Engineering Topics", onClick: () => openTopic("chip-thinning-mechanics") }
      ]}
    />
  );
}
