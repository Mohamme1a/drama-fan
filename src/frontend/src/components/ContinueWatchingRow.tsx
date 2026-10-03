import { FALLBACK_COVER } from "@/lib/constants";
import { formatDuration, progressPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ContinueWatchingItem } from "@/types/content";
import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";

interface ContinueWatchingRowProps {
  items: ContinueWatchingItem[];
  className?: string;
}

/**
 * «متابعة المشاهدة» row: in-progress titles with a progress bar.
 *
 * Renders nothing when the user has no saved progress.
 */
export function ContinueWatchingRow({
  items,
  className,
}: ContinueWatchingRowProps) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label="متابعة المشاهدة"
      data-ocid="row.continue-watching"
      className={cn("animate-fade-up", className)}
    >
      <div className="mb-3 flex items-baseline justify-between px-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          متابعة المشاهدة
        </h2>
        <span className="text-xs text-muted-foreground">
          {items.length} قيد المشاهدة
        </span>
      </div>

      <div className="scrollbar-none flex gap-3 overflow-x-auto px-4 pb-1">
        {items.map((item, index) => {
          const percent = progressPercent(
            Number(item.positionSeconds),
            Number(item.durationSeconds),
          );
          return (
            <Link
              key={`${item.title.id}-${item.episode.id}`}
              to="/watch/$titleId/$episodeId"
              params={{
                titleId: String(item.title.id),
                episodeId: String(item.episode.id),
              }}
              data-ocid={`continue.item.${index + 1}`}
              className="group block w-56 shrink-0 focus-visible:outline-none"
            >
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-card shadow-subtle transition-smooth group-hover:-translate-y-0.5 group-hover:shadow-elevated group-focus-visible:ring-2 group-focus-visible:ring-ring">
                <img
                  src={item.title.coverImage || FALLBACK_COVER}
                  alt={`غلاف ${item.title.title}`}
                  loading="lazy"
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-scrim" />

                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-subtle transition-smooth group-hover:scale-105">
                    <Play className="size-5 fill-current" aria-hidden="true" />
                  </span>
                </span>

                <span className="absolute bottom-2 left-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur">
                  {formatDuration(Number(item.durationSeconds))}
                </span>

                <div
                  className="absolute inset-x-0 bottom-0 h-1 bg-background/50"
                  role="progressbar"
                  tabIndex={-1}
                  aria-label={`تقدم مشاهدة ${item.title.title}`}
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-primary transition-smooth"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="mt-2 min-w-0 px-0.5">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {item.title.title}
                </h3>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  الحلقة {Number(item.episode.number)} · {item.episode.title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
