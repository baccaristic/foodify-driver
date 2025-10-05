import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

import { Logo } from '../../components/Logo';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useAuth } from '../../contexts/AuthContext';

export const LoginScreen: React.FC = () => {
  const { phoneNumber, setPhoneNumber, authenticate } = useAuth();

  const isValidNumber = useMemo(() => phoneNumber.trim().length >= 8, [phoneNumber]);

  const handleContinue = () => {
    if (!isValidNumber) {
      return;
    }

    // This is a placeholder token for the static experience.
    authenticate(phoneNumber, 'demo-token');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: undefined })}
          style={styles.avoidingView}
        >
          <View style={styles.content}>
            <View style={styles.logoWrapper}>
              <Logo />
            </View>

            <View style={styles.headlineWrapper}>
              <Text allowFontScaling={false} style={styles.welcome}>
                WELCOME BACK, RIDER
              </Text>
              <Text allowFontScaling={false} style={styles.subtext}>
                Let&apos;s get on the road
              </Text>
            </View>

            <TextField
              placeholder="Your Number eg.98765432"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              autoCapitalize="none"
              containerStyle={styles.input}
            />

            <Button label="Continue" onPress={handleContinue} disabled={!isValidNumber} />
          </View>
        </KeyboardAvoidingView>
        <View style={styles.decorativeWrapper} pointerEvents="none">
          <View style={[styles.decorativeIcon, styles.decorativeIconTopLeft]} />
          <View style={[styles.decorativeIcon, styles.decorativeIconTopRight]} />
          <View style={[styles.decorativeIcon, styles.decorativeIconBottomLeft]} />
          <View style={[styles.decorativeIcon, styles.decorativeIconBottomRight]} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  background: {
    flex: 1,
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(48),
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  avoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: verticalScale(36),
  },
  logoWrapper: {
    alignItems: 'center',
  },
  headlineWrapper: {
    alignItems: 'center',
    gap: verticalScale(8),
  },
  welcome: {
    fontSize: moderateScale(18),
    color: '#11203c',
    fontWeight: '700',
    letterSpacing: moderateScale(1),
  },
  subtext: {
    fontSize: moderateScale(14),
    color: '#6b7280',
  },
  input: {
    marginTop: verticalScale(16),
  },
  decorativeWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  decorativeIcon: {
    position: 'absolute',
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#fde68a',
    opacity: 0.35,
  },
  decorativeIconTopLeft: {
    top: verticalScale(60),
    left: moderateScale(24),
  },
  decorativeIconTopRight: {
    top: verticalScale(120),
    right: moderateScale(40),
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
  },
  decorativeIconBottomLeft: {
    bottom: verticalScale(100),
    left: moderateScale(60),
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
  },
  decorativeIconBottomRight: {
    bottom: verticalScale(40),
    right: moderateScale(24),
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
  },
});
