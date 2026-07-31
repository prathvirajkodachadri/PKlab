/**
 * PKlab Data Access Layer
 * ---------------------------------------------------------------------------
 * All engineering content is stored as local JSON documents inside
 * `public/data/` and imported here at build time (no backend, no network).
 * This layer additionally normalises entries, derives metadata (difficulty),
 * exposes aggregate lookups, and powers the global instant search engine.
 */
import categoriesData from '../../public/data/categories.json';
import calculatorsData from '../../public/data/calculators.json';
import topicsData from '../../public/data/topics.json';
import materialsData from '../../public/data/materials.json';
import machinesData from '../../public/data/machines.json';
import standardsData from '../../public/data/standards.json';
import faqsData from '../../public/data/faqs.json';
import testimonialsData from '../../public/data/testimonials.json';
import featuresData from '../../public/data/features.json';
import statsData from '../../public/data/stats.json';

/* ----------------------------------------------------------------- Types */

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

export interface CalculatorInput {
  name: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  help?: string;
}

export interface CalculatorOutput {
  name: string;
  label: string;
  unit: string;
}

/**
 * Calculator entries are fully declarative. `plugin` selects which independent
 * React component renders the interactive computation surface (see
 * `src/calculators/registry.tsx`). Adding a new calculator = new JSON entry.
 */
export interface Calculator {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  formula: string;
  plugin?: string; // defaults to "mathForm"
  difficulty?: DifficultyLevel;
  /** "pending" instruments render the calibration-state page and ship their
   *  full solver in a later release — pages/SEO generate identically. */
  status?: "live" | "pending";
  inputs: CalculatorInput[];
  outputs: CalculatorOutput[];
  formulaExplanation: string;
  engineeringNotes: string;
  applications: string[];
  relatedCalculators: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  featured: boolean;
  calculatorCount: number;
}

export interface Topic {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  readTime: string;
  difficulty: DifficultyLevel;
  publishedDate: string;
  author: string;
  /** Editorial section (e.g. "Spindle System") used to group the topics index. */
  group?: string;
  /** Companion calculator IDs powering the topic's "Apply This Theory" panel
   *  and driving automatic related-topic generation. */
  relatedCalculators?: string[];
}

export interface Material {
  id: string;
  name: string;
  group: string;
  hardness: string;
  tensileStrength: string;
  elasticModulus: string;
  machinability: string;
  recommendedSfm: string;
  thermalExpansion: string;
  specificCuttingEnergy: string;
  notes: string;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  axes: string;
  maxRpm: number;
  maxPower: string;
  travels: string;
  spindleTaper: string;
  maxFeed: string;
  rapids: string;
  controller: string;
  applications: string;
}

export interface Standard {
  id: string;
  title: string;
  scope: string;
  organization: string;
  description: string;
  keyMetrics: string[];
  applicationNote: string;
}

export interface FAQ { id: string; question: string; answer: string; }

export interface Testimonial {
  id: string; name: string; role: string; company: string;
  content: string; avatar: string; rating: number;
}

export interface Feature { id: string; title: string; description: string; icon: string; tag: string; }

export interface Stat { id: string; value: string; label: string; description: string; }

/* ------------------------------------------------------------- Raw data */

export const categories: Category[] = categoriesData as Category[];
export const calculators: Calculator[] = calculatorsData as Calculator[];
export const topics: Topic[] = topicsData as Topic[];
export const materials: Material[] = materialsData as Material[];
export const machines: Machine[] = machinesData as Machine[];
export const standards: Standard[] = standardsData as Standard[];
export const faqs: FAQ[] = faqsData as FAQ[];
export const testimonials: Testimonial[] = testimonialsData as Testimonial[];
export const features: Feature[] = featuresData as Feature[];
export const stats: Stat[] = statsData as Stat[];

/* ----------------------------------------------- Difficulty derivation */

/** Default difficulty per category when a calculator omits an explicit level. */
export const categoryDifficultyDefaults: Record<string, DifficultyLevel> = {
  spindle: "Advanced",
  "feed-cutting": "Intermediate",
  "ball-screw-linear": "Advanced",
  "servo-drive": "Advanced",
  tooling: "Intermediate"
};

export function getCalculatorDifficulty(calc: Calculator): DifficultyLevel {
  return calc.difficulty ?? categoryDifficultyDefaults[calc.categoryId] ?? "Intermediate";
}

/* ----------------------------------------------------------- Lookups */

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getCalculatorById(id: string): Calculator | undefined {
  return calculators.find((c) => c.id === id);
}

export function getCalculatorsByCategory(categoryId: string): Calculator[] {
  return calculators.filter((c) => c.categoryId === categoryId);
}

export function getTopicById(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}

export function getRelatedCalculators(calc: Calculator): Calculator[] {
  return calc.relatedCalculators
    .map((id) => getCalculatorById(id))
    .filter((c): c is Calculator => Boolean(c));
}

