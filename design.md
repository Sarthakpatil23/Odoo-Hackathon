# AssetFlow — Design System & UI/UX Bible
### Enterprise Asset & Resource Management Platform
**Version 1.0 — Single source of truth for every page, every agent, every PR.**

> Read this whole document before building any screen. Do not invent your own colors, spacing, fonts, or component patterns. If something isn't covered here, pick the closest existing pattern and extend it consistently — don't improvise a new visual language.

---

## 0. Design Thesis

AssetFlow is enterprise software, not a landing page. The people using it are Admins, Asset Managers, Department Heads, and Employees clicking through this dozens of times a day — the UI has to disappear into the work. But "enterprise" does not mean boring. The reference feeling is **Linear × Vercel Dashboard × Arc Browser**: a disciplined near-black neutral base, razor-sharp typography, generous whitespace, and one confident brand color doing all the talking — with small, deliberate bursts of color used as *information*, not decoration (status dots, KPI deltas, avatar rings, chart series).

**The signature idea for AssetFlow:** every physical asset has an identity — a tag (`AF-0114`), a serial number, a lifecycle. We treat these identifiers as first-class typographic citizens: rendered in monospace, in little "ledger" chips, everywhere an asset is referenced. This is the one recurring visual motif that ties all 10 screens together and makes the product feel like it was *designed for tracking things*, not a generic CRUD admin panel.

Three rules override everything else in this document:
1. **Neutral base, one brand accent, semantic status colors.** Never introduce a new arbitrary color for decoration.
2. **Monospace for identity, sans for narrative.** Asset tags, serials, IDs, timestamps, audit codes → mono. Everything else → sans.
3. **Motion explains state change, not decoration.** If an element moves, it's because something in the data changed (status flip, new row, approval).

---

## 1. Tech Stack (what every agent must use)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 | Server Components by default; `"use client"` only where interactivity is required |
| Styling | Tailwind CSS v4 + CSS variables | Tokens defined once in `globals.css`, never hardcode hex in components |
| Component primitives | **shadcn/ui** (`new-york` style, `neutral` base, `cssVariables: true`) | Installed via CLI into `components/ui/` — you own the code, don't fork it into a different pattern per page |
| Animation (app-level) | **Motion** (the renamed Framer Motion, `motion/react`) | Page transitions, layout animations, drawer/sheet motion, shared-layout transitions between list ↔ detail |
| Animation (flourish/marketing-adjacent) | **React Bits** (`npx shadcn@latest add "https://reactbits.dev/r/<component>"`) | Used *only* in the specific spots called out per-screen below — never sprinkle randomly |
| Icons | `lucide-react` | One icon set, one stroke width (1.75px), never mix in other icon packs |
| Tables | `@tanstack/react-table` + shadcn `Table` primitives | For Asset Directory, Employee Directory, Audit lists |
| Forms | `react-hook-form` + `zod` | Every form: schema-validated, inline errors, no `alert()` |
| Charts | shadcn `Charts` (Recharts under the hood) | Reports & Analytics screen |
| Calendar / booking grid | `react-day-picker` (already in shadcn `Calendar`) for date pick; custom CSS-grid timeline for the Resource Booking calendar view | See §8.6 |
| Command palette | `cmdk` (shadcn `Command`) | Global ⌘K — quick actions from the problem statement's "Quick actions" |
| ToNews/toasts | `sonner` (shadcn default) | All success/error/undo feedback — never custom toast components |
| Theme switching | `next-themes` | Default theme is **dark**. Light mode is supported but dark is the flagship experience — see §2 |
| State/data | React Query (TanStack Query) for server state | Not a UI concern but keep loading/error/empty states consistent (§7) |

Don't introduce Chakra, MUI, Ant Design, Bootstrap, or raw unstyled HTML form elements anywhere. If a shadcn primitive almost fits, extend its `cva` variants — don't build a parallel one-off component.

---

## 2. Color System

We ship **dark mode as the primary, default experience** (this is what makes an ERP tool look premium instead of like a spreadsheet). Light mode uses the same tokens inverted — implement both, but every screenshot/demo/judging pass should default to dark.

