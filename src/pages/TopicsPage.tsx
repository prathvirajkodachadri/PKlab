/**
 * TopicsPage — one reusable index template for ALL engineering topics.
 * Article cards are 100% auto-generated from topics.json and grouped into
 * their editorial sections (the `group` field) in catalog order.
 */
import { topics } from "../data/db";
import { navigate, openTopic, getCrumbs } from "../router/core";
import PageShell from "../layouts/PageShell";
import TopicCard from "../components/TopicCard";

/** Group topics by their editorial `group` field, preserving catalog order. */
function groupTopics() {
  const order: string[] = [];
  const map = new Map<string, typeof topics>();
  for (const topic of topics) {
    const group = topic.group ?? "General";
    if (!map.has(group)) {
      map.set(group, []);
      order.push(group);
    }
    map.get(group)!.push(topic);
  }
  return order.map((group) => ({ group, items: map.get(group)! }));
}

export default function TopicsPage() {
  const crumbs = getCrumbs({ page: "topics", id: null });
  const sections = groupTopics();

  return (
    <PageShell
      crumbs={crumbs}
      onNavigate={navigate}
      eyebrow="Precision Handbooks"
      title="Advanced Machining & Dynamics Topics"
      description="Every topic is published as a dedicated, standalone editorial page — with citations, live companion calculators and structured article metadata."
    >
      <div className="space-y-12">
        {sections.map((section) => (
          <section key={section.group} className="space-y-5">
            {/* Section header (auto-generated from the JSON group field) */}
            <div className="flex items-end justify-between gap-4 border-b border-brand-beige-dark/50 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-olive">
                  Section
                </p>
                <h2 className="text-2xl font-serif font-bold text-brand-charcoal mt-1">
                  {section.group}
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-brand-charcoal/40">
                {section.items.length} article{section.items.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.items.map((topic) => (
                <TopicCard key={topic.id} topic={topic} onOpen={openTopic} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="text-center text-[11px] text-brand-charcoal/40 font-light pt-4">
        Each article lives on a dedicated shareable URL — for example,{" "}
        <code className="font-mono text-brand-olive/80 font-bold">#/topic/chip-thinning-mechanics</code>
      </p>
    </PageShell>
  );
}
