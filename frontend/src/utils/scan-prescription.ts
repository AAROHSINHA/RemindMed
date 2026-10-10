import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Alert } from "react-native";

import { setPendingImage } from "@/utils/pending-image";

// Opens the camera, lets the user take one photo, then opens the processing screen which uploads it.
export async function scanPrescription(): Promise<void> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      "Camera permission needed",
      "Allow camera access to scan your prescription.",
    );
    return;
  }

  const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
  if (result.canceled) {
    console.log("[SCAN] camera cancelled");
    return;
  }

  const asset = result.assets[0];
  console.log("[SCAN] photo captured, opening processing screen:", asset.uri);
  setPendingImage({
    uri: asset.uri,
    fileName: asset.fileName ?? "prescription.jpg",
    mimeType: asset.mimeType ?? "image/jpeg",
  });
  router.push("/processing");
}
