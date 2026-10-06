import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

type InfoRowProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
};

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={sizes.iconSize.md} color={colors.primary} />
      </View>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: sizes.spacing.md,
    padding: sizes.spacing.md,
    borderRadius: sizes.radius.md,
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
    backgroundColor: colors.lavenderBackground,
  },
  text: {
    flex: 1,
    gap: sizes.spacing.xxs,
  },
  label: {
    fontSize: sizes.fontSize.xs,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textMuted,
  },
  value: {
    fontSize: sizes.fontSize.md,
    fontFamily: "InterSemiBold",
    color: colors.textPrimary,
  },
});
