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

    // Run the auth check while the minimum landing time elapses.
    const authCheck = checkAuth().then(
      () => true,
      () => false,
    );
    const minDelay = new Promise((resolve) =>
      setTimeout(resolve, LANDING_DURATION_MS),
    );

    Promise.all([authCheck, minDelay]).then(([isAuthenticated]) => {
      if (active) router.replace(isAuthenticated ? "/main/home" : "/auth/login");
    });

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
