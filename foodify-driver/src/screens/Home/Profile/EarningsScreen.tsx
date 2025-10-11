import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Calendar as CalendarIcon, ChevronRight, ClockFading } from 'lucide-react-native';
import { ScaledSheet, s, vs, moderateScale } from 'react-native-size-matters';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import EarningDetailsOverlay from '../../../components/EarningDetailsOverlay';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar as DateRangeCalendar } from 'react-native-calendars';
import {
  getDriverShiftEarnings,
} from '../../../services/driverService';
import type {
  DriverEarningsQuery,
  DriverShiftEarning,
  DriverShiftEarningsResponse,
} from '../../../types/driver';

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const [showDetails, setShowDetails] = useState(false);
  const [selectedShift, setSelectedShift] = useState<DriverShiftEarning | null>(null);
  const [shiftEarnings, setShiftEarnings] = useState<DriverShiftEarningsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start?: string; end?: string }>({});
  const [appliedRange, setAppliedRange] = useState<{ start?: string; end?: string } | null>(null);
  const [lastQuery, setLastQuery] = useState<DriverEarningsQuery | undefined>(undefined);

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined) {
      return '--';
    }

    return `${value.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} dt`;
  };

  const formatShiftTime = (startTime: string, endTime: string | null) => {
    if (startTime && endTime) {
      return `${startTime} - ${endTime}`;
    }

    if (startTime) {
      return `${startTime} - --`;
    }

    if (endTime) {
      return `-- - ${endTime}`;
    }

    return 'Time unavailable';
  };

  const formatShiftStatus = (endTime: string | null) => {
    if (!endTime) {
      return 'In progress';
    }

    return 'Completed';
  };

  const formatDateForApi = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');

    return `${day}/${month}/${year}`;
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const fetchShiftEarnings = useCallback(
    async (params?: DriverEarningsQuery): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      setLastQuery(params);

      try {
        const data = await getDriverShiftEarnings(params);
        setShiftEarnings(data);

        return true;
      } catch (err) {
        console.error('Failed to fetch shift earnings', err);
        setError('Unable to load earnings. Please try again.');

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchShiftEarnings();
  }, [fetchShiftEarnings]);

  const handleDateSelect = (day: { dateString: string }) => {
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: day.dateString, end: undefined });
    } else if (selectedRange.start && !selectedRange.end) {
      if (day.dateString < selectedRange.start) {
        setSelectedRange({ start: day.dateString, end: selectedRange.start });
      } else {
        setSelectedRange({ ...selectedRange, end: day.dateString });
      }
    }
  };

  const getMarkedDates = () => {
    const { start, end } = selectedRange;
    if (!start) return {};
    const marked: Record<string, any> = {
      [start]: { startingDay: true, color: '#CA251B', textColor: 'white' },
    };
    if (end) {
      let date = new Date(start);
      const endDate = new Date(end);
      while (date <= endDate) {
        const dateStr = date.toISOString().split('T')[0];
        if (dateStr !== start && dateStr !== end) {
          marked[dateStr] = { color: '#FECACA', textColor: '#CA251B' };
        }
        date.setDate(date.getDate() + 1);
      }
      marked[end] = { endingDay: true, color: '#CA251B', textColor: 'white' };
    }
    return marked;
  };

  const handleApplyRange = () => {
    const { start, end } = selectedRange;

    const params: DriverEarningsQuery = {};
    let nextAppliedRange: { start?: string; end?: string } | null = null;

    if (start && end) {
      params.from = formatDateForApi(start);
      params.to = formatDateForApi(end);
      nextAppliedRange = { start, end };
    } else if (start) {
      params.dateOn = formatDateForApi(start);
      nextAppliedRange = { start };
    }

    const hasParams = Object.keys(params).length > 0;

    fetchShiftEarnings(hasParams ? params : undefined).then((success) => {
      if (success) {
        setAppliedRange(nextAppliedRange);
      }

      setShowCalendar(false);
    });
  };

  const resetRange = () => {
    setSelectedRange({});

    fetchShiftEarnings().then((success) => {
      if (success) {
        setAppliedRange(null);
      }

      setShowCalendar(false);
    });
  };

  const openCalendar = () => {
    if (appliedRange) {
      setSelectedRange(appliedRange);
    } else {
      setSelectedRange({});
    }
    setShowCalendar(true);
  };

  const openDetails = (item: DriverShiftEarning) => {
    setSelectedShift(item);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedShift(null);
  };

  const handleRetry = () => {
    fetchShiftEarnings(lastQuery);
  };

  const dateLabel = useMemo(() => {
    if (appliedRange?.start) {
      if (appliedRange.end && appliedRange.end !== appliedRange.start) {
        return `${formatDisplayDate(appliedRange.start)} - ${formatDisplayDate(appliedRange.end)}`;
      }

      return `Date: ${formatDisplayDate(appliedRange.start)}`;
    }

    return `Today: ${formatDisplayDate(todayIso)}`;
  }, [appliedRange, todayIso]);

  return (
    <>
      <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <View style={styles.header}>
          <HeaderWithBackButton title="Earnings" titleMarginLeft={s(50)} />
        </View>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: vs(40) }}
        >
          <View style={styles.headerSection}>
            <Image
              source={require('../../../../assets/hand coin.png')}
              style={styles.icon}
              contentFit="contain"
            />
            <Text allowFontScaling={false} style={styles.subTitle}>
              Every ride brings you closer to your goals
            </Text>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateBox}>
              <Text allowFontScaling={false} style={styles.dateText}>
                {dateLabel}
              </Text>
            </View>
            <TouchableOpacity style={styles.calendarButton} onPress={openCalendar}>
              <CalendarIcon color="#17213A" size={moderateScale(20)} />
            </TouchableOpacity>
          </View>

          <View style={styles.summaryCard}>
            <Text allowFontScaling={false} style={styles.summaryLabel}>Total Income</Text>
            <Text allowFontScaling={false} style={styles.summaryValue}>
              {formatCurrency(shiftEarnings?.total ?? null)}
            </Text>
          </View>

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#CA251B" />
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text allowFontScaling={false} style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={handleRetry} style={styles.retryButton} activeOpacity={0.85}>
                <Text allowFontScaling={false} style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isLoading && !error && shiftEarnings && shiftEarnings.shifts.length === 0 && (
            <View style={styles.emptyState}>
              <Text allowFontScaling={false} style={styles.emptyTitle}>No shifts found</Text>
              <Text allowFontScaling={false} style={styles.emptyMessage}>
                Adjust your date filters or check back later to see your shift earnings.
              </Text>
            </View>
          )}

          {shiftEarnings?.shifts.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={styles.itemCard}
              onPress={() => openDetails(item)}
            >
              <View style={styles.itemLeft}>
                <ClockFading size={moderateScale(34)} color="#CA251B" />
                <View>
                  <Text allowFontScaling={false} style={styles.itemTitle}>
                    {`Shift #${item.id}`}
                  </Text>
                  <Text allowFontScaling={false} style={styles.itemTime}>
                    {formatShiftTime(item.startTime, item.endTime)}
                  </Text>
                  <Text allowFontScaling={false} style={styles.itemCode}>
                    {formatShiftStatus(item.endTime)}
                  </Text>
                </View>
              </View>

              <View style={styles.itemRight}>
                <View style={styles.amountRow}>
                  <Text allowFontScaling={false} style={styles.itemAmount}>
                    {formatCurrency(item.total)}
                  </Text>
                  <ChevronRight
                    color="white"
                    size={moderateScale(25)}
                    style={styles.chevronIcon}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Modal
          visible={showCalendar}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCalendar(false)}
        >
          <View style={styles.calendarOverlay}>
            <View style={styles.calendarCard}>
              <DateRangeCalendar
                onDayPress={handleDateSelect}
                markedDates={getMarkedDates()}
                markingType="period"
                enableSwipeMonths
              />

              <View style={styles.calendarActions}>
                <TouchableOpacity
                  style={styles.calendarActionButton}
                  activeOpacity={0.85}
                  onPress={() => setShowCalendar(false)}
                >
                  <Text allowFontScaling={false} style={styles.calendarActionText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calendarActionButton, styles.calendarActionPrimary]}
                  activeOpacity={0.85}
                  onPress={handleApplyRange}
                >
                  <Text allowFontScaling={false} style={[styles.calendarActionText, styles.calendarActionPrimaryText]}>
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>

              {appliedRange && (
                <TouchableOpacity
                  onPress={resetRange}
                  style={styles.calendarClear}
                  activeOpacity={0.85}
                >
                  <Text allowFontScaling={false} style={styles.calendarClearText}>Clear selection</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={showDetails && Boolean(selectedShift)}
          transparent
          animationType="fade"
          onRequestClose={closeDetails}
        >
          <EarningDetailsOverlay onClose={closeDetails} shift={selectedShift} />
        </Modal>
      </View>
    </>
  );
}

