import { Stack } from 'expo-router';

import { colors } from '@/constants/colors';

export const unstable_settings = {
  initialRouteName: 'landing',
};

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
