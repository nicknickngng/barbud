# Plan: Delete Account Feature

## Context
A "Delete Account" button that permanently removes a user's entire account — their Supabase auth record, all app profiles, and all ingredients. The concern was whether this would be complicated by Google OAuth and Supabase. After exploring the codebase, this is **medium-low difficulty** and the hardest part is already solved by the existing schema.

**Good news:**
- The DB schema already has `ON DELETE CASCADE` on `auth.users → profiles → ingredients`, so deleting the auth user auto-removes all data.
- An Express server already exists at `server/src/index.ts` to host the new endpoint.
- Individual profile deletion already works; this is the same pattern extended to the auth layer.
- Google OAuth: No special Google-side revocation is needed. Supabase invalidates the session automatically when the auth user is deleted.

**The one constraint:** Deleting from `auth.users` requires Supabase's admin API (service role key). This **cannot** be called from the client — it must go through the server.

---

## Implementation Plan

### Step 1 — Server endpoint (`server/src/index.ts`)
Add `DELETE /api/user` route:
1. Extract the user's JWT from the `Authorization: Bearer <token>` header.
2. Verify the JWT using the Supabase client (`supabase.auth.getUser(token)`) to confirm identity.
3. Create a one-time admin client using the service role key from env vars (`SUPABASE_SERVICE_ROLE_KEY`).
4. Call `adminClient.auth.admin.deleteUser(userId)`.
5. Return `200 OK` on success, `401` if token invalid, `500` on error.

```ts
// server/src/index.ts (new route)
app.delete('/api/user', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  const adminClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteError) return res.status(500).json({ error: deleteError.message });

  res.status(200).json({ success: true });
});
```

> **Env var needed:** `SUPABASE_SERVICE_ROLE_KEY` must be added to the server's `.env`. This key is in the Supabase dashboard under Project Settings → API.

---

### Step 2 — Client function (`app/lib/auth.ts`)
Add `deleteAccount()` to the `AuthContextType` interface and `useAuth` hook:
1. Get the current session token via `supabase.auth.getSession()`.
2. Call `DELETE /api/user` with the token in the `Authorization` header.
3. On success: call `supabase.auth.signOut()` and clear `AsyncStorage` (`barbud_unlocked`).
4. Expose `deleteAccount` through the auth context so screens can call it.

---

### Step 3 — Confirmation UI (`app/components/SettingsScreen.tsx`)
Add a "Delete Account" button at the bottom of the settings screen, below the "Sign Out" button:
1. Style it in red/danger to signal destructive action.
2. On press: show a native `Alert.alert()` confirmation with title "Delete Account?" and message "This will permanently delete your account and all your bar profiles. This cannot be undone." with Cancel and Delete buttons.
3. On confirm: call `deleteAccount()` from `useAuth()`, show a loading state.
4. On error: show an alert with the error message.
5. Navigation back to the login screen happens automatically because the auth state listener in `App.tsx` will fire when the session is cleared.

---

## Files to Modify

| File | Change |
|------|--------|
| `server/src/index.ts` | Add `DELETE /api/user` route |
| `server/.env` (or env config) | Add `SUPABASE_SERVICE_ROLE_KEY` |
| `app/lib/auth.ts` | Add `deleteAccount()` to interface + hook |
| `app/components/SettingsScreen.tsx` | Add danger button + confirmation Alert |

## Files NOT needing changes
- `supabase/migrations/` — CASCADE rules already in place ✅
- `app/lib/db.ts` — No changes needed; cascade handles cleanup ✅
- `app/App.tsx` — Auth state listener already handles redirect on sign-out ✅

---

## Verification
1. Run the server locally and call `DELETE /api/user` with a valid token via curl — confirm `200` response.
2. In the app: tap Delete Account → confirm the dialog → verify the app returns to the login screen.
3. Try signing in again with the same Google account — user should be prompted to create a fresh account.
4. Check Supabase dashboard → Authentication → Users — the user should no longer be listed.
5. Check Supabase dashboard → Table Editor → profiles — no rows should remain for that user.

---

## Difficulty: Medium-Low
~2–3 hours of work. The schema, server infrastructure, and auth flow are all already in place. This is mostly wiring a new endpoint to an existing pattern.
