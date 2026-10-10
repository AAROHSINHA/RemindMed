import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

const STEPS = ["Reading text", "Identifying medicines", "Extracting dosage & schedule"];
const STEP_INTERVAL_MS = 2500;
const PROGRESS_DURATION_MS = 40000;

// Progress bar + checklist. Purely visual: it eases toward 90% and ticks steps on a timer
// until the screen navigates away when the upload finishes.
export function ProcessingSteps() {
  const progress = useRef(new Animated.Value(0)).current;
  const [done, setDone] = useState(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 0.9,
      duration: PROGRESS_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const timer = setInterval(() => {
      setDone((count) => Math.min(count + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [progress]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]} />
      </View>

      <View style={styles.steps}>
        {STEPS.map((label, index) => {
          const complete = index < done;
          return (
            <View key={label} style={styles.step}>
              <Ionicons
                name={complete ? "checkmark" : "ellipse-outline"}
                size={sizes.iconSize.md}
                color={complete ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.stepText, complete && styles.stepTextDone]}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    gap: sizes.spacing.lg,
  },
  track: {
    height: sizes.progressHeight,
    borderRadius: sizes.radius.pill,
    overflow: "hidden",
    backgroundColor: colors.lavenderBackground,
  },
  fill: {
    height: "100%",
    borderRadius: sizes.radius.pill,
    backgroundColor: colors.primary,
  },
  steps: {
    gap: sizes.spacing.sm,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: sizes.spacing.sm,
  },
  stepText: {
    fontSize: sizes.fontSize.sm,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textMuted,
  },
  stepTextDone: {
    color: colors.textSecondary,
  },
});
