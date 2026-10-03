import { makeContinueWatching, makeTitle } from "@/__tests__/fixtures";
import { renderRoute } from "@/__tests__/renderRoute";
import { testState } from "@/__tests__/testState";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

/**
 * Profile page: identity card, stats, continue-watching section, and the
 * Internet Identity sign-in prompt.
 *
 * The actor and Internet Identity session are local mocks; these tests assert
 * the frontend's rendering and the login callback, not a real II flow.
 */
describe("ProfilePage", () => {
  it("shows the guest identity and a sign-in prompt when signed out", async () => {
    renderRoute("/profile");

    expect(await screen.findByTestId("profile.page")).toBeInTheDocument();
    expect(screen.getByTestId("profile.display_name")).toHaveTextContent(
      "زائر",
    );
    expect(
      screen.getByTestId("profile.login_prompt_button"),
    ).toBeInTheDocument();
  });

  it("calls login when the sign-in prompt is pressed", async () => {
    const user = userEvent.setup();
    renderRoute("/profile");

    await user.click(await screen.findByTestId("profile.login_prompt_button"));

    expect(testState.login).toHaveBeenCalledTimes(1);
  });

  it("shows the display name, stats, and continue-watching list when signed in", async () => {
    testState.auth.isAuthenticated = true;
    testState.auth.principalText = "abcdefghijklmnop";
    testState.backend.listFavorites.mockResolvedValue([makeTitle({ id: 1n })]);
    testState.backend.listContinueWatching.mockResolvedValue([
      makeContinueWatching(),
    ]);
    testState.backend.getRatingSummary.mockResolvedValue({
      average: 4,
      count: 3n,
      userRating: 4n,
    });

    renderRoute("/profile");

    expect(await screen.findByTestId("profile.display_name")).toHaveTextContent(
      "abcde…mnop",
    );
    // The stat card renders a loading placeholder until the favorites and
    // rating queries settle, so wait for the resolved count rather than
    // reading the card synchronously.
    await waitFor(() =>
      expect(screen.getByTestId("profile.stat.favorites")).toHaveTextContent(
        "1",
      ),
    );
    expect(
      await screen.findByTestId("profile.continue_watching"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("profile.continue.item.1")).toBeInTheDocument();
  });

  it("shows the empty continue-watching state when there is no progress", async () => {
    testState.auth.isAuthenticated = true;
    testState.backend.listFavorites.mockResolvedValue([]);
    testState.backend.listContinueWatching.mockResolvedValue([]);

    renderRoute("/profile");

    expect(
      await screen.findByText("لا يوجد ما تتابعه حالياً"),
    ).toBeInTheDocument();
  });

  it("logs out when the logout button is pressed", async () => {
    const user = userEvent.setup();
    testState.auth.isAuthenticated = true;
    testState.backend.listFavorites.mockResolvedValue([]);
    testState.backend.listContinueWatching.mockResolvedValue([]);

    renderRoute("/profile");

    await user.click(await screen.findByTestId("profile.logout_button"));

    expect(testState.logout).toHaveBeenCalledTimes(1);
  });

  it("counts only titles carrying the caller's own rating", async () => {
    testState.auth.isAuthenticated = true;
    testState.backend.listFavorites.mockResolvedValue([
      makeTitle({ id: 1n }),
      makeTitle({ id: 2n }),
    ]);
    testState.backend.listContinueWatching.mockResolvedValue([]);
    // One favorite has a user rating, the other does not.
    testState.backend.getRatingSummary.mockImplementation(async (id) =>
      id === 1n
        ? { average: 4, count: 3n, userRating: 4n }
        : { average: 0, count: 0n },
    );

    renderRoute("/profile");

    await waitFor(() =>
      expect(screen.getByTestId("profile.stat.rated")).toHaveTextContent("1"),
    );
    expect(testState.backend.getRatingSummary).toHaveBeenCalledWith(1n);
    expect(testState.backend.getRatingSummary).toHaveBeenCalledWith(2n);
  });

  it("shows the admin link only for an admin caller", async () => {
    testState.auth.isAuthenticated = true;
    testState.backend.isCallerAdmin.mockResolvedValue(true);
    testState.backend.listFavorites.mockResolvedValue([]);
    testState.backend.listContinueWatching.mockResolvedValue([]);

    renderRoute("/profile");

    expect(await screen.findByTestId("profile.admin_link")).toHaveAttribute(
      "href",
      "/admin",
    );
  });

  it("hides the admin link for a non-admin caller", async () => {
    testState.auth.isAuthenticated = true;
    testState.backend.isCallerAdmin.mockResolvedValue(false);
    testState.backend.listFavorites.mockResolvedValue([]);
    testState.backend.listContinueWatching.mockResolvedValue([]);

    renderRoute("/profile");

    await screen.findByTestId("profile.header");
    expect(screen.queryByTestId("profile.admin_link")).not.toBeInTheDocument();
  });

  it("toggles the theme from the profile header", async () => {
    const user = userEvent.setup();
    testState.auth.isAuthenticated = true;
    testState.backend.listFavorites.mockResolvedValue([]);
    testState.backend.listContinueWatching.mockResolvedValue([]);

    renderRoute("/profile");

    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
    await user.click(await screen.findByTestId("profile.theme_toggle"));

    await waitFor(() =>
      expect(document.documentElement).not.toHaveClass("dark"),
    );
  });

  it("renders continue-watching progress and a resume link", async () => {
    testState.auth.isAuthenticated = true;
    testState.backend.listFavorites.mockResolvedValue([]);
    testState.backend.listContinueWatching.mockResolvedValue([
      makeContinueWatching({
        title: makeTitle({ id: 7n, title: "حكاية الحي القديم" }),
        episode: {
          id: 101n,
          titleId: 7n,
          number: 2n,
          title: "العودة",
          durationSeconds: 600n,
          videoSource: "https://example.test/ep-2.mp4",
        },
        positionSeconds: 150n,
        durationSeconds: 600n,
      }),
    ]);

    renderRoute("/profile");

    const item = await screen.findByTestId("profile.continue.item.1");
    expect(item).toHaveAttribute("href", "/watch/7/101");
    expect(item).toHaveTextContent("الحلقة 2 · العودة");

    const progress = within(item).getByRole("progressbar");
    // 150 / 600 = 25%.
    expect(progress).toHaveAttribute("aria-valuenow", "25");
    expect(item).toHaveTextContent("02:30");
  });
});
