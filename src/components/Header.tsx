/**
 * Header — sticky responsive navigation bar.
 * ---------------------------------------------------------------------------
 * Features: brand logo, auto-aligned menu, reusable global SearchBar with
 * facet filters, dark/light mode toggle (CSS-variable flip), and a tidy
 * mobile drawer that hosts its own full-width search + navigation.
 */
import { useState } from "react";
import { Menu, X, Cpu, Moon, SunMedium } from "lucide-react";
import SearchBar from "./SearchBar";
import { Button } from "./ui/Primitives";
import { getNavLinks } from "../router/core";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function Header({ currentPage, onNavigate, isDark, onToggleTheme }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation is auto-generated from the static route registry
  // (`src/router/core.ts`) — new pages appear here automatically.
  const navLinks = getNavLinks();

  const goPage = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-beige-dark bg-brand-ivory/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ---------------------------------------------- Primary bar */}
        <div className="flex h-18 items-center justify-between gap-3">
          {/* Logo */}
          <button
            onClick={() => goPage("home")}
            className="group flex items-center gap-2.5 text-left focus:outline-hidden cursor-pointer shrink-0"
            aria-label="PKlab home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-olive text-brand-ivory transition-transform duration-300 group-hover:rotate-12">
              <Cpu className="h-5.5 w-5.5" />
            </span>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-brand-charcoal">
                PK<span className="text-brand-olive font-sans font-light">lab</span>
              </span>
            </div>
          </button>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Primary">
            {navLinks.map((link) => {
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  onClick={() => goPage(link.page)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-brand-olive bg-brand-beige/60 font-semibold"
                      : "text-brand-charcoal/70 hover:text-brand-olive hover:bg-brand-beige/30"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right cluster: search + theme + CTA + hamburger */}
          <div className="flex items-center gap-2.5 flex-1 lg:flex-none justify-end min-w-0">
            {/* Global search — visible from md up; mobile gets drawer search */}
            <SearchBar className="hidden md:block w-full max-w-[300px] xl:max-w-[340px]" />

            {/* Dark / light toggle */}
            <button
              onClick={onToggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Light mode" : "Dark mode"}
              className="p-2.5 rounded-xl border border-brand-beige-dark/80 text-brand-charcoal/60 hover:bg-brand-beige/40 hover:text-brand-olive transition-all cursor-pointer shrink-0"
            >
              {isDark ? <SunMedium className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Support CTA */}
            <Button
              variant="primary"
              onClick={() => goPage("contact")}
              className="hidden sm:inline-flex shrink-0"
            >
              Get Support
            </Button>

            {/* Mobile drawer toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              className="inline-flex lg:hidden p-2.5 rounded-xl border border-brand-beige-dark/80 hover:bg-brand-beige/40 text-brand-charcoal transition-colors cursor-pointer shrink-0"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ---------------------------------------------- Mobile drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-brand-beige-dark/60 py-5 pb-7 space-y-5">
            {/* Full-width search with facet filters */}
            <SearchBar compact onAfterNavigate={() => setIsMobileMenuOpen(false)} />

            <nav className="space-y-1" aria-label="Mobile">
              <p className="px-3 py-1 text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest">
                Navigation
              </p>
              {navLinks.map((link) => {
                const isActive = currentPage === link.page;
                return (
                  <button
                    key={link.page}
                    onClick={() => goPage(link.page)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "text-brand-olive bg-brand-beige"
                        : "text-brand-charcoal/70 hover:text-brand-olive hover:bg-brand-beige/40"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            <Button variant="primary" size="md" onClick={() => goPage("contact")} className="w-full sm:hidden">
              Get Support
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
