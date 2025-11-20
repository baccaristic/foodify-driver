import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { BanknoteArrowDown, CalendarDays, ChevronDown } from 'lucide-react-native';
import { ScaledSheet, moderateScale, verticalScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDriverDeposits } from '../../../services/driverService';
import type { DriverDeposit } from '../../../types/driver';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';

const payoutsIllustration = require('../../../../assets/payouts-image.png');

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0 dt';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '0 dt';
  const fixed = numeric.toFixed(2);
  if (fixed.endsWith('.00')) return `${Math.round(numeric)} dt`;
  return `${fixed.replace(/0+$/, '').replace(/\.$/, '')} dt`;
};

const formatDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const PayoutIcon: React.FC = () => (
  <View style={styles.iconContainer}>
    <View style={styles.iconCircle}>
      <BanknoteArrowDown color="#CA251B" size={18} strokeWidth={2.4} />
    </View>
  </View>
);

const PayoutsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const insets = useSafeAreaInsets();

  const [deposits, setDeposits] = useState<DriverDeposit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  const sortedDeposits = useMemo(
    () => [...deposits].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [deposits]
  );

  const fetchDeposits = useCallback(async ({ isRefresh = false }: { isRefresh?: boolean } = {}) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const data = await getDriverDeposits();
      setDeposits(data);
    } catch (err) {
      console.error('Failed to fetch driver deposits', err);
      setError('Unable to load payouts. Pull to refresh to try again.');
    } finally {
      if (isRefresh) setRefreshing(false);
      else setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  const onRefresh = useCallback(() => fetchDeposits({ isRefresh: true }), [fetchDeposits]);

  const filteredDeposits = useMemo(
    () =>
      sortedDeposits.filter((deposit) => {
        const parsed = new Date(deposit.createdAt);
        return parsed.getFullYear() === selectedYear && parsed.getMonth() === selectedMonth;
      }),
    [selectedMonth, selectedYear, sortedDeposits]
  );

  const filteredTotalIncome = useMemo(
    () => filteredDeposits.reduce((total, deposit) => total + Number(deposit.earningsPaid ?? 0), 0),
    [filteredDeposits]
  );

  const renderItem = useCallback(
    ({ item }: { item: DriverDeposit }) => (
      <View style={styles.listItem}>
        <View style={styles.itemLeft}>
          <PayoutIcon />
          <View>
            <Text allowFontScaling={false} style={styles.itemTitle}>Payment Received</Text>
            <Text allowFontScaling={false} style={styles.itemSubtitle}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        <Text allowFontScaling={false} style={styles.itemAmount}>
          {formatCurrency(item.earningsPaid)}
        </Text>
      </View>
    ),
    []
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#CA251B" />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text allowFontScaling={false} style={styles.errorText}>{error}</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Text allowFontScaling={false} style={styles.emptyTitle}>No payouts yet</Text>
        <Text allowFontScaling={false} style={styles.emptySubtitle}>
          Your payout history will appear here.
        </Text>
      </View>
    );
  }, [error, isLoading]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <HeaderWithBackButton title="Payout History" titleMarginLeft={moderateScale(80)} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={{
          paddingTop: verticalScale(16),
          paddingBottom: insets.bottom + verticalScale(100),
          borderTopColor: '#F9FAFB',
          borderColor: '#F9FAFB',
          borderTopWidth: 2,
          borderBottomWidth: 0,
        }}
      >

        <View style={styles.heroSection}>
          <Image source={payoutsIllustration} style={styles.heroImage} resizeMode="contain" />
        </View>

        <View >

          <View style={styles.filtersRow}>
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                onPress={() => {
                  setMonthOpen(!monthOpen);
                  setYearOpen(false);
                }}
                style={styles.dropdownButton}
                activeOpacity={0.8}
              >
                <CalendarDays color="#CA251B" size={16} />
                <Text style={styles.dropdownText}>{MONTH_NAMES[selectedMonth]}</Text>
                <ChevronDown color="#1F1F1F" size={16} />
              </TouchableOpacity>

              {monthOpen && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    style={{ maxHeight: verticalScale(200) }}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <TouchableOpacity
                        key={m}
                        style={[styles.dropdownItem, idx === selectedMonth && styles.dropdownItemSelected]}
                        onPress={() => {
                          setSelectedMonth(idx);
                          setMonthOpen(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, idx === selectedMonth && styles.dropdownItemTextSelected]}>
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                onPress={() => {
                  setYearOpen(!yearOpen);
                  setMonthOpen(false);
                }}
                style={styles.dropdownButton}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownText}>{selectedYear}</Text>
                <ChevronDown color="#1F1F1F" size={16} />
              </TouchableOpacity>

              {yearOpen && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    style={{ maxHeight: verticalScale(200) }}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    {[2025, 2024, 2023].map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[styles.dropdownItem, year === selectedYear && styles.dropdownItemSelected]}
                        onPress={() => {
                          setSelectedYear(year);
                          setYearOpen(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, year === selectedYear && styles.dropdownItemTextSelected]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          <View style={styles.totalBadgeRow}>
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeLabel}>Total Income</Text>
              <Text style={styles.totalBadgeValue}>{formatCurrency(filteredTotalIncome)}</Text>
            </View>
          </View>
        </View>


        <View style={styles.listContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#CA251B" />
          ) : (
            <FlatList
              data={filteredDeposits}
              keyExtractor={(item) => `${item.id}-${item.createdAt}`}
              renderItem={renderItem}
              ListEmptyComponent={renderEmpty}
              scrollEnabled={false}
              contentContainerStyle={{
                paddingHorizontal: moderateScale(16),
                paddingTop: verticalScale(16),
                paddingBottom: verticalScale(60)
              }}
            />
          )}
        </View>
      </ScrollView>

    </View>
  );
};

