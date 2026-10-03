import { Progress } from "@/components/ui/progress";
import { formatDuration, progressPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EpisodeView } from "@/types/content";
import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";

interface EpisodeListProps {
  titleId: bigint;
  episodes: EpisodeView[];
  /** Watched position in seconds keyed by stringified episode id. */
  progressByEpisode: Record<string, number>;
  className?: string;
}

/** Numbered episode list with duration, play action, and per-episode progress. */
export function EpisodeList({
  titleId,
  episodes,
  progressByEpisode,
  className,
}: EpisodeListProps) {
  if (episodes.length === 0) {
    return (
      <p
        className="rounded-2xl border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground"
        data-ocid="episodes.empty_state"
      >
        لم تُضف حلقات لهذا العمل بعد.
      </p>
    );
  }

  return (
    <ul className={cn("space-y-2", className)} data-ocid="episodes.list">
      {episodes.map((episode, index) => {
        const position = progressByEpisode[String(episode.id)] ?? 0;
        const percent = progressPercent(
          position,
          Number(episode.durationSeconds),
        );
        const inProgress = percent > 0 && percent < 100;

        return (
          <li key={episode.id}>
            <Link
              to="/watch/$titleId/$episodeId"
              params={{
                titleId: String(titleId),
                episodeId: String(episode.id),
              }}
              data-ocid={`episodes.item.${index + 1}`}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-smooth hover:border-[oklch(var(--nav-active))]/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted font-mono text-sm font-semibold text-muted-foreground"
                aria-hidden="true"
              >
                {Number(episode.number)}
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {episode.title}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDuration(Number(episode.durationSeconds))}
                </p>
                {inProgress ? (
                  <div className="mt-2 flex items-center gap-2">
                    <Progress
                      value={percent}
                      className="h-1"
                      aria-label={`تمت مشاهدة ${percent}% من الحلقة`}
                    />
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {percent}%
                    </span>
                  </div>
                ) : null}
              </div>

              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-smooth group-hover:scale-105"
                aria-hidden="true"
              >
                <Play className="size-4 fill-current" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
