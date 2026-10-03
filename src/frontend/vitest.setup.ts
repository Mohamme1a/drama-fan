import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { resetTestState, testState } from "./src/__tests__/testState";

/**
 * Generated components expose `data-ocid` markers rather than semantic test
 * ids, so map Testing Library's `getByTestId` onto that attribute once.
 */
configure({ testIdAttribute: "data-ocid" });

/**
 * jsdom does not implement `ResizeObserver`, which Radix UI primitives (the
 * admin form's `Switch`, dialogs) use for layout measurement. A no-op stub
 * keeps those components mountable without changing their behavior.
 */
if (!("ResizeObserver" in globalThis)) {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}

/**
 * Global seams for the frontend suite.
 *
 * `@caffeineai/core-infrastructure` owns the actor and Internet Identity
 * session; both are replaced with local, typed stand-ins so no test reaches a
 * canister or the network. `@/backend`'s `createActor` is replaced with the
 * same mock so the actor the hooks receive is the one the test configured.
 */
vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: testState.backend, isFetching: false }),
  useInternetIdentity: () => ({
    identity: {
      getPrincipal: () => ({ toText: () => testState.auth.principalText }),
    },
    login: testState.login,
    clear: testState.logout,
    loginStatus: testState.auth.isAuthenticated ? "success" : "idle",
    isInitializing: testState.auth.isInitializing,
    isLoginIdle: !testState.auth.isAuthenticated,
    isLoggingIn: testState.auth.isLoggingIn,
    isLoginSuccess: testState.auth.isAuthenticated,
    isLoginError: testState.auth.isLoginError,
    isSessionExpired: false,
    isAuthenticated: testState.auth.isAuthenticated,
    loginError: testState.auth.loginError,
  }),
  InternetIdentityProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

vi.mock("@/backend", () => ({
  createActor: () => testState.backend,
  TitleType: { movie: "movie", drama: "drama" },
  UserRole: { admin: "admin", user: "user", guest: "guest" },
}));

beforeEach(() => {
  resetTestState();
  testState.login = vi.fn();
  testState.logout = vi.fn();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "";
});
