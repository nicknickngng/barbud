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

type Mode = "signin" | "signup";

export default function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);

    const fn = mode === "signin" ? signInWithEmail : signUpWithEmail;
    const err = await fn(email.trim(), password);

    if (err) {
      setError(err);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(null);
    const err = await signInWithGoogle();
    if (err) setError(err);
  };

  const toggleMode = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setError(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>barbud</Text>
      <Text style={styles.subtitle}>
        {mode === "signin" ? "SIGN IN TO CONTINUE" : "CREATE AN ACCOUNT"}
      </Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={colors.parchmentMuted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={colors.parchmentMuted}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={handleEmailAuth}
      />

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleEmailAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.obsidian} />
        ) : (
          <Text style={styles.buttonText}>
            {mode === "signin" ? "SIGN IN" : "SIGN UP"}
          </Text>
        )}
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable style={styles.googleButton} onPress={handleGoogle}>
        <Text style={styles.googleButtonText}>CONTINUE WITH GOOGLE</Text>
      </Pressable>

      <Pressable onPress={toggleMode} style={styles.toggleWrap}>
        <Text style={styles.toggleText}>
          {mode === "signin"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </Text>
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
    marginBottom: spacing.md,
  },
  button: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.gold,
    borderRadius: borders.radius.md,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: spacing.sm,
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: borders.hairline,
    backgroundColor: colors.goldDim,
  },
  dividerText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.parchmentMuted,
    letterSpacing: letterSpacing.label,
    marginHorizontal: spacing.md,
  },
  googleButton: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "transparent",
    borderRadius: borders.radius.md,
    borderWidth: 1,
    borderColor: colors.gold,
    paddingVertical: 16,
    alignItems: "center",
  },
  googleButtonText: {
    fontFamily: fonts.headingSemiBold,
    color: colors.gold,
    fontSize: 13,
    letterSpacing: letterSpacing.button,
  },
  toggleWrap: {
    marginTop: spacing.lg,
  },
  toggleText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.parchmentMuted,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.error,
    marginTop: spacing.lg,
    textAlign: "center",
  },
});
