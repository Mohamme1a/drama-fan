import { makeQueryClient } from "@/__tests__/renderRoute";
import { testState } from "@/__tests__/testState";
import { useRateTitle, useSaveProgress } from "@/hooks/useLibrary";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

/**
 * `useLibrary` mutation hooks: the actor call shape and the numeric coercion
 * the frontend applies before crossing the Candid boundary.
 *
 * The actor is the global typed mock; these tests assert the frontend's
 * request contract, not the real backend's persistence.
 */
function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={makeQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

describe("useLibrary", () => {
  it("rounds playback seconds to whole numbers before saving progress", async () => {
    const { result } = renderHook(() => useSaveProgress(), { wrapper });

    result.current.mutate({
      episodeId: 101,
      positionSeconds: 120.6,
      durationSeconds: 599.4,
    });

    await waitFor(() =>
      expect(testState.backend.saveProgress).toHaveBeenCalledWith(
        101n,
        121n,
        599n,
      ),
    );
  });

  it("sends the rating as a bigint star count", async () => {
    const { result } = renderHook(() => useRateTitle(), { wrapper });

    result.current.mutate({ titleId: 7, stars: 4 });

    await waitFor(() =>
      expect(testState.backend.rateTitle).toHaveBeenCalledWith(7n, 4n),
    );
  });
});
