import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { moderateScale, verticalScale, s } from 'react-native-size-matters';
import { Calendar } from 'react-native-calendars';
import { Calendar as CalendarIcon, CircleDollarSign } from 'lucide-react-native';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import { Image } from 'expo-image';
import { getDriverEarnings } from '../../../services/driverService';
import type { DriverEarningsQuery, DriverEarningsResponse } from '../../../types/driver';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { width } = Dimensions.get('screen');

export const WalletScreen: React.FC = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start?: string; end?: string }>({});
  const [appliedRange, setAppliedRange] = useState<{ start?: string; end?: string } | null>(null);
  const [earningsData, setEarningsData] = useState<DriverEarningsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();


  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined) {
      return '--';
    }

    return `${value.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} dt`;
  };

  const formatDateForApi = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');

    return `${day}/${month}/${year}`;
  };

  const fetchEarnings = useCallback(async (
    params?: DriverEarningsQuery,
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getDriverEarnings(params);
      setEarningsData(data);

      return true;
    } catch (err) {
      console.error('Failed to fetch earnings', err);
      setError('Unable to load earnings. Please try again.');

      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const handleDateSelect = (day: any) => {
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

  const handleNavigate = () => {
    navigation.navigate('EarningsScreen' as never)
  }

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

    fetchEarnings(hasParams ? params : undefined).then((success) => {
      if (success) {
        setAppliedRange(nextAppliedRange);
      }

      setShowCalendar(false);
    });
  };

  const resetRange = () => {
    setSelectedRange({});

    fetchEarnings().then((success) => {
      if (success) {
        setAppliedRange(null);
      }
    });
  };

  const renderEarningsSummary = () => {
    if (appliedRange?.start) {
      const hasDistinctEnd = Boolean(
        appliedRange.end && appliedRange.end !== appliedRange.start,
      );
      const endDate = appliedRange.end ?? appliedRange.start;

      return (
        <View style={styles.rangeSummary}>
          <View style={styles.rangeRow}>
            <Text allowFontScaling={false} style={styles.rangeLabel}>
              {hasDistinctEnd ? 'From' : 'Date'}
            </Text>
            <Text allowFontScaling={false} style={styles.rangeDate}>
              {formatDate(appliedRange.start)}
            </Text>
          </View>
          {hasDistinctEnd && (
            <View style={styles.rangeRow}>
              <Text allowFontScaling={false} style={styles.rangeLabel}>To</Text>
              <Text allowFontScaling={false} style={styles.rangeDate}>
                {formatDate(endDate)}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text allowFontScaling={false} style={styles.totalText}>Total earnings</Text>
            <Text allowFontScaling={false} style={styles.totalValue}>
              {formatCurrency(earningsData?.totalEarnings ?? null)}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.summaryBlock}>
        <View style={styles.summaryRow}>
          <Text allowFontScaling={false} style={styles.summaryLabel}>Today</Text>
          <Text allowFontScaling={false} style={styles.summaryValue}>
            {formatCurrency(earningsData?.todayBalance ?? null)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text allowFontScaling={false} style={styles.summaryLabel}>This Week</Text>
          <Text allowFontScaling={false} style={styles.summaryValue}>
            {formatCurrency(earningsData?.weekBalance ?? null)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text allowFontScaling={false} style={styles.summaryLabel}>This Month</Text>
          <Text allowFontScaling={false} style={styles.summaryValue}>
            {formatCurrency(earningsData?.monthBalance ?? null)}
          </Text>
        </View>
      </View>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };



  return (
    <View style={[styles.screen, {
      paddingTop: insets.top, paddingBottom: insets.bottom
    },]}>
      <HeaderWithBackButton title="Wallet" titleMarginLeft={s(100)} />
      <View style={styles.container}>


        <View style={styles.balanceCard}>
          <View>
            <Text allowFontScaling={false} style={styles.balanceLabel}>Available Balance</Text>
            <Text allowFontScaling={false} style={styles.balanceAmount}>
              {formatCurrency(earningsData?.avilableBalance ?? null)}
            </Text>
            <Text allowFontScaling={false} style={styles.balanceSub}>Next payout on Friday, Oct 27</Text>
          </View>
          <Image
            source={require('../../../../assets/wallet.png')}
            style={styles.icon}
            contentFit="contain"
          />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.earningsButton} onPress={handleNavigate}>
            <Text allowFontScaling={false} style={styles.earningsText}>View Earnings</Text>
            <CircleDollarSign color="#fff" size={moderateScale(26)} strokeWidth={1.6} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => {
              setSelectedRange(appliedRange ?? {});
              setShowCalendar(true);
            }}
          >
            <CalendarIcon color="#17213A" size={moderateScale(22)} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {isLoading && (
          <ActivityIndicator color="#CA251B" style={styles.loadingIndicator} />
        )}

        {error && (
          <Text allowFontScaling={false} style={styles.errorText}>
            {error}
          </Text>
        )}

        {renderEarningsSummary()}

        <Modal visible={showCalendar} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Calendar
                markingType="period"
                markedDates={getMarkedDates()}
                onDayPress={handleDateSelect}
                theme={{
                  arrowColor: '#CA251B',
                  todayTextColor: '#CA251B',
                  selectedDayBackgroundColor: '#CA251B',
                  selectedDayTextColor: '#fff',
                }}
              />
              <TouchableOpacity style={styles.applyButton} onPress={handleApplyRange}>
                <Text allowFontScaling={false} style={styles.applyLabel}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={resetRange}>
                <Text allowFontScaling={false} style={styles.resetLabel}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1, backgroundColor: '#fff', padding: moderateScale(16), borderTopColor: '#F9FAFB',
    borderColor: '#F9FAFB',
    borderTopWidth: 2,
    borderBottomWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  backArrow: {
    fontSize: moderateScale(26),
    color: '#CA251B',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    marginLeft: moderateScale(12),
    color: '#17213A',
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(14),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(18),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: verticalScale(20),
  },
  icon: {
    width: moderateScale(70),
    height: verticalScale(60),
  },
  balanceLabel: { color: '#17213A', fontWeight: '600', fontSize: moderateScale(14) },
  balanceAmount: {
    fontWeight: '800',
    fontSize: moderateScale(26),
    color: '#17213A',
    marginTop: 4,
  },
  balanceSub: { fontSize: moderateScale(12), color: '#4B5563', marginTop: 4 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  earningsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CA251B',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(6),
    paddingVertical: verticalScale(10),
  },
  earningsText: {
    color: '#fff',
    fontWeight: '400',
    marginLeft: moderateScale(2),
    marginRight: moderateScale(2),
    fontSize: moderateScale(14),
  },
  calendarButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    padding: moderateScale(10),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBlock: { marginTop: verticalScale(8) },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: verticalScale(6),
  },
  summaryLabel: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#17213A',
  },
  summaryValue: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#17213A',
  },
  rangeSummary: { marginTop: verticalScale(16) },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  rangeLabel: {
    fontSize: moderateScale(14),
    color: '#17213A',
    fontWeight: '600',
  },
  rangeDate: {
    fontSize: moderateScale(14),
    color: '#17213A',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(10),
  },
  totalText: { fontWeight: '700', fontSize: moderateScale(18), color: '#17213A' },
  totalValue: { fontWeight: '700', fontSize: moderateScale(18), color: '#17213A' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(10),
  },
  applyButton: {
    backgroundColor: '#CA251B',
    marginHorizontal: moderateScale(20),
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(12),
    marginTop: verticalScale(10),
    alignItems: 'center',
  },
  applyLabel: { color: '#fff', fontWeight: '700', fontSize: moderateScale(14) },
  resetLabel: {
    textAlign: 'center',
    color: '#CA251B',
    fontWeight: '600',
    marginVertical: verticalScale(8),
  },
  errorText: {
    color: '#CA251B',
    marginTop: verticalScale(12),
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  loadingIndicator: {
    marginTop: verticalScale(12),
  },
});
