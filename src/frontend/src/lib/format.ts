/**
 * Arabic-first formatting helpers.
 *
 * Backend timestamps are nanosecond `bigint`s from Motoko `Time.now()`.
 * Always convert them through `timestampToDate` before any `Date` operation.
 */

/** Convert a Motoko nanosecond timestamp to a `Date`, or `null` if invalid. */
export function timestampToDate(timestamp: bigint | number): Date | null {
  const ms =
    typeof timestamp === "bigint" ? Number(timestamp / 1_000_000n) : timestamp;
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a duration in seconds as `mm:ss` (or `h:mm:ss` past an hour). */
export function formatDuration(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds)
    ? Math.max(0, Math.floor(totalSeconds))
    : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (value: number) => value.toString().padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

/** Format a duration in seconds as a compact Arabic label, e.g. «٤٥ د». */
export function formatDurationLabel(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds)
    ? Math.max(0, Math.floor(totalSeconds))
    : 0;
  const minutes = Math.round(safe / 60);
  if (minutes < 60) return `${minutes} د`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} س` : `${hours} س ${rest} د`;
}

/** Format a rating (0–5) to one decimal, or «جديد» when unrated. */
export function formatRating(rating: number): string {
  if (!Number.isFinite(rating) || rating <= 0) return "جديد";
  return rating.toFixed(1);
}

/** Relative Arabic time label for a backend timestamp. */
export function formatRelativeDate(timestamp: bigint | number): string {
  const date = timestampToDate(timestamp);
  if (!date) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);
  if (diffMinutes < 1) return "الآن";
  if (diffMinutes < 60) return `قبل ${diffMinutes} دقيقة`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `قبل ${diffHours} ساعة`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `قبل ${diffDays} يوم`;
  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths < 12) return `قبل ${diffMonths} شهر`;
  return `قبل ${Math.round(diffMonths / 12)} سنة`;
}

/** Percentage (0–100) of an episode watched, clamped and rounded. */
export function progressPercent(
  positionSeconds: number,
  durationSeconds: number,
): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  const ratio = (positionSeconds / durationSeconds) * 100;
  return Math.min(100, Math.max(0, Math.round(ratio)));
}
