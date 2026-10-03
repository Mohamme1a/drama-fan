import { ThemeToggle } from "@/components/ThemeToggle";
import { APP_NAME } from "@/lib/constants";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";

/** Sticky top bar: wordmark (RTL right), search shortcut and theme toggle (left). */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link
          to="/"
          data-ocid="header.home_link"
          className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-lg bg-gradient-primary text-sm font-bold text-primary-foreground"
          >
            د
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            {APP_NAME}
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/search"
            aria-label="البحث"
            data-ocid="header.search_link"
            className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search className="size-5" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
