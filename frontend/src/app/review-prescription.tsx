import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ScannedMedication } from "@/api/ocr";
import { MedicineEditCard } from "@/components/main/medicine-edit-card";
import { PrescriptionDetailsCard } from "@/components/main/prescription-details-card";
import { MainButton } from "@/components/sharedComponents/main-button";
import { SectionHeader } from "@/components/sharedComponents/section-header";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";
import { getScanResult } from "@/utils/scan-result";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatDate = (iso: string | null) => {
  const date = iso ? new Date(iso) : new Date();
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

const statusLabel = (status: string) => (status === "PENDING_REVIEW" ? "Pending" : status);

// Schedule times arrive as HH:MM:SS; show HH:MM.
const withShortTimes = (medications: ScannedMedication[]): ScannedMedication[] =>
  medications.map((medication) => ({
    ...medication,
    schedules: medication.schedules.map((schedule) => ({
      ...schedule,
      scheduled_time: schedule.scheduled_time.slice(0, 5),
    })),
  }));

export default function ReviewPrescriptionScreen() {
  const result = getScanResult();
  const [doctorName, setDoctorName] = useState(result?.prescription.doctor_name ?? "");
  const [medications, setMedications] = useState<ScannedMedication[]>(() =>
    withShortTimes(result?.medications ?? []),
  );

  const updateMedication = (updated: ScannedMedication) =>
    setMedications((current) => current.map((item) => (item.id === updated.id ? updated : item)));

  const handleConfirm = () => {
    // Nothing is saved yet: edits stay on this screen for now.
    console.log("[REVIEW] confirm pressed", { doctorName, medications });
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
            date={formatDate(result.prescription.created_at)}
            status={statusLabel(result.prescription.status)}
          />

          <SectionHeader
            title="Detected Medicines"
            subtitle={`${medications.length} found · tap any value to edit`}
          />

          {medications.map((medication) => (
            <MedicineEditCard
              key={medication.id}
              medication={medication}
              onChange={updateMedication}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <MainButton text="Confirm" onClick={handleConfirm} />
        </View>
      </KeyboardAvoidingView>
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
  footer: {
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
