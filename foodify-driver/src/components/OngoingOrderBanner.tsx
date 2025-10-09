import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScanLine } from 'lucide-react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const formatOrderStatus = (status?: string | null) => {
  if (!status) {
    return null;
  }

  return status
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export interface OngoingOrderBannerProps {
  callLabel?: string;
  onCallContact?: () => void;
  isCallDisabled?: boolean;
  onSeeOrderDetails?: () => void;
  onLookForDirection?: () => void;
  onScanToPickup?: () => void;
  isScanToPickupVisible?: boolean;
  onConfirmDelivery?: () => void;
  isConfirmDeliveryVisible?: boolean;
  orderId?: number | null;
  restaurantName?: string | null;
  clientName?: string | null;
  clientAddress?: string | null;
  orderTotal?: number | null;
  orderStatus?: string | null;
}

export const OngoingOrderBanner: React.FC<OngoingOrderBannerProps> = ({
  callLabel = 'Call Contact',
  onCallContact,
  isCallDisabled = false,
  onSeeOrderDetails,
  onLookForDirection,
  onScanToPickup,
  isScanToPickupVisible = false,
  onConfirmDelivery,
  isConfirmDeliveryVisible = false,
  orderId = null,
  restaurantName = null,
  clientName = null,
  clientAddress = null,
  orderTotal = null,
  orderStatus = null,
}) => {
  const hasOrderId = typeof orderId === 'number' && orderId > 0;
  const normalizedRestaurantName = restaurantName?.trim() || null;
  const normalizedClientName = clientName?.trim() || null;
  const normalizedClientAddress = clientAddress?.trim() || null;
  const formattedStatus = formatOrderStatus(orderStatus);
  const formattedTotal =
    typeof orderTotal === 'number' && !Number.isNaN(orderTotal)
      ? `${orderTotal.toFixed(2)} DT`
      : null;

  const hasOrderInfo =
    hasOrderId ||
    Boolean(
      formattedStatus ||
        normalizedRestaurantName ||
        normalizedClientName ||
        normalizedClientAddress ||
        formattedTotal,
    );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onCallContact}
        style={[styles.callButton, isCallDisabled && styles.callButtonDisabled]}
        disabled={isCallDisabled}
      >
        <View style={styles.callButtonContent}>
          <Text allowFontScaling={false} style={styles.callLabel}>
            {callLabel}
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

        {hasOrderInfo && (
          <View style={styles.infoSection}>
            {hasOrderId && (
              <Text allowFontScaling={false} style={styles.infoText}>
                Order <Text style={styles.infoHighlight}>#{orderId}</Text>
              </Text>
            )}
            {formattedStatus && (
              <View style={styles.statusBadge}>
                <Text allowFontScaling={false} style={styles.statusText}>
                  {formattedStatus}
                </Text>
              </View>
            )}
            {normalizedRestaurantName && (
              <Text allowFontScaling={false} style={styles.infoText}>
                Pickup from <Text style={styles.infoHighlight}>{normalizedRestaurantName}</Text>
              </Text>
            )}
            {normalizedClientName && (
              <Text allowFontScaling={false} style={styles.infoText}>
                Deliver to <Text style={styles.infoHighlight}>{normalizedClientName}</Text>
              </Text>
            )}
            {normalizedClientAddress && (
              <Text
                allowFontScaling={false}
                style={[styles.infoText, styles.infoAddress]}
                numberOfLines={2}
              >
                {normalizedClientAddress}
              </Text>
            )}
            {formattedTotal && (
              <Text allowFontScaling={false} style={styles.infoText}>
                Total <Text style={styles.infoHighlight}>{formattedTotal}</Text>
              </Text>
            )}
          </View>
        )}

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
          {isScanToPickupVisible && (
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
          )}
        </View>

        {isConfirmDeliveryVisible && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onConfirmDelivery}
            style={[styles.secondaryAction, styles.confirmDeliveryAction]}
          >
            <Text allowFontScaling={false} style={styles.secondaryActionLabel}>
              Confirm delivery code
            </Text>
          </TouchableOpacity>
        )}
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
  callButtonDisabled: {
    opacity: 0.6,
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
  infoSection: {
    marginTop: verticalScale(12),
    gap: verticalScale(6),
  },
  infoText: {
    color: '#0F172A',
    fontSize: moderateScale(12),
  },
  infoHighlight: {
    color: '#0B3C81',
    fontWeight: '600',
  },
  infoAddress: {
    color: '#475569',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(11, 60, 129, 0.08)',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(10),
  },
  statusText: {
    color: '#0B3C81',
    fontSize: moderateScale(11),
    fontWeight: '600',
    letterSpacing: 0.2,
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
  confirmDeliveryAction: {
    marginTop: verticalScale(12),
  },
});