const styles = ScaledSheet.create({
  header: {
    paddingTop: moderateScale(15),
  },

  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: '16@s',
    borderTopColor: '#F9FAFB',
    borderColor: '#F9FAFB',
    borderTopWidth: 2,
    borderBottomWidth: 0,
  },

  icon: {
    width: '100@s',
    height: '100@s',
  },

  headerSection: {
    alignItems: 'center',
    marginTop: '8@vs',
    marginBottom: '6@vs',
  },
  subTitle: {
    fontSize: '14@ms',
    color: '#17213A',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: '10@vs',
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: '14@vs',
  },
  dateBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16@ms',
    paddingVertical: '10@vs',
    paddingHorizontal: '16@s',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    elevation: 2,
    flex: 1,
    marginRight: '10@s',
  },
  dateText: {
    color: '#17213A',
    fontWeight: '700',
    fontSize: '13@ms',
  },
  calendarButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16@ms',
    padding: '10@s',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    elevation: 2,
  },

  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: '16@ms',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    padding: '16@s',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20@vs',
    elevation: 2,
  },
  summaryLabel: {
    color: '#17213A',
    fontWeight: '600',
    fontSize: '14@ms',
  },
  summaryValue: {
    color: '#17213A',
    fontWeight: '700',
    fontSize: '18@ms',
  },

  loadingContainer: {
    alignItems: 'center',
    marginBottom: '16@vs',
  },

  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: '14@ms',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: '14@s',
    marginBottom: '16@vs',
  },
  errorText: {
    color: '#B91C1C',
    fontWeight: '600',
    fontSize: '13@ms',
    marginBottom: '8@vs',
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#CA251B',
    borderRadius: '12@ms',
    paddingVertical: '8@vs',
    paddingHorizontal: '14@s',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '12@ms',
  },

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16@ms',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    padding: '20@s',
    alignItems: 'center',
    marginBottom: '20@vs',
    elevation: 2,
  },
  emptyTitle: {
    color: '#17213A',
    fontWeight: '700',
    fontSize: '14@ms',
    marginBottom: '6@vs',
  },
  emptyMessage: {
    color: '#6B7280',
    fontSize: '12@ms',
    textAlign: 'center',
  },

  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16@ms',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    padding: '16@s',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12@vs',
    elevation: 2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    color: '#17213A',
    fontWeight: '700',
    fontSize: '13@ms',
  },
  itemTime: {
    color: '#17213A',
    fontWeight: '400',
    fontSize: '12@ms',
  },
  itemCode: {
    color: '#6B7280',
    fontSize: '11@ms',
  },
  itemAmount: {
    color: '#CA251B',
    fontWeight: '800',
    fontSize: '15@ms',
  },
  chevronIcon: {
    backgroundColor: '#CA251B',
    borderRadius: moderateScale(7),
    padding: '4@s',
  },

  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '16@s',
  },
  calendarCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: '20@ms',
    paddingVertical: '16@vs',
    paddingHorizontal: '16@s',
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '14@vs',
    gap: 12,
  },
  calendarActionButton: {
    flex: 1,
    borderRadius: '12@ms',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    paddingVertical: '10@vs',
    alignItems: 'center',
  },
  calendarActionText: {
    color: '#17213A',
    fontWeight: '600',
    fontSize: '13@ms',
  },
  calendarActionPrimary: {
    backgroundColor: '#CA251B',
    borderColor: '#CA251B',
  },
  calendarActionPrimaryText: {
    color: '#FFFFFF',
  },
  calendarClear: {
    marginTop: '10@vs',
    alignItems: 'center',
  },
  calendarClearText: {
    color: '#CA251B',
    fontWeight: '600',
    fontSize: '12@ms',
  },
});
