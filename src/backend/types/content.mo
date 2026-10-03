/// Content domain types for the drama-fan streaming catalogue.
///
/// Internal records (`Title`, `Episode`, `Progress`) are the persisted shapes.
/// `*View` records are the immutable, shared shapes returned across the Candid
/// boundary. `*Input` records are the admin write payloads.
module {
  /// A catalogue entry is either a short drama series or a short movie.
  public type TitleType = {
    #drama;
    #movie;
  };

  /// Persisted catalogue entry. Immutable record: admin edits rebuild it.
  public type Title = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    kind : TitleType;
    coverImage : Text;
    releaseYear : Nat;
    published : Bool;
    createdAt : Int;
  };

  /// Persisted episode belonging to exactly one title.
  public type Episode = {
    id : Nat;
    titleId : Nat;
    number : Nat;
    title : Text;
    durationSeconds : Nat;
    videoSource : Text;
    createdAt : Int;
  };

  /// Shared catalogue view enriched with aggregate rating and episode count.
  public type TitleView = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    kind : TitleType;
    coverImage : Text;
    releaseYear : Nat;
    published : Bool;
    averageRating : Float;
    ratingCount : Nat;
    episodeCount : Nat;
  };

  /// Shared episode view.
  public type EpisodeView = {
    id : Nat;
    titleId : Nat;
    number : Nat;
    title : Text;
    durationSeconds : Nat;
    videoSource : Text;
  };

  /// Admin payload for creating or updating a title.
  public type TitleInput = {
    title : Text;
    description : Text;
    category : Text;
    kind : TitleType;
    coverImage : Text;
    releaseYear : Nat;
    published : Bool;
  };

  /// Admin payload for creating or updating an episode.
  public type EpisodeInput = {
    titleId : Nat;
    number : Nat;
    title : Text;
    durationSeconds : Nat;
    videoSource : Text;
  };

  /// Public catalogue filter. Unpublished titles are never returned here.
  public type TitleFilter = {
    category : ?Text;
    kind : ?TitleType;
    searchTerm : ?Text;
  };

  /// Home page rows.
  public type HomeFeed = {
    featured : [TitleView];
    mostWatched : [TitleView];
    newlyAdded : [TitleView];
    shortMovies : [TitleView];
    shortDramas : [TitleView];
  };

  /// Persisted playback position for one user on one episode.
  public type Progress = {
    episodeId : Nat;
    positionSeconds : Nat;
    durationSeconds : Nat;
    updatedAt : Int;
  };

  /// Continue-watching row: the title, the in-progress episode, and progress.
  public type ContinueWatchingItem = {
    title : TitleView;
    episode : EpisodeView;
    positionSeconds : Nat;
    durationSeconds : Nat;
    updatedAt : Int;
  };

  /// Aggregate rating for a title plus the caller's own rating when present.
  public type RatingSummary = {
    average : Float;
    count : Nat;
    userRating : ?Nat;
  };

  /// Caller-actionable failure for content mutations.
  public type ContentError = {
    #notFound;
    #notAuthorized;
    #invalidInput : Text;
  };

  /// Mutable id counters shared with the content mixin.
  public type ContentState = {
    var nextTitleId : Nat;
    var nextEpisodeId : Nat;
  };
};
