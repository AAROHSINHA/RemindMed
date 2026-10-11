import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";
import type { TodayMedicine } from "@/api/user/medicine";

function formatTime(time: string | null): string {
  if (!time) return "--:--";

  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return time;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return `${formattedHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function MedicationCard(medicine: TodayMedicine) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons
          name="medical-outline"
          size={sizes.iconSize.md}
          color={colors.primary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={2}>
            {medicine.medicine_name ?? "Unnamed medicine"}
          </Text>

          {medicine.strength ? (
            <>
              <View style={styles.separator} />
              <Text style={styles.strength} numberOfLines={1}>
                {medicine.strength}
              </Text>
            </>
          ) : null}
        </View>

        <View style={styles.timePill}>
          <Ionicons
            name="time-outline"
            size={sizes.iconSize.sm}
            color={colors.primary}
          />
          <Text style={styles.timeText}>
            {formatTime(medicine.scheduled_time)}
          </Text>
        </View>
      </View>

      {/* <Ionicons
        name="chevron-forward"
        size={sizes.iconSize.sm}
        color={colors.textMuted}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: sizes.spacing.md,
    padding: sizes.spacing.md,
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
    backgroundColor: colors.lavenderBackground,
  },

  content: {
    flex: 1,
    gap: sizes.spacing.xxs,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: sizes.spacing.sm,
    rowGap: sizes.spacing.xxs,
  },

  name: {
    flexShrink: 1,
    fontSize: sizes.fontSize.md,
    fontFamily: "InterSemiBold",
    color: colors.textPrimary,
  },

  separator: {
    width: 1,
    height: sizes.fontSize.md,
    backgroundColor: colors.border,
  },

  strength: {
    fontSize: sizes.fontSize.xs,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textSecondary,
  },

  timePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: sizes.spacing.sm,
    paddingVertical: 2,
    borderRadius: sizes.radius.pill,
    backgroundColor: colors.lavenderBackground,
  },

  timeText: {
    fontSize: sizes.fontSize.xs,
    fontFamily: "InterSemiBold",
    color: colors.primary,
  },
});
