import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { createIdentity } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

/**
 * PocketIC backend lane.
 *
 * Installs the app's own compiled wasm into the platform's replica and calls
 * the real public API, so a canister whose methods are unimplemented stubs
 * cannot pass. The runner skips this file entirely when no wasm or sidecar is
 * available; when it runs, a failure here is a real backend defect.
 *
 * The backend registers callers lazily: `_initialize_access_control` must be
 * called once by a signed-in (non-anonymous) caller before any role-guarded
 * call, and the first caller to initialize becomes the admin. The lane mirrors
 * that contract with deterministic identities.
 */

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

/** A full `TitleFilter` record: Candid requires every optional key present. */
const NO_FILTER = { kind: [], searchTerm: [], category: [] } as const;

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

/** The first caller to initialize becomes the admin. */
const admin = createIdentity("drama-fan-admin");
/** A second registered caller receives the default `user` role. */
const viewer = createIdentity("drama-fan-viewer");

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
    sender: admin.getPrincipal(),
  }));

  // Register the admin first so the admin API is reachable.
  actor.setIdentity(admin);
  await actor._initialize_access_control();
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers empty-state reads instead of trapping", async () => {
  await expect(actor.getHomeFeed()).resolves.toBeDefined();
  await expect(actor.listTitles(NO_FILTER)).resolves.toBeDefined();
  await expect(actor.getTitle(999n)).resolves.toEqual([]);
  await expect(actor.listEpisodes(999n)).resolves.toEqual([]);
});

it("seeds the Arabic sample catalogue on install", async () => {
  const titles = await actor.listTitles(NO_FILTER);
  expect(titles.length).toBeGreaterThan(0);
  expect(titles.every((title) => title.published)).toBe(true);
});

it("round-trips a title through the real canister", async () => {
  actor.setIdentity(admin);
  const id = await actor.adminCreateTitle({
    title: "حكاية الحي القديم",
    description: "دراما قصيرة عن عائلة تعود إلى حيها القديم.",
    category: "دراما عائلية",
    kind: { drama: null },
    coverImage: "https://example.test/cover.jpg",
    releaseYear: 2024n,
    published: true,
  });

  const titles = await actor.listTitles(NO_FILTER);
  expect(titles).toContainEqual(
    expect.objectContaining({ id, title: "حكاية الحي القديم" }),
  );

  const fetched = await actor.getTitle(id);
  expect(fetched).toHaveLength(1);
  expect(fetched[0]).toMatchObject({ id, title: "حكاية الحي القديم" });
});

it("adds an episode that appears in the title's episode list", async () => {
  actor.setIdentity(admin);
  const titleId = await actor.adminCreateTitle({
    title: "عمل بحلقات",
    description: "وصف",
    category: "كوميديا",
    kind: { drama: null },
    coverImage: "",
    releaseYear: 2024n,
    published: true,
  });

  const episodeId = await actor.adminCreateEpisode({
    titleId,
    title: "البداية",
    number: 1n,
    durationSeconds: 600n,
    videoSource: "https://example.test/ep-1.mp4",
  });

  const episodes = await actor.listEpisodes(titleId);
  expect(episodes).toContainEqual(
    expect.objectContaining({ id: episodeId, number: 1n, title: "البداية" }),
  );
});

it("rejects an anonymous caller from the admin API", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(
    guest.adminCreateTitle({
      title: "غير مصرح",
      description: "",
      category: "كوميديا",
      kind: { drama: null },
      coverImage: "",
      releaseYear: 2024n,
      published: true,
    }),
  ).rejects.toThrow();
});

it("rejects an anonymous caller from the per-user library", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(guest.listFavorites()).rejects.toThrow();
});

it("keeps one caller's favorites separate from another's", async () => {
  actor.setIdentity(admin);
  const titleId = await actor.adminCreateTitle({
    title: "عمل للمفضلة",
    description: "وصف",
    category: "كوميديا",
    kind: { drama: null },
    coverImage: "",
    releaseYear: 2024n,
    published: true,
  });

  // Register the second caller so it is no longer anonymous.
  actor.setIdentity(viewer);
  await actor._initialize_access_control();

  actor.setIdentity(admin);
  await actor.addFavorite(titleId);
  expect(await actor.listFavorites()).toHaveLength(1);

  actor.setIdentity(viewer);
  expect(await actor.listFavorites()).toEqual([]);
});

it("persists a rating and reports it in the summary", async () => {
  actor.setIdentity(admin);
  const titleId = await actor.adminCreateTitle({
    title: "عمل للتقييم",
    description: "وصف",
    category: "كوميديا",
    kind: { drama: null },
    coverImage: "",
    releaseYear: 2024n,
    published: true,
  });

  await actor.rateTitle(titleId, 5n);
  const summary = await actor.getRatingSummary(titleId);
  expect(summary.count).toBe(1n);
  expect(summary.average).toBeCloseTo(5);
  expect(summary.userRating).toEqual([5n]);
});

it("saves playback progress and lists it in continue watching", async () => {
  actor.setIdentity(admin);
  const titleId = await actor.adminCreateTitle({
    title: "عمل للمتابعة",
    description: "وصف",
    category: "كوميديا",
    kind: { drama: null },
    coverImage: "",
    releaseYear: 2024n,
    published: true,
  });
  const episodeId = await actor.adminCreateEpisode({
    titleId,
    title: "البداية",
    number: 1n,
    durationSeconds: 600n,
    videoSource: "https://example.test/ep-1.mp4",
  });

  await actor.saveProgress(episodeId, 120n, 600n);

  const items = await actor.listContinueWatching();
  expect(items).toContainEqual(
    expect.objectContaining({
      positionSeconds: 120n,
      durationSeconds: 600n,
      episode: expect.objectContaining({ id: episodeId }),
    }),
  );
});
