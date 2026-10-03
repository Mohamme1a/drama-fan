# Project Guidance

## User Preferences

- Arabic RTL interface throughout
- App name: drama fan
- Original professional design, not a clone of any existing app
- Mobile-first responsive layout for Android phones
- Dark mode with persisted preference
- Bottom navigation tabs: الرئيسية، البحث، المفضلة، حسابي
- Include sample content for testing

## Verified Commands

- **typecheck**: `mops check --fix`
- **build**: `mops build`

## Learnings

- Generated Candid bindings type Nat/Int as bigint; convert with BigInt() at the actor boundary and Number() only at arithmetic/display sites. bigint === number is always false and Math.round/Math.floor on a bigint throws.
- An absent optional Candid field arrives as undefined, not null; filter with `!= null`.
- tsconfig includes only 'src', so jest-dom matcher types must be registered by a type-only import inside src (src/test-setup.ts importing @testing-library/jest-dom/vitest) or tsc --noEmit fails on test files.
- Motoko: `include` is a reserved keyword; an inline `switch` used as a func argument body must parenthesize its scrutinee.
- Enhanced Migration: migrations cannot import project modules, so init-once seeding must be inlined in the migration chain entry; never seed from an actor-body statement or pre/postupgrade.
- OQL entities over nested per-user maps are best flattened with OQL.Entity.newScoped plus .ownedBy(<principal field>).controllerOrScoped(); a variant record field needs OQL.Entity.manual with a .payload mapping.
- TanStack Router: declare validateSearch on a route to persist filter state in the URL; pass search={{...}} on Links to satisfy the required-search contract.
- Biome: a role=progressbar element inside a Link needs tabIndex={-1}; useExhaustiveDependencies rejects a dependency not referenced in the effect body.
