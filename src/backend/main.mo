import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import IntValue "mo:caffeineai-oql/IntValue";
import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import ContentTypes "types/content";
import ContentApiMixin "mixins/content-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let titles : Map.Map<Nat, ContentTypes.Title>;
  let episodes : Map.Map<Nat, ContentTypes.Episode>;
  let favorites : Map.Map<Principal, Set.Set<Nat>>;
  let ratings : Map.Map<Nat, Map.Map<Principal, Nat>>;
  let progress : Map.Map<Principal, Map.Map<Nat, ContentTypes.Progress>>;
  let watchCounts : Map.Map<Nat, Nat>;
  let state : ContentTypes.ContentState;

  // ---- OQL row shapes for the per-user and analytics collections ----

  type FavoriteRow = { id : Text; user : Principal; titleId : Nat };
  type RatingRow = { id : Text; titleId : Nat; user : Principal; stars : Nat };
  type ProgressRow = {
    id : Text;
    user : Principal;
    episodeId : Nat;
    positionSeconds : Nat;
    durationSeconds : Nat;
    updatedAt : Int;
  };
  type WatchCountRow = { titleId : Nat; count : Nat };

  transient let anyP = Principal.fromText("aaaaa-aa");

  // Flatten `Map<Principal, Set<Nat>>` into one row per (user, title) pair.
  // A scoped subject sees only its own bucket; `null` (controller) sees all.
  func favoriteRows(subject : ?Principal) : Iter.Iter<FavoriteRow> {
    let out = List.empty<FavoriteRow>();
    for ((user, titleIds) in favorites.entries()) {
      let visible = switch (subject) { case (?p) user == p; case null true };
      if (visible) {
        for (titleId in titleIds.values()) {
          out.add({ id = user.toText() # ":" # titleId.toText(); user; titleId });
        };
      };
    };
    out.values()
  };

  // Flatten `Map<Nat, Map<Principal, Nat>>` into one row per (title, user).
  func ratingRows(subject : ?Principal) : Iter.Iter<RatingRow> {
    let out = List.empty<RatingRow>();
    for ((titleId, byUser) in ratings.entries()) {
      for ((user, stars) in byUser.entries()) {
        let visible = switch (subject) { case (?p) user == p; case null true };
        if (visible) {
          out.add({ id = titleId.toText() # ":" # user.toText(); titleId; user; stars });
        };
      };
    };
    out.values()
  };

  // Flatten `Map<Principal, Map<Nat, Progress>>` into one row per (user, episode).
  func progressRows(subject : ?Principal) : Iter.Iter<ProgressRow> {
    let out = List.empty<ProgressRow>();
    for ((user, byTitle) in progress.entries()) {
      let visible = switch (subject) { case (?p) user == p; case null true };
      if (visible) {
        for ((_, pr) in byTitle.entries()) {
          out.add({
            id = user.toText() # ":" # pr.episodeId.toText();
            user;
            episodeId = pr.episodeId;
            positionSeconds = pr.positionSeconds;
            durationSeconds = pr.durationSeconds;
            updatedAt = pr.updatedAt;
          });
        };
      };
    };
    out.values()
  };

  func watchCountRows() : Iter.Iter<WatchCountRow> {
    let out = List.empty<WatchCountRow>();
    for ((titleId, count) in watchCounts.entries()) {
      out.add({ titleId; count });
    };
    out.values()
  };

  include MixinAuthorization(accessControlState, null);
  include ContentApiMixin(
    accessControlState,
    titles,
    episodes,
    favorites,
    ratings,
    progress,
    watchCounts,
    state,
  );
  include Expose({
    entities = [
      // Public catalogue: anyone, including anonymous visitors, reads it.
      OQL.Entity.manual<ContentTypes.Title>("title", func () = titles.values(), "Title", "id")
        .sample({
          id = 0;
          title = "";
          description = "";
          category = "";
          kind = #drama;
          coverImage = "";
          releaseYear = 0;
          published = false;
          createdAt = 0;
        })
        .payload("id", func t = t.id)
        .payload("title", func t = t.title)
        .payload("description", func t = t.description)
        .payload("category", func t = t.category)
        .payload("kind", func t = switch (t.kind) { case (#drama) "drama"; case (#movie) "movie" })
        .payload("coverImage", func t = t.coverImage)
        .payload("releaseYear", func t = t.releaseYear)
        .payload("published", func t = t.published)
        .payload("createdAt", func t = t.createdAt)
        .public_()
        .build(),
      episodes.toEntity("episode", "Episode", "id")
        .sample({
          id = 0;
          titleId = 0;
          number = 0;
          title = "";
          durationSeconds = 0;
          videoSource = "";
          createdAt = 0;
        })
        .public_()
        .build(),
      // Per-user library: each signed-in caller reads only its own rows; the
      // controller (Data Intelligence agent) reads every row.
      OQL.Entity.newScoped<FavoriteRow>("favorite", favoriteRows, "Favorite", "id")
        .sample({ id = ""; user = anyP; titleId = 0 })
        .payload("id", func r = r.id)
        .payload("user", func r = r.user)
        .payload("titleId", func r = r.titleId)
        .ownedBy("user")
        .controllerOrScoped()
        .build(),
      OQL.Entity.newScoped<RatingRow>("rating", ratingRows, "Rating", "id")
        .sample({ id = ""; titleId = 0; user = anyP; stars = 0 })
        .payload("id", func r = r.id)
        .payload("titleId", func r = r.titleId)
        .payload("user", func r = r.user)
        .payload("stars", func r = r.stars)
        .ownedBy("user")
        .controllerOrScoped()
        .build(),
      OQL.Entity.newScoped<ProgressRow>("progress", progressRows, "Progress", "id")
        .sample({
          id = "";
          user = anyP;
          episodeId = 0;
          positionSeconds = 0;
          durationSeconds = 0;
          updatedAt = 0;
        })
        .payload("id", func r = r.id)
        .payload("user", func r = r.user)
        .payload("episodeId", func r = r.episodeId)
        .payload("positionSeconds", func r = r.positionSeconds)
        .payload("durationSeconds", func r = r.durationSeconds)
        .payload("updatedAt", func r = r.updatedAt)
        .ownedBy("user")
        .controllerOrScoped()
        .build(),
      // Internal watch analytics: controller-only (the agent answers over it,
      // end users never read it directly).
      OQL.Entity.manual<WatchCountRow>("watchCount", watchCountRows, "WatchCount", "titleId")
        .sample({ titleId = 0; count = 0 })
        .payload("titleId", func r = r.titleId)
        .payload("count", func r = r.count)
        .controllerOnly()
        .build(),
    ];
  });
  include ApiDocMixin();
};
