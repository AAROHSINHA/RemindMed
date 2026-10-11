import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import type { ScannedSchedule } from "@/api/ocr";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

type ReminderTimesProps = {
  times: ScannedSchedule[];
  onChange: (times: ScannedSchedule[]) => void;
  showError?: boolean;
};

const ADD = -1;
let nextTempId = -1; // new times have no database id yet

const toDate = (hhmm: string) => {
  const [hour, minute] = hhmm.split(":").map(Number);
  const date = new Date();
  date.setHours(Number.isNaN(hour) ? 9 : hour, Number.isNaN(minute) ? 0 : minute, 0, 0);
  return date;
};

const toHHMM = (date: Date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const toLabel = (hhmm: string) => {
  const [hour, minute] = hhmm.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${suffix}`;
};

// Add, edit (tap a time) and remove reminder times for one medicine.
export function ReminderTimes({ times, onChange, showError }: ReminderTimesProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // ADD = new time
  const [pickedDate, setPickedDate] = useState(new Date());

  const open = (index: number) => {
    setPickedDate(toDate(index === ADD ? "09:00" : times[index].scheduled_time));
    setEditingIndex(index);
  };

  const apply = (date: Date) => {
    const hhmm = toHHMM(date);
    const index = editingIndex;
    setEditingIndex(null);
    if (index === null) return;

    // Ignore a time that already exists on another chip.
    if (times.some((time, i) => i !== index && time.scheduled_time === hhmm)) return;

    const next =
      index === ADD
        ? [...times, { id: nextTempId--, scheduled_time: hhmm, enabled: true }]
        : times.map((time, i) => (i === index ? { ...time, scheduled_time: hhmm } : time));
    onChange(next.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time)));
  };

  const remove = (index: number) => onChange(times.filter((_, i) => i !== index));

  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "set" && date) apply(date);
    else setEditingIndex(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Reminder times</Text>

      <View style={styles.row}>
        {times.map((time, index) => (
          <View key={time.id} style={styles.chip}>
            <Pressable
              onPress={() => open(index)}
              accessibilityRole="button"
              accessibilityLabel={`Edit reminder at ${toLabel(time.scheduled_time)}`}
              style={styles.chipMain}
            >
              <Ionicons name="alarm-outline" size={sizes.iconSize.sm} color={colors.primary} />
              <Text style={styles.chipText}>{toLabel(time.scheduled_time)}</Text>
            </Pressable>
            <Pressable
              onPress={() => remove(index)}
              accessibilityRole="button"
              accessibilityLabel="Remove reminder time"
              hitSlop={sizes.spacing.xs}
            >
              <Ionicons name="close-circle" size={sizes.iconSize.md} color={colors.textMuted} />
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={() => open(ADD)}
          accessibilityRole="button"
          style={[styles.chip, styles.addChip, showError && styles.addChipError]}
        >
          <Ionicons name="add" size={sizes.iconSize.md} color={colors.primary} />
          <Text style={styles.chipText}>Add time</Text>
        </Pressable>
      </View>

      {showError ? (
        <Text style={styles.error}>Add at least one reminder time.</Text>
      ) : null}

      {editingIndex !== null && Platform.OS === "android" ? (
        <DateTimePicker
          value={pickedDate}
          mode="time"
          is24Hour={false}
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal visible={editingIndex !== null} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <DateTimePicker
                value={pickedDate}
                mode="time"
                display="spinner"
                onChange={(_, date) => date && setPickedDate(date)}
              />
              <View style={styles.modalActions}>
                <Pressable onPress={() => setEditingIndex(null)} accessibilityRole="button">
                  <Text style={styles.modalCancel}>Cancel</Text>
                </Pressable>
                <Pressable onPress={() => apply(pickedDate)} accessibilityRole="button">
                  <Text style={styles.modalDone}>Done</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: sizes.spacing.xs,
  },
  label: {
    fontSize: sizes.fontSize.xs,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textMuted,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: sizes.spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: sizes.spacing.xs,
    height: sizes.fieldHeight,
    paddingHorizontal: sizes.spacing.sm,
    borderRadius: sizes.radius.pill,
    backgroundColor: colors.lavenderBackground,
  },
  chipMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: sizes.spacing.xxs,
  },
  chipText: {
    fontSize: sizes.fontSize.sm,
    fontFamily: "InterSemiBold",
    color: colors.textPrimary,
  },
  addChip: {
    backgroundColor: colors.surface,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
  },
  addChipError: {
    borderColor: colors.error,
  },
  error: {
    fontSize: sizes.fontSize.xs,
    fontFamily: "InterMedium",
    color: colors.error,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(48, 48, 68, 0.35)",
  },
  modalSheet: {
    padding: sizes.spacing.lg,
    borderTopLeftRadius: sizes.radius.lg,
    borderTopRightRadius: sizes.radius.lg,
    backgroundColor: colors.surface,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: sizes.spacing.sm,
  },
  modalCancel: {
    fontSize: sizes.fontSize.md,
    fontFamily: "InterMedium",
    color: colors.textSecondary,
  },
  modalDone: {
    fontSize: sizes.fontSize.md,
    fontFamily: "InterBold",
    color: colors.primary,
  },
});
