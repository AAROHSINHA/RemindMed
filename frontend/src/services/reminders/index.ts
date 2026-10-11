import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import type { ScannedMedication } from "@/api/ocr";

import { cancelInAppPlan, saveInAppPlan, startInAppReminderEngine } from "./in-app";
import { buildReminderPlan, logReminderPlan } from "./plan";
import {
  cancelSystemNotifications,
  disableSystem,
  isSystemAvailable,
  prepareSystem,
  scheduleSystemTest,
  scheduleWithSystem,
} from "./system";
import { formatDateTime, pad } from "./time";
import type { ReminderMode } from "./types";

// Public API of the reminders service.
//
//  - "system": real OS notifications (fire with the app open, in the background or closed).
//  - "in-app": alerts shown while the app is open. Used only when OS notifications can't be used.
export { startInAppReminderEngine };

const TEST_DELAY_SECONDS = 10;
const storageKey = (medicationId: number) => `reminders:medication:${medicationId}`;

export const getReminderMode = (): ReminderMode => (isSystemAvailable() ? "system" : "in-app");

// Creates the Android channel and asks for permission. Returns true when reminders can be delivered.
export async function setupReminderNotifications(): Promise<boolean> {
  console.log(`[REMINDERS] setup: platform=${Platform.OS}`);
  const allowed = await prepareSystem();
  console.log(`[REMINDERS] mode=${getReminderMode()}${getReminderMode() === "in-app" ? " (no permission needed)" : ""}`);
  return allowed;
}

// Cancels everything previously scheduled for this medicine (both delivery modes).
export async function cancelMedicationReminders(medicationId: number): Promise<void> {
  await cancelInAppPlan(medicationId);

  const stored = await AsyncStorage.getItem(storageKey(medicationId));
  if (stored) {
    const ids: string[] = JSON.parse(stored);
    await cancelSystemNotifications(ids);
    console.log(`[REMINDERS] cancelled ${ids.length} earlier notification(s) for medication ${medicationId}`);
    await AsyncStorage.removeItem(storageKey(medicationId));
  }
}

// Schedules the reminders for one medicine, replacing any earlier set.
// Returns how many reminders were scheduled.
export async function scheduleMedicationReminders(medication: ScannedMedication): Promise<number> {
  await cancelMedicationReminders(medication.id);

  const plan = buildReminderPlan(medication);
  logReminderPlan(medication, plan, getReminderMode());

  if (isSystemAvailable()) {
    try {
      const ids = await scheduleWithSystem(plan);
      await AsyncStorage.setItem(storageKey(medication.id), JSON.stringify(ids));
      console.log(`[REMINDERS] ${medication.medicine_name}: ${ids.length} OS notification(s) scheduled`);
      return ids.length;
    } catch (error) {
      disableSystem(error);
    }
  }

  await saveInAppPlan(medication.id, plan);
  console.log(`[REMINDERS] ${medication.medicine_name}: ${plan.length} in-app reminder(s) saved`);
  return plan.length;
}

// Sends one notification 10 seconds from now so delivery can be checked quickly.
export async function scheduleTestReminder(): Promise<boolean> {
  const granted = await setupReminderNotifications();
  if (!granted) return false;

  const fireAt = new Date(Date.now() + TEST_DELAY_SECONDS * 1000);
  const title = "Test notification";
  const body = "Notifications are working. This is your 10 second test.";
  console.log(
    `[REMINDERS] test notification set for ${formatDateTime(fireAt)}:${pad(fireAt.getSeconds())} (mode=${getReminderMode()})`,
  );

  if (isSystemAvailable()) {
    try {
      const id = await scheduleSystemTest(TEST_DELAY_SECONDS, title, body);
      console.log(`[REMINDERS] test notification scheduled with the OS, id=${id}`);
      return true;
    } catch (error) {
      disableSystem(error);
    }
  }

  await saveInAppPlan(-1, [
    { key: `test:${fireAt.getTime()}`, medicationId: -1, title, body, kind: "once", at: fireAt.getTime() },
  ]);
  return true;
}
