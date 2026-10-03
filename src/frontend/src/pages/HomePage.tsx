import { CategoryChips } from "@/components/CategoryChips";
import { ContentRow } from "@/components/ContentRow";
import { ContinueWatchingRow } from "@/components/ContinueWatchingRow";
import { EmptyState } from "@/components/EmptyState";
import { FeaturedHero } from "@/components/FeaturedHero";
import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/hooks/useAuth";
import { homeFeedRows, useHomeFeed } from "@/hooks/useContent";
import { useContinueWatching } from "@/hooks/useLibrary";
import { Clapperboard } from "lucide-react";

/** Home page: featured spotlight, category filters, and content rows. */
export function HomePage() {
  const { data: feed, isLoading } = useHomeFeed();
  const { isAuthenticated } = useAuth();
  const { data: continueWatching } = useContinueWatching(isAuthenticated);

  const rows = homeFeedRows(feed);
  const featured = feed?.featured ?? [];
  const hasContent = rows.length > 0;

  return (
    <div className="flex flex-col gap-7 pb-4 pt-4" data-ocid="home.page">
      {isLoading ? (
        <div className="flex flex-col gap-7">
          <div className="mx-4 aspect-[4/5] animate-pulse rounded-3xl bg-muted sm:aspect-[16/10]" />
          <LoadingState />
          <LoadingState />
        </div>
      ) : !hasContent ? (
        <EmptyState
          icon={Clapperboard}
          title="لا يوجد محتوى بعد"
          description="لم تتم إضافة أي أعمال إلى المكتبة حتى الآن. عد قريباً لاكتشاف دراما وأفلام جديدة."
        />
      ) : (
        <>
          <FeaturedHero items={featured} />
          <CategoryChips />
          <ContinueWatchingRow items={continueWatching ?? []} />

          <div className="flex flex-col gap-7">
            {rows.map((row) => (
              <ContentRow
                key={row.id}
                rowId={row.id}
                title={row.title}
                items={row.items}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
