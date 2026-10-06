import { MedicationCard } from "@/components/main/medication-card";
import { ScreenContainer } from "@/components/sharedComponents/screen-container";
import { SectionHeader } from "@/components/sharedComponents/section-header";
import { medications } from "@/data/mock-medications";

export default function MedicationsScreen() {
  return (
    <ScreenContainer>
      <SectionHeader title="My Medications" />
      {medications.map(({ id, ...medication }) => (
        <MedicationCard key={id} {...medication} />
      ))}
    </ScreenContainer>
  );
}
