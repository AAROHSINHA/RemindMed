import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ApiError } from "@/api/env";
import { uploadPrescription } from "@/api/ocr";
import { ProcessingLoader } from "@/components/main/processing-loader";
import { ProcessingSteps } from "@/components/main/processing-steps";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";
import { getPendingImage } from "@/utils/pending-image";
import { setScanResult } from "@/utils/scan-result";

// Reassuring messages shown when the scan runs long (seconds elapsed -> message).
const SLOW_MESSAGES = [
  {
    afterSeconds: 120,
    text: "This is taking longer than expected. Hang tight, we're still working on it.",
  },
  {
    afterSeconds: 180,
    text: "Still processing. Detailed prescriptions can take a little longer to analyse.",
  },
  {
    afterSeconds: 240,
    text: "Almost there. Thanks for your patience, we'll have your medicines ready shortly.",
  },
];

// Uploads the captured image, shows progress, then hands the OCR text (or error) to the result screen.
export default function ProcessingScreen() {
  const started = useRef(false);
  const [slowMessage, setSlowMessage] = useState("");

  useEffect(() => {
    const timers = SLOW_MESSAGES.map(({ afterSeconds, text }) =>
      setTimeout(() => setSlowMessage(text), afterSeconds * 1000),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (started.current) return; // effects can run twice in dev: upload only once
    started.current = true;

    const upload = async () => {
      try {
        const image = getPendingImage();
        if (!image)
          throw {
            message: "No photo to upload. Please scan again.",
          } as ApiError;
        console.log("[PROCESSING] screen mounted, uploading:", image.uri);

        const data = await uploadPrescription(image);
        console.log("[OCR RESULT]", data.message, `(${data.pages} page(s))`);
        console.log("[OCR TEXT]\n" + data.text);
        if (data.prescription && data.medications.length > 0) {
          setScanResult({
            prescription: data.prescription,
            medications: data.medications,
            truncated: data.truncated ?? false,
          });
          router.replace("/review-prescription");
          return;
        }
        router.replace({
          pathname: "/ocr-result",
          params: { text: data.text, message: data.message },
        });
      } catch (e) {
        const err = e as ApiError;
        console.log("[PROCESSING] upload failed:", err.message);
        console.log(e);
        router.replace({
          pathname: "/ocr-result",
          params: { error: err.message },
        });
      }
    };

    upload();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProcessingLoader />
        <View style={styles.text}>
          <Text style={styles.title}>Processing Your Prescription</Text>
          <Text style={styles.subtitle}>
            Our AI is reading the details, identifying medicines and dosages.
            This usually takes under a minute...
          </Text>
        </View>
        <ProcessingSteps />
        {slowMessage ? <Text style={styles.slow}>{slowMessage}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: sizes.spacing.xl,
    paddingHorizontal: sizes.spacing.lg,
  },
  text: {
    alignItems: "center",
    gap: sizes.spacing.xs,
  },
  title: {
    fontSize: sizes.fontSize.lg,
    fontFamily: "InterBold",
    color: colors.textPrimary,
    textAlign: "center",
  },
  slow: {
    fontSize: sizes.fontSize.xs,
    lineHeight: sizes.fontSize.xs * 1.8,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: sizes.fontSize.xs,
    lineHeight: sizes.fontSize.xs * 1.8,
    fontFamily: "JetBrainsMonoMedium",
    color: colors.textSecondary,
    textAlign: "center",
  },
});
