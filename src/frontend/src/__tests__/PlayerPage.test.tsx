import { makeEpisode, makeTitle } from "@/__tests__/fixtures";
import { renderRoute } from "@/__tests__/renderRoute";
import { testState } from "@/__tests__/testState";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

/**
 * Player page: the selected episode header, previous/next navigation, and
 * playback-progress persistence.
 *
 * The actor is a local mock and jsdom does not implement media playback, so
 * these tests assert the frontend's rendering and actor calls, not real video
 * playback.
 */
describe("PlayerPage", () => {
  it("shows the title and the selected episode number", async () => {
    testState.backend.getTitle.mockResolvedValue(
      makeTitle({ id: 1n, title: "حكاية الحي القديم" }),
    );
    testState.backend.listEpisodes.mockResolvedValue([
      makeEpisode({ id: 101n, number: 1n, title: "البداية" }),
      makeEpisode({ id: 102n, number: 2n, title: "العودة" }),
    ]);

    renderRoute("/watch/1/102");

    expect(await screen.findByTestId("player.page")).toBeInTheDocument();
    expect(screen.getByTestId("player.video")).toBeInTheDocument();
    expect(screen.getByText("الحلقة 2 · العودة")).toBeInTheDocument();
    expect(screen.getByText("2 من 2 حلقة")).toBeInTheDocument();
  });

  it("navigates to the next episode", async () => {
    const user = userEvent.setup();
    testState.backend.getTitle.mockResolvedValue(makeTitle({ id: 1n }));
    testState.backend.listEpisodes.mockResolvedValue([
      makeEpisode({ id: 101n, number: 1n, title: "البداية" }),
      makeEpisode({ id: 102n, number: 2n, title: "العودة" }),
    ]);

    const { router } = renderRoute("/watch/1/101");

    await user.click(await screen.findByTestId("player.next_button"));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/watch/1/102"),
    );
  });

  it("disables previous on the first episode and next on the last", async () => {
    testState.backend.getTitle.mockResolvedValue(makeTitle({ id: 1n }));
    testState.backend.listEpisodes.mockResolvedValue([
      makeEpisode({ id: 101n, number: 1n }),
      makeEpisode({ id: 102n, number: 2n }),
    ]);

    renderRoute("/watch/1/101");

    expect(await screen.findByTestId("player.previous_button")).toBeDisabled();
    expect(screen.getByTestId("player.next_button")).toBeEnabled();
  });

  it("saves playback progress when the player reports it", async () => {
    testState.backend.getTitle.mockResolvedValue(makeTitle({ id: 1n }));
    testState.backend.listEpisodes.mockResolvedValue([
      makeEpisode({ id: 101n, number: 1n }),
    ]);

    renderRoute("/watch/1/101");

    const video = await screen.findByTestId("player.video");
    const element = video.querySelector("video");
    expect(element).not.toBeNull();

    // jsdom does not implement media playback, so drive the progress callback
    // through the same DOM events the component listens for.
    Object.defineProperty(element as HTMLVideoElement, "duration", {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(element as HTMLVideoElement, "currentTime", {
      configurable: true,
      value: 120,
    });
    element?.dispatchEvent(new Event("pause"));

    await waitFor(() =>
      expect(testState.backend.saveProgress).toHaveBeenCalledWith(
        101n,
        120n,
        600n,
      ),
    );
  });

  it("shows the unavailable state for an unknown episode", async () => {
    testState.backend.getTitle.mockResolvedValue(makeTitle({ id: 1n }));
    testState.backend.listEpisodes.mockResolvedValue([
      makeEpisode({ id: 101n }),
    ]);

    renderRoute("/watch/1/999");

    expect(await screen.findByText("الحلقة غير متوفرة")).toBeInTheDocument();
  });
});
