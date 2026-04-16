import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  colors,
  fonts,
  letterSpacing,
  spacing,
  borders,
  shadows,
} from "../lib/theme";
import ProfileSelector from "./ProfileSelector";
import ImagePickerButton, { SelectedImage } from "./ImagePickerButton";
import PixelSpinner from "./PixelSpinner";
import {
  analyzeImages,
  recommendCocktails,
  getInstructions,
  Cocktail,
  InstructionsResponse,
} from "../lib/api";
import { Profile } from "../lib/profiles";

type TargetStep = "profile" | "photos" | "thinking" | "recommendation" | "instructions";

interface Props {
  profiles: Profile[];
  activeProfile: Profile;
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
  renameProfile: (id: string, name: string) => void;
  removeProfile: (id: string) => void;
  addProfile: (name: string) => void;
  setActiveIngredients: (ingredients: { name: string; quantity: string; volume: string }[]) => void;
}

export default function TargetMode({
  profiles,
  activeProfile,
  activeProfileId,
  setActiveProfileId,
  renameProfile,
  removeProfile,
  addProfile,
  setActiveIngredients,
}: Props) {
  const [step, setStep] = useState<TargetStep>("profile");
  const [unit, setUnit] = useState<"oz" | "ml">("oz");
  const [pendingImages, setPendingImages] = useState<SelectedImage[]>([]);
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [cocktailIdx, setCocktailIdx] = useState(0);
  const [instructions, setInstructions] = useState<InstructionsResponse | null>(null);
  const [loadingInstructions, setLoadingInstructions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset local state when profile changes
  useEffect(() => {
    setPendingImages([]);
    setCocktails([]);
    setCocktailIdx(0);
    setInstructions(null);
    setError(null);
  }, [activeProfileId]);

  const handleReadyToGo = () => {
    setError(null);
    setStep("thinking");
    runAnalysis();
  };

  const runAnalysis = async () => {
    try {
      const analyzeRes = await analyzeImages(
        pendingImages.map((img) => ({ base64: img.base64, mimeType: img.mimeType })),
        "claude"
      );
      setActiveIngredients(analyzeRes.ingredients);

      const recommendRes = await recommendCocktails(analyzeRes.ingredients, "claude");
      setCocktails(recommendRes.cocktails);
      setCocktailIdx(0);
      setStep("recommendation");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setStep("photos");
    }
  };

  const handleLooksGood = async () => {
    const cocktail = cocktails[cocktailIdx];
    setStep("instructions");
    setLoadingInstructions(true);
    setInstructions(null);
    try {
      const res = await getInstructions(cocktail.name, cocktail.recipe);
      setInstructions(res);
    } catch (err: any) {
      setError(err.message || "Failed to load instructions");
    } finally {
      setLoadingInstructions(false);
    }
  };

  const handleNoThanks = () => {
    if (cocktailIdx < cocktails.length - 1) {
      setCocktailIdx((i) => i + 1);
    }
  };

  const isExhausted = cocktailIdx >= cocktails.length - 1;
  const currentCocktail = cocktails[cocktailIdx];

  // ── Step: Profile ─────────────────────────────────────────
  if (step === "profile") {
    return (
      <View>
        <View style={styles.section}>
          <Text style={styles.label}>PROFILE</Text>
          <ProfileSelector
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSelect={setActiveProfileId}
            onRename={renameProfile}
            onDelete={removeProfile}
            onAdd={addProfile}
          />
        </View>

        <Pressable style={styles.button} onPress={() => setStep("photos")}>
          <Text style={styles.buttonText}>CONTINUE</Text>
        </Pressable>
      </View>
    );
  }

  // ── Step: Photos ──────────────────────────────────────────
  if (step === "photos") {
    const canProceed = pendingImages.length > 0;
    return (
      <View>
        <View style={styles.section}>
          <Text style={styles.label}>ADD PHOTOS</Text>
          <ImagePickerButton
            images={pendingImages}
            onImagesChanged={setPendingImages}
            maxImages={4}
          />
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          style={[styles.button, !canProceed && styles.buttonDisabled]}
          onPress={handleReadyToGo}
          disabled={!canProceed}
        >
          <Text style={styles.buttonText}>READY TO GO.</Text>
        </Pressable>
      </View>
    );
  }

  // ── Step: Thinking ────────────────────────────────────────
  if (step === "thinking") {
    return (
      <View style={styles.thinkingContainer}>
        <PixelSpinner />
        <Text style={styles.thinkingText}>Scheming...</Text>
      </View>
    );
  }

  // ── Step: Recommendation ─────────────────────────────────
  if (step === "recommendation" && currentCocktail) {
    return (
      <View>
        <View style={styles.cocktailCard}>
          <Text style={styles.cocktailName}>{currentCocktail.name}</Text>
          {currentCocktail.description && (
            <Text style={styles.cocktailDescription}>{currentCocktail.description}</Text>
          )}
          <View style={styles.recipeDivider} />
          {currentCocktail.recipe.map((line, i) => (
            <Text key={i} style={styles.recipeLine}>
              {"•  "}{line}
            </Text>
          ))}
        </View>

        <Pressable style={[styles.button, { marginTop: spacing.lg }]} onPress={handleLooksGood}>
          <Text style={styles.buttonText}>LOOKS GOOD, HOW DO I MAKE IT?</Text>
        </Pressable>

        <Pressable
          style={[
            styles.outlineButton,
            isExhausted && styles.buttonDisabled,
          ]}
          onPress={handleNoThanks}
          disabled={isExhausted}
        >
          <Text style={styles.outlineButtonText}>
            {isExhausted ? "ALL OUT OF IDEAS, SORRY!" : "NO THANKS, ANY OTHER IDEAS?"}
          </Text>
        </Pressable>
      </View>
    );
  }

  // ── Step: Instructions ────────────────────────────────────
  const convertUnits = (text: string): string => {
    if (unit === "oz") return text;
    // Replace patterns like "1.5 oz", "2oz", "0.75 oz" with ml equivalents
    return text.replace(/([\d.]+)\s*oz/gi, (_, n) => {
      const ml = Math.round(parseFloat(n) * 29.5735);
      return `${ml} ml`;
    });
  };

  if (step === "instructions") {
    return (
      <View>
        <Text style={styles.instructionsTitle}>{currentCocktail?.name}</Text>

        <View style={styles.unitToggle}>
          <Pressable
            style={[styles.unitButton, unit === "oz" && styles.unitButtonActive]}
            onPress={() => setUnit("oz")}
          >
            <Text style={[styles.unitButtonText, unit === "oz" && styles.unitButtonTextActive]}>oz</Text>
          </Pressable>
          <Pressable
            style={[styles.unitButton, unit === "ml" && styles.unitButtonActive]}
            onPress={() => setUnit("ml")}
          >
            <Text style={[styles.unitButtonText, unit === "ml" && styles.unitButtonTextActive]}>ml</Text>
          </Pressable>
        </View>

        {loadingInstructions && (
          <View style={styles.thinkingContainer}>
            <ActivityIndicator color={colors.gold} size="large" />
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {instructions && (
          <>
            <View style={styles.instructionSection}>
              <Text style={styles.label}>INGREDIENTS</Text>
              {instructions.ingredients.map((item, i) => (
                <Text key={i} style={styles.bulletLine}>{"•  "}{convertUnits(item)}</Text>
              ))}
            </View>

            <View style={styles.instructionSection}>
              <Text style={styles.label}>TOOLS</Text>
              {instructions.tools.map((item, i) => (
                <Text key={i} style={styles.bulletLine}>{"•  "}{item}</Text>
              ))}
            </View>

            <View style={styles.instructionSection}>
              <Text style={styles.label}>STEPS</Text>
              {instructions.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <Text style={styles.stepNumber}>Step {i + 1}</Text>
                  <Text style={styles.stepText}>{convertUnits(step)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
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
  outlineButton: {
    backgroundColor: "transparent",
    borderRadius: borders.radius.md,
    borderWidth: 1,
    borderColor: colors.gold,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.md,
  },
  outlineButtonText: {
    fontFamily: fonts.headingSemiBold,
    color: colors.gold,
    fontSize: 13,
    letterSpacing: letterSpacing.button,
  },
  thinkingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl * 2,
  },
  thinkingText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.parchmentMuted,
    marginTop: spacing.lg,
    letterSpacing: letterSpacing.gallery,
  },
  cocktailCard: {
    backgroundColor: colors.charcoal,
    borderRadius: borders.radius.lg,
    borderWidth: 1,
    borderColor: colors.goldDim,
    padding: spacing.lg,
    ...shadows.soft,
  },
  cocktailName: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.gold,
    letterSpacing: letterSpacing.heading,
    marginBottom: spacing.sm,
  },
  cocktailDescription: {
    fontFamily: fonts.headingRegular,
    fontSize: 15,
    color: colors.parchmentMuted,
    fontStyle: "italic",
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  recipeDivider: {
    height: 1,
    backgroundColor: colors.goldDim,
    marginBottom: spacing.md,
  },
  recipeLine: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.parchment,
    lineHeight: 22,
    paddingLeft: spacing.sm,
  },
  errorCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.errorBg,
    borderRadius: borders.radius.lg,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.error,
  },
  instructionsTitle: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.gold,
    letterSpacing: letterSpacing.heading,
    marginBottom: spacing.md,
  },
  unitToggle: {
    flexDirection: "row",
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  unitButton: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: borders.radius.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  unitButtonActive: {
    backgroundColor: colors.gold,
  },
  unitButtonText: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: letterSpacing.label,
  },
  unitButtonTextActive: {
    color: colors.obsidian,
  },
  instructionSection: {
    marginBottom: spacing.section,
  },
  bulletLine: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.parchment,
    lineHeight: 24,
    paddingLeft: spacing.sm,
  },
  stepRow: {
    marginBottom: spacing.md,
  },
  stepNumber: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: letterSpacing.label,
    marginBottom: 4,
  },
  stepText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.parchment,
    lineHeight: 24,
  },
});
