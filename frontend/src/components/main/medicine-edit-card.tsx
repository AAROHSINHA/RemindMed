import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, View } from "react-native";

import type { ScannedMedication } from "@/api/ocr";
import { LabeledInput } from "@/components/sharedComponents/labeled-input";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

type MedicineEditCardProps = {
  medication: ScannedMedication;
  onChange: (medication: ScannedMedication) => void;
};

// One detected medicine. Every field is a text input, so tapping a value edits it.
export function MedicineEditCard({ medication, onChange }: MedicineEditCardProps) {
  const update = (changes: Partial<ScannedMedication>) => onChange({ ...medication, ...changes });

  const updateTime = (index: number, value: string) => {
    const schedules = medication.schedules.map((schedule, i) =>
      i === index ? { ...schedule, scheduled_time: value } : schedule,
    );
    update({ schedules });
  };

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

        <Ionicons name="create-outline" size={sizes.iconSize.md} color={colors.textMuted} />
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

      {medication.schedules.length > 0 ? (
        <View style={styles.times}>
          <Text style={styles.timesLabel}>Reminder times</Text>
          <View style={styles.timesRow}>
            {medication.schedules.map((schedule, index) => (
              <TextInput
                key={schedule.id}
                value={schedule.scheduled_time}
                onChangeText={(value) => updateTime(index, value)}
                placeholder="09:00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numbers-and-punctuation"
                maxLength={8}
                style={styles.time}
              />
            ))}
          </View>
        </View>
      ) : null}
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
  times: {
    gap: sizes.spacing.xxs,
  },
  timesLabel: {
    fontSize: sizes.fontSize.xs,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textMuted,
  },
  timesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: sizes.spacing.xs,
  },
  time: {
    width: sizes.timeFieldWidth,
    height: sizes.fieldHeight,
    paddingHorizontal: sizes.spacing.sm,
    textAlign: "center",
    borderRadius: sizes.radius.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    fontSize: sizes.fontSize.sm,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textPrimary,
  },
});
