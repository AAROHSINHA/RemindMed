import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '@/constants/colors';
import { sizes } from '@/constants/sizes';

export function PastelBackground({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.container, style]} {...rest}>
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  blob: {
    position: 'absolute',
    width: sizes.decorativeBlob,
    height: sizes.decorativeBlob,
    borderRadius: sizes.radius.pill,
  },
  blobTop: {
    top: -sizes.decorativeBlob / 3,
    right: -sizes.decorativeBlob / 3,
    backgroundColor: colors.lavenderBackground,
  },
  blobBottom: {
    bottom: -sizes.decorativeBlob / 3,
    left: -sizes.decorativeBlob / 3,
    backgroundColor: colors.peachBackground,
  },
});
