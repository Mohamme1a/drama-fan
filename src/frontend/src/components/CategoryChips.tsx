import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface CategoryChipsProps {
  className?: string;
}

/**
 * Horizontally scrollable category filter bar.
 *
 * Each chip navigates to the search page with that category preselected.
 */
export function CategoryChips({ className }: CategoryChipsProps) {
  return (
    <nav
      aria-label="تصفية حسب التصنيف"
      data-ocid="category.section"
      className={cn("scrollbar-none overflow-x-auto", className)}
    >
      <ul className="flex w-max items-center gap-2 px-4">
        {CATEGORIES.map((category, index) => (
          <li key={category}>
            <Link
              to="/search"
              search={{ category }}
              data-ocid={`category.chip.${index + 1}`}
              className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full border border-border bg-card px-4 text-sm font-medium text-muted-foreground transition-smooth hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {category}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
