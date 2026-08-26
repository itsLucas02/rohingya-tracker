# TrackX — Design System

A community platform where residents report and discuss local safety **incidents**
(theft, vandalism, hazards, suspicious activity, lost & found) on a shared map and board.
Reports describe events and behavior — never any ethnic, religious, or national group.

## Design Direction

**Apple Maps × Linear × premium glass UI.** Minimal, sophisticated, monochrome,
map-dominant. Should feel like a premium civic tool, not a generic admin dashboard.

### Strict Rules

- NO gradients anywhere
- NO colorful backgrounds
- NO neon or glowing effects
- NO excessive accent color
- NO gaming-style UI
- NO oversized rounded cards
- NO thick borders around every element
- Glass used sparingly: main panels, floating overlays, map controls — NOT every small component
- Internal information uses spacing and separators, not cards inside cards

## Color Tokens

All tokens live in `src/app/globals.css`. Never hardcode colors in components — use the
Tailwind classes that map to these tokens (`bg-background`, `text-foreground`,
`text-text-secondary`, `border-border`, `glass`, `glass-elevated`, etc.).

### Dark Mode

| Token | Value |
|-------|-------|
| Background | `#080808` |
| Glass panel | `rgba(18,18,18,0.72)` + blur 20px + border `rgba(255,255,255,0.08)` |
| Elevated glass | `rgba(28,28,28,0.76)` |
| Primary text | `#FFFFFF` |
| Secondary text | `rgba(255,255,255,0.65)` |
| Muted text | `rgba(255,255,255,0.40)` |
| Dividers | `rgba(255,255,255,0.08)` |
| Hover | `rgba(255,255,255,0.06)` |
| Selected | `rgba(255,255,255,0.10)` |

### Light Mode

| Token | Value |
|-------|-------|
| Background | `#FAFAFA` |
| Glass panel | `rgba(255,255,255,0.72)` + blur 20px + border `rgba(0,0,0,0.07)` |
| Elevated glass | `rgba(255,255,255,0.88)` |
| Primary text | `#090909` |
| Secondary text | `rgba(0,0,0,0.62)` |
| Muted text | `rgba(0,0,0,0.40)` |
| Dividers | `rgba(0,0,0,0.07)` |
| Hover | `rgba(0,0,0,0.04)` |
| Selected | `rgba(0,0,0,0.07)` |

## Color Accent Policy

The UI is **strictly monochrome** (black / white / transparent grays) except:

1. **Map pin accent** — one functional accent (`--map-accent`) so pins read against tiles
2. **Live/active status** — green dot (`--status-live`) ONLY for genuine active status
3. **Danger/flag** — red (`--destructive`) ONLY for destructive actions or flagged content
4. **Notification badge** — red dot for unread count

Never use color decoratively.

## Typography

Font: **Geist** (via `next/font`).

| Use | Size | Weight |
|-----|------|--------|
| App title | 20–22px | 600 |
| Section headings | 17–18px | 600 |
| Report titles | 15–16px | 500 |
| Body | 13–14px | 400 |
| Metadata / timestamps | 11–12px | 400 |
| Statistics numbers | 24–28px | 600 |

Use uppercase sparingly (section labels like `SELECTED REPORT`, `RECENT`).

## Border Radius

| Element | Radius |
|---------|--------|
| Search bar | 10–12px |
| Main glass panels | 14–16px |
| Buttons | 8–10px |
| Category badges | 8px |
| Floating controls | 10–12px |
| Map markers | circle |

Base `--radius` is `0.75rem` (12px). Do not make everything pill-shaped.

## Spacing

Strict 4px grid: `4 / 8 / 12 / 16 / 20 / 24 / 32`. Increase whitespace significantly —
the interface should feel spacious even with dense information.

## Layout

**Desktop (>1024px):** Header (Logo · Map/Board nav · Search · Bell · Theme · Lang ·
Avatar) + left glass panel (filters, recent, report list) + dominant map (~70% width) +
floating status bar and glass map controls + Report FAB (bottom-right).

**Mobile (<768px):** Top bar (Logo · Menu · Bell · Avatar) + full-width map + draggable
glass bottom sheet (report list / board) + bottom tab nav (Map · Board · Report FAB).

The map is always visually dominant. Panels float over it with glass styling and thin
separators — no heavy visual separation between panels.

## Components

- **Report card:** clean rows with subtle horizontal separators, no permanent card border.
  Category badge (monochrome inverted), title, location, `time · ▲upvotes · 💬comments`, chevron.
- **Map marker:** white circle + category icon + thin border + soft shadow. Cluster = white
  circle with count. Selected = slightly larger with subtle pulse.
- **Report FAB:** inverted circle (white/dark icon in dark mode; black/white icon in light).
- **Segmented control** (e.g. Newest/Trending): selected = inverted fill; unselected = transparent.
- **Statistics:** typography-driven, numbers dominant, labels small + muted, no card borders.
- **Category badge:** monochrome. Dark mode = white bg/black text. Light mode = black bg/white text.

## Dark / Light Toggle

Sun/moon icon in header. Both modes share exactly the same layout; only colors and glass
transparency change. Managed by `next-themes` with `.dark` class on `<html>`.

## Internationalization

Bilingual: English + Bahasa Malaysia (`next-intl`). All UI strings in `src/i18n/*.json`.
Locale prefix routing (`/en`, `/ms`). Report content stays in whatever language the user writes.
