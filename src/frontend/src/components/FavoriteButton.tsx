import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface FavoriteButtonProps {
  /** Whether the title is currently in the user's favorites. */
  isFavorite: boolean;
  /** Toggles the favorite state. */
  onToggle: () => void;
  /** Disables the control while the change is being saved. */
  disabled?: boolean;
  className?: string;
}

/** Pill toggle that reflects and updates the user's favorite state. */
export function FavoriteButton({
  isFavorite,
  onToggle,
  disabled = false,
  className,
}: FavoriteButtonProps) {
  const Icon = isFavorite ? BookmarkCheck : Bookmark;

  return (
    <Button
      type="button"
      variant={isFavorite ? "secondary" : "outline"}
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={isFavorite}
      data-ocid="favorite.toggle"
      className={cn(
        "h-11 flex-1 rounded-full px-4 text-sm font-semibold",
        isFavorite && "border-transparent",
        className,
      )}
    >
      <Icon
        className={cn(
          "size-4",
          isFavorite && "text-[oklch(var(--nav-active))]",
        )}
        aria-hidden="true"
      />
      {isFavorite ? "في المفضلة" : "إضافة إلى المفضلة"}
    </Button>
  );
}
