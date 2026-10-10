import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

type PrescriptionDetailsCardProps = {
  doctorName: string;
  onDoctorNameChange: (value: string) => void;
  date: string;
  status: string;
};

export function PrescriptionDetailsCard({
  doctorName,
  onDoctorNameChange,
  date,
  status,
}: PrescriptionDetailsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="document-text-outline" size={sizes.iconSize.lg} color={colors.primary} />
        </View>
        <Text style={styles.title}>Prescription Details</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Doctor Name</Text>
        <TextInput
          value={doctorName}
          onChangeText={onDoctorNameChange}
          placeholder="Not found"
          placeholderTextColor={colors.textMuted}
          style={styles.doctorInput}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{date}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: sizes.spacing.md,
    padding: sizes.spacing.md,
    borderRadius: sizes.radius.lg,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: sizes.spacing.sm,
  },
  iconBox: {
    width: sizes.iconBoxSize,
    height: sizes.iconBoxSize,
    borderRadius: sizes.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lavenderBackground,
  },
  title: {
    fontSize: sizes.fontSize.lg,
    fontFamily: "InterBold",
    color: colors.textPrimary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: sizes.spacing.md,
  },
  label: {
    fontSize: sizes.fontSize.sm,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textSecondary,
  },
  value: {
    fontSize: sizes.fontSize.sm,
    fontFamily: "InterMedium",
    color: colors.textPrimary,
  },
  doctorInput: {
    flex: 1,
    paddingVertical: 0,
    textAlign: "right",
    fontSize: sizes.fontSize.sm,
    fontFamily: "InterMedium",
    color: colors.textPrimary,
  },
  pill: {
    paddingHorizontal: sizes.spacing.sm,
    paddingVertical: sizes.spacing.xxs,
    borderRadius: sizes.radius.pill,
    backgroundColor: colors.peachBackground,
  },
  pillText: {
    fontSize: sizes.fontSize.xs,
    fontFamily: "InterSemiBold",
    color: colors.warning,
  },
});
