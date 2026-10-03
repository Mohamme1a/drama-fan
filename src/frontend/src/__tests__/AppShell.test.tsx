import { makeHomeFeed, makeTitle } from "@/__tests__/fixtures";
import { renderRoute } from "@/__tests__/renderRoute";
import { testState } from "@/__tests__/testState";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("app shell", () => {
  it("renders the four bottom navigation tabs in Arabic", async () => {
    testState.backend.getHomeFeed.mockResolvedValue(
      makeHomeFeed({ featured: [makeTitle()] }),
    );

    renderRoute("/");

    const nav = await screen.findByTestId("bottom_nav");
    expect(nav).toHaveAttribute("aria-label", "التنقل الرئيسي");

    for (const label of ["الرئيسية", "البحث", "المفضلة", "حسابي"]) {
      expect(
        within(nav).getByRole("link", { name: label }),
      ).toBeInTheDocument();
    }
  });

  it("switches to the search tab when its nav link is clicked", async () => {
    const user = userEvent.setup();
    testState.backend.getHomeFeed.mockResolvedValue(
      makeHomeFeed({ featured: [makeTitle()] }),
    );
    testState.backend.listTitles.mockResolvedValue([]);

    renderRoute("/");

    const nav = await screen.findByTestId("bottom_nav");
    await user.click(within(nav).getByRole("link", { name: "البحث" }));

    expect(await screen.findByTestId("search.page")).toBeInTheDocument();
    expect(screen.getByTestId("search.input")).toBeInTheDocument();
  });

  it("switches to the favorites tab when its nav link is clicked", async () => {
    const user = userEvent.setup();
    testState.backend.getHomeFeed.mockResolvedValue(
      makeHomeFeed({ featured: [makeTitle()] }),
    );

    renderRoute("/");

    await user.click(await screen.findByRole("link", { name: "المفضلة" }));

    expect(await screen.findByTestId("favorites.page")).toBeInTheDocument();
  });

  it("switches to the profile tab when its nav link is clicked", async () => {
    const user = userEvent.setup();
    testState.backend.getHomeFeed.mockResolvedValue(
      makeHomeFeed({ featured: [makeTitle()] }),
    );

    renderRoute("/");

    await user.click(await screen.findByRole("link", { name: "حسابي" }));

    expect(await screen.findByTestId("profile.page")).toBeInTheDocument();
  });

  it("renders the app header with the wordmark and a theme toggle", async () => {
    testState.backend.getHomeFeed.mockResolvedValue(
      makeHomeFeed({ featured: [makeTitle()] }),
    );

    renderRoute("/");

    expect(await screen.findByTestId("header.home_link")).toBeInTheDocument();
    expect(screen.getByTestId("theme.toggle")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("drama fan")).toBeInTheDocument(),
    );
  });
});
