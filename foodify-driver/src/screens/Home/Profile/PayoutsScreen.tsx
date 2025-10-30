import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { CalendarDays, ChevronDown, HandCoins } from 'lucide-react-native';
import { ScaledSheet, s, vs, moderateScale } from 'react-native-size-matters';

import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import { getDriverDeposits } from '../../../services/driverService';
import type { DriverDeposit } from '../../../types/driver';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type PickerType = 'month' | 'year';

type StatusStyle = {
  backgroundColor: string;
  textColor: string;
};

const getStatusStyle = (status: string): StatusStyle => {
  const normalized = status?.toLowerCase?.() ?? '';

  if (normalized === 'completed' || normalized === 'paid' || normalized === 'confirmed') {
    return { backgroundColor: '#DCFCE7', textColor: '#166534' };
  }

  if (normalized === 'pending' || normalized === 'processing') {
    return { backgroundColor: '#FEF3C7', textColor: '#92400E' };
  }

  if (normalized === 'failed' || normalized === 'rejected') {
    return { backgroundColor: '#FEE2E2', textColor: '#B91C1C' };
  }

  return { backgroundColor: '#E5E7EB', textColor: '#1F2937' };
};

const formatStatusLabel = (status: string): string =>
  status
    ? status
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/(^|\s)([a-z])/g, (_, boundary: string, letter: string) => `${boundary}${letter.toUpperCase()}`)
    : 'Unknown';

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '--';
  }

  return `${Number(value).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} dt`;
};

const formatDate = (value: string): string => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '--';
  }

  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const buildYearOptions = (deposits: DriverDeposit[], selectedYear: number): number[] => {
  const years = new Set<number>();

  deposits.forEach((deposit) => {
    const date = new Date(deposit.createdAt);
    if (!Number.isNaN(date.getTime())) {
      years.add(date.getFullYear());
    }
  });

  if (years.size === 0) {
    years.add(new Date().getFullYear());
  }

  if (!years.has(selectedYear)) {
    years.add(selectedYear);
  }

  return Array.from(years).sort((a, b) => b - a);
};

