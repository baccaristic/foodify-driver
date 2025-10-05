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
          backgroundColor: disabled ? '#9ca3af' : '#11203c',
          paddingVertical: 18,
          borderRadius: 16,
          alignItems: 'center',
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
