import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EpisodeNavProps {
  /** Whether a previous (lower-numbered) episode exists. */
  hasPrevious: boolean;
  /** Whether a next (higher-numbered) episode exists. */
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

/**
 * Previous / next episode controls.
 *
 * In RTL, «السابق» sits on the right with a right-pointing chevron and «التالي»
 * on the left with a left-pointing chevron. Buttons are disabled at the ends.
 */
export function EpisodeNav({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  className,
}: EpisodeNavProps) {
  return (
    <div
      className={cn("grid grid-cols-2 gap-3", className)}
      data-ocid="player.episode_nav"
    >
      <Button
        type="button"
        variant="secondary"
        onClick={onPrevious}
        disabled={!hasPrevious}
        data-ocid="player.previous_button"
        className="h-11 rounded-full"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
        السابق
      </Button>

      <Button
        type="button"
        variant="secondary"
        onClick={onNext}
        disabled={!hasNext}
        data-ocid="player.next_button"
        className="h-11 rounded-full"
      >
        التالي
        <ChevronLeft className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
