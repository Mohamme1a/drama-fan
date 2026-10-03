import { Layout } from "@/components/Layout";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { AdminPage } from "@/pages/AdminPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { HomePage } from "@/pages/HomePage";
import { PlayerPage } from "@/pages/PlayerPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SearchPage } from "@/pages/SearchPage";
import type { SearchPageParams } from "@/pages/SearchPage";
import { TitleDetailsPage } from "@/pages/TitleDetailsPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

/**
 * Route tree for the app shell.
 */

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
    category: typeof search.category === "string" ? search.category : undefined,
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

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}
