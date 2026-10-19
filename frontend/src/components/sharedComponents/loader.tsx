import React from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";

interface LoaderProps {
  visible: boolean;
}

// Rendered in a Modal so it covers the whole screen, including headers and the tab bar,
// no matter where on the page <Loader /> is placed. It also blocks taps while loading.
const Loader: React.FC<LoaderProps> = ({ visible }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}} // ignore the Android back button while loading
    >
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)", // translucent
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Loader;
