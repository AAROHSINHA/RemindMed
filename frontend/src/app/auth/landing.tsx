import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { checkAuth } from "@/api/auth";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

const LANDING_DURATION_MS = 3000;

export default function LandingScreen() {
  useEffect(() => {
    let active = true;

    const verifyAuth = async () => {
      let isAuthenticated = false;
      const startedAt = Date.now();

      try {
        await checkAuth();
        isAuthenticated = true;
      } catch (e) {
        console.log("[AUTH CHECK] not authenticated:", e);
      } finally {
        // Keep the landing screen visible for the minimum duration.
        const remaining = LANDING_DURATION_MS - (Date.now() - startedAt);
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
        if (active) router.replace(isAuthenticated ? "/main/home" : "/auth/login");
      }
    };

    verifyAuth();

    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RemindMed!</Text>
      <ActivityIndicator size="large" color={colors.background} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: sizes.spacing.lg,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: sizes.fontSize.xxl * 1.25,
    fontFamily: "InterExtraBold",
    color: colors.background,
  },
});
