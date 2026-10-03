import { makeTitle } from "@/__tests__/fixtures";
import { renderRoute } from "@/__tests__/renderRoute";
import { testState } from "@/__tests__/testState";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

/**
 * Favorites page: the signed-in user's saved titles and their removal.
 *
 * The actor is a local mock; these tests assert the frontend's rendering and
 * the actor calls it makes, not the real backend's persistence.
 */
describe("FavoritesPage", () => {
  it("prompts signed-out visitors to sign in", async () => {
    renderRoute("/favorites");

    expect(
      await screen.findByText("سجّل الدخول لعرض المفضلة"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("favorites.login_button")).toBeInTheDocument();
  });

  it("lists saved titles for a signed-in user", async () => {
    testState.auth.isAuthenticated = true;
    testState.backend.listFavorites.mockResolvedValue([
      makeTitle({ id: 1n, title: "حكاية الحي القديم" }),
      makeTitle({ id: 2n, title: "ليلة في المدينة" }),
    ]);

    renderRoute("/favorites");

    expect(await screen.findByText("حكاية الحي القديم")).toBeInTheDocument();
    expect(screen.getByText("ليلة في المدينة")).toBeInTheDocument();
    expect(screen.getByText("2 عمل")).toBeInTheDocument();
  });

  it("removes a title from favorites", async () => {
    const user = userEvent.setup();
    testState.auth.isAuthenticated = true;
    testState.backend.listFavorites.mockResolvedValue([
      makeTitle({ id: 1n, title: "حكاية الحي القديم" }),
    ]);

    renderRoute("/favorites");

    await user.click(await screen.findByTestId("favorites.remove_button.1"));

    await waitFor(() =>
      expect(testState.backend.removeFavorite).toHaveBeenCalledWith(1n),
    );
  });

  it("shows the empty state when there are no saved titles", async () => {
    testState.auth.isAuthenticated = true;
    testState.backend.listFavorites.mockResolvedValue([]);

    renderRoute("/favorites");

    expect(await screen.findByText("لا توجد أعمال محفوظة")).toBeInTheDocument();
  });
});
