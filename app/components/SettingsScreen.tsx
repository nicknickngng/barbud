import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  borders,
  colors,
  fonts,
  letterSpacing,
  spacing,
} from "../lib/theme";

interface Props {
  userEmail: string;
  onSignOut: () => void;
  onStartOver: () => void;
  onClose: () => void;
}

export default function SettingsScreen({
  userEmail,
  onSignOut,
  onStartOver,
  onClose,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={12}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.header}>the nightcap project</Text>

      {/* User email */}
      <Text style={styles.email}>{userEmail}</Text>

      {/* Settings rows */}
      <Pressable style={styles.row} onPress={() => {}}>
        <Text style={styles.rowText}>Submit Feedback</Text>
        <Text style={styles.rowArrow}>›</Text>
      </Pressable>

      <Pressable style={styles.row} onPress={() => {}}>
        <Text style={styles.rowText}>Change User Name</Text>
        <Text style={styles.rowArrow}>›</Text>
      </Pressable>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Start over */}
      <Pressable style={styles.startOverRow} onPress={onStartOver}>
        <View>
          <Text style={styles.startOverText}>Start over?</Text>
          <Text style={styles.startOverSubtext}>Return to profile selection</Text>
        </View>
      </Pressable>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOut} onPress={onSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.obsidian,
    padding: spacing.containerPadding,
    paddingTop: spacing.containerTop,
  },
  closeButton: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.containerPadding,
  },
  closeText: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.parchmentMuted,
  },
  header: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.gold,
    letterSpacing: letterSpacing.heading,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.parchmentMuted,
    textAlign: "center",
    marginBottom: spacing.xxl,
    letterSpacing: letterSpacing.gallery,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: borders.hairline,
    borderBottomColor: colors.goldFaint,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.parchment,
    letterSpacing: letterSpacing.gallery,
  },
  rowArrow: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.parchmentMuted,
  },
  divider: {
    marginVertical: spacing.xl,
    height: borders.hairline,
    backgroundColor: colors.goldFaint,
  },
  startOverRow: {
    paddingVertical: spacing.md,
  },
  startOverText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.parchmentMuted,
    letterSpacing: letterSpacing.gallery,
  },
  startOverSubtext: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.parchmentFaint,
    marginTop: spacing.xs,
  },
  signOut: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
  signOutText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    letterSpacing: letterSpacing.gallery,
  },
});
