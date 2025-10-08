import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import type { OrderDto } from '../types/order';

export interface OngoingOrderDetailsOverlayProps {
  onClose: () => void;
  order?: OrderDto | null;
}

export const OngoingOrderDetailsOverlay: React.FC<OngoingOrderDetailsOverlayProps> = ({
  onClose,
  order,
}) => {
  const totalItems = useMemo(() => {
    if (!order) {
      return 0;
    }

    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [order]);

  const formattedNotes = useMemo(() => {
    if (!order) {
      return 'No special instructions';
    }

    const notes = order.items
      .map((item) => item.specialInstructions?.trim())
      .filter((note): note is string => Boolean(note));

    if (notes.length === 0) {
      return 'No special instructions';
    }

    return notes.join('\n');
  }, [order]);

  const formattedTotal = useMemo(() => {
    if (!order || order.total == null) {
      return '—';
    }

    return `${order.total.toFixed(2)} dt`;
  }, [order?.total]);

  const restaurantName = order?.restaurantName ?? 'Restaurant';

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
                {totalItems}
              </Text>
            </View>
            <Text allowFontScaling={false} style={styles.restaurantLabel}>
              Products from <Text style={styles.restaurantName}>{restaurantName}</Text>
            </Text>
          </View>

          {order?.items.length ? (
            <View style={styles.section}>
              <Text allowFontScaling={false} style={styles.sectionLabel}>
                Items
              </Text>
              <View style={styles.itemsList}>
                {order.items.map((item) => (
                  <View key={`${item.menuItemId}-${item.menuItemName}`} style={styles.itemRow}>
                    <Text allowFontScaling={false} style={styles.itemName}>
                      {item.quantity}× {item.menuItemName}
                    </Text>
                    {item.extras.length > 0 ? (
                      <Text allowFontScaling={false} style={styles.itemMeta}>
                        Extras: {item.extras.join(', ')}
                      </Text>
                    ) : null}
                    {item.specialInstructions ? (
                      <Text allowFontScaling={false} style={styles.itemMeta}>
                        Notes: {item.specialInstructions}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              Special Instructions
            </Text>
            <View style={styles.commentBox}>
              <Text allowFontScaling={false} style={styles.commentText}>
                {formattedNotes}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              Delivery Address
            </Text>
            <View style={styles.addressBox}>
              <Text allowFontScaling={false} style={styles.addressText}>
                {order?.clientAddress ?? 'Delivery address not provided'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text allowFontScaling={false} style={styles.summaryLabel}>
              Total
            </Text>
            <Text allowFontScaling={false} style={styles.summaryValue}>{formattedTotal}</Text>
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
  section: {
    marginTop: verticalScale(4),
  },
  sectionLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: verticalScale(6),
  },
  itemsList: {
    gap: verticalScale(12),
  },
  itemRow: {
    gap: verticalScale(4),
  },
  itemName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#0F172A',
  },
  itemMeta: {
    fontSize: moderateScale(13),
    color: '#475569',
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
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryValue: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1F2937',
  },
});

