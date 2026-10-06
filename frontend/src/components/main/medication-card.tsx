import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";
import type { MedicationItem, MedicationStatus } from "@/data/mock-medications";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Icon statuses show a right-side icon; badge statuses show a small label instead.
const statusConfig: Record<
  MedicationStatus,
  { color: string; icon?: IconName; badge?: string }
> = {
  taken: { color: colors.success, icon: "checkmark-circle" },
  pending: { color: colors.primary, icon: "time-outline" },
  missed: { color: colors.error, icon: "close-circle" },
  skipped: { color: colors.warning, icon: "remove-circle" },
  active: { color: colors.success, badge: "Active" },
  completed: { color: colors.textMuted, badge: "Completed" },
};

export type MedicationCardProps = Omit<MedicationItem, "id">;

export function MedicationCard({ name, dosage, detail, status }: MedicationCardProps) {
  const config = status ? statusConfig[status] : undefined;

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name="medical-outline" size={sizes.iconSize.md} color={colors.primary} />
      </View>

      <View style={styles.text}>
        <Text style={styles.name}>
          {name} <Text style={styles.dosage}>{dosage}</Text>
        </Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>

      {config?.icon ? (
        <Ionicons name={config.icon} size={sizes.statusIconSize} color={config.color} />
      ) : null}
      {config?.badge ? (
        <Text style={[styles.badge, { color: config.color }]}>{config.badge}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  name: {
    fontSize: sizes.fontSize.md,
    fontFamily: "InterSemiBold",
    color: colors.textPrimary,
  },
  dosage: {
    fontSize: sizes.fontSize.xs,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textSecondary,
  },
  detail: {
    fontSize: sizes.fontSize.xs,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textMuted,
  },
  badge: {
    fontSize: sizes.fontSize.xs,
    fontFamily: "JetBrainsMonoSemiBold",
  },
});
