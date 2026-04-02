import { StyleSheet, Text, View } from "react-native";
import {
  colors,
  fonts,
  letterSpacing,
  spacing,
  borders,
  shadows,
} from "../lib/theme";
import { Cocktail } from "../lib/api";

interface Props {
  cocktails: Cocktail[];
  stale?: boolean;
}

export default function CocktailList({ cocktails, stale }: Props) {
  if (cocktails.length === 0) return null;

  return (
    <View style={[styles.container, stale && styles.stale]}>
      {cocktails.map((cocktail, idx) => (
        <View
          key={idx}
          style={[styles.card, idx > 0 && styles.cardSpaced]}
        >
          <Text style={styles.cocktailName}>{cocktail.name}</Text>
          {cocktail.recipe.map((line, i) => (
            <Text key={i} style={styles.recipeLine}>
              •{"  "}{line}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  stale: {
    opacity: 0.45,
  },
  card: {
    backgroundColor: colors.charcoal,
    borderRadius: borders.radius.lg,
    borderWidth: borders.hairline,
    borderColor: colors.goldDim,
    padding: spacing.lg,
    ...shadows.soft,
  },
  cardSpaced: {
    marginTop: spacing.md,
  },
  cocktailName: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.gold,
    letterSpacing: letterSpacing.heading,
    marginBottom: spacing.sm,
  },
  recipeLine: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.parchment,
    lineHeight: 22,
    paddingLeft: spacing.sm,
  },
});