All colors are defined as CSS variables in OKLCH, exposed via Tailwind `@theme inline`, exactly like shadcn's own convention — so `bg-primary`, `text-muted-foreground`, `border-border` etc. keep working everywhere.

### 2.1 Neutral base (black / grey / white)

```css
:root {
  --background:        oklch(0.99 0 0);      /* near white, light mode */
  --foreground:         oklch(0.145 0 0);
  --card:               oklch(1 0 0);
  --card-foreground:    oklch(0.145 0 0);
  --border:             oklch(0.90 0 0);
  --muted:              oklch(0.96 0 0);
  --muted-foreground:   oklch(0.46 0 0);
}

.dark {
  --background:         oklch(0.145 0 0);    /* #0A0A0B — near-black canvas */
  --foreground:         oklch(0.96 0 0);     /* #F2F2F3 */
  --card:               oklch(0.19 0 0);     /* #17171A — panel surface */
  --card-foreground:    oklch(0.96 0 0);
  --popover:            oklch(0.21 0 0);     /* #1C1C20 — elevated surface (menus, dialogs) */
  --border:             oklch(0.28 0 0);     /* #2A2A2E hairline */
  --input:              oklch(0.28 0 0);
  --muted:              oklch(0.23 0 0);
  --muted-foreground:   oklch(0.64 0 0);     /* #9A9AA2 secondary text */
  --ring:               var(--primary);
}
```

Three-level elevation only: **canvas → card → popover/dialog.** Never invent a fourth grey. Sidebar sits at the same level as `--card` with a 1px `--border` seam, not a different shade.

### 2.2 Brand accent — "Iris"

The **one** brand color. Used for: primary buttons, active nav item, focus rings, links, the logo mark, progress bars, selected states, the command palette accent, chart line #1.

```css
--primary:            oklch(0.62 0.19 275);   /* Iris — ~#6D5EF5 */
--primary-foreground: oklch(0.99 0 0);
```

Do not use Iris for anything semantic (never "Iris = success" or "Iris = error"). It means *brand / primary action / focus* — nothing else.

### 2.3 Semantic status palette (this *is* the product's color story)

Every asset lifecycle state, booking state, and workflow state maps to exactly one of these — used consistently as: a small filled dot (8px) + text badge, never a solid color block filling large areas. This is where the UI "pops" without looking like a rainbow.

| State | Color token | Hex (dark bg) | Used for |
|---|---|---|---|
| Available / Verified / Approved / Completed | `--success` | `#2FD675` emerald | Asset available, audit verified, transfer approved |
| Allocated / Ongoing / In Progress | `--info` | `#4C8DFF` sky blue | Asset allocated, booking ongoing, maintenance in progress |
| Reserved / Upcoming / Pending | `--warning` | `#F5A524` amber | Reserved asset, pending approval, upcoming booking |
| Under Maintenance / Priority-High | `--attention` | `#FF8A3D` orange | Under maintenance, high-priority maintenance ticket |
| Lost / Rejected / Overdue / Missing | `--danger` | `#F6465D` coral-red | Lost asset, overdue return, rejected request, missing in audit |
| Damaged (audit-specific) | `--damaged` | `#C026D3` magenta | Reserved *only* for "Damaged" audit flag — the one place we allow a 5th hue, because it must never be confusable with Lost/Missing |
| Retired / Disposed / Cancelled / Inactive | `--neutral-state` | `#8B8B93` slate grey | Retired, disposed, cancelled booking, deactivated department |

```css
.dark {
  --success:        oklch(0.72 0.19 155);
  --info:            oklch(0.62 0.19 255);
  --warning:         oklch(0.78 0.16 75);
  --attention:       oklch(0.72 0.18 45);
  --danger:          oklch(0.62 0.20 15);
  --damaged:         oklch(0.55 0.22 320);
  --neutral-state:   oklch(0.62 0 0);
}
```

Add these as real Tailwind tokens (`bg-success`, `text-success`, `border-success/30`, etc.) via `@theme inline`, exactly the way shadcn's docs show for adding a custom `--warning` token — don't hardcode hex anywhere in component code.

### 2.4 The "pop" accent — Signature detail, used sparingly