export default PayoutsScreen;

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', },

  heroSection: {
    alignItems: 'center',
    marginTop: '16@vs',

  },
  heroImage: { width: '120@s', height: '120@vs' },

  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    marginTop: verticalScale(20),
    paddingHorizontal: moderateScale(64),
  },

  totalBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(12),
    paddingHorizontal: moderateScale(16),
  },


  dropdownWrapper: {
    position: 'relative',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(9),
    minWidth: moderateScale(90),
  },

  dropdownText: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#1F1F1F',
    marginHorizontal: '6@s',
  },
  dropdownList: {
    position: 'absolute',
    top: '48@vs',
    left: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: '12@s',
    width: '130@s',
    zIndex: 100,
    elevation: 4,
    maxHeight: '200@vs',
  },
  dropdownItem: {
    paddingVertical: '10@vs',
    paddingHorizontal: '12@s',
    height: '40@vs',
  },
  dropdownItemSelected: {
    backgroundColor: '#CA251B',
  },
  dropdownItemText: {
    fontSize: '14@ms',
    color: '#1F1F1F',
  },
  dropdownItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  totalBadge: {
    backgroundColor: '#CA251B',
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(10),
    alignSelf: 'flex-end',
  },


  totalBadgeLabel: {
    color: '#FFFFFF',
    fontSize: '12@ms',
    opacity: 0.9,
  },
  totalBadgeValue: {
    color: '#FFFFFF',
    fontSize: '16@ms',
    fontWeight: '700',
  },

  listContainer: {
    marginTop: verticalScale(20),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E3E3E3',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12@vs',
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { marginRight: '14@s' },
  iconCircle: {
    width: '44@s',
    height: '44@s',
    borderRadius: '22@s',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E3E3E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: { fontSize: '16@ms', color: '#1F1F1F', fontWeight: '600' },
  itemSubtitle: { marginTop: '4@vs', fontSize: '13@ms', color: '#8A8A8A' },
  itemAmount: { fontSize: '18@ms', fontWeight: '700', color: '#CA251B' },

  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: '40@vs' },
  errorContainer: { marginTop: '32@vs', paddingHorizontal: '16@s' },
  errorText: { textAlign: 'center', color: '#CA251B', fontSize: '14@ms' },
  emptyState: {
    marginTop: '60@vs',
    alignItems: 'center',
  },
  emptyTitle: { fontSize: '16@ms', fontWeight: '600', color: '#1F1F1F' },
  emptySubtitle: { marginTop: '6@vs', fontSize: '13@ms', color: '#8A8A8A' },
});