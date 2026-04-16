import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, ActivityIndicator, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useAppFonts } from "./lib/fonts";
import { colors } from "./lib/theme";
import { AuthProvider, useAuth } from "./lib/auth";
import { analyzeImages, recommendCocktails, Cocktail, ModelType } from "./lib/api";
import { useProfiles } from "./lib/profiles";
import { SelectedImage } from "./components/ImagePickerButton";

import AuthScreen from "./components/AuthScreen";
import PasswordGate from "./components/PasswordGate";
import ProfileSelectionScreen from "./components/ProfileSelectionScreen";
import ProfileCreationScreen, { TastePreferences } from "./components/ProfileCreationScreen";
import IngredientCaptureScreen from "./components/IngredientCaptureScreen";
import LoadingScreen from "./components/LoadingScreen";
import CocktailResultScreen from "./components/CocktailResultScreen";
import RecipeScreen from "./components/RecipeScreen";
import SettingsScreen from "./components/SettingsScreen";

const UNLOCK_KEY = "barbud_unlocked";

type AppScreen =
  | "profile-select"
  | "profile-create"
  | "ingredient-capture"
  | "loading"
  | "cocktail-result"
  | "recipe"
  | "settings";

function AppContent() {
  const [fontsLoaded] = useAppFonts();
  const { session, user, loading: authLoading, signOut } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ─── App screen state machine ─────────────────────────────
  const [screen, setScreen] = useState<AppScreen>("profile-select");
  const [model, setModel] = useState<ModelType>("claude");
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [currentCocktail, setCurrentCocktail] = useState<Cocktail | null>(null);
  const [apiReady, setApiReady] = useState(false);
  const lastIngredients = useRef<{ name: string; quantity: string; volume: string }[]>([]);

  // ─── Password gate ────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(UNLOCK_KEY).then((val) => {
      if (val === "true") setUnlocked(true);
      setCheckingAuth(false);
    });
  }, []);

  // Remove trailing "#" from URL on web (left behind after OAuth redirect)
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (window.location.hash === "" && window.location.href.includes("#")) {
      window.history.replaceState(
        null,
        document.title,
        window.location.pathname + window.location.search
      );
    }
  }, []);

  const handleUnlock = async () => {
    await AsyncStorage.setItem(UNLOCK_KEY, "true");
    setUnlocked(true);
  };

  // ─── Profiles ─────────────────────────────────────────────
  const {
    profiles,
    activeProfile,
    activeProfileId,
    setActiveProfileId,
    setActiveIngredients,
    addProfile,
    loaded: profilesLoaded,
  } = useProfiles(user?.id ?? null);

  // Auto-redirect to profile creation when user has no profiles
  useEffect(() => {
    if (profilesLoaded && profiles.length === 0 && screen === "profile-select") {
      setScreen("profile-create");
    }
  }, [profilesLoaded, profiles.length, screen]);

  // ─── Navigation handlers ──────────────────────────────────
  const handleSelectProfile = (id: string) => {
    setActiveProfileId(id);
    setScreen("ingredient-capture");
  };

  const handleNewProfile = () => {
    setScreen("profile-create");
  };

  const handleProfileCreated = (name: string, _prefs: TastePreferences) => {
    addProfile(name);
    setScreen("ingredient-capture");
  };

  const handleSettings = () => {
    setScreen("settings");
  };

  const handleStartOver = () => {
    setScreen("profile-select");
  };

  const handleMakeIt = (cocktail: Cocktail) => {
    setCurrentCocktail(cocktail);
    setScreen("recipe");
  };

  const handleDone = () => {
    setScreen("ingredient-capture");
  };

  // ─── API logic ────────────────────────────────────────────
  const runAnalysisAndRecommend = async (images: SelectedImage[]) => {
    setApiReady(false);
    setScreen("loading");

    try {
      const response = await analyzeImages(
        images.map((img) => ({ base64: img.base64, mimeType: img.mimeType })),
        model
      );
      setActiveIngredients(response.ingredients);
      lastIngredients.current = response.ingredients;

      if (response.ingredients.length > 0) {
        const res = await recommendCocktails(response.ingredients, model);
        setCocktails(res.cocktails);
      } else {
        setCocktails([]);
      }
    } catch {
      // On error, go back to ingredient capture
      setScreen("ingredient-capture");
      return;
    }

    setApiReady(true);
  };

  const handleAnother = async () => {
    setApiReady(false);
    setScreen("loading");

    try {
      const ingredients =
        lastIngredients.current.length > 0
          ? lastIngredients.current
          : activeProfile?.ingredients ?? [];

      if (ingredients.length > 0) {
        const res = await recommendCocktails(ingredients, model);
        setCocktails(res.cocktails);
      }
    } catch {
      // Keep existing cocktails and transition anyway
    }

    setApiReady(true);
  };

  const handleBothReady = () => {
    setScreen("cocktail-result");
  };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem(UNLOCK_KEY);
    await signOut();
  };

  // ─── Pre-app gates ────────────────────────────────────────
  if (!fontsLoaded || authLoading || checkingAuth) {
    return <View style={styles.blank} />;
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (!unlocked) {
    return <PasswordGate onUnlock={handleUnlock} />;
  }

  if (!profilesLoaded) {
    return (
      <View style={styles.spinnerWrap}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  // ─── Screen state machine ─────────────────────────────────
  const userName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "there";

  if (screen === "profile-select") {
    return (
      <>
        <StatusBar style="light" />
        <ProfileSelectionScreen
          profiles={profiles}
          userName={userName}
          onSelectProfile={handleSelectProfile}
          onNewProfile={handleNewProfile}
        />
      </>
    );
  }

  if (screen === "profile-create") {
    return (
      <>
        <StatusBar style="light" />
        <ProfileCreationScreen
          onProfileCreated={handleProfileCreated}
          onBack={() => setScreen("profile-select")}
        />
      </>
    );
  }

  if (screen === "ingredient-capture") {
    // Safeguard: if no active profile yet, wait
    if (!activeProfile) {
      return (
        <View style={styles.spinnerWrap}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      );
    }
    return (
      <>
        <StatusBar style="light" />
        <IngredientCaptureScreen
          activeProfile={activeProfile}
          model={model}
          onModelChange={setModel}
          onSubmit={runAnalysisAndRecommend}
          onSettings={handleSettings}
        />
      </>
    );
  }

  if (screen === "loading") {
    return (
      <>
        <StatusBar style="light" />
        <LoadingScreen apiReady={apiReady} onBothReady={handleBothReady} />
      </>
    );
  }

  if (screen === "cocktail-result") {
    return (
      <>
        <StatusBar style="light" />
        <CocktailResultScreen
          cocktails={cocktails}
          onMakeIt={handleMakeIt}
          onAnother={handleAnother}
        />
      </>
    );
  }

  if (screen === "recipe") {
    return (
      <>
        <StatusBar style="light" />
        <RecipeScreen
          cocktail={currentCocktail!}
          onDone={handleDone}
        />
      </>
    );
  }

  if (screen === "settings") {
    return (
      <>
        <StatusBar style="light" />
        <SettingsScreen
          userEmail={user?.email ?? ""}
          onSignOut={handleSignOut}
          onStartOver={handleStartOver}
          onClose={() => setScreen("ingredient-capture")}
        />
      </>
    );
  }

  return <View style={styles.blank} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  blank: {
    flex: 1,
    backgroundColor: colors.obsidian,
  },
  spinnerWrap: {
    flex: 1,
    backgroundColor: colors.obsidian,
    justifyContent: "center",
    alignItems: "center",
  },
});