/** Resolve any ordered id list into live calculator entities. */
export function getCalculatorsByIds(ids: string[]): Calculator[] {
  return ids
    .map((id) => getCalculatorById(id))
    .filter((c): c is Calculator => Boolean(c));
}

/** Companion instruments for a topic's "Apply This Theory" panel (JSON-driven). */
export function getTopicCompanionCalculators(topic: Topic): Calculator[] {
  return getCalculatorsByIds(topic.relatedCalculators ?? []);
}

/**
 * getRelatedTopics — AUTOMATIC related-topic generation.
 * Topics are scored by how many companion calculators they share with the
 * current article; ties fall back to catalog order. Pure JSON correlation.
 */
export function getRelatedTopics(topic: Topic, limit = 3): Topic[] {
  const mine = new Set(topic.relatedCalculators ?? []);
  return topics
    .filter((t) => t.id !== topic.id)
    .map((t, order) => ({
      topic: t,
      score: (t.relatedCalculators ?? []).filter((id) => mine.has(id)).length,
      order
    }))
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map((entry) => entry.topic);
}

/** Unique material groups for the Material filter facet. */
export function getMaterialGroups(): string[] {
  return Array.from(new Set(materials.map((m) => m.group)));
}

/**
 * Machine-type facets use keyword matching against machine `type` strings,
 * keeping the taxonomy maintainable as the machine library grows.
 */
export interface MachineTypeFacet {
  id: string;
  label: string;
  match: (lowerCaseType: string) => boolean;
}

export function getMachineTypeFacets(): MachineTypeFacet[] {
  return [
    { id: "vertical", label: "Vertical Mills", match: (t) => t.includes("vertical") },
    { id: "turning", label: "Turning Centers", match: (t) => t.includes("turning") },
    { id: "5-axis", label: "5-Axis Systems", match: (t) => t.includes("5-axis") },
    { id: "compact", label: "Compact / Desktop", match: (t) => t.includes("compact") }
  ];
}

/* ------------------------------------------------------- Global search */

export interface SearchFiltersState {
  category: string;
  difficulty: string;
  material: string;
  machine: string;
}

export const emptySearchFilters: SearchFiltersState = {
  category: "all",
  difficulty: "all",
  material: "all",
  machine: "all"
};

export interface SearchResults {
  calculators: Calculator[];
  materials: Material[];
  topics: Topic[];
  machines: Machine[];
}

export function hasActiveSearchFilters(f: SearchFiltersState): boolean {
  return Object.values(f).some((v) => v !== "all");
}

/**
 * performSearch — sub-second, fully client-side full-text search across
 * calculators, materials, topics and machines, with facet filtering.
 */
export function performSearch(
  query: string,
  filters: SearchFiltersState = emptySearchFilters
): SearchResults {
  const normalizedQuery = query.toLowerCase().trim();

  // No query + no facets → nothing to show
  if (!normalizedQuery && !hasActiveSearchFilters(filters)) {
    return { calculators: [], materials: [], topics: [], machines: [] };
  }

  const matchesText = (fields: string[]) =>
    !normalizedQuery || fields.some((f) => f.toLowerCase().includes(normalizedQuery));

  // --- Calculators: text + Category facet + Difficulty facet
  const matchedCalculators = calculators.filter((calc) => {
    const textOk = matchesText([calc.title, calc.description, calc.formula, calc.engineeringNotes]);
    const categoryOk = filters.category === "all" || calc.categoryId === filters.category;
    const difficultyOk =
      filters.difficulty === "all" || getCalculatorDifficulty(calc) === filters.difficulty;
    return textOk && categoryOk && difficultyOk;
  });

  // --- Topics: text + Difficulty facet
  const matchedTopics = topics.filter((topic) => {
    const textOk = matchesText([topic.title, topic.excerpt, topic.content, topic.author]);
    const difficultyOk = filters.difficulty === "all" || topic.difficulty === filters.difficulty;
    return textOk && difficultyOk;
  });

  // --- Materials: text + Material Group facet
  const matchedMaterials = materials.filter((mat) => {
    const textOk = matchesText([mat.name, mat.group, mat.notes, mat.machinability]);
    const materialOk = filters.material === "all" || mat.group === filters.material;
    return textOk && materialOk;
  });

  // --- Machines: text + Machine Type facet
  const machineFacet = getMachineTypeFacets().find((f) => f.id === filters.machine);
  const matchedMachines = machines.filter((mach) => {
    const textOk = matchesText([mach.name, mach.type, mach.applications, mach.controller]);
    const machineOk = !machineFacet || machineFacet.match(mach.type.toLowerCase());
    return textOk && machineOk;
  });

  return {
    calculators: matchedCalculators,
    materials: matchedMaterials,
    topics: matchedTopics,
    machines: matchedMachines
  };
}
