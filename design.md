# AssetFlow Design System & Style Guide

This document establishes the color tokens, typography pairings, button styles, spacing conventions, and UI component standards for the AssetFlow Enterprise ERP landing page. Follow these specifications exactly when building new sections to ensure a cohesive, premium brand aesthetic.

---

## 🎨 Color Palette & Tokens

| Token Name | Hex Code / Tailwind Class | Usage & Guidelines |
| :--- | :--- | :--- |
| **Primary Indigo** | `#4F46E5` / `bg-indigo-600` | Accent headings, primary CTAs, active states, and visual focus points. |
| **Sky Blue** | `#38BDF8` / `text-sky-400` / `bg-sky-50` | Highlights, timeline connectors, section background tints (e.g. `bg-sky-50/40`), icons. |
| **Deep Navy** | `#020617` / `#0F172A` / `bg-slate-900` / `bg-slate-950` | Footer background, dark background blocks, and high-contrast text on light backgrounds. |
| **Off-White** | `#F8FAFC` / `bg-slate-50` / `bg-white` | Page base background, card backgrounds, light sections, and contrast button fills. |
| **Accent Green** | `#10B981` / `text-emerald-500` | Successful validations (e.g. booking checks), active/online states, and specific checklist icons. |

---

## ✍️ Typography & Font Pairing

- **Sans-Serif Font (Primary)**: **Plus Jakarta Sans** (fallback: `system-ui`, `sans-serif`)
  - Used for body text, navbar, buttons, subheadings, and standard bold headlines.
  - Class name: `font-sans`
- **Serif Font (Accent)**: **Playfair Display** (fallback: `Georgia`, `serif`)
  - **Rule**: Reserved *exclusively* for a single accent word or short phrase inside headings to create a handpicked, premium design contrast. Do not use for body copy.
  - Styling: Always set to `italic font-medium text-indigo-600` (or `text-sky-300` on dark backgrounds).
  - Class name: `font-serif italic`

---

## 🔘 Button Standards

Every call-to-action button must adhere to these structural styles to maintain interface consistency:

1. **Pill Shape**: Always use full rounding (`rounded-full`).
2. **Height**: Standardized height of `52px` (equivalent to `py-3.5 px-8` or fixed `h-[52px]` flex layouts).
3. **Primary Style**:
   - Background: Indigo-600 (`bg-indigo-600 hover:bg-indigo-700`)
   - Text: White, bold (`text-white font-bold`)
   - Shadow: Indigo glow (`shadow-lg shadow-indigo-600/30`)
   - Transition: Smooth hover translate (`transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300`)
4. **Secondary/Nav Style**:
   - Background: White (`bg-white hover:bg-slate-50`)
   - Text: Dark slate, semi-bold (`text-slate-900 font-semibold`)
   - Shadow: Light shadow (`shadow-md hover:shadow-lg transition-all duration-300`)
5. **Interactive Grouping**:
   - Combine a main pill-shaped text button next to a matching circular icon button (e.g. containing diagonal arrow `↗` or check icon), sharing the exact same height and hover behavior, separated by a `gap-3` (`12px`) spacing.

---

## 📐 Spacing & Layout Scale

- **Section Vertical Padding**:
  - Use `py-24` (96px top and bottom) for normal landing sections.
  - Alternating background colors should stretch full-bleed (`w-full`), but content must stay bounded.
- **Max-Width Container**:
  - Always wrap section inner content in a centered container:
    ```html
    <div className="max-w-7xl mx-auto px-6 md:px-10">
    ```
  - This establishes a shared grid alignment: max-width of `1280px` (`max-w-7xl`), centered (`mx-auto`), with `24px` horizontal padding on mobile (`px-6`) scaling to `40px` on desktop (`md:px-10`).
- **Alternating Sections Sequence**:
  1. **Hero** (Viewport height, full-bleed optimized background illustration)
  2. **Features** (White background: `bg-white`)
  3. **Asset Lifecycle** (Light sky-tint: `bg-sky-50/40`)
  4. **Resource Bookings** (White background: `bg-white`)
  5. **Maintenance** (Light sky-tint: `bg-sky-50/40`)
  6. **Testimonials** (Light sky-blue tinted: `bg-sky-50/80`)
  7. **Stats/Metrics Band** (Deep Navy solid band: `bg-slate-900`)
  8. **Final CTA** (White background: `bg-white`)
  9. **Footer** (Deep Navy solid: `bg-slate-950`)