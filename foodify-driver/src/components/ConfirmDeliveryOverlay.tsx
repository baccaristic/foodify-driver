import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { PlatformBlurView } from './PlatformBlurView';
import { X } from 'lucide-react-native';

export interface ConfirmDeliveryOverlayProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (code: string) => void;
}

const CODE_LENGTH = 3;

export const ConfirmDeliveryOverlay: React.FC<ConfirmDeliveryOverlayProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [code, setCode] = useState('');

  useEffect(() => {
    if (!visible) {
      return;
    }

    setCode('');
  }, [visible]);

  const isCodeValid = useMemo(() => /^[0-9]{3}$/.test(code), [code]);

  if (!visible) {
    return null;
  }

  const handleChangeText = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    setCode(numeric);
  };

  const handleSubmit = () => {
    if (!isCodeValid) {
      return;
    }

    onSubmit?.(code);
  };

  return (
    <Modal animationType="fade" transparent visible>
      <View style={StyleSheet.absoluteFill}>
        <PlatformBlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />

        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text allowFontScaling={false} style={styles.title}>
                Confirm delivery
              </Text>

              <TouchableOpacity
                accessibilityLabel="Close confirm delivery"
                accessibilityRole="button"
                activeOpacity={0.85}
                onPress={onClose}
                style={styles.closeButton}
              >
                <X color="#0F172A" size={moderateScale(18)} />
              </TouchableOpacity>
            </View>

            <Text allowFontScaling={false} style={styles.subtitle}>
              Enter the 3-digit confirmation code shared by the customer to
              complete the delivery.
            </Text>

            <View style={styles.inputWrapper}>
              <TextInput
                allowFontScaling={false}
                style={styles.input}
                keyboardType="number-pad"
                maxLength={CODE_LENGTH}
                onChangeText={handleChangeText}
                value={code}
                placeholder="000"
                placeholderTextColor="#9CA3AF"
                textAlign="center"
                autoFocus
              />
            </View>

            <TouchableOpacity
              accessibilityLabel="Submit delivery confirmation code"
              accessibilityRole="button"
              activeOpacity={0.85}
              disabled={!isCodeValid}
              onPress={handleSubmit}
              style={[styles.submitButton, !isCodeValid && styles.submitButtonDisabled]}
            >
              <Text allowFontScaling={false} style={styles.submitLabel}>
                Confirm delivery
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  card: {
    width: '100%',
    maxWidth: moderateScale(360),
    borderRadius: moderateScale(24),
    backgroundColor: '#ffffff',
    padding: scale(20),
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: verticalScale(10) },
    shadowRadius: moderateScale(24),
    elevation: moderateScale(8),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#0F172A',
  },
  closeButton: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    color: '#475569',
    lineHeight: moderateScale(20),
  },
  inputWrapper: {
    marginTop: verticalScale(20),
    alignItems: 'center',
  },
  input: {
    width: moderateScale(120),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: '#CBD5F5',
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(32),
    fontWeight: '700',
    color: '#0F172A',
  },
  submitButton: {
    marginTop: verticalScale(24),
    borderRadius: moderateScale(16),
    backgroundColor: '#27C36F',
    paddingVertical: verticalScale(12),
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A7F3D0',
  },
  submitLabel: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
});