const PayoutsScreen: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const [deposits, setDeposits] = useState<DriverDeposit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [activePicker, setActivePicker] = useState<PickerType | null>(null);

  const fetchDeposits = useCallback(
    async ({ isRefresh = false }: { isRefresh?: boolean } = {}) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const data = await getDriverDeposits();
        setDeposits(data);
      } catch (err) {
        console.error('Failed to fetch driver deposits', err);
        setError('Unable to load payouts. Pull to refresh or try again later.');
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  useEffect(() => {
    if (deposits.length === 0) {
      return;
    }

    const hasMatch = deposits.some((deposit) => {
      const createdDate = new Date(deposit.createdAt);
      if (Number.isNaN(createdDate.getTime())) {
        return false;
      }

      return (
        createdDate.getMonth() === selectedMonth && createdDate.getFullYear() === selectedYear
      );
    });

    if (hasMatch) {
      return;
    }

    const sortedByDate = [...deposits].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

    const latest = sortedByDate[0];
    const latestDate = new Date(latest.createdAt);

    if (!Number.isNaN(latestDate.getTime())) {
      if (latestDate.getMonth() !== selectedMonth) {
        setSelectedMonth(latestDate.getMonth());
      }

      if (latestDate.getFullYear() !== selectedYear) {
        setSelectedYear(latestDate.getFullYear());
      }
    }
  }, [deposits, selectedMonth, selectedYear]);

  const filteredDeposits = useMemo(() => {
    return deposits
      .filter((deposit) => {
        const createdDate = new Date(deposit.createdAt);
        if (Number.isNaN(createdDate.getTime())) {
          return false;
        }

        return (
          createdDate.getMonth() === selectedMonth && createdDate.getFullYear() === selectedYear
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [deposits, selectedMonth, selectedYear]);

  const totalIncome = useMemo(
    () =>
      filteredDeposits.reduce((accumulator, deposit) => accumulator + (deposit.depositAmount ?? 0), 0),
    [filteredDeposits],
  );

  const yearOptions = useMemo(
    () => buildYearOptions(deposits, selectedYear),
    [deposits, selectedYear],
  );

  const openPicker = (type: PickerType) => {
    setActivePicker(type);
  };

  const closePicker = () => {
    setActivePicker(null);
  };

  const handleSelectMonth = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    closePicker();
  };

  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    closePicker();
  };

  const renderPickerOptions = () => {
    const isMonthPicker = activePicker === 'month';
    return (
      <Modal
        transparent
        visible={activePicker !== null}
        animationType="fade"
        onRequestClose={closePicker}
      >
        <TouchableWithoutFeedback onPress={closePicker}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {(isMonthPicker ? MONTH_NAMES : yearOptions).map((value, index) => {
              const isSelected = isMonthPicker
                ? index === selectedMonth
                : value === selectedYear;

              return (
                <TouchableOpacity
                  key={isMonthPicker ? MONTH_NAMES[index] : String(value)}
                  style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                  activeOpacity={0.85}
                  onPress={() =>
                    isMonthPicker ? handleSelectMonth(index) : handleSelectYear(value as number)
                  }
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected && styles.modalOptionTextSelected,
                    ]}
                  >
                    {isMonthPicker ? MONTH_NAMES[index] : value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    );
  };

  const onRefresh = useCallback(() => {
    fetchDeposits({ isRefresh: true });
  }, [fetchDeposits]);

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Payout History" titleMarginLeft={s(48)} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#CA251B"
            colors={["#CA251B"]}
          />
        }
      >
        <View style={styles.heroSection}>
          <Image
            source={require('../../../../assets/hand coin.png')}
            style={styles.heroImage}
            contentFit="contain"
          />

          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Income</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalIncome)}</Text>
          </View>
        </View>

        <Text style={styles.heroSubtitle}>
          Stay on top of the payouts you have received from Foodify.
        </Text>

        <View style={styles.filterSection}>
          <View style={styles.filterInfo}>
            <CalendarDays color="#CA251B" size={moderateScale(24)} />
            <Text style={styles.filterLabel}>Filter by date</Text>
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.filterButton}
              activeOpacity={0.85}
              onPress={() => openPicker('month')}
            >
              <Text style={styles.filterButtonText}>{MONTH_NAMES[selectedMonth]}</Text>
              <ChevronDown color="#CA251B" size={moderateScale(18)} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, styles.filterButtonSpacing]}
              activeOpacity={0.85}
              onPress={() => openPicker('year')}
            >
              <Text style={styles.filterButtonText}>{selectedYear}</Text>
              <ChevronDown color="#CA251B" size={moderateScale(18)} />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#CA251B" />
            <Text style={styles.loadingText}>Loading your payouts...</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <TouchableOpacity style={styles.errorContainer} activeOpacity={0.85} onPress={() => fetchDeposits()}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}

        {!isLoading && !error && filteredDeposits.length === 0 ? (
          <View style={styles.emptyState}>
            <HandCoins color="#A1A1AA" size={moderateScale(48)} />
            <Text style={styles.emptyTitle}>No payouts yet</Text>
            <Text style={styles.emptySubtitle}>
              Once a payout is processed, it will show up here along with its status.
            </Text>
          </View>
        ) : null}

        {!isLoading && !error
          ? filteredDeposits.map((deposit) => {
              const statusStyle = getStatusStyle(deposit.status);

              return (
                <View key={`${deposit.id}-${deposit.createdAt}`} style={styles.depositCard}>
                  <View style={styles.depositLeft}>
                    <View style={styles.depositIconCircle}>
                      <HandCoins color="#CA251B" size={moderateScale(28)} strokeWidth={2.2} />
                    </View>

                    <View style={styles.depositDetails}>
                      <Text style={styles.depositTitle}>Payment Received</Text>
                      <Text style={styles.depositDate}>{formatDate(deposit.createdAt)}</Text>

                      <View
                        style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}
                      >
                        <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
                          {formatStatusLabel(deposit.status)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.depositRight}>
                    <Text style={styles.depositAmount}>{formatCurrency(deposit.depositAmount)}</Text>

                    <View style={styles.depositMetaRow}>
                      <Text style={styles.depositMetaLabel}>Earnings</Text>
                      <Text style={styles.depositMetaValue}>{formatCurrency(deposit.earningsPaid)}</Text>
                    </View>

                    <View style={styles.depositMetaRow}>
                      <Text style={styles.depositMetaLabel}>Fees</Text>
                      <Text style={styles.depositMetaValue}>{formatCurrency(deposit.feesDeducted)}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          : null}
      </ScrollView>

      {renderPickerOptions()}
    </View>
  );
};

