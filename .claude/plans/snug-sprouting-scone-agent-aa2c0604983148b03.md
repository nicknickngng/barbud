# Implementation Plan: Supabase Edge Functions Migration + Password Gate

## Design Decisions (Resolved)

1. Dual backend - Keep the Express server at server/ for local dev. Add Supabase Edge Functions as the production backend. No code is deleted.
2. Supabase project config - New supabase/ directory at repo root, created via supabase init.
3. API_BASE configuration - Use an environment variable (EXPO_PUBLIC_API_URL) with the Supabase Edge Functions URL as default and http://localhost:3000 as the local dev fallback.

---

## Phase 1: Supabase Project Scaffolding

### Step 1.1 - Initialize Supabase project at repo root

Run supabase init from the barbud repo root to create the supabase/ directory with config.toml. No database or auth features are needed - only Edge Functions.

### Step 1.2 - Create the Edge Function directories

New file structure:

- supabase/functions/analyze/index.ts
- supabase/functions/verify-password/index.ts
- supabase/functions/_shared/cors.ts
- supabase/functions/_shared/prompt.ts
- supabase/functions/_shared/types.ts

The _shared/ directory (prefixed with underscore) is a Supabase convention for shared code that is NOT deployed as its own function.

### Step 1.3 - Update .gitignore

Add supabase/.temp/ and app/.env to the root .gitignore.

---

## Phase 2: Shared Utilities (supabase/functions/_shared/)

### Step 2.1 - _shared/cors.ts

Create a CORS helper used by both functions. Define a corsHeaders object with Access-Control-Allow-Origin: *, Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type, and Access-Control-Allow-Methods: POST, OPTIONS. Export a handleCors(req) function that checks for OPTIONS method and returns a preflight response with status 200. Returns null if not a preflight so the caller continues.

### Step 2.2 - _shared/prompt.ts

Port server/src/services/prompt.ts directly. The code is pure TypeScript with no Node.js dependencies - it works in Deno as-is. Same export function buildPrompt(imageCount: number): string signature.

### Step 2.3 - _shared/types.ts

Extract shared interfaces: ImageInput (base64: string, mimeType: string) and Ingredient (name: string, quantity: string, volume: string).

---

## Phase 3: verify-password Edge Function

### Step 3.1 - supabase/functions/verify-password/index.ts

1. Import corsHeaders and handleCors from ../_shared/cors.ts
2. Use Deno.serve async handler
3. Handle CORS preflight first
4. Only accept POST (return 405 otherwise)
5. Parse JSON body for { password }
6. Get APP_PASSWORD from Deno.env.get("APP_PASSWORD")
7. If env var missing, return 500
8. Compare password === correct
9. Return { success: true } with 200 or { success: false } with 401
10. Include corsHeaders in every response

Simple string comparison, no hashing, as specified in requirements.

---

## Phase 4: analyze Edge Function

### Step 4.1 - supabase/functions/analyze/index.ts

Consolidates logic from server/src/routes/analyze.ts and the three VLM service files.

NPM imports using npm: specifiers:
- import Anthropic from "npm:@anthropic-ai/sdk"
- import OpenAI from "npm:openai"
- import { GoogleGenerativeAI } from "npm:@google/generative-ai"

Core flow (mirrors the Express route):
1. Handle CORS preflight
2. Parse JSON body { images, model }
3. Validate input (images array non-empty, each has base64+mimeType, model is valid)
4. Apply detectMimeType() to fix mime types from base64 magic bytes (port from server/src/routes/analyze.ts lines 9-15)
5. Route to the appropriate VLM analyzer (claude/gpt4o/gemini)
6. Parse the JSON response, extract descriptions and ingredients
7. Return { descriptions, ingredients, model }

Differences from Express version:
- Environment variables use Deno.env.get() instead of process.env
- No lazy client singletons needed - Edge Functions are short-lived, create clients per-request
- Response is new Response(JSON.stringify(data), { headers }) instead of res.json(data)
- Must include corsHeaders in every response

VLM service functions: Include all three analyzer functions directly in index.ts. Port logic from server/src/services/claude.ts, openai.ts, and gemini.ts with only import and env var changes.

---

## Phase 5: Frontend - API Configuration

### Step 5.1 - Update app/lib/api.ts

Replace the hardcoded API_BASE with environment-aware configuration. Use process.env.EXPO_PUBLIC_API_URL if set, otherwise default to the Supabase URL. For local dev, set EXPO_PUBLIC_API_URL=http://localhost:3000 in app/.env.

Path alignment: Change the Express route from /api/analyze to /analyze (one-line change in server/src/index.ts line 13) so both backends use the same path. The analyzeImages fetch URL becomes API_BASE + "/analyze".

### Step 5.2 - Add verifyPassword function to app/lib/api.ts

