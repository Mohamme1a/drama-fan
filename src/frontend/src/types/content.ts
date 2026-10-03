/**
 * Frontend content domain types.
 *
 * These mirror the backend `*View` records returned across the Candid
 * boundary. The generated `backend.d.ts` is the source of truth once the
 * content API bindings are regenerated; until then these local shapes keep
 * the shell type-safe and are structurally compatible with the backend views.
 */

/** A catalogue entry is either a short drama series or a short movie. */
export type TitleKind = "drama" | "movie";

/**
 * Shared catalogue view enriched with aggregate rating and episode count.
 *
 * Nat/Int fields are `bigint` to match the generated Candid bindings exactly;
 * convert to `number` only at the point of arithmetic or display.
 */
export interface TitleView {
  id: bigint;
  title: string;
  description: string;
  category: string;
  kind: TitleKind;
  coverImage: string;
  releaseYear: bigint;
  published: boolean;
  averageRating: number;
  ratingCount: bigint;
  episodeCount: bigint;
}

/** Shared episode view. Nat/Int fields are `bigint` per the bindings. */
export interface EpisodeView {
  id: bigint;
  titleId: bigint;
  number: bigint;
  title: string;
  durationSeconds: bigint;
  videoSource: string;
}

/** Home page rows. */
export interface HomeFeed {
  featured: TitleView[];
  mostWatched: TitleView[];
  newlyAdded: TitleView[];
  shortMovies: TitleView[];
  shortDramas: TitleView[];
}

/** Public catalogue filter. Unpublished titles are never returned here. */
export interface TitleFilter {
  category?: string;
  kind?: TitleKind;
  searchTerm?: string;
}

/** Continue-watching row: the title, the in-progress episode, and progress. */
export interface ContinueWatchingItem {
  title: TitleView;
  episode: EpisodeView;
  positionSeconds: bigint;
  durationSeconds: bigint;
  updatedAt: bigint;
}

/**
 * Aggregate rating for a title plus the caller's own rating when present.
 *
 * `userRating` is optional because the generated binding omits an absent
 * rating rather than encoding it as `null`; check it with `!= null`.
 */
export interface RatingSummary {
  average: number;
  count: bigint;
  userRating?: bigint;
}

/** A single section of the home feed, ready to render as a horizontal row. */
export interface ContentRowData {
  id: string;
  title: string;
  items: TitleView[];
}
