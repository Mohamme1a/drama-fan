import { EmptyState } from "@/components/EmptyState";
import { EpisodeNav } from "@/components/EpisodeNav";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEpisodes, useTitle } from "@/hooks/useContent";
import { useContinueWatching, useSaveProgress } from "@/hooks/useLibrary";
import { FALLBACK_COVER } from "@/lib/constants";
import { formatDuration } from "@/lib/format";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowRight, Clapperboard, ListVideo } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

/**
 * Watch page: plays the selected episode, shows the title and episode header,
 * offers previous/next navigation, and persists playback progress so the title
 * appears in «متابعة المشاهدة».
 */
export function PlayerPage() {
  const { titleId, episodeId } = useParams({
    from: "/watch/$titleId/$episodeId",
  });
  const navigate = useNavigate();

  const numericTitleId = Number(titleId);
  const numericEpisodeId = Number(episodeId);
  const validIds =
    Number.isFinite(numericTitleId) && Number.isFinite(numericEpisodeId);

  const titleQuery = useTitle(validIds ? numericTitleId : null);
  const episodesQuery = useEpisodes(validIds ? numericTitleId : null);
  const continueQuery = useContinueWatching(validIds);
  const saveProgress = useSaveProgress();

  const title = titleQuery.data ?? null;
  const episodes = episodesQuery.data ?? [];

  const currentIndex = episodes.findIndex(
    (ep) => ep.id === BigInt(numericEpisodeId),
  );
  const currentEpisode = currentIndex >= 0 ? episodes[currentIndex] : null;
  const previousEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode =
    currentIndex >= 0 && currentIndex < episodes.length - 1
      ? episodes[currentIndex + 1]
      : null;

  // Resume position for the current episode, read once per episode.
  const resumePositionRef = useRef(0);
  useEffect(() => {
    const item = continueQuery.data?.find(
      (entry) => entry.episode.id === BigInt(numericEpisodeId),
    );
    resumePositionRef.current = item ? Number(item.positionSeconds) : 0;
  }, [continueQuery.data, numericEpisodeId]);

  // Keep the latest save mutation in a ref so the progress callback is stable.
  const saveRef = useRef(saveProgress.mutate);
  useEffect(() => {
    saveRef.current = saveProgress.mutate;
  }, [saveProgress.mutate]);

  const handleProgress = useCallback(
    (positionSeconds: number, durationSeconds: number) => {
      if (!validIds || durationSeconds <= 0) return;
      saveRef.current({
        episodeId: numericEpisodeId,
        positionSeconds: Math.round(positionSeconds),
        durationSeconds: Math.round(durationSeconds),
      });
    },
    [validIds, numericEpisodeId],
  );

  const goToEpisode = useCallback(
    (id: number) => {
      void navigate({
        to: "/watch/$titleId/$episodeId",
        params: { titleId: String(numericTitleId), episodeId: String(id) },
      });
    },
    [navigate, numericTitleId],
  );

  const isLoading = titleQuery.isLoading || episodesQuery.isLoading;

  if (isLoading) {
    return (
      <div className="px-4 py-4" data-ocid="player.loading_state">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="mt-4 h-6 w-2/3 rounded" />
        <Skeleton className="mt-2 h-4 w-1/3 rounded" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Skeleton className="h-11 rounded-full" />
          <Skeleton className="h-11 rounded-full" />
        </div>
      </div>
    );
  }

  if (!validIds || !title || !currentEpisode) {
    return (
      <EmptyState
        icon={Clapperboard}
        title="الحلقة غير متوفرة"
        description="لم نتمكن من العثور على هذه الحلقة. ربما تم حذفها أو أن الرابط غير صحيح."
        action={
          <Button
            type="button"
            onClick={() => void navigate({ to: "/" })}
            data-ocid="player.back_home_button"
            className="rounded-full"
          >
            العودة إلى الرئيسية
          </Button>
        }
      />
    );
  }

  return (
    <div className="pb-4" data-ocid="player.page">
      <VideoPlayer
        src={currentEpisode.videoSource}
        poster={title.coverImage || FALLBACK_COVER}
        startPosition={resumePositionRef.current}
        onProgress={handleProgress}
      />

      <div className="px-4 pt-4">
        <button
          type="button"
          onClick={() =>
            void navigate({
              to: "/title/$id",
              params: { id: String(numericTitleId) },
            })
          }
          data-ocid="player.back_to_title_link"
          className="mb-3 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
          <span className="truncate">{title.title}</span>
        </button>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-bold tracking-tight text-foreground">
              {title.title}
            </h1>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              الحلقة {Number(currentEpisode.number)} · {currentEpisode.title}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <ListVideo className="size-3.5" aria-hidden="true" />
            {formatDuration(Number(currentEpisode.durationSeconds))}
          </span>
        </div>

        <EpisodeNav
          className="mt-5"
          hasPrevious={previousEpisode !== null}
          hasNext={nextEpisode !== null}
          onPrevious={() => {
            if (previousEpisode) goToEpisode(Number(previousEpisode.id));
          }}
          onNext={() => {
            if (nextEpisode) goToEpisode(Number(nextEpisode.id));
          }}
        />

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {currentIndex + 1} من {episodes.length} حلقة
        </p>
      </div>
    </div>
  );
}
