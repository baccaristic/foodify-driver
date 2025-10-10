import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import {
  Bell,
  ChevronRight,
  CircleDollarSign,
  Gift,
  Inbox,
  LogOut,
  Trash2,
  User,
  Wallet,
} from 'lucide-react-native';
import { Image } from 'expo-image';

const { height: SCREEN_HEIGHT } = Dimensions.get('screen');

type SidebarItem = {
  label: string;
  Icon: typeof Inbox;
};

type DashboardSidebarProps = {
  visible: boolean;
  friendlyName: string;
  hasActiveShift: boolean;
  shiftStatusMessage: string | null;
  topInset: number;
  bottomInset: number;
  onClose: () => void;
};

const QUICK_ACTIONS: SidebarItem[] = [
  { label: 'Inbox', Icon: Inbox },
  { label: 'Earnings', Icon: CircleDollarSign },
  { label: 'Rewards', Icon: Gift },
];

const MENU_ITEMS: SidebarItem[] = [
  { label: 'Wallet', Icon: Wallet },
  { label: 'Profile', Icon: User },
  { label: 'Notifications', Icon: Bell },
  { label: 'Delete account & Data', Icon: Trash2 },
];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  visible,
  friendlyName,
  hasActiveShift,
  shiftStatusMessage,
  topInset,
  bottomInset,
  onClose,
}) => {
  const [isRendered, setIsRendered] = useState(visible);
  const animation = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    animation.stopAnimation();

    if (visible) {
      setIsRendered(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setIsRendered(false);
      });
    }
  }, [animation, visible]);

  const noop = useCallback(() => { }, []);

  const backdropOpacity = useMemo(
    () =>
      animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.45],
      }),
    [animation],
  );

  const translateX = useMemo(
    () =>
      animation.interpolate({
        inputRange: [0, 1],
        outputRange: [-moderateScale(320), 0],
      }),
    [animation],
  );

  if (!isRendered) return null;

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sidebar,
          {
            paddingTop: topInset,
            paddingBottom: bottomInset,
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.topSection}>
          <Image
            source={require('../../../../assets/background.png')}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />

          <View style={styles.redTintOverlay} />

          <View style={styles.topContent}>
            <Text allowFontScaling={false} style={styles.greeting}>
              Hello, {friendlyName}
            </Text>

            {hasActiveShift && shiftStatusMessage ? (
              <Text allowFontScaling={false} style={styles.shiftText}>
                {shiftStatusMessage}
              </Text>
            ) : null}

            <View style={styles.quickRow}>
              {QUICK_ACTIONS.map(({ label, Icon }) => (
                <TouchableOpacity
                  key={label}
                  activeOpacity={0.85}
                  style={styles.quickItem}
                  onPress={noop}
                >
                  <View style={styles.quickIconCircle}>
                    <Icon color="#CA251B" size={moderateScale(34)} strokeWidth={2.2} />
                  </View>
                  <Text allowFontScaling={false} style={styles.quickLabel}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.content}>
            <View style={styles.menuSection}>
              {MENU_ITEMS.map(({ label, Icon }) => (
                <TouchableOpacity
                  key={label}
                  activeOpacity={0.75}
                  style={styles.menuItem}
                  onPress={noop}
                >
                  <View style={styles.menuLeft}>
                    <Icon color="#CA251B" size={moderateScale(20)} strokeWidth={2.1} />
                    <Text allowFontScaling={false} style={styles.menuLabel}>
                      {label}
                    </Text>
                  </View>
                  <ChevronRight color="#CA251B" size={moderateScale(18)} strokeWidth={2.2} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.logoutButton} onPress={noop}>
              <Text allowFontScaling={false} style={styles.logoutLabel}>
                Logout
              </Text>
              <LogOut color="#ffffff" size={moderateScale(20)} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: SCREEN_HEIGHT,
    width: moderateScale(300),
    overflow: 'hidden',
    elevation: moderateScale(12),
    shadowColor: 'rgba(15, 23, 42, 0.28)',
    shadowOffset: { width: moderateScale(8), height: 0 },
    shadowOpacity: 1,
    shadowRadius: moderateScale(18),

  },

  topSection: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.32,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#CA251B',
  },
  redTintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(202, 37, 27, 0.35)',
  },
  topContent: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-start',

  },

  greeting: {
    color: '#ffffff',
    fontSize: moderateScale(34),
    fontWeight: '700',
    textAlign: 'center',
    marginTop: moderateScale(14),
  },
  shiftText: {
    marginTop: verticalScale(10),
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(4),
    backgroundColor: '#17213A',
    borderRadius: moderateScale(8),
    color: '#ffffff',
    fontSize: moderateScale(14),
    fontWeight: '400',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: verticalScale(22),
    width: '100%',
  },
  quickItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickIconCircle: {
    width: moderateScale(62),
    height: moderateScale(62),
    borderRadius: moderateScale(31),
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    marginTop: verticalScale(8),
    color: '#ffffff',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },

  contentWrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: moderateScale(28),
    borderTopRightRadius: moderateScale(28),
    marginTop: -verticalScale(20),
    paddingTop: verticalScale(24),

  },
  content: {
    flex: 1,
    paddingHorizontal: moderateScale(24),
  },
  menuSection: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6E8EB',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    marginLeft: moderateScale(16),
    color: '#17213A',
    fontSize: moderateScale(15),
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: verticalScale(20),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CA251B',
    borderRadius: moderateScale(20),
    paddingVertical: verticalScale(14),
    marginBottom: moderateScale(200),
  },
  logoutLabel: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginRight: moderateScale(10),
  },
});
