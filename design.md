# AssetFlow — Design System & UI/UX Bible (v2)
### Enterprise Asset & Resource Management Platform
**Single source of truth for every page, every agent, every PR.**

> v2 note: v1 of this doc invented a purple "Iris" brand color, a cyan "pop" accent, gradient text, and an animated aurora background. That was wrong — it read as generic AI-generated UI, not a real product. This version is rebuilt directly against two reference screenshots: the **Vercel dashboard** (app chrome, sidebar, cards, tables) and the **Vercel marketing homepage** (hero, nav, buttons). Those two images are the literal ground truth. If anything below conflicts with what's visible in them, the screenshots win — ask before deviating.

---

## 0. Design Thesis

AssetFlow is enterprise software people use dozens of times a day. The look is **true black, monochrome, hairline-bordered, information-dense but calm** — exactly like the Vercel dashboard reference: a near-pure-black canvas, thin 1px borders instead of shadows or glow, tight sidebar with small icons and quiet gray labels, filled-white buttons for the one primary action per view, everything else outlined or ghost. Nothing glows. Nothing has a gradient. Nothing is "branded" with a signature color.

**The only color in this product is functional, not decorative.** Status dots (green/amber/red/gray) exist because they encode real state — exactly the way Vercel colors a deployment "Ready" green or "Error" red. Outside of status indicators, the entire interface is grayscale: black, near-black, three or four steps of gray, and white.

Three rules override everything else in this document:
1. **No brand color.** There is no "Iris," no "pop" accent, no gradient. Primary emphasis is done with **contrast** (white on black), not hue.
2. **Hairline borders, not shadows or glow.** Every panel, card, and input is defined by a 1px `border-white/10`-style line, never a drop shadow, never a colored glow, never an animated background.
3. **Color = state, and only state.** The five/six status colors exist purely to answer "what condition is this asset/booking/ticket in right now" — nowhere else.

---

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 | Server Components by default |
| Styling | Tailwind CSS v4 + CSS variables | Tokens in `globals.css`, never hardcode hex in components |
| Component primitives | **shadcn/ui** (`new-york` style, `neutral` base) | You own the code — extend via `cva` variants, don't fork the pattern per page |
| Animation | **Motion** (`motion/react`) | Used only for functional transitions (§6) — no decorative motion, no particle/aurora backgrounds anywhere |
| Icons | `lucide-react` | One set, one stroke width (1.5px), matches the thin sidebar icons in the reference |
| Tables | `@tanstack/react-table` + shadcn `Table` | Asset Directory, Employee Directory, Audit lists, Activity Log |
| Forms | `react-hook-form` + `zod` | Inline errors, no `alert()` |
| Charts | shadcn Charts (Recharts) | Grayscale by default; status colors only where a series literally represents a status |
| Command palette | `cmdk` (shadcn `Command`) | Global ⌘K, styled exactly like the rest of the app — no special "premium" treatment |
| Toasts | `sonner` | All feedback |
| Theme | `next-themes`, **dark only for this product** | Don't build a light theme — the whole brief and both references are dark-mode-only products; a light mode would just be extra surface area to keep consistent for no benefit |

Do **not** use React Bits, Aceternity, Magic UI, or any "animated flourish" component library. Nothing in the reference screenshots has shiny text, particle backgrounds, gradient sweeps, or spring-bounce decoration — cut all of that from scope entirely.

---

## 2. Color System — grounded exactly in the reference screenshots

### 2.1 Base (black / grey / white — this is the whole palette)

```css
:root {
  --background:        #000000;   /* pure black canvas, matches both references exactly */
  --surface:            #0A0A0A;   /* sidebar / topbar plane, one step off pure black */
  --card:               #111111;   /* card / panel fill */
  --card-hover:          #161616;
  --popover:            #171717;   /* dropdowns, dialogs — one step lighter than card */
  --border:             #232323;   /* hairline border, ~ white/10 */
  --border-strong:       #2E2E2E;  /* used sparingly, e.g. active sidebar item outline */
  --foreground:          #EDEDED;  /* primary text, not pure white — matches reference softness */
  --muted-foreground:    #888888;  /* secondary text, labels, timestamps */
  --muted-foreground-2:  #5C5C5C;  /* tertiary / disabled text */
}
```

