import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Cocktail, CocktailIngredient } from "../lib/api";
import {
  borders,
  colors,
  fonts,
  letterSpacing,
  spacing,
} from "../lib/theme";

interface Props {
  cocktail: Cocktail;
}

function formatQuantity(quantity: string): string {
  // If quantity contains "oz", parse and also show ml
  const ozMatch = quantity.match(/^([\d.\/\s]+)\s*oz/i);
  if (ozMatch) {
    const ozStr = ozMatch[1].trim();
    // Handle fractions like "1/2"
    let ozVal: number;
    if (ozStr.includes('/')) {
      const [num, den] = ozStr.split('/');
      ozVal = parseFloat(num) / parseFloat(den);
    } else {
      ozVal = parseFloat(ozStr);
    }
    const ml = Math.round(ozVal * 30 / 5) * 5; // round to nearest 5ml
    return `${quantity} / ${ml} ml`;
  }
  return quantity;
}

export default function RecipeScreen({ cocktail }: Props) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.obsidian }}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.cocktailName}>{cocktail.name}</Text>

      {cocktail.description ? (
        <Text style={styles.description}>{cocktail.description}</Text>
      ) : null}

      {/* Tile 1 — INGREDIENTS */}
      <View style={styles.tile}>
        <Text style={styles.tileLabel}>INGREDIENTS</Text>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tileLabel, { flex: 2 }]}>INGREDIENT</Text>
          <Text style={[styles.tileLabel, { flex: 1, textAlign: "right" }]}>AMOUNT</Text>
        </View>

        {cocktail.ingredients.map((ingredient: CocktailIngredient, i: number) => (
          <View
            key={i}
            style={[
              styles.ingredientRow,
              { backgroundColor: i % 2 === 0 ? colors.charcoal : colors.charcoalLight },
            ]}
          >
            <Text style={[styles.ingredientName, { flex: 2 }]}>{ingredient.name}</Text>
            <Text style={[styles.ingredientQty, { flex: 1 }]}>{formatQuantity(ingredient.quantity)}</Text>
          </View>
        ))}
      </View>

      {/* Tile 2 — WHAT YOU'LL NEED */}
      <View style={styles.tile}>
        <Text style={styles.tileLabel}>WHAT YOU&apos;LL NEED</Text>

        {cocktail.gear.map((item: string, i: number) => (
          <View key={i} style={styles.gearRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.gearText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Tile 3 — HOW TO MAKE IT */}
      <View style={styles.tile}>
        <Text style={styles.tileLabel}>HOW TO MAKE IT</Text>

        {cocktail.steps.map((step: string, i: number) => (
          <View key={i} style={styles.stepRow}>
            <Text style={styles.stepNumber}>{i + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.cheers}>Cheers! 🥂</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.containerPadding,
    paddingTop: spacing.containerTop,
    paddingBottom: 100,
  },
  cocktailName: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.gold,
    letterSpacing: letterSpacing.heading,
    textAlign: "center",
    marginBottom: spacing.xl,
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.parchmentMuted,
    textAlign: "center",
    marginBottom: spacing.xl,
    maxWidth: 480,
    alignSelf: "center",
  },
  tile: {
    backgroundColor: colors.charcoal,
    borderRadius: borders.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.goldDim,
    padding: spacing.lg,
    marginBottom: spacing.section,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  tileLabel: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 11,
    color: colors.parchmentMuted,
    letterSpacing: letterSpacing.label,
    marginBottom: spacing.md,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.goldDim,
    marginBottom: spacing.sm,
  },
  ingredientRow: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borders.radius.sm,
  },
  ingredientName: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.parchment,
    lineHeight: 20,
  },
  ingredientQty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.parchmentMuted,
    lineHeight: 20,
    textAlign: "right",
  },
  gearRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  bullet: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.gold,
    marginRight: spacing.sm,
    lineHeight: 24,
  },
  gearText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.parchment,
    lineHeight: 24,
    flex: 1,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  stepNumber: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 13,
    color: colors.gold,
    width: 24,
    lineHeight: 24,
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
    marginBottom: spacing.xl,
    letterSpacing: letterSpacing.heading,
  },
});
