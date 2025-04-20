# Design System: Neobrutalism for RoastBot

This document outlines the Neobrutalism design principles and specific implementation details for the RoastBot application.

## Core Principles

Neobrutalism is characterized by:

1.  **Rawness and Honesty:** Minimal decoration, exposing structure.
2.  **High Contrast:** Strong differences between foreground and background elements, often using pure black and white alongside vibrant accent colors.
3.  **Solid Colors:** Flat colors, avoiding gradients or complex textures.
4.  **Chunky Elements:** Use of thick borders and prominent shadows.
5.  **Hard Shadows:** Distinct, non-blurred shadows with sharp offsets, giving a sense of depth without realism.
6.  **Bold Typography:** Often uses heavy, sans-serif fonts, sometimes in all caps for headings or buttons.
7.  **Asymmetry and Grid Breaking:** While based on structure, it can intentionally break grid alignment for emphasis.

## Implementation in RoastBot

We are applying these principles using Tailwind CSS 4 and customizing components, potentially including those initialized from `shadcn/ui`.

**1. Color Palette:**

The base color palette is defined using CSS variables in `app/globals.css` and mapped in `tailwind.config.ts`.

- **Primary Accent (`--main`):** A vibrant red (`oklch(67.28% 0.2147 24.22)` / `#FF1A1A` equivalent) used for key interactive elements, highlights, and branding.
- **Backgrounds:**
  - `--background`: Off-white (`oklch(93.3% 0.0339 17.77)`)
  - `--secondary-background`: Pure white (`oklch(100% 0 0)`)
  - Dark mode variants exist (`.dark`).
- **Foregrounds:**
  - `--foreground`: Pure black (`oklch(0% 0 0)`) for standard text and borders in light mode.
  - `--main-foreground`: Black (`oklch(0% 0 0)`) often used on primary buttons.
  - Dark mode variants exist (`.dark`).
- **Borders (`--border`):** Pure black (`oklch(0% 0 0)`).

**2. Shadows:**

- A distinct, hard shadow (`--shadow`) is defined in `app/globals.css` as `4px 4px 0px 0px var(--border)`.
- This is applied via the `shadow-shadow` utility (defined via `@theme` in `app/globals.css`).
- Components often use this shadow on hover or interaction to provide tactile feedback (e.g., buttons shifting position slightly and losing the shadow on `active`).

**3. Borders:**

- Borders are consistently applied using `var(--border)` for color.
- Standard width is typically `2px` (e.g., `border-2 border-border`). Thicker borders (`4px`) may be used for emphasis.

**4. Typography:**

- Font configuration needs to be finalized in `tailwind.config.ts` and `app/layout.tsx`.
- **Target:** A bold, chunky sans-serif font (e.g., Inter ExtraBold, Poppins Bold/ExtraBold).
- **Usage:** Headings (`--font-weight-heading: 800`) are heavy-weight. Base text (`--font-weight-base: 500`) is medium/semi-bold. Buttons often use uppercase text.

**5. Components (`shadcn/ui` & Custom):**

- You have mentioned that `shadcn/ui` has been initialized.
- When using `shadcn/ui` components (or creating custom ones), they **must** be styled to conform to the Neobrutalist principles above.
- **Customization examples:**
  - **Buttons:** Solid background (often `--main` or `--background`), thick border (`border-2 border-border`), hard shadow (`shadow-shadow`) on hover/focus, potentially uppercase bold text. Active state might remove shadow and slightly translate the button.
  - **Inputs:** Thick borders (`border-2 border-border`), clear focus states (e.g., thicker ring or border color change), simple background (`--background` or `--secondary-background`).
  - **Cards/Containers:** Solid backgrounds, thick borders, potentially a hard shadow.
  - **Remove:** Default subtle shadows, gradients, excessive rounded corners (minor rounding like `--radius-base: 20px` might be acceptable if used consistently, but sharp corners are also common in Neobrutalism).

**6. Base Styles:**

- As noted, base styles inspired by `neobrutalism.dev` principles have been added via CSS variables and `@theme` directives in `app/globals.css`. These provide the foundation for colors, shadows, and basic theme structure.

**Consistency is key.** Apply these principles uniformly across all UI elements to maintain the intended aesthetic.
