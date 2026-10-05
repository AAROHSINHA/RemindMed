import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { type ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PastelBackground } from '@/components/sharedComponents/pastel-background';
import { colors } from '@/constants/colors';
import { sizes } from '@/constants/sizes';
import { mockUser } from '@/data/mock-user';

type IconName = ComponentProps<typeof Ionicons>['name'];

export default function VerifyScreen() {
  const params = useLocalSearchParams<{ name?: string; email?: string; phone?: string }>();

  const details: { label: string; value: string; icon: IconName }[] = [
    { label: 'Name', value: params.name || mockUser.name, icon: 'person-outline' },
    { label: 'Email', value: params.email || mockUser.email, icon: 'mail-outline' },
    { label: 'Phone', value: params.phone || mockUser.phone, icon: 'call-outline' },
  ];

  const initial = (params.name || mockUser.name).charAt(0).toUpperCase();

  return (
    <PastelBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <Text style={styles.title}>Verify Your Details</Text>
          <Text style={styles.subtitle}>Please confirm your information below.</Text>

          <View style={styles.card}>
            {details.map((item, index) => (
              <View
                key={item.label}
                style={[styles.row, index > 0 && styles.rowDivider]}>
                <View style={styles.iconBox}>
                  <Ionicons name={item.icon} size={sizes.iconSize.md} color={colors.primary} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.rowValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </PastelBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: sizes.spacing.lg,
    gap: sizes.spacing.md,
  },
  avatar: {
    alignSelf: 'center',
    width: sizes.avatarSize,
    height: sizes.avatarSize,
    borderRadius: sizes.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lavenderBackground,
    marginBottom: sizes.spacing.sm,
  },
  avatarText: {
    fontSize: sizes.fontSize.xxl,
    fontWeight: sizes.fontWeight.bold,
    color: colors.primary,
  },
  title: {
    fontSize: sizes.fontSize.xl,
    fontWeight: sizes.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: sizes.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: sizes.spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: sizes.radius.lg,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    paddingHorizontal: sizes.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.spacing.md,
    paddingVertical: sizes.spacing.md,
  },
  rowDivider: {
    borderTopWidth: sizes.borderWidth,
    borderTopColor: colors.border,
  },
  iconBox: {
    width: sizes.iconBoxSize,
    height: sizes.iconBoxSize,
    borderRadius: sizes.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lavenderBackground,
  },
  rowText: {
    flex: 1,
    gap: sizes.spacing.xxs,
  },
  rowLabel: {
    fontSize: sizes.fontSize.xs,
    color: colors.textMuted,
  },
  rowValue: {
    fontSize: sizes.fontSize.md,
    fontWeight: sizes.fontWeight.medium,
    color: colors.textPrimary,
  },
});