One secondary accent, **cyan** (`--pop: oklch(0.78 0.14 200)` ≈ `#3AD6D6`), reserved for exactly three things across the whole app:
1. KPI card count-up numbers on the Dashboard (the number itself, not the card).
2. The active/selected day in the Resource Booking calendar.
3. Chart series #2 in Reports & Analytics (Iris = series 1, Cyan = series 2, Amber = series 3).

Nowhere else. This is the "small colorful element in the middle of black/grey/white" the brief asked for — it must stay rare to stay special.

### 2.5 Hard rule

If you find yourself reaching for a hex code not listed above, stop — you're about to break consistency. Ask: is this a **status** (use §2.3), the **brand** (use Iris), or a rare **pop** moment (use Cyan, and only in the 3 sanctioned spots)? There is no fourth category.

---

## 3. Typography

Three font roles, loaded via `next/font`:

| Role | Font | Used for |
|---|---|---|
| Display / UI sans | **Geist Sans** (fallback: Inter) | All headings, nav, buttons, body copy — the entire interface |
| Monospace / data | **Geist Mono** (fallback: JetBrains Mono) | Asset tags (`AF-0114`), serial numbers, employee IDs, audit cycle codes, timestamps, table numeric columns |
| — | *(no third display face)* | An ERP tool has one job: read data fast. Two font families is correct restraint, not a shortfall. |

