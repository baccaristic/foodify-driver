import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScanLine } from 'lucide-react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export interface OngoingOrderBannerProps {
  onCallRestaurant?: () => void;
  onSeeOrderDetails?: () => void;
  onLookForDirection?: () => void;
  onScanToPickup?: () => void;
}

export const OngoingOrderBanner: React.FC<OngoingOrderBannerProps> = ({
  onCallRestaurant,
  onSeeOrderDetails,
  onLookForDirection,
  onScanToPickup,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onCallRestaurant}
        style={styles.callButton}
      >
        <View style={styles.callButtonContent}>
          <Text allowFontScaling={false} style={styles.callLabel}>
            Call Restaurant
          </Text>
          <Text allowFontScaling={false} style={styles.callIcon}>
            📞
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text allowFontScaling={false} style={styles.title}>
              Your order
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onSeeOrderDetails}
            style={[styles.column, styles.primaryAction]}
          >
            <Text allowFontScaling={false} style={styles.primaryActionLabel}>
              See order details
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.row, styles.bottomRow]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onLookForDirection}
            style={[styles.secondaryAction, styles.column]}
          >
            <Text allowFontScaling={false} style={styles.secondaryActionLabel}>
              Look for direction
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onScanToPickup}
            style={[styles.secondaryAction, styles.column, styles.scanAction]}
          >
            <View style={styles.scanActionContent}>
              <ScanLine color="#ffffff" size={moderateScale(16)} />
              <Text
                allowFontScaling={false}
                style={[styles.secondaryActionLabel, styles.scanActionLabel]}
              >
                Scan to Pickup
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    maxWidth: moderateScale(380),
  },
  callButton: {
    backgroundColor: '#27C36F',
    borderRadius: moderateScale(28),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(24),
    marginBottom: verticalScale(14),
    shadowColor: '#27C36F',
    shadowOpacity: 0.22,
    shadowRadius: moderateScale(12),
    shadowOffset: { width: 0, height: verticalScale(6) },
    elevation: 4,
  },
  callButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callLabel: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  callIcon: {
    fontSize: moderateScale(16),
    color: '#ffffff',
    marginLeft: scale(8),
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(20),
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(20),
    width: '100%',
    maxWidth: moderateScale(360),
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: moderateScale(12),
    shadowOffset: { width: 0, height: verticalScale(6) },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomRow: {
    marginTop: verticalScale(16),
  },
  column: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#0F172A',
  },
  primaryAction: {
    backgroundColor: '#D72128',
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(12),
    marginLeft: scale(12),
  },
  primaryActionLabel: {
    color: '#ffffff',
    fontSize: moderateScale(13),
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryAction: {
    backgroundColor: '#0B3C81',
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(12),
  },
  secondaryActionLabel: {
    color: '#ffffff',
    fontSize: moderateScale(13),
    fontWeight: '600',
    textAlign: 'center',
  },
  scanAction: {
    marginLeft: scale(12),
    backgroundColor: '#192038',
  },
  scanActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
  },
  scanActionLabel: {
    textAlign: 'left',
  },
});
