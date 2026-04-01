import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  colors,
  fonts,
  letterSpacing,
  spacing,
  borders,
  shadows,
} from "../lib/theme";
import { verifyPassword } from "../lib/api";

interface Props {
  onUnlock: () => void;
}

export default function PasswordGate({ onUnlock }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const success = await verifyPassword(password.trim());
      if (success) {
        onUnlock();
      } else {
        setError("Wrong password");
      }
    } catch {
      setError("Could not verify password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>barbud</Text>
      <Text style={styles.subtitle}>ENTER PASSWORD</Text>

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor={colors.parchmentMuted}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={handleSubmit}
      />

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.obsidian} />
        ) : (
          <Text style={styles.buttonText}>ENTER</Text>
        )}
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.obsidian,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.containerPadding,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 42,
    color: colors.gold,
    textAlign: "center",
    letterSpacing: letterSpacing.heading,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.parchmentMuted,
    textAlign: "center",
    letterSpacing: letterSpacing.subtitle,
    marginBottom: spacing.xl,
  },
  input: {
    width: "100%",
    maxWidth: 320,
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
    marginBottom: spacing.lg,
  },
  button: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.gold,
    borderRadius: borders.radius.md,
    paddingVertical: 16,
    alignItems: "center",
    ...shadows.warm,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontFamily: fonts.heading,
    color: colors.obsidian,
    fontSize: 15,
    letterSpacing: letterSpacing.button,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.error,
    marginTop: spacing.lg,
  },
});
