import { supabase } from "./supabase";
import { Ingredient } from "./api";

export interface DbProfile {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  ingredients: Ingredient[];
}

export async function fetchProfiles(userId: string): Promise<DbProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, user_id, name, is_active, ingredients(name, quantity, volume)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((p: any) => ({
    id: p.id,
    user_id: p.user_id,
    name: p.name,
    is_active: p.is_active,
    ingredients: p.ingredients ?? [],
  }));
}

export async function createProfile(
  userId: string,
  name: string,
  isActive = false
): Promise<DbProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .insert({ user_id: userId, name, is_active: isActive })
    .select()
    .single();

  if (error) throw error;
  return { ...data, ingredients: [] };
}

export async function updateProfileName(
  profileId: string,
  name: string
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) throw error;
}

export async function deleteProfile(profileId: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId);

  if (error) throw error;
}

export async function setProfileIngredients(
  profileId: string,
  ingredients: Ingredient[]
): Promise<void> {
  // Delete existing ingredients
  const { error: delError } = await supabase
    .from("ingredients")
    .delete()
    .eq("profile_id", profileId);

  if (delError) throw delError;

  // Insert new ingredients (if any)
  if (ingredients.length > 0) {
    const rows = ingredients.map((ing) => ({
      profile_id: profileId,
      name: ing.name ?? "",
      quantity: ing.quantity ?? "",
      volume: ing.volume ?? "",
    }));

    const { error: insError } = await supabase
      .from("ingredients")
      .insert(rows);

    if (insError) throw insError;
  }
}

export async function setActiveProfile(
  userId: string,
  profileId: string
): Promise<void> {
  // Deactivate all profiles for this user
  const { error: deactError } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("user_id", userId);

  if (deactError) throw deactError;

  // Activate the target profile
  const { error: actError } = await supabase
    .from("profiles")
    .update({ is_active: true })
    .eq("id", profileId);

  if (actError) throw actError;
}
