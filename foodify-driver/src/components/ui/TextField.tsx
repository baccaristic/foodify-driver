import React from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

type TextFieldProps = TextInputProps & {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  error?: string;
};

export const TextField: React.FC<TextFieldProps> = ({ label, containerStyle, error, style, ...props }) => {
  return (
    <View style={containerStyle}>
      {label ? (
        <Text allowFontScaling={false} style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
        <TextInput
          allowFontScaling={false}
          placeholderTextColor="#9ca3af"
          style={[styles.input, style]}
          {...props}
        />
      </View>

      {error ? (
        <Text allowFontScaling={false} style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: moderateScale(13),
    color: '#475569',
    marginBottom: verticalScale(6),
    letterSpacing: moderateScale(0.2),
    fontWeight: '600',
  },
  inputWrapper: {
    backgroundColor: 'rgba(241, 245, 249, 0.92)',
    borderRadius: moderateScale(18),
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.45)',
    shadowColor: 'rgba(15, 23, 42, 0.1)',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(12),
    elevation: moderateScale(3),
  },
  inputWrapperError: {
    borderColor: '#ef4444',
  },
  input: {
    fontSize: moderateScale(16),
    color: '#0F172A',
    fontWeight: '600',
  },
  error: {
    color: '#ef4444',
    marginTop: verticalScale(6),
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
});
