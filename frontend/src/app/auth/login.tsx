import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { InputBox } from "@/components/sharedComponents/input-box";
import { loginUser } from "@/api/auth";
import type { ApiError } from "@/api/env";
import Loader from "@/components/sharedComponents/loader";
import { MainButton } from "@/components/sharedComponents/main-button";
import { PastelBackground } from "@/components/sharedComponents/pastel-background";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // set true around the login API call
  const keyboardVisible = useKeyboardVisible();

  const [formError, setFormError] = useState("");

  const handleLogin = async () => {
    setFormError("");
    if (!identifier.trim() || !password) {
      setFormError("Enter your email or phone and password.");
      return;
    }
    setLoading(true);
    try {
      await loginUser({ identifier: identifier.trim(), password });
      router.replace("/main/home");
    } catch (e) {
      setFormError((e as ApiError).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PastelBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {!keyboardVisible && (
              <View>
                <Text style={styles.logo}>RemindMed!</Text>
                <Text style={styles.heroTitle}>
                  Your Daily <Text style={styles.heroBold}>Health </Text>
                  <Text style={styles.heroAccent}>Partner</Text>
                </Text>
                {/* <Text style={styles.heroSubtitle}>
                  Scan. Track. Stay Healthy.
                </Text> */}
              </View>
            )}

            <View style={styles.form}>
              <InputBox
                placeholder="Email or Mobile Number"
                autoCapitalize="none"
                keyboardType="email-address"
                value={identifier}
                onChangeText={setIdentifier}
                icon={
                  <Ionicons
                    name="person-outline"
                    size={sizes.iconSize.md}
                    color={colors.textMuted}
                  />
                }
              />
              <InputBox
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                icon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={sizes.iconSize.md}
                    color={colors.textMuted}
                  />
                }
                rightElement={
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={sizes.iconSize.md}
                      color={colors.textMuted}
                    />
                  </Pressable>
                }
              />

              <MainButton
                text="Log In"
                onClick={handleLogin}
                style={styles.button}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account?</Text>
              <Pressable
                onPress={() => router.push("/auth/signup")}
                accessibilityRole="link"
              >
                <Text style={styles.footerLink}>Sign Up</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Loader visible={loading} />
    </PastelBackground>
  );
}

const styles = StyleSheet.create({
  formError: {
    fontSize: sizes.fontSize.sm,
    fontFamily: "InterMedium",
    color: colors.error,
    textAlign: "center",
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: sizes.spacing.lg,
    paddingVertical: sizes.spacing.xl,
    gap: sizes.spacing.xl,
  },
  // hero: {
  //   gap: sizes.spacing.xs,
  // },
  logo: {
    fontSize: sizes.fontSize.xxl,
    fontFamily: "InterExtraBold",
    color: colors.primary,
    // marginBottom: sizes.spacing.md,
  },
  heroTitle: {
    fontSize: sizes.fontSize.sm,
    // lineHeight: sizes.fontSize.xxl * 1.25,
    fontFamily: "JetBrainsMonoBold",
    color: colors.textMuted,
  },
  heroBold: {
    fontFamily: "InterBold",
    color: colors.textPrimary,
  },
  heroAccent: {
    fontFamily: "InterBold",
    color: colors.coral,
  },
  heroSubtitle: {
    fontSize: sizes.fontSize.sm,
    fontFamily: "InterMedium",
    color: colors.textSecondary,
  },
  form: {
    gap: sizes.spacing.md,
  },
  button: {
    marginTop: sizes.spacing.xs,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: sizes.spacing.xxs,
  },
  footerText: {
    fontSize: sizes.fontSize.sm,
    fontFamily: "InterMedium",
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: sizes.fontSize.sm,
    fontFamily: "JetBrainsMonoBold",
    color: colors.primary,
  },
});
