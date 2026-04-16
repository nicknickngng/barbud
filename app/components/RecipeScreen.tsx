import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Cocktail } from "../lib/api";
import {
  borders,
  colors,
  fonts,
  letterSpacing,
  spacing,
} from "../lib/theme";

interface Props {
  cocktail: Cocktail;
  onDone: () => void;
}

export default function RecipeScreen({ cocktail, onDone }: Props) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.emoji}>🍸</Text>
      <Text style={styles.cocktailName}>{cocktail.name}</Text>

      <Text style={styles.sectionLabel}>RECIPE</Text>

      {cocktail.recipe.map((line, i) => (
        <View key={i} style={styles.stepRow}>
          <Text style={styles.stepNumber}>{i + 1}</Text>
          <Text style={styles.stepText}>{line}</Text>
        </View>
      ))}

      <Text style={styles.cheers}>Cheers! 🥂</Text>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={onDone}
        activeOpacity={0.7}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.obsidian,
  },
  content: {
    padding: spacing.containerPadding,
    paddingTop: spacing.containerTop,
    paddingBottom: spacing.containerBottom,
  },
  emoji: {
    fontSize: 36,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  cocktailName: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.gold,
    letterSpacing: letterSpacing.heading,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.parchmentMuted,
    letterSpacing: letterSpacing.label,
    marginBottom: spacing.md,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  stepNumber: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 13,
    color: colors.gold,
    width: 28,
  },
  stepText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.parchment,
    lineHeight: 24,
    flex: 1,
  },
  cheers: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.gold,
    textAlign: "center",
    marginTop: spacing.xxl,
    letterSpacing: letterSpacing.heading,
  },
  doneButton: {
    borderWidth: 1,
    borderColor: colors.goldDim,
    borderRadius: borders.radius.md,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "transparent",
    marginTop: spacing.xl,
  },
  doneButtonText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.parchmentMuted,
    letterSpacing: letterSpacing.button,
  },
});
