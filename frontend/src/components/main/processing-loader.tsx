import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

// Spinning ring around a teal badge: the visual centerpiece of the processing screen.
export function ProcessingLoader() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ring, { transform: [{ rotate }] }]} />
      <View style={styles.badge}>
        <Ionicons name="scan" size={sizes.avatarSize / 2} color={colors.white} />
      </View>
    </View>
  );
}

const badgeSize = sizes.ringSize * 0.55;

const styles = StyleSheet.create({
  container: {
    width: sizes.ringSize,
    height: sizes.ringSize,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    ...StyleSheet.absoluteFill,
    borderRadius: sizes.radius.pill,
    borderWidth: sizes.ringBorder,
    borderColor: colors.lavenderBackground,
    borderTopColor: colors.primary,
    borderRightColor: colors.primaryLight,
  },
  badge: {
    width: badgeSize,
    height: badgeSize,
    borderRadius: sizes.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.teal,
  },
});
