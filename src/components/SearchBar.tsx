/**
 * SearchBar — reusable global instant search with facet filters.
 * ---------------------------------------------------------------------------
 * • Sub-second client-side results across calculators, topics, materials, machines
 * • Filter facets: Category, Difficulty, Material Group, Machine Type
 * • Cmd/Ctrl+K focuses the primary (non-compact) instance
 * • Beautiful "no results" state with quick-suggestion chips
 * • Results deep-link into detail pages / anchored library sections
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, X, ChevronDown, Cpu, Settings, FileText, Compass,
  RotateCcw, SearchX
} from "lucide-react";
import { cn } from "../utils/cn";
import {
  categories,
  performSearch,
  getMaterialGroups,
  getMachineTypeFacets,
  getCalculatorDifficulty,
  emptySearchFilters,
  hasActiveSearchFilters,
  SearchFiltersState,
  DifficultyLevel
} from "../data/db";
import { Badge, difficultyTone } from "./ui/Primitives";

interface SearchBarProps {
  /** compact = inside the mobile drawer (full-width dropdown, no kbd hint) */
  compact?: boolean;
  /** called after every successful navigation (e.g., close mobile drawer) */
  onAfterNavigate?: () => void;
  className?: string;
}

const difficultyOptions: DifficultyLevel[] = ["Beginner", "Intermediate", "Advanced"];

