import { useState } from "react";
import {
  View,
  Text,
  TextInput,
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

// ─── Types ────────────────────────────────────────────────

export interface TastePreferences {
  lightStrong: number;        // -2 to 2
  sweetTart: number;          // -2 to 2
  classicAdventurous: number; // -2 to 2
  simpleComplex: number;      // -2 to 2
  notes: string;
}

interface Props {
  onProfileCreated: (name: string, prefs: TastePreferences) => void;
  onBack: () => void;
}

// ─── SegmentedSlider ─────────────────────────────────────

interface SegmentedSliderProps {
  value: number; // -2, -1, 0, 1, 2
  onChange: (v: number) => void;
}

const DOT_VALUES = [-2, -1, 0, 1, 2];

function SegmentedSlider({ value, onChange }: SegmentedSliderProps) {
  return (
    <View style={sliderStyles.row}>
      {DOT_VALUES.map((dotValue) => (
        <Pressable
          key={dotValue}
          onPress={() => onChange(dotValue)}
          style={[
            sliderStyles.dot,
            dotValue === value ? sliderStyles.dotSelected : sliderStyles.dotUnselected,
          ]}
          hitSlop={6}
        />
      ))}
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginHorizontal: 6,
  },
  dotSelected: {
    backgroundColor: colors.gold,
  },
  dotUnselected: {
    backgroundColor: colors.charcoalLight,
  },
});

// ─── ProfileCreationScreen ────────────────────────────────

export default function ProfileCreationScreen({ onProfileCreated, onBack }: Props) {
  const [profileName, setProfileName] = useState("");
  const [lightStrong, setLightStrong] = useState(0);
  const [sweetTart, setSweetTart] = useState(0);
  const [classicAdventurous, setClassicAdventurous] = useState(0);
  const [simpleComplex, setSimpleComplex] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isDisabled = profileName.trim() === "";

  const handleSubmit = () => {
    if (isDisabled) return;

    setSubmitted(true);
    const prefs: TastePreferences = {
      lightStrong,
      sweetTart,
      classicAdventurous,
      simpleComplex,
      notes,
    };

    setTimeout(() => {
      onProfileCreated(profileName.trim(), prefs);
    }, 3000);
  };

  const sliders: {
    label: string;
    leftLabel: string;
    rightLabel: string;
    value: number;
    onChange: (v: number) => void;
  }[] = [
    {
      label: "lightStrong",
      leftLabel: "Light",
      rightLabel: "Strong",
      value: lightStrong,
      onChange: setLightStrong,
    },
    {
      label: "sweetTart",
      leftLabel: "Sweet",
      rightLabel: "Tart",
      value: sweetTart,
      onChange: setSweetTart,
    },
    {
      label: "classicAdventurous",
      leftLabel: "Classic",
      rightLabel: "Adventurous",
      value: classicAdventurous,
      onChange: setClassicAdventurous,
    },
    {
      label: "simpleComplex",
      leftLabel: "Simple",
      rightLabel: "Complex",
      value: simpleComplex,
      onChange: setSimpleComplex,
    },
  ];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back button */}
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      {/* Header */}
      <Text style={styles.heading}>Let's build your taste profile</Text>

      {/* ── Profile Name ── */}
      <Text style={styles.label}>PROFILE NAME</Text>
      <TextInput
        style={styles.input}
        value={profileName}
        onChangeText={setProfileName}
        placeholder="Name this profile"
        placeholderTextColor={colors.parchmentMuted}
        maxLength={30}
        autoCorrect={false}
      />

      {/* ── Taste Preferences ── */}
      <Text style={styles.label}>TASTE PREFERENCES</Text>

      <View style={styles.slidersSection}>
        {sliders.map((slider) => (
          <View key={slider.label} style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>{slider.leftLabel}</Text>
            <SegmentedSlider value={slider.value} onChange={slider.onChange} />
            <Text style={[styles.sliderLabel, styles.sliderLabelRight]}>
              {slider.rightLabel}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Notes ── */}
      <Text style={styles.label}>Anything else I should know?</Text>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        placeholder="e.g. I love citrus, I'm a beginner bartender..."
        placeholderTextColor={colors.parchmentMuted}
        multiline
        maxLength={140}
        textAlignVertical="top"
      />
      <Text style={styles.charCounter}>{notes.length}/140</Text>

      {/* ── Submit Button ── */}
      <Pressable
        style={[styles.submitButton, isDisabled && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={isDisabled || submitted}
      >
        <Text style={styles.submitText}>Build My Profile</Text>
      </Pressable>

      {/* ── Success Flash ── */}
      {submitted && (
        <Text style={styles.successText}>Taste profile built!</Text>
      )}
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
    paddingBottom: 100,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },

  // ─── Back button ──────────────────────────────────────────
  backButton: {
    marginBottom: spacing.lg,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.parchmentMuted,
  },

  // ─── Header ──────────────────────────────────────────────
  heading: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.gold,
    letterSpacing: letterSpacing.heading,
    marginBottom: spacing.xl,
    textAlign: "center",
  },

  // ─── Shared label style ───────────────────────────────────
  label: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 11,
    color: colors.parchmentMuted,
    letterSpacing: letterSpacing.label,
    marginBottom: spacing.sm,
  },

  // ─── Text inputs ──────────────────────────────────────────
  input: {
    width: "100%",
    backgroundColor: colors.charcoal,
    borderRadius: borders.radius.md,
    borderWidth: borders.hairline,
    borderColor: colors.goldDim,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.parchment,
    letterSpacing: letterSpacing.gallery,
    marginBottom: spacing.section,
  },
  notesInput: {
    width: "100%",
    height: 90,
    backgroundColor: colors.charcoal,
    borderRadius: borders.radius.md,
    borderWidth: borders.hairline,
    borderColor: colors.goldDim,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.parchment,
    letterSpacing: letterSpacing.gallery,
    textAlignVertical: "top",
  },
  charCounter: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.parchmentFaint,
    textAlign: "right",
    marginBottom: spacing.section,
    marginTop: spacing.xs,
  },

  // ─── Sliders ──────────────────────────────────────────────
  slidersSection: {
    marginBottom: spacing.section,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  sliderLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.parchmentMuted,
    width: 70,
  },
  sliderLabelRight: {
    textAlign: "right",
  },

  // ─── Submit ───────────────────────────────────────────────
  submitButton: {
    width: "100%",
    backgroundColor: colors.gold,
    borderRadius: borders.radius.md,
    paddingVertical: 16,
    alignItems: "center",
    ...shadows.warm,
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.obsidian,
    letterSpacing: letterSpacing.button,
  },

  // ─── Success flash ────────────────────────────────────────
  successText: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 14,
    color: colors.gold,
    letterSpacing: letterSpacing.label,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
