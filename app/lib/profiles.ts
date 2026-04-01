import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ingredient } from "./api";
import { SelectedImage } from "../components/ImagePickerButton";

export interface Profile {
  id: string;
  name: string;
  ingredients: Ingredient[];
}

const DEFAULT_PROFILES: Profile[] = [
  { id: "1", name: "Default Profile", ingredients: [] },
];

const STORAGE_KEY = "barbud_profiles";
const ACTIVE_PROFILE_KEY = "barbud_active_profile";

let nextId = 100; // For generating new profile IDs

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>(DEFAULT_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>("1");
  const [loaded, setLoaded] = useState(false);

  // Per-profile processed photos (in-memory only, not persisted)
  const [processedPhotosMap, setProcessedPhotosMap] = useState<
    Record<string, SelectedImage[]>
  >({});

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const [storedProfiles, storedActive] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(ACTIVE_PROFILE_KEY),
        ]);
        if (storedProfiles) {
          const parsed = JSON.parse(storedProfiles);
          setProfiles(parsed);
          // Set nextId higher than any existing ID
          const maxId = parsed.reduce(
            (max: number, p: Profile) => Math.max(max, parseInt(p.id) || 0),
            0
          );
          nextId = maxId + 100;
        }
        if (storedActive) {
          setActiveProfileId(storedActive);
        }
      } catch (e) {
        // Ignore storage errors, use defaults
      }
      setLoaded(true);
    })();
  }, []);

  // Persist profiles when they change
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profiles)).catch(() => {});
  }, [profiles, loaded]);

  // Persist active profile when it changes
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId).catch(() => {});
  }, [activeProfileId, loaded]);

  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) ?? profiles[0];

  const setActiveIngredients = useCallback(
    (ingredients: Ingredient[]) => {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === activeProfileId ? { ...p, ingredients } : p
        )
      );
    },
    [activeProfileId]
  );

  const renameProfile = useCallback(
    (profileId: string, newName: string) => {
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, name: newName } : p))
      );
    },
    []
  );

  const addProfile = useCallback((name: string) => {
    const id = String(nextId++);
    const newProfile: Profile = { id, name, ingredients: [] };
    setProfiles((prev) => [...prev, newProfile]);
    setActiveProfileId(id);
    return id;
  }, []);

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
