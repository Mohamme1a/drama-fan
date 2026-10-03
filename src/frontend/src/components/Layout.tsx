import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

/**
 * App shell: sticky header, scrollable main content, fixed bottom navigation,
 * and the caffeine attribution footer.
 */
export function Layout({ children }: LayoutProps) {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 pb-24">{children}</main>

      <footer className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {year}. صُنع بحب باستخدام{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <BottomNav />
    </div>
  );
}
