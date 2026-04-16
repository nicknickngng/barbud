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
      } catch (e) {
        console.error("Failed to load profiles:", e);
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
    addProfile,
    processedPhotos,
    setProcessedPhotos,
    loaded,
  };
}
