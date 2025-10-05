import React from 'react';
import { Text, View } from 'react-native';

export const Logo: React.FC = () => {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text
        style={{
          color: '#9ca3af',
          fontSize: 14,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        another logo for the driver
      </Text>
      <Text
        style={{
          fontSize: 40,
          fontWeight: '800',
          color: '#ef4444',
          marginTop: 4,
          letterSpacing: 1.2,
        }}
      >
        Foodify
      </Text>
    </View>
  );
};
