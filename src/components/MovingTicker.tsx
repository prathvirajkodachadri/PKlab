/**
 * MovingTicker — continuous horizontal editorial ticker on the Home page.
 * ---------------------------------------------------------------------------
 * Per specification, the moving rectangles contain ENGINEERING TOPICS ONLY.
 * Both GPU-accelerated tracks auto-generate cards from topics.json; the lower
 * track runs reversed with a rotated topic order for visual variety.
 * Hovering pauses the marquee; clicking a card opens its dedicated topic page.
 */
import { BookOpen, Clock } from "lucide-react";
import { topics, Topic } from "../data/db";
import { Badge, difficultyTone } from "./ui/Primitives";

interface MovingTickerProps {
  onSelectTopic: (id: string) => void;
}

function TickerCard({ topic, onOpen }: { topic: Topic; onOpen: (id: string) => void }) {
  return (
    <button
      onClick={() => onOpen(topic.id)}
      className="group inline-flex flex-col w-[300px] shrink-0 text-left rounded-2xl border border-brand-beige-dark bg-brand-ivory p-5 shadow-xs hover:border-brand-olive hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2.5 mb-3">
        <Badge tone={difficultyTone(topic.difficulty)}>{topic.difficulty}</Badge>
        <span className="p-1.5 rounded-lg bg-brand-olive/10 text-brand-olive transition-transform group-hover:rotate-6">
          <BookOpen className="h-4 w-4" />
        </span>
      </div>
      <h4 className="text-[15px] font-bold font-serif text-brand-charcoal tracking-tight leading-snug group-hover:text-brand-olive transition-colors whitespace-normal">
        {topic.title}
      </h4>
      <p className="text-xs text-brand-charcoal/50 mt-2 font-light whitespace-normal line-clamp-2 leading-relaxed">
        {topic.excerpt}
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/35">
        <Clock className="h-3 w-3" /> {topic.readTime}
      </span>
    </button>
  );
}

export default function MovingTicker({ onSelectTopic }: MovingTickerProps) {
  // Two differently-ordered topic repetitions keep both tracks feeling unique
  const upper = [...topics, ...topics, ...topics];
  const lower = [...topics.slice(2), ...topics.slice(0, 2)];
  const lowerTrack = [...lower, ...lower, ...lower];

  return (
    <section className="py-12 bg-brand-beige/25 border-y border-brand-beige-dark/50 overflow-hidden select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 text-center sm:text-left">
        <span className="text-[10px] font-bold text-brand-olive uppercase tracking-widest bg-brand-beige px-2.5 py-1 rounded-full">
          Live Editorial Stream
        </span>
        <h3 className="text-2xl font-serif font-bold text-brand-charcoal mt-3">
          Engineering Topics in Motion
        </h3>
        <p className="text-xs text-brand-charcoal/60 mt-1">
          The moving cards carry our engineering handbooks exclusively — hover to pause, click any card to open the full article.
        </p>
      </div>

      <div className="space-y-6">
        {/* UPPER TRACK — slides left */}
        <div className="relative flex w-full overflow-x-hidden">
          <div className="flex animate-ticker whitespace-nowrap gap-6 py-1">
            {upper.map((topic, idx) => (
              <TickerCard key={`up-${topic.id}-${idx}`} topic={topic} onOpen={onSelectTopic} />
            ))}
          </div>
        </div>

        {/* LOWER TRACK — slides right (reversed) */}
        <div className="relative flex w-full overflow-x-hidden">
          <div className="flex animate-ticker whitespace-nowrap gap-6 py-1 [animation-direction:reverse] [animation-duration:46s]">
            {lowerTrack.map((topic, idx) => (
              <TickerCard key={`lo-${topic.id}-${idx}`} topic={topic} onOpen={onSelectTopic} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
