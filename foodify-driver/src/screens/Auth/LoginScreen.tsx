import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { isAxiosError } from 'axios';

import { Logo } from '../../components/Logo';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { loginDriver } from '../../services/authService';

export const LoginScreen: React.FC = () => {
  const { authenticate } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = useMemo(() => {
    const trimmedEmail = email.trim();
    return trimmedEmail.length > 0 && password.length > 0;
  }, [email, password]);

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
          <Logo />
          <Text allowFontScaling={false} style={styles.title}>
            Driver sign in
          </Text>
          <Text allowFontScaling={false} style={styles.subtitle}>
            Use your Foodify driver email and password to access your deliveries.
          </Text>
        </View>

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
            containerStyle={styles.passwordField}
            onSubmitEditing={handleSubmit}
          />

          {error ? (
            <Text allowFontScaling={false} style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Button
            label={isSubmitting ? 'Signing in…' : 'Sign in'}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            style={styles.submitButton}
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
    paddingVertical: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    marginTop: 24,
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 20,
    color: '#475569',
    textAlign: 'center',
  },
  form: {
    gap: 18,
  },
  passwordField: {
    marginTop: -6,
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
