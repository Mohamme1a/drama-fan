import { FALLBACK_COVER, KIND_LABELS } from "@/lib/constants";
import { formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TitleView } from "@/types/content";
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";

interface TitleCardProps {
  title: TitleView;
  /** Numeric position for deterministic test markers (1-based). */
  index?: number;
  className?: string;
}

/** Poster card: cover art, title, category, and star rating. */
export function TitleCard({ title, index, className }: TitleCardProps) {
  const hasRating = title.averageRating > 0;

  return (
    <Link
      to="/title/$id"
      params={{ id: String(title.id) }}
      data-ocid={index ? `title.item.${index}` : "title.item"}
      className={cn(
        "group block w-36 shrink-0 focus-visible:outline-none sm:w-40",
        className,
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-border bg-card shadow-subtle transition-smooth group-hover:-translate-y-0.5 group-hover:shadow-elevated group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <img
          src={title.coverImage || FALLBACK_COVER}
          alt={`غلاف ${title.title}`}
          loading="lazy"
          className="size-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-scrim" />
        <span className="absolute bottom-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur">
          {KIND_LABELS[title.kind] ?? title.kind}
        </span>
      </div>

      <div className="mt-2 min-w-0 px-0.5">
        <h3 className="truncate text-sm font-semibold text-foreground">
          {title.title}
        </h3>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="truncate">{title.category}</span>
          <span aria-hidden="true">·</span>
          <span className="flex shrink-0 items-center gap-0.5">
            <Star
              className="size-3 fill-[oklch(var(--rating-star))] text-[oklch(var(--rating-star))]"
              aria-hidden="true"
            />
            <span className={hasRating ? "text-foreground" : undefined}>
              {formatRating(title.averageRating)}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
