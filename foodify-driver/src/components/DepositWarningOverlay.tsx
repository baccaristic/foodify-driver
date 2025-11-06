import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { AlertTriangle } from 'lucide-react-native';

export interface DepositWarningOverlayProps {
  title: string;
  message: string;
  cashOnHand: number;
  depositThreshold: number;
  deadlineHours: number;
  onDismiss: () => void;
}

export const DepositWarningOverlay: React.FC<DepositWarningOverlayProps> = ({
  title,
  message,
  cashOnHand,
  depositThreshold,
  deadlineHours,
  onDismiss,
}) => {
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(24)).current;
  const iconPulse = useRef(new Animated.Value(0)).current;

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

    const iconLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    iconLoop.start();

    return () => {
      iconLoop.stop();
    };
  }, [cardOpacity, cardTranslateY, iconPulse]);

  const iconScale = iconPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const iconOpacity = iconPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  const formattedCash = cashOnHand.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedThreshold = depositThreshold.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
          <Animated.View
            style={[
              styles.iconBadge,
              { transform: [{ scale: iconScale }], opacity: iconOpacity },
            ]}
          >
            <AlertTriangle color="#ffffff" size={moderateScale(24)} strokeWidth={2.5} />
          </Animated.View>
          <View style={styles.titleContainer}>
            <Text allowFontScaling={false} style={styles.title}>
              {title}
            </Text>
          </View>
        </View>

        <Text allowFontScaling={false} style={styles.message}>
          {message}
        </Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text allowFontScaling={false} style={styles.detailLabel}>
              Cash on Hand:
            </Text>
            <Text allowFontScaling={false} style={styles.detailValue}>
              {formattedCash} DT
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text allowFontScaling={false} style={styles.detailLabel}>
              Threshold:
            </Text>
            <Text allowFontScaling={false} style={styles.detailValue}>
              {formattedThreshold} DT
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text allowFontScaling={false} style={styles.detailLabel}>
              Deadline:
            </Text>
            <Text allowFontScaling={false} style={styles.detailValue}>
              {deadlineHours} hours
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onDismiss}
          style={styles.dismissButton}
        >
          <Text allowFontScaling={false} style={styles.dismissLabel}>
            I Understand
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
    borderColor: 'rgba(202, 37, 27, 0.3)',
    gap: verticalScale(18),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  iconBadge: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: '#CA251B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(202, 37, 27, 0.4)',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(16),
    elevation: moderateScale(10),
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#CA251B',
    letterSpacing: moderateScale(0.3),
  },
  message: {
    fontSize: moderateScale(14),
    color: '#475569',
    lineHeight: verticalScale(20),
  },
  detailsContainer: {
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    gap: verticalScale(10),
    borderWidth: 1,
    borderColor: 'rgba(202, 37, 27, 0.2)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#64748B',
  },
  detailValue: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#1E293B',
  },
  dismissButton: {
    height: verticalScale(48),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CA251B',
    shadowColor: 'rgba(202, 37, 27, 0.3)',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(16),
    elevation: moderateScale(10),
  },
  dismissLabel: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: moderateScale(0.5),
    textTransform: 'uppercase',
  },
});
