import { TitleCard } from "@/components/TitleCard";
import { cn } from "@/lib/utils";
import type { TitleView } from "@/types/content";

interface ContentRowProps {
  title: string;
  items: TitleView[];
  /** Stable row id used for deterministic test markers. */
  rowId: string;
  className?: string;
}

/** Horizontally scrollable row of poster cards under a section title. */
export function ContentRow({
  title,
  items,
  rowId,
  className,
}: ContentRowProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={cn("animate-fade-up", className)}
      aria-label={title}
      data-ocid={`row.${rowId}`}
    >
      <div className="mb-3 flex items-baseline justify-between px-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground">
          {items.length} عنوان
        </span>
      </div>

      <div className="scrollbar-none flex gap-3 overflow-x-auto px-4 pb-1">
        {items.map((item, index) => (
          <TitleCard key={item.id} title={item} index={index + 1} />
        ))}
      </div>
    </section>
  );
}
