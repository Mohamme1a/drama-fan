import type { MockBackend } from "./mockBackend";
import { createMockBackend } from "./mockBackend";

/**
 * Mutable state shared between the global `vi.mock` factories in
 * `vitest.setup.ts` and the individual tests.
 *
 * The mock factories are hoisted and cannot close over test-local bindings, so
 * they read the current actor and auth state from here instead. Tests call the
 * setters before rendering.
 */

export interface MockAuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  isLoginError: boolean;
  loginError?: Error;
  isAdmin: boolean;
  isAdminLoading: boolean;
  principalText: string;
}

export const defaultAuthState: MockAuthState = {
  isAuthenticated: false,
  isInitializing: false,
  isLoggingIn: false,
  isLoginError: false,
  isAdmin: false,
  isAdminLoading: false,
  principalText: "2vxsx-fae",
};

export const testState: {
  backend: MockBackend;
  auth: MockAuthState;
  login: ReturnType<typeof import("vitest").vi.fn>;
  logout: ReturnType<typeof import("vitest").vi.fn>;
} = {
  backend: createMockBackend(),
  auth: { ...defaultAuthState },
  login: undefined as never,
  logout: undefined as never,
};

/** Reset the actor and auth state to safe defaults between tests. */
export function resetTestState(): void {
  testState.backend = createMockBackend();
  testState.auth = { ...defaultAuthState };
}
