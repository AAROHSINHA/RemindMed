import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, subtitle, actionText, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionText ? (
        <Pressable onPress={onAction} accessibilityRole="link">
          <Text style={styles.action}>{actionText}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: sizes.spacing.xs,
  },
  title: {
    fontSize: sizes.fontSize.lg,
    fontFamily: "InterBold",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: sizes.fontSize.xs,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textMuted,
  },
  action: {
    fontSize: sizes.fontSize.sm,
    fontFamily: "InterSemiBold",
    color: colors.primary,
  },
});