export default function SearchBar({ compact = false, onAfterNavigate, className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFiltersState>(emptySearchFilters);
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => performSearch(query, filters), [query, filters]);
  const totalResults =
    results.calculators.length + results.materials.length +
    results.topics.length + results.machines.length;
  const showPanel = open && (query.trim() !== "" || hasActiveSearchFilters(filters));

  /* Close on outside click */
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  /* Cmd/Ctrl + K focuses the primary instance only */
  useEffect(() => {
    if (compact) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [compact]);

  const setFilter = (key: keyof SearchFiltersState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setOpen(true);
  };

  const resetAll = () => {
    setFilters(emptySearchFilters);
    setQuery("");
  };

  /** Navigate to a hash route and optionally scroll to an anchored card. */
  const go = (route: string, anchorId?: string) => {
    window.location.hash = route;
    setOpen(false);
    setQuery("");
    onAfterNavigate?.();
    if (anchorId) {
      setTimeout(() => {
        document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 160);
    }
  };

  const FilterSelect = ({
    label, value, onChange, options
  }: {
    label: string; value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full appearance-none cursor-pointer rounded-lg border border-brand-beige-dark bg-brand-beige/30",
          "py-1.5 pl-2.5 pr-6 text-[11px] font-semibold text-brand-charcoal/70",
          "outline-hidden focus:border-brand-olive"
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-brand-charcoal/35" />
    </label>
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input shell */}
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-charcoal/40 transition-colors group-focus-within:text-brand-olive" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={compact ? "Search calculators, materials, topics…" : "Search PKlab…"}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          aria-label="Global engineering search"
          className="w-full rounded-xl border border-brand-beige-dark bg-brand-beige/20 py-2 pl-10 pr-9 text-sm text-brand-charcoal outline-hidden transition-all duration-300 focus:border-brand-olive focus:bg-brand-ivory focus:ring-2 focus:ring-brand-olive/10"
        />
        {query ? (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-brand-charcoal/40 hover:text-brand-olive cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : !compact ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-brand-beige-dark/80 bg-brand-beige/50 px-1.5 py-0.5 text-[10px] text-brand-charcoal/40 font-medium select-none">
            ⌘K
          </span>
        ) : null}
      </div>

      {/* Results dropdown */}
      {showPanel && (
        <div
          className={cn(
            "absolute z-50 mt-2.5 overflow-hidden rounded-2xl border border-brand-beige-dark bg-brand-ivory shadow-xl max-h-[480px] overflow-y-auto",
            compact ? "inset-x-0" : "right-0 w-[340px] sm:w-[440px]"
          )}
        >
          {/* Panel header + count */}
          <div className="bg-brand-beige/40 px-4 py-2.5 border-b border-brand-beige-dark flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold text-brand-charcoal/55 uppercase tracking-wider truncate">
              {totalResults} result{totalResults === 1 ? "" : "s"}
              {query.trim() ? ` for “${query.trim()}”` : " (filters only)"}
            </p>
            {hasActiveSearchFilters(filters) && (
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-olive hover:underline cursor-pointer shrink-0"
              >
                <RotateCcw className="h-2.5 w-2.5" /> Reset
              </button>
            )}
          </div>

          {/* Facet filters */}
          <div className="px-4 py-3 border-b border-brand-beige-dark/60 grid grid-cols-2 gap-2">
            <FilterSelect
              label="Category"
              value={filters.category}
              onChange={(v) => setFilter("category", v)}
              options={[{ value: "all", label: "Category: All" },
                ...categories.map((c) => ({ value: c.id, label: c.name }))]}
            />
            <FilterSelect
              label="Difficulty"
              value={filters.difficulty}
              onChange={(v) => setFilter("difficulty", v)}
              options={[{ value: "all", label: "Difficulty: All" },
                ...difficultyOptions.map((d) => ({ value: d, label: d }))]}
            />
            <FilterSelect
              label="Material"
              value={filters.material}
              onChange={(v) => setFilter("material", v)}
              options={[{ value: "all", label: "Material: All" },
                ...getMaterialGroups().map((g) => ({ value: g, label: g }))]}
            />
            <FilterSelect
              label="Machine Type"
              value={filters.machine}
              onChange={(v) => setFilter("machine", v)}
              options={[{ value: "all", label: "Machine: All" },
                ...getMachineTypeFacets().map((f) => ({ value: f.id, label: f.label }))]}
            />
          </div>

          {/* Beautiful no-results state */}
          {totalResults === 0 ? (
            <div className="p-8 text-center space-y-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-olive/10 text-brand-olive mx-auto animate-float">
                <SearchX className="h-6 w-6" />
              </span>
              <p className="text-sm font-bold font-serif text-brand-charcoal">No matching instruments</p>
              <p className="text-xs text-brand-charcoal/55 font-light leading-relaxed">
                Recalibrate the query or loosen a filter. Try:
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {["rpm", "torque", "aluminum", "deflection", "haas", "chip"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); setFilters(emptySearchFilters); }}
                    className="px-2.5 py-1 rounded-full bg-brand-beige/60 border border-brand-beige-dark text-[10px] font-bold text-brand-charcoal/60 hover:text-brand-olive hover:border-brand-olive/50 transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-brand-beige-dark/50">
              {/* Calculators section */}
              {results.calculators.length > 0 && (
                <div className="p-2">
                  <h4 className="px-3 py-1.5 text-[11px] font-bold text-brand-olive uppercase tracking-widest">
                    Calculators ({results.calculators.length})
                  </h4>
                  {results.calculators.map((calc) => (
                    <button
                      key={calc.id}
                      onClick={() => go(`#/calculator/${calc.id}`)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-beige/50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <span className="h-7 w-7 rounded-md bg-brand-olive/10 text-brand-olive flex items-center justify-center shrink-0">
                        <Cpu className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-brand-charcoal line-clamp-1 block">{calc.title}</span>
                        <span className="text-[10px] text-brand-charcoal/50 font-mono font-bold line-clamp-1 block">{calc.formula}</span>
                      </span>
                      <Badge tone={difficultyTone(getCalculatorDifficulty(calc))} className="shrink-0">
                        {getCalculatorDifficulty(calc)}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* Topics section */}
              {results.topics.length > 0 && (
                <div className="p-2">
                  <h4 className="px-3 py-1.5 text-[11px] font-bold text-brand-olive uppercase tracking-widest">
                    Engineering Topics ({results.topics.length})
                  </h4>
                  {results.topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => go(`#/topic/${topic.id}`)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-beige/50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <span className="h-7 w-7 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                        <FileText className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-brand-charcoal line-clamp-1 block">{topic.title}</span>
                        <span className="text-xs text-brand-charcoal/55 line-clamp-1 block">{topic.excerpt}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Materials section */}
              {results.materials.length > 0 && (
                <div className="p-2">
                  <h4 className="px-3 py-1.5 text-[11px] font-bold text-brand-olive uppercase tracking-widest">
                    Materials ({results.materials.length})
                  </h4>
                  {results.materials.map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => go("#/materials", `material-${mat.id}`)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-beige/50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <span className="h-7 w-7 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                        <Settings className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-brand-charcoal block">{mat.name}</span>
                        <span className="text-xs text-brand-charcoal/55 block">
                          {mat.group} • {mat.hardness} • {mat.machinability} machinability
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Machines section */}
              {results.machines.length > 0 && (
                <div className="p-2">
                  <h4 className="px-3 py-1.5 text-[11px] font-bold text-brand-olive uppercase tracking-widest">
                    Machine Assets ({results.machines.length})
                  </h4>
                  {results.machines.map((mach) => (
                    <button
                      key={mach.id}
                      onClick={() => go("#/machines", `machine-${mach.id}`)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-beige/50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <span className="h-7 w-7 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                        <Compass className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-brand-charcoal block">{mach.name}</span>
                        <span className="text-xs text-brand-charcoal/55 line-clamp-1 block">{mach.type}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
