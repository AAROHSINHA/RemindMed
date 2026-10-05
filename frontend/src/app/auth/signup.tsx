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

import { loginUser, signupUser, type SignupPayload } from "@/api/auth";
import type { ApiError } from "@/api/env";
import { InputBox } from "@/components/sharedComponents/input-box";
import Loader from "@/components/sharedComponents/loader";
import { MainButton } from "@/components/sharedComponents/main-button";
import { PastelBackground } from "@/components/sharedComponents/pastel-background";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

export default function SignUpScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const keyboardVisible = useKeyboardVisible();

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (fullName.trim().length < 2) {
      errors.username = "Enter your full name.";
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!/^\+?[0-9]{7,15}$/.test(phone.trim())) {
      errors.phone = "Enter a valid phone number (7-15 digits).";
    }

    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    return errors;
  };

  const handleSignUp = async () => {
    setFormError("");

    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload: SignupPayload = {
      username: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    };

    setLoading(true);

    try {
      await signupUser(payload);
      await loginUser({
        identifier: payload.email,
        password: payload.password,
      });
      router.replace("/home");
      console.log("SIGNUP SUCCESFUL");
    } catch (e) {
      console.log("ERROR IN SIGNUP - ", e);
      const err = e as ApiError;

      setFormError(err.message);
      setFieldErrors(err.fieldErrors ?? {});
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
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back"
                size={sizes.iconSize.lg}
                color={colors.textPrimary}
              />
            </Pressable>

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
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <InputBox
                  placeholder="Full Name"
                  autoCapitalize="words"
                  value={fullName}
                  onChangeText={setFullName}
                  icon={
                    <Ionicons
                      name="person-outline"
                      size={sizes.iconSize.md}
                      color={colors.textMuted}
                    />
                  }
                />

                {fieldErrors.username ? (
                  <Text style={styles.fieldError}>{fieldErrors.username}</Text>
                ) : null}
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <InputBox
                  placeholder="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  icon={
                    <Ionicons
                      name="mail-outline"
                      size={sizes.iconSize.md}
                      color={colors.textMuted}
                    />
                  }
                />

                {fieldErrors.email ? (
                  <Text style={styles.fieldError}>{fieldErrors.email}</Text>
                ) : null}
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <InputBox
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  icon={
                    <Ionicons
                      name="call-outline"
                      size={sizes.iconSize.md}
                      color={colors.textMuted}
                    />
                  }
                />

                {fieldErrors.phone ? (
                  <Text style={styles.fieldError}>{fieldErrors.phone}</Text>
                ) : null}
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
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

                {fieldErrors.password ? (
                  <Text style={styles.fieldError}>{fieldErrors.password}</Text>
                ) : null}
              </View>

              {formError ? (
                <Text style={styles.formError}>{formError}</Text>
              ) : null}

              <MainButton
                text={loading ? "Creating account..." : "Sign Up"}
                onClick={handleSignUp}
                disabled={loading}
                style={styles.button}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>

              <Pressable
                onPress={() => router.replace("/auth/login")}
                accessibilityRole="link"
              >
                <Text style={styles.footerLink}>Log In</Text>
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
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: sizes.spacing.lg,
    paddingVertical: sizes.spacing.md,
    gap: sizes.spacing.xl,
  },

  backButton: {
    alignSelf: "flex-start",
    justifyContent: "center",
    height: sizes.buttonHeight,
    width: sizes.buttonHeight,
  },

  hero: {
    gap: sizes.spacing.xs,
  },

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

  inputGroup: {
    gap: sizes.spacing.xs,
  },

  fieldError: {
    fontSize: sizes.fontSize.xs,
    color: colors.error,
    marginLeft: sizes.spacing.xs,
  },

  formError: {
    fontSize: sizes.fontSize.sm,
    color: colors.error,
    textAlign: "center",
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
    color: colors.textSecondary,
  },

  footerLink: {
    fontSize: sizes.fontSize.sm,
    fontWeight: sizes.fontWeight.semibold,
    color: colors.primary,
  },
});
