import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /** Number of poster placeholders to render. */
  count?: number;
  className?: string;
}

const SKELETON_IDS = Array.from(
  { length: 6 },
  (_, i) => `poster-skeleton-${i}`,
);

/** Layout-matched poster skeleton row shown while content loads. */
export function LoadingState({ count = 6, className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "scrollbar-none flex gap-3 overflow-hidden px-4",
        className,
      )}
      data-ocid="loading_state"
      aria-hidden="true"
    >
      {SKELETON_IDS.slice(0, count).map((id) => (
        <div key={id} className="w-36 shrink-0 sm:w-40">
          <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
          <Skeleton className="mt-2 h-4 w-3/4 rounded" />
          <Skeleton className="mt-1.5 h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}
