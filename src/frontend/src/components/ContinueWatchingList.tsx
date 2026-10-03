import { FALLBACK_COVER } from "@/lib/constants";
import { formatDuration, progressPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ContinueWatchingItem } from "@/types/content";
import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";

interface ContinueWatchingListProps {
  items: ContinueWatchingItem[];
  className?: string;
}

/**
 * «متابعة المشاهدة» vertical list: in-progress titles with a progress bar
 * and a resume link into the player.
 */
export function ContinueWatchingList({
  items,
  className,
}: ContinueWatchingListProps) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label="متابعة المشاهدة"
      data-ocid="profile.continue_watching"
      className={cn("flex flex-col gap-3", className)}
    >
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          متابعة المشاهدة
        </h2>
        <span className="text-xs text-muted-foreground">
          {items.length} قيد المشاهدة
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item, index) => {
          const percent = progressPercent(
            Number(item.positionSeconds),
            Number(item.durationSeconds),
          );
          return (
            <li key={`${item.title.id}-${item.episode.id}`}>
              <Link
                to="/watch/$titleId/$episodeId"
                params={{
                  titleId: String(item.title.id),
                  episodeId: String(item.episode.id),
                }}
                data-ocid={`profile.continue.item.${index + 1}`}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <img
                    src={item.title.coverImage || FALLBACK_COVER}
                    alt={`غلاف ${item.title.title}`}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-subtle transition-smooth group-hover:scale-105">
                      <Play
                        className="size-3.5 fill-current"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-foreground">
                    {item.title.title}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    الحلقة {Number(item.episode.number)} · {item.episode.title}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      tabIndex={-1}
                      aria-label={`تقدم مشاهدة ${item.title.title}`}
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-smooth"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                      {formatDuration(Number(item.positionSeconds))}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
