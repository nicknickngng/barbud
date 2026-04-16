import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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
  shadows,
  spacing,
} from "../lib/theme";

interface Props {
  cocktails: Cocktail[];
  onMakeIt: (cocktail: Cocktail) => void;
  onAnother: () => void;
}

export default function CocktailResultScreen({
  cocktails,
  onMakeIt,
  onAnother,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const triggerFadeIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  // Fade in on mount
  useEffect(() => {
    triggerFadeIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fade in whenever currentIndex changes (except initial mount handled above)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    triggerFadeIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const cocktail = cocktails[currentIndex];

  if (!cocktail) return null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Animated.View style={[styles.cardWrapper, { opacity: fadeAnim }]}>
        <Text style={styles.emoji}>🍸</Text>
        <Text style={styles.cocktailName}>{cocktail.name}</Text>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>RECIPE</Text>
          {cocktail.recipe.map((line, i) => (
            <Text key={i} style={styles.recipeLine}>
              {line}
            </Text>
          ))}
        </View>
      </Animated.View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => onMakeIt(cocktail)}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            Looks good — let&apos;s make it!
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={onAnother}
          activeOpacity={0.7}
        >
          <Text style={styles.outlineButtonText}>Got anything else?</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: "center",
  },
  cardWrapper: {
    width: "100%",
    alignItems: "center",
  },
  emoji: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  cocktailName: {
    fontFamily: fonts.heading,
    fontSize: 40,
    color: colors.gold,
    textAlign: "center",
    letterSpacing: letterSpacing.heading,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.charcoal,
    borderRadius: borders.radius.lg,
    borderWidth: borders.hairline,
    borderColor: colors.goldDim,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 400,
    ...shadows.soft,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.parchmentMuted,
    letterSpacing: letterSpacing.label,
    marginBottom: spacing.md,
  },
  recipeLine: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.parchment,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  buttons: {
    width: "100%",
    maxWidth: 400,
    marginTop: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.gold,
    borderRadius: borders.radius.md,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.obsidian,
    letterSpacing: letterSpacing.button,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: borders.radius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.md,
    backgroundColor: "transparent",
  },
  outlineButtonText: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.gold,
    letterSpacing: letterSpacing.button,
  },
});
