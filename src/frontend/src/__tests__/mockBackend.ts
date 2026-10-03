import type {
  ContinueWatchingItem,
  EpisodeView,
  HomeFeed,
  RatingSummary,
  TitleView,
} from "@/types/content";
import { vi } from "vitest";

/**
 * A typed local stand-in for the generated `Backend` actor.
 *
 * Every method the frontend calls is a `vi.fn` so tests can assert on the
 * observable actor calls, and every method resolves to a safe default so a
 * page renders without a real canister. This is a mock seam: it proves nothing
 * about the real backend, which the PocketIC lane covers separately.
 */
export interface MockBackend {
  getHomeFeed: ReturnType<typeof vi.fn<() => Promise<HomeFeed>>>;
  listTitles: ReturnType<
    typeof vi.fn<(filter: unknown) => Promise<TitleView[]>>
  >;
  getTitle: ReturnType<typeof vi.fn<(id: bigint) => Promise<TitleView | null>>>;
  listEpisodes: ReturnType<
    typeof vi.fn<(titleId: bigint) => Promise<EpisodeView[]>>
  >;
  listFavorites: ReturnType<typeof vi.fn<() => Promise<TitleView[]>>>;
  addFavorite: ReturnType<typeof vi.fn<(titleId: bigint) => Promise<void>>>;
  removeFavorite: ReturnType<typeof vi.fn<(titleId: bigint) => Promise<void>>>;
  rateTitle: ReturnType<
    typeof vi.fn<(titleId: bigint, stars: bigint) => Promise<unknown>>
  >;
  getRatingSummary: ReturnType<
    typeof vi.fn<(titleId: bigint) => Promise<RatingSummary>>
  >;
  listContinueWatching: ReturnType<
    typeof vi.fn<() => Promise<ContinueWatchingItem[]>>
  >;
  saveProgress: ReturnType<
    typeof vi.fn<
      (episodeId: bigint, position: bigint, duration: bigint) => Promise<void>
    >
  >;
  isCallerAdmin: ReturnType<typeof vi.fn<() => Promise<boolean>>>;
  adminListTitles: ReturnType<typeof vi.fn<() => Promise<TitleView[]>>>;
  adminCreateTitle: ReturnType<
    typeof vi.fn<(input: unknown) => Promise<bigint>>
  >;
  adminUpdateTitle: ReturnType<
    typeof vi.fn<(id: bigint, input: unknown) => Promise<unknown>>
  >;
  adminDeleteTitle: ReturnType<typeof vi.fn<(id: bigint) => Promise<unknown>>>;
  adminCreateEpisode: ReturnType<
    typeof vi.fn<(input: unknown) => Promise<bigint>>
  >;
  adminUpdateEpisode: ReturnType<
    typeof vi.fn<(id: bigint, input: unknown) => Promise<unknown>>
  >;
  adminDeleteEpisode: ReturnType<
    typeof vi.fn<(id: bigint) => Promise<unknown>>
  >;
}

const EMPTY_FEED: HomeFeed = {
  featured: [],
  mostWatched: [],
  newlyAdded: [],
  shortMovies: [],
  shortDramas: [],
};

/** Build a fresh mock actor with safe, empty defaults. */
export function createMockBackend(): MockBackend {
  return {
    getHomeFeed: vi.fn(async () => EMPTY_FEED),
    listTitles: vi.fn(async () => []),
    getTitle: vi.fn(async () => null),
    listEpisodes: vi.fn(async () => []),
    listFavorites: vi.fn(async () => []),
    addFavorite: vi.fn(async () => undefined),
    removeFavorite: vi.fn(async () => undefined),
    rateTitle: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    getRatingSummary: vi.fn(async () => ({ average: 0, count: 0n })),
    listContinueWatching: vi.fn(async () => []),
    saveProgress: vi.fn(async () => undefined),
    isCallerAdmin: vi.fn(async () => false),
    adminListTitles: vi.fn(async () => []),
    adminCreateTitle: vi.fn(async () => 1n),
    adminUpdateTitle: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    adminDeleteTitle: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    adminCreateEpisode: vi.fn(async () => 1n),
    adminUpdateEpisode: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    adminDeleteEpisode: vi.fn(async () => ({ __kind__: "ok", ok: null })),
  };
}
