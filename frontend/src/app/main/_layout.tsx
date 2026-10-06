import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfileHeader } from "@/components/main/profile-header";
import { ScanTabButton } from "@/components/main/scan-tab-button";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";
import { UserProvider } from "@/hooks/use-user";

export default function MainLayout() {
  const insets = useSafeAreaInsets();

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
        <Tabs.Screen name="scan" options={{ tabBarButton: () => <ScanTabButton /> }} />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ color }) => (
              <Ionicons name="time-outline" size={sizes.iconSize.lg} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={sizes.iconSize.lg} color={color} />
            ),
          }}
        />
      </Tabs>
    </UserProvider>
  );
}
