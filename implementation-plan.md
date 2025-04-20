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
- [ ] Configure base Neobrutalism theme in `tailwind.config.js` and `app/globals.css`.
  - [ ] Define primary (`#FF1A1A`), secondary (black, white, grey - e.g., `#1E1E1E`, `#FFFFFF`, `#333333`) colors in `theme.extend.colors`.
  - [ ] Set up CSS variables in `app/globals.css` for core colors and potentially border widths/shadows for easier application.
  - [ ] Choose and configure a chunky, bold sans-serif font (e.g., Google Fonts 'Inter' with high weight, or 'Poppins' ExtraBold). Add font import to `app/layout.tsx`. Define font family in `tailwind.config.js`.
  - [ ] Define custom hard shadow utilities in `tailwind.config.js` (e.g., `shadow-neo-brutal` -> `4px 4px 0px #000`).
  - [ ] Define standard border widths (e.g., `border-w-2`, `border-w-4`) in `tailwind.config.js`.
- [ ] Set up basic project structure within the `app/` directory.
  - [ ] `app/layout.tsx` (root layout with Tailwind setup, font).
  - [ ] `app/page.tsx` (home screen).
  - [ ] `components/` (for reusable UI elements).
    - [ ] `components/ui/` (potentially for very basic elements like Button, Toggle if not using a library).
  - [ ] `lib/` (for utilities, constants, API clients).
  - [ ] `styles/` (if needed for additional global styles beyond `globals.css`).
- [ ] Create Home Screen layout (`app/page.tsx`).
  - [ ] Use Tailwind's `grid` or `flex` utilities for the main layout structure.
  - [ ] Create a reusable `Button` component (`components/ui/Button.tsx`) applying Neobrutalism styles:
    - Solid background color (primary/secondary).
    - Thick solid border (e.g., `border-black border-2`).
    - Hard shadow on hover/active (e.g., `hover:shadow-neo-brutal active:translate-x-1 active:translate-y-1 active:shadow-none`).
    - Uppercase, bold font.
    - Add "Roast Me" and "Compliment Me" large buttons using this component.
  - [ ] Implement or find a suitable accessible `Toggle`/`Switch` component (`components/ui/Toggle.tsx`?) for "Selfie Upload" vs "Answer Prompts". Style it with Neobrutalism principles (clear visual states, solid borders).
  - [ ] Apply overall Neobrutalist page styling: potentially a solid background, clear separation of sections using borders.

## Phase 2: Input Methods & AI Integration (~3-5 days)

- [ ] Implement Selfie Upload component (`components/SelfieUpload.tsx`).
  - [ ] Use `react-dropzone` library for drag-and-drop functionality.
  - [ ] Style the dropzone area using Tailwind: dashed border, clear text instructions, change styles on drag-over (`ring-2 ring-offset-2 ring-primary`).
  - [ ] Include a standard `<input type="file">` as a fallback, styled visually consistently.
  - [ ] Use `useState` to manage the uploaded file (`File` object), loading state (`boolean`), and error messages (`string | null`).
  - [ ] Display image preview using `URL.createObjectURL()` and an `<img>` tag. Style the preview area.
  - [ ] Implement client-side file validation:
    - Size limit (e.g., < 5MB).
    - File type (e.g., `image/jpeg`, `image/png`).
    - (Optional) Basic dimension checks if feasible client-side.
  - [ ] Show clear loading indicators (e.g., spinner) and user-friendly error messages.
- [ ] Implement Prompt Questions component (`components/PromptQuestions.tsx`).
  - [ ] Define a list of predefined questions (e.g., in `lib/constants.ts`).
  - [ ] Dynamically render questions with styled text inputs (`<input type="text">` or `<textarea>`).
  - [ ] Style inputs with Neobrutalist look (thick borders, clear focus states).
  - [ ] Use `useState` or `useReducer` for managing form state (answers to prompts).
  - [ ] Add character limits visually displayed next to inputs.
  - [ ] Implement basic client-side validation (e.g., required fields).
