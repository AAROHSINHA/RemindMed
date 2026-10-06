import { MedicationCard } from "@/components/main/medication-card";
import { ScreenContainer } from "@/components/sharedComponents/screen-container";
import { SectionHeader } from "@/components/sharedComponents/section-header";
import { medicationHistory } from "@/data/mock-medications";

export default function HistoryScreen() {
  return (
    <ScreenContainer>
      <SectionHeader title="Medication History" />
      {medicationHistory.map(({ id, ...entry }) => (
        <MedicationCard key={id} {...entry} />
      ))}
    </ScreenContainer>
  );
}
