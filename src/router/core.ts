/**
 * PKlab Router Core — dynamic hash routing with AUTO-GENERATED metadata.
 * ---------------------------------------------------------------------------
 * Single source of truth for:
 *   • Hash parsing / route objects   (useHashRoute, navigate helpers)
 *   • Static route registry          (nav links, labels, SEO per page)
 *   • Breadcrumbs                    (getCrumbs — built from JSON entities)
 *   • SEO metadata                   (getSeo — incl. JSON-LD @graph schemas)
 *   • Active-nav resolution          (getNavKey — detail pages map to parents)
 *
 * Adding a calculator / topic / category to the JSON catalogs automatically
 * extends routing, breadcrumbs and SEO — this file never needs edits.
 */
import { useEffect, useState } from "react";
import type { Crumb } from "../layouts/Breadcrumbs";
import {
  getCalculatorById,
  getCategoryById,
  getTopicById
} from "../data/db";

const SITE = "https://pklab.engineering";

/* --------------------------------------------------------------- Types */

export interface Route {
  /** Page key: "home" | "calculators" | "calculator-detail" | ... */
  page: string;
  /** Entity id for dynamic entity routes (calculator/topic/category). */
  id: string | null;
}

export interface NavLinkDef {
  label: string;
  page: string;
}

export interface SeoProps {
  title: string;
  description: string;
  canonical: string;
  pageType?: "website" | "article" | "calculator";
  schemaData?: object;
}

/* ------------------------------------------------- Hash parsing & hooks */

/** Convert a location.hash into a typed Route object. */
export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, "");
  if (!clean) return { page: "home", id: null };

  const [segment, rest = ""] = clean.split("/");
  const entityId = rest.split("?")[0] || null; // strip ?query used for deep links

  if (segment === "calculator" && entityId) return { page: "calculator-detail", id: entityId };
  if (segment === "topic" && entityId) return { page: "topic-detail", id: entityId };
  if (segment === "category" && entityId) return { page: "category-detail", id: entityId };
  return { page: segment, id: null };
}

/** Reactive hash-router hook (back/forward button + deep-link friendly). */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}

/* ------------------------------------------------- Navigation helpers */

export function navigate(page: string) {
  window.location.hash = `#/${page}`;
}
export function openCalculator(id: string) {
  window.location.hash = `#/calculator/${id}`;
}
export function openTopic(id: string) {
  window.location.hash = `#/topic/${id}`;
}
export function openCategory(id: string) {
  window.location.hash = `#/category/${id}`;
}

/* ----------------------------------------- Static route registry (auto) */

interface StaticRouteMeta {
  /** Used for breadcrumbs + page identity */
  label: string;
  /** Shown in the auto-generated navigation bar when navOrder is set */
  navOrder?: number;
  seoTitle: string;
  seoDescription: string;
  /** URL slug: `#/<slug>` */
  slug: string;
}

const staticRoutes: Record<string, StaticRouteMeta> = {
  home: { label: "Home", seoTitle: "High-Fidelity CNC Calculators", seoDescription: "The modern premium engineering editorial: 15+ real-time mechanical calculators, material libraries and standards.", slug: "" },
  calculators: { label: "Calculators", navOrder: 1, seoTitle: "Machining Calculator Catalog", seoDescription: "Browse 15+ premium manufacturing calculators covering RPM, deflection, bearing life and threading.", slug: "calculators" },
  materials: { label: "Materials", navOrder: 2, seoTitle: "Metallurgical Materials Library", seoDescription: "Explore material group properties, hardness indices and recommended surface feed metrics.", slug: "materials" },
  machines: { label: "Machines", navOrder: 3, seoTitle: "CNC Machine Assets Specification", seoDescription: "Detailed technical profiles of Haas vertical centers, Mazak turning centers and DMG 5-axis mills.", slug: "machines" },
  topics: { label: "Topics", navOrder: 4, seoTitle: "Advanced Machining & CAM Topics", seoDescription: "Technical deep-dives into chip thinning equations, carbide metallurgy and chatter dampening mechanics.", slug: "topics" },
  standards: { label: "Standards", navOrder: 5, seoTitle: "Manufacturing Standards Index", seoDescription: "Mechanical compliance norms: ISO 1302 surface texture, ASME B5.50 tool shanks, ISO 286 fits.", slug: "standards" },
  about: { label: "About", navOrder: 6, seoTitle: "The Editorial Mission", seoDescription: "Meet the engineering team designing high-fidelity mathematical tools for global manufacturing.", slug: "about" },
  contact: { label: "Contact", seoTitle: "Engineering Support Desk", seoDescription: "Contact PKlab to request customized mechanical parameters, calibration feeds or offline apps.", slug: "contact" },
  privacy: { label: "Privacy Policy", seoTitle: "Privacy Policy", seoDescription: "PKlab processes every calculation client-side; no metrics are collected or transmitted.", slug: "privacy" },
  terms: { label: "Terms of Use", seoTitle: "Terms of Use & Liability Waiver", seoDescription: "Structural liability constraints and safe-operation requirements for PKlab mathematics.", slug: "terms" }
};

