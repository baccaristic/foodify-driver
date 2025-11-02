import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { OrderDto, OrderStatus } from '../types/order';

export interface OngoingOrderDetailsOverlayProps {
  onClose: () => void;
  order?: OrderDto | null;
}

export const OngoingOrderDetailsOverlay: React.FC<OngoingOrderDetailsOverlayProps> = ({
  onClose,
  order,
}) => {
  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.headerBackground}>
            <Text allowFontScaling={false} style={styles.headerTitle}>
              Your Order Details
            </Text>
            <TouchableOpacity activeOpacity={0.85} onPress={onClose} style={styles.closeButton}>
              <Text allowFontScaling={false} style={styles.closeLabel}>
                ×
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#CA251B" />
            <Text allowFontScaling={false} style={styles.loadingText}>
              Loading order details...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const restaurantName = order.restaurantName || 'Unknown Restaurant';
  console.log(order)
  const totalItemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const comment =
    order.savedAddress?.notes ||
    order.items?.[0]?.specialInstructions ||
    'No special instructions.';
  const deliveryAddress =
    order.savedAddress?.formattedAddress ||
    order.clientAddress ||
    'Address not specified';
  const subTotal =
    order.items?.reduce(
      (sum, item) => sum + ((item.quantity || 0) * ((item as any).unitPrice || 0)),
      0
    ) || 0;
  const deliveryFees = (order as any).deliveryFee ?? 0;
  const tips = (order as any).tipAmount ?? 0;
  const fees = (order as any).extrasTotal ?? 0;
  const total = (order as any).total ?? subTotal + deliveryFees + tips + fees;
  const clientCash = (order as any).cashToCollect;

  const formattedStatus =
    order.status === OrderStatus.DELIVERED
      ? 'Delivered'
      : order.status === OrderStatus.CANCELED
      ? 'Canceled'
      : order.status === OrderStatus.PREPARING
      ? 'Preparing'
      : order.status === OrderStatus.READY_FOR_PICK_UP
      ? 'Ready for Pickup'
      : order.status === OrderStatus.IN_DELIVERY
      ? 'In Delivery'
      : order.status === OrderStatus.ACCEPTED
      ? 'Accepted'
      : 'Pending';

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerBackground}>
          <Text allowFontScaling={false} style={styles.headerTitle}>
            Order #{order.id} — {formattedStatus}
          </Text>
          <TouchableOpacity activeOpacity={0.85} onPress={onClose} style={styles.closeButton}>
            <Text allowFontScaling={false} style={styles.closeLabel}>
              ×
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.restaurantRow}>
            <View style={styles.productBadge}>
              <Text allowFontScaling={false} style={styles.productBadgeText}>
                {totalItemCount}
              </Text>
            </View>
            <Text allowFontScaling={false} style={styles.restaurantLabel}>
              Product{totalItemCount > 1 ? 's' : ''} from{' '}
              <Text style={styles.restaurantName}>{restaurantName}</Text>
            </Text>
          </View>

          <View style={styles.section}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              items
            </Text>
            <View style={styles.commentBox}>
              <Text allowFontScaling={false} style={styles.commentText}>
                {order.items.map(i => i.menuItemName)}
              </Text>
            </View>
          </View>


          <View style={styles.section}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              Comment
            </Text>
            <View style={styles.commentBox}>
              <Text allowFontScaling={false} style={styles.commentText}>
                {comment}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              Delivery Address
            </Text>
            <View style={styles.addressBox}>
              <Text allowFontScaling={false} style={styles.addressText}>
                {deliveryAddress}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              Payment Method
            </Text>
            <View style={styles.paymentRow}>
              <View style={styles.paymentIcon}>
                <Text allowFontScaling={false} style={styles.paymentIconText}>
                  💳
                </Text>
              </View>
              <Text allowFontScaling={false} style={styles.paymentText}>
                Pay by Credit Card
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text allowFontScaling={false} style={styles.summaryLabel}>
              Subtotal
            </Text>
            <Text allowFontScaling={false} style={styles.summaryValue}>
              {subTotal.toFixed(2)} DT
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text allowFontScaling={false} style={styles.summaryLabel}>
              Fees
            </Text>
            <Text allowFontScaling={false} style={styles.summaryValue}>
              {fees.toFixed(2)} DT
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text allowFontScaling={false} style={styles.summaryLabel}>
              Delivery
            </Text>
            <Text allowFontScaling={false} style={styles.summaryValue}>
              {deliveryFees.toFixed(2)} DT
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text allowFontScaling={false} style={styles.totalLabel}>
              Total
            </Text>
            <Text allowFontScaling={false} style={styles.totalValue}>
              {total.toFixed(2)} DT
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text allowFontScaling={false} style={styles.totalLabel}>
              Client will pay
            </Text>
            <Text allowFontScaling={false} style={styles.totalValue}>
              {clientCash.toFixed(2)} DT
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text allowFontScaling={false} style={styles.totalLabel}>
              Tips
            </Text>
            <Text allowFontScaling={false} style={styles.totalValue}>
              {tips.toFixed(2)} DT
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: verticalScale(60),
    paddingHorizontal: moderateScale(24),
  },
  card: {
    width: '100%',
    maxWidth: moderateScale(370),
    borderRadius: moderateScale(24),
    backgroundColor: '#fff',
    shadowColor: 'rgba(15,23,42,0.18)',
    shadowOffset: { width: 0, height: verticalScale(14) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(26),
    elevation: moderateScale(16),
    overflow: 'hidden',
  },
  headerBackground: {
    backgroundColor: '#CA251B',
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: moderateScale(15), fontWeight: '700', color: '#fff' },
  closeButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeLabel: { fontSize: moderateScale(18), fontWeight: '700', color: '#CA251B' },
  loadingContainer: {
    paddingVertical: verticalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: moderateScale(14),
    color: '#555',
    marginTop: verticalScale(8),
  },
  content: { paddingHorizontal: moderateScale(20), paddingVertical: verticalScale(18), gap: 14 },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productBadge: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(12),
    backgroundColor: '#CA251B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productBadgeText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  restaurantLabel: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: '600', color: '#1F2937' },
  restaurantName: { color: '#CA251B' },
  section: { marginTop: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', marginBottom: 6 },
  commentBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentText: { fontSize: 13, color: '#4B5563' },
  addressBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: 'rgba(15,23,42,0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  addressText: { fontSize: 13, color: '#1F2937' },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  paymentIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentIconText: { fontSize: 16 },
  paymentText: { fontSize: 13, color: '#1F2937', fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB', marginVertical: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13, color: '#6B7280' },
  summaryValue: { fontSize: 13, color: '#6B7280' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 6 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#CA251B' },
});
