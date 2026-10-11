import { router } from "expo-router";

import { MedicationCard } from "@/components/main/medication-card";
import { NotificationTest } from "@/components/main/notification-test";
import { ScanCard } from "@/components/main/scan-card";
import { ScreenContainer } from "@/components/sharedComponents/screen-container";
import { SectionHeader } from "@/components/sharedComponents/section-header";
import { todayMedications, upcomingReminders } from "@/data/mock-medications";
import { scanPrescription } from "@/utils/scan-prescription";
import Loader from "@/components/sharedComponents/loader";
import { useState, useEffect } from "react";
import { getTodayMedicines } from "@/api/user/medicine";
import { TodayMedicine } from "@/api/user/medicine";

export default function HomeScreen() {
  const takenCount = todayMedications.filter(
    (m) => m.status === "taken",
  ).length;
  const [isLoading, setIsLoading] = useState(false);
  const [todayMedicines, setTodayMedicines] = useState<TodayMedicine[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getTodayMedicines();
        console.log(response);
        setTodayMedicines(response);
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
      <ScanCard onScan={scanPrescription} />

      <SectionHeader
        title="Today's Medications"
        subtitle={`List of all medicines`}
        actionText="View All"
        onAction={() => router.push("/main/medications")}
      />
      {todayMedicines.map((medication) => (
        <MedicationCard key={medication.medication_id} {...medication} />
      ))}

      {/* <SectionHeader
        title="Upcoming Reminders"
        actionText="View All"
        onAction={() => router.push("/main/medications")}
      /> */}
      {/* {upcomingReminders.map(({ id, ...reminder }) => (
        <MedicationCard key={id} {...reminder} />
      ))} */}
    </ScreenContainer>
  );
}
