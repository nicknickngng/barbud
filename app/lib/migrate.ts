import AsyncStorage from "@react-native-async-storage/async-storage";
import { createProfile, setProfileIngredients, setActiveProfile } from "./db";

const MIGRATED_KEY = "barbud_migrated";
const PROFILES_KEY = "barbud_profiles";
const ACTIVE_KEY = "barbud_active_profile";

interface LocalProfile {
  id: string;
  name: string;
  ingredients: { name: string; quantity: string; volume: string }[];
}

/**
 * Migrates local AsyncStorage profiles into Supabase for the given user.
 * Returns true if data was migrated, false if skipped.
 */
export async function migrateLocalData(userId: string): Promise<boolean> {
  const alreadyMigrated = await AsyncStorage.getItem(MIGRATED_KEY);
  if (alreadyMigrated === "true") return false;

  const raw = await AsyncStorage.getItem(PROFILES_KEY);
  if (!raw) {
    await AsyncStorage.setItem(MIGRATED_KEY, "true");
    return false;
  }

  const localProfiles: LocalProfile[] = JSON.parse(raw);
  if (localProfiles.length === 0) {
    await AsyncStorage.setItem(MIGRATED_KEY, "true");
    return false;
  }

  const activeId = await AsyncStorage.getItem(ACTIVE_KEY);

  // Map old local IDs to new Supabase UUIDs
  let firstDbId: string | null = null;
  let activeDbId: string | null = null;

  for (const lp of localProfiles) {
    const dbProfile = await createProfile(userId, lp.name);
    if (!firstDbId) firstDbId = dbProfile.id;
    if (lp.id === activeId) activeDbId = dbProfile.id;

    if (lp.ingredients.length > 0) {
      await setProfileIngredients(dbProfile.id, lp.ingredients);
    }
  }

  // Set the active profile
  const targetActive = activeDbId ?? firstDbId;
  if (targetActive) {
    await setActiveProfile(userId, targetActive);
  }

  // Clean up local storage
  await AsyncStorage.multiRemove([PROFILES_KEY, ACTIVE_KEY]);
  await AsyncStorage.setItem(MIGRATED_KEY, "true");

  return true;
}
