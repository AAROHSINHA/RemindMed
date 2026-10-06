import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { MainButton } from "@/components/sharedComponents/main-button";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

type ScanCardProps = {
  onScan: () => void;
};

export function ScanCard({ onScan }: ScanCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Scan your prescription</Text>
      <Text style={styles.subtitle}>
        Let AI detect your medicines and set up your schedule.
      </Text>
      <MainButton
        text="Scan Prescription"
        onClick={onScan}
        icon={<Ionicons name="camera" size={sizes.iconSize.lg} color={colors.white} />}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: sizes.spacing.lg,
    gap: sizes.spacing.xs,
    borderRadius: sizes.radius.lg,
    backgroundColor: colors.lavenderBackground,
  },
  title: {
    fontSize: sizes.fontSize.lg,
    fontFamily: "InterBold",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: sizes.fontSize.xs,
    lineHeight: sizes.fontSize.xs * 1.6,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textSecondary,
  },
  button: {
    marginTop: sizes.spacing.sm,
  },
});