Only **four** surface levels exist: `background` → `surface` (chrome) → `card` (panels) → `popover` (floating layers). Never introduce a fifth shade of gray. Never use a shadow as a separator — every boundary is a 1px `border-border` line, exactly like the reference's sidebar seam and table row dividers.

### 2.2 "Primary action" = contrast, not color

There is no brand hue. The primary button is **solid white/near-white fill with black text** — exactly like "Deploy Now" and "Add New" / "Upgrade" in the reference screenshots:

```css
--primary:            #EDEDED;   /* off-white fill */
--primary-foreground: #0A0A0A;   /* near-black text on it */
```

Secondary/outline buttons ("Talk to Sales", "Log In" in the marketing reference; the ghost-bordered controls in the dashboard reference) are transparent with a `border-border` outline and `text-foreground` — no fill.

Focus rings, links, and "selected" states use **white at reduced opacity** (`ring-white/20`, `bg-white/5` for hover/active backgrounds) — never a colored ring.

### 2.3 Status colors — the only color allowed, and it stays muted

Exactly like Vercel's own deployment-status dots (small, desaturated, never a filled background block), AssetFlow's lifecycle/workflow states get a small 6–8px dot + gray text, not a colored pill or colored card:

| State | Color | Hex | Used for |
|---|---|---|---|
| Available / Verified / Approved / Completed / Resolved | success | `#3FBA6D` (muted green) | Asset available, audit verified, transfer approved |
| Allocated / Ongoing / In Progress | info | `#4B8FE0` (muted blue) | Asset allocated, booking ongoing, technician assigned |
| Reserved / Upcoming / Pending | warning | `#D9A441` (muted amber) | Reserved asset, pending approval, upcoming booking |
| Under Maintenance / High Priority | attention | `#D97B3F` (muted orange) | Under maintenance, high-priority ticket |
| Lost / Rejected / Overdue / Missing | danger | `#DB5A5A` (muted red) | Lost asset, overdue return, rejected request |
| Damaged (audit-only) | damaged | `#A25AC7` (muted violet-gray — deliberately desaturated, not a bright purple) | Only the audit "Damaged" mark |
| Retired / Disposed / Cancelled / Inactive | neutral | `#6E6E6E` | Retired, disposed, cancelled, deactivated |

Rendering rule: `● {8px dot, full color}` + `{text-sm, muted-foreground, NOT the status color}` — e.g. a green dot next to plain gray text "Available." The reference never colors entire words or fills badge backgrounds with saturated color; the dot alone carries the signal. This is a deliberate walk-back from v1's colored-pill badges.

```css
--success:   #3FBA6D;
--info:      #4B8FE0;
--warning:   #D9A441;
--attention: #D97B3F;
--danger:    #DB5A5A;
--damaged:   #A25AC7;
--neutral-state: #6E6E6E;
```

### 2.4 Hard rule

If a component you're building has any fill color other than black/gray/white, it must be a status dot from §2.3 and nothing else. No brand accent exists. No "pop" moment exists. If a screen looks like it needs a splash of color to feel finished, it doesn't — add more contrast (white text weight, spacing, a border) instead of color.

---

## 3. Typography

