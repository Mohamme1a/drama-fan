import { CATEGORIES, KIND_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { TitleKind } from "@/types/content";

interface FilterBarProps {
  /** Selected category, or `null` for «الكل». */
  category: string | null;
  /** Selected kind, or `null` for «الكل». */
  kind: TitleKind | null;
  onCategoryChange: (category: string | null) => void;
  onKindChange: (kind: TitleKind | null) => void;
  className?: string;
}

const KIND_OPTIONS: { value: TitleKind; label: string }[] = [
  { value: "drama", label: KIND_LABELS.drama },
  { value: "movie", label: KIND_LABELS.movie },
];

interface ChipProps {
  active: boolean;
  label: string;
  onClick: () => void;
  ocid: string;
}

function Chip({ active, label, onClick, ocid }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-ocid={ocid}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-transparent bg-primary text-primary-foreground shadow-subtle"
          : "border-border bg-card text-muted-foreground hover:border-ring/50 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

/** Horizontally scrollable category and kind filter chips. */
export function FilterBar({
  category,
  kind,
  onCategoryChange,
  onKindChange,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
          النوع
        </p>
        <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip
            active={kind === null}
            label="الكل"
            onClick={() => onKindChange(null)}
            ocid="filter.kind.all"
          />
          {KIND_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              active={kind === option.value}
              label={option.label}
              onClick={() => onKindChange(option.value)}
              ocid={`filter.kind.${option.value}`}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
          التصنيف
        </p>
        <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip
            active={category === null}
            label="الكل"
            onClick={() => onCategoryChange(null)}
            ocid="filter.category.all"
          />
          {CATEGORIES.map((item) => (
            <Chip
              key={item}
              active={category === item}
              label={item}
              onClick={() => onCategoryChange(item)}
              ocid={`filter.category.${CATEGORIES.indexOf(item) + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
