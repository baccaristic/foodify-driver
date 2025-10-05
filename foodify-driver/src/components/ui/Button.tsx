import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export const Button: React.FC<ButtonProps> = ({ label, onPress, disabled, style, labelStyle }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        disabled ? styles.buttonDisabled : styles.buttonEnabled,
        style,
      ]}
    >
      <Text allowFontScaling={false} style={[styles.label, labelStyle]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: verticalScale(18),
    borderRadius: moderateScale(16),
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#17213A',
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 0, height: verticalScale(10) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(20),
    elevation: moderateScale(8),
  },
  buttonDisabled: {
    backgroundColor: '#D9D9D9',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  label: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontWeight: '700',
    letterSpacing: moderateScale(0.5),
  },
});
