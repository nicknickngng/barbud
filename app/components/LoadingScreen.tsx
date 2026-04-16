import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import {
  colors,
  fonts,
  letterSpacing,
  spacing,
} from "../lib/theme";

interface Props {
  apiReady: boolean;
  onBothReady: () => void;
}

const MESSAGES = [
  "Scanning your ingredients...",
  "Thinking of what you could make...",
  "Finding the perfect match...",
  "I've got something just for you.",
];

export default function LoadingScreen({ apiReady, onBothReady }: Props) {
  const [displayText, setDisplayText] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const glassOpacity = useRef(new Animated.Value(0)).current;
  const animationDone = useRef(false);

  // Typewriter state refs for cleanup
  const typewriterInterval = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const typewriterTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charIndexRef = useRef(0);
  const currentTargetRef = useRef("");

  const clearTypewriter = () => {
    if (typewriterInterval.current) {
      clearInterval(typewriterInterval.current);
      typewriterInterval.current = null;
    }
    if (typewriterTimeout.current) {
      clearTimeout(typewriterTimeout.current);
      typewriterTimeout.current = null;
    }
  };

  const startTypewriter = (target: string, messageIndex: number) => {
    clearTypewriter();
    setDisplayText("");
    setCurrentMessageIndex(messageIndex);
    charIndexRef.current = 0;
    currentTargetRef.current = target;

    typewriterInterval.current = setInterval(() => {
      charIndexRef.current += 1;
      const next = currentTargetRef.current.slice(0, charIndexRef.current);
      setDisplayText(next);

      if (charIndexRef.current >= currentTargetRef.current.length) {
        clearInterval(typewriterInterval.current!);
        typewriterInterval.current = null;
      }
    }, 45);
  };

  // Watch apiReady — when it flips true, fire if animation is already done
  useEffect(() => {
    if (apiReady && animationDone.current) {
      onBothReady();
    }
  }, [apiReady]);

  useEffect(() => {
    // Start pulsing animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    const timers: ReturnType<typeof setTimeout>[] = [];

    // 0ms: string 1
    timers.push(
      setTimeout(() => {
        startTypewriter(MESSAGES[0], 0);
      }, 0)
    );

    // ~700ms: string 2
    timers.push(
      setTimeout(() => {
        startTypewriter(MESSAGES[1], 1);
      }, 700)
    );

    // ~1400ms: string 3
    timers.push(
      setTimeout(() => {
        startTypewriter(MESSAGES[2], 2);
      }, 1400)
    );

    // ~2100ms: string 4 + fade in glass emoji
    timers.push(
      setTimeout(() => {
        startTypewriter(MESSAGES[3], 3);
        Animated.timing(glassOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 2100)
    );

    // 2800ms: animation done
    timers.push(
      setTimeout(() => {
        animationDone.current = true;
        pulseLoop.stop();
        if (apiReady) {
          onBothReady();
        }
      }, 2800)
    );

    return () => {
      timers.forEach(clearTimeout);
      clearTypewriter();
      pulseLoop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: glassOpacity }}>
        <Text style={styles.glassEmoji}>🍸</Text>
      </Animated.View>

      <Animated.View style={{ opacity: pulseAnim }}>
        <Text style={styles.title}>the nightcap project</Text>
      </Animated.View>

      <Text style={styles.typewriterText}>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.obsidian,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.containerPadding,
  },
  glassEmoji: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.gold,
    letterSpacing: letterSpacing.heading,
    textAlign: "center",
  },
  typewriterText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.parchmentMuted,
    textAlign: "center",
    letterSpacing: letterSpacing.gallery,
    marginTop: spacing.xl,
    minHeight: 50,
  },
});
