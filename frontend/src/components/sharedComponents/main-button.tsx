import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

export type MainButtonProps = {
  bgColor?: string;
  textColor?: string;
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function MainButton({
  bgColor = colors.primary,
  textColor = colors.white,
  text,
  onClick,
  disabled = false,
  style,
}: MainButtonProps) {
  return (
    <Pressable
      onPress={onClick}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgColor,
          opacity: disabled
            ? sizes.opacity.disabled
            : pressed
              ? sizes.opacity.pressed
              : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: sizes.buttonHeight,
    borderRadius: sizes.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: sizes.fontSize.md,
    fontFamily: "InterBold",
  },
});
