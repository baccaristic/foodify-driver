import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BellRing } from 'lucide-react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

export interface OngoingOrderStatusOverlayProps {
  badgeLabel?: string;
  title: string;
  message: string;
  dismissLabel?: string;
  onDismiss: () => void;
}

export const OngoingOrderStatusOverlay: React.FC<OngoingOrderStatusOverlayProps> = ({
  badgeLabel = 'Order Update',
  title,
  message,
  dismissLabel = 'Got it',
  onDismiss,
}) => {
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(24)).current;
  const badgePulse = useRef(new Animated.Value(0)).current;

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
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(badgePulse, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    badgeLoop.start();

    return () => {
      badgeLoop.stop();
    };
  }, [badgePulse, cardOpacity, cardTranslateY]);

  const badgeScale = badgePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
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
          <Animated.View style={[styles.iconBadge, { transform: [{ scale: badgeScale }] }]}>
            <BellRing color="#ffffff" size={moderateScale(16)} strokeWidth={2.2} />
          </Animated.View>
          <Text allowFontScaling={false} style={styles.badgeLabel}>
            {badgeLabel.toUpperCase()}
          </Text>
        </View>

        <View style={styles.content}>
          <Text allowFontScaling={false} style={styles.title}>
            {title}
          </Text>
          <Text allowFontScaling={false} style={styles.message}>
            {message}
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={onDismiss} style={styles.dismissButton}>
          <Text allowFontScaling={false} style={styles.dismissLabel}>
            {dismissLabel}
          </Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    gap: moderateScale(12),
  },
  iconBadge: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#CA251B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(202, 37, 27, 0.35)',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(12),
    elevation: moderateScale(6),
  },
  badgeLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    letterSpacing: 1.4,
    color: '#0f172a',
  },
  content: {
    gap: verticalScale(8),
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#111827',
  },
  message: {
    fontSize: moderateScale(14),
    lineHeight: verticalScale(20),
    color: '#4b5563',
  },
  dismissButton: {
    alignSelf: 'flex-end',
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(12),
  },
  dismissLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#CA251B',
  },
});

