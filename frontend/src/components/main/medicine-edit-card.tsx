import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import type { ScannedMedication } from "@/api/ocr";
import { ReminderTimes } from "@/components/main/reminder-times";
import { LabeledInput } from "@/components/sharedComponents/labeled-input";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

type MedicineEditCardProps = {
  medication: ScannedMedication;
  onChange: (medication: ScannedMedication) => void;
  missingTime?: boolean;
  onRemove?: () => void;
};

// One detected medicine. Every field is a text input, so tapping a value edits it.
export function MedicineEditCard({
  medication,
  onChange,
  missingTime,
  onRemove,
}: MedicineEditCardProps) {
  const update = (changes: Partial<ScannedMedication>) => onChange({ ...medication, ...changes });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="medical-outline" size={sizes.iconSize.md} color={colors.primary} />
        </View>

        <View style={styles.titleColumn}>
          <TextInput
            value={medication.medicine_name}
            onChangeText={(value) => update({ medicine_name: value })}
            placeholder="Medicine name"
            placeholderTextColor={colors.textMuted}
            style={styles.name}
          />
          <TextInput
            value={medication.strength ?? ""}
            onChangeText={(value) => update({ strength: value })}
            placeholder="Strength (e.g. 500 mg)"
            placeholderTextColor={colors.textMuted}
            style={styles.strength}
          />
        </View>

        {onRemove ? (
          <Pressable
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel="Remove medicine"
            hitSlop={sizes.spacing.xs}
          >
            <Ionicons name="trash-outline" size={sizes.iconSize.md} color={colors.error} />
          </Pressable>
        ) : (
          <Ionicons name="create-outline" size={sizes.iconSize.md} color={colors.textMuted} />
        )}
      </View>

      <View style={styles.row}>
        <LabeledInput
          label="Dosage"
          value={medication.dosage ?? ""}
          onChangeText={(value) => update({ dosage: value })}
          placeholder="1"
        />
        <LabeledInput
          label="Unit"
          value={medication.dosage_unit ?? ""}
          onChangeText={(value) => update({ dosage_unit: value })}
          placeholder="tablet"
        />
        <LabeledInput
          label="Days"
          value={medication.duration_days?.toString() ?? ""}
          onChangeText={(value) => {
            const digits = value.replace(/[^0-9]/g, "");
            update({ duration_days: digits ? parseInt(digits, 10) : null });
          }}
          keyboardType="number-pad"
          placeholder="30"
        />
      </View>

      <View style={styles.row}>
        <LabeledInput
          label="Frequency"
          value={medication.frequency ?? ""}
          onChangeText={(value) => update({ frequency: value })}
          placeholder="Twice daily"
        />
      </View>

      <View style={styles.row}>
        <LabeledInput
          label="Instructions"
          value={medication.instructions ?? ""}
          onChangeText={(value) => update({ instructions: value })}
          placeholder="After food"
        />
      </View>

      <ReminderTimes
        times={medication.schedules}
        onChange={(schedules) => update({ schedules })}
        showError={missingTime}
      />
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
    backgroundColor: colors.peachBackground,
  },
  titleColumn: {
    flex: 1,
  },
  name: {
    paddingVertical: 0,
    fontSize: sizes.fontSize.lg,
    fontFamily: "InterBold",
    color: colors.textPrimary,
  },
  strength: {
    paddingVertical: 0,
    fontSize: sizes.fontSize.xs,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textSecondary,
  },
  row: {
    flexDirection: "row",
    gap: sizes.spacing.sm,
  },
});
