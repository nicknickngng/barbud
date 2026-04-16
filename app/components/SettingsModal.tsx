import React from "react";
import {
  Modal,
  View,
  Pressable,
  Text,
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

interface Props {
  userEmail: string;
  onSignOut: () => void;
  onClose: () => void;
}

export default function SettingsModal({ userEmail, onSignOut, onClose }: Props) {
  return (
    <Modal transparent={true} animationType="fade" visible={true}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Card — stopPropagation via onStartShouldSetResponder */}
        <View
          style={styles.card}
          onStartShouldSetResponder={() => true}
        >
          {/* Header row */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Settings</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeButton}>×</Text>
            </Pressable>
          </View>

          {/* User email */}
          <Text style={styles.email}>{userEmail}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Submit Feedback row */}
          <Pressable style={styles.row} onPress={() => {}}>
            <Text style={styles.rowText}>Submit Feedback</Text>
            <Text style={styles.rowArrow}>›</Text>
          </Pressable>

          {/* Log Out row */}
          <Pressable style={styles.row} onPress={onSignOut}>
            <Text style={[styles.rowText, { color: colors.error }]}>Log Out</Text>
            <Text style={styles.rowArrow}>›</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.charcoal,
    borderRadius: borders.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.goldDim,
    padding: spacing.lg,
    maxWidth: 320,
    width: "90%",
    ...shadows.warm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 18,
    color: colors.parchment,
    letterSpacing: letterSpacing.heading,
  },
  closeButton: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.parchmentMuted,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.parchmentFaint,
    letterSpacing: letterSpacing.gallery,
    marginBottom: spacing.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.goldFaint,
    marginBottom: spacing.md,
  },
  row: {
    paddingVertical: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.goldFaint,
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
});
