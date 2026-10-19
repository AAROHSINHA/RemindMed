import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfileHeader } from "@/components/main/profile-header";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";
import { UserProvider } from "@/hooks/use-user";
import { getReminderMode, startInAppReminderEngine } from "@/services/reminders";

export default function MainLayout() {
  const insets = useSafeAreaInsets();

  // Only when OS notifications can't be loaded: check reminders while the app is open.
  useEffect(() => {
    if (getReminderMode() === "system") return;
    return startInAppReminderEngine();
  }, []);

  return (
    <UserProvider>
      <Tabs
        screenOptions={{
          header: () => <ProfileHeader />,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: sizes.fontSize.xs - 2,
            fontFamily: "JetBrainsMonoMedium",
          },
          tabBarStyle: {
            height: sizes.tabBarHeight + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: sizes.spacing.xs,
            backgroundColor: colors.surface,
            borderTopWidth: 0,
            borderTopLeftRadius: sizes.radius.lg,
            borderTopRightRadius: sizes.radius.lg,
            shadowColor: colors.primary,
            shadowOpacity: sizes.shadow.opacity,
            shadowRadius: sizes.shadow.radius,
            elevation: sizes.shadow.elevation,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={sizes.iconSize.lg} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="medications"
          options={{
            title: "Medications",
            tabBarIcon: ({ color }) => (
              <Ionicons name="medkit-outline" size={sizes.iconSize.lg} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false, // the profile page has its own purple banner
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={sizes.iconSize.lg} color={color} />
            ),
          }}
        />
      </Tabs>
    </UserProvider>
  );
}
