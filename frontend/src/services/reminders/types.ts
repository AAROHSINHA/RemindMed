// One reminder that should fire. Independent of HOW it is delivered (OS or in-app).
export interface PlannedReminder {
  key: string;
  medicationId: number;
  title: string;
  body: string;
  kind: "once" | "daily";
  at?: number; // once: epoch ms
  hour?: number; // daily
  minute?: number; // daily
}

export type ReminderMode = "system" | "in-app";
