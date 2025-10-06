import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(24)).current;
  const badgePulse = useRef(new Animated.Value(0)).current;
  const timerPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        toValue: 0,
        damping: 12,
        mass: 0.9,
        stiffness: 140,
        useNativeDriver: true,
      }),
    ]).start();

    const badgeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(badgePulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const timerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(timerPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(timerPulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    badgeLoop.start();
    timerLoop.start();

    return () => {
      badgeLoop.stop();
      timerLoop.stop();
    };
  }, [badgePulse, cardOpacity, cardTranslateY, timerPulse]);

  const badgeScale = badgePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });

  const timerScale = timerPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  const timerOpacity = timerPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.card,
          {
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslateY }],
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.orderLabelContainer}>
            <Animated.View style={[styles.iconBadge, { transform: [{ scale: badgeScale }] }]}> 
              <UtensilsCrossed color="#ffffff" size={moderateScale(16)} strokeWidth={2.2} />
            </Animated.View>
            <Text allowFontScaling={false} style={styles.orderLabel}>
              {orderLabel.toUpperCase()}
            </Text>
          </View>

          <Animated.View
            style={[styles.timerContainer, { transform: [{ scale: timerScale }], opacity: timerOpacity }]}
          >
            <Timer color="#10B981" size={moderateScale(16)} strokeWidth={2.2} />
            <Text allowFontScaling={false} style={styles.timerText}>
              {formattedCountdown}
            </Text>
          </Animated.View>
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
      </Animated.View>
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
    borderRadius: moderateScale(24),
    backgroundColor: 'rgba(248, 250, 252, 0.98)',
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(24),
    shadowColor: 'rgba(15, 23, 42, 0.22)',
    shadowOffset: { width: 0, height: verticalScale(16) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(32),
    elevation: moderateScale(14),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(203, 213, 225, 0.4)',
    gap: verticalScale(18),
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
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(16),
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(15, 23, 42, 0.35)',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(16),
    elevation: moderateScale(10),
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
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(999),
    gap: moderateScale(6),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(16, 185, 129, 0.35)',
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
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(15, 23, 42, 0.2)',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(16),
    elevation: moderateScale(10),
  },
  declineButton: {
    backgroundColor: '#EF4444',
  },
  acceptButton: {
    backgroundColor: '#16A34A',
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

