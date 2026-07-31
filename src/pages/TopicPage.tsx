/**
 * TopicPage — ONE reusable template for every topic detail route.
 * ---------------------------------------------------------------------------
 * Fully JSON-driven: companion calculators come from the topic's
 * `relatedCalculators` array; "Further Reading" auto-correlates by shared
 * companion instruments. Adding a new topic = editing topics.json only.
 */
import { BookOpen, Clock, CalendarDays, BarChart3, ArrowRight, Quote, Sparkles } from "lucide-react";
import { Topic, getCalculatorsByIds, getRelatedTopics } from "../data/db";
import { navigate, openCalculator, openTopic } from "../router/core";
import Breadcrumbs, { Crumb } from "../layouts/Breadcrumbs";
import TopicCard from "../components/TopicCard";

/* Custom extended topics rendered as full engineering articles.
 * To add a new extended topic: create a new file in src/topics/
 * and register it in this map by id. Nothing else is modified. */
import InertiaTopic from "../topics/inertia";

interface TopicPageProps {
  topic: Topic;
}

/** "Prathviraj Kodachadri" → "PK" for the avatar monogram. */
function initialsOf(name: string) {
  return name
    .replace(/[.,]/g, "")
    .split(" ")
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function TopicPage({ topic }: TopicPageProps) {
  // AUTO: companion instruments + related topics, both straight from JSON
  const companionCalcs = getCalculatorsByIds(topic.relatedCalculators ?? []);
  const furtherReading = getRelatedTopics(topic);

  // Render registered extended topics at their dedicated IDs
  // without touching topics.json or any existing topic.
  if (topic.id === "inertia") {
    return <InertiaTopic />;
  }

  const crumbs: Crumb[] = [
    { label: "Home", page: "home" },
    { label: "Engineering Topics", page: "topics" },
    { label: topic.title }
  ];

  const difficultyTone =
    topic.difficulty === "Advanced"
      ? "bg-rose-500/10 text-rose-800 border-rose-500/20"
      : topic.difficulty === "Intermediate"
      ? "bg-amber-500/10 text-amber-800 border-amber-500/20"
      : "bg-emerald-500/10 text-emerald-800 border-emerald-500/20";

  // Split article body into readable paragraphs (drop cap on the first one)
  const sentences = topic.content.match(/[^.]+\.\s*/g) ?? [topic.content];
  const paragraphCount = 3;
  const size = Math.ceil(sentences.length / paragraphCount);
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += size) {
    paragraphs.push(sentences.slice(i, i + size).join(" ").trim());
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* AUTO breadcrumbs */}
      <Breadcrumbs items={crumbs} onNavigate={navigate} />

      {/* Article Hero */}
      <header className="space-y-5 border-b border-brand-beige-dark/60 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${difficultyTone}`}>
            <BarChart3 className="h-3 w-3" />
            {topic.difficulty}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-beige/60 border border-brand-beige-dark/60 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">
            <Clock className="h-3 w-3" />
            {topic.readTime}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-beige/60 border border-brand-beige-dark/60 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">
            <CalendarDays className="h-3 w-3" />
            {topic.publishedDate}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-serif font-bold text-brand-charcoal leading-tight tracking-tight">
          {topic.title}
        </h1>

        <p className="text-sm sm:text-base text-brand-charcoal/65 leading-relaxed font-light max-w-2xl">
          {topic.excerpt}
        </p>

        {/* Author strip */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-olive text-brand-ivory font-serif text-sm font-bold tracking-wide">
              {initialsOf(topic.author)}
            </span>
            <div>
              <p className="text-sm font-bold text-brand-charcoal">{topic.author}</p>
              <p className="text-[11px] text-brand-charcoal/45">PKlab</p>
            </div>
          </div>

          {companionCalcs.length > 0 && (
            <button
              onClick={() => openCalculator(companionCalcs[0].id)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-olive text-xs font-semibold text-brand-ivory hover:bg-brand-olive-dark transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Calculate Now
            </button>
          )}
        </div>
      </header>

      {/* Apply the theory — AUTO companion calculator links */}
      {companionCalcs.length > 0 && (
        <aside className="rounded-3xl border border-brand-olive/25 bg-brand-olive/5 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-olive" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-brand-olive">
              Apply This Theory — Live Lab Instruments
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {companionCalcs.map((calc) => (
              <button
                key={calc.id}
                onClick={() => openCalculator(calc.id)}
                className="group text-left px-4 py-3.5 rounded-2xl border border-brand-beige-dark bg-brand-ivory hover:border-brand-olive hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-brand-charcoal group-hover:text-brand-olive transition-colors">
                    {calc.title}
                  </p>
                  <code className="text-[10px] font-mono text-brand-olive/80 font-bold mt-0.5 block">{calc.formula}</code>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-brand-charcoal/30 group-hover:text-brand-olive group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* Article Body */}
      <article className="space-y-6">
        {paragraphs.map((para, idx) => (
          <p key={idx} className="text-sm sm:text-[15px] text-brand-charcoal/80 leading-8 font-light text-justify">
            {idx === 0 ? (
              <>
                <span className="font-serif text-4xl font-bold text-brand-olive float-left mr-2.5 leading-none mt-1">
                  {para.charAt(0)}
                </span>
                {para.slice(1)}
              </>
            ) : (
              para
            )}
          </p>
        ))}

        {/* Editorial pull quote */}
        <blockquote className="relative rounded-2xl border-l-4 border-brand-olive bg-brand-beige/35 px-6 py-5 my-8">
          <Quote className="h-6 w-6 text-brand-olive/40 mb-2" />
          <p className="font-serif text-base sm:text-lg italic text-brand-charcoal/85 leading-relaxed">
            {topic.excerpt}
          </p>
          <cite className="block text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/45 mt-3 not-italic">
            — {topic.author}, PKlab
          </cite>
        </blockquote>
      </article>

      {/* Further reading — AUTO related topics (shared companion correlation) */}
      {furtherReading.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-brand-beige-dark/60">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-brand-charcoal/45 flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-brand-olive" />
            Further Reading in the Laboratory
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {furtherReading.map((t) => (
              <TopicCard key={t.id} topic={t} onOpen={openTopic} />
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <div className="rounded-3xl bg-brand-panel border border-brand-beige-dark p-6 sm:p-8 text-center text-brand-ivory flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h3 className="font-serif text-lg font-bold">Put the mathematics into motion</h3>
          <p className="text-xs text-brand-ivory/70 font-light mt-1">
            Run this article's theory live through the full PKlab calculator directory.
          </p>
        </div>
        <button
          onClick={() => navigate("calculators")}
          className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-brand-ivory text-xs font-bold text-brand-olive hover:bg-brand-beige transition-colors cursor-pointer shrink-0"
        >
          Open Calculator Directory
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
