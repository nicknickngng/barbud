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
  Image,
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

type AuthView = "splash" | "login" | "signup";

export default function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [authView, setAuthView] = useState<AuthView>("splash");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [interactable, setInteractable] = useState(false);

  // Splash animation values
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(20)).current;
  const creditOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Step 1: title fades in over 800ms
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      // Step 2: after 500ms delay, title slides up + buttons fade in simultaneously
      Animated.sequence([
        Animated.delay(500),
        Animated.parallel([
          Animated.timing(titleTranslateY, {
            toValue: -30,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(buttonsOpacity, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(buttonsTranslateY, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]).start(({ finished }) => {
        if (finished) {
          setInteractable(true);
          // Step 3: credit fades in after buttons animation completes
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

    const fn = authView === "login" ? signInWithEmail : signUpWithEmail;
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

  const goToLogin = () => {
    setError(null);
    setEmail("");
    setPassword("");
    setAuthView("login");
  };

  const goToSignup = () => {
    setError(null);
    setEmail("");
    setPassword("");
    setAuthView("signup");
  };

  const goToSplash = () => {
    setError(null);
    setEmail("");
    setPassword("");
    setAuthView("splash");
  };

  // ─── Splash ───────────────────────────────────────────────
  if (authView === "splash") {
    return (
      <View style={styles.container}>
        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleTranslateY }], alignItems: "center" }}>
          <Image
            source={require("../assets/nightcap_mascot_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>
            the nightcap project
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonStack,
            {
              opacity: buttonsOpacity,
              transform: [{ translateY: buttonsTranslateY }],
            },
          ]}
          pointerEvents={interactable ? "auto" : "none"}
        >
          {/* Log In — filled */}
          <Pressable
            style={styles.filledButton}
            onPress={goToLogin}
            disabled={!interactable}
          >
            <Text style={styles.filledButtonText}>Log In</Text>
          </Pressable>

          {/* Sign Up — outline */}
          <Pressable
            style={[styles.outlineButton, { marginTop: spacing.md }]}
            onPress={goToSignup}
            disabled={!interactable}
          >
            <Text style={styles.outlineButtonText}>Sign Up</Text>
          </Pressable>

          {/* Continue with Google — text only */}
          <Pressable
            style={styles.textButton}
            onPress={handleGoogle}
            disabled={!interactable}
          >
            <Text style={styles.textButtonText}>Continue with Google</Text>
          </Pressable>
        </Animated.View>

        <Animated.Text style={[styles.credit, { opacity: creditOpacity }]}>
          a project from nicolas ng
        </Animated.Text>
      </View>
    );
  }

  // ─── Login / Signup ───────────────────────────────────────
  const isLogin = authView === "login";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>the nightcap project</Text>

      <View style={styles.form}>
        <Text style={styles.subtitle}>
          {isLogin ? "SIGN IN TO CONTINUE" : "CREATE AN ACCOUNT"}
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
          style={[styles.filledButton, loading && styles.buttonDisabled]}
          onPress={handleEmailAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.obsidian} />
          ) : (
            <Text style={styles.filledButtonText}>
              {isLogin ? "Sign In" : "Sign Up"}
            </Text>
          )}
        </Pressable>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable onPress={goToSplash} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back</Text>
        </Pressable>
      </View>
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
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 42,
    color: colors.gold,
    textAlign: "center",
    letterSpacing: letterSpacing.heading,
    marginBottom: spacing.xl,
  },

  // ─── Splash button stack ──────────────────────────────────
  buttonStack: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },

  // ─── Shared button base ───────────────────────────────────
  filledButton: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.gold,
    borderRadius: borders.radius.md,
    paddingVertical: 16,
    alignItems: "center",
    ...shadows.warm,
  },
  filledButtonText: {
    fontFamily: fonts.heading,
    color: colors.obsidian,
    fontSize: 15,
    letterSpacing: letterSpacing.button,
  },
  outlineButton: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "transparent",
    borderRadius: borders.radius.md,
    borderWidth: 1,
    borderColor: colors.gold,
    paddingVertical: 16,
    alignItems: "center",
  },
  outlineButtonText: {
    fontFamily: fonts.heading,
    color: colors.gold,
    fontSize: 15,
    letterSpacing: letterSpacing.button,
  },
  textButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  textButtonText: {
    fontFamily: fonts.body,
    color: colors.parchmentMuted,
    fontSize: 13,
    letterSpacing: letterSpacing.button,
  },
  buttonInvisible: {
    opacity: 0,
  },
  buttonDisabled: {
    opacity: 0.4,
  },

  // ─── Login / Signup form ──────────────────────────────────
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
  error: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.error,
    marginTop: spacing.md,
    textAlign: "center",
    maxWidth: 320,
  },
  backLink: {
    marginTop: spacing.lg,
  },
  backLinkText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.parchmentMuted,
  },

  // ─── Credit line ──────────────────────────────────────────
  credit: {
    position: "absolute",
    bottom: spacing.containerBottom,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.parchmentMuted,
    letterSpacing: letterSpacing.label,
  },
});
