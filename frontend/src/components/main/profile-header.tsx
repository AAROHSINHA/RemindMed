import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";
import { useUser } from "@/hooks/use-user";

const getGreeting = (hour: number) => {
  if (hour < 5) return "It's late night,";
  if (hour < 12) return "Good Morning,";
  if (hour < 17) return "Good Afternoon,";
  if (hour < 21) return "Good Evening,";
  return "It's getting late,";
};

// Shown at the top of every main tab.
export function ProfileHeader() {
  const insets = useSafeAreaInsets();
  const user = useUser();

  // Re-check the time every minute so the greeting changes while the app stays open.
  const [hour, setHour] = useState(new Date().getHours());
  useEffect(() => {
    const timer = setInterval(() => setHour(new Date().getHours()), 60000);
    return () => clearInterval(timer);
  }, []);
  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <View style={[styles.container, { paddingTop: insets.top + sizes.spacing.sm }]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.text}>
        <Text style={styles.greeting}>{getGreeting(hour)}</Text>
        <Text style={styles.name}>{firstName} 👋</Text>
      </View>

      <View style={styles.bell}>
        <Ionicons name="notifications-outline" size={sizes.iconSize.lg} color={colors.textPrimary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: sizes.spacing.sm,
    paddingHorizontal: sizes.spacing.lg,
    paddingBottom: sizes.spacing.sm,
    backgroundColor: colors.background,
  },
  avatar: {
    width: sizes.avatarSmall,
    height: sizes.avatarSmall,
    borderRadius: sizes.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lavenderBackground,
  },
  avatarText: {
    fontSize: sizes.fontSize.lg,
    fontFamily: "InterBold",
    color: colors.primary,
  },
  text: {
    flex: 1,
  },
  greeting: {
    fontSize: sizes.fontSize.xs,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textSecondary,
  },
  name: {
    fontSize: sizes.fontSize.lg,
    fontFamily: "InterBold",
    color: colors.textPrimary,
  },
  bell: {
    width: sizes.avatarSmall,
    height: sizes.avatarSmall,
    borderRadius: sizes.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
});
