import type {
  ContinueWatchingItem,
  EpisodeView,
  HomeFeed,
  RatingSummary,
  TitleView,
} from "@/types/content";

/**
 * Typed fixtures mirroring the backend `*View` records.
 *
 * Nat/Int fields are `bigint` to match the generated Candid bindings exactly.
 */

export function makeTitle(overrides: Partial<TitleView> = {}): TitleView {
  return {
    id: 1n,
    title: "حكاية الحي القديم",
    description: "دراما قصيرة عن عائلة تعود إلى حيها القديم.",
    category: "دراما عائلية",
    kind: "drama",
    coverImage: "https://example.test/cover-1.jpg",
    releaseYear: 2024n,
    published: true,
    averageRating: 4.2,
    ratingCount: 12n,
    episodeCount: 3n,
    ...overrides,
  };
}

export function makeEpisode(overrides: Partial<EpisodeView> = {}): EpisodeView {
  return {
    id: 101n,
    titleId: 1n,
    number: 1n,
    title: "البداية",
    durationSeconds: 600n,
    videoSource: "https://example.test/ep-1.mp4",
    ...overrides,
  };
}

export function makeHomeFeed(overrides: Partial<HomeFeed> = {}): HomeFeed {
  return {
    featured: [makeTitle({ id: 1n, title: "العمل المميز" })],
    mostWatched: [makeTitle({ id: 2n, title: "الأكثر مشاهدة" })],
    newlyAdded: [makeTitle({ id: 3n, title: "أضيف حديثاً" })],
    shortDramas: [makeTitle({ id: 4n, title: "مسلسل قصير" })],
    shortMovies: [makeTitle({ id: 5n, title: "فيلم قصير", kind: "movie" })],
    ...overrides,
  };
}

export function makeContinueWatching(
  overrides: Partial<ContinueWatchingItem> = {},
): ContinueWatchingItem {
  return {
    title: makeTitle({ id: 1n, title: "حكاية الحي القديم" }),
    episode: makeEpisode({ id: 101n, number: 1n }),
    positionSeconds: 120n,
    durationSeconds: 600n,
    updatedAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

export function makeRatingSummary(
  overrides: Partial<RatingSummary> = {},
): RatingSummary {
  return {
    average: 4.2,
    count: 12n,
    ...overrides,
  };
}
