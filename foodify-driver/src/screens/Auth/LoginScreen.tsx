import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
              <Text style={styles.welcome}>WELCOME BACK, RIDER</Text>
              <Text style={styles.subtext}>Let&apos;s get on the road</Text>
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
          <View style={[styles.decorativeIcon, { top: 60, left: 24 }]} />
          <View style={[styles.decorativeIcon, { top: 120, right: 40, width: 32, height: 32 }]} />
          <View style={[styles.decorativeIcon, { bottom: 100, left: 60, width: 36, height: 36 }]} />
          <View style={[styles.decorativeIcon, { bottom: 40, right: 24, width: 28, height: 28 }]} />
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
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  avoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 36,
  },
  logoWrapper: {
    alignItems: 'center',
  },
  headlineWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  welcome: {
    fontSize: 18,
    color: '#11203c',
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  input: {
    marginTop: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fde68a',
    opacity: 0.35,
  },
});
