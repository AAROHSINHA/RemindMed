import { getMedications, TodayMedicine } from "@/api/user/medicine";
import { MedicationCard } from "@/components/main/medication-card";
import Loader from "@/components/sharedComponents/loader";
import { ScreenContainer } from "@/components/sharedComponents/screen-container";
import { SectionHeader } from "@/components/sharedComponents/section-header";
import { medications } from "@/data/mock-medications";
import { useState, useEffect } from "react";

export default function MedicationsScreen() {
  const [medicines, setMedicines] = useState<TodayMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getMedications();
        console.log(response);
        setMedicines(response);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ScreenContainer>
      <Loader visible={isLoading} />
      <SectionHeader title="My Medications" />
      {medicines.map((medication) => (
        <MedicationCard key={medication.medication_id} {...medication} />
      ))}
    </ScreenContainer>
  );
}
