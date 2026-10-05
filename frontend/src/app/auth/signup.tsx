import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InputBox } from '@/components/sharedComponents/input-box';
import { MainButton } from '@/components/sharedComponents/main-button';
import { PastelBackground } from '@/components/sharedComponents/pastel-background';
import { colors } from '@/constants/colors';
import { sizes } from '@/constants/sizes';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = () => {
    router.replace({
      pathname: '/verify',
      params: { name: fullName, email, phone },
    });
  };

  return (
    <PastelBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled">
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backButton}>
              <Ionicons
                name="chevron-back"
                size={sizes.iconSize.lg}
                color={colors.textPrimary}
              />
            </Pressable>

            <View style={styles.hero}>
              <Text style={styles.logo}>remindMe</Text>
              <Text style={styles.title}>Create Your Account</Text>
              <Text style={styles.subtitle}>
                Take control of your health, one medication at a time.
              </Text>
            </View>

            <View style={styles.form}>
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
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={sizes.iconSize.md}
                      color={colors.textMuted}
                    />
                  </Pressable>
                }
              />

              <MainButton text="Sign Up" onClick={handleSignUp} style={styles.button} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Pressable onPress={() => router.replace('/auth/login')} accessibilityRole="link">
                <Text style={styles.footerLink}>Log In</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    alignSelf: 'flex-start',
    justifyContent: 'center',
    height: sizes.buttonHeight,
    width: sizes.buttonHeight,
  },
  hero: {
    gap: sizes.spacing.xs,
  },
  logo: {
    fontSize: sizes.fontSize.lg,
    fontWeight: sizes.fontWeight.extrabold,
    color: colors.primary,
    marginBottom: sizes.spacing.md,
  },
  title: {
    fontSize: sizes.fontSize.xl,
    fontWeight: sizes.fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: sizes.fontSize.sm,
    lineHeight: sizes.fontSize.sm * 1.5,
    color: colors.textSecondary,
  },
  form: {
    gap: sizes.spacing.md,
  },
  button: {
    marginTop: sizes.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
