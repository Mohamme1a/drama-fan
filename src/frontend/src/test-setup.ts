/**
 * Type-only registration of the jest-dom matchers for the test suite.
 *
 * The runtime setup lives in `vitest.setup.ts` at the frontend root, which is
 * outside `tsconfig.json`'s `include: ["src"]` scope. Importing the matchers
 * here — inside `src` — makes their `expect` augmentation visible to
 * `tsc --noEmit` for every `*.test.tsx` file without changing runtime behavior.
 */
import "@testing-library/jest-dom/vitest";
