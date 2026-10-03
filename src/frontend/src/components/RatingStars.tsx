import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";

interface RatingStarsProps {
  /** The user's current rating (1–5), or `null` when unrated. */
  value: number | null;
  /** Called with the chosen star count (1–5). */
  onRate: (stars: number) => void;
  /** Disables interaction while a rating is being saved. */
  disabled?: boolean;
  className?: string;
}

const STARS = [1, 2, 3, 4, 5];

/** Interactive 1–5 star rating control with hover preview and keyboard support. */
export function RatingStars({
  value,
  onRate,
  disabled = false,
  className,
}: RatingStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value ?? 0;

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      aria-label="تقييم العمل"
      data-ocid="rating.stars"
      onMouseLeave={() => setHovered(null)}
    >
      {STARS.map((star) => {
        const filled = star <= active;
        return (
          <button
            key={star}
            type="button"
            aria-pressed={value === star}
            aria-label={`${star} من 5 نجوم`}
            disabled={disabled}
            data-ocid={`rating.star.${star}`}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(null)}
            onClick={() => onRate(star)}
            className={cn(
              "flex size-9 items-center justify-center rounded-full transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
              !disabled && "hover:bg-muted active:scale-95",
            )}
          >
            <Star
              className={cn(
                "size-6 transition-smooth",
                filled
                  ? "fill-[oklch(var(--rating-star))] text-[oklch(var(--rating-star))]"
                  : "text-muted-foreground",
              )}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
