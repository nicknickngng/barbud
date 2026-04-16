import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
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
  const mascotRotation = useRef(new Animated.Value(0)).current;
  const mascotOpacity = useRef(new Animated.Value(1)).current;

  // Single interval ref for the typewriter, single timeout ref for pauses/delays
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swayLoopRef = useRef<Animated.CompositeAnimation | null>(null);

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
      // Stop the sway and return to upright
      if (swayLoopRef.current) {
        swayLoopRef.current.stop();
        swayLoopRef.current = null;
      }
      Animated.timing(mascotRotation, {
        toValue: 0,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();

      // After settle (400ms) + extra 2000ms, call onBothReady
      loopRef.current = setTimeout(() => {
        loopRef.current = null;
        onBothReadyRef.current();
      }, 2400);
    });
  }, [startMessage, mascotRotation]);

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

  // Mount effect: start pulse + sway + begin cycling
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

    // Gentle sway: 0 -> 30deg -> -30deg -> 0 -> repeat
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(mascotRotation, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(mascotRotation, {
          toValue: -1,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(mascotRotation, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    swayLoopRef.current = swayLoop;
    swayLoop.start();

    // Kick off the cycling sequence
    cycleMessagesRef.current(0);

    return () => {
      pulseLoop.stop();
      if (swayLoopRef.current) {
        swayLoopRef.current.stop();
      }
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotation = mascotRotation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-30deg", "0deg", "30deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate: rotation }], marginBottom: spacing.lg }}>
        <Image
          source={require("../assets/nightcap_mascot_logo.png")}
          style={styles.mascot}
          resizeMode="contain"
        />
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
  mascot: {
    width: 100,
    height: 100,
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
