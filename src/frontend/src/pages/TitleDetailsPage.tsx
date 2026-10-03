import { EmptyState } from "@/components/EmptyState";
import { EpisodeList } from "@/components/EpisodeList";
import { FavoriteButton } from "@/components/FavoriteButton";
import { RatingStars } from "@/components/RatingStars";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useEpisodes, useTitle } from "@/hooks/useContent";
import {
  useAddFavorite,
  useContinueWatching,
  useFavorites,
  useRateTitle,
  useRatingSummary,
  useRemoveFavorite,
} from "@/hooks/useLibrary";
import { FALLBACK_COVER, KIND_LABELS } from "@/lib/constants";
import { formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import { Clapperboard, Play, Star } from "lucide-react";
import { useMemo } from "react";

/** Full title details: hero, description, actions, rating, and episode list. */
export function TitleDetailsPage() {
  const { id } = useParams({ from: "/title/$id" });
  const titleId = Number(id);
  const validId = Number.isFinite(titleId) ? titleId : null;

  const { isAuthenticated } = useAuth();
  const titleQuery = useTitle(validId);
  const episodesQuery = useEpisodes(validId);
  const ratingQuery = useRatingSummary(validId);
  const favoritesQuery = useFavorites(isAuthenticated);
  const continueQuery = useContinueWatching(isAuthenticated);

  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const rateTitle = useRateTitle();

  const title = titleQuery.data ?? null;
  const episodes = episodesQuery.data ?? [];
  const summary = ratingQuery.data ?? null;

  const isFavorite = useMemo(
    () =>
      validId !== null &&
      (favoritesQuery.data ?? []).some((item) => item.id === BigInt(validId)),
    [favoritesQuery.data, validId],
  );

  const progressByEpisode = useMemo(() => {
    const map: Record<string, number> = {};
    if (validId === null) return map;
    const targetId = BigInt(validId);
    for (const item of continueQuery.data ?? []) {
      if (item.title.id === targetId) {
        map[String(item.episode.id)] = Number(item.positionSeconds);
      }
    }
    return map;
  }, [continueQuery.data, validId]);

  const resumeEpisode = useMemo(() => {
    if (validId === null) return null;
    const targetId = BigInt(validId);
    const items = (continueQuery.data ?? []).filter(
      (item) => item.title.id === targetId,
    );
    if (items.length === 0) return null;
    return items.reduce((latest, item) =>
      item.updatedAt > latest.updatedAt ? item : latest,
    ).episode;
  }, [continueQuery.data, validId]);

  const firstEpisode = episodes[0] ?? null;
  const playEpisode = resumeEpisode ?? firstEpisode;
  const isResuming = resumeEpisode !== null;

  const favoritePending = addFavorite.isPending || removeFavorite.isPending;

  function handleToggleFavorite() {
    if (validId === null) return;
    if (isFavorite) {
      removeFavorite.mutate(validId);
    } else {
      addFavorite.mutate(validId);
    }
  }

  function handleRate(stars: number) {
    if (validId === null) return;
    rateTitle.mutate({ titleId: validId, stars });
  }

  if (titleQuery.isLoading) {
    return <TitleDetailsSkeleton />;
  }

  if (!title) {
    return (
      <EmptyState
        icon={Clapperboard}
        title="العمل غير موجود"
        description="ربما تم حذف هذا العمل أو أن الرابط غير صحيح."
        action={
          <Button asChild className="rounded-full">
            <Link to="/" data-ocid="title.back_home_button">
              العودة إلى الرئيسية
            </Link>
          </Button>
        }
      />
    );
  }

  const average = summary?.average ?? title.averageRating;
  const ratingCount = summary?.count ?? title.ratingCount;
  const userRating =
    summary?.userRating != null ? Number(summary.userRating) : null;

  return (
    <article className="pb-4" data-ocid="title.page">
      {/* Hero */}
      <section className="relative" data-ocid="title.hero">
        <div className="relative aspect-[3/4] w-full overflow-hidden sm:aspect-[16/10]">
          <img
            src={title.coverImage || FALLBACK_COVER}
            alt={`غلاف ${title.title}`}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-scrim" />
        </div>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
              {KIND_LABELS[title.kind] ?? title.kind}
            </span>
            <span className="rounded-full border border-border bg-background/70 px-2.5 py-0.5 text-[11px] font-medium text-foreground backdrop-blur">
              {title.category}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {Number(title.releaseYear)}
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold leading-tight text-foreground">
            {title.title}
          </h1>

          <div className="mt-2 flex items-center gap-2 text-sm">
            <Star
              className="size-4 fill-[oklch(var(--rating-star))] text-[oklch(var(--rating-star))]"
              aria-hidden="true"
            />
            <span className="font-semibold text-foreground">
              {formatRating(average)}
            </span>
            <span className="text-muted-foreground">
              ({Number(ratingCount).toLocaleString("ar-EG")} تقييم)
            </span>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="mt-4 space-y-3 px-4" data-ocid="title.actions">
        {playEpisode ? (
          <Button
            asChild
            className="h-12 w-full rounded-full text-base font-semibold"
          >
            <Link
              to="/watch/$titleId/$episodeId"
              params={{
                titleId: String(title.id),
                episodeId: String(playEpisode.id),
              }}
              data-ocid="title.play_button"
            >
              <Play className="size-5 fill-current" aria-hidden="true" />
              {isResuming ? "متابعة المشاهدة" : "تشغيل الحلقة الأولى"}
            </Link>
          </Button>
        ) : (
          <Button
            type="button"
            disabled
            className="h-12 w-full rounded-full text-base font-semibold"
            data-ocid="title.play_button"
          >
            <Play className="size-5 fill-current" aria-hidden="true" />
            لا توجد حلقات بعد
          </Button>
        )}

        <FavoriteButton
          isFavorite={isFavorite}
          onToggle={handleToggleFavorite}
          disabled={favoritePending}
        />
      </section>

      {/* Description */}
      <section className="mt-5 px-4" data-ocid="title.description">
        <h2 className="mb-2 text-base font-bold text-foreground">القصة</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {title.description}
        </p>
      </section>

      {/* Rating */}
      <section
        className="mt-5 rounded-2xl border border-border bg-card p-4"
        data-ocid="title.rating_section"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">قيّم العمل</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {userRating
                ? `تقييمك الحالي: ${userRating} من 5`
                : "اختر عدد النجوم"}
            </p>
          </div>
          <span className="font-display text-2xl font-bold text-foreground">
            {formatRating(average)}
          </span>
        </div>

        <RatingStars
          value={userRating}
          onRate={handleRate}
          disabled={rateTitle.isPending}
          className="mt-3"
        />
      </section>

      {/* Episodes */}
      <section className="mt-6 px-4" data-ocid="title.episodes_section">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            الحلقات
          </h2>
          <span className="text-xs text-muted-foreground">
            {episodes.length} حلقة
          </span>
        </div>

        {episodesQuery.isLoading ? (
          <EpisodeListSkeleton />
        ) : (
          <EpisodeList
            titleId={title.id}
            episodes={episodes}
            progressByEpisode={progressByEpisode}
          />
        )}
      </section>
    </article>
  );
}

function TitleDetailsSkeleton() {
  return (
    <div className="pb-4" data-ocid="title.loading_state" aria-hidden="true">
      <Skeleton className="aspect-[3/4] w-full sm:aspect-[16/10]" />
      <div className="mt-4 space-y-3 px-4">
        <Skeleton className="h-12 w-full rounded-full" />
        <Skeleton className="h-11 w-full rounded-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

function EpisodeListSkeleton() {
  const ids = Array.from({ length: 4 }, (_, i) => `episode-skeleton-${i}`);
  return (
    <div className="space-y-2" aria-hidden="true">
      {ids.map((id) => (
        <Skeleton key={id} className="h-[68px] w-full rounded-2xl" />
      ))}
    </div>
  );
}
