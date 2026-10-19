import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

type StatBoxProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  value: string | number;
  label: string;
};

export function StatBox({ icon, value, label }: StatBoxProps) {
  return (
    <View style={styles.box}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={sizes.iconSize.md} color={colors.primary} />
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: "center",
    gap: sizes.spacing.xxs,
    padding: sizes.spacing.sm,
    borderRadius: sizes.radius.lg,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconBox: {
    width: sizes.iconBoxSize,
    height: sizes.iconBoxSize,
    borderRadius: sizes.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: sizes.spacing.xxs,
    backgroundColor: colors.lavenderBackground,
  },
  value: {
    fontSize: sizes.fontSize.lg,
    fontFamily: "InterBold",
    color: colors.textPrimary,
  },
  label: {
    fontSize: sizes.fontSize.xs - 2,
    lineHeight: (sizes.fontSize.xs - 2) * 1.5,
    textAlign: "center",
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textSecondary,
  },
});
