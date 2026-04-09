import { useState, useEffect, useCallback } from "react";
import { Ingredient } from "./api";
import { SelectedImage } from "../components/ImagePickerButton";
import {
  DbProfile,
  fetchProfiles,
  createProfile,
  updateProfileName,
  setProfileIngredients,
  setActiveProfile,
  deleteProfile,
} from "./db";
import { migrateLocalData } from "./migrate";

export interface Profile {
  id: string;
  name: string;
  ingredients: Ingredient[];
}

export function useProfiles(userId: string | null) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileIdState] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Per-profile processed photos (in-memory only)
  const [processedPhotosMap, setProcessedPhotosMap] = useState<
    Record<string, SelectedImage[]>
  >({});

  // Load profiles from Supabase on mount / user change
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    (async () => {
      try {
        // Attempt to migrate local AsyncStorage data first
        await migrateLocalData(userId);

        // Fetch from Supabase
        let dbProfiles = await fetchProfiles(userId);

        // Deduplicate: for each name, keep the copy with the most ingredients
        // and delete the rest (artifacts from failed migrations)
        const byName = new Map<string, DbProfile[]>();
        for (const p of dbProfiles) {
          const key = p.name.trim().toLowerCase();
          byName.set(key, [...(byName.get(key) ?? []), p]);
        }
        const toDelete: string[] = [];
        dbProfiles = [];
        for (const group of byName.values()) {
          group.sort((a, b) => b.ingredients.length - a.ingredients.length);
          dbProfiles.push(group[0]);
          for (let i = 1; i < group.length; i++) toDelete.push(group[i].id);
        }
        // Fire-and-forget cleanup — don't block load on this
        if (toDelete.length > 0) {
          Promise.all(toDelete.map((id) => deleteProfile(id))).catch(console.warn);
        }

        // Create a default profile if the user has none
        if (dbProfiles.length === 0) {
          const def = await createProfile(userId, "Default Profile", true);
          dbProfiles = [def];
        }

        if (cancelled) return;

        const mapped: Profile[] = dbProfiles.map((p) => ({
          id: p.id,
          name: p.name,
          ingredients: p.ingredients,
        }));

        setProfiles(mapped);

        // Determine active profile
        const active = dbProfiles.find((p) => p.is_active);
        setActiveProfileIdState(active?.id ?? mapped[0].id);
      } catch (e: any) {
        console.error("Failed to load profiles:", e);
        setLoadError(e?.message || String(e) || "Failed to load profiles");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) ?? profiles[0];

  const setActiveProfileId = useCallback(
    (id: string) => {
      setActiveProfileIdState(id);
      if (userId) {
        setActiveProfile(userId, id).catch(console.error);
      }
    },
    [userId]
  );

  const setActiveIngredients = useCallback(
    (ingredients: Ingredient[]) => {
      // Optimistic local update
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === activeProfileId ? { ...p, ingredients } : p
        )
      );
      // Persist to Supabase
      setProfileIngredients(activeProfileId, ingredients).catch(console.error);
    },
    [activeProfileId]
  );

  const renameProfile = useCallback(
    (profileId: string, newName: string) => {
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, name: newName } : p))
      );
      updateProfileName(profileId, newName).catch(console.error);
    },
    []
  );

  const removeProfile = useCallback(
    (profileId: string) => {
      setProfiles((prev) => {
        const next = prev.filter((p) => p.id !== profileId);
        // If we just deleted the active profile, switch to the first remaining one
        if (profileId === activeProfileId && next.length > 0) {
          setActiveProfileIdState(next[0].id);
        }
        return next;
      });
      deleteProfile(profileId).catch(console.error);
    },
    [activeProfileId]
  );

  const addProfile = useCallback(
    (name: string) => {
      if (!userId) return "";

      // Create optimistic local profile with temp ID
      const tempId = `temp_${Date.now()}`;
      const newProfile: Profile = { id: tempId, name, ingredients: [] };
      setProfiles((prev) => [...prev, newProfile]);
      setActiveProfileIdState(tempId);

      // Create in Supabase and replace temp ID
      createProfile(userId, name, true)
        .then((dbProfile) => {
          setProfiles((prev) =>
            prev.map((p) =>
              p.id === tempId ? { ...p, id: dbProfile.id } : p
            )
          );
          setActiveProfileIdState(dbProfile.id);
        })
        .catch(console.error);

      return tempId;
    },
    [userId]
  );

  // Processed photos for the active profile
  const processedPhotos = processedPhotosMap[activeProfileId] ?? [];

  const setProcessedPhotos = useCallback(
    (photos: SelectedImage[]) => {
      setProcessedPhotosMap((prev) => ({
        ...prev,
        [activeProfileId]: photos,
      }));
    },
    [activeProfileId]
  );

  return {
    profiles,
    activeProfile,
    activeProfileId,
    setActiveProfileId,
    setActiveIngredients,
    renameProfile,
    removeProfile,
    addProfile,
    processedPhotos,
    setProcessedPhotos,
    loaded,
    loadError,
  };
}