- [ ] Set up OpenAI API client/wrapper (`lib/openai.ts`).
  - [ ] Install the official `openai` npm package (`pnpm add openai`).
  - [ ] Create an instance of the OpenAI client using the API key.
  - [ ] Store the API key securely in environment variables (`.env.local`, `OPENAI_API_KEY=...`). Access via `process.env.OPENAI_API_KEY`. **Never commit the key.**
  - [ ] Create helper functions (e.g., `generateRoastOrCompliment`) abstracting the API call logic.
- [ ] Create backend API route (`app/api/generate/route.ts`) using Next.js Route Handlers.
  - [ ] Define `POST` handler function.
  - [ ] Parse request body (using `await request.json()`) to get input type (`'image' | 'text'`), user input (image data as base64 string? or prompt answers), desired output (`'roast' | 'compliment'`), and selected tones.
  - [ ] Add input validation using a library like Zod.
  - [ ] Implement logic to construct the OpenAI prompt:
    - Include the base system prompt from the PRD.
    - Add tone instructions based on user selection.
    - Add user input (text answers or a placeholder text for image initially).
    - (Future Enhancement for Image Input): If input is image, consider using OpenAI's Vision model (GPT-4 Vision). For MVP, might just send a fixed prompt like "User uploaded a selfie." and rely on text prompts if available.
  - [ ] Call the OpenAI API using the client from `lib/openai.ts` (`openai.chat.completions.create`).
  - [ ] Handle potential API errors gracefully (try/catch blocks) and return appropriate error responses (e.g., `{ status: 500 }`).
  - [ ] Return the generated text in the response (e.g., `{ generatedText: '...' }`).
- [ ] Connect frontend components to the `/api/generate` endpoint.
  - [ ] In `app/page.tsx` or relevant components, add state for API loading (`boolean`) and API result/error (`string | null`).
  - [ ] On button click ("Roast Me"/"Compliment Me"), trigger an asynchronous function.
  - [ ] Inside the function:
    - Set loading state to true.
    - Prepare the payload based on the selected input method (read file data/get form data). If image, potentially convert to base64 string.
    - Use `fetch` API to make a `POST` request to `/api/generate`.
    - Handle the response: update result state on success, error state on failure.
    - Set loading state to false.
- [ ] Implement Tone Selection UI (`components/ToneSelection.tsx`?).
  - [ ] Use styled `Select` dropdowns or `RadioGroup` components for Tones (Severity: Mild / Medium / Nuclear) and Styles (Formal / Sarcastic / Shakespearean / Rap Battle).
  - [ ] Store selected tones in the main page state.
  - [ ] Pass selected tones in the payload to the `/api/generate` API endpoint.
  - [ ] Ensure the backend API route uses these tones when constructing the OpenAI prompt.

## Phase 3: Output Display & Meme Generation (~2-3 days)

- [ ] Create Meme Output component (`components/MemeOutput.tsx`).
  - [ ] Accept generated text and original image (if provided) as props.
  - [ ] Display the generated text prominently. Style using Tailwind (font size, weight, color, text shadow - potentially `text-stroke` for outline).
  - [ ] If an image was uploaded:
    - Display the original image as background.
    - Position the generated text over the image using Tailwind's absolute positioning utilities.
  - [ ] If text prompts were used:
    - Select a predefined meme template background (store a few simple ones in `public/`).
    - Display the template image.
    - Position the generated text over the template.
  - [ ] Add a subtle watermark "Get yours at RoastBot.app" using Tailwind (low opacity, specific corner).
