import { Alert } from "react-native";

import { MainButton } from "@/components/sharedComponents/main-button";
import { colors } from "@/constants/colors";
import { getReminderMode, scheduleTestReminder } from "@/services/reminders";

// TEMPORARY: sends one test notification 10 seconds from now (no scan needed).
// Remove this component and its use in app/main/home.tsx once notifications are verified.
export function NotificationTest() {
  const handlePress = async () => {
    try {
      const scheduled = await scheduleTestReminder();
      Alert.alert(
        scheduled ? "Test notification scheduled" : "Notifications are off",
        scheduled
          ? getReminderMode() === "system"
            ? "It will arrive in about 10 seconds, in your notification shade."
            : "System notifications aren't available here, so you'll get an in-app alert in about 10 seconds."
          : "Allow notifications in your phone settings.",
      );
    } catch (e: any) {
      console.log("[NOTIFICATION TEST] failed:", e);
      Alert.alert("Notification test failed", e?.message ?? "Unknown error");
    }
  };

  return (
    <MainButton
      text="Test notification (10 seconds)"
      onClick={handlePress}
      bgColor={colors.lavenderBackground}
      textColor={colors.primary}
    />
  );
}
