import { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import {
  colors,
  fonts,
  letterSpacing,
  spacing,
  borders,
} from "../lib/theme";
import { Profile } from "../lib/profiles";

export interface Props {
  profiles: Profile[];
  userName: string;
  onSelectProfile: (id: string) => void;
  onNewProfile: () => void;
  onDeleteProfile: (id: string) => void;
}

export default function ProfileSelectionScreen({
  profiles,
  userName,
  onSelectProfile,
  onNewProfile,
  onDeleteProfile,
}: Props) {
  // Individual animated values for welcome text and subtitle
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  // Shared animated value for profile list (fade + slide up)
  const profilesOpacity = useRef(new Animated.Value(0)).current;
  const profilesTranslateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    // Step 1: "Welcome, [name]!" fades in over 700ms
    Animated.timing(welcomeOpacity, {
      toValue: 1,
      duration: 700,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      // Step 2: after 300ms delay, "Let's get started" fades in over 600ms
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Step 3: after another 300ms delay, profile items fade in + slide up
        Animated.sequence([
          Animated.delay(300),
          Animated.parallel([
            Animated.timing(profilesOpacity, {
              toValue: 1,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(profilesTranslateY, {
              toValue: 0,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    });
  }, []);

  const displayedProfiles = profiles.slice(0, 4);
  const canAddProfile = profiles.length < 4;

  const ingredientLabel = (count: number): string => {
    if (count === 0) return "empty";
    return count === 1 ? "1 ingredient" : `${count} ingredients`;
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome heading — individual animated value */}
      <Animated.Text style={[styles.welcome, { opacity: welcomeOpacity }]}>
        {`Welcome, ${userName}!`}
      </Animated.Text>

      {/* "Let's get started" subtitle — individual animated value */}
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        {"Let's get started"}
      </Animated.Text>

      {/* Profile list + new profile button — shared animated view */}
      <Animated.View
        style={[
          styles.profilesContainer,
          {
            opacity: profilesOpacity,
            transform: [{ translateY: profilesTranslateY }],
          },
        ]}
      >
        {displayedProfiles.map((profile) => (
          <View key={profile.id} style={styles.profileCardRow}>
            <Pressable
              style={styles.profileCard}
              onPress={() => onSelectProfile(profile.id)}
            >
              <Text style={styles.profileName} numberOfLines={1}>
                {profile.name}
              </Text>
              <Text style={styles.ingredientBadge}>
                {ingredientLabel(profile.ingredients.length)}
              </Text>
            </Pressable>
            <Pressable
              style={styles.deleteButton}
              onPress={() => onDeleteProfile(profile.id)}
              hitSlop={8}
            >
              <Text style={styles.deleteText}>×</Text>
            </Pressable>
          </View>
        ))}

        {canAddProfile && (
          <Pressable style={styles.newProfileCard} onPress={onNewProfile}>
            <Text style={styles.newProfileText}>+ New Profile</Text>
          </Pressable>
        )}

        <Text style={styles.subtext}>
          Each profile learns your taste preferences to recommend the perfect
          drink.
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.obsidian,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.containerTop,
    paddingBottom: spacing.containerBottom,
  },

  // ─── Welcome text ─────────────────────────────────────────
  welcome: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.gold,
    textAlign: "center",
    letterSpacing: letterSpacing.heading,
  },

  // ─── Subtitle ─────────────────────────────────────────────
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.parchmentMuted,
    letterSpacing: letterSpacing.subtitle,
    textAlign: "center",
    marginTop: spacing.sm,
  },

  // ─── Profile list container ───────────────────────────────
  profilesContainer: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    marginTop: spacing.xl,
  },

  // ─── Profile card row (card + delete button) ──────────────
  profileCardRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  // ─── Profile card ─────────────────────────────────────────
  profileCard: {
    flex: 1,
    backgroundColor: colors.charcoal,
    borderRadius: borders.radius.md,
    borderWidth: borders.hairline,
    borderColor: colors.goldDim,
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteButton: {
    paddingLeft: spacing.sm,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    fontFamily: fonts.body,
    fontSize: 22,
    color: colors.parchmentMuted,
    lineHeight: 26,
  },
  profileName: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
    color: colors.parchment,
    letterSpacing: letterSpacing.gallery,
    flex: 1,
    marginRight: spacing.sm,
  },
  ingredientBadge: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.parchmentMuted,
  },

  // ─── New profile card ─────────────────────────────────────
  newProfileCard: {
    width: "100%",
    backgroundColor: "transparent",
    borderRadius: borders.radius.md,
    borderWidth: borders.hairline,
    borderColor: colors.goldDim,
    borderStyle: "dashed",
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  newProfileText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.parchmentMuted,
    letterSpacing: letterSpacing.gallery,
  },

  // ─── Subtext ──────────────────────────────────────────────
  subtext: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.parchmentMuted,
    textAlign: "center",
    marginTop: spacing.lg,
    maxWidth: 280,
    lineHeight: 20,
  },
});
