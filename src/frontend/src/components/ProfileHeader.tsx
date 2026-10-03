import { useThemeContext } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  LogIn,
  LogOut,
  Moon,
  Shield,
  Star,
  Sun,
  User,
} from "lucide-react";

interface ProfileHeaderProps {
  /** Number of titles the user has saved. */
  favoritesCount: number;
  /** Number of titles the user has rated. */
  ratedCount: number;
  /** Whether the stats are still loading. */
  statsLoading?: boolean;
  className?: string;
}

/** Shorten an Internet Identity principal for display, e.g. «abcd…wxyz». */
function shortenPrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 5)}…${principal.slice(-4)}`;
}

/** Identity card: avatar, display name, stats, and session controls. */
export function ProfileHeader({
  favoritesCount,
  ratedCount,
  statsLoading = false,
  className,
}: ProfileHeaderProps) {
  const {
    identity,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    isLoginError,
    loginError,
    login,
    logout,
    isAdmin,
  } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  const isDark = theme === "dark";

  const principal = identity?.getPrincipal().toText() ?? "";
  const displayName = isAuthenticated ? shortenPrincipal(principal) : "زائر";

  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border border-border bg-card shadow-subtle",
        className,
      )}
      data-ocid="profile.header"
    >
      <div className="bg-gradient-primary px-5 pb-10 pt-6">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-primary-foreground/30 bg-background/20 text-primary-foreground backdrop-blur"
          >
            <User className="size-8" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-primary-foreground/80">
              {isAuthenticated ? "مرحباً بعودتك" : "لم تسجّل الدخول"}
            </p>
            <h1
              className="truncate font-display text-xl font-bold text-primary-foreground"
              data-ocid="profile.display_name"
            >
              {displayName}
            </h1>
            {isAuthenticated ? (
              <p className="mt-0.5 truncate font-mono text-[11px] text-primary-foreground/70">
                {principal}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="-mt-6 px-5">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Bookmark}
            label="المفضلة"
            value={favoritesCount}
            loading={statsLoading}
            ocid="profile.stat.favorites"
          />
          <StatCard
            icon={Star}
            label="أعمال مُقيّمة"
            value={ratedCount}
            loading={statsLoading}
            ocid="profile.stat.rated"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 p-5">
        {isAuthenticated ? (
          <Button
            type="button"
            variant="outline"
            onClick={logout}
            data-ocid="profile.logout_button"
            className="h-11 w-full rounded-full"
          >
            <LogOut className="size-4" aria-hidden="true" />
            تسجيل الخروج
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => login()}
            disabled={isInitializing || isLoggingIn}
            data-ocid="profile.login_button"
            className="h-11 w-full rounded-full"
          >
            <LogIn className="size-4" aria-hidden="true" />
            {isLoggingIn ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}
          </Button>
        )}

        {isLoginError ? (
          <p
            role="alert"
            data-ocid="profile.login_error"
            className="text-center text-xs text-destructive"
          >
            {loginError?.message ?? "تعذّر تسجيل الدخول. حاول مرة أخرى."}
          </p>
        ) : null}

        <div className="mt-1 flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={toggleTheme}
            data-ocid="profile.theme_toggle"
            className="h-11 flex-1 rounded-full"
          >
            {isDark ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
            {isDark ? "الوضع الفاتح" : "الوضع الداكن"}
          </Button>

          {isAdmin ? (
            <Button
              asChild
              variant="secondary"
              className="h-11 flex-1 rounded-full"
            >
              <Link to="/admin" data-ocid="profile.admin_link">
                <Shield className="size-4" aria-hidden="true" />
                لوحة الإدارة
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

interface StatCardProps {
  icon: typeof Bookmark;
  label: string;
  value: number;
  loading: boolean;
  ocid: string;
}

function StatCard({ icon: Icon, label, value, loading, ocid }: StatCardProps) {
  return (
    <div
      className="rounded-2xl border border-border bg-background px-4 py-3 text-center shadow-subtle"
      data-ocid={ocid}
    >
      <Icon className="mx-auto size-4 text-primary" aria-hidden="true" />
      <p className="mt-1.5 font-display text-2xl font-bold tabular-nums text-foreground">
        {loading ? "—" : value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
