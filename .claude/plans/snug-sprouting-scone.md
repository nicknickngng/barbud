# Add User Authentication (Supabase Auth + Google OAuth)

## Context
The app currently uses a simple shared password gate (APP_PASSWORD) to protect API usage, and stores profiles/ingredients in local AsyncStorage only. The user wants:
- Real user accounts so data persists across devices/sessions
- Email/password sign-up/sign-in
- Google OAuth sign-in
- Keep the APP_PASSWORD gate as a secondary layer to limit API usage

**Flow:** Auth Screen → APP_PASSWORD gate → Main App

## Manual Steps (User must do in Supabase Dashboard)
1. Copy the **anon key** from Supabase Dashboard > Settings > API
2. Enable **Google** provider under Authentication > Providers > Google:
   - Create OAuth credentials in Google Cloud Console
   - Set authorized redirect URI to `https://jckmgfvabtcipdrcrguu.supabase.co/auth/v1/callback`
   - Paste Client ID + Secret into Supabase
3. Under Authentication > URL Configuration > Redirect URLs, add:
   - Your Vercel domain (e.g. `https://barbud-*.vercel.app/**`)
   - `http://localhost:8081` (for local dev)

## Implementation Steps

### Step 1: Database schema
- Create `supabase/migrations/001_profiles_and_ingredients.sql`
- Tables: `profiles` (uuid pk, user_id FK → auth.users, name, is_active) and `ingredients` (uuid pk, profile_id FK → profiles, name, quantity, volume)
- Row Level Security: users can only CRUD their own data
- Run via `npx supabase db push`

### Step 2: Install dependency
- `cd app && npm install @supabase/supabase-js`

### Step 3: Supabase client — `app/lib/supabase.ts` (new)
- Initialize `createClient()` with `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Use AsyncStorage as auth storage adapter for session persistence
- `detectSessionInUrl: true` for Google OAuth redirect handling

### Step 4: Auth context — `app/lib/auth.ts` (new)
- `AuthProvider` component wrapping the app
- `useAuth()` hook exposing: `session`, `user`, `loading`, `signInWithEmail()`, `signUpWithEmail()`, `signInWithGoogle()`, `signOut()`
- Subscribes to `onAuthStateChange()` for reactive session updates
- `signOut()` also clears `barbud_unlocked` from AsyncStorage

### Step 5: Auth screen — `app/components/AuthScreen.tsx` (new)
- Speakeasy-themed login/signup screen
- Toggle between Sign In and Sign Up modes
- Email + password fields
- "OR" divider + "CONTINUE WITH GOOGLE" outlined button
- Error display
- Reuses theme tokens from `app/lib/theme.ts`

### Step 6: Update App.tsx — `app/App.tsx` (modify)
- Wrap with `AuthProvider`
- Split into `App` (provider wrapper) and `AppContent` (logic)
- Render order: loading → AuthScreen (no session) → PasswordGate (not unlocked) → Main App
- Pass `user.id` to `useProfiles()`
- Add sign-out button (small text at bottom)

### Step 7: Database operations — `app/lib/db.ts` (new)
- `fetchProfiles(userId)` — select with nested ingredients
- `createProfile(userId, name)` — insert profile
- `updateProfileName(profileId, name)` — update
- `deleteProfile(profileId)` — delete (cascade)
- `setProfileIngredients(profileId, ingredients[])` — delete old + bulk insert new
- `setActiveProfile(userId, profileId)` — toggle is_active flag

### Step 8: Rewrite profiles hook — `app/lib/profiles.ts` (modify)
- Takes `userId` param from `useAuth()`
- Loads from Supabase instead of AsyncStorage on mount
- Creates default profile if user has none
- All mutations (add, rename, setIngredients) call `db.ts` functions + update local state optimistically
- Processed photos remain in-memory only

### Step 9: Migration utility — `app/lib/migrate.ts` (new)
- On first authenticated load, check AsyncStorage for existing `barbud_profiles`
- If found, upload to Supabase under the user's ID, then clear local storage
- Skip if already migrated or no local data

### Step 10: API auth — `app/lib/api.ts` (modify)
- `analyzeImages()` now includes `Authorization: Bearer <token>` header from Supabase session
- `verifyPassword()` stays unauthenticated

### Step 11: Edge Function JWT — `supabase/config.toml` (modify)
- Set `verify_jwt = true` for `analyze` function
- Keep `verify_jwt = false` for `verify-password`
- Redeploy with `npx supabase functions deploy`

### Step 12: Environment variables
- Add to Vercel: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Add to `app/.env` for local dev (same values)

## Files Summary
| File | Action |
|------|--------|
| `supabase/migrations/001_profiles_and_ingredients.sql` | Create |
| `app/lib/supabase.ts` | Create |
| `app/lib/auth.ts` | Create |
| `app/lib/db.ts` | Create |
| `app/lib/migrate.ts` | Create |
| `app/components/AuthScreen.tsx` | Create |
| `app/App.tsx` | Modify |
| `app/lib/profiles.ts` | Rewrite |
| `app/lib/api.ts` | Modify |
| `supabase/config.toml` | Modify |

## Verification
1. Local: `expo start --web` → Auth screen loads → sign up with email → password gate → main app works
2. Google OAuth: click "Continue with Google" → redirects → returns authenticated
3. Data persistence: add ingredients → sign out → sign back in → ingredients still there
4. Phone: open Vercel URL on phone → same flow works
5. JWT protection: curl analyze endpoint without token → rejected
