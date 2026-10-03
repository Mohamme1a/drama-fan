import {
  makeEpisode,
  makeRatingSummary,
  makeTitle,
} from "@/__tests__/fixtures";
import { renderRoute } from "@/__tests__/renderRoute";
import { testState } from "@/__tests__/testState";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

/**
 * Title details page: cover, description, episode list, favorite toggle, and
 * star rating.
 *
 * The actor is a local mock; these tests assert the frontend's rendering and
 * the actor calls it makes, not the real backend's behavior.
 */
describe("TitleDetailsPage", () => {
  it("renders the cover, description, and numbered episode list", async () => {
    testState.backend.getTitle.mockResolvedValue(
      makeTitle({
        id: 1n,
        title: "حكاية الحي القديم",
        description: "دراما قصيرة عن عائلة تعود إلى حيها القديم.",
      }),
    );
    testState.backend.listEpisodes.mockResolvedValue([
      makeEpisode({ id: 101n, number: 1n, title: "البداية" }),
      makeEpisode({ id: 102n, number: 2n, title: "العودة" }),
    ]);
    testState.backend.getRatingSummary.mockResolvedValue(
      makeRatingSummary({ average: 4.2, count: 12n }),
    );

    renderRoute("/title/1");

    expect(await screen.findByTestId("title.page")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "غلاف حكاية الحي القديم" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("دراما قصيرة عن عائلة تعود إلى حيها القديم."),
    ).toBeInTheDocument();

    const episodes = await screen.findByTestId("episodes.list");
    expect(episodes).toHaveTextContent("البداية");
    expect(episodes).toHaveTextContent("العودة");
    expect(screen.getByTestId("episodes.item.1")).toHaveAttribute(
      "href",
      "/watch/1/101",
    );
  });

  it("adds the title to favorites when the toggle is pressed", async () => {
    const user = userEvent.setup();
    testState.auth.isAuthenticated = true;
    testState.backend.getTitle.mockResolvedValue(makeTitle({ id: 1n }));
    testState.backend.listEpisodes.mockResolvedValue([makeEpisode()]);
    testState.backend.listFavorites.mockResolvedValue([]);

    renderRoute("/title/1");

    const toggle = await screen.findByTestId("favorite.toggle");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);

    await waitFor(() =>
      expect(testState.backend.addFavorite).toHaveBeenCalledWith(1n),
    );
  });

  it("removes the title from favorites when already saved", async () => {
    const user = userEvent.setup();
    testState.auth.isAuthenticated = true;
    testState.backend.getTitle.mockResolvedValue(makeTitle({ id: 1n }));
    testState.backend.listEpisodes.mockResolvedValue([makeEpisode()]);
    testState.backend.listFavorites.mockResolvedValue([makeTitle({ id: 1n })]);

    renderRoute("/title/1");

    const toggle = await screen.findByTestId("favorite.toggle");
    await waitFor(() => expect(toggle).toHaveAttribute("aria-pressed", "true"));

    await user.click(toggle);

    await waitFor(() =>
      expect(testState.backend.removeFavorite).toHaveBeenCalledWith(1n),
    );
  });

  it("rates the title and updates the displayed average", async () => {
    const user = userEvent.setup();
    testState.backend.getTitle.mockResolvedValue(
      makeTitle({ id: 1n, averageRating: 3 }),
    );
    testState.backend.listEpisodes.mockResolvedValue([makeEpisode()]);
    testState.backend.getRatingSummary
      .mockResolvedValueOnce(makeRatingSummary({ average: 3, count: 10n }))
      .mockResolvedValue(
        makeRatingSummary({ average: 4.5, count: 11n, userRating: 5n }),
      );

    renderRoute("/title/1");

    await screen.findByTestId("title.rating_section");
    await user.click(await screen.findByTestId("rating.star.5"));

    await waitFor(() =>
      expect(testState.backend.rateTitle).toHaveBeenCalledWith(1n, 5n),
    );
    await waitFor(() =>
      expect(screen.getByTestId("title.rating_section")).toHaveTextContent(
        "4.5",
      ),
    );
  });

  it("shows the empty state when the title does not exist", async () => {
    testState.backend.getTitle.mockResolvedValue(null);

    renderRoute("/title/999");

    expect(await screen.findByText("العمل غير موجود")).toBeInTheDocument();
  });
});
