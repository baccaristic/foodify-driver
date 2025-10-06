import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PlatformBlurView } from '../../components/PlatformBlurView';
import { moderateScale, verticalScale } from 'react-native-size-matters';

import { Logo } from '../../components/Logo';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useAuth } from '../../contexts/AuthContext';

export const LoginScreen: React.FC = () => {
  const { phoneNumber, setPhoneNumber, authenticate } = useAuth();

  const isValidNumber = useMemo(() => phoneNumber.trim().length >= 8, [phoneNumber]);

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(32)).current;
  const topPulse = useRef(new Animated.Value(0)).current;
  const bottomPulse = useRef(new Animated.Value(0)).current;
  const accentPulse = useRef(new Animated.Value(0)).current;
  const badgeFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        toValue: 0,
        damping: 12,
        mass: 0.9,
        stiffness: 130,
        useNativeDriver: true,
      }),
    ]).start();

    const topLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(topPulse, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(topPulse, {
          toValue: 0,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const bottomLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bottomPulse, {
          toValue: 1,
          duration: 6100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bottomPulse, {
          toValue: 0,
          duration: 6100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const accentLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(accentPulse, {
          toValue: 1,
          duration: 6800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(accentPulse, {
          toValue: 0,
          duration: 6800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const badgeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(badgeFloat, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(badgeFloat, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    topLoop.start();
    bottomLoop.start();
    accentLoop.start();
    badgeLoop.start();

    return () => {
      topLoop.stop();
      bottomLoop.stop();
      accentLoop.stop();
      badgeLoop.stop();
    };
  }, [cardOpacity, cardTranslateY, topPulse, bottomPulse, accentPulse, badgeFloat]);

  const handleContinue = () => {
    if (!isValidNumber) {
      return;
    }

    authenticate(phoneNumber, 'demo-token');
  };

  const topGlowStyle = {
    transform: [
      {
        translateY: topPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -18],
        }),
      },
      {
        scale: topPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.08],
        }),
      },
    ],
  };

  const bottomGlowStyle = {
    transform: [
      {
        translateY: bottomPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 22],
        }),
      },
      {
        scale: bottomPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05],
        }),
      },
    ],
  };

  const accentGlowStyle = {
    transform: [
      {
        translateY: accentPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -14],
        }),
      },
      {
        rotate: accentPulse.interpolate({
          inputRange: [0, 1],
          outputRange: ['-6deg', '6deg'],
        }),
      },
      {
        scale: accentPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1.04],
        }),
      },
    ],
  };

  const badgeStyle = {
    transform: [
      {
        translateY: badgeFloat.interpolate({
          inputRange: [0, 1],
          outputRange: [-4, 4],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View pointerEvents="none" style={styles.ambientLayer}>
          <Animated.View style={[styles.glow, styles.glowTop, topGlowStyle]} />
          <Animated.View style={[styles.glow, styles.glowBottom, bottomGlowStyle]} />
          <Animated.View style={[styles.glowAccent, accentGlowStyle]} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: undefined })}
          style={styles.avoidingView}
        >
          <View style={styles.contentWrapper}>
            <Animated.View style={[styles.badge, badgeStyle, { opacity: cardOpacity }]}>
              <Text allowFontScaling={false} style={styles.badgeLabel}>
                Refreshed design • Smooth interactions
              </Text>
            </Animated.View>

            <PlatformBlurView intensity={65} tint="light" style={styles.glassCard}>
              <Animated.View
                style={[
                  styles.card,
                  {
                    opacity: cardOpacity,
                    transform: [{ translateY: cardTranslateY }],
                  },
                ]}
              >
                <View style={styles.logoWrapper}>
                  <Logo />
                </View>

                <View style={styles.headlineWrapper}>
                  <Text allowFontScaling={false} style={styles.headline}>
                    Welcome back, Rider
                  </Text>
                  <Text allowFontScaling={false} style={styles.subtext}>
                    Your next delivery is just a tap away
                  </Text>
                </View>

                <View style={styles.formWrapper}>
                  <TextField
                    placeholder="Your Number eg. 98765432"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    autoCapitalize="none"
                    containerStyle={styles.input}
                  />
                  <Text allowFontScaling={false} style={styles.helperText}>
                    We&apos;ll send a one-time code to verify your account.
                  </Text>
                </View>

                <Button label="Continue" onPress={handleContinue} disabled={!isValidNumber} />
              </Animated.View>
            </PlatformBlurView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  ambientLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  glow: {
    position: 'absolute',
    width: moderateScale(320),
    height: moderateScale(320),
    borderRadius: moderateScale(200),
    opacity: 0.22,
    shadowColor: 'rgba(251, 113, 133, 0.35)',
    shadowOffset: { width: 0, height: verticalScale(12) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(42),
  },
  glowTop: {
    top: -moderateScale(120),
    right: -moderateScale(60),
    backgroundColor: '#FB7185',
  },
  glowBottom: {
    bottom: -moderateScale(140),
    left: -moderateScale(80),
    backgroundColor: '#60A5FA',
    shadowColor: 'rgba(96, 165, 250, 0.32)',
  },
  glowAccent: {
    position: 'absolute',
    width: moderateScale(220),
    height: moderateScale(220),
    borderRadius: moderateScale(120),
    backgroundColor: '#FDE68A',
    opacity: 0.16,
    top: moderateScale(140),
    right: -moderateScale(40),
    shadowColor: 'rgba(253, 230, 138, 0.5)',
    shadowOffset: { width: 0, height: verticalScale(10) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(28),
  },
  avoidingView: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(32),
    gap: verticalScale(18),
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: moderateScale(18),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(999),
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(191, 219, 254, 0.45)',
  },
  badgeLabel: {
    color: '#E0F2FE',
    fontSize: moderateScale(12),
    letterSpacing: moderateScale(0.4),
    fontWeight: '600',
  },
  glassCard: {
    borderRadius: moderateScale(34),
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  card: {
    paddingHorizontal: moderateScale(28),
    paddingVertical: verticalScale(36),
    gap: verticalScale(32),
    backgroundColor: 'rgba(248, 250, 252, 0.96)',
  },
  logoWrapper: {
    alignItems: 'center',
  },
  headlineWrapper: {
    alignItems: 'center',
    gap: verticalScale(6),
  },
  headline: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: moderateScale(0.6),
  },
  subtext: {
    fontSize: moderateScale(14),
    color: '#4B5563',
    textAlign: 'center',
  },
  formWrapper: {
    gap: verticalScale(12),
  },
  input: {
    marginTop: verticalScale(4),
  },
  helperText: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: verticalScale(16),
  },
});
