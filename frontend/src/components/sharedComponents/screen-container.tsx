import { ScrollView, StyleSheet, type ScrollViewProps } from "react-native";

import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

export function ScreenContainer({ children, ...rest }: ScrollViewProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: sizes.spacing.lg,
    gap: sizes.spacing.md,
  },
});
