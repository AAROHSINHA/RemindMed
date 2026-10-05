import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { sizes } from '@/constants/sizes';

const LANDING_DURATION_MS = 3000;

export default function LandingScreen() {
  useEffect(() => {
    // Future: check auth state here before choosing the next route.
    const timer = setTimeout(() => {
      router.replace('/auth/login');
    }, LANDING_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RemindMed!</Text>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: sizes.fontSize.xxl,
    fontWeight: sizes.fontWeight.extrabold,
    color: colors.primary,
  },
});
