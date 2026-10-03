import { makeTitle } from "@/__tests__/fixtures";
import { renderRoute } from "@/__tests__/renderRoute";
import { testState } from "@/__tests__/testState";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

/**
 * Admin dashboard: the role gate, the title list, and creating a title.
 *
 * The actor and Internet Identity session are local mocks; these tests assert
 * the frontend's gating and the actor calls it makes, not the real backend's
 * authorization or persistence.
 */
describe("AdminPage", () => {
  it("requires sign-in for a signed-out visitor", async () => {
    renderRoute("/admin");

    expect(await screen.findByTestId("admin.page")).toBeInTheDocument();
    expect(screen.getByText("تسجيل الدخول مطلوب")).toBeInTheDocument();
    expect(screen.getByTestId("admin.login_button")).toBeInTheDocument();
    expect(
      screen.queryByTestId("admin.add_title_button"),
    ).not.toBeInTheDocument();
  });

  it("denies a signed-in non-admin user", async () => {
    testState.auth.isAuthenticated = true;
    testState.backend.isCallerAdmin.mockResolvedValue(false);

    renderRoute("/admin");

    expect(await screen.findByText("غير مصرح")).toBeInTheDocument();
    expect(
      screen.queryByTestId("admin.add_title_button"),
    ).not.toBeInTheDocument();
    expect(testState.backend.adminListTitles).not.toHaveBeenCalled();
  });

  it("lists every title for an admin", async () => {
    testState.auth.isAuthenticated = true;
    testState.backend.isCallerAdmin.mockResolvedValue(true);
    testState.backend.adminListTitles.mockResolvedValue([
      makeTitle({ id: 1n, title: "حكاية الحي القديم" }),
      makeTitle({ id: 2n, title: "ليلة في المدينة", published: false }),
    ]);

    renderRoute("/admin");

    expect(await screen.findByTestId("admin.title_list")).toBeInTheDocument();
    expect(screen.getByText("حكاية الحي القديم")).toBeInTheDocument();
    expect(screen.getByText("ليلة في المدينة")).toBeInTheDocument();
    expect(screen.getByText("مسودة")).toBeInTheDocument();
  });

  it("creates a title through the admin API", async () => {
    const user = userEvent.setup();
    testState.auth.isAuthenticated = true;
    testState.backend.isCallerAdmin.mockResolvedValue(true);
    testState.backend.adminListTitles.mockResolvedValue([]);

    renderRoute("/admin");

    await user.click(await screen.findByTestId("admin.add_title_button"));
    await user.type(await screen.findByTestId("admin.title_input"), "عمل جديد");
    await user.click(screen.getByTestId("admin.title_submit_button"));

    await waitFor(() =>
      expect(testState.backend.adminCreateTitle).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "عمل جديد",
          category: "دراما رومانسية",
          kind: "drama",
          published: true,
        }),
      ),
    );
  });

  it("confirms before deleting a title", async () => {
    const user = userEvent.setup();
    testState.auth.isAuthenticated = true;
    testState.backend.isCallerAdmin.mockResolvedValue(true);
    testState.backend.adminListTitles.mockResolvedValue([
      makeTitle({ id: 1n, title: "حكاية الحي القديم" }),
    ]);

    renderRoute("/admin");

    await user.click(await screen.findByTestId("admin.delete_button.1"));
    expect(
      await screen.findByTestId("admin.confirm_dialog"),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("admin.confirm_button"));

    await waitFor(() =>
      expect(testState.backend.adminDeleteTitle).toHaveBeenCalledWith(1n),
    );
  });
});
