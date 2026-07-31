/**
 * BackToTop — floating action button appearing after the operator
 * scrolls past the fold. Uses CSS smooth scrolling (no jQuery physics).
 */
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "../utils/cn";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-6 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-2xl",
        "bg-brand-olive text-brand-ivory shadow-lg border border-white/10",
        "hover:bg-brand-olive-dark hover:-translate-y-1 hover:shadow-xl",
        "transition-all duration-300 cursor-pointer",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
