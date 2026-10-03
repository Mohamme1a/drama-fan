import { Layout } from "@/components/Layout";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AdminPage } from "@/pages/AdminPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { HomePage } from "@/pages/HomePage";
import { PlayerPage } from "@/pages/PlayerPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SearchPage } from "@/pages/SearchPage";
import type { SearchPageParams } from "@/pages/SearchPage";
import { TitleDetailsPage } from "@/pages/TitleDetailsPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactElement } from "react";

/**
 * Test router mirroring the production route tree in `App.tsx`.
 *
 * The app builds its router at module scope, so tests construct an equivalent
 * tree with an in-memory history to drive real navigation and URL search state.
 */
function buildTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <Layout>
        <Outlet />
      </Layout>
    ),
  });

  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomePage,
  });

  const searchRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/search",
    validateSearch: (search: Record<string, unknown>): SearchPageParams => ({
      q: typeof search.q === "string" ? search.q : undefined,
      category:
        typeof search.category === "string" ? search.category : undefined,
      kind:
        search.kind === "drama" || search.kind === "movie"
          ? search.kind
          : undefined,
    }),
    component: SearchPage,
  });

  const favoritesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/favorites",
    component: FavoritesPage,
  });

  const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/profile",
    component: ProfilePage,
  });

  const titleRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/title/$id",
    component: TitleDetailsPage,
  });

  const watchRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/watch/$titleId/$episodeId",
    component: PlayerPage,
  });

  const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/admin",
    component: AdminPage,
  });

  const routeTree = rootRoute.addChildren([
    homeRoute,
    searchRoute,
    favoritesRoute,
    profileRoute,
    titleRoute,
    watchRoute,
    adminRoute,
  ]);

  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

/** A fresh QueryClient per render so cached queries never leak between tests. */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export interface RenderRouteResult extends RenderResult {
  router: ReturnType<typeof buildTestRouter>;
}

/**
 * Render the app's route tree at `initialPath` inside the real providers.
 *
 * `ThemeProvider` is included because the header and profile read the theme
 * context; the Internet Identity and actor seams are mocked globally.
 */
export function renderRoute(
  initialPath: string,
  options: { queryClient?: QueryClient } = {},
): RenderRouteResult {
  const router = buildTestRouter(initialPath);
  const queryClient = options.queryClient ?? makeQueryClient();

  const result = render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>,
  );

  return { ...result, router };
}

/** Render a standalone component inside the app's providers. */
export function renderWithProviders(
  ui: ReactElement,
  options: { queryClient?: QueryClient } = {},
): RenderResult {
  const queryClient = options.queryClient ?? makeQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );
}
