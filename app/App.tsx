import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useAppFonts } from "./lib/fonts";
import {
  colors,
  fonts,
  letterSpacing,
  spacing,
  borders,
  shadows,
} from "./lib/theme";
import ImagePickerButton, {
  SelectedImage,
} from "./components/ImagePickerButton";
import ProcessedPhotos from "./components/ProcessedPhotos";
import ModelSelector from "./components/ModelSelector";
import ProfileSelector from "./components/ProfileSelector";
import IngredientsTable from "./components/IngredientsTable";
import PasswordGate from "./components/PasswordGate";
import AuthScreen from "./components/AuthScreen";
import CocktailList from "./components/CocktailList";
import { AuthProvider, useAuth } from "./lib/auth";
import { analyzeImages, recommendCocktails, Cocktail, ModelType } from "./lib/api";
import { useProfiles } from "./lib/profiles";

const UNLOCK_KEY = "barbud_unlocked";

function AppContent() {
  const [fontsLoaded] = useAppFonts();
  const { session, user, loading: authLoading, signOut } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [pendingImages, setPendingImages] = useState<SelectedImage[]>([]);
  const [model, setModel] = useState<ModelType>("claude");
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [stale, setStale] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [loadingCocktails, setLoadingCocktails] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(UNLOCK_KEY).then((val) => {
      if (val === "true") setUnlocked(true);
      setCheckingAuth(false);
    });
  }, []);

  const handleUnlock = async () => {
    await AsyncStorage.setItem(UNLOCK_KEY, "true");
    setUnlocked(true);
  };

  const {
    profiles,
    activeProfile,
    activeProfileId,
    setActiveProfileId,
    setActiveIngredients,
    renameProfile,
    addProfile,
    processedPhotos,
    setProcessedPhotos,
    loaded: profilesLoaded,
  } = useProfiles(user?.id ?? null);

  // Clear pending images when switching profiles
  useEffect(() => {
    setPendingImages([]);
    setDescriptions([]);
    setStale(false);
    setError(null);
    setCocktails([]);
  }, [activeProfileId]);

  const handleAnalyze = async () => {
    if (pendingImages.length === 0) return;

    setLoading(true);
    setDescriptions([]);
    setStale(false);
    setError(null);

    const allImages = [...processedPhotos, ...pendingImages];

    try {
      const response = await analyzeImages(
        allImages.map((img) => ({
          base64: img.base64,
          mimeType: img.mimeType,
        })),
        model
      );
      setDescriptions(response.descriptions);
      setActiveIngredients(response.ingredients);

      setProcessedPhotos(allImages);
      setPendingImages([]);

      // Fetch cocktail recommendations
      fetchCocktails(response.ingredients);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchCocktails = async (ingredients: { name: string; quantity: string; volume: string }[]) => {
    if (ingredients.length === 0) {
      setCocktails([]);
      return;
    }
    setLoadingCocktails(true);
    try {
      const res = await recommendCocktails(ingredients, model);
      setCocktails(res.cocktails);
    } catch {
      // Silently fail — cocktails are a bonus, not critical
      setCocktails([]);
    } finally {
      setLoadingCocktails(false);
    }
  };

  const handleRecheck = async () => {
    if (processedPhotos.length === 0) return;

    setLoading(true);
    setDescriptions([]);
    setError(null);

    try {
      const response = await analyzeImages(
        processedPhotos.map((img) => ({
          base64: img.base64,
          mimeType: img.mimeType,
        })),
        model
      );
      setDescriptions(response.descriptions);
      setActiveIngredients(response.ingredients);
      setStale(false);

      fetchCocktails(response.ingredients);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProcessed = (index: number) => {
    const updated = processedPhotos.filter((_, i) => i !== index);
    setProcessedPhotos(updated);
    if (updated.length === 0) {
      setActiveIngredients([]);
      setStale(false);
      setDescriptions([]);
      setCocktails([]);
    } else {
      setStale(true);
    }
  };

  if (!fontsLoaded || authLoading || checkingAuth) {
    return <View style={styles.scroll} />;
  }

  // Layer 1: Supabase auth
  if (!session) {
    return <AuthScreen />;
  }

  // Layer 2: App password gate
  if (!unlocked) {
    return <PasswordGate onUnlock={handleUnlock} />;
  }

  // Layer 3: Wait for profiles to load
  if (!profilesLoaded || !activeProfile) {
    return (
      <View style={[styles.scroll, styles.loadingWrap]}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  const hasProcessedPhotos = processedPhotos.length > 0;
  const canIdentify = pendingImages.length > 0 && !loading;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <StatusBar style="light" />

      <Text style={styles.title}>the nightcap project</Text>
      <Text style={styles.subtitle}>WHAT'S IN YOUR BAR CART?</Text>

      <View style={styles.section}>
        <Text style={styles.label}>MODEL</Text>
        <ModelSelector selected={model} onSelect={setModel} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>PROFILE</Text>
        <ProfileSelector
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelect={setActiveProfileId}
          onRename={renameProfile}
          onAdd={addProfile}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>ADD PHOTOS</Text>
        <ImagePickerButton
          images={pendingImages}
          onImagesChanged={setPendingImages}
        />
      </View>

      <Pressable
        style={[styles.button, !canIdentify && styles.buttonDisabled]}
        onPress={handleAnalyze}
        disabled={!canIdentify}
      >
        {loading && !stale ? (
          <ActivityIndicator color={colors.obsidian} />
        ) : (
          <Text style={styles.buttonText}>IDENTIFY INGREDIENTS</Text>
        )}
      </Pressable>

      {/* Processed photos section */}
      {hasProcessedPhotos && (
        <View style={styles.section}>
          <Text style={[styles.label, { marginTop: spacing.lg }]}>
            PROCESSED PHOTOS
          </Text>
          <ProcessedPhotos
            images={processedPhotos}
            onRemove={handleRemoveProcessed}
          />
        </View>
      )}

      {/* Recheck button when stale */}
      {stale && hasProcessedPhotos && (
        <Pressable
          style={[styles.recheckButton, loading && styles.buttonDisabled]}
          onPress={handleRecheck}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.gold} />
          ) : (
            <Text style={styles.recheckButtonText}>
              CHECK MY INGREDIENTS AGAIN
            </Text>
          )}
        </Pressable>
      )}

      {/* Debug text */}
      {descriptions.length > 0 && (
        <View style={styles.resultCard}>
          <Text style={styles.debugTitle}>DEBUG TEXT</Text>
          {descriptions.map((desc, index) => (
            <Text
              key={index}
              style={[
                styles.resultText,
                index > 0 && styles.resultTextSpaced,
              ]}
            >
              {desc}
            </Text>
          ))}
        </View>
      )}

      {/* Ingredients table */}
      {activeProfile.ingredients.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>
            INGREDIENTS — {activeProfile.name.toUpperCase()}
            {stale ? " (outdated)" : ""}
          </Text>
          <IngredientsTable
            ingredients={activeProfile.ingredients}
            stale={stale}
          />
        </View>
      )}

      {/* Recommended cocktails */}
      {(cocktails.length > 0 || loadingCocktails) && (
        <View style={styles.section}>
          <Text style={styles.label}>
            RECOMMENDED COCKTAILS
            {stale ? " (outdated)" : ""}
          </Text>
          {loadingCocktails ? (
            <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.md }} />
          ) : (
            <CocktailList cocktails={cocktails} stale={stale} />
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Sign out */}
      <Pressable onPress={signOut} style={styles.signOutWrap}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
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
  scroll: {
    flex: 1,
    backgroundColor: colors.obsidian,
  },
  loadingWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: spacing.containerPadding,
    paddingTop: spacing.containerTop,
    paddingBottom: spacing.containerBottom,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.gold,
    textAlign: "center",
    letterSpacing: letterSpacing.heading,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.parchmentMuted,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    letterSpacing: letterSpacing.subtitle,
  },
  section: {
    marginBottom: spacing.section,
  },
  label: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 11,
    color: colors.parchmentMuted,
    marginBottom: spacing.sm,
    letterSpacing: letterSpacing.label,
  },
  button: {
    backgroundColor: colors.gold,
    borderRadius: borders.radius.md,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: spacing.xs,
    ...shadows.warm,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontFamily: fonts.heading,
    color: colors.obsidian,
    fontSize: 15,
    letterSpacing: letterSpacing.button,
  },
  recheckButton: {
    backgroundColor: "transparent",
    borderRadius: borders.radius.md,
    borderWidth: 1,
    borderColor: colors.gold,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: spacing.section,
  },
  recheckButtonText: {
    fontFamily: fonts.headingSemiBold,
    color: colors.gold,
    fontSize: 13,
    letterSpacing: letterSpacing.button,
  },
  resultCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.charcoal,
    borderRadius: borders.radius.lg,
    borderWidth: borders.hairline,
    borderColor: colors.goldDim,
    padding: spacing.lg,
    ...shadows.soft,
  },
  debugTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: letterSpacing.label,
    marginBottom: spacing.md,
  },
  resultText: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.parchment,
  },
  resultTextSpaced: {
    marginTop: spacing.md,
  },
  errorCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.errorBg,
    borderRadius: borders.radius.lg,
    borderWidth: borders.hairline,
    borderColor: colors.error,
    padding: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.error,
  },
  signOutWrap: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
  signOutText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.parchmentMuted,
    letterSpacing: letterSpacing.gallery,
  },
});
