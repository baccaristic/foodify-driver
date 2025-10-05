import React from 'react';
import { StyleProp, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

type TextFieldProps = TextInputProps & {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  error?: string;
};

export const TextField: React.FC<TextFieldProps> = ({ label, containerStyle, error, style, ...props }) => {
  return (
    <View style={containerStyle}>
      {label ? (
        <Text
          style={{
            fontSize: 13,
            color: '#6b7280',
            marginBottom: 6,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={{
          backgroundColor: '#f3f4f6',
          borderRadius: 16,
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderWidth: 1,
          borderColor: error ? '#ef4444' : 'transparent',
        }}
      >
        <TextInput
          placeholderTextColor="#9ca3af"
          style={[
            {
              fontSize: 16,
              color: '#111827',
            },
            style,
          ]}
          {...props}
        />
      </View>

      {error ? (
        <Text
          style={{
            color: '#ef4444',
            marginTop: 6,
            fontSize: 12,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
};
