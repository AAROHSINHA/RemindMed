import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

// Opens the camera, lets the user take one photo, and returns its local uri (null if cancelled).
export async function scanPrescription(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      "Camera permission needed",
      "Allow camera access to scan your prescription.",
    );
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
  return result.canceled ? null : result.assets[0].uri;
}
