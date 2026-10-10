import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

type LabeledInputProps = TextInputProps & {
  label: string;
};

// Small label + bordered input. Tapping the box edits the value.
export function LabeledInput({ label, style, ...rest }: LabeledInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: sizes.spacing.xxs,
  },
  label: {
    fontSize: sizes.fontSize.xs,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textMuted,
  },
  input: {
    height: sizes.fieldHeight,
    paddingHorizontal: sizes.spacing.sm,
    borderRadius: sizes.radius.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    fontSize: sizes.fontSize.sm,
    fontFamily: "InterMedium",
    color: colors.textPrimary,
  },
});
