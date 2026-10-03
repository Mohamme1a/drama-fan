import { createActor } from "@/backend";
import type {
  ContinueWatchingItem,
  RatingSummary,
  TitleView,
} from "@/types/content";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Per-user library API surface exposed by the backend content mixin.
 *
 * The generated bindings are regenerated after the backend check; until then
 * the actor is narrowed to this interface so the shell stays type-safe.
 */
interface LibraryActor {
  listFavorites(): Promise<TitleView[]>;
  addFavorite(titleId: bigint): Promise<void>;
  removeFavorite(titleId: bigint): Promise<void>;
  rateTitle(titleId: bigint, stars: bigint): Promise<unknown>;
  getRatingSummary(titleId: bigint): Promise<RatingSummary>;
  listContinueWatching(): Promise<ContinueWatchingItem[]>;
  saveProgress(
    episodeId: bigint,
    positionSeconds: bigint,
    durationSeconds: bigint,
  ): Promise<void>;
}

function libraryActor(actor: unknown): LibraryActor | null {
  return (actor as LibraryActor | null) ?? null;
}

/** The signed-in user's favorite titles. */
export function useFavorites(enabled: boolean) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async (): Promise<TitleView[]> => {
      const api = libraryActor(actor);
      if (!api) return [];
      return api.listFavorites();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

/** Add a title to favorites. */
export function useAddFavorite() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (titleId: number) => {
      const api = libraryActor(actor);
      if (!api) throw new Error("الخادم غير جاهز");
      return api.addFavorite(BigInt(titleId));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

/** Remove a title from favorites. */
export function useRemoveFavorite() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (titleId: number) => {
      const api = libraryActor(actor);
      if (!api) throw new Error("الخادم غير جاهز");
      return api.removeFavorite(BigInt(titleId));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

/** Aggregate rating for a title plus the caller's own rating. */
export function useRatingSummary(titleId: number | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["ratingSummary", titleId],
    queryFn: async (): Promise<RatingSummary | null> => {
      const api = libraryActor(actor);
      if (!api || titleId === null) return null;
      return api.getRatingSummary(BigInt(titleId));
    },
    enabled: !!actor && !isFetching && titleId !== null,
  });
}

/** Rate a title from 1 to 5 stars. */
export function useRateTitle() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      titleId,
      stars,
    }: { titleId: number; stars: number }) => {
      const api = libraryActor(actor);
      if (!api) throw new Error("الخادم غير جاهز");
      return api.rateTitle(BigInt(titleId), BigInt(stars));
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["ratingSummary", variables.titleId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["title", variables.titleId],
      });
    },
  });
}

/** The signed-in user's continue-watching row. */
export function useContinueWatching(enabled: boolean) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["continueWatching"],
    queryFn: async (): Promise<ContinueWatchingItem[]> => {
      const api = libraryActor(actor);
      if (!api) return [];
      return api.listContinueWatching();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

/** Persist playback progress for an episode. */
export function useSaveProgress() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      episodeId,
      positionSeconds,
      durationSeconds,
    }: {
      episodeId: number;
      positionSeconds: number;
      durationSeconds: number;
    }) => {
      const api = libraryActor(actor);
      if (!api) throw new Error("الخادم غير جاهز");
      return api.saveProgress(
        BigInt(episodeId),
        BigInt(Math.round(positionSeconds)),
        BigInt(Math.round(durationSeconds)),
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["continueWatching"] });
    },
  });
}
