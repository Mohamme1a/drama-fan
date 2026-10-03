import { createActor } from "@/backend";
import type {
  ContentRowData,
  EpisodeView,
  HomeFeed,
  TitleFilter,
  TitleView,
} from "@/types/content";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/**
 * Content API surface exposed by the backend content mixin.
 *
 * The generated bindings are regenerated after the backend check; until then
 * the actor is narrowed to this interface so the shell stays type-safe.
 */
interface ContentActor {
  getHomeFeed(): Promise<HomeFeed>;
  listTitles(filter: TitleFilter): Promise<TitleView[]>;
  getTitle(id: bigint): Promise<TitleView | null>;
  listEpisodes(titleId: bigint): Promise<EpisodeView[]>;
}

function contentActor(actor: unknown): ContentActor | null {
  return (actor as ContentActor | null) ?? null;
}

/** Home feed rows, shaped for rendering as horizontal content rows. */
export function useHomeFeed() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["homeFeed"],
    queryFn: async (): Promise<HomeFeed | null> => {
      const api = contentActor(actor);
      if (!api) return null;
      return api.getHomeFeed();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Turn a home feed into the ordered list of rows the home page renders. */
export function homeFeedRows(
  feed: HomeFeed | null | undefined,
): ContentRowData[] {
  if (!feed) return [];
  return [
    { id: "featured", title: "مميز هذا الأسبوع", items: feed.featured },
    { id: "most-watched", title: "الأكثر مشاهدة", items: feed.mostWatched },
    { id: "newly-added", title: "أضيف حديثاً", items: feed.newlyAdded },
    { id: "short-dramas", title: "مسلسلات قصيرة", items: feed.shortDramas },
    { id: "short-movies", title: "أفلام قصيرة", items: feed.shortMovies },
  ].filter((row) => row.items.length > 0);
}

/** Catalogue list with optional category, kind, and search filters. */
export function useTitles(filter: TitleFilter) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["titles", filter],
    queryFn: async (): Promise<TitleView[]> => {
      const api = contentActor(actor);
      if (!api) return [];
      return api.listTitles(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A single title's details. */
export function useTitle(id: number | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["title", id],
    queryFn: async (): Promise<TitleView | null> => {
      const api = contentActor(actor);
      if (!api || id === null) return null;
      return api.getTitle(BigInt(id));
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

/** Episodes belonging to a title, ordered by episode number. */
export function useEpisodes(titleId: number | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["episodes", titleId],
    queryFn: async (): Promise<EpisodeView[]> => {
      const api = contentActor(actor);
      if (!api || titleId === null) return [];
      const episodes = await api.listEpisodes(BigInt(titleId));
      return [...episodes].sort((a, b) => Number(a.number - b.number));
    },
    enabled: !!actor && !isFetching && titleId !== null,
  });
}
