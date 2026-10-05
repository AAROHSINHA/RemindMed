import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getMe, logoutUser, type UserData } from "@/api/auth";
import Loader from "@/components/sharedComponents/loader";
import { MainButton } from "@/components/sharedComponents/main-button";
import { PastelBackground } from "@/components/sharedComponents/pastel-background";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

export default function HomeScreen() {
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch((e) => {
        if (e?.status === 401) router.replace("/auth/login");
        else setError(e?.message ?? "Could not load your profile.");
      });
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/auth/login");
  };

  return (
    <PastelBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome{user ? `, ${user.name}` : ""}!</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {user && (
            <View style={styles.card}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{user.name}</Text>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user.email}</Text>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{user.phone}</Text>
            </View>
          )}
          <MainButton text="Log Out" onClick={handleLogout} />
        </View>
      </SafeAreaView>
      <Loader visible={!user && !error} />
    </PastelBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: sizes.spacing.lg,
    gap: sizes.spacing.md,
  },
  title: {
    fontSize: sizes.fontSize.xl,
    fontFamily: "InterBold",
    color: colors.textPrimary,
    textAlign: "center",
  },
  error: { color: colors.error, textAlign: "center", fontSize: sizes.fontSize.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: sizes.radius.lg,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    padding: sizes.spacing.lg,
    gap: sizes.spacing.xxs,
  },
  label: { fontSize: sizes.fontSize.xs, color: colors.textMuted, marginTop: sizes.spacing.sm },
  value: {
    fontSize: sizes.fontSize.md,
    fontFamily: "InterMedium",
    color: colors.textPrimary,
  },
});
