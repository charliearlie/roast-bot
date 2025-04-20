# Implementation Plan: RoastBot

This document outlines the detailed steps to build the RoastBot application based on the [App PRD](@app-prd.md).

**Tech Stack:**

- Frontend: Next.js (App Router) ✅
- Styling: Tailwind CSS 4 + Neobrutalism Principles ✅
- AI Backend: OpenAI API ✅
- Storage: Supabase (Optional, Phase 5+)
- Payments: Stripe / RevenueCat (Optional, Phase 6+)

**Key Design Principles:**

- **Neobrutalism:** Chunky fonts (e.g., a bold sans-serif), high contrast colors (Primary: `#FF1A1A`, Secondary: Black, White, Charcoal Grey), solid/thick borders (2px or more), hard shadows (no blur, offset), minimal gradients/transparency.
- **Tailwind 4:** Utilize CSS variables heavily for theme configuration, leverage built-in utilities, potentially explore `@apply` cautiously for complex reusable component styles if needed (though utility-first is preferred).

## Phase 1: Project Setup & Core UI (~1-2 days)

- [x] Initialize Next.js project with TypeScript (using App Router).
- [x] Set up Tailwind CSS 4.
  - [x] Install `@tailwindcss/postcss`.
  - [x] Configure `tailwind.config.js` (or `tailwind.config.ts`).
  - [x] Set up `postcss.config.js`.
  - [x] Import Tailwind directives (`@tailwind utilities;` etc.) into `app/globals.css`.
- [x] Configure base Neobrutalism theme in `tailwind.config.js` and `app/globals.css`.
  - [x] Define primary (`#FF1A1A`), secondary (black, white, grey - e.g., `#1E1E1E`, `#FFFFFF`, `#333333`) colors in `theme.extend.colors`.
  - [x] Set up CSS variables in `app/globals.css` for core colors and potentially border widths/shadows for easier application.
  - [x] Choose and configure a chunky, bold sans-serif font (e.g., Google Fonts 'Inter' with high weight, or 'Poppins' ExtraBold). Add font import to `app/layout.tsx`. Define font family in `globals.css`.
- [x] Set up basic project structure within the `app/` directory.
  - [x] `app/layout.tsx` (root layout with Tailwind setup, font).
  - [x] `app/page.tsx` (home screen).
  - [x] `components/` (for reusable UI elements).
    - [x] `components/ui/` (potentially for very basic elements like Button, Toggle if not using a library).
  - [x] `lib/` (for utilities, constants, API clients).
  - [x] `styles/` (if needed for additional global styles beyond `globals.css`).
- [x] Create Home Screen layout (`app/page.tsx`).
  - [x] Use Tailwind's `grid` or `flex` utilities for the main layout structure.
  - [x] Create a reusable `Button` component (`components/ui/Button.tsx`) applying Neobrutalism styles:
    - Solid background color (primary/secondary).
    - Thick solid border (e.g., `border-black border-2`).
    - Hard shadow on hover/active (e.g., `hover:shadow-neo-brutal active:translate-x-1 active:translate-y-1 active:shadow-none`).
    - Uppercase, bold font.
    - Add "Roast Me" and "Compliment Me" large buttons using this component.
  - [x] Implement or find a suitable accessible `Toggle`/`Switch` component (`components/ui/Toggle.tsx`?) for "Selfie Upload" vs "Answer Prompts". Style it with Neobrutalism principles (clear visual states, solid borders).
  - [x] Apply overall Neobrutalist page styling: potentially a solid background, clear separation of sections using borders.

## Phase 2: Input Methods & AI Integration (~3-5 days)

- [x] Implement Selfie Upload component
- [x] Implement Prompt Questions component
- [x] Set up OpenAI API integration
- [x] Add tone selection UI
- [x] Connect frontend to backend
- [x] Add follow-up roast options
  - [x] Implement dynamic prompts system
  - [x] Add follow-up generation logic
  - [x] Style follow-up buttons
  - [x] Fine-tune prompt suggestions
    - [x] Add context-aware prompts based on type and tone
    - [x] Add helpful descriptions
    - [x] Implement smart filtering
  - [ ] Add user feedback collection
    - [ ] Add reaction buttons to generated content
    - [ ] Track which follow-ups are most used
    - [ ] Store feedback for future improvements

## Phase 3: Output Display & Meme Generation (~2-3 days)

