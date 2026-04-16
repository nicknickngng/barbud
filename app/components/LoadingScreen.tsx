import React, { useCallback, useEffect, useRef, useState } from "react";
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

  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const glassOpacity = useRef(new Animated.Value(0)).current;

  // Single interval ref for the typewriter, single timeout ref for pauses/delays
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync apiReady prop into a ref so the cycling callbacks can read it without
  // needing to be re-created on every render
  const apiReadyRef = useRef(false);
  useEffect(() => {
    apiReadyRef.current = apiReady;
  }, [apiReady]);

  // Ref to the onBothReady callback so it's always fresh inside closures
  const onBothReadyRef = useRef(onBothReady);
  useEffect(() => {
    onBothReadyRef.current = onBothReady;
  }, [onBothReady]);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (loopRef.current) {
      clearTimeout(loopRef.current);
      loopRef.current = null;
    }
  }, []);

  // startMessage: types out messages[index] char-by-char at 45ms/char,
  // then waits 1000ms, then calls onComplete.
  const startMessage = useCallback(
    (index: number, onComplete: () => void) => {
      clearTimers();
      setDisplayText("");

      const target = MESSAGES[index];
      let charIndex = 0;

      intervalRef.current = setInterval(() => {
        charIndex += 1;
        setDisplayText(target.slice(0, charIndex));

        if (charIndex >= target.length) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;

          // Pause 1000ms then call onComplete
          loopRef.current = setTimeout(() => {
            loopRef.current = null;
            onComplete();
          }, 1000);
        }
      }, 45);
    },
    [clearTimers]
  );

  // Forward-declare via ref so cycleMessages and startFinalMessage can
  // reference each other without stale-closure issues.
  const startFinalMessageRef = useRef<() => void>(() => {});
  const cycleMessagesRef = useRef<(index: number) => void>(() => {});

  const startFinalMessage = useCallback(() => {
    startMessage(3, () => {
      // Fade in the glass emoji
      Animated.timing(glassOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

      // After fade (600ms) + extra 2000ms, call onBothReady
      loopRef.current = setTimeout(() => {
        loopRef.current = null;
        onBothReadyRef.current();
      }, 2600);
    });
  }, [startMessage, glassOpacity]);

  const cycleMessages = useCallback(
    (index: number) => {
      startMessage(index % 3, () => {
        if (apiReadyRef.current) {
          startFinalMessageRef.current();
        } else {
          cycleMessagesRef.current(index + 1);
        }
      });
    },
    [startMessage]
  );

  // Keep the refs in sync with the latest callback instances
  useEffect(() => {
    startFinalMessageRef.current = startFinalMessage;
  }, [startFinalMessage]);

  useEffect(() => {
    cycleMessagesRef.current = cycleMessages;
  }, [cycleMessages]);

  // Mount effect: start pulse + begin cycling
  useEffect(() => {
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

    // Kick off the cycling sequence
    cycleMessagesRef.current(0);

    return () => {
      pulseLoop.stop();
      clearTimers();
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
