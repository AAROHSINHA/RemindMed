import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";
import { scanPrescription } from "@/utils/scan-prescription";

// Center "+" button of the tab bar: opens the camera instead of navigating.
export function ScanTabButton() {
  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={scanPrescription}
        accessibilityRole="button"
        accessibilityLabel="Scan prescription"
        style={({ pressed }) => [styles.button, pressed && { opacity: sizes.opacity.pressed }]}
      >
        <Ionicons name="add" size={sizes.iconSize.lg * 1.25} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: sizes.scanButtonSize,
    height: sizes.scanButtonSize,
    borderRadius: sizes.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: sizes.shadow.opacity * 3,
    shadowRadius: sizes.shadow.radius,
    elevation: sizes.shadow.elevation,
  },
});
