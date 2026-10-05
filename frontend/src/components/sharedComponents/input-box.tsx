import { type ReactNode } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

export type InputBoxProps = TextInputProps & {
  icon?: ReactNode;
  rightElement?: ReactNode;
};

export function InputBox({
  icon,
  rightElement,
  style,
  ...rest
}: InputBoxProps) {
  return (
    <View style={styles.container}>
      {icon}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        {...rest}
      />
      {rightElement}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: sizes.inputHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: sizes.spacing.sm,
    paddingHorizontal: sizes.spacing.md,
    borderRadius: sizes.radius.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: sizes.fontSize.sm,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textPrimary,
  },
});