/** Auto-generated navigation links (ordered, from the registry). */
export function getNavLinks(): NavLinkDef[] {
  return Object.entries(staticRoutes)
    .filter((entry): entry is [string, StaticRouteMeta & { navOrder: number }] => entry[1].navOrder !== undefined)
    .sort((a, b) => a[1].navOrder - b[1].navOrder)
    .map(([page, meta]) => ({ label: meta.label, page }));
}

/** Which nav item should glow for any given route (detail → parent). */
export function getNavKey(route: Route): string {
  if (route.page === "calculator-detail" || route.page === "category-detail") return "calculators";
  if (route.page === "topic-detail") return "topics";
  return route.page;
}

/* ---------------------------------------------------- AUTO: breadcrumbs */

export function getCrumbs(route: Route): Crumb[] {
  const home: Crumb = { label: "Home", page: "home" };

  if (route.page === "calculator-detail") {
    const calc = route.id ? getCalculatorById(route.id) : undefined;
    if (!calc) return [home, { label: "Calculators" }];
    const cat = getCategoryById(calc.categoryId);
    return [
      home,
      { label: "Calculators", page: "calculators" },
      ...(cat ? [{ label: cat.name, page: `category/${cat.id}` } as Crumb] : []),
      { label: calc.title }
    ];
  }

  if (route.page === "topic-detail") {
    const topic = route.id ? getTopicById(route.id) : undefined;
    return [home, { label: "Engineering Topics", page: "topics" }, { label: topic?.title ?? "Article" }];
  }

  if (route.page === "category-detail") {
    const cat = route.id ? getCategoryById(route.id) : undefined;
    return [home, { label: "Calculators", page: "calculators" }, { label: cat?.name ?? "Category" }];
  }

  const meta = staticRoutes[route.page];
  if (route.page === "home") return [{ label: "Home" }];
  if (meta) return [home, { label: meta.label }];
  return [home, { label: "Not Found" }];
}

/* --------------------------------------------------------- AUTO: SEO */

function breadcrumbSchemaFrom(crumbs: Crumb[]): object {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: c.page ? `${SITE}/#/${c.page}` : `${SITE}/`
    }))
  };
}

export function getSeo(route: Route): SeoProps {
  const crumbs = getCrumbs(route);
  const breadcrumbSchema = breadcrumbSchemaFrom(crumbs);

  if (route.page === "calculator-detail" && route.id) {
    const calc = getCalculatorById(route.id);
    if (calc) {
      return {
        title: calc.title,
        description: `${calc.description} Formula: ${calc.formula}. Standard-compliant computations.`,
        canonical: `${SITE}/#/calculator/${calc.id}`,
        pageType: "calculator",
        schemaData: {
          "@graph": [
            {
              "@type": "SoftwareApplication",
              name: calc.title,
              applicationCategory: "EngineeringApplication",
              operatingSystem: "All",
              description: calc.description,
              offers: { "@type": "Offer", price: "0.00", priceCurrency: "USD" }
            },
            breadcrumbSchema
          ]
        }
      };
    }
  }

  if (route.page === "topic-detail" && route.id) {
    const topic = getTopicById(route.id);
    if (topic) {
      return {
        title: topic.title,
        description: topic.excerpt,
        canonical: `${SITE}/#/topic/${topic.id}`,
        pageType: "article",
        schemaData: {
          "@graph": [
            {
              "@type": "Article",
              headline: topic.title,
              description: topic.excerpt,
              datePublished: topic.publishedDate,
              author: {
                "@type": "Person",
                name: topic.author,
                worksFor: { "@type": "Organization", name: "PKlab" }
              }
            },
            breadcrumbSchema
          ]
        }
      };
    }
  }

  if (route.page === "category-detail" && route.id) {
    const cat = getCategoryById(route.id);
    if (cat) {
      return {
        title: `${cat.name} Calculators`,
        description: `${cat.description} Precision instruments, fully client-side.`,
        canonical: `${SITE}/#/category/${cat.id}`,
        schemaData: { "@graph": [breadcrumbSchema] }
      };
    }
  }

  const meta = staticRoutes[route.page];
  if (meta) {
    return {
      title: meta.seoTitle,
      description: meta.seoDescription,
      canonical: meta.slug ? `${SITE}/#/${meta.slug}` : `${SITE}/`,
      ...(crumbs.length > 1 ? { schemaData: { "@graph": [breadcrumbSchema] } } : {})
    };
  }

  return {
    title: "Page Not Found",
    description: "The requested coordinates fall outside the PKlab workspace.",
    canonical: `${SITE}/`
  };
}