export default PayoutsScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: '20@s',
    paddingBottom: '32@vs',
  },
  heroSection: {
    marginTop: '12@vs',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF4F3',
    borderRadius: '18@s',
    paddingHorizontal: '18@s',
    paddingVertical: '16@vs',
  },
  heroImage: {
    width: '120@s',
    height: '120@s',
  },
  totalCard: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: '14@ms',
    color: '#CA251B',
    fontWeight: '600',
  },
  totalValue: {
    marginTop: '4@vs',
    fontSize: '24@ms',
    fontWeight: '700',
    color: '#17213A',
  },
  heroSubtitle: {
    marginTop: '16@vs',
    fontSize: '14@ms',
    color: '#4B5563',
    lineHeight: '20@vs',
  },
  filterSection: {
    marginTop: '20@vs',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: '16@s',
    paddingHorizontal: '16@s',
    paddingVertical: '14@vs',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 4,
  },
  filterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    marginLeft: '10@s',
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#17213A',
  },
  filterActions: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: '14@s',
    paddingVertical: '10@vs',
    borderRadius: '12@s',
  },
  filterButtonSpacing: {
    marginLeft: '10@s',
  },
  filterButtonText: {
    marginRight: '6@s',
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#CA251B',
  },
  loadingContainer: {
    marginTop: '40@vs',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: '12@vs',
    fontSize: '14@ms',
    color: '#6B7280',
  },
  errorContainer: {
    marginTop: '32@vs',
    padding: '16@s',
    borderRadius: '16@s',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: '14@ms',
    color: '#B91C1C',
    fontWeight: '600',
  },
  retryText: {
    marginTop: '6@vs',
    fontSize: '13@ms',
    color: '#CA251B',
    fontWeight: '500',
  },
  emptyState: {
    marginTop: '48@vs',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '12@s',
  },
  emptyTitle: {
    marginTop: '16@vs',
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#111827',
  },
  emptySubtitle: {
    marginTop: '8@vs',
    fontSize: '14@ms',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: '20@vs',
  },
  depositCard: {
    marginTop: '20@vs',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: '18@s',
    backgroundColor: '#FFFFFF',
    padding: '18@s',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  depositLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: '12@s',
  },
  depositIconCircle: {
    width: '52@s',
    height: '52@s',
    borderRadius: '26@s',
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '14@s',
  },
  depositDetails: {
    flex: 1,
  },
  depositTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#111827',
  },
  depositDate: {
    marginTop: '6@vs',
    fontSize: '13@ms',
    color: '#6B7280',
  },
  statusBadge: {
    marginTop: '10@vs',
    alignSelf: 'flex-start',
    borderRadius: '999@s',
    paddingHorizontal: '12@s',
    paddingVertical: '4@vs',
  },
  statusText: {
    fontSize: '12@ms',
    fontWeight: '600',
  },
  depositRight: {
    alignItems: 'flex-end',
  },
  depositAmount: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#CA251B',
  },
  depositMetaRow: {
    marginTop: '8@vs',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '120@s',
  },
  depositMetaLabel: {
    fontSize: '12@ms',
    color: '#6B7280',
  },
  depositMetaValue: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: '#111827',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  modalContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: '20@s',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20@s',
    paddingVertical: '12@vs',
    maxHeight: '340@vs',
  },
  modalOption: {
    paddingVertical: '12@vs',
    paddingHorizontal: '20@s',
  },
  modalOptionSelected: {
    backgroundColor: '#FFF4F3',
  },
  modalOptionText: {
    fontSize: '15@ms',
    color: '#1F2937',
  },
  modalOptionTextSelected: {
    color: '#CA251B',
    fontWeight: '700',
  },
});
