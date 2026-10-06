import { router } from "expo-router";

import { MedicationCard } from "@/components/main/medication-card";
import { ScanCard } from "@/components/main/scan-card";
import { ScreenContainer } from "@/components/sharedComponents/screen-container";
import { SectionHeader } from "@/components/sharedComponents/section-header";
import { todayMedications, upcomingReminders } from "@/data/mock-medications";
import { scanPrescription } from "@/utils/scan-prescription";

export default function HomeScreen() {
  const takenCount = todayMedications.filter((m) => m.status === "taken").length;

  return (
    <ScreenContainer>
      <ScanCard onScan={scanPrescription} />

      <SectionHeader
        title="Today's Medications"
        subtitle={`${takenCount} of ${todayMedications.length} taken`}
        actionText="View All"
        onAction={() => router.push("/main/medications")}
      />
      {todayMedications.map(({ id, ...medication }) => (
        <MedicationCard key={id} {...medication} />
      ))}

      <SectionHeader
        title="Upcoming Reminders"
        actionText="View All"
        onAction={() => router.push("/main/medications")}
      />
      {upcomingReminders.map(({ id, ...reminder }) => (
        <MedicationCard key={id} {...reminder} />
      ))}
    </ScreenContainer>
  );
}
