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
    color: '#6b7280',
    marginBottom: verticalScale(6),
    letterSpacing: moderateScale(0.2),
  },
  inputWrapper: {
    backgroundColor: '#f3f4f6',
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    borderWidth: moderateScale(1),
    borderColor: 'transparent',
  },
  inputWrapperError: {
    borderColor: '#ef4444',
  },
  input: {
    fontSize: moderateScale(16),
    color: '#111827',
  },
  error: {
    color: '#ef4444',
    marginTop: verticalScale(6),
    fontSize: moderateScale(12),
  },
});
