import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { moderateScale, verticalScale, s } from 'react-native-size-matters';
import { isAxiosError } from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { loginDriver } from '../../services/authService';

export const LoginScreen: React.FC = () => {
  const { authenticate } = useAuth();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = useMemo(() => {
    return  password.length > 0 && email.trim().length > 0;
  }, [email, password]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await loginDriver(email.trim().toLowerCase(), password);
      authenticate(response);
    } catch (err: unknown) {
      let message = 'Unable to sign in. Please try again.';
      if (isAxiosError(err)) {
        const apiMessage = err.response?.data?.message;
        if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
          message = apiMessage;
        } else if (err.code === 'ECONNABORTED') {
          message = 'Request timed out. Check your connection.';
        }
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [authenticate, email, password, isFormValid, isSubmitting]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.container}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <Text allowFontScaling={false} style={styles.title}>
              WELCOME BACK , RIDER
            </Text>
            <Text allowFontScaling={false} style={styles.subtitle}>
              Let’s get on the road
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              placeholder="Your Number eg.98765432"
              placeholderTextColor="gray"
              keyboardType="phone-pad"
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor="gray"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="gray"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={!isFormValid || isSubmitting}
              style={[
                styles.continueButton,
                { opacity: isFormValid && !isSubmitting ? 1 : 0.7 },
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text allowFontScaling={false} style={styles.continueText}>
                  Continue
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerWrapper}>
            <Image
              source={require('../../../assets/background.png')}
              style={styles.footerImage}
              contentFit="cover"
            />
            <LinearGradient
              colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']}
              style={styles.footerGradient}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: verticalScale(70),
  },
  logo: {
    width: '42%',
    height: verticalScale(90),
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: '#17213A',
    textAlign: 'center',
    marginBottom: verticalScale(6),
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: '#17213A',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  form: {
    paddingHorizontal: s(24),
  },
  input: {
    width: '100%',
    height: verticalScale(46),
    backgroundColor: '#F3F4F6',
    borderRadius: moderateScale(10),
    paddingHorizontal: s(14),
    color: '#17213A',
    marginBottom: verticalScale(12),
  },
  continueButton: {
    width: '100%',
    height: verticalScale(48),
    backgroundColor: '#17213A',
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  continueText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: moderateScale(16),
  },
  error: {
    color: '#CA251B',
    fontWeight: '600',
    fontSize: moderateScale(13),
    textAlign: 'center',
    marginBottom: verticalScale(6),
  },
  footerWrapper: {
    width: '100%',
    height: verticalScale(260), 
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  footerImage: {
    width: '100%',
    height: '100%',
  },
  footerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
});
