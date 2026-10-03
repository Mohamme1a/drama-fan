import { createActor } from "@/backend";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/**
 * Internet Identity session plus the caller's admin role.
 *
 * `isAuthenticated` covers both an interactive login and a restored session.
 * The admin flag is only queried once the user is authenticated.
 */
export function useAuth() {
  const {
    identity,
    login,
    clear,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    isLoginError,
    loginError,
  } = useInternetIdentity();

  const { actor, isFetching } = useActor(createActor);

  const adminQuery = useQuery({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });

  return {
    identity,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    isLoginError,
    loginError,
    login,
    logout: clear,
    isAdmin: adminQuery.data ?? false,
    isAdminLoading: adminQuery.isLoading,
  };
}
