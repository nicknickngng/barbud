import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
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
import { SelectedImage } from "./ImagePickerButton";
import ImagePickerButton from "./ImagePickerButton";
import { Profile } from "../lib/profiles";
import { ModelType } from "../lib/api";
import ModelSelector from "./ModelSelector";

// ─── Props ────────────────────────────────────────────────

interface Props {
  activeProfile: Profile;
  model: ModelType;
  onModelChange: (model: ModelType) => void;
  onSubmit: (images: SelectedImage[]) => void;
  onSettings: () => void;
}

// ─── IngredientCaptureScreen ──────────────────────────────

const MAX_IMAGES = 4;

export default function IngredientCaptureScreen({
  activeProfile,
  model,
  onModelChange,
  onSubmit,
  onSettings,
}: Props) {
  const [images, setImages] = useState<SelectedImage[]>([]);

  const handleImagesChanged = (newImages: SelectedImage[]) => {
    setImages(newImages.slice(0, MAX_IMAGES));
  };

  const isSubmitDisabled = images.length === 0;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Settings icon (top-right) ── */}
      <Pressable style={styles.settingsButton} onPress={onSettings}>
        <Text style={styles.settingsIcon}>⚙</Text>
      </Pressable>

      {/* ── Header ── */}
      <Text style={styles.heading}>What are we working with today?</Text>
      <Text style={styles.subtitle}>
        Take or upload photos for analysis. (4 max.)
      </Text>

      {/* ── Active profile indicator ── */}
      <View style={styles.profilePill}>
        <Text style={styles.profilePillText}>
          Profile: {activeProfile.name}
        </Text>
      </View>

      {/* ── Model selector ── */}
      <View style={styles.section}>
        <Text style={styles.label}>MODEL</Text>
        <ModelSelector selected={model} onSelect={onModelChange} />
      </View>

      {/* ── Photo picker ── */}
      <View style={styles.section}>
        <Text style={styles.label}>ADD PHOTOS</Text>
        <ImagePickerButton
          images={images}
          onImagesChanged={handleImagesChanged}
        />
      </View>

      {/* ── CTA button ── */}
      <Pressable
        style={[
          styles.ctaButton,
          isSubmitDisabled && styles.ctaDisabled,
        ]}
        onPress={() => onSubmit(images)}
        disabled={isSubmitDisabled}
      >
        <Text style={styles.ctaText}>Find Me a Cocktail</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.obsidian,
  },
  container: {
    padding: spacing.containerPadding,
    paddingTop: spacing.containerTop,
    paddingBottom: spacing.containerBottom,
  },

  // ─── Settings ────────────────────────────────────────────
  settingsButton: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.containerPadding,
  },
  settingsIcon: {
    fontSize: 20,
    color: colors.parchmentMuted,
  },

  // ─── Header ──────────────────────────────────────────────
  heading: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.gold,
    letterSpacing: letterSpacing.heading,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.parchmentMuted,
    letterSpacing: letterSpacing.subtitle,
    textAlign: "center",
    marginBottom: spacing.xl,
  },

  // ─── Profile pill ─────────────────────────────────────────
  profilePill: {
    alignSelf: "center",
    backgroundColor: colors.charcoal,
    borderRadius: borders.radius.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  profilePillText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.parchmentMuted,
    letterSpacing: letterSpacing.gallery,
  },

  // ─── Sections ─────────────────────────────────────────────
  section: {
    marginBottom: spacing.section,
  },
  label: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 11,
    color: colors.parchmentMuted,
    letterSpacing: letterSpacing.label,
    marginBottom: spacing.sm,
  },

  // ─── CTA button ───────────────────────────────────────────
  ctaButton: {
    width: "100%",
    backgroundColor: colors.gold,
    borderRadius: borders.radius.md,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: spacing.lg,
    ...shadows.warm,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.obsidian,
    letterSpacing: letterSpacing.button,
  },
});
