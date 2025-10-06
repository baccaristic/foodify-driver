import React from 'react';
import type { BlurViewProps } from 'expo-blur';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';

type PlatformBlurViewProps = React.PropsWithChildren<BlurViewProps>;

const fallbackColors: Record<string, string> = {
  default: 'rgba(15, 23, 42, 0.35)',
  dark: 'rgba(15, 23, 42, 0.55)',
  light: 'rgba(255, 255, 255, 0.75)',
  extraLight: 'rgba(255, 255, 255, 0.82)',
  prominent: 'rgba(15, 23, 42, 0.6)',
};

export const PlatformBlurView: React.FC<PlatformBlurViewProps> = ({
  children,
  tint = 'default',
  intensity = 50,
  style,
  experimentalBlurMethod,
  ...viewProps
}) => {
  if (Platform.OS === 'android') {
    const fallbackTint = tint ?? 'default';
    const backgroundColor = fallbackColors[fallbackTint] ?? fallbackColors.default;

    return (
      <View {...viewProps} style={[styles.fallback, { backgroundColor }, style]}>
        {children}
      </View>
    );
  }

  return (
    <BlurView
      {...viewProps}
      tint={tint}
      intensity={intensity}
      experimentalBlurMethod={experimentalBlurMethod}
      style={style}
    >
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  fallback: {
    overflow: 'hidden',
  },
});
