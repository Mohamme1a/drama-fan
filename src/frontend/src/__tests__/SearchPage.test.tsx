import { makeTitle } from "@/__tests__/fixtures";
import { renderRoute } from "@/__tests__/renderRoute";
import { testState } from "@/__tests__/testState";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

/**
 * Search page: instant results, the no-results state, and URL-persisted
 * category/kind filters.
 *
 * The actor is a local mock, so these tests assert the frontend's request and
 * render behavior, not the real backend's search semantics.
 */
describe("SearchPage", () => {
  it("shows matching results for a search term", async () => {
    testState.backend.listTitles.mockResolvedValue([
      makeTitle({ id: 1n, title: "حكاية الحي القديم" }),
    ]);

    renderRoute("/search?q=حكاية");

    expect(await screen.findByTestId("search.results")).toBeInTheDocument();
    expect(screen.getByText("حكاية الحي القديم")).toBeInTheDocument();
    expect(screen.getByText("1 نتيجة")).toBeInTheDocument();
  });

  it("shows the no-results state for a nonsense query", async () => {
    testState.backend.listTitles.mockResolvedValue([]);

    renderRoute("/search?q=ززززز");

    expect(await screen.findByText("لا توجد نتائج")).toBeInTheDocument();
    expect(screen.queryByTestId("search.results")).not.toBeInTheDocument();
  });

  it("passes the URL category and kind filters to the actor", async () => {
    testState.backend.listTitles.mockResolvedValue([]);

    renderRoute("/search?category=كوميديا&kind=movie");

    await waitFor(() =>
      expect(testState.backend.listTitles).toHaveBeenCalledWith(
        expect.objectContaining({ category: "كوميديا", kind: "movie" }),
      ),
    );
  });

  it("persists a category chip selection in the URL", async () => {
    const user = userEvent.setup();
    testState.backend.listTitles.mockResolvedValue([]);

    const { router } = renderRoute("/search");

    await user.click(await screen.findByTestId("filter.category.4"));

    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({
        category: "كوميديا",
      }),
    );
    expect(testState.backend.listTitles).toHaveBeenCalledWith(
      expect.objectContaining({ category: "كوميديا" }),
    );
  });

  it("clears the search and filters from the no-results state", async () => {
    const user = userEvent.setup();
    testState.backend.listTitles.mockResolvedValue([]);

    const { router } = renderRoute("/search?q=زززز&category=كوميديا");

    await user.click(await screen.findByTestId("search.reset_button"));

    await waitFor(() =>
      expect(router.state.location.search).not.toMatchObject({
        q: "زززز",
      }),
    );
  });
});
