/// Content domain logic. Stateless: every function receives the collections it
/// needs, so the same module serves the mixin and the OQL entity registration.
import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Time "mo:core/Time";
import Types "../types/content";

module {
  /// Project a persisted title into its shared view.
  public func toTitleView(
    title : Types.Title,
    episodes : Map.Map<Nat, Types.Episode>,
    ratings : Map.Map<Nat, Map.Map<Principal, Nat>>,
  ) : Types.TitleView {
    var episodeCount = 0;
    for (episode in episodes.values()) {
      if (episode.titleId == title.id) {
        episodeCount += 1;
      };
    };

    var ratingSum = 0;
    var ratingCount = 0;
    switch (ratings.get(title.id)) {
      case (?byUser) {
        for (stars in byUser.values()) {
          ratingSum += stars;
          ratingCount += 1;
        };
      };
      case null {};
    };

    let averageRating = if (ratingCount == 0) {
      0.0;
    } else {
      ratingSum.toFloat() / ratingCount.toFloat();
    };

    {
      id = title.id;
      title = title.title;
      description = title.description;
      category = title.category;
      kind = title.kind;
      coverImage = title.coverImage;
      releaseYear = title.releaseYear;
      published = title.published;
      averageRating;
      ratingCount;
      episodeCount;
    };
  };

  /// Project a persisted episode into its shared view.
  public func toEpisodeView(episode : Types.Episode) : Types.EpisodeView {
    {
      id = episode.id;
      titleId = episode.titleId;
      number = episode.number;
      title = episode.title;
      durationSeconds = episode.durationSeconds;
      videoSource = episode.videoSource;
    };
  };

  /// Published titles matching the filter, newest first.
  public func listTitles(
    titles : Map.Map<Nat, Types.Title>,
    episodes : Map.Map<Nat, Types.Episode>,
    ratings : Map.Map<Nat, Map.Map<Principal, Nat>>,
    filter : Types.TitleFilter,
  ) : [Types.TitleView] {
    let term = switch (filter.searchTerm) {
      case (?t) { t.toLower() };
      case null { "" };
    };

    let matched = titles.values().filter(func(title) {
      var keep = title.published;
      switch (filter.category) {
        case (?category) {
          if (title.category != category) {
            keep := false;
          };
        };
        case null {};
      };
      switch (filter.kind) {
        case (?kind) {
          if (title.kind != kind) {
            keep := false;
          };
        };
        case null {};
      };
      if (term != "") {
        let haystack = title.title.toLower() # " " # title.description.toLower();
        if (not haystack.contains(#text term)) {
          keep := false;
        };
      };
      keep;
    }).toArray();

    let sorted = matched.sort(func(a, b) = Int.compare(b.createdAt, a.createdAt));
    sorted.map(func(title) = toTitleView(title, episodes, ratings));
  };

  /// A single published title, or null when absent or unpublished.
  public func getTitle(
    titles : Map.Map<Nat, Types.Title>,
    episodes : Map.Map<Nat, Types.Episode>,
    ratings : Map.Map<Nat, Map.Map<Principal, Nat>>,
    id : Nat,
  ) : ?Types.TitleView {
    switch (titles.get(id)) {
      case (?title) {
        if (title.published) {
          ?toTitleView(title, episodes, ratings);
        } else {
          null;
        };
      };
      case null { null };
    };
  };

  /// Episodes of a title ordered by episode number.
  public func listEpisodes(
    episodes : Map.Map<Nat, Types.Episode>,
    titleId : Nat,
  ) : [Types.EpisodeView] {
    let matched = episodes.values().filter(func(episode) = episode.titleId == titleId).toArray();
    let sorted = matched.sort(func(a, b) = Nat.compare(a.number, b.number));
    sorted.map(func(episode) = toEpisodeView(episode));
  };

  /// Home page rows: featured, most watched, newly added, movies, dramas.
  public func homeFeed(
    titles : Map.Map<Nat, Types.Title>,
    episodes : Map.Map<Nat, Types.Episode>,
    ratings : Map.Map<Nat, Map.Map<Principal, Nat>>,
    watchCounts : Map.Map<Nat, Nat>,
  ) : Types.HomeFeed {
    let published = titles.values().filter(func(title) = title.published).toArray();

    let byNewest = published.sort(func(a, b) = Int.compare(b.createdAt, a.createdAt));
    let newlyAdded = byNewest.map(func(title) = toTitleView(title, episodes, ratings));

    let byWatched = published.sort(func(a, b) {
      let countA = watchCounts.get(a.id) ?? 0;
      let countB = watchCounts.get(b.id) ?? 0;
      Nat.compare(countB, countA);
    });
    let mostWatched = byWatched.map(func(title) = toTitleView(title, episodes, ratings));

    let shortMovies = published.filter(func(title) = title.kind == #movie).map(
      func(title) = toTitleView(title, episodes, ratings)
    );
    let shortDramas = published.filter(func(title) = title.kind == #drama).map(
      func(title) = toTitleView(title, episodes, ratings)
    );

    let featured = byWatched.sliceToArray(0, 5).map(
      func(title) = toTitleView(title, episodes, ratings)
    );

    {
      featured;
      mostWatched;
      newlyAdded;
      shortMovies;
      shortDramas;
    };
  };

  /// Create a title and return its new id.
  public func createTitle(
    titles : Map.Map<Nat, Types.Title>,
    state : Types.ContentState,
    input : Types.TitleInput,
  ) : Nat {
    let id = state.nextTitleId;
    state.nextTitleId := id + 1;
    titles.add(id, {
      id;
      title = input.title;
      description = input.description;
      category = input.category;
      kind = input.kind;
      coverImage = input.coverImage;
      releaseYear = input.releaseYear;
      published = input.published;
      createdAt = Time.now();
    });
    id;
  };

  /// Replace a title's editable fields.
  public func updateTitle(
    titles : Map.Map<Nat, Types.Title>,
    id : Nat,
    input : Types.TitleInput,
  ) : Result.Result<(), Types.ContentError> {
    switch (titles.get(id)) {
      case (?existing) {
        titles.add(id, {
          id;
          title = input.title;
          description = input.description;
          category = input.category;
          kind = input.kind;
          coverImage = input.coverImage;
          releaseYear = input.releaseYear;
          published = input.published;
          createdAt = existing.createdAt;
        });
        #ok(());
      };
      case null { #err(#notFound) };
    };
  };

  /// Delete a title together with all of its episodes.
  public func deleteTitle(
    titles : Map.Map<Nat, Types.Title>,
    episodes : Map.Map<Nat, Types.Episode>,
    id : Nat,
  ) : Result.Result<(), Types.ContentError> {
    switch (titles.get(id)) {
      case (?_) {
        titles.remove(id);
        let snapshot = episodes.values().toArray();
        for (episode in snapshot.values()) {
          if (episode.titleId == id) {
            episodes.remove(episode.id);
          };
        };
        #ok(());
      };
      case null { #err(#notFound) };
    };
  };

  /// Create an episode and return its new id.
  public func createEpisode(
    episodes : Map.Map<Nat, Types.Episode>,
    state : Types.ContentState,
    input : Types.EpisodeInput,
  ) : Nat {
    let id = state.nextEpisodeId;
    state.nextEpisodeId := id + 1;
    episodes.add(id, {
      id;
      titleId = input.titleId;
      number = input.number;
      title = input.title;
      durationSeconds = input.durationSeconds;
      videoSource = input.videoSource;
      createdAt = Time.now();
    });
    id;
  };

  /// Replace an episode's editable fields.
  public func updateEpisode(
    episodes : Map.Map<Nat, Types.Episode>,
    id : Nat,
    input : Types.EpisodeInput,
  ) : Result.Result<(), Types.ContentError> {
    switch (episodes.get(id)) {
      case (?existing) {
        episodes.add(id, {
          id;
          titleId = input.titleId;
          number = input.number;
          title = input.title;
          durationSeconds = input.durationSeconds;
          videoSource = input.videoSource;
          createdAt = existing.createdAt;
        });
        #ok(());
      };
      case null { #err(#notFound) };
    };
  };

  /// Delete a single episode.
  public func deleteEpisode(
    episodes : Map.Map<Nat, Types.Episode>,
    id : Nat,
  ) : Result.Result<(), Types.ContentError> {
    switch (episodes.get(id)) {
      case (?_) {
        episodes.remove(id);
        #ok(());
      };
      case null { #err(#notFound) };
    };
  };

  /// Every title including unpublished, for the admin dashboard.
  public func listAllTitles(
    titles : Map.Map<Nat, Types.Title>,
    episodes : Map.Map<Nat, Types.Episode>,
    ratings : Map.Map<Nat, Map.Map<Principal, Nat>>,
  ) : [Types.TitleView] {
    let all = titles.values().toArray();
    let sorted = all.sort(func(a, b) = Int.compare(b.createdAt, a.createdAt));
    sorted.map(func(title) = toTitleView(title, episodes, ratings));
  };

  /// Add a title to the caller's favorites.
  public func addFavorite(
    favorites : Map.Map<Principal, Set.Set<Nat>>,
    caller : Principal,
    titleId : Nat,
  ) : () {
    let set = switch (favorites.get(caller)) {
      case (?existing) { existing };
      case null {
        let fresh = Set.empty<Nat>();
        favorites.add(caller, fresh);
        fresh;
      };
    };
    set.add(titleId);
  };

  /// Remove a title from the caller's favorites.
  public func removeFavorite(
    favorites : Map.Map<Principal, Set.Set<Nat>>,
    caller : Principal,
    titleId : Nat,
  ) : () {
    switch (favorites.get(caller)) {
      case (?set) { set.remove(titleId) };
      case null {};
    };
  };

  /// The caller's favorite titles.
  public func listFavorites(
    favorites : Map.Map<Principal, Set.Set<Nat>>,
    titles : Map.Map<Nat, Types.Title>,
    episodes : Map.Map<Nat, Types.Episode>,
    ratings : Map.Map<Nat, Map.Map<Principal, Nat>>,
    caller : Principal,
  ) : [Types.TitleView] {
    switch (favorites.get(caller)) {
      case (?set) {
        let views = set.values().filterMap(func(titleId) {
          switch (titles.get(titleId)) {
            case (?title) { ?toTitleView(title, episodes, ratings) };
            case null { null };
          };
        }).toArray();
        views.sort(func(a, b) = Int.compare(b.id, a.id));
      };
      case null { [] };
    };
  };

  /// Set or replace the caller's 1-5 star rating for a title.
  public func rateTitle(
    ratings : Map.Map<Nat, Map.Map<Principal, Nat>>,
    titleId : Nat,
    caller : Principal,
    stars : Nat,
  ) : Result.Result<(), Types.ContentError> {
    if (stars < 1 or stars > 5) {
      return #err(#invalidInput("Rating must be between 1 and 5"));
    };
    let byUser = switch (ratings.get(titleId)) {
      case (?existing) { existing };
      case null {
        let fresh = Map.empty<Principal, Nat>();
        ratings.add(titleId, fresh);
        fresh;
      };
    };
    byUser.add(caller, stars);
    #ok(());
  };

  /// Average rating, rating count, and the caller's own rating.
  public func getRatingSummary(
    ratings : Map.Map<Nat, Map.Map<Principal, Nat>>,
    titleId : Nat,
    caller : Principal,
  ) : Types.RatingSummary {
    switch (ratings.get(titleId)) {
      case (?byUser) {
        var sum = 0;
        var count = 0;
        for (stars in byUser.values()) {
          sum += stars;
          count += 1;
        };
        let average = if (count == 0) { 0.0 } else { sum.toFloat() / count.toFloat() };
        { average; count; userRating = byUser.get(caller) };
      };
      case null { { average = 0.0; count = 0; userRating = null } };
    };
  };

  /// Persist the caller's playback position for an episode.
  public func saveProgress(
    progress : Map.Map<Principal, Map.Map<Nat, Types.Progress>>,
    watchCounts : Map.Map<Nat, Nat>,
    episodes : Map.Map<Nat, Types.Episode>,
    caller : Principal,
    episodeId : Nat,
    positionSeconds : Nat,
    durationSeconds : Nat,
  ) : () {
    let byEpisode = switch (progress.get(caller)) {
      case (?existing) { existing };
      case null {
        let fresh = Map.empty<Nat, Types.Progress>();
        progress.add(caller, fresh);
        fresh;
      };
    };
    byEpisode.add(episodeId, {
      episodeId;
      positionSeconds;
      durationSeconds;
      updatedAt = Time.now();
    });

    switch (episodes.get(episodeId)) {
      case (?episode) {
        let current = watchCounts.get(episode.titleId) ?? 0;
        watchCounts.add(episode.titleId, current + 1);
      };
      case null {};
    };
  };

  /// The caller's in-progress titles, most recently watched first.
  public func listContinueWatching(
    progress : Map.Map<Principal, Map.Map<Nat, Types.Progress>>,
    titles : Map.Map<Nat, Types.Title>,
    episodes : Map.Map<Nat, Types.Episode>,
    ratings : Map.Map<Nat, Map.Map<Principal, Nat>>,
    caller : Principal,
  ) : [Types.ContinueWatchingItem] {
    switch (progress.get(caller)) {
      case (?byEpisode) {
        let items = byEpisode.values().filterMap(func(entry) {
          switch (episodes.get(entry.episodeId)) {
            case (?episode) {
              switch (titles.get(episode.titleId)) {
                case (?title) {
                  ?{
                    title = toTitleView(title, episodes, ratings);
                    episode = toEpisodeView(episode);
                    positionSeconds = entry.positionSeconds;
                    durationSeconds = entry.durationSeconds;
                    updatedAt = entry.updatedAt;
                  };
                };
                case null { null };
              };
            };
            case null { null };
          };
        }).toArray();
        items.sort(func(a, b) = Int.compare(b.updatedAt, a.updatedAt));
      };
      case null { [] };
    };
  };

  /// Seed Arabic sample dramas and short movies with episodes.
  public func seedSampleContent(
    titles : Map.Map<Nat, Types.Title>,
    episodes : Map.Map<Nat, Types.Episode>,
    state : Types.ContentState,
  ) : () {
    if (titles.size() > 0) {
      return;
    };

    let sampleTitles : [Types.TitleInput] = [
      {
        title = "حكاية حي";
        description = "دراما قصيرة تتابع يوميات عائلة في حي شعبي وتحدياتها اليومية.";
        category = "دراما اجتماعية";
        kind = #drama;
        coverImage = "https://picsum.photos/seed/dramafan1/600/900";
        releaseYear = 2024;
        published = true;
      },
      {
        title = "ليالي المدينة";
        description = "قصة حب متشابكة بين شابين من عالمين مختلفين في مدينة لا تنام.";
        category = "رومانسي";
        kind = #drama;
        coverImage = "https://picsum.photos/seed/dramafan2/600/900";
        releaseYear = 2023;
        published = true;
      },
      {
        title = "الطريق الأخير";
        description = "فيلم قصير عن رحلة سائق تاكسي يلتقي بغرباء تغيّر حياتهم في ليلة واحدة.";
        category = "دراما";
        kind = #movie;
        coverImage = "https://picsum.photos/seed/dramafan3/600/900";
        releaseYear = 2024;
        published = true;
      },
      {
        title = "ظل الماضي";
        description = "دراما تشويقية عن سر عائلي يعود للظهور بعد سنوات من النسيان.";
        category = "تشويق";
        kind = #drama;
        coverImage = "https://picsum.photos/seed/dramafan4/600/900";
        releaseYear = 2022;
        published = true;
      },
      {
        title = "قهوة الصباح";
        description = "فيلم قصير دافئ عن لقاء عابر في مقهى صغير يغيّر يوم صاحبته.";
        category = "رومانسي";
        kind = #movie;
        coverImage = "https://picsum.photos/seed/dramafan5/600/900";
        releaseYear = 2023;
        published = true;
      },
      {
        title = "أصدقاء الأمس";
        description = "دراما شبابية عن مجموعة أصدقاء يجمعهم حلم واحد وفراق طويل.";
        category = "شبابي";
        kind = #drama;
        coverImage = "https://picsum.photos/seed/dramafan6/600/900";
        releaseYear = 2024;
        published = true;
      },
    ];

    let sampleEpisodes : [(Nat, [Types.EpisodeInput])] = [
      (0, [
        { titleId = 0; number = 1; title = "البداية"; durationSeconds = 720; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
        { titleId = 0; number = 2; title = "الجار الجديد"; durationSeconds = 690; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
        { titleId = 0; number = 3; title = "قرار صعب"; durationSeconds = 750; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
      ]),
      (1, [
        { titleId = 1; number = 1; title = "لقاء أول"; durationSeconds = 700; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
        { titleId = 1; number = 2; title = "وعد"; durationSeconds = 680; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
      ]),
      (2, [
        { titleId = 2; number = 1; title = "الفيلم الكامل"; durationSeconds = 1500; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
      ]),
      (3, [
        { titleId = 3; number = 1; title = "الرسالة"; durationSeconds = 710; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" },
        { titleId = 3; number = 2; title = "الحقيقة"; durationSeconds = 730; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
      ]),
      (4, [
        { titleId = 4; number = 1; title = "الفيلم الكامل"; durationSeconds = 1200; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4" },
      ]),
      (5, [
        { titleId = 5; number = 1; title = "لمّ الشمل"; durationSeconds = 740; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
        { titleId = 5; number = 2; title = "الطريق الطويل"; durationSeconds = 760; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4" },
      ]),
    ];

    // Create titles first so their generated ids are known.
    let titleIds = sampleTitles.map(func(input) = createTitle(titles, state, input));

    for ((titleIndex, episodeInputs) in sampleEpisodes.values()) {
      let titleId = titleIds[titleIndex];
      for (input in episodeInputs.values()) {
        ignore createEpisode(episodes, state, {
          titleId;
          number = input.number;
          title = input.title;
          durationSeconds = input.durationSeconds;
          videoSource = input.videoSource;
        });
      };
    };
  };
};
