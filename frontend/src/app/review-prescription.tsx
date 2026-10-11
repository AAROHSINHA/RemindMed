import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ExtractedMedication, ScannedMedication } from "@/api/ocr";
import type { ApiError } from "@/api/env";
import { createPrescription } from "@/api/prescriptions";
import { MedicineEditCard } from "@/components/main/medicine-edit-card";
import { PrescriptionDetailsCard } from "@/components/main/prescription-details-card";
import Loader from "@/components/sharedComponents/loader";
import { MainButton } from "@/components/sharedComponents/main-button";
import { SectionHeader } from "@/components/sharedComponents/section-header";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";
import {
  getReminderMode,
  scheduleMedicationReminders,
  setupReminderNotifications,
} from "@/services/reminders";
import { getScanResult } from "@/utils/scan-result";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatDate = (iso: string | null) => {
  const date = iso ? new Date(iso) : new Date();
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

// Nothing is saved yet, so give each medicine and time a local id (used as React keys) and
// show times as HH:MM. New times added in the picker get negative ids.
const withLocalIds = (medications: ExtractedMedication[]): ScannedMedication[] =>
  medications.map((medication, medIndex) => ({
    ...medication,
    id: medIndex + 1,
    schedules: medication.schedules.map((schedule, timeIndex) => ({
      ...schedule,
      id: (medIndex + 1) * 1000 + timeIndex + 1,
      scheduled_time: schedule.scheduled_time.slice(0, 5),
    })),
  }));

// An empty card for adding a medicine by hand (e.g. when the scan was cut off).
const blankMedication = (id: number): ScannedMedication => ({
  id,
  medicine_name: "",
  strength: null,
  dosage: null,
  dosage_unit: null,
  frequency: null,
  duration_days: null,
  start_date: null,
  end_date: null,
  instructions: null,
  ai_confidence: null,
  schedules: [],
});

export default function ReviewPrescriptionScreen() {
  const result = getScanResult();
  const [doctorName, setDoctorName] = useState(result?.prescription.doctor_name ?? "");
  const [medications, setMedications] = useState<ScannedMedication[]>(() =>
    withLocalIds(result?.medications ?? []),
  );

  const nextLocalId = useRef((result?.medications.length ?? 0) + 1);
  const [saving, setSaving] = useState(false);
  const [missingIds, setMissingIds] = useState<number[]>([]);

  const updateMedication = (updated: ScannedMedication) => {
    setMedications((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    if (updated.schedules.length > 0) {
      setMissingIds((ids) => ids.filter((id) => id !== updated.id));
    }
  };

  const addMedication = () => {
    const id = nextLocalId.current++;
    setMedications((current) => [...current, blankMedication(id)]);
  };

  const removeMedication = (id: number) => {
    setMedications((current) => current.filter((item) => item.id !== id));
    setMissingIds((ids) => ids.filter((missingId) => missingId !== id));
  };

  const handleConfirm = async () => {
    if (!result) return;

    if (medications.length === 0) {
      Alert.alert("No medicines", "Add at least one medicine before confirming.");
      return;
    }

    // Manually added cards must have a name.
    if (medications.some((medication) => !medication.medicine_name.trim())) {
      Alert.alert(
        "Name missing",
        "Enter a name for every medicine, or remove the empty card.",
      );
      return;
    }

    // Every medicine needs at least one reminder time.
    const missing = medications.filter((medication) => medication.schedules.length === 0);
    if (missing.length > 0) {
      setMissingIds(missing.map((medication) => medication.id));
      Alert.alert(
        "Add a reminder time",
        `Add at least one reminder time for: ${missing.map((m) => m.medicine_name).join(", ")}.`,
      );
      return;
    }

    setMissingIds([]);
    setSaving(true);
    try {
      // 1. Save the reviewed prescription (medicines + reminder times) to the database.
      const saved = await createPrescription({
        name: result.prescription.name,
        doctor_name: doctorName.trim() || null,
        notes: result.prescription.notes,
        medications: medications.map((medication) => ({
          medicine_name: medication.medicine_name,
          strength: medication.strength,
          dosage: medication.dosage,
          dosage_unit: medication.dosage_unit,
          frequency: medication.frequency,
          duration_days: medication.duration_days,
          start_date: medication.start_date,
          end_date: medication.end_date,
          instructions: medication.instructions,
          ai_confidence: medication.ai_confidence,
          schedules: medication.schedules.map((schedule) => ({
            scheduled_time: schedule.scheduled_time,
            enabled: schedule.enabled,
          })),
        })),
      });

      // 2. Schedule the local reminders from the saved schedules.
      let message: string;
      try {
        const allowed = await setupReminderNotifications();
        if (allowed) {
          let total = 0;
          for (const medication of saved.medications) {
            total += await scheduleMedicationReminders(medication);
          }
          const count = `${total} reminder${total === 1 ? "" : "s"}`;
          message =
            getReminderMode() === "system"
              ? `Prescription saved. ${count} scheduled. They will notify you even when the app is closed.`
              : `Prescription saved. ${count} scheduled as in-app alerts (the app must be open).`;
        } else {
          message =
            "Prescription saved, but notifications are turned off. Enable them in your phone settings to get reminders.";
        }
      } catch (e: any) {
        console.log("[REVIEW] scheduling reminders failed:", e);
        message = `Prescription saved, but reminders could not be scheduled: ${e?.message ?? "unknown error"}`;
      }

      Alert.alert("All set", message, [
        { text: "OK", onPress: () => router.replace("/main/home") },
      ]);
    } catch (e) {
      Alert.alert("Couldn't confirm", (e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No prescription to review. Please scan again.</Text>
          <MainButton text="Back to Home" onClick={() => router.replace("/main/home")} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={sizes.iconSize.lg} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topTitle}>Review Prescription</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PrescriptionDetailsCard
            doctorName={doctorName}
            onDoctorNameChange={setDoctorName}
            date={formatDate(null)}
            status="Pending"
          />

          <SectionHeader
            title="Detected Medicines"
            subtitle={`${medications.length} found · tap any value to edit`}
          />

          {result.truncated ? (
            <View style={styles.notice}>
              <Ionicons name="alert-circle" size={sizes.iconSize.md} color={colors.warning} />
              <Text style={styles.noticeText}>
                Some medicines may be missing from the scan. Check the list and use "Add medicine"
                to add any that are not shown.
              </Text>
            </View>
          ) : null}

          {medications.map((medication) => (
            <MedicineEditCard
              key={medication.id}
              medication={medication}
              onChange={updateMedication}
              missingTime={missingIds.includes(medication.id)}
              onRemove={() => removeMedication(medication.id)}
            />
          ))}

          <MainButton
            text="Add medicine"
            onClick={addMedication}
            icon={<Ionicons name="add" size={sizes.iconSize.lg} color={colors.primary} />}
            bgColor={colors.lavenderBackground}
            textColor={colors.primary}
          />
        </ScrollView>

        <View style={styles.footer}>
          <MainButton text="Confirm" onClick={handleConfirm} disabled={saving} />
        </View>
      </KeyboardAvoidingView>
      <Loader visible={saving} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sizes.spacing.md,
  },
  backButton: {
    width: sizes.buttonHeight,
    height: sizes.buttonHeight,
    justifyContent: "center",
  },
  topTitle: {
    fontSize: sizes.fontSize.md,
    fontFamily: "InterSemiBold",
    color: colors.textPrimary,
  },
  content: {
    gap: sizes.spacing.md,
    padding: sizes.spacing.lg,
    paddingTop: sizes.spacing.xs,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: sizes.spacing.xs,
    padding: sizes.spacing.sm,
    borderRadius: sizes.radius.md,
    backgroundColor: colors.peachBackground,
  },
  noticeText: {
    flex: 1,
    fontSize: sizes.fontSize.xs,
    lineHeight: sizes.fontSize.xs * 1.6,
    fontFamily: "InterMedium",
    color: colors.textPrimary,
  },
  footer: {
    gap: sizes.spacing.xs,
    padding: sizes.spacing.lg,
    paddingTop: sizes.spacing.xs,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    gap: sizes.spacing.lg,
    padding: sizes.spacing.lg,
  },
  emptyText: {
    textAlign: "center",
    fontSize: sizes.fontSize.md,
    fontFamily: "InterMedium",
    color: colors.textSecondary,
  },
});
