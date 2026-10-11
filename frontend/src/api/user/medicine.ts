import { API_BASE_URL } from "@/api/env";
import { withAuthRetry } from "../core/withAuthRetry";
import axios from "axios";

export interface TodayMedicine {
  prescription_id: number;
  user_id: number;
  medication_id: number | null;
  medicine_name: string | null;
  strength: string | null;
  scheduled_time: string | null;
}

export const getTodayMedicines = () =>
  withAuthRetry<TodayMedicine[]>((token) =>
    axios.get<TodayMedicine[]>(`${API_BASE_URL}/today-medicines`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 3000,
    }),
  );
