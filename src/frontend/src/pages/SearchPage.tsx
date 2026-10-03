import { EmptyState } from "@/components/EmptyState";
import { FilterBar } from "@/components/FilterBar";
import { SearchBar } from "@/components/SearchBar";
import { TitleCard } from "@/components/TitleCard";
import { useTitles } from "@/hooks/useContent";
import { CATEGORIES } from "@/lib/constants";
import type { TitleKind } from "@/types/content";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { useCallback } from "react";

/** URL search state for the /search route. */
export interface SearchPageParams {
  q?: string;
  category?: string;
  kind?: TitleKind;
}

/** Normalize a raw URL value into a known category, or `null`. */
function normalizeCategory(value: string | undefined): string | null {
  if (!value) return null;
  return CATEGORIES.includes(value) ? value : null;
}

/** Normalize a raw URL value into a known kind, or `null`. */
function normalizeKind(value: string | undefined): TitleKind | null {
  return value === "drama" || value === "movie" ? value : null;
}

const GRID_SKELETON_IDS = Array.from(
  { length: 6 },
  (_, i) => `search-skeleton-${i}`,
);

/** Search and filter the catalogue, with state persisted in the URL. */
export function SearchPage() {
  const search = useSearch({ from: "/search" });
  const navigate = useNavigate();

  const term = search.q ?? "";
  const category = normalizeCategory(search.category);
  const kind = normalizeKind(search.kind);

  const { data: titles, isLoading } = useTitles({
    searchTerm: term.trim() || undefined,
    category: category ?? undefined,
    kind: kind ?? undefined,
  });

  const updateSearch = useCallback(
    (patch: Partial<SearchPageParams>) => {
      void navigate({
        to: "/search",
        search: (prev) => {
          const merged: SearchPageParams = { ...prev, ...patch };
          const next: SearchPageParams = {};
          if (merged.q) next.q = merged.q;
          if (merged.category) next.category = merged.category;
          if (merged.kind) next.kind = merged.kind;
          return next;
        },
        replace: true,
      });
    },
    [navigate],
  );

  const handleTermChange = useCallback(
    (value: string) => updateSearch({ q: value }),
    [updateSearch],
  );

  const results = titles ?? [];
  const hasFilters =
    term.trim().length > 0 || category !== null || kind !== null;
  const showEmpty = !isLoading && results.length === 0;

  return (
    <div className="animate-fade-up" data-ocid="search.page">
      <div className="sticky top-14 z-30 space-y-3 border-b border-border bg-background/90 px-4 pb-3 pt-3 backdrop-blur-md">
        <SearchBar value={term} onChange={handleTermChange} />
        <FilterBar
          category={category}
          kind={kind}
          onCategoryChange={(next) =>
            updateSearch({ category: next ?? undefined })
          }
          onKindChange={(next) => updateSearch({ kind: next ?? undefined })}
        />
      </div>

      <div className="px-4 pt-4">
        {isLoading ? (
          <div
            className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3"
            data-ocid="search.loading_state"
            aria-hidden="true"
          >
            {GRID_SKELETON_IDS.map((id) => (
              <div key={id} className="w-full">
                <div className="aspect-[2/3] w-full animate-pulse rounded-2xl bg-muted" />
                <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : showEmpty ? (
          <EmptyState
            icon={SearchX}
            title="لا توجد نتائج"
            description={
              hasFilters
                ? "لم نعثر على أعمال تطابق بحثك. جرّب كلمات أخرى أو غيّر التصنيف."
                : "ابدأ بالكتابة للبحث في الأعمال المتاحة."
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() =>
                    updateSearch({
                      q: undefined,
                      category: undefined,
                      kind: undefined,
                    })
                  }
                  data-ocid="search.reset_button"
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  مسح البحث والتصفية
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="mb-3 text-xs text-muted-foreground">
              {results.length} نتيجة
            </p>
            <div
              className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3"
              data-ocid="search.results"
            >
              {results.map((title, index) => (
                <TitleCard
                  key={title.id}
                  title={title}
                  index={index + 1}
                  className="w-full"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
