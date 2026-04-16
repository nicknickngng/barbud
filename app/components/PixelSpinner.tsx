import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors } from "../lib/theme";

const BLOCK_COUNT = 8;
const RADIUS = 28;
const BLOCK_SIZE = 8;

// Positions for 8 blocks arranged in a circle (clock positions)
const positions = Array.from({ length: BLOCK_COUNT }, (_, i) => {
  const angle = (i / BLOCK_COUNT) * 2 * Math.PI - Math.PI / 2;
  return {
    x: Math.round(Math.cos(angle) * RADIUS),
    y: Math.round(Math.sin(angle) * RADIUS),
  };
});

export default function PixelSpinner() {
  const anims = useRef(
    Array.from({ length: BLOCK_COUNT }, () => new Animated.Value(0.15))
  ).current;

  useEffect(() => {
    const duration = 100;
    const interval = 80;

    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * interval),
          Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.15,
            duration: duration * 3,
            useNativeDriver: true,
          }),
          Animated.delay((BLOCK_COUNT - i) * interval),
        ])
      )
    );

    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.container}>
      {positions.map((pos, i) => (
        <Animated.View
          key={i}
          style={[
            styles.block,
            {
              transform: [{ translateX: pos.x }, { translateY: pos.y }],
              opacity: anims[i],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: RADIUS * 2 + BLOCK_SIZE,
    height: RADIUS * 2 + BLOCK_SIZE,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  block: {
    position: "absolute",
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    backgroundColor: colors.gold,
    borderRadius: 0,
  },
});
