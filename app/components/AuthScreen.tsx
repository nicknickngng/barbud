import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Animated,
  Easing,
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
  const [interactable, setInteractable] = useState(false);

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(-24)).current;
  const creditOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Step 1: title fades in
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      // Step 2: after 0.5s, title slides up while form fades + slides in
      Animated.sequence([
        Animated.delay(500),
        Animated.parallel([
          Animated.timing(titleTranslateY, {
            toValue: -12,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(formOpacity, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(formTranslateY, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]).start(({ finished }) => {
        if (finished) {
          setInteractable(true);
          // Step 3: credit fades in at the bottom
          Animated.timing(creditOpacity, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start();
        }
      });
    });
  }, []);

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
      <Animated.Text
        style={[
          styles.title,
          { opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] },
        ]}
      >
        the nightcap project
      </Animated.Text>

      <Animated.View
        style={[
          styles.form,
          { opacity: formOpacity, transform: [{ translateY: formTranslateY }] },
        ]}
        pointerEvents={interactable ? "auto" : "none"}
      >
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
          editable={interactable}
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
          editable={interactable}
        />

        <Pressable
          style={[styles.button, (loading || !interactable) && styles.buttonDisabled]}
          onPress={handleEmailAuth}
          disabled={loading || !interactable}
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

        <Pressable
          style={styles.googleButton}
          onPress={handleGoogle}
          disabled={!interactable}
        >
          <Text style={styles.googleButtonText}>CONTINUE WITH GOOGLE</Text>
        </Pressable>

        <Pressable
          onPress={toggleMode}
          style={styles.toggleWrap}
          disabled={!interactable}
        >
          <Text style={styles.toggleText}>
            {mode === "signin"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Text>
        </Pressable>

        {error && <Text style={styles.error}>{error}</Text>}
      </Animated.View>

      <Animated.Text style={[styles.credit, { opacity: creditOpacity }]}>
        a project from nicolas ng
      </Animated.Text>
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
  form: {
    width: "100%",
    alignItems: "center",
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
  credit: {
    position: "absolute",
    bottom: spacing.containerBottom,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.parchmentFaint,
    letterSpacing: letterSpacing.label,
  },
});
