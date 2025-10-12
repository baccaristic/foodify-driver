import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ScaledSheet, ms, vs, s } from 'react-native-size-matters';
import { Image } from 'expo-image';
import { ChevronDown, ChevronUp, CircleX, HandPlatter, X } from 'lucide-react-native';
import type {
  DriverShiftDetail,
  DriverShiftEarning,
} from '../types/driver';
import { getDriverShiftDetails } from '../services/driverService';
import { moderateScale } from 'react-native-size-matters';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

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
    <SafeAreaView
      style={[
        styles.safeContainer,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              style={styles.closeButton}
            >
              <X  color="#CA251B" size={s(24)} />
            </TouchableOpacity>

            <Text allowFontScaling={false} style={styles.header}>
              {`Shift #${shift.id}`}
            </Text>

            <View style={{ width: s(40) }} />
          </View>



          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.container}
          >
            <Image
              source={require('../../assets/moto.png')}
              style={styles.icon}
              contentFit="contain"
            />

            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  {shiftDate && (
                    <Text allowFontScaling={false} style={styles.summaryDateText}>
                      {shiftDate}
                    </Text>
                  )}
                  <Text allowFontScaling={false} style={styles.summaryTime}>
                    {formatShiftWindow(shift.startTime, shift.endTime)}
                  </Text>
                </View>

                <View style={styles.summaryRight}>
                  <Text allowFontScaling={false} style={styles.summaryAmount}>
                    {formatCurrency(shift.total)}
                  </Text>
                </View>
              </View>

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
                            {`${order.orderItemsCount} items - ${order.restaurantName} : `}
                            {`${order.orderAcceptedAt} -> ${order.orderDeliveredAt}`}
                          </Text>
                        </View>
                        <Text allowFontScaling={false} style={styles.orderAmount}>
                          {formatCurrency(order.driverEarningFromOrder)}
                        </Text>
                      </View>
                      {expandedOrderIds.includes(order.orderId) ? (
                        <ChevronUp style={{ backgroundColor: '#CA251B', borderRadius: moderateScale(4) }} color="white" size={s(24)} strokeWidth={2} />
                      ) : (
                        <ChevronDown style={{ backgroundColor: '#CA251B', borderRadius: moderateScale(4) }} color="white" size={s(24)} strokeWidth={2} />
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
                          <Text allowFontScaling={false} style={styles.orderLabel} >Drop-off</Text>
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
    </SafeAreaView>
  );
  
}

const styles = ScaledSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(16),
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
    alignSelf: 'center',
    maxHeight: '94%',

  },

  container: {
    flexGrow: 1,
    paddingBottom: vs(40),
    borderTopColor: '#F9FAFB',
    borderColor: '#F9FAFB',
    borderTopWidth: 2,
    borderBottomWidth: 0,
  },
  closeButton: {
    width: '40@s',
    height: '40@s',
    borderRadius: '20@s',
    borderWidth: 1,
    borderColor: '#CA251B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(10),
  },
  header: {
    alignSelf: 'center',
    marginBottom: vs(10),
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#17213A',
  },

  icon: {
    width: '110@s',
    height: '110@s',
    alignSelf: 'center',
    marginBottom: '10@vs',
  },

  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16@ms',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    paddingVertical: '14@vs',
    paddingHorizontal: '14@s',
    marginBottom: moderateScale(14),
    elevation: 2,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryLeft: {
    flex: 1,
    justifyContent: 'center',
  },

  summaryRight: {
    alignItems: 'flex-end',
  },

  summaryDateText: {
    color: '#CA251B',
    fontWeight: '800',
    fontSize: '16@ms',
    marginBottom: '4@vs',
  },

  summaryTime: {
    color: '#17213A',
    fontWeight: '700',
    fontSize: '16@ms',
  },

  summaryAmount: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: '18@ms',
  },

  statusPill: {
    marginTop: '10@vs',
    alignSelf: 'center',
    borderRadius: moderateScale(10),
    paddingVertical: '5@vs',
    paddingHorizontal: '16@s',
    backgroundColor: '#CA251B',
  },

  statusText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: '14@ms',
    textAlign: 'center',
  },

  sectionTitle: {
    color: '#17213A',
    fontWeight: '700',
    fontSize: '18@ms',
    marginBottom: moderateScale(14),
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
    backgroundColor: '#FFFFFF',
    borderRadius: '14@ms',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    paddingVertical: '10@vs',
    paddingHorizontal: '14@s',
    elevation: 2,
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },

  orderTitle: {
    color: '#17213A',
    fontWeight: '700',
    fontSize: '14@ms',
    marginLeft: '8@s',
    flexShrink: 1,
    maxWidth: moderateScale(150),
  },

  orderAmount: {
    color: '#CA251B',
    fontWeight: '800',
    fontSize: '15@ms',
  },

  orderDetails: {
    marginTop: '8@vs',
    borderTopWidth: 1,
    borderTopColor: '#CA251B',
    paddingTop: '8@vs',
    gap: 6,
  },

  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: '2@vs',

  },

  orderLabel: {
    color: '#CA251B',
    fontWeight: '600',
    fontSize: '12@ms',
  },

  orderValue: {
    color: '#17213A',
    fontWeight: '600',
    fontSize: '12@ms',
    alignSelf: 'flex-end',
    maxWidth: moderateScale(160),
    textAlign: 'right',
  },

  orderHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    marginRight: '10@s',
    gap: 10,
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
