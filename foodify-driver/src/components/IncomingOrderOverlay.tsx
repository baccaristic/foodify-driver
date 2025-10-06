import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { Timer, UtensilsCrossed } from 'lucide-react-native';

export interface IncomingOrderOverlayProps {
  countdownSeconds: number;
  onAccept: () => void;
  onDecline: () => void;
  orderLabel?: string;
  subtitle?: string;
}

export const IncomingOrderOverlay: React.FC<IncomingOrderOverlayProps> = ({
  countdownSeconds,
  onAccept,
  onDecline,
  orderLabel = 'New Order',
  subtitle = 'A customer is waiting for you',
}) => {
  const formattedCountdown = useMemo(() => {
    const minutes = Math.floor(countdownSeconds / 60);
    const seconds = countdownSeconds % 60;

    const minuteLabel = minutes > 0 ? `${minutes} min` : '';
    const secondLabel = `${seconds.toString().padStart(2, '0')} sec`;

    return [minuteLabel, secondLabel].filter(Boolean).join(' ');
  }, [countdownSeconds]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.orderLabelContainer}>
            <View style={styles.iconBadge}>
              <UtensilsCrossed color="#ffffff" size={moderateScale(16)} strokeWidth={2.2} />
            </View>
            <Text allowFontScaling={false} style={styles.orderLabel}>
              {orderLabel.toUpperCase()}
            </Text>
          </View>

          <View style={styles.timerContainer}>
            <Timer color="#10B981" size={moderateScale(16)} strokeWidth={2.2} />
            <Text allowFontScaling={false} style={styles.timerText}>
              {formattedCountdown}
            </Text>
          </View>
        </View>

        <Text allowFontScaling={false} style={styles.subtitle}>
          {subtitle}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onDecline}
            style={[styles.actionButton, styles.declineButton]}
          >
            <Text allowFontScaling={false} style={styles.declineLabel}>
              Decline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onAccept}
            style={[styles.actionButton, styles.acceptButton]}
          >
            <Text allowFontScaling={false} style={styles.acceptLabel}>
              Accept
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(24),
  },
  card: {
    width: '100%',
    borderRadius: moderateScale(20),
    backgroundColor: '#ffffff',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(20),
    shadowColor: 'rgba(15, 23, 42, 0.2)',
    shadowOffset: { width: 0, height: verticalScale(12) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(24),
    elevation: moderateScale(12),
    gap: verticalScale(16),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  iconBadge: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(12),
    backgroundColor: '#17213A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(19, 16, 16, 0.35)',
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(12),
    elevation: moderateScale(8),
  },
  orderLabel: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: moderateScale(0.5),
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(999),
    gap: moderateScale(6),
  },
  timerText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#059669',
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    lineHeight: verticalScale(18),
  },
  actionsRow: {
    flexDirection: 'row',
    gap: moderateScale(14),
  },
  actionButton: {
    flex: 1,
    height: verticalScale(48),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(15, 23, 42, 0.18)',
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(12),
    elevation: moderateScale(8),
  },
  declineButton: {
    backgroundColor: '#EF4444',
  },
  acceptButton: {
    backgroundColor: '#22C55E',
  },
  declineLabel: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: moderateScale(0.5),
    textTransform: 'uppercase',
  },
  acceptLabel: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: moderateScale(0.5),
    textTransform: 'uppercase',
  },
});

