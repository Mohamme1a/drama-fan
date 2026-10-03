# Design Brief

## Direction

«drama fan» — a cinematic, RTL-first short-drama streaming app built for Android phones, where every screen feels like a movie poster wall.

## Tone

Dark cinematic editorial — deep plum-black surfaces with a single vivid rose-coral accent, executed with restraint so the poster art carries the emotion.

## Differentiation

A signature "spotlight" hero: full-bleed cover art under a bottom-up plum scrim, with the rose accent reserved for one action per screen — never scattered.

## Color Palette

| Token      | OKLCH (dark)   | Role   |
| ---------- | -------------- | ------ |
| background | 0.145 0.014 340 | plum-black app canvas |
| foreground | 0.95 0.008 340  | primary text |
| card       | 0.19 0.016 340  | poster/section surfaces |
| primary    | 0.68 0.21 12    | rose-coral brand + CTAs |
| accent     | 0.68 0.21 12    | active nav / highlights |
| muted      | 0.23 0.02 340   | secondary surfaces |
| rating-star| 0.82 0.16 82    | warm gold ratings |
| nav-bar    | 0.175 0.016 340 | fixed bottom nav |

## Typography

- Display: Space Grotesk (self-hosted) — wordmark, hero titles, Latin numerals; Arabic falls back to system Arabic sans.
- Body: General Sans (self-hosted) — Arabic UI text, labels, descriptions via Arabic-first stack.
- Scale: hero `text-4xl font-bold tracking-tight`, h2 `text-2xl font-bold`, label `text-xs font-semibold`, body `text-base leading-relaxed`.

## Elevation & Depth

Three-tier surface hierarchy (background → card → popover) with soft shadows (`shadow-subtle`, `shadow-elevated`) and a scrim gradient over poster art instead of glow.

## Structural Zones

| Zone     | Background          | Border              | Notes |
| -------- | ------------------- | ------------------- | ----- |
| Top bar  | `bg-background/80` blur | none            | wordmark right (RTL), search + avatar left |
| Hero     | cover art + `bg-gradient-scrim` | none    | 16:9 spotlight, rose play pill |
| Content  | `bg-background`     | —                   | rows alternate `bg-muted/30` |
| Cards    | `bg-card`           | `border-border`     | 16px radius, 2:3 posters |
| Bottom nav | `bg-nav-bar`      | `border-t nav-bar-border` | 4 RTL tabs, active = rose |

## Spacing & Rhythm

Mobile-first: 16px page gutters, 24px section gaps, 12px card gutters, 8px micro-spacing; horizontal rows use `scrollbar-none` with 12px item gaps.

## Component Patterns

- Buttons: rose `bg-primary` pill for primary; ghost/outline `border-border` for secondary; hover lifts with `shadow-elevated`.
- Cards: 16px radius, `bg-card`, cover image top, gradient scrim for overlaid titles.
- Badges: pill chips, `bg-muted` fill, `text-muted-foreground`; active chip `bg-primary text-primary-foreground`.

## Motion

- Entrance: `animate-fade-up` (0.4s) for hero and rows, staggered by index.
- Hover: `transition-smooth` scale 1.02 + `shadow-elevated` on cards (0.3s).
- Decorative: `animate-shimmer` skeletons, `animate-pulse-soft` live/live-badge only.

## Constraints

- RTL throughout (`html { direction: rtl }`); all Arabic text right-aligned.
- Mobile-first for Android; bottom nav fixed with safe-area padding.
- Dark mode is the primary experience; light mode tuned, not inverted.
- Rose accent used sparingly — one primary action per screen.
- No offline-download or new-episode-notification UI.

## Signature Detail

The "spotlight" hero — a full-bleed poster under a plum scrim with a single rose play pill — is the app's recognizable cinematic signature.