| Role | Font | Used for |
|---|---|---|
| UI / display | **Geist Sans** | Everything — headings, nav, buttons, body. This is the actual Vercel typeface and matches the reference exactly. |
| Monospace | **Geist Mono** | Asset tags, serial numbers, IDs, timestamps — used plainly as inline text, not as a colored/bordered "chip" (v1's boxed identity-chip look was heavier than the reference; keep it to plain `font-mono text-muted-foreground` inline, occasionally with a very subtle `border-border` box only in dense tables where alignment needs it) |

Scale:
```
text-2xl  font-medium tracking-tight     → Page titles ("Analytics", "Projects") — reference headings are medium weight, not heavy/bold
text-lg   font-medium                     → Section headers, card titles
text-sm   font-medium                     → Nav items, table headers, labels
text-sm   font-normal text-muted-foreground → Body copy, secondary information
text-xs   text-muted-foreground            → Meta text, timestamps, helper copy
font-mono text-sm                          → Asset tags, serials, IDs
```

No italics. No serif. No gradient text. The marketing-page reference uses a plain heavy sans headline with a thin monospace-style all-caps subline (`FOR CODING AGENTS`) — reuse that exact pattern for AssetFlow's own login screen headline treatment (see §8.1), not a display serif or gradient sweep.

---

## 4. Layout System

### 4.1 App shell — copied directly from the dashboard reference

```
┌──────────────┬──────────────────────────────────────────────┐
│  org switcher │  breadcrumb / page selector      [right: nothing│
│  (top)        │                                    or minimal]  │
├──────────────┼──────────────────────────────────────────────┤
│  search "Find"│                                                │
│  ⌘F           │                                                │
│              │                                                │
│  nav (icon +  │              Page content                     │
│  label rows,  │                                                │
│  ~14px icons) │                                                │
│              │                                                │
│  ── divider   │                                                │
│  more items   │                                                │
│              │                                                │
│  account row  │                                                │
│  (bottom,     │                                                │
│  pinned)      │                                                │
└──────────────┴──────────────────────────────────────────────┘
```

- Sidebar: `bg-surface`, fixed 240px, 1px right `border-border`. Top: workspace/org switcher (avatar + name + plan badge, chevron) exactly like "Vinit · Hobby" in the reference. Below it: a search row styled as a fake input ("Find" + a small `F`/`⌘K` key-cap hint on the right, `bg-card border border-border rounded-md`).
- Nav items: icon (16–18px, `text-muted-foreground`) + label (`text-sm`), `text-muted-foreground` default. **Active item**: `bg-card` (a very slightly lighter fill, not a colored pill), `text-foreground`, icon turns `text-foreground` too — no colored rail, no colored background, exactly as understated as the reference's "Analytics" active state.
- A `border-t border-border` divider separates primary nav from secondary items (Environment Variables / Domains-equivalent items → for AssetFlow: this is where Reports, Notifications live below a divider from the core operational nav).
- Bottom-pinned account row: small avatar, truncated user/handle text, a "…" menu icon, and a bell/notification icon — same row structure as the reference's bottom account bar.
- Topbar/header row (not a separate bar with a border in the reference — it's just the first row of content): left side shows a page-context switcher (e.g. "All Projects ⌄" → for AssetFlow use "Organization ⌄" or similar page-scope selector where relevant), right side shows the current section label ("Overview" equivalent). Keep this light — it's not a heavy chrome bar, just breathing room above the content per the reference.
- Content area: generous padding (`px-10 py-8`), `max-w-none` (the reference dashboard uses near-full width, not a constrained centered column) — let content breathe to the edges with consistent gutters instead of artificially capping at 1400px.

### 4.2 Grid, spacing, radius

- Corner radius: `rounded-lg` (8px) for cards and buttons, `rounded-md` (6px) for inputs/small controls — smaller and tighter than v1's `rounded-xl`, matching the reference's crisp, not-too-round corners.
- Card padding: `p-5`–`p-6`. Section gaps: `gap-4`–`gap-6`.
- Borders, always: `border border-border`. No `shadow-*` for structural separation anywhere — reserve any shadow (`shadow-sm` at most) only for genuinely floating layers (popovers, dialogs, dropdown menus), and keep it subtle/dark, never a soft glow.
- Skeleton loading blocks (visible in the reference's "Recent Previews"/project list placeholders): plain `bg-white/5` rounded bars, `animate-pulse` — no shimmer gradient sweep, just a flat pulsing gray block. Build this once as `<Skeleton>` and reuse for every loading state in the app.

---

## 5. Core Component Patterns

### 5.1 Buttons
- **Primary** (one per view max): solid `bg-primary text-primary-foreground` (off-white fill, near-black text), `rounded-md`, e.g. "Add New", "Create account" in the references.
- **Secondary/outline**: `border border-border bg-transparent text-foreground`, e.g. "Talk to Sales", "Log In".
- **Ghost/icon buttons**: no border, no fill, `text-muted-foreground hover:text-foreground hover:bg-white/5` — used for row-level actions, sidebar icons, toolbar icons.
- **Destructive**: same shape as secondary/outline but `text-danger border-danger/30`, never a solid red fill block — destructive actions in this reference-driven system stay quiet until confirmed via `AlertDialog`, they don't shout with a red button.

### 5.2 Cards / panels
`bg-card border border-border rounded-lg p-5`. No hover lift, no shadow — at most a `hover:bg-card-hover` on interactive cards (matching the reference's understated project-card hover). Card headers: `text-sm font-medium text-foreground` + optional `text-xs text-muted-foreground` subtitle, plus an optional top-right ghost icon button (e.g. an info `i` icon, exactly like the "Fast Data Transfer ⓘ" rows in the reference).

### 5.3 KPI-style numeric rows (Dashboard)
The reference shows usage stats as **plain list rows**, not oversized colorful number cards: label + small info icon on the left, value right-aligned in `font-mono text-sm text-foreground`, sometimes with a progress/usage bar (`bg-white/10` track, `bg-white` or `bg-foreground/70` fill, no color-by-metric). AssetFlow's Dashboard KPIs (Assets Available, Allocated, etc.) should follow this exact list-row pattern inside a bordered card, not the large colorful `text-4xl` count-up tiles from v1. Numbers are `text-foreground`, not colored — there is no "pop" accent left to color them with.

### 5.4 Status dots
Per §2.3 — the only recurring "identity" component now is a plain inline pattern, not a boxed chip:
```html
<span class="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
  <span class="h-2 w-2 rounded-full bg-[var(--success)]"></span>
  Available
</span>
```
Build once as `<StatusDot status="available" />`, reuse everywhere a lifecycle/workflow state appears (tables, cards, kanban, notifications).

### 5.5 Identity text (asset tags, serials, IDs)
Plain `font-mono text-sm text-foreground` inline text — e.g. `AF-0114`. Only add a `border border-border rounded px-1.5 py-0.5` box treatment inside dense tables where visual separation from adjacent columns genuinely helps scanning; don't box it everywhere by default the way v1 did.

### 5.6 Tables
`@tanstack/react-table` + shadcn `Table`. Header row `text-xs uppercase tracking-wide text-muted-foreground border-b border-border`. Rows separated by `border-b border-border` only (no zebra striping — matches the flat, quiet look of both references). Row hover: `bg-white/[0.03]`. Row click → right `Sheet` detail panel, `bg-surface border-l border-border`, slide-in via Motion (`260ms`, no bounce/spring — a clean linear-ish ease matching the references' restrained motion).

### 5.7 Empty / loading / error states
- Loading: the flat pulsing `<Skeleton>` blocks from §4.2 — shaped like the real content.
- Empty: centered icon (`lucide`, 32px, `text-muted-foreground`), one line of copy in plain language, one ghost/outline button if an action applies. Matches the reference's calm "Deploy your first project" empty state — a plain upload-cloud icon, a clear headline, one supporting line, no illustration, no color.
- Error: inline `Alert` with `border-danger/30 text-danger`, never a full-page break.

### 5.8 Forms
`react-hook-form` + `zod`. Inputs: `bg-card border border-border rounded-md text-sm`, focus state `border-border-strong ring-1 ring-white/10` (no colored focus ring). Inline errors: `text-xs text-danger` under the field.

---

## 6. Motion Guidelines

Motion exists only to clarify a state change, never to decorate. No particle backgrounds, no gradient sweeps, no spring-bounce, no shiny-text effects anywhere in this product — neither reference screenshot has any of that.

- Route/page content: simple `opacity 0→1`, 150ms, linear-ish ease — no vertical rise, no scale.
- Sheet/dialog open: slide or fade, 200–260ms, no overshoot/spring.
- Status change (e.g. ticket moves to Resolved): the dot color updates instantly; optionally a single 300ms `bg-white/5` flash on the row to mark "this just changed," then settle — no color flash tied to the status hue, since color is reserved purely for identification, not celebration.
- Skeleton pulse: standard Tailwind `animate-pulse`.
- Respect `prefers-reduced-motion` globally.

---

## 7. Accessibility & Consistency Floor

- Visible focus ring on every interactive element: `ring-1 ring-white/20 ring-offset-1 ring-offset-background`.
- Status is never color-only: always dot **and** text label.
- Contrast: `--foreground` (#EDEDED) on `--background`/`--card` must stay comfortably AA — don't darken further for effect.
- Dialogs/sheets trap focus, close on `Esc`; toasts use `sonner`'s built-in `aria-live`.
- Responsive floor: works to 375px — sidebar collapses into a `Sheet` behind a hamburger, tables become stacked rows, kanban becomes horizontally scrollable or a list view.

---

## 8. Page Notes (carried over from the functional brief — visual treatment now follows §§1–7 above)

All ten screens (Login/Signup, Dashboard, Organization Setup, Asset Registry, Allocation & Transfer, Resource Booking, Maintenance Kanban, Audit, Reports, Activity Log) keep the **same functional structure** already scoped in earlier prompts — only the visual language changes:

- Replace every colored KPI tile with the plain list-row pattern (§5.3).
- Replace every colored status badge/pill with the plain `StatusDot` (§5.4).
- Replace every boxed "identity chip" with plain inline mono text (§5.5), boxed only in dense tables.
- Remove the aurora/gradient login treatment entirely — the Login/Signup screen instead follows the **marketing reference exactly**: pure black canvas, a plain top nav (logo mark left, nav links center, "Log In" outline + "Sign Up" filled-white buttons right), a large `text-4xl`–`text-5xl` `font-medium` headline ("Track every asset. Manage every space." or similar plain benefit statement — no italics, no gradient), a small all-caps monospace-style subline under it, and the actual login/signup form appearing either inline below the hero or as a simple centered card — no split-screen photo panel, no particle background. A subtle radial white glow (like the reference's glowing triangle) behind a simple AssetFlow mark is the one allowed "atmospheric" touch, and it must be a plain radial-gradient glow in white/gray only, not colored.
- The Maintenance Kanban board (§8.7 in the original functional spec) keeps its drag-and-drop structure and column rules exactly as previously scoped — just re-skin cards/columns per §5.2/§5.4 above (no colored card borders for "Resolved," a plain `StatusDot` is enough).

---

## 9. File/Folder Convention

```
components/ui/          shadcn primitives — cva variants only, don't hand-restyle
components/shared/       StatusDot, Skeleton, PageHeader, EmptyState — build ONCE, import everywhere
components/motion/       thin wrappers around Motion primitives (FadeIn, SlideSheet)
app/(dashboard)/<page>/  one route group per screen
lib/tokens.ts            re-export the §2.3 status color map — no page ever writes bg-[#...] literally
```

---

## 10. Quick Checklist Before You Ship a Screen

- [ ] Background is `--background` (#000000) or `--surface`, never anything warmer/lighter than spec
- [ ] Every boundary is a 1px `border-border` line — no shadows, no glow, no gradients
- [ ] The only color anywhere is a status dot from §2.3 — nothing else has a hue
- [ ] One primary (solid white/off-white) button max per view; everything else is outline or ghost
- [ ] Headings/body in Geist Sans, IDs/tags/timestamps in Geist Mono, no other fonts
- [ ] No React Bits / particle / shiny-text / bounce animation anywhere
- [ ] Loading = flat pulsing skeleton, empty = plain icon + one line + one action, error = inline alert
- [ ] Works at 375px, visible focus rings, status never color-only