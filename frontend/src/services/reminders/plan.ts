import type { ScannedMedication } from "@/api/ocr";

import { formatDateTime, pad, parseLocalDate } from "./time";
import type { PlannedReminder, ReminderMode } from "./types";

const LOOKAHEAD_DAYS = 14;

// Last moment of the course, or null for an ongoing medicine.
const getCourseEnd = (medication: ScannedMedication, today: Date): Date | null => {
  if (medication.end_date) {
    const end = parseLocalDate(medication.end_date);
    end.setHours(23, 59, 59, 999);
    return end;
  }
  if (medication.duration_days) {
    const start = medication.start_date ? parseLocalDate(medication.start_date) : today;
    return new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + medication.duration_days - 1,
      23,
      59,
      59,
      999,
    );
  }
  return null;
};

const buildBody = (medication: ScannedMedication): string => {
  const amount = [medication.dosage, medication.dosage_unit].filter(Boolean).join(" ");
  const parts = [amount, medication.instructions].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Time to take your medicine.";
};

// Decides WHAT should fire and WHEN.
//  - Finite course (end_date or duration_days): one-off reminders for the next 14 days,
//    skipping times that already passed and never going past the course end.
//  - Ongoing: one daily repeating reminder per time.
export function buildReminderPlan(medication: ScannedMedication): PlannedReminder[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const courseStart = medication.start_date ? parseLocalDate(medication.start_date) : today;
  const courseEnd = getCourseEnd(medication, today);

  const title = `Time for ${medication.medicine_name}`;
  const body = buildBody(medication);
  const plan: PlannedReminder[] = [];

  for (const schedule of medication.schedules) {
    if (!schedule.enabled) continue;
    const [hour, minute] = schedule.scheduled_time.split(":").map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) continue;

    if (courseEnd === null) {
      plan.push({
        key: `m${medication.id}:daily:${pad(hour)}${pad(minute)}`,
        medicationId: medication.id,
        title,
        body,
        kind: "daily",
        hour,
        minute,
      });
      continue;
    }

    for (let offset = 0; offset < LOOKAHEAD_DAYS; offset++) {
      const fireAt = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute, 0);
      if (fireAt > courseEnd) break;
      if (fireAt <= now || fireAt < courseStart) continue;

      plan.push({
        key: `m${medication.id}:once:${fireAt.getTime()}`,
        medicationId: medication.id,
        title,
        body,
        kind: "once",
        at: fireAt.getTime(),
      });
    }
  }
  return plan;
}

// Prints what is about to be scheduled, grouped per time.
export function logReminderPlan(
  medication: ScannedMedication,
  plan: PlannedReminder[],
  mode: ReminderMode,
): void {
  console.log(
    `[REMINDERS] ${medication.medicine_name} (id ${medication.id}) → ${plan.length} reminder(s), mode=${mode}`,
  );
  if (plan.length === 0) {
    console.log("[REMINDERS]   • nothing to schedule (no enabled times, or all of today's times have passed)");
    return;
  }

  for (const entry of plan.filter((item) => item.kind === "daily")) {
    console.log(`[REMINDERS]   • every day at ${pad(entry.hour ?? 0)}:${pad(entry.minute ?? 0)}`);
  }

  const byTime = new Map<string, number[]>();
  for (const entry of plan.filter((item) => item.kind === "once")) {
    const date = new Date(entry.at ?? 0);
    const label = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    byTime.set(label, [...(byTime.get(label) ?? []), entry.at ?? 0]);
  }
  for (const [label, times] of byTime) {
    console.log(
      `[REMINDERS]   • ${label}: ${times.length} one-off reminder(s), ` +
        `first ${formatDateTime(Math.min(...times))}, last ${formatDateTime(Math.max(...times))}`,
    );
  }
}
