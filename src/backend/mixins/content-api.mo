/// Public content API: catalogue browsing, per-user library, and admin
/// management. State is injected by the composition root.
import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/content";
import ContentLib "../lib/content";

mixin (
  accessControlState : AccessControl.AccessControlState,
  titles : Map.Map<Nat, Types.Title>,
  episodes : Map.Map<Nat, Types.Episode>,
  favorites : Map.Map<Principal, Set.Set<Nat>>,
  ratings : Map.Map<Nat, Map.Map<Principal, Nat>>,
  progress : Map.Map<Principal, Map.Map<Nat, Types.Progress>>,
  watchCounts : Map.Map<Nat, Nat>,
  state : Types.ContentState,
) {
  // ---- Authorization helpers ----

  func requireSignedIn(caller : Principal) : () {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in required");
    };
  };

  func requireAdmin(caller : Principal) : () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Admin access required");
    };
  };

  // ---- Catalogue browsing (public) ----

  public query func listTitles(filter : Types.TitleFilter) : async [Types.TitleView] {
    ContentLib.listTitles(titles, episodes, ratings, filter);
  };

  public query func getTitle(id : Nat) : async ?Types.TitleView {
    ContentLib.getTitle(titles, episodes, ratings, id);
  };

  public query func listEpisodes(titleId : Nat) : async [Types.EpisodeView] {
    ContentLib.listEpisodes(episodes, titleId);
  };

  public query func getHomeFeed() : async Types.HomeFeed {
    ContentLib.homeFeed(titles, episodes, ratings, watchCounts);
  };

  public query ({ caller }) func getRatingSummary(titleId : Nat) : async Types.RatingSummary {
    ContentLib.getRatingSummary(ratings, titleId, caller);
  };

  // ---- Per-user library (signed-in) ----

  public shared ({ caller }) func addFavorite(titleId : Nat) : async () {
    requireSignedIn(caller);
    ContentLib.addFavorite(favorites, caller, titleId);
  };

  public shared ({ caller }) func removeFavorite(titleId : Nat) : async () {
    requireSignedIn(caller);
    ContentLib.removeFavorite(favorites, caller, titleId);
  };

  public query ({ caller }) func listFavorites() : async [Types.TitleView] {
    requireSignedIn(caller);
    ContentLib.listFavorites(favorites, titles, episodes, ratings, caller);
  };

  public shared ({ caller }) func rateTitle(titleId : Nat, stars : Nat) : async Result.Result<(), Types.ContentError> {
    requireSignedIn(caller);
    ContentLib.rateTitle(ratings, titleId, caller, stars);
  };

  public shared ({ caller }) func saveProgress(episodeId : Nat, positionSeconds : Nat, durationSeconds : Nat) : async () {
    requireSignedIn(caller);
    ContentLib.saveProgress(progress, watchCounts, episodes, caller, episodeId, positionSeconds, durationSeconds);
  };

  public query ({ caller }) func listContinueWatching() : async [Types.ContinueWatchingItem] {
    requireSignedIn(caller);
    ContentLib.listContinueWatching(progress, titles, episodes, ratings, caller);
  };

  // ---- Admin management (admin only) ----

  public query ({ caller }) func adminListTitles() : async [Types.TitleView] {
    requireAdmin(caller);
    ContentLib.listAllTitles(titles, episodes, ratings);
  };

  public shared ({ caller }) func adminCreateTitle(input : Types.TitleInput) : async Nat {
    requireAdmin(caller);
    ContentLib.createTitle(titles, state, input);
  };

  public shared ({ caller }) func adminUpdateTitle(id : Nat, input : Types.TitleInput) : async Result.Result<(), Types.ContentError> {
    requireAdmin(caller);
    ContentLib.updateTitle(titles, id, input);
  };

  public shared ({ caller }) func adminDeleteTitle(id : Nat) : async Result.Result<(), Types.ContentError> {
    requireAdmin(caller);
    ContentLib.deleteTitle(titles, episodes, id);
  };

  public shared ({ caller }) func adminCreateEpisode(input : Types.EpisodeInput) : async Nat {
    requireAdmin(caller);
    ContentLib.createEpisode(episodes, state, input);
  };

  public shared ({ caller }) func adminUpdateEpisode(id : Nat, input : Types.EpisodeInput) : async Result.Result<(), Types.ContentError> {
    requireAdmin(caller);
    ContentLib.updateEpisode(episodes, id, input);
  };

  public shared ({ caller }) func adminDeleteEpisode(id : Nat) : async Result.Result<(), Types.ContentError> {
    requireAdmin(caller);
    ContentLib.deleteEpisode(episodes, id);
  };

  public shared ({ caller }) func adminSeedSampleContent() : async () {
    requireAdmin(caller);
    ContentLib.seedSampleContent(titles, episodes, state);
  };
};
