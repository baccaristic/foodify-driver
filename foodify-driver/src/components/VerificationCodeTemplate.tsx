import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';

interface VerificationCodeTemplateProps {
  contact: string;
  resendMethod: 'Email' | 'SMS';
  onResendPress: () => void | Promise<void>;
  onSubmit?: (code: string) => void | Promise<void>;
  codeLength?: number;
  nextScreen?: string;
  isSubmitting?: boolean;
  isResendDisabled?: boolean;
  resendButtonLabel?: string;
  errorMessage?: string | null;
  helperMessage?: string | null;
  onClearError?: () => void;
}

const VerificationCodeTemplate: React.FC<VerificationCodeTemplateProps> = ({
  contact,
  resendMethod,
  onResendPress,
  onSubmit,
  codeLength = 6,
  nextScreen,
  isSubmitting = false,
  isResendDisabled = false,
  resendButtonLabel,
  errorMessage,
  helperMessage,
  onClearError,
}) => {
  const navigation = useNavigation();
  const [code, setCode] = useState<string[]>(() => Array(codeLength).fill(''));

  useEffect(() => {
    setCode(Array(codeLength).fill(''));
  }, [codeLength]);

  const inputRefs = useMemo(
    () => Array.from({ length: codeLength }, () => React.createRef<TextInput>()),
    [codeLength]
  );

  const isFormValid = code.every((digit) => digit.length === 1);
  const hasError = Boolean(errorMessage);

  const handlePress = () => {
    navigation.goBack();
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text.slice(0, 1);
    setCode(newCode);
    onClearError?.();

    if (text.length === 1 && index < codeLength - 1) {
      inputRefs[index + 1].current?.focus();
    } else if (text.length === 0 && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleContinue = async () => {
    if (!isFormValid || isSubmitting) return;

    if (onSubmit) {
      await onSubmit(code.join(''));
      return;
    }

    if (nextScreen) {
      navigation.navigate(nextScreen as never);
    }
  };

  const handleResend = async () => {
    if (isResendDisabled || isSubmitting) return;
    await onResendPress();
  };

  const resolvedResendLabel = resendButtonLabel ?? `Resend the code via ${resendMethod}`;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handlePress}>
              <ArrowLeft color="#CA251B" size={38} />
            </TouchableOpacity>
          </View>

          <Text allowFontScaling={false} style={styles.title}>
            Enter the {codeLength}-digit code sent to you at
            <Text style={styles.contactText}> {contact}</Text>
          </Text>

          <View style={styles.codeRow}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                style={[
                  styles.codeInput,
                  hasError
                    ? styles.inputError
                    : digit
                    ? styles.inputActive
                    : styles.inputDefault,
                ]}
                onChangeText={(text) => handleCodeChange(text, index)}
                value={digit}
                keyboardType="number-pad"
                maxLength={1}
                autoFocus={index === 0 && code[0] === ''}
                editable={!isSubmitting}
              />
            ))}
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : helperMessage ? (
            <Text style={styles.helperText}>{helperMessage}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.continueButton, isFormValid && !isSubmitting ? styles.continueActive : styles.continueDisabled]}
            onPress={handleContinue}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text allowFontScaling={false} style={styles.continueLabel}>
                Continue
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResend}
            disabled={isResendDisabled || isSubmitting}
          >
            <Text allowFontScaling={false} style={styles.resendLabel}>
              {resolvedResendLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default VerificationCodeTemplate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  inner: {
    flex: 1,
    padding: 24,
  },
  backButtonContainer: {
    marginBottom: 48,
    paddingTop: 24,
  },
  backButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#CA251B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 40,
  },
  contactText: {
    fontWeight: '700',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  codeInput: {
    width: 64,
    height: 64,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    borderRadius: 10,
    borderWidth: 2,
  },
  inputDefault: {
    borderColor: '#D1D5DB',
    color: '#000000',
  },
  inputActive: {
    borderColor: '#CA251B',
    color: '#CA251B',
  },
  inputError: {
    borderColor: '#EF4444',
    color: '#EF4444',
  },
  errorText: {
    textAlign: 'center',
    color: '#EF4444',
    fontWeight: '600',
    marginBottom: 16,
  },
  helperText: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  continueActive: {
    backgroundColor: '#17213A',
  },
  continueDisabled: {
    backgroundColor: '#9CA3AF',
  },
  continueLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  resendButton: {
    width: '100%',
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#17213A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendLabel: {
    color: '#17213A',
    fontSize: 18,
    fontWeight: '600',
  },
});
