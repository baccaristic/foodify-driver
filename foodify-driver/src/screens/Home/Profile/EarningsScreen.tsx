import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

export const EarningsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text allowFontScaling={false} style={styles.tagline}>
        another logo for the driver
      </Text>
      <Text allowFontScaling={false} style={styles.wordmark}>
        Foodify
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  tagline: {
    color: '#9ca3af',
    fontSize: moderateScale(14),
    letterSpacing: moderateScale(1),
    textTransform: 'uppercase',
  },
  wordmark: {
    fontSize: moderateScale(40),
    fontWeight: '800',
    color: '#ef4444',
    marginTop: verticalScale(4),
    letterSpacing: moderateScale(1.2),
  },
});
