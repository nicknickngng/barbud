import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, ActivityIndicator, Platform, Alert } from "react-native";
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
import BottomNav from "./components/BottomNav";
import NameEntryScreen from "./components/NameEntryScreen";
import SettingsModal from "./components/SettingsModal";

const UNLOCK_KEY = "barbud_unlocked";

type AppScreen =
  | "profile-select"
  | "profile-create"
  | "ingredient-capture"
  | "loading"
  | "cocktail-result"
  | "recipe";

// Screens that show the BottomNav
const SCREENS_WITH_NAV: AppScreen[] = [
  "profile-select",
  "profile-create",
  "ingredient-capture",
  "cocktail-result",
  "recipe",
];

function AppContent() {
  const [fontsLoaded] = useAppFonts();
  const { session, user, loading: authLoading, signOut } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ─── Screen state machine ──────────────────────────────────
  const [screen, setScreen] = useState<AppScreen>("profile-select");
  const [screenHistory, setScreenHistory] = useState<AppScreen[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ─── App data state ────────────────────────────────────────
  const [model, setModel] = useState<ModelType>("claude");
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [currentCocktail, setCurrentCocktail] = useState<Cocktail | null>(null);
  const [apiReady, setApiReady] = useState(false);
  const lastIngredients = useRef<{ name: string; quantity: string; volume: string }[]>([]);

  // Reset settings modal whenever session changes (sign-in / sign-out)
  useEffect(() => {
    setSettingsOpen(false);
  }, [session]);

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
    removeProfile,
    loaded: profilesLoaded,
  } = useProfiles(user?.id ?? null);

  // True once we've seen at least one profile — prevents redirect when user
  // manually deletes their last profile (vs. a brand-new account with none).
  const hadProfilesRef = useRef(false);
  if (profiles.length > 0) hadProfilesRef.current = true;

  // Auto-redirect to profile creation only on first load with no profiles
  useEffect(() => {
    if (profilesLoaded && profiles.length === 0 && !hadProfilesRef.current && screen === "profile-select") {
      navigateTo("profile-create");
    }
  }, [profilesLoaded, profiles.length]);

  // ─── Navigation helpers ───────────────────────────────────
  const navigateTo = (next: AppScreen) => {
    setScreen((prev) => {
      // Don't push "loading" onto history (it's not a meaningful back target)
      if (prev !== "loading" && prev !== next) {
        setScreenHistory((h) => [...h, prev]);
      }
      return next;
    });
  };

  const handleBack = () => {
    setScreenHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setScreen(prev);
      return h.slice(0, -1);
    });
  };

  const handleStartOver = () => {
    setScreenHistory([]);
    setScreen("profile-select");
  };

  // ─── Navigation handlers ──────────────────────────────────
  const handleSelectProfile = (id: string) => {
    setActiveProfileId(id);
    navigateTo("ingredient-capture");
  };

  const handleNewProfile = () => {
    navigateTo("profile-create");
  };

  const handleProfileCreated = (name: string, _prefs: TastePreferences) => {
    addProfile(name);
    navigateTo("ingredient-capture");
  };

  const handleMakeIt = (cocktail: Cocktail) => {
    setCurrentCocktail(cocktail);
    navigateTo("recipe");
  };

  const handleBothReady = () => {
    navigateTo("cocktail-result");
  };

  // ─── API logic ────────────────────────────────────────────
  const runAnalysisAndRecommend = async (images: SelectedImage[]) => {
    setApiReady(false);
    // Don't push loading into history
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
    } catch (err: any) {
      console.error("[barbud] Analysis failed:", err);
      setScreen("ingredient-capture");
      Alert.alert(
        "Analysis Failed",
        err?.message || "Something went wrong. Please try again.",
        [{ text: "OK" }]
      );
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

  if (!user?.user_metadata?.full_name) {
    return <NameEntryScreen onComplete={() => {}} />;
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

  // ─── Derived values ───────────────────────────────────────
  const userName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "there";

  const showBottomNav = SCREENS_WITH_NAV.includes(screen);
  const backDisabled = screenHistory.length === 0;

  // ─── Screen renderers ─────────────────────────────────────
  const renderScreen = () => {
    if (screen === "profile-select") {
      return (
        <ProfileSelectionScreen
          profiles={profiles}
          userName={userName}
          onSelectProfile={handleSelectProfile}
          onNewProfile={handleNewProfile}
          onDeleteProfile={removeProfile}
        />
      );
    }

    if (screen === "profile-create") {
      return (
        <ProfileCreationScreen
          onProfileCreated={handleProfileCreated}
          onBack={handleBack}
        />
      );
    }

    if (screen === "ingredient-capture") {
      if (!activeProfile) {
        return (
          <View style={styles.spinnerWrap}>
            <ActivityIndicator color={colors.gold} size="large" />
          </View>
        );
      }
      return (
        <IngredientCaptureScreen
          activeProfile={activeProfile}
          model={model}
          onModelChange={setModel}
          onSubmit={runAnalysisAndRecommend}
        />
      );
    }

    if (screen === "loading") {
      return <LoadingScreen apiReady={apiReady} onBothReady={handleBothReady} />;
    }

    if (screen === "cocktail-result") {
      return (
        <CocktailResultScreen
          cocktails={cocktails}
          onMakeIt={handleMakeIt}
        />
      );
    }

    if (screen === "recipe") {
      return <RecipeScreen cocktail={currentCocktail!} />;
    }

    return null;
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {renderScreen()}
      {showBottomNav && (
        <BottomNav
          onBack={handleBack}
          onStartOver={handleStartOver}
          onSettings={() => setSettingsOpen(true)}
          backDisabled={backDisabled}
        />
      )}
      {settingsOpen && (
        <SettingsModal
          userEmail={user?.email ?? ""}
          onSignOut={handleSignOut}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.obsidian,
  },
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
