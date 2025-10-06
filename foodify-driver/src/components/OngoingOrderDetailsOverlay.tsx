import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export interface OngoingOrderDetailsOverlayProps {
  onClose: () => void;
}

export const OngoingOrderDetailsOverlay: React.FC<OngoingOrderDetailsOverlayProps> = ({
  onClose,
}) => {
  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerBackground}>
          <Text allowFontScaling={false} style={styles.headerTitle}>
            Your Order Details
          </Text>
          <TouchableOpacity
            accessibilityLabel="Close order details"
            activeOpacity={0.85}
            onPress={onClose}
            style={styles.closeButton}
          >
            <Text allowFontScaling={false} style={styles.closeLabel}>
              ×
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.restaurantRow}>
            <View style={styles.productBadge}>
              <Text allowFontScaling={false} style={styles.productBadgeText}>
                4
              </Text>
            </View>
            <Text allowFontScaling={false} style={styles.restaurantLabel}>
              Product from <Text style={styles.restaurantName}>The Hood</Text>
            </Text>
            <Text allowFontScaling={false} style={styles.dropdownIcon}>
              ˅
            </Text>
          </View>

          <View style={styles.section}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              Comment
            </Text>
            <View style={styles.commentBox}>
              <Text allowFontScaling={false} style={styles.commentText}>
                marquez le sandwich sans harissa
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              Delivery Address
            </Text>
            <View style={styles.addressBox}>
              <Text allowFontScaling={false} style={styles.addressText}>
                Rue Mustapha Abdessalem, Ariana 2091
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              Payment method
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
              xx.00 dt
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text allowFontScaling={false} style={styles.summaryLabel}>
              Fees
            </Text>
            <Text allowFontScaling={false} style={styles.summaryValue}>
              xx.00 dt
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text allowFontScaling={false} style={styles.summaryLabel}>
              Delivery
            </Text>
            <Text allowFontScaling={false} style={styles.summaryValue}>
              xx.00 dt
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text allowFontScaling={false} style={styles.summaryLabel}>
              Tips
            </Text>
            <Text allowFontScaling={false} style={styles.summaryValue}>
              xx.00 dt
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text allowFontScaling={false} style={styles.totalLabel}>
              Total
            </Text>
            <Text allowFontScaling={false} style={styles.totalValue}>
              xx.00 dt
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
    backgroundColor: '#ffffff',
    shadowColor: 'rgba(15, 23, 42, 0.18)',
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
  headerTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: moderateScale(0.6),
  },
  closeButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeLabel: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#CA251B',
    marginTop: verticalScale(-2),
  },
  content: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(18),
    gap: verticalScale(14),
  },
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
  productBadgeText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#ffffff',
  },
  restaurantLabel: {
    flex: 1,
    marginLeft: scale(12),
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1F2937',
  },
  restaurantName: {
    color: '#CA251B',
  },
  dropdownIcon: {
    fontSize: moderateScale(14),
    color: '#CA251B',
    marginLeft: scale(12),
  },
  section: {
    marginTop: verticalScale(4),
  },
  sectionLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: verticalScale(6),
  },
  commentBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
  },
  commentText: {
    fontSize: moderateScale(13),
    color: '#4B5563',
  },
  addressBox: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(14),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    shadowColor: 'rgba(15, 23, 42, 0.06)',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(10),
    elevation: moderateScale(4),
  },
  addressText: {
    fontSize: moderateScale(13),
    color: '#1F2937',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    gap: scale(12),
  },
  paymentIcon: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(10),
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(8),
    elevation: moderateScale(4),
  },
  paymentIconText: {
    fontSize: moderateScale(16),
  },
  paymentText: {
    fontSize: moderateScale(13),
    color: '#1F2937',
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: verticalScale(4),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: moderateScale(13),
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: moderateScale(13),
    color: '#6B7280',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(4),
    paddingTop: verticalScale(6),
  },
  totalLabel: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#CA251B',
  },
});

