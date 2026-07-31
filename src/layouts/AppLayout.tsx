/**
 * AppLayout — top-level application layout.
 * Compose order: Header (auto nav) → main content → Footer → BackToTop.
 */
import { ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BackToTop from "../components/BackToTop";
import { Route, getNavKey, navigate } from "../router/core";

interface AppLayoutProps {
  route: Route;
  isDark: boolean;
  onToggleTheme: () => void;
  children: ReactNode;
}

export default function AppLayout({ route, isDark, onToggleTheme, children }: AppLayoutProps) {
  return (
    <div className="bg-editorial-pattern min-h-screen flex flex-col font-sans selection:bg-brand-olive/20 selection:text-brand-charcoal">
      {/* Nav key (active section) is derived automatically from the route */}
      <Header
        currentPage={getNavKey(route)}
        onNavigate={navigate}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
      />
      <main className="flex-1">{children}</main>
      <Footer onNavigate={navigate} />
      <BackToTop />
    </div>
  );
}
