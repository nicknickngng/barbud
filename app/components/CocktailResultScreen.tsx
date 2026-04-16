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
}

export default function CocktailResultScreen({
  cocktails,
  onMakeIt,
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
        <Text style={styles.cocktailName}>{cocktail.name}</Text>

        <View style={styles.card}>
          {cocktail.description ? (
            <Text style={styles.descriptionText}>{cocktail.description}</Text>
          ) : null}
          <Text style={styles.sectionLabel}>INGREDIENTS</Text>
          {(cocktail.ingredients ?? []).map((ingredient, i) => (
            <Text key={i} style={styles.recipeLine}>
              {ingredient.quantity}{"  "}{ingredient.name}
            </Text>
          ))}
          {/* Fallback for legacy API format */}
          {!cocktail.ingredients && (cocktail.recipe ?? []).map((line, i) => (
            <Text key={i} style={styles.recipeLine}>{line}</Text>
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
          style={[styles.outlineButton, currentIndex >= cocktails.length - 1 && styles.outlineButtonExhausted]}
          onPress={() => {
            if (currentIndex < cocktails.length - 1) {
              setCurrentIndex(currentIndex + 1);
            }
          }}
          activeOpacity={currentIndex < cocktails.length - 1 ? 0.7 : 1}
          disabled={currentIndex >= cocktails.length - 1}
        >
          <Text style={styles.outlineButtonText}>
            {currentIndex < cocktails.length - 1 ? "Got anything else?" : "Sorry, all out of ideas!"}
          </Text>
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
    paddingBottom: 100,
    alignItems: "center",
  },
  cardWrapper: {
    width: "100%",
    alignItems: "center",
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
    maxWidth: 480,
    ...shadows.soft,
  },
  descriptionText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.parchmentMuted,
    lineHeight: 22,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  sectionLabel: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 11,
    color: colors.parchmentMuted,
    letterSpacing: letterSpacing.label,
    marginBottom: spacing.md,
  },
  recipeLine: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.parchment,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  buttons: {
    width: "100%",
    maxWidth: 480,
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
  outlineButtonExhausted: {
    borderColor: colors.parchmentMuted,
    opacity: 0.4,
  },
  outlineButtonText: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.gold,
    letterSpacing: letterSpacing.button,
  },
});
