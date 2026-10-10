import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MainButton } from "@/components/sharedComponents/main-button";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";

// Placeholder: prints the OCR text returned by the backend, or the error.
export default function OcrResultScreen() {
  const { text, message, error } = useLocalSearchParams<{
    text?: string;
    message?: string;
    error?: string;
  }>();
  const failed = Boolean(error);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name={failed ? "alert-circle" : "checkmark-circle"}
          size={sizes.avatarSize / 1.5}
          color={failed ? colors.error : colors.success}
        />
        <Text style={styles.title}>{failed ? "Something went wrong" : "Prescription scanned"}</Text>
        {!failed && message ? <Text style={styles.message}>{message}</Text> : null}
      </View>

      <ScrollView style={styles.card} contentContainerStyle={styles.cardContent}>
        <Text style={[styles.body, failed && styles.error]}>
          {failed ? error : text || "No text detected in the image."}
        </Text>
      </ScrollView>

      <MainButton text="Done" onClick={() => router.replace("/main/home")} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: sizes.spacing.md,
    padding: sizes.spacing.lg,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: "center",
    gap: sizes.spacing.xs,
  },
  title: {
    fontSize: sizes.fontSize.xl,
    fontFamily: "InterBold",
    color: colors.textPrimary,
  },
  message: {
    fontSize: sizes.fontSize.sm,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textSecondary,
  },
  card: {
    flex: 1,
    borderRadius: sizes.radius.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardContent: {
    padding: sizes.spacing.md,
  },
  body: {
    fontSize: sizes.fontSize.sm,
    lineHeight: sizes.fontSize.sm * 1.6,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textPrimary,
  },
  error: {
    color: colors.error,
  },
});
