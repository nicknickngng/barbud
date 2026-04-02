import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  "https://jckmgfvabtcipdrcrguu.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impja21nZnZhYnRjaXBkcmNyZ3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzk4NzQsImV4cCI6MjA5MDY1NTg3NH0.0vLBzVRJISRIHql6SUPbd9DeyAuP78AGLbcMjcB-Ph0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
