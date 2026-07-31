/**
 * TopicCard — editorial article card auto-generated from topics.json.
 * Reused on the Home bulletin, Topics index, ticker and related-reading.
 */
import { ArrowRight } from "lucide-react";
import { Topic } from "../data/db";
import { Card, Badge, difficultyTone } from "./ui/Primitives";

interface TopicCardProps {
  topic: Topic;
  onOpen: (id: string) => void;
}

export default function TopicCard({ topic, onOpen }: TopicCardProps) {
  return (
    <Card
      interactive
      onClick={() => onOpen(topic.id)}
      className="group p-6 sm:p-8 flex flex-col justify-between"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={difficultyTone(topic.difficulty)}>{topic.difficulty}</Badge>
          <Badge tone="neutral">{topic.readTime}</Badge>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold font-serif text-brand-charcoal group-hover:text-brand-olive transition-colors leading-snug">
          {topic.title}
        </h2>

        <p className="text-xs sm:text-sm text-brand-charcoal/60 leading-relaxed font-light line-clamp-3">
          {topic.excerpt}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-brand-beige-dark/50 flex items-center justify-between gap-3 text-xs">
        <div>
          <p className="font-bold text-brand-charcoal">{topic.author}</p>
          <p className="text-[10px] text-brand-charcoal/40 font-light mt-0.5">{topic.publishedDate}</p>
        </div>
        <span className="inline-flex items-center gap-1 font-bold text-brand-olive group-hover:underline text-xs shrink-0">
          Open Article
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Card>
  );
}
