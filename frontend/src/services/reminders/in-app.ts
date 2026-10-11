import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Vibration } from "react-native";

import { formatDateTime, pad } from "./time";
import type { PlannedReminder } from "./types";

// In-app reminder engine: the fallback where OS notifications can't be used.
// Works only while the app is open: a timer compares the clock with the saved plan and shows
// an alert + vibration. (Real notifications are handled in ./system.ts.)

const PLAN_KEY = "inapp-reminders:plan";
const FIRED_KEY = "inapp-reminders:fired";
const TICK_MS = 15000;
const GRACE_MS = 2 * 60 * 1000; // still fire if the app was busy for up to 2 minutes
const FIRED_RETENTION_MS = 2 * 24 * 60 * 60 * 1000;

async function loadPlan(): Promise<PlannedReminder[]> {
  const raw = await AsyncStorage.getItem(PLAN_KEY);
  return raw ? (JSON.parse(raw) as PlannedReminder[]) : [];
}

// Replaces the saved plan for one medicine (pass [] to remove it).
export async function saveInAppPlan(medicationId: number, plan: PlannedReminder[]): Promise<void> {
  const others = (await loadPlan()).filter((entry) => entry.medicationId !== medicationId);
  await AsyncStorage.setItem(PLAN_KEY, JSON.stringify([...others, ...plan]));
}

export const cancelInAppPlan = (medicationId: number) => saveInAppPlan(medicationId, []);

let ticking = false;

async function tick() {
  if (ticking) return;
  ticking = true;
  try {
    const plan = await loadPlan();
    if (plan.length === 0) return;

    const now = Date.now();
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const firedRaw = await AsyncStorage.getItem(FIRED_KEY);
    const fired: Record<string, number> = firedRaw ? JSON.parse(firedRaw) : {};

    const due: { key: string; reminder: PlannedReminder }[] = [];
    for (const reminder of plan) {
      if (reminder.kind === "once" && reminder.at !== undefined) {
        const age = now - reminder.at;
        if (age >= 0 && age < GRACE_MS && !fired[reminder.key]) {
          due.push({ key: reminder.key, reminder });
        }
      } else if (reminder.kind === "daily") {
        const matches = today.getHours() === reminder.hour && today.getMinutes() === reminder.minute;
        const key = `${reminder.key}:${todayKey}`;
        if (matches && !fired[key]) due.push({ key, reminder });
      }
    }

    // Forget old fired markers so the list doesn't grow forever.
    for (const key of Object.keys(fired)) {
      if (now - fired[key] > FIRED_RETENTION_MS) delete fired[key];
    }

    if (due.length === 0) {
      await AsyncStorage.setItem(FIRED_KEY, JSON.stringify(fired));
      return;
    }

    for (const { key, reminder } of due) {
      fired[key] = now;
      console.log(`[REMINDERS] ⏰ DUE NOW (${formatDateTime(now)}): ${reminder.title} — ${reminder.body}`);
    }
    await AsyncStorage.setItem(FIRED_KEY, JSON.stringify(fired));

    Vibration.vibrate([0, 400, 200, 400]);
    Alert.alert(
      due.length === 1 ? due[0].reminder.title : "Medication reminders",
      due.length === 1
        ? due[0].reminder.body
        : due.map(({ reminder }) => `• ${reminder.title}: ${reminder.body}`).join("\n"),
    );
  } catch (error) {
    console.log("[REMINDERS] in-app check failed:", error);
  } finally {
    ticking = false;
  }
}

// Starts checking the clock. Returns a function that stops it.
export function startInAppReminderEngine(): () => void {
  loadPlan().then((plan) => {
    console.log(
      `[REMINDERS] in-app engine started (checks every ${TICK_MS / 1000}s). ` +
        `${plan.length} reminder(s) in the plan.`,
    );
    for (const reminder of plan) {
      const when =
        reminder.kind === "daily"
          ? `daily at ${pad(reminder.hour ?? 0)}:${pad(reminder.minute ?? 0)}`
          : `once at ${formatDateTime(reminder.at ?? 0)}`;
      console.log(`[REMINDERS]   • ${reminder.title} → ${when}`);
    }
  });

  tick();
  const timer = setInterval(tick, TICK_MS);
  return () => {
    clearInterval(timer);
    console.log("[REMINDERS] in-app engine stopped");
  };
}
