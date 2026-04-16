import React from "react";
import { View, Pressable, Text, StyleSheet, Platform } from "react-native";
import {
  colors,
  fonts,
  letterSpacing,
  spacing,
} from "../lib/theme";

interface Props {
  onBack: () => void;
  onStartOver: () => void;
  onSettings: () => void;
  backDisabled?: boolean;
}

export default function BottomNav({
  onBack,
  onStartOver,
  onSettings,
  backDisabled = false,
}: Props) {
  const backColor = backDisabled ? colors.parchmentFaint : colors.parchmentMuted;

  return (
    <View style={styles.container}>
      {/* BACK */}
      <Pressable
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}
        onPress={onBack}
      >
        <Text style={[styles.icon, { color: backColor }]}>←</Text>
        <Text style={[styles.label, { color: backColor }]}>BACK</Text>
      </Pressable>

      {/* START OVER */}
      <Pressable
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}
        onPress={onStartOver}
      >
        <Text style={[styles.icon, { color: colors.parchmentMuted }]}>↺</Text>
        <Text style={[styles.label, { color: colors.parchmentMuted }]}>
          START OVER
        </Text>
      </Pressable>

      {/* SETTINGS */}
      <Pressable
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}
        onPress={onSettings}
      >
        <Text style={[styles.icon, { color: colors.parchmentMuted }]}>⚙</Text>
        <Text style={[styles.label, { color: colors.parchmentMuted }]}>
          SETTINGS
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.charcoal,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.goldDim,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: Platform.OS === "web" ? 16 : spacing.md,
  },
  button: {
    alignItems: "center",
    flex: 1,
  },
  icon: {
    fontFamily: fonts.body,
    fontSize: 16,
    marginBottom: 2,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: letterSpacing.label,
  },
});
