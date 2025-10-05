import React from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

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
        {
          backgroundColor: disabled ? '#D9D9D9' : '#17213A',
          paddingVertical: 18,
          borderRadius: 16,
          alignItems: 'center',
          shadowColor: disabled ? 'transparent' : 'rgba(0,0,0,0.25)',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: disabled ? 0 : 1,
          shadowRadius: disabled ? 0 : 20,
          elevation: disabled ? 0 : 8,
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: '700',
            letterSpacing: 0.5,
          },
          labelStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