Type scale (Tailwind classes, use these exact steps — don't free-hand font sizes):

```
text-3xl  font-semibold tracking-tight   → Page titles ("Asset Registry", "Organization Setup")
text-xl   font-semibold tracking-tight   → Section headers within a page, dialog titles
text-sm   font-medium                    → Card labels, table headers, nav items
text-sm   font-normal text-muted-foreground → Body copy, helper text, table cells
text-xs   font-medium uppercase tracking-wide text-muted-foreground → Eyebrow labels, KPI card labels
font-mono text-sm                        → Every asset tag / serial / ID / timestamp, always in a chip (see §5.4)
```

KPI numbers on the dashboard: `text-4xl font-semibold tabular-nums text-pop` (cyan, per §2.4).

---

## 4. Layout System

### 4.1 App shell (used on every authenticated screen)

```
┌──────────────┬──────────────────────────────────────────────┐
│              │  Topbar: breadcrumb · global search (⌘K) ·    │
│   Sidebar    │  notifications bell · theme toggle · avatar   │
│  (240px,     ├──────────────────────────────────────────────┤
│  collapsible │                                                │
│  to 64px     │              Page content                     │
│  icon rail)  │        max-w-[1400px] mx-auto, px-8 py-6       │
│              │                                                │
└──────────────┴──────────────────────────────────────────────┘
```

- Sidebar: `bg-card`, 1px right `border-border` seam. Sections grouped by role-relevant nav (Dashboard, Assets, Allocations, Bookings, Maintenance, Audits, Organization Setup*, Reports, Notifications) — items hidden per RBAC, never shown-then-disabled.
- Active nav item: left 2px `bg-primary` rail + `text-foreground` + subtle `bg-primary/10` pill background. Inactive: `text-muted-foreground`, hover → `text-foreground bg-muted`.
- Sidebar collapse persists via `next-themes`-style cookie; icon-only rail keeps `lucide-react` icons at 20px, tooltips on hover (shadcn `Tooltip`).
- Topbar height 56px, `border-b border-border`, `bg-background/80 backdrop-blur` (sticky).
- Mobile (<768px): sidebar becomes a `Sheet` triggered from a hamburger in the topbar — never just hide nav items.

### 4.2 Grid & spacing

- Base spacing unit: 4px (Tailwind default). Card padding: `p-6`. Section gaps: `gap-6`. Page-level vertical rhythm: `space-y-6`.
- Card corner radius: `rounded-xl` (12px) everywhere — buttons `rounded-lg` (8px), badges/chips `rounded-full`. Never mix radius scales.
- Border: always `border border-border`, never a drop shadow as the primary separator in dark mode (shadows read poorly on near-black — use borders + subtle elevation via `--card` vs `--popover` instead). Reserve `shadow-lg` for floating layers only (dropdowns, dialogs, popovers).

---

## 5. Core Component Patterns

### 5.1 Buttons
- Primary action: shadcn `Button` default variant → `bg-primary text-primary-foreground`. One primary button per view/section, max.
- Secondary: `variant="outline"` (border-border, transparent bg).
- Destructive (Reject, Mark Lost, Disable): `variant="destructive"` → maps to `--danger`, always behind an `AlertDialog` confirmation.
- Icon-only buttons: `size="icon"`, always paired with a `Tooltip`.
- Never use `variant="ghost"` for primary CTAs — ghost is for toolbar/table-row actions only.

### 5.2 KPI Cards (Dashboard)
`Card` with: eyebrow label (`text-xs uppercase text-muted-foreground`), big `text-pop` count-up number (animate via React Bits `CountUp`/`NumberTicker` on mount — 800ms ease-out, once per page load, never re-trigger on re-render), small delta chip below (`+12%` in `--success` or `--danger` with a tiny lucide `ArrowUp`/`ArrowDown`). Overdue-specific KPI cards get a 1px `border-danger/40` and a subtle `bg-danger/5` tint — the *only* KPI cards allowed a colored border, because overdue items are the one thing that must visually interrupt.

### 5.3 Status badges (the recurring motif)
Every lifecycle state anywhere in the app (asset status, booking status, maintenance stage, audit result) renders as the same atomic component:

```
[● dot 8px, semantic color][text-xs font-medium, semantic color, on a pill: bg-{color}/10, rounded-full, px-2.5 py-0.5]
```
e.g. `● Available` in emerald, `● Under Maintenance` in orange, `● Lost` in coral. Build this once as `<StatusBadge status="available" />` and reuse everywhere — never restyle status text per-page.

### 5.4 Identity chips (asset tags, serials, IDs) — the signature motif
```
<span class="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
  AF-0114
</span>
```
Used for Asset Tag, Serial Number, Employee ID, Audit Cycle Code, Booking Reference. Clicking one (where applicable) copies to clipboard with a `sonner` toast confirmation and a quick scale-tap micro-animation (Motion `whileTap={{scale:0.95}}`).

### 5.5 Tables
`@tanstack/react-table` + shadcn `Table`. Sticky header, zebra-free (rely on `border-border` row dividers, not alternating fills — keeps the neutral base calm), row hover → `bg-muted/50`. Row click opens a right-side `Sheet` detail panel (asset history, employee profile) rather than full navigation, so users keep table context — animate the sheet in with Motion's `slide from right, 260ms, ease: [0.32, 0.72, 0, 1]`.

### 5.6 Empty / loading / error states
- Loading: shadcn `Skeleton` matching the real layout's shape — never a generic spinner for content areas (spinners only inside buttons mid-submit).
- Empty state: centered icon (lucide, 40px, `text-muted-foreground`) + one-line description in the interface's voice ("No assets match these filters." not "Oops! Nothing here 😅") + one primary action if applicable ("Clear filters" / "Register an asset").
- Error state: inline, in-context, using `Alert` `variant="destructive"` — never a full-page crash screen for recoverable errors.

### 5.7 Forms
`react-hook-form` + `zod`, shadcn `Form` primitives. Inline field errors under the input in `text-xs text-danger`. Multi-step forms (Asset Registration, Audit Cycle creation) use a shadcn `Tabs`-driven stepper with a slim progress bar (`bg-primary`) at the top, not numbered circles unless the steps are a genuinely fixed sequence (see frontend-design guidance — don't decorate with "01/02/03" if it isn't a real ordered process; the maintenance workflow *is* a real sequence, so numbering is earned there, see §8.7).

---

## 6. Motion Guidelines

**Motion (the library)** for anything tied to real interaction/state:
- Page-level content fade+rise on route change: `opacity 0→1, y: 8→0, 200ms`.
- Shared layout transitions between a table row and its detail `Sheet`/dialog (`layoutId`).
- Status change: when a badge changes state (e.g., maintenance Approved), animate the dot color + a soft 400ms background flash of the new semantic color at 10% opacity, then settle — this is the one "celebratory" motion moment allowed per state change, and it must always mean something real happened.
- List insert/remove (new booking added, notification arrives): `AnimatePresence` with height+opacity collapse, 220ms.

**React Bits** — sanctioned use only:
- Login screen background: `Aurora` or `Particles` component, subtue, slow, in near-black + Iris/Cyan tint at low opacity — this is the one screen allowed to feel a little cinematic, because it's the first impression and has zero data density to protect.
- Login/marketing wordmark: `GradientText` (Iris → Cyan sweep) on the "AssetFlow" logotype only.
- KPI numbers: `CountUp` / `NumberTicker`.
- Empty-state illustrations on first-run screens (e.g. "No departments yet"): a single subtle `FadeContent` reveal — nothing else.
- Do **not** use ClickSpark, Ballpit, FlyingPosters, 3D model viewers, or any playful/marketing-grade component anywhere inside the operational screens (3–10). Those screens are for getting work done; motion there stays purposeful and quiet per the rules above.

Respect `prefers-reduced-motion` globally — Motion's `useReducedMotion()` hook gates all non-essential animation.

---

## 7. Accessibility & Consistency Floor (non-negotiable for every page)

- Every interactive element has a visible focus ring: `ring-2 ring-ring ring-offset-2 ring-offset-background`.
- Color is never the only signal — status badges always pair a dot **and** text; destructive actions always have a confirming dialog **and** the word "Delete/Reject/Mark Lost" in it, not just a red button.
- Contrast: body text on `--background` and `--card` must hit WCAG AA (already true of the tokens above — don't lighten `--muted-foreground` further for "aesthetic" reasons).
- All dialogs/sheets trap focus and close on `Esc`; toasts are announced via `aria-live` (sonner handles this by default — don't replace it with a custom toast).
- Responsive floor: every screen must work down to 375px width using the same components restructured (table → stacked cards, sidebar → sheet), never a stripped-down "mobile version" that drops functionality.

---

## 8. Page-by-Page Specification

Shared rule for every page below: page title `text-3xl font-semibold`, an eyebrow breadcrumb above it, one primary CTA top-right of the header row, filters/search directly under the header, content below.

### 8.1 Login / Signup
- Split screen on desktop: left 55% — the form (card-less, transparent, on the animated Aurora/particle background from §6); right 45% (or full-bleed behind on mobile) — reserved for the Aurora animation and the `GradientText` "AssetFlow" wordmark with a one-line tagline.
- Form: email/password (shadcn `Input` + `Label`), "Forgot password" link in `text-primary`, primary `Button` "Log in" full width. Signup is a **separate tab/route** that only ever creates an Employee account — no role selector anywhere on this screen (enforce this in UI copy too: a small `text-xs text-muted-foreground` note "Your workspace admin can grant additional access later").
- Session/forgot-password flows use the same card, swapped via Motion crossfade, not a full page reload feel.

### 8.2 Dashboard / Home
- Row 1: 6 KPI cards in a responsive grid (`grid-cols-2 md:grid-cols-3 xl:grid-cols-6`) per §5.2 — Assets Available, Assets Allocated, Maintenance Today, Active Bookings, Pending Transfers, Upcoming Returns.
- Row 2: two-column split — left `Card` "Overdue Returns" (danger-tinted per §5.2, list of identity chips + employee + days-overdue in `--danger`), right `Card` "Upcoming Returns" (neutral card, same list shape, `--info`/`--warning` badges) — visually distinct so overdue never blends with upcoming.
- Row 3: "Quick actions" — three large `Button variant="outline"` tiles with icon + label (Register Asset, Book Resource, Raise Maintenance Request), hover lifts `-translate-y-0.5` with Motion spring.
- Role-aware: Admin sees org-wide KPIs; Department Head/Employee see scoped KPIs — same components, filtered data, never a different layout per role.

### 8.3 Organization Setup (Admin only, 3 tabs)
- shadcn `Tabs` at the top of the page (Departments / Asset Categories / Employee Directory) — this *is* a legitimate use of a fixed, small, top-level nav pattern (not numbered, just labeled tabs).
- **Departments tab:** table with columns Name · Head (avatar+name) · Parent Dept (identity chip if hierarchical) · Status badge · actions. "Create Department" opens a `Dialog` form (name, head select, parent dept select, status toggle). Hierarchy shown via an indent + thin connecting line in the table's Name column, not a separate tree widget.
- **Asset Categories tab:** card grid (not table) — one card per category with icon, name, and a small "N custom fields" chip; clicking opens category editor `Sheet` for optional fields (e.g. warranty period).
- **Employee Directory tab:** table (Name · Email · Department · Role badge · Status). Role badge uses **neutral outline badges** (Admin/Asset Manager/Dept Head/Employee) — deliberately *not* the semantic status colors from §2.3, because role ≠ lifecycle state; use `variant="outline"` with `text-foreground` so it's visually distinct from asset-status badges. "Promote" action (Asset Manager/Department Head) lives in each row's actions menu — this is the *only* place role assignment happens in the whole app, and the row action is explicitly labeled "Promote to…", never a generic "Edit".

### 8.4 Asset Registration & Directory
- Header: search bar (icon-left `Input`) + filter `Popover` (category, status, department, location — shadcn `Select`/`Checkbox` combo) + view toggle (table/grid) + primary "Register Asset" button.
- Table: Asset Tag (mono chip, §5.4) · Name · Category · Status (StatusBadge) · Department · Location · Condition · Acquisition Cost (`tabular-nums`, right-aligned). Row click → right `Sheet`: photo, full details, **Allocation history** and **Maintenance history** as two stacked `Tabs` inside the sheet, each a simple timeline (vertical line + dot per event, timestamp in mono).
- Register form: multi-section single scroll (not a wizard) — Basic Info, Category-specific fields (dynamically rendered based on category chosen, per §8.3), Financial (cost — labeled clearly "for reporting only, not linked to accounting" as a small helper note), Media (drag-drop upload), and a "Shared/Bookable" `Switch`.
- QR code: each asset detail sheet shows a generated QR (small, top-right of the sheet) that encodes the Asset Tag for the search-by-QR flow.

### 8.5 Asset Allocation & Transfer
- Two tabs: "Active Allocations" (table: Asset chip · Holder · Department · Allocated Date · Expected Return · overdue `StatusBadge` if applicable) and "Transfer Requests" (table with workflow `StatusBadge`: Requested/Approved/Re-allocated).
- Allocate flow: select asset → if already allocated, **do not** silently block — show an inline `Alert` (info-tone, not destructive) reading "Currently held by Priya Sharma" with her avatar, and swap the primary button from "Allocate" to "Request Transfer" in the same dialog (per the exact example in the brief) — this state-swap should animate via Motion crossfade, not a page reload.
- Return flow: a small dialog — condition check-in notes `Textarea` + condition `Select` (Good/Fair/Damaged) — confirms, asset status flips to Available with the status-change flash from §6.

### 8.6 Resource Booking
- Left: resource list/sidebar (rooms, vehicles, equipment) with a small `Badge` showing today's booking count.
- Right: a **custom weekly timeline grid** (CSS grid, hours down the left in mono, days across the top) — existing bookings render as colored blocks using the *booking-status* semantic colors (Upcoming = info, Ongoing = success — pulsing subtle 2s opacity breathing animation via Motion *only* on Ongoing blocks so "happening right now" reads at a glance, Completed = neutral-state, Cancelled = neutral-state with strikethrough text).
- New booking: click-drag on the grid to select a time range → `Popover` confirms time + purpose → on submit, overlap validation runs; a rejected overlapping request shows an inline `Alert destructive` directly under the time picker explaining the conflicting booking (mirroring the Room B2 example in the brief), not a generic toast.
- The single "pop" cyan accent (§2.4) marks "today" as a highlighted column on this grid.

### 8.7 Maintenance Management
- This is a genuine linear sequence, so a **numbered horizontal stepper is earned here**: `Pending → Approved/Rejected → Technician Assigned → In Progress → Resolved`, rendered as a shadcn-style stepper with connecting lines, current step in `--primary`, completed steps in `--success`, using real numbers because this reflects an actual fixed workflow order (per the frontend-design principle: numbering must encode real sequence, and this one does).
- Ticket list: table with Asset chip · Issue (truncated) · Priority badge (Low=neutral, Medium=warning, High=attention, using the same semantic scale, not a new one) · Stage stepper (compact/mini version inline in the row) · Assigned technician avatar.
- Raise request form: asset select (autocomplete by tag/name), issue `Textarea`, priority `Select`, photo attach. Approve/Reject buttons only visible to Asset Manager role — Reject requires a reason `Textarea` in a confirm dialog.

### 8.8 Asset Audit
- "Create Audit Cycle" primary action → dialog: scope (department/location `Select`), date range (shadcn `Calendar` range picker), auditor multi-select (`Command`-based combobox with avatars).
- Audit cycle detail page: header shows Cycle Code (mono chip) + date range + auditor avatars + a big `Badge` (Open/Closed).
- Verification table: Asset chip · Expected Location · Auditor's mark (three-button segmented control: Verified/Missing/Damaged — Verified=success, Missing=danger, Damaged=`--damaged` magenta from §2.3). As auditors mark items, a live discrepancy counter updates at the top (`text-danger` count + `text-damaged` count).
- "Close Audit Cycle" is a destructive-tier confirm (`AlertDialog`) since it locks the cycle and flips confirmed-missing assets to Lost — copy explicitly states the consequence ("This will mark 3 assets as Lost and lock this cycle. This can't be undone.").
- Auto-generated discrepancy report renders as a simple printable/exportable `Card` list, reusing the same StatusBadge + identity chip components — never a bespoke report layout.

### 8.9 Reports & Analytics
- Filter bar: date range + department + category, applies to all charts on the page at once (single source of truth, not per-chart filters).
- Charts (shadcn Charts/Recharts): utilization trend (line, Iris + Cyan series), maintenance frequency by category (bar, Iris), assets nearing retirement (a simple sortable table with a "days remaining" progress bar using `--warning`→`--danger` gradient as it approaches 0), department-wise allocation (horizontal bar), booking heatmap (calendar-heatmap style grid, intensity via `--primary` opacity steps, not a rainbow scale).
- Every chart card has an "Export" icon button (top-right, ghost icon button) → CSV/PDF via a small dropdown, consistent across every chart.

### 8.10 Activity Logs & Notifications
- Notification bell in the topbar opens a `Popover`/`Sheet` with grouped-by-day notification items — each item: small semantic-colored icon dot (reuse §2.3 mapping: approval=success, rejection=danger, reminder=warning, overdue=danger), bold action text, relative timestamp in `text-muted-foreground`, and an identity chip linking to the relevant asset/booking.
- Full Activity Log page: a dense, table-first audit trail (Actor avatar+name · Action · Target identity chip · Timestamp mono · Role badge) with filters by role/action-type/date — this is the one screen where density beats whitespace, since its entire purpose is scanning history; still uses the same `Table`, `StatusBadge`, and identity-chip primitives as every other screen.

---

## 9. File/Folder Convention (so agents don't collide)

```
components/ui/          shadcn primitives — do not hand-edit style beyond cva variants in §5
components/shared/       StatusBadge, IdentityChip, KpiCard, EmptyState, PageHeader — build ONCE, import everywhere
components/motion/       wrapper components around Motion primitives (FadeIn, SlideSheet, CountUp wrapper)
app/(dashboard)/<page>/  one route group per screen from §8, colocate page-specific components in a local components/ subfolder only if truly not reusable
lib/tokens.ts            re-export the semantic color→Tailwind class map from §2.3, so no page ever writes bg-[#...] literally
```

Any agent adding a new status color, badge style, chip format, or spacing scale outside this document must update this file first and flag it for review — the whole point of this spec is that ten people can build ten screens tonight and they still look like one product tomorrow morning.

---

## 10. Quick Checklist Before You Ship a Screen

- [ ] Used only tokens from §2 — no stray hex codes
- [ ] Headings in Geist Sans, all IDs/tags/timestamps in Geist Mono chips
- [ ] Every lifecycle/workflow state uses `<StatusBadge>`, matched to §2.3's table exactly
- [ ] One primary button max per view
- [ ] Cyan "pop" accent used only in its 3 sanctioned spots (§2.4) — not used here otherwise
- [ ] Loading = skeleton, empty = icon+copy+action, error = inline alert (§5.6)
- [ ] Motion used only where state actually changed (§6) — no gratuitous animation
- [ ] Keyboard focus visible, contrast checked, works at 375px width