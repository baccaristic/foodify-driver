import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { isAxiosError } from 'axios';

import { Logo } from '../../components/Logo';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { loginDriver } from '../../services/authService';
import { Image } from 'expo-image';
import { moderateScale } from 'react-native-size-matters';
import { verticalScale } from 'react-native-size-matters';
import { LinearGradient } from 'expo-linear-gradient';

export const LoginScreen: React.FC = () => {
  const { authenticate } = useAuth();
  const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const isFormValid = useMemo(() => {
    const trimmedEmail = email.trim();
    return trimmedEmail.length > 0 && password.length > 0;
  }, [email, password]);

  const handleContinue =() => {

  }

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !isFormValid) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await loginDriver(normalizedEmail, password);
      authenticate(response);
    } catch (err: unknown) {
      let message = 'Unable to sign in. Please try again.';

      if (isAxiosError(err)) {
        const apiMessage = err.response?.data?.message;

        if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
          message = apiMessage;
        } else if (err.code === 'ECONNABORTED') {
          message = 'Request timed out. Check your connection and try again.';
        }
      }

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [authenticate, email, password, isFormValid, isSubmitting]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.icon}
            contentFit="contain"
          />
          <Text allowFontScaling={false} style={styles.title}>
            Welcome , Ready To Start ?
          </Text>
          <Text allowFontScaling={false} style={styles.subtitle}>
            Let's get on the road
          </Text>
        </View>
        
        <TextInput
            placeholder="Your Number eg.98765432"
            placeholderTextColor="gray"
            keyboardType="phone-pad"
            returnKeyType="done"
            value={phoneNumber}
            onChangeText={(value) => {
              setPhoneNumber(value);
              setError(null);
            }}
            onSubmitEditing={handleContinue}
            editable={!isSubmitting}
          />

        <View style={styles.form}>
          <TextField
            label="Email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            value={email}
            onChangeText={setEmail}
            returnKeyType="next"
            placeholder="driver@foodify.com"
          />

          <TextField
            label="Password"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            textContentType="password"
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
            placeholder="Enter your password"
            onSubmitEditing={handleSubmit}
          />

          {error ? (
            <Text allowFontScaling={false} style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Button
            label={isSubmitting ? 'Signing in…' : 'Continue'}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            style={styles.submitButton}
          />
        </View>
          <View style={{ width: '100%' }}>
          <Image
            source={require('../../../assets/background.png')}
            style={{ width: '100%', height: '40%' }} // Adjust height as needed to match design
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)']} // White at top, transparent at bottom
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: '100%' }} // Match image height
          />
        </View>
      </View>
     
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  icon: {
    width: moderateScale(100),
    height: verticalScale(60),
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    marginTop: 24,
    fontSize: moderateScale(26),
    fontWeight: '600',
    color: '#17213A',
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 12,
    fontSize: moderateScale(24),
    lineHeight: 20,
    color: '#17213A',
    textAlign: 'center',
  },

  form: {
    paddingHorizontal: moderateScale(5),
    marginBottom: verticalScale(20),
  },

  error: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 12,

  },
});
