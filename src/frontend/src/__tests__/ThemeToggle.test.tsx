import { renderWithProviders } from "@/__tests__/renderRoute";
import { ThemeToggle } from "@/components/ThemeToggle";
import { THEME_STORAGE_KEY } from "@/lib/constants";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

/**
 * Dark/light theme: the toggle flips the document root class and persists the
 * preference, and a fresh mount restores the stored value.
 *
 * This exercises the real `useTheme` hook and `ThemeProvider`; only the actor
 * and Internet Identity seams are mocked globally.
 */
describe("theme toggle", () => {
  it("defaults to dark and applies the dark class", async () => {
    renderWithProviders(<ThemeToggle />);

    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("toggles to light and persists the preference", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeToggle />);

    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));

    await user.click(screen.getByTestId("theme.toggle"));

    await waitFor(() =>
      expect(document.documentElement).not.toHaveClass("dark"),
    );
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("restores a stored light preference on mount", async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");

    renderWithProviders(<ThemeToggle />);

    await waitFor(() =>
      expect(document.documentElement).not.toHaveClass("dark"),
    );
    expect(
      screen.getByRole("button", { name: "التبديل إلى الوضع الداكن" }),
    ).toBeInTheDocument();
  });
});
