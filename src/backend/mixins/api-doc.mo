/// Public API documentation endpoint.
///
/// The document is static Markdown authored from the current backend source;
/// it reads no state and takes no parameters. It lives in its own mixin so the
/// composition root stays a thin wiring layer.
mixin () {
  public query func getApiDoc() : async Text {
    "# drama fan — Backend API\n" #
    "\n" #
    "Arabic RTL short-drama and short-movie streaming backend. It stores a\n" #
    "catalogue of titles (dramas and short movies) and their episodes, plus\n" #
    "per-user favorites, star ratings, and continue-watching progress.\n" #
    "\n" #
    "## Authentication and identity\n" #
    "\n" #
    "The frontend authenticates with Internet Identity and pins a derivation\n" #
    "origin, published at `/.well-known/ii-derivation-origin` when available.\n" #
    "An agent already holding the user's Internet Identity authorization can\n" #
    "derive the correct per-app principal against that origin, for example\n" #
    "`icp identity link web <name> --app <host>`. Such a delegation acts with\n" #
    "the user's full authority in this app until it expires.\n" #
    "\n" #
    "Registration is not automatic. A caller becomes known to the app only by\n" #
    "signing in through the app's own frontend, which registers the principal\n" #
    "derived against the pinned origin. A direct API caller must therefore\n" #
    "register first by calling `_initialize_access_control` once as a signed-in\n" #
    "(non-anonymous) caller before any role-guarded call, including guarded\n" #
    "queries. The first caller to initialize receives the `admin` role; every\n" #
    "subsequent caller receives the default `user` role. An unregistered or\n" #
    "anonymous caller hitting a guarded endpoint receives the trap message\n" #
    "`Sign in required` (per-user endpoints) or `Admin access required` (admin\n" #
    "endpoints). A principal that never signed in through this app is\n" #
    "unregistered even when it belongs to the app's owner, and a signed-in\n" #
    "caller derived against a different origin is a different principal than\n" #
    "the one the frontend registered.\n" #
    "\n" #
    "## Public catalogue (no sign-in required)\n" #
    "\n" #
    "- `listTitles(filter : TitleFilter) : [TitleView]` — query. Returns\n" #
    "  published titles only. `filter.category` and `filter.kind` narrow by\n" #
    "  category and by `#drama` / `#movie`; `filter.searchTerm` is a\n" #
    "  case-insensitive substring match over title and description. Pass\n" #
    "  `null` fields for no filtering.\n" #
    "- `getTitle(id : Nat) : ?TitleView` — query. Returns `null` when the id is\n" #
    "  unknown or the title is unpublished.\n" #
    "- `listEpisodes(titleId : Nat) : [EpisodeView]` — query. Episodes of one\n" #
    "  title, ordered by episode number. Returns `[]` for an unknown title.\n" #
    "- `getHomeFeed() : HomeFeed` — query. Returns the home-page rows\n" #
    "  (`featured`, `mostWatched`, `newlyAdded`, `shortMovies`, `shortDramas`),\n" #
    "  each a list of `TitleView`.\n" #
    "- `getRatingSummary(titleId : Nat) : RatingSummary` — query. Aggregate\n" #
    "  `average` (Float) and `count` (Nat) of star ratings, plus `userRating`\n" #
    "  (the caller's own rating, or `null` when anonymous or unrated).\n" #
    "\n" #
    "`TitleView` carries `id`, `title`, `description`, `category`, `kind`,\n" #
    "`coverImage`, `releaseYear`, `published`, `averageRating` (Float),\n" #
    "`ratingCount` (Nat), and `episodeCount` (Nat). `EpisodeView` carries `id`,\n" #
    "`titleId`, `number`, `title`, `durationSeconds`, and `videoSource`.\n" #
    "\n" #
    "## Per-user library (signed-in callers only)\n" #
    "\n" #
    "All of these trap with `Sign in required` for an anonymous caller.\n" #
    "\n" #
    "- `addFavorite(titleId : Nat) : ()` — update. Idempotent: adding an\n" #
    "  already-favorited title is a no-op.\n" #
    "- `removeFavorite(titleId : Nat) : ()` — update. Idempotent: removing a\n" #
    "  title that is not favorited is a no-op.\n" #
    "- `listFavorites() : [TitleView]` — query. The caller's favorited titles.\n" #
    "- `rateTitle(titleId : Nat, stars : Nat) : Result<(), ContentError>` —\n" #
    "  update. `stars` must be 1..5; an out-of-range value returns\n" #
    "  `#err(#invalidInput(...))`. Re-rating overwrites the previous rating.\n" #
    "  Returns `#err(#notFound)` for an unknown title.\n" #
    "- `saveProgress(episodeId : Nat, positionSeconds : Nat, durationSeconds : Nat) : ()`\n" #
    "  — update. Records the caller's playback position for one episode and\n" #
    "  increments that episode's title watch count. Safe to call repeatedly;\n" #
    "  the latest call wins. `positionSeconds` and `durationSeconds` are whole\n" #
    "  seconds.\n" #
    "- `listContinueWatching() : [ContinueWatchingItem]` — query. The caller's\n" #
    "  in-progress titles, most recently updated first. Each item carries the\n" #
    "  `title`, the in-progress `episode`, `positionSeconds`, `durationSeconds`,\n" #
    "  and `updatedAt`.\n" #
    "\n" #
    "## Admin management (admin role only)\n" #
    "\n" #
    "All of these trap with `Admin access required` for a non-admin caller.\n" #
    "\n" #
    "- `adminListTitles() : [TitleView]` — query. Every title, published or not.\n" #
    "- `adminCreateTitle(input : TitleInput) : Nat` — update. Returns the new\n" #
    "  title id.\n" #
    "- `adminUpdateTitle(id : Nat, input : TitleInput) : Result<(), ContentError>`\n" #
    "  — update. Returns `#err(#notFound)` for an unknown id.\n" #
    "- `adminDeleteTitle(id : Nat) : Result<(), ContentError>` — update.\n" #
    "  Deletes the title and all of its episodes. Returns `#err(#notFound)` for\n" #
    "  an unknown id.\n" #
    "- `adminCreateEpisode(input : EpisodeInput) : Nat` — update. Returns the\n" #
    "  new episode id. `input.titleId` must reference an existing title.\n" #
    "- `adminUpdateEpisode(id : Nat, input : EpisodeInput) : Result<(), ContentError>`\n" #
    "  — update. Returns `#err(#notFound)` for an unknown id.\n" #
    "- `adminDeleteEpisode(id : Nat) : Result<(), ContentError>` — update.\n" #
    "  Returns `#err(#notFound)` for an unknown id.\n" #
    "- `adminSeedSampleContent() : ()` — update. Re-seeds the Arabic sample\n" #
    "  catalogue. Intended for testing; it adds sample titles and episodes\n" #
    "  without removing existing content.\n" #
    "\n" #
    "## Units and encodings\n" #
    "\n" #
    "- Timestamps (`createdAt`, `updatedAt`) are `Int` nanoseconds since the\n" #
    "  Unix epoch.\n" #
    "- Durations and playback positions are whole seconds (`Nat`).\n" #
    "- `averageRating` is a `Float`; `ratingCount` and `episodeCount` are `Nat`.\n" #
    "- `kind` is the variant `{ #drama; #movie }`.\n" #
    "- `coverImage` and `videoSource` are absolute URLs.\n" #
    "- `ContentError` is the variant `{ #notFound; #notAuthorized; #invalidInput : Text }`.\n" #
    "\n" #
    "## Lifecycle, polling, and retry safety\n" #
    "\n" #
    "- Catalogue reads are `query` calls and never mutate state.\n" #
    "- `saveProgress` is the only high-frequency write; it is safe to call on a\n" #
    "  timer while a video plays. Poll `listContinueWatching` after a write to\n" #
    "  refresh the row.\n" #
    "- `addFavorite`, `removeFavorite`, and `rateTitle` are idempotent for the\n" #
    "  same arguments, so a retried call after a timeout is safe.\n" #
    "- `adminCreateTitle` and `adminCreateEpisode` are NOT idempotent: each\n" #
    "  successful call allocates a new id. Do not blindly retry them after a\n" #
    "  timeout; re-list first to check whether the write landed.\n" #
    "- `adminDeleteTitle` cascades to the title's episodes and is destructive;\n" #
    "  retrying after a timeout returns `#err(#notFound)` rather than deleting\n" #
    "  anything else.\n" #
    "\n" #
    "## Data intelligence (OQL)\n" #
    "\n" #
    "The canister exposes `schema()` and `execute()` through the OQL mixin.\n" #
    "Public tables `title` and `episode` are readable by anyone. Per-user\n" #
    "tables `favorite`, `rating`, and `progress` are scoped to the owning\n" #
    "principal. The `watchCount` table is controller-only.\n";
  };
};
