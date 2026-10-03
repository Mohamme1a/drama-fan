import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  /** Episode video source URL. */
  src: string;
  /** Poster shown before playback begins. */
  poster?: string;
  /** Saved playback position in seconds to resume from. */
  startPosition?: number;
  /** Called with the current position and duration, throttled during playback. */
  onProgress: (positionSeconds: number, durationSeconds: number) => void;
  /** Called once the media metadata is ready. */
  onReady?: () => void;
  className?: string;
}

/** How often playback position is reported while playing (ms). */
const PROGRESS_INTERVAL_MS = 5000;

/**
 * HTML5 video player with native controls.
 *
 * Reports playback position on an interval while playing and immediately on
 * pause, seek, and unmount so progress is never lost.
 */
export function VideoPlayer({
  src,
  poster,
  startPosition = 0,
  onProgress,
  onReady,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Keep the latest callback in a ref so the reporting effect never needs to
  // re-subscribe when the parent re-renders.
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  // Reset transient state whenever the source changes.
  useEffect(() => {
    if (!src) return;
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  // Resume from the saved position once metadata is available.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src || startPosition <= 0) return;
    const handleLoadedMetadata = () => {
      if (
        Number.isFinite(video.duration) &&
        startPosition < video.duration - 1
      ) {
        video.currentTime = startPosition;
      }
    };
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [startPosition, src]);

  // Report progress periodically while playing and on pause/seek.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const report = () => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      onProgressRef.current(video.currentTime, duration);
    };

    const interval = window.setInterval(() => {
      if (!video.paused && !video.ended) report();
    }, PROGRESS_INTERVAL_MS);

    video.addEventListener("pause", report);
    video.addEventListener("seeked", report);
    video.addEventListener("ended", report);

    return () => {
      window.clearInterval(interval);
      video.removeEventListener("pause", report);
      video.removeEventListener("seeked", report);
      video.removeEventListener("ended", report);
      report();
    };
  }, [src]);

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden bg-black",
        className,
      )}
      data-ocid="player.video"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={() => {
          setIsLoading(false);
          onReady?.();
        }}
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className="size-full"
      >
        <track kind="captions" />
      </video>

      {isLoading && !hasError ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40"
          data-ocid="player.loading_state"
        >
          <Loader2
            className="size-8 animate-spin text-primary"
            aria-hidden="true"
          />
          <span className="sr-only">جارٍ تحميل الفيديو</span>
        </div>
      ) : null}

      {hasError ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 px-6 text-center"
          data-ocid="player.error_state"
        >
          <p className="text-sm font-semibold text-foreground">
            تعذّر تشغيل هذا الفيديو
          </p>
          <p className="text-xs text-muted-foreground">
            تحقق من اتصالك بالإنترنت ثم أعد المحاولة.
          </p>
        </div>
      ) : null}
    </div>
  );
}
