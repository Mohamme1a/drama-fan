import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";

module {
  public type OldActor = {};

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    titles : Map.Map<Nat, Title>;
    episodes : Map.Map<Nat, Episode>;
    favorites : Map.Map<Principal, Set.Set<Nat>>;
    ratings : Map.Map<Nat, Map.Map<Principal, Nat>>;
    progress : Map.Map<Principal, Map.Map<Nat, Progress>>;
    watchCounts : Map.Map<Nat, Nat>;
    state : ContentState;
  };

  public type TitleType = { #drama; #movie };

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

  public type Episode = {
    id : Nat;
    titleId : Nat;
    number : Nat;
    title : Text;
    durationSeconds : Nat;
    videoSource : Text;
    createdAt : Int;
  };

  public type Progress = {
    episodeId : Nat;
    positionSeconds : Nat;
    durationSeconds : Nat;
    updatedAt : Int;
  };

  public type ContentState = {
    var nextTitleId : Nat;
    var nextEpisodeId : Nat;
  };

  public func migration(_ : OldActor) : NewActor {
    let titles = Map.empty<Nat, Title>();
    let episodes = Map.empty<Nat, Episode>();

    // Seed Arabic sample dramas and short movies so the catalogue is testable
    // immediately after a fresh install. Runs once, as part of the migration
    // chain entry that introduces the content collections.
    seedSampleContent(titles, episodes);

    {
      accessControlState = AccessControl.initState();
      titles;
      episodes;
      favorites = Map.empty();
      ratings = Map.empty();
      progress = Map.empty();
      watchCounts = Map.empty();
      state = { var nextTitleId = 6; var nextEpisodeId = 11 };
    };
  };

  func seedSampleContent(
    titles : Map.Map<Nat, Title>,
    episodes : Map.Map<Nat, Episode>,
  ) : () {
    let sampleTitles : [Title] = [
      {
        id = 0;
        title = "حكاية حي";
        description = "دراما قصيرة تتابع يوميات عائلة في حي شعبي وتحدياتها اليومية.";
        category = "دراما اجتماعية";
        kind = #drama;
        coverImage = "https://picsum.photos/seed/dramafan1/600/900";
        releaseYear = 2024;
        published = true;
        createdAt = 0;
      },
      {
        id = 1;
        title = "ليالي المدينة";
        description = "قصة حب متشابكة بين شابين من عالمين مختلفين في مدينة لا تنام.";
        category = "رومانسي";
        kind = #drama;
        coverImage = "https://picsum.photos/seed/dramafan2/600/900";
        releaseYear = 2023;
        published = true;
        createdAt = 1;
      },
      {
        id = 2;
        title = "الطريق الأخير";
        description = "فيلم قصير عن رحلة سائق تاكسي يلتقي بغرباء تغيّر حياتهم في ليلة واحدة.";
        category = "دراما";
        kind = #movie;
        coverImage = "https://picsum.photos/seed/dramafan3/600/900";
        releaseYear = 2024;
        published = true;
        createdAt = 2;
      },
      {
        id = 3;
        title = "ظل الماضي";
        description = "دراما تشويقية عن سر عائلي يعود للظهور بعد سنوات من النسيان.";
        category = "تشويق";
        kind = #drama;
        coverImage = "https://picsum.photos/seed/dramafan4/600/900";
        releaseYear = 2022;
        published = true;
        createdAt = 3;
      },
      {
        id = 4;
        title = "قهوة الصباح";
        description = "فيلم قصير دافئ عن لقاء عابر في مقهى صغير يغيّر يوم صاحبته.";
        category = "رومانسي";
        kind = #movie;
        coverImage = "https://picsum.photos/seed/dramafan5/600/900";
        releaseYear = 2023;
        published = true;
        createdAt = 4;
      },
      {
        id = 5;
        title = "أصدقاء الأمس";
        description = "دراما شبابية عن مجموعة أصدقاء يجمعهم حلم واحد وفراق طويل.";
        category = "شبابي";
        kind = #drama;
        coverImage = "https://picsum.photos/seed/dramafan6/600/900";
        releaseYear = 2024;
        published = true;
        createdAt = 5;
      },
    ];

    for (title in sampleTitles.values()) {
      titles.add(title.id, title);
    };

    let sampleEpisodes : [Episode] = [
      { id = 0; titleId = 0; number = 1; title = "البداية"; durationSeconds = 720; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"; createdAt = 0 },
      { id = 1; titleId = 0; number = 2; title = "الجار الجديد"; durationSeconds = 690; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"; createdAt = 1 },
      { id = 2; titleId = 0; number = 3; title = "قرار صعب"; durationSeconds = 750; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"; createdAt = 2 },
      { id = 3; titleId = 1; number = 1; title = "لقاء أول"; durationSeconds = 700; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"; createdAt = 3 },
      { id = 4; titleId = 1; number = 2; title = "وعد"; durationSeconds = 680; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"; createdAt = 4 },
      { id = 5; titleId = 2; number = 1; title = "الفيلم الكامل"; durationSeconds = 1500; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"; createdAt = 5 },
      { id = 6; titleId = 3; number = 1; title = "الرسالة"; durationSeconds = 710; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"; createdAt = 6 },
      { id = 7; titleId = 3; number = 2; title = "الحقيقة"; durationSeconds = 730; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"; createdAt = 7 },
      { id = 8; titleId = 4; number = 1; title = "الفيلم الكامل"; durationSeconds = 1200; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4"; createdAt = 8 },
      { id = 9; titleId = 5; number = 1; title = "لمّ الشمل"; durationSeconds = 740; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"; createdAt = 9 },
      { id = 10; titleId = 5; number = 2; title = "الطريق الطويل"; durationSeconds = 760; videoSource = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4"; createdAt = 10 },
    ];

    for (episode in sampleEpisodes.values()) {
      episodes.add(episode.id, episode);
    };
  };
};
