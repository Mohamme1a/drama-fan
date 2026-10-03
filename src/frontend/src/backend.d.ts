import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export type ContentError = {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "invalidInput";
    invalidInput: string;
} | {
    __kind__: "notFound";
    notFound: null;
};
export interface ContinueWatchingItem {
    title: TitleView;
    positionSeconds: bigint;
    updatedAt: bigint;
    durationSeconds: bigint;
    episode: EpisodeView;
}
export interface EpisodeInput {
    title: string;
    durationSeconds: bigint;
    number: bigint;
    videoSource: string;
    titleId: bigint;
}
export interface EpisodeView {
    id: bigint;
    title: string;
    durationSeconds: bigint;
    number: bigint;
    videoSource: string;
    titleId: bigint;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface HomeFeed {
    newlyAdded: Array<TitleView>;
    featured: Array<TitleView>;
    shortMovies: Array<TitleView>;
    shortDramas: Array<TitleView>;
    mostWatched: Array<TitleView>;
}
export interface RatingSummary {
    count: bigint;
    average: number;
    userRating?: bigint;
}
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: ContentError;
};
export type Result_1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface TitleFilter {
    kind?: TitleType;
    searchTerm?: string;
    category?: string;
}
export interface TitleInput {
    title: string;
    kind: TitleType;
    published: boolean;
    description: string;
    coverImage: string;
    category: string;
    releaseYear: bigint;
}
export interface TitleView {
    id: bigint;
    title: string;
    ratingCount: bigint;
    episodeCount: bigint;
    kind: TitleType;
    published: boolean;
    description: string;
    averageRating: number;
    coverImage: string;
    category: string;
    releaseYear: bigint;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum TitleType {
    movie = "movie",
    drama = "drama"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFavorite(titleId: bigint): Promise<void>;
    adminCreateEpisode(input: EpisodeInput): Promise<bigint>;
    adminCreateTitle(input: TitleInput): Promise<bigint>;
    adminDeleteEpisode(id: bigint): Promise<Result>;
    adminDeleteTitle(id: bigint): Promise<Result>;
    adminListTitles(): Promise<Array<TitleView>>;
    adminSeedSampleContent(): Promise<void>;
    adminUpdateEpisode(id: bigint, input: EpisodeInput): Promise<Result>;
    adminUpdateTitle(id: bigint, input: TitleInput): Promise<Result>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result__1>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getHomeFeed(): Promise<HomeFeed>;
    getRatingSummary(titleId: bigint): Promise<RatingSummary>;
    getTitle(id: bigint): Promise<TitleView | null>;
    isCallerAdmin(): Promise<boolean>;
    listContinueWatching(): Promise<Array<ContinueWatchingItem>>;
    listEpisodes(titleId: bigint): Promise<Array<EpisodeView>>;
    listFavorites(): Promise<Array<TitleView>>;
    listTitles(filter: TitleFilter): Promise<Array<TitleView>>;
    rateTitle(titleId: bigint, stars: bigint): Promise<Result>;
    removeFavorite(titleId: bigint): Promise<void>;
    saveProgress(episodeId: bigint, positionSeconds: bigint, durationSeconds: bigint): Promise<void>;
    schema(): Promise<string>;
}
