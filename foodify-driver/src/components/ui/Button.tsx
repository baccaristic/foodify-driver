import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export const Button: React.FC<ButtonProps> = ({ label, onPress, disabled, style, labelStyle }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      speed: 18,
      bounciness: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    if (disabled) {
      return;
    }

    animateTo(0.97);
  };

  const handlePressOut = () => {
    animateTo(1);
  };

  const pressableStyle = ({ pressed }: PressableStateCallbackType) => [
    styles.pressable,
    style,
    pressed && !disabled ? styles.pressed : null,
  ];

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={pressableStyle}
      android_ripple={{ color: 'rgba(255,255,255,0.14)', borderless: false }}
    >
      <Animated.View
        style={[
          styles.button,
          disabled ? styles.buttonDisabled : styles.buttonEnabled,
          { transform: [{ scale }] },
        ]}
      >
        <Text allowFontScaling={false} style={[styles.label, labelStyle]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    borderRadius: moderateScale(20),
    overflow: 'hidden',
  },
  button: {
    paddingVertical: verticalScale(18),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#111827',
    shadowColor: 'rgba(15, 23, 42, 0.32)',
    shadowOffset: { width: 0, height: verticalScale(10) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(24),
    elevation: moderateScale(10),
  },
  buttonDisabled: {
    backgroundColor: '#CBD5F5',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  pressed: {
    opacity: 0.92,
  },
  label: {
    color: '#F8FAFC',
    fontSize: moderateScale(16),
    fontWeight: '700',
    letterSpacing: moderateScale(0.5),
  },
});
