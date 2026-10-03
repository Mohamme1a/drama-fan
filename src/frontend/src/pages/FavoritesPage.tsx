import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { TitleCard } from "@/components/TitleCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites, useRemoveFavorite } from "@/hooks/useLibrary";
import { Link } from "@tanstack/react-router";
import { Bookmark, LogIn, Trash2 } from "lucide-react";

/** Favorites page: the signed-in user's saved titles with a remove action. */
export function FavoritesPage() {
  const { isAuthenticated, isInitializing, login, isLoggingIn } = useAuth();
  const { data: favorites, isLoading } = useFavorites(isAuthenticated);
  const removeFavorite = useRemoveFavorite();

  const items = favorites ?? [];

  if (!isAuthenticated) {
    return (
      <div className="px-4 pt-4" data-ocid="favorites.page">
        <PageHeading count={null} />
        <EmptyState
          icon={LogIn}
          title="سجّل الدخول لعرض المفضلة"
          description="احفظ الأعمال التي تحبها وارجع إليها في أي وقت. سجّل الدخول عبر Internet Identity للبدء."
          action={
            <Button
              type="button"
              onClick={() => login()}
              disabled={isInitializing || isLoggingIn}
              data-ocid="favorites.login_button"
              className="h-11 rounded-full px-6"
            >
              <LogIn className="size-4" aria-hidden="true" />
              {isLoggingIn ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4" data-ocid="favorites.page">
      <PageHeading count={isLoading ? null : items.length} />

      {isLoading ? (
        <div className="mt-4">
          <LoadingState count={6} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="لا توجد أعمال محفوظة"
          description="أضف الأعمال التي تحبها إلى المفضلة لتجدها هنا بسهولة."
          action={
            <Button asChild className="h-11 rounded-full px-6">
              <Link to="/" data-ocid="favorites.browse_button">
                تصفّح الأعمال
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
          {items.map((title, index) => (
            <li key={title.id} className="relative">
              <TitleCard title={title} index={index + 1} className="w-full" />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => removeFavorite.mutate(Number(title.id))}
                disabled={removeFavorite.isPending}
                aria-label={`إزالة ${title.title} من المفضلة`}
                data-ocid={`favorites.remove_button.${index + 1}`}
                className="absolute left-2 top-2 size-9 rounded-full bg-background/85 text-foreground shadow-subtle backdrop-blur hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PageHeading({ count }: { count: number | null }) {
  return (
    <div className="flex items-baseline justify-between">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
        المفضلة
      </h1>
      {count !== null ? (
        <span className="text-sm text-muted-foreground">{count} عمل</span>
      ) : null}
    </div>
  );
}