- [x] Create Meme Output component
- [x] Implement server-side meme generation
- [x] Add sharing features
- [x] Implement template system
- [x] Improve meme generation reliability
  - [x] Fix font loading issues
  - [x] Enhance text placement
    - [x] Dynamic font sizing based on text length and image size
    - [x] Smart positioning based on image orientation
    - [x] Improved readability with better shadows and backgrounds
  - [x] Optimize image processing
    - [x] Smart dimension optimization
    - [x] Better quality settings
    - [x] Improved compression
  - [x] Add error recovery
    - [x] Retry mechanism with exponential backoff
    - [x] Comprehensive error handling
    - [x] Fallback mechanisms
- [x] Enhance user interaction
  - [x] Make meme generation optional
  - [x] Add preview capabilities
    - [x] Template preview with text overlay
    - [x] Toggle between preview and final result
    - [x] Real-time text preview
  - [x] Implement template filtering
    - [x] Add filter by style (funny, serious, etc.)
    - [x] Add filter by theme (classic memes, modern, etc.)
    - [x] Add search functionality
  - [x] Add custom template support
    - [x] Allow users to upload their own templates
    - [x] Add template customization options
    - [x] Implement template sharing

## Phase 4: Polish & Optimization

- [x] Add loading animations
  - [x] Create LoadingSpinner component
  - [x] Add loading states to buttons
  - [x] Add loading states to forms
  - [x] Add loading states to image uploads
  - [x] Add loading states to API responses
- [x] Implement error boundaries
  - [x] Create ErrorBoundary component
  - [x] Add error boundaries to key components
  - [x] Add error recovery mechanisms
  - [x] Add user-friendly error messages
- [x] Add retry mechanisms
  - [x] Create retry utility function
  - [x] Add retries to content generation
  - [x] Add retries to meme generation
  - [x] Add retries to share tracking
  - [x] Add user feedback for retries
- [ ] Optimize image processing
- [ ] Add rate limiting
- [ ] Implement caching

## Phase 5: Testing & Documentation

- [ ] Implement user feedback system
  - [ ] Add reaction buttons
  - [ ] Collect improvement suggestions
  - [ ] Track popular prompts
- [ ] Add social features
  - [ ] Share collections
  - [ ] Featured roasts
  - [ ] Weekly challenges
- [ ] Enhance AI responses
  - [ ] Fine-tune prompts
  - [ ] Add context awareness
  - [ ] Improve personality consistency

## Phase 6: Personality Packs (MVP) (~2-3 days)

- [ ] Define structure for Personality Packs.
  - [ ] Create a JSON file (e.g., `lib/personality-packs.json`) or TypeScript structure (`lib/types.ts`, `lib/constants.ts`).
  - [ ] Example structure:
    ```json
    [
      {
        "id": "default",
        "name": "Standard Issue",
        "description": "The classic RoastBot experience.",
        "prompt_modifier": ""
      },
      {
        "id": "chef",
        "name": "Shouty Chef",
        "description": "Roasts like a stressed-out Michelin star chef.",
        "prompt_modifier": "Respond in the style of an angry, swearing, Gordon Ramsay-esque chef."
      },
      {
        "id": "pirate",
        "name": "Salty Pirate",
        "description": "Ye be gettin' roasted, matey!",
        "prompt_modifier": "Respond like a stereotypical salty pirate, using pirate slang like 'Ahoy!', 'Matey', 'Shiver me timbers!', etc."
      }
    ]
    ```
- [ ] Implement UI to select a Personality Pack (`components/PersonalitySelector.tsx`).
  - [ ] Fetch/import the pack definitions.
  - [ ] Display packs using cards or a dropdown (`Select` component). Style with Neobrutalism (borders, shadows).
  - [ ] Show pack name and description.
  - [ ] Store the selected pack ID (`string`) in the main page state.
- [ ] Update backend API (`app/api/generate/route.ts`) to accept selected pack ID.
  - [ ] Add `packId` to the expected request body and validation schema.
  - [ ] Load the corresponding pack definition based on the received `packId`.
  - [ ] If a valid `packId` is provided, retrieve its `prompt_modifier`.
- [ ] Modify OpenAI prompt generation logic in the API route.
  - [ ] Prepend or append the `prompt_modifier` from the selected pack to the system prompt or user instructions sent to OpenAI.
- [ ] (Optional) Add themed visual elements based on pack.
  - [ ] The pack definition could include theme hints (e.g., accent color, font style).
  - [ ] Frontend components could dynamically adjust styles (e.g., apply different Tailwind classes or CSS variables) based on the selected pack's theme hints. This adds complexity, consider for later refinement.

## Phase 7: Viral Hooks & Community Features (Optional - Post MVP) (~5-7 days)

- [x] Implement "Roast Battle" sharing flow.
  - [x] Modify the "Share" functionality to create unique links.
  - [x] Add share tracking API.
  - [x] Implement share counters.
  - [x] Add viral status indicators.
  - [x] Add toast notifications for milestones.
