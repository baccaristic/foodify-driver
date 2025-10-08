import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { Bell, Gift, History, Inbox, LogOut, Trash2, User, Wallet, X } from 'lucide-react-native';

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
  { label: 'Payments', Icon: Wallet },
  { label: 'Rewards', Icon: Gift },
];

const MENU_ITEMS: SidebarItem[] = [
  { label: 'History', Icon: History },
  { label: 'Wallet', Icon: Wallet },
  { label: 'Referrals', Icon: User },
  { label: 'Notifications', Icon: Bell },
  { label: 'Support', Icon: Inbox },
  { label: 'Delete Account', Icon: Trash2 },
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
        if (finished) {
          setIsRendered(false);
        }
      });
    }
  }, [animation, visible]);

  const noop = useCallback(() => {}, []);

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

  if (!isRendered) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.container,
          {
            paddingTop: topInset + verticalScale(24),
            paddingBottom: bottomInset + verticalScale(28),
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextGroup}>
              <Text allowFontScaling={false} style={styles.greeting}>
                Hello, {friendlyName}
              </Text>
              <Text allowFontScaling={false} style={styles.shiftText}>
                {hasActiveShift && shiftStatusMessage ? shiftStatusMessage : 'Ready to work ?'}
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.75} onPress={onClose} style={styles.closeButton}>
              <X color="#ffffff" size={moderateScale(22)} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <View style={styles.quickRow}>
            {QUICK_ACTIONS.map(({ label, Icon }) => (
              <TouchableOpacity
                key={label}
                activeOpacity={0.85}
                style={styles.quickItem}
                onPress={noop}
              >
                <View style={styles.quickIconCircle}>
                  <Icon color="#CA251B" size={moderateScale(22)} strokeWidth={2.2} />
                </View>
                <Text allowFontScaling={false} style={styles.quickLabel}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.menuSection}>
            {MENU_ITEMS.map(({ label, Icon }) => (
              <TouchableOpacity
                key={label}
                activeOpacity={0.75}
                style={styles.menuItem}
                onPress={noop}
              >
                <Icon color="#CA251B" size={moderateScale(20)} strokeWidth={2.1} />
                <Text allowFontScaling={false} style={styles.menuLabel}>
                  {label}
                </Text>
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
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: moderateScale(300),
    backgroundColor: '#ffffff',
    borderTopRightRadius: moderateScale(28),
    borderBottomRightRadius: moderateScale(28),
    overflow: 'hidden',
    elevation: moderateScale(14),
    shadowColor: 'rgba(15, 23, 42, 0.28)',
    shadowOffset: { width: moderateScale(8), height: 0 },
    shadowOpacity: 1,
    shadowRadius: moderateScale(18),
  },
  topSection: {
    backgroundColor: '#CA251B',
    paddingHorizontal: moderateScale(24),
    paddingBottom: verticalScale(28),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextGroup: {
    flex: 1,
    paddingRight: moderateScale(12),
  },
  greeting: {
    color: '#ffffff',
    fontSize: moderateScale(20),
    fontWeight: '700',
    letterSpacing: moderateScale(0.4),
  },
  shiftText: {
    marginTop: verticalScale(8),
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
  },
  closeButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(24),
  },
  quickItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: moderateScale(6),
  },
  quickIconCircle: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    marginTop: verticalScale(10),
    color: '#ffffff',
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: moderateScale(24),
    paddingTop: verticalScale(24),
  },
  menuSection: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
  },
  menuLabel: {
    marginLeft: moderateScale(16),
    color: '#17213A',
    fontSize: moderateScale(15),
    fontWeight: '600',
    letterSpacing: moderateScale(0.2),
  },
  logoutButton: {
    marginTop: verticalScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#CA251B',
    borderRadius: moderateScale(18),
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(14),
  },
  logoutLabel: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontWeight: '700',
    letterSpacing: moderateScale(0.2),
  },
});

