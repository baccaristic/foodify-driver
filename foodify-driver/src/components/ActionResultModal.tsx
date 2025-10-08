import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle2, X, XCircle } from 'lucide-react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { PlatformBlurView } from './PlatformBlurView';

type ActionResultStatus = 'success' | 'error';

export interface ActionResultModalProps {
  visible: boolean;
  status: ActionResultStatus;
  title: string;
  message: string;
  onClose: () => void;
}

const STATUS_STYLES: Record<
  ActionResultStatus,
  { iconColor: string; borderColor: string; backgroundColor: string }
> = {
  success: {
    iconColor: '#27C36F',
    borderColor: '#27C36F',
    backgroundColor: 'rgba(39, 195, 111, 0.08)',
  },
  error: {
    iconColor: '#CA251B',
    borderColor: '#CA251B',
    backgroundColor: 'rgba(202, 37, 27, 0.08)',
  },
};

export const ActionResultModal: React.FC<ActionResultModalProps> = ({
  visible,
  status,
  title,
  message,
  onClose,
}) => {
  if (!visible) {
    return null;
  }

  const { iconColor, borderColor, backgroundColor } = STATUS_STYLES[status];
  const StatusIcon = status === 'success' ? CheckCircle2 : XCircle;

  return (
    <Modal animationType="fade" transparent visible>
      <View style={StyleSheet.absoluteFill}>
        <PlatformBlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />

        <View style={styles.container}>
          <View style={styles.card}>
            <TouchableOpacity
              accessibilityLabel="Close status message"
              accessibilityRole="button"
              activeOpacity={0.85}
              onPress={onClose}
              style={[styles.dismissButton, { borderColor }]}
            >
              <X color={borderColor} size={moderateScale(18)} />
            </TouchableOpacity>

            <View
              style={[styles.iconWrapper, { borderColor: iconColor, backgroundColor }]}
            >
              <StatusIcon color={iconColor} size={moderateScale(48)} />
            </View>

            <Text allowFontScaling={false} style={styles.title}>
              {title}
            </Text>

            <Text allowFontScaling={false} style={styles.message}>
              {message}
            </Text>
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
    maxWidth: moderateScale(320),
    borderRadius: moderateScale(28),
    backgroundColor: '#ffffff',
    paddingVertical: verticalScale(36),
    paddingHorizontal: scale(24),
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: verticalScale(12) },
    shadowRadius: moderateScale(28),
    elevation: moderateScale(12),
  },
  dismissButton: {
    position: 'absolute',
    top: scale(18),
    left: scale(18),
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  iconWrapper: {
    width: moderateScale(88),
    height: moderateScale(88),
    borderRadius: moderateScale(44),
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  message: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(14),
    color: '#475569',
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
});