- [ ] Set up database (Supabase).
  - [ ] Create a Supabase project.
  - [ ] Define database schema.
  - [ ] Set up Supabase client library.
- [ ] Create API endpoints for submitting/voting.
- [ ] Build Public Leaderboard UI.
- [x] Add suggested hashtags to share functionality.

## Phase 8: Monetization (Optional - Post MVP) (~7-10 days)

- [ ] Integrate Stripe / RevenueCat SDK.
  - [ ] Choose platform (Stripe for direct web, RevenueCat for cross-platform IAP abstraction).
  - [ ] Install relevant SDKs (e.g., `pnpm add @stripe/stripe-js @stripe/react-stripe-js`).
  - [ ] Configure API keys securely in environment variables.
- [ ] Implement In-App Purchase flow.
  - [ ] Create API endpoints for managing payments/subscriptions:
    - `POST /api/payments/create-checkout-session` (Stripe)
    - Webhooks endpoint (`/api/webhooks/stripe`) to handle successful payments and update user entitlements.
  - [ ] Design UI for premium features (locked state, purchase buttons).
  - [ ] Use Stripe Elements or RevenueCat components for the checkout flow.
  - [ ] Update user state/database to reflect purchased items (e.g., unlocked packs, subscription status).
- [ ] Define premium features:
  - [ ] **Personality Packs:** Mark certain packs in the config as premium (`"premium": true`). Lock UI access and backend generation for non-entitled users.
  - [ ] **Premium Templates:** Add premium background templates for meme generation.
  - [ ] **Custom Rant Generator:** Define this feature scope (e.g., longer text generation, specific prompts).
- [ ] Implement "Roast Me Daily" subscription logic.
  - [ ] Define subscription tiers/pricing in Stripe/RevenueCat.
  - [ ] Track subscription status via webhooks.
  - [ ] Implement daily usage limits or features gated by subscription status.

## Phase 9: Settings, Legal & Polishing (~3-4 days)

- [ ] Create Settings page (`app/settings/page.tsx`).
  - [ ] Include options like clearing local data, managing notification preferences (if any).
  - [ ] Link to Legal pages.
- [ ] Add Disclaimer text.
  - [ ] Include clear disclaimers about AI generation, potential for offensive content, and non-liability in the UI (e.g., footer, before generation).
- [ ] Create Privacy Policy & Terms of Service pages (`app/privacy/page.tsx`, `app/terms/page.tsx`).
  - [ ] Draft content covering data usage (user inputs, generated content, analytics), OpenAI usage, cookies, etc. Use a template generator or consult legal advice.
- [ ] Implement opt-in for analytics.
  - [ ] If using analytics (e.g., Vercel Analytics, Plausible), ensure compliance (e.g., GDPR). Potentially add a cookie consent banner if necessary.
- [ ] Refine UI/UX based on Neobrutalism principles.
  - [ ] Conduct a visual review: check for consistency in borders, shadows, colors, typography.
  - [ ] Ensure interactive elements have clear hover/active/focus states adhering to the style.
  - [ ] Check accessibility (keyboard navigation, contrast ratios, screen reader compatibility). Use tools like Lighthouse or Axe DevTools.
- [ ] Cross-browser/device testing.
  - [ ] Test on major browsers (Chrome, Firefox, Safari, Edge).
  - [ ] Test on different screen sizes (desktop, tablet, mobile) using browser developer tools and real devices if possible. Adjust Tailwind responsive classes (`sm:`, `md:`, `lg:`) as needed.
- [ ] Add comprehensive tests.
  - [ ] **Unit Tests:** Use Vitest or Jest + React Testing Library to test individual components (e.g., Button, SelfieUpload logic) and utility functions (`lib/`). Aim for good coverage of critical logic.
  - [ ] **Integration Tests:** Test interactions between components (e.g., file upload -> API call -> output display).
  - [ ] **End-to-End Tests (Optional but Recommended):** Use Playwright or Cypress to simulate user flows through the entire application.

## Phase 10: Deployment (~1 day)

- [ ] Choose hosting provider (Vercel recommended for Next.js).
- [ ] Set up CI/CD pipeline.
  - [ ] Connect GitHub/GitLab repository to Vercel.
  - [ ] Configure build command (`pnpm build`).
  - [ ] Ensure automatic deployments on push to `main` branch and preview deployments for pull requests.
- [ ] Configure environment variables for production in the hosting provider's dashboard (e.g., `OPENAI_API_KEY`, Supabase keys, Stripe keys).
- [ ] Deploy application to production.
- [ ] Monitor application performance and logs using Vercel dashboard or integrated monitoring services. Check for runtime errors after deployment.
- [ ] Set up custom domain if applicable.
