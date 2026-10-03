import { makeHomeFeed, makeTitle } from "@/__tests__/fixtures";
import { renderRoute } from "@/__tests__/renderRoute";
import { testState } from "@/__tests__/testState";
import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("HomePage", () => {
  it("renders the featured spotlight and the content rows", async () => {
    testState.backend.getHomeFeed.mockResolvedValue(
      makeHomeFeed({
        featured: [makeTitle({ id: 1n, title: "العمل المميز" })],
        mostWatched: [makeTitle({ id: 2n, title: "الأكثر مشاهدة" })],
        newlyAdded: [makeTitle({ id: 3n, title: "أضيف حديثاً" })],
        shortDramas: [makeTitle({ id: 4n, title: "مسلسل قصير" })],
        shortMovies: [makeTitle({ id: 5n, title: "فيلم قصير", kind: "movie" })],
      }),
    );

    renderRoute("/");

    const hero = await screen.findByTestId("hero.section");
    expect(hero).toBeInTheDocument();
    expect(hero).toHaveTextContent("العمل المميز");

    const mostWatched = await screen.findByTestId("row.most-watched");
    expect(
      within(mostWatched).getByRole("heading", {
        level: 2,
        name: "الأكثر مشاهدة",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("row.newly-added")).toBeInTheDocument();
    expect(screen.getByTestId("row.short-dramas")).toBeInTheDocument();
    expect(screen.getByTestId("row.short-movies")).toBeInTheDocument();

    expect(
      within(screen.getByTestId("row.newly-added")).getByRole("heading", {
        level: 2,
        name: "أضيف حديثاً",
      }),
    ).toBeInTheDocument();
  });

  it("shows the empty state when the catalogue has no content", async () => {
    testState.backend.getHomeFeed.mockResolvedValue({
      featured: [],
      mostWatched: [],
      newlyAdded: [],
      shortDramas: [],
      shortMovies: [],
    });

    renderRoute("/");

    expect(await screen.findByText("لا يوجد محتوى بعد")).toBeInTheDocument();
    expect(screen.queryByTestId("hero.section")).not.toBeInTheDocument();
  });

  it("renders clickable title cards that link to the details route", async () => {
    testState.backend.getHomeFeed.mockResolvedValue(
      makeHomeFeed({
        featured: [makeTitle({ id: 7n, title: "عمل قابل للنقر" })],
        mostWatched: [],
        newlyAdded: [],
        shortDramas: [],
        shortMovies: [],
      }),
    );

    renderRoute("/");

    const card = await screen.findByTestId("title.item.1");
    expect(card).toHaveAttribute("href", "/title/7");
  });

  it("shows the continue-watching row for a signed-in user with progress", async () => {
    testState.auth.isAuthenticated = true;
    testState.backend.getHomeFeed.mockResolvedValue(
      makeHomeFeed({
        featured: [makeTitle({ id: 1n, title: "عمل" })],
        mostWatched: [],
        newlyAdded: [],
        shortDramas: [],
        shortMovies: [],
      }),
    );
    testState.backend.listContinueWatching.mockResolvedValue([
      {
        title: makeTitle({ id: 1n, title: "حكاية الحي القديم" }),
        episode: {
          id: 101n,
          titleId: 1n,
          number: 1n,
          title: "البداية",
          durationSeconds: 600n,
          videoSource: "https://example.test/ep-1.mp4",
        },
        positionSeconds: 120n,
        durationSeconds: 600n,
        updatedAt: 1_700_000_000_000_000_000n,
      },
    ]);

    renderRoute("/");

    expect(
      await screen.findByTestId("row.continue-watching"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId("continue.item.1")).toBeInTheDocument(),
    );
  });
});
