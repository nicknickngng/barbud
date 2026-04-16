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
import { useAuth } from "../lib/auth";

interface Props {
  onComplete: () => void;
}

export default function NameEntryScreen({ onComplete }: Props) {
  const { updateDisplayName } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    const err = await updateDisplayName(trimmed);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What should I call you?</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={(text) => setName(text.slice(0, 100))}
        placeholder="Your name"
        placeholderTextColor={colors.parchmentMuted}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={100}
        onSubmitEditing={handleSubmit}
      />

      <Pressable
        style={[styles.button, (!name.trim() || loading) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!name.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.obsidian} />
        ) : (
          <Text style={styles.buttonText}>Next</Text>
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
    fontSize: 36,
    color: colors.gold,
    textAlign: "center",
    letterSpacing: letterSpacing.heading,
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
    marginTop: spacing.md,
    textAlign: "center",
    maxWidth: 320,
  },
});