- [ ] Implement basic image/meme generation (choose one approach):
  - **Option A (Client-side - Simpler MVP):**
    - Use the HTML `<canvas>` element.
    - In the `MemeOutput` component, draw the background image (uploaded or template) onto the canvas.
    - Draw the generated text onto the canvas using `ctx.fillText()`, applying styling (font, size, color, alignment).
    - Draw the watermark text.
    - The displayed element will be the canvas itself.
  - **Option B (Server-side - More Robust):**
    - Modify the `/api/generate` endpoint (or create a new one `/api/generate-meme`).
    - Use a library like `sharp` (requires native dependencies) or `canvas` (Node implementation of Canvas API) on the server.
    - After getting the text from OpenAI, load the image (uploaded or template).
    - Composite the text and watermark onto the image using the library.
    - Return the final image data (e.g., base64 string or buffer) to the frontend. Frontend just displays the resulting image.
- [ ] Add "Save" and "Share" buttons to the `MemeOutput` component (using the reusable `Button`).
  - [ ] **Save:**
    - If using Client-side Canvas: Add a function that uses `canvas.toDataURL('image/png')` to get the image data and creates a temporary link (`<a>` tag) with the `download` attribute set to `roastbot-meme.png`. Simulate a click on the link.
    - If using Server-side Generation: The API might return the image data directly, or a URL. Provide a download link pointing to that data/URL.
  - [ ] **Share:**
    - Implement basic social sharing links (e.g., Twitter Web Intent).
    - Create a function that constructs the Twitter share URL (`https://twitter.com/intent/tweet?text=...&url=...`). Include pre-filled text ("Check out my RoastBot creation!") and potentially a link back to RoastBot.app (or link to the generated image if hosted). Open this URL in a new tab.

## Phase 4: Personality Packs (MVP) (~2-3 days)

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

## Phase 5: Viral Hooks & Community Features (Optional - Post MVP) (~5-7 days)

- [ ] Implement "Roast Battle" sharing flow.
  - [ ] Modify the "Share" functionality to optionally create a unique link for a specific roast/meme.
  - [ ] This likely requires saving the generated meme (image + text + context) to a database.
- [ ] Set up database (Supabase).
  - [ ] Create a Supabase project.
  - [ ] Define database schema:
    - `memes` table (id, user_id (optional), image_url, generated_text, source_type (image/text), personality_pack_id, created_at, upvotes)
    - `battles` table (id, meme1_id, meme2_id, winner_id (optional), created_at)
    - `votes` table (id, user_id, meme_id, vote_type (upvote/downvote), created_at)
  - [ ] Set up Supabase client library (`@supabase/supabase-js`) in `lib/supabase.ts`.
- [ ] Create API endpoints for submitting/voting.
  - [ ] `POST /api/memes`: Saves a generated meme to the DB, returns unique ID/URL.
  - [ ] `POST /api/votes`: Records a vote for a specific meme ID.
  - [ ] `GET /api/leaderboard`: Fetches top-voted memes.
  - [ ] `GET /api/battles`: Fetches ongoing or past battles.
- [ ] Build Public Leaderboard UI (`app/leaderboard/page.tsx`).
  - [ ] Fetch data from `/api/leaderboard`.
  - [ ] Display memes ranked by votes.
  - [ ] Implement voting buttons (requires user auth potentially).
- [ ] Add suggested hashtags (e.g., `#RoastBot`, `#RoastMe`) to the share functionality.

## Phase 6: Monetization (Optional - Post MVP) (~7-10 days)

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

## Phase 7: Settings, Legal & Polishing (~3-4 days)

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

## Phase 8: Deployment (~1 day)

- [ ] Choose hosting provider (Vercel recommended for Next.js).
- [ ] Set up CI/CD pipeline.
  - [ ] Connect GitHub/GitLab repository to Vercel.
  - [ ] Configure build command (`pnpm build`).
  - [ ] Ensure automatic deployments on push to `main` branch and preview deployments for pull requests.
- [ ] Configure environment variables for production in the hosting provider's dashboard (e.g., `OPENAI_API_KEY`, Supabase keys, Stripe keys).
- [ ] Deploy application to production.
- [ ] Monitor application performance and logs using Vercel dashboard or integrated monitoring services. Check for runtime errors after deployment.
- [ ] Set up custom domain if applicable.
