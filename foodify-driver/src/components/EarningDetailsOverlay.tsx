import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ScaledSheet, ms, vs } from 'react-native-size-matters';
import { Image } from 'expo-image';
import { ChevronDown, ChevronUp, HandPlatter } from 'lucide-react-native';
import type {
  DriverShiftDetail,
  DriverShiftEarning,
} from '../types/driver';
import { getDriverShiftDetails } from '../services/driverService';

type ShiftDetailsOverlayProps = {
  onClose: () => void;
  shift: DriverShiftEarning | null;
};

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) {
    return '--';
  }

  return `${value.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} dt`;
};

const formatShiftWindow = (startTime: string, endTime: string | null) => {
  if (!startTime && !endTime) {
    return 'No time information available';
  }

  if (startTime && endTime) {
    return `From ${startTime} to ${endTime}`;
  }

  if (startTime) {
    return `Started at ${startTime}`;
  }

  return `Ended at ${endTime}`;
};

const getShiftStatus = (endTime: string | null) => {
  if (!endTime) {
    return 'In progress';
  }

  return 'Completed';
};

export default function ShiftDetailsOverlay({ onClose, shift }: ShiftDetailsOverlayProps) {
  if (!shift) {
    return null;
  }

  const [shiftDetails, setShiftDetails] = useState<DriverShiftDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);

  const fetchShiftDetails = useCallback(async () => {
    if (!shift) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const details = await getDriverShiftDetails(shift.id);
      setShiftDetails(details);
    } catch (err) {
      console.error('Failed to fetch shift details', err);
      setError('Unable to load shift details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [shift]);

  useEffect(() => {
    setShiftDetails(null);
    setExpandedOrderIds([]);
    fetchShiftDetails();
  }, [fetchShiftDetails]);

  const toggleOrderExpansion = useCallback((orderId: number) => {
    setExpandedOrderIds((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId],
    );
  }, []);

  const shiftDate = useMemo(() => {
    if (!shiftDetails?.date) {
      return null;
    }

    const isoDateMatch = shiftDetails.date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoDateMatch) {
      const [, year, month, day] = isoDateMatch;
      return `${day}/${month}/${year}`;
    }

    return shiftDetails.date;
  }, [shiftDetails?.date]);

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: vs(30) }}
        >
          <Image
            source={require('../../assets/moto.png')}
            style={styles.icon}
            contentFit="contain"
          />

          <View style={styles.summaryBox}>
            <Text allowFontScaling={false} style={styles.summaryDate}>{`Shift #${shift.id}`}</Text>
            {shiftDate && (
              <Text allowFontScaling={false} style={styles.summaryDateText}>
                {shiftDate}
              </Text>
            )}
            <Text allowFontScaling={false} style={styles.summaryTime}>
              {formatShiftWindow(shift.startTime, shift.endTime)}
            </Text>
            <Text allowFontScaling={false} style={styles.summaryAmount}>
              {formatCurrency(shift.total)}
            </Text>
            <View style={styles.statusPill}>
              <Text allowFontScaling={false} style={styles.statusText}>
                {getShiftStatus(shift.endTime)}
              </Text>
            </View>
          </View>

          <Text allowFontScaling={false} style={styles.sectionTitle}>Shift Breakdown</Text>

          {isLoading && (
            <View style={styles.emptyBox}>
              <ActivityIndicator color="#CA251B" size="small" />
              <Text allowFontScaling={false} style={styles.emptyMessage}>
                Loading shift details...
              </Text>
            </View>
          )}

          {!isLoading && error && (
            <View style={styles.emptyBox}>
              <Text allowFontScaling={false} style={styles.emptyTitle}>{error}</Text>
              <TouchableOpacity
                onPress={fetchShiftDetails}
                activeOpacity={0.85}
                style={styles.retryBtn}
              >
                <Text allowFontScaling={false} style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isLoading && !error && shiftDetails?.orders.length === 0 && (
            <View style={styles.emptyBox}>
              <Text allowFontScaling={false} style={styles.emptyTitle}>No orders recorded</Text>
              <Text allowFontScaling={false} style={styles.emptyMessage}>
                This shift does not have any completed orders yet.
              </Text>
            </View>
          )}

          {!isLoading && !error && shiftDetails?.orders.length ? (
            <View style={styles.orderList}>
              {shiftDetails.orders.map((order) => (
                <View key={order.orderId} style={styles.orderCard}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.orderHeader}
                    onPress={() => toggleOrderExpansion(order.orderId)}
                  >
                    <View style={styles.orderHeaderContent}>
                      <View style={styles.orderHeaderLeft}>
                        <HandPlatter
                          color="#CA251B"
                          size={ms(34)}
                          strokeWidth={2}
                        />
                        <Text allowFontScaling={false} style={styles.orderTitle}>
                          {`${order.orderItemsCount} items - ${order.restaurantName}`}
                          {`${order.orderAcceptedAt} -> ${order.orderDeliveredAt}`}
                        </Text>
                      </View>
                      <Text allowFontScaling={false} style={styles.orderAmount}>
                        {formatCurrency(order.driverEarningFromOrder)}
                      </Text>
                    </View>
                    {expandedOrderIds.includes(order.orderId) ? (
                      <ChevronUp color="#CA251B" size={ms(16)} strokeWidth={2} />
                    ) : (
                      <ChevronDown color="#CA251B" size={ms(16)} strokeWidth={2} />
                    )}
                  </TouchableOpacity>

                  {expandedOrderIds.includes(order.orderId) ? (
                    <View style={styles.orderDetails}>
                      <View style={styles.orderRow}>
                        <Text allowFontScaling={false} style={styles.orderLabel}>Order ID</Text>
                        <Text allowFontScaling={false} style={styles.orderValue}>
                          {order.orderId ?? '--'}
                        </Text>
                      </View>
                      <View style={styles.orderRow}>
                        <Text allowFontScaling={false} style={styles.orderLabel}>Delivery ID</Text>
                        <Text allowFontScaling={false} style={styles.orderValue}>
                          {order.deliveryId ?? '--'}
                        </Text>
                      </View>
                      <View style={styles.orderRow}>
                        <Text allowFontScaling={false} style={styles.orderLabel}>Pickup</Text>
                        <Text allowFontScaling={false} style={styles.orderValue}>
                          {order.pickUpLocation || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.orderRow}>
                        <Text allowFontScaling={false} style={styles.orderLabel}>Drop-off</Text>
                        <Text allowFontScaling={false} style={styles.orderValue}>
                          {order.deliveryLocation || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.orderTotalsRow}>
                        <Text allowFontScaling={false} style={styles.orderTotalsLabel}>Order Total</Text>
                        <Text allowFontScaling={false} style={styles.orderTotalsValue}>
                          {formatCurrency(order.orderTotal)}
                        </Text>
                      </View>
                      <View style={styles.orderTotalsRow}>
                        <Text allowFontScaling={false} style={styles.orderTotalsLabel}>Delivery Fee</Text>
                        <Text allowFontScaling={false} style={styles.orderTotalsValue}>
                          {formatCurrency(order.deliveryFee)}
                        </Text>
                      </View>
                      <View style={styles.orderTotalsRow}>
                        <Text allowFontScaling={false} style={styles.orderTotalsLabel}>Items</Text>
                        <Text allowFontScaling={false} style={styles.orderTotalsValue}>
                          {order.orderItemsCount ?? '--'}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={styles.closeBtn}>
            <Text allowFontScaling={false} style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '16@s',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: '20@ms',
    paddingVertical: '20@vs',
    paddingHorizontal: '18@s',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    width: '110@s',
    height: '110@s',
    alignSelf: 'center',
    marginBottom: '10@vs',
  },

  summaryBox: {
    backgroundColor: '#FFF',
    borderRadius: '14@ms',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    padding: '14@s',
    marginBottom: '18@vs',
    alignItems: 'center',
    elevation: 2,
  },
  summaryDate: {
    color: '#CA251B',
    fontWeight: '700',
    fontSize: '15@ms',
  },
  summaryTime: {
    color: '#17213A',
    fontWeight: '600',
    fontSize: '13@ms',
    marginTop: '2@vs',
    textAlign: 'center',
  },
  summaryAmount: {
    color: '#CA251B',
    fontWeight: '700',
    fontSize: '20@ms',
    marginTop: '6@vs',
  },
  summaryDateText: {
    color: '#6B7280',
    fontSize: '12@ms',
    marginTop: '4@vs',
  },
  sectionTitle: {
    color: '#17213A',
    fontWeight: '800',
    fontSize: '16@ms',
    marginBottom: '10@vs',
  },
  statusPill: {
    marginTop: '8@vs',
    paddingVertical: '4@vs',
    paddingHorizontal: '12@s',
    backgroundColor: '#FEE2E2',
    borderRadius: '12@ms',
  },
  statusText: {
    color: '#CA251B',
    fontWeight: '700',
    fontSize: '12@ms',
  },
  emptyBox: {
    backgroundColor: '#FFF',
    borderRadius: '14@ms',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    padding: '16@s',
    alignItems: 'center',
    gap: 6,
    elevation: 2,
  },
  orderList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: '14@ms',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    paddingVertical: '6@vs',
    paddingHorizontal: '14@s',
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '10@vs',
  },
  orderHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    marginRight: '10@s',
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderTitle: {
    color: '#17213A',
    fontWeight: '700',
    fontSize: '14@ms',
    marginLeft: '6@s',
  },
  orderAmount: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: '14@ms',
  },
  orderDetails: {
    paddingBottom: '12@vs',
    paddingTop: '4@vs',
    borderTopWidth: 1,
    borderTopColor: '#E6E8EB',
    gap: 8,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  orderLabel: {
    color: '#CA251B',
    fontWeight: '600',
    fontSize: '12@ms',
    flexShrink: 0,
  },
  orderValue: {
    color: '#17213A',
    fontSize: '12@ms',
    flex: 1,
    textAlign: 'right',
  },
  orderTotalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderTotalsLabel: {
    color: '#CA251B',
    fontWeight: '600',
    fontSize: '12@ms',
  },
  orderTotalsValue: {
    color: '#17213A',
    fontWeight: '600',
    fontSize: '12@ms',
  },
  emptyTitle: {
    color: '#17213A',
    fontWeight: '700',
    fontSize: '13@ms',
  },
  emptyMessage: {
    color: '#6B7280',
    fontSize: '12@ms',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: '8@vs',
    paddingVertical: '8@vs',
    paddingHorizontal: '18@s',
    borderRadius: '12@ms',
    backgroundColor: '#CA251B',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '12@ms',
  },
  closeBtn: {
    marginTop: '18@vs',
    backgroundColor: '#CA251B',
    borderRadius: '12@ms',
    paddingVertical: '12@vs',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '14@ms',
  },
});
