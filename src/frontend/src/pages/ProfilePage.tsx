import { createActor } from "@/backend";
import { ContinueWatchingList } from "@/components/ContinueWatchingList";
import { EmptyState } from "@/components/EmptyState";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useContinueWatching, useFavorites } from "@/hooks/useLibrary";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Clock, LogIn } from "lucide-react";

/**
 * Count of titles the signed-in user has personally rated.
 *
 * The backend exposes per-title rating summaries but no "my ratings" list, so
 * this queries the summary for each saved title and counts the ones carrying a
 * user rating. Favorites are a small, bounded set.
 */
function useRatedCount(titleIds: number[], enabled: boolean) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["ratedCount", titleIds],
    queryFn: async (): Promise<number> => {
      if (!actor || titleIds.length === 0) return 0;
      const summaries = await Promise.all(
        titleIds.map((id) => actor.getRatingSummary(BigInt(id))),
      );
      return summaries.filter((summary) => summary.userRating != null).length;
    },
    enabled: !!actor && !isFetching && enabled && titleIds.length > 0,
  });
}

/** Profile page: identity, stats, continue watching, and session controls. */
export function ProfilePage() {
  const { isAuthenticated, isInitializing, login, isLoggingIn } = useAuth();
  const { data: favorites, isLoading: favoritesLoading } =
    useFavorites(isAuthenticated);
  const { data: continueWatching, isLoading: continueLoading } =
    useContinueWatching(isAuthenticated);

  const favoriteIds = (favorites ?? []).map((title) => Number(title.id));
  const { data: ratedCount, isLoading: ratedLoading } = useRatedCount(
    favoriteIds,
    isAuthenticated,
  );

  const continueItems = continueWatching ?? [];

  return (
    <div className="flex flex-col gap-6 px-4 pt-4" data-ocid="profile.page">
      <ProfileHeader
        favoritesCount={favoriteIds.length}
        ratedCount={ratedCount ?? 0}
        statsLoading={favoritesLoading || ratedLoading}
      />

      {!isAuthenticated ? (
        <EmptyState
          icon={LogIn}
          title="سجّل الدخول لمتابعة نشاطك"
          description="بعد تسجيل الدخول عبر Internet Identity ستظهر هنا مفضلتك والأعمال التي بدأت مشاهدتها."
          action={
            <Button
              type="button"
              onClick={() => login()}
              disabled={isInitializing || isLoggingIn}
              data-ocid="profile.login_prompt_button"
              className="h-11 rounded-full px-6"
            >
              <LogIn className="size-4" aria-hidden="true" />
              {isLoggingIn ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}
            </Button>
          }
        />
      ) : continueLoading ? (
        <div className="flex flex-col gap-3" aria-hidden="true">
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        </div>
      ) : continueItems.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="لا يوجد ما تتابعه حالياً"
          description="ابدأ مشاهدة أي عمل وستجد هنا مكان التوقف لمتابعته لاحقاً."
          action={
            <Button asChild className="h-11 rounded-full px-6">
              <Link to="/" data-ocid="profile.browse_button">
                تصفّح الأعمال
              </Link>
            </Button>
          }
        />
      ) : (
        <ContinueWatchingList items={continueItems} />
      )}
    </div>
  );
}