New exported async function that POSTs { password } to API_BASE + "/verify-password", parses response, and returns data.success === true.

---

## Phase 6: Frontend - Password Gate Component

### Step 6.1 - Create app/components/PasswordGate.tsx

A full-screen component with:
- App title "barbud" and subtitle in same style as App.tsx
- TextInput for password (secureTextEntry)
- UNLOCK button styled like the gold IDENTIFY INGREDIENTS button
- Error text display for wrong password
- On success, calls onUnlocked callback prop

Style: Use existing colors, fonts, spacing, borders, shadows from lib/theme.ts. Obsidian background, gold accents, Cormorant Garamond headings.

Props: { onUnlocked: () => void }

Behavior:
1. User types password
2. User taps UNLOCK
3. Show ActivityIndicator while verifying
4. Call verifyPassword(password) from lib/api.ts
5. If true: call onUnlocked()
6. If false: show Incorrect password error
7. If network error: show error message

---

## Phase 7: Frontend - Integrate Password Gate in App.tsx

### Step 7.1 - Add unlock state management

1. Add state: const [unlocked, setUnlocked] = useState of boolean-or-null, initialized to null (null = loading from storage)
2. On mount, check AsyncStorage for key barbud_unlocked. If "true", set unlocked=true, else false.
3. When PasswordGate calls onUnlocked, set unlocked=true and write "true" to AsyncStorage.

### Step 7.2 - Conditional rendering

- If unlocked === null: show blank screen (same as fonts-loading check on current line 130-132)
- If unlocked === false: render PasswordGate with onUnlocked callback
- If unlocked === true: render existing app content

No new navigation library or context providers needed - just conditional render at the top of App.tsx. Merge with the existing fontsLoaded / profilesLoaded check.

### Step 7.3 - Storage key

Use barbud_unlocked following the barbud_ prefix convention from profiles.ts.

---

## Phase 8: Supabase Configuration and Deployment

### Step 8.1 - config.toml adjustments

Disable JWT verification for both functions (we use our own password gate, not Supabase Auth). Set verify_jwt = false for both [functions.analyze] and [functions.verify-password] sections.

### Step 8.2 - Set environment secrets via CLI

Run supabase secrets set for ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_AI_API_KEY, and APP_PASSWORD.

### Step 8.3 - Deploy

Run supabase functions deploy analyze and supabase functions deploy verify-password.

### Step 8.4 - Update frontend API_BASE default

Set the Supabase project URL as the default in app/lib/api.ts.

---

## Phase 9: Local Dev Parity

### Step 9.1 - Add verify-password to Express server

Add a minimal /verify-password POST endpoint to server/src/index.ts (~8 lines) that checks against APP_PASSWORD in .env. Keeps dev/prod behavior consistent.

### Step 9.2 - Add APP_PASSWORD to server/.env.example

Add APP_PASSWORD=changeme so developers know to set it.

---

## Phase 10: Testing Checklist

1. Local dev (Express): Set EXPO_PUBLIC_API_URL=http://localhost:3000. Run both servers. Verify analyze and password gate work.
2. Password gate flow: Clear AsyncStorage. Verify gate appears. Wrong password shows error. Correct password unlocks. Relaunch skips gate.
3. Production (Supabase): Deploy. Verify analyze and password gate via Edge Functions.
4. CORS: Test from Vercel-deployed frontend to ensure headers work.

---

## File Summary

### New files:
- supabase/config.toml (via supabase init, then edited)
- supabase/functions/_shared/cors.ts
- supabase/functions/_shared/prompt.ts
- supabase/functions/_shared/types.ts
- supabase/functions/analyze/index.ts
- supabase/functions/verify-password/index.ts
- app/components/PasswordGate.tsx
- app/.env (local dev override, gitignored)

### Modified files:
- app/lib/api.ts - configurable API_BASE + verifyPassword function
- app/App.tsx - password gate wrapper with AsyncStorage unlock state
- server/src/index.ts - route change /api/analyze to /analyze, add /verify-password endpoint
- server/.env.example - add APP_PASSWORD
- .gitignore - add supabase/.temp/, app/.env

### Unchanged:
- All VLM service files in server/src/services/
- All existing components in app/components/
- server/.env (user adds APP_PASSWORD manually)

---

## Potential Challenges

1. Base64 payload size: Supabase Edge Functions have a ~2MB default request body limit. Multiple high-res images could exceed this. Mitigation: resizeImage.ts already exists; ensure adequate compression.
2. Cold starts: ~200-500ms latency on first request after idle, especially with npm: imports. Acceptable for this use case.
3. Deno npm: compatibility: The three AI SDKs should work with npm: specifiers but test each individually during implementation.
4. Edge Function timeout: Default 60 seconds. VLM calls with multiple images could approach this. Monitor and increase via dashboard if needed.
