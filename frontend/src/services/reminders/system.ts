import { Platform } from "react-native";

import type { PlannedReminder } from "./types";

// Real OS notifications through expo-notifications.
//
// expo-notifications' index.js registers a push-token listener on import, and that call
// throws in Expo Go on Android (SDK 53+). Local notifications don't need it, so only the
// individual modules we use are imported and the index is never loaded.
// If they can't be loaded or used, callers fall back to in-app alerts.

const CHANNEL_ID = "medication-reminders";

type SystemNotifications = {
  scheduleNotificationAsync: typeof import("expo-notifications/build/scheduleNotificationAsync").scheduleNotificationAsync;
  cancelScheduledNotificationAsync: typeof import("expo-notifications/build/cancelScheduledNotificationAsync").cancelScheduledNotificationAsync;
  getPermissionsAsync: typeof import("expo-notifications/build/NotificationPermissions").getPermissionsAsync;
  requestPermissionsAsync: typeof import("expo-notifications/build/NotificationPermissions").requestPermissionsAsync;
  setNotificationChannelAsync: typeof import("expo-notifications/build/setNotificationChannelAsync").setNotificationChannelAsync;
  SchedulableTriggerInputTypes: typeof import("expo-notifications/build/Notifications.types").SchedulableTriggerInputTypes;
  AndroidImportance: typeof import("expo-notifications/build/NotificationChannelManager.types").AndroidImportance;
};

let loaded: SystemNotifications | null | undefined; // undefined = not tried yet

// Our own Android channel can fail to be created in some environments (Expo Go has no channel
// provider). Android then uses its default channel, so notifications still show.
let channelReady = false;
const channelTrigger = () => (channelReady ? { channelId: CHANNEL_ID } : {});

function load(): SystemNotifications | null {
  if (loaded !== undefined) return loaded;

  try {
    const { scheduleNotificationAsync } = require("expo-notifications/build/scheduleNotificationAsync");
    const { cancelScheduledNotificationAsync } = require("expo-notifications/build/cancelScheduledNotificationAsync");
    const { getPermissionsAsync, requestPermissionsAsync } = require("expo-notifications/build/NotificationPermissions");
    const { setNotificationChannelAsync } = require("expo-notifications/build/setNotificationChannelAsync");
    const { SchedulableTriggerInputTypes } = require("expo-notifications/build/Notifications.types");
    const { AndroidImportance } = require("expo-notifications/build/NotificationChannelManager.types");
    const { setNotificationHandler } = require("expo-notifications/build/NotificationsHandler");

    // Show notifications even while the app is open.
    setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    loaded = {
      scheduleNotificationAsync,
      cancelScheduledNotificationAsync,
      getPermissionsAsync,
      requestPermissionsAsync,
      setNotificationChannelAsync,
      SchedulableTriggerInputTypes,
      AndroidImportance,
    };
    console.log("[REMINDERS] system notifications loaded (real OS notifications)");
  } catch (error: any) {
    loaded = null;
    console.log(
      "[REMINDERS] system notifications NOT available, using in-app alerts instead:",
      error?.message ?? error,
    );
  }
  return loaded;
}

export const isSystemAvailable = () => load() !== null;

// Stop using OS notifications for the rest of this session (after an unrecoverable error).
export function disableSystem(reason: unknown): void {
  console.log("[REMINDERS] switching to in-app alerts:", (reason as any)?.message ?? reason);
  loaded = null;
}

// Creates the Android channel (it must exist before the Android 13+ permission prompt) and
// asks for permission. Returns whether notifications may be shown.
export async function prepareSystem(): Promise<boolean> {
  const notifications = load();
  if (!notifications) return true;

  if (Platform.OS === "android") {
    try {
      await notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: "Medication reminders",
        importance: notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
      channelReady = true;
      console.log(`[REMINDERS] Android channel ready: ${CHANNEL_ID}`);
    } catch (error: any) {
      channelReady = false;
      console.log(
        "[REMINDERS] could not create the Android channel, using the default channel:",
        error?.message ?? error,
      );
    }
  }

  try {
    const current = await notifications.getPermissionsAsync();
    if (current.granted) {
      console.log("[REMINDERS] notification permission: already granted");
      return true;
    }
    const requested = await notifications.requestPermissionsAsync();
    console.log(`[REMINDERS] notification permission: ${requested.granted ? "granted" : "DENIED"}`);
    return requested.granted;
  } catch (error) {
    disableSystem(error);
    return true; // in-app alerts need no permission
  }
}

// Hands a plan to the OS. Returns the notification ids (needed to cancel them later).
export async function scheduleWithSystem(plan: PlannedReminder[]): Promise<string[]> {
  const notifications = load();
  if (!notifications) throw new Error("System notifications are not available");

  const ids: string[] = [];
  for (const entry of plan) {
    const content = {
      title: entry.title,
      body: entry.body,
      data: { medicationId: entry.medicationId },
    };

    const id =
      entry.kind === "daily"
        ? await notifications.scheduleNotificationAsync({
            content,
            trigger: {
              type: notifications.SchedulableTriggerInputTypes.DAILY,
              hour: entry.hour ?? 0,
              minute: entry.minute ?? 0,
              ...channelTrigger(),
            },
          })
        : await notifications.scheduleNotificationAsync({
            content,
            trigger: {
              type: notifications.SchedulableTriggerInputTypes.DATE,
              date: new Date(entry.at ?? 0),
              ...channelTrigger(),
            },
          });
    ids.push(id);
  }
  return ids;
}

export async function scheduleSystemTest(seconds: number, title: string, body: string): Promise<string> {
  const notifications = load();
  if (!notifications) throw new Error("System notifications are not available");

  return notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      ...channelTrigger(),
    },
  });
}

export async function cancelSystemNotifications(ids: string[]): Promise<void> {
  const notifications = load();
  if (!notifications) return;
  await Promise.all(ids.map((id) => notifications.cancelScheduledNotificationAsync(id)));
}
