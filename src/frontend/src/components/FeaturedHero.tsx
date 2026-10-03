import { FALLBACK_COVER, KIND_LABELS } from "@/lib/constants";
import { formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TitleView } from "@/types/content";
import { Link } from "@tanstack/react-router";
import { Play, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface FeaturedHeroProps {
  items: TitleView[];
  className?: string;
}

const ROTATE_MS = 6500;

/**
 * Spotlight carousel for the top featured titles.
 *
 * Auto-advances through the featured list, pausing on user interaction.
 * Each slide links to the title details page via the play pill.
 */
export function FeaturedHero({ items, className }: FeaturedHeroProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % items.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused, items.length]);

  useEffect(() => {
    if (active >= items.length) setActive(0);
  }, [active, items.length]);

  if (items.length === 0) return null;

  const current = items[Math.min(active, items.length - 1)];

  return (
    <section
      aria-label="الأعمال المميزة"
      data-ocid="hero.section"
      className={cn("relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative mx-4 overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
        <div className="relative aspect-[4/5] w-full sm:aspect-[16/10]">
          <img
            key={current.id}
            src={current.coverImage || FALLBACK_COVER}
            alt={`غلاف ${current.title}`}
            className="size-full animate-fade-in object-cover"
          />
          <div className="absolute inset-0 bg-gradient-scrim" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
                {current.category}
              </span>
              <span className="rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
                {KIND_LABELS[current.kind] ?? current.kind}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
                <Star
                  className="size-3 fill-[oklch(var(--rating-star))] text-[oklch(var(--rating-star))]"
                  aria-hidden="true"
                />
                {formatRating(current.averageRating)}
              </span>
            </div>

            <h2 className="font-display text-2xl font-bold leading-tight text-foreground drop-shadow-sm sm:text-3xl">
              {current.title}
            </h2>

            <p className="line-clamp-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {current.description}
            </p>

            <div className="mt-1 flex items-center gap-3">
              <Link
                to="/title/$id"
                params={{ id: String(current.id) }}
                data-ocid="hero.play_button"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-subtle transition-smooth hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Play className="size-4 fill-current" aria-hidden="true" />
                شاهد الآن
              </Link>
              <span className="text-xs text-muted-foreground">
                {current.episodeCount > 0n
                  ? `${Number(current.episodeCount)} حلقة`
                  : `${Number(current.releaseYear)}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {items.length > 1 ? (
        <div
          className="mt-3 flex items-center justify-center gap-1.5"
          role="tablist"
          aria-label="التنقل بين الأعمال المميزة"
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`عرض ${item.title}`}
              data-ocid={`hero.dot.${index + 1}`}
              onClick={() => setActive(index)}
              className={cn(
                "h-1.5 rounded-full transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                index === active
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70",
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
