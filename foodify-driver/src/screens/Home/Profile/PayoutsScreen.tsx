import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { ArrowLeft, BanknoteArrowDown, CalendarDays, ChevronDown } from 'lucide-react-native';
import { ScaledSheet } from 'react-native-size-matters';

import { getDriverDeposits } from '../../../services/driverService';
import type { DriverDeposit } from '../../../types/driver';

const payoutsIllustration = require('../../../../assets/payouts-image.png');

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

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return '0 dt';
  }

  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return '0 dt';
  }

  const fixed = numeric.toFixed(2);

  if (fixed.endsWith('.00')) {
    return `${Math.round(numeric)} dt`;
  }

  return `${fixed.replace(/0+$/, '').replace(/\.$/, '')} dt`;
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

type PickerOption = {
  label: string;
  value: number;
};

const PickerModal: React.FC<{
  title: string;
  visible: boolean;
  options: PickerOption[];
  selectedValue: number;
  onSelect: (value: number) => void;
  onClose: () => void;
}> = ({ title, visible, options, selectedValue, onSelect, onClose }) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <Text allowFontScaling={false} style={styles.modalTitle}>
                {title}
              </Text>

              {options.map((option) => {
                const isSelected = option.value === selectedValue;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                    activeOpacity={0.85}
                    onPress={() => {
                      onSelect(option.value);
                      onClose();
                    }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={[styles.modalOptionLabel, isSelected && styles.modalOptionLabelSelected]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const PayoutIcon: React.FC = () => (
  <View style={styles.iconContainer}>
    <View style={styles.iconCircle}>
      <BanknoteArrowDown color="#FFFFFF" size={18} strokeWidth={2.4} />
    </View>
  </View>
);

const PayoutsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const [deposits, setDeposits] = useState<DriverDeposit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMonthPickerVisible, setMonthPickerVisible] = useState(false);
  const [isYearPickerVisible, setYearPickerVisible] = useState(false);

  const sortedDeposits = useMemo(
    () =>
      [...deposits].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [deposits],
  );

  const initialReferenceDate = useMemo(() => {
    if (sortedDeposits[0]) {
      const parsed = new Date(sortedDeposits[0].createdAt);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return new Date();
  }, [sortedDeposits]);

  const [selectedYear, setSelectedYear] = useState<number>(initialReferenceDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(initialReferenceDate.getMonth());

  useEffect(() => {
    if (!sortedDeposits[0]) {
      return;
    }

    const latest = new Date(sortedDeposits[0].createdAt);

    if (Number.isNaN(latest.getTime())) {
      return;
    }

    setSelectedYear((current) => (current === latest.getFullYear() ? current : latest.getFullYear()));
    setSelectedMonth((current) => (current === latest.getMonth() ? current : latest.getMonth()));
  }, [sortedDeposits]);

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
        setError('Unable to load payouts. Pull to refresh to try again.');
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

  const onRefresh = useCallback(() => {
    fetchDeposits({ isRefresh: true });
  }, [fetchDeposits]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();

    sortedDeposits.forEach((deposit) => {
      const parsed = new Date(deposit.createdAt);
      const year = parsed.getFullYear();

      if (!Number.isNaN(year)) {
        years.add(year);
      }
    });

    if (years.size === 0) {
      years.add(selectedYear);
    }

    return Array.from(years).sort((a, b) => b - a);
  }, [selectedYear, sortedDeposits]);

  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const availableMonths = useMemo(() => {
    const months = new Set<number>();

    sortedDeposits.forEach((deposit) => {
      const parsed = new Date(deposit.createdAt);
      const year = parsed.getFullYear();
      const month = parsed.getMonth();

      if (!Number.isNaN(year) && !Number.isNaN(month) && year === selectedYear) {
        months.add(month);
      }
    });

    if (months.size === 0) {
      months.add(selectedMonth);
    }

    return Array.from(months).sort((a, b) => b - a);
  }, [selectedMonth, selectedYear, sortedDeposits]);

  useEffect(() => {
    if (!availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const filteredDeposits = useMemo(
    () =>
      sortedDeposits.filter((deposit) => {
        const parsed = new Date(deposit.createdAt);
        const year = parsed.getFullYear();
        const month = parsed.getMonth();

        if (Number.isNaN(year) || Number.isNaN(month)) {
          return false;
        }

        return year === selectedYear && month === selectedMonth;
      }),
    [selectedMonth, selectedYear, sortedDeposits],
  );

  const filteredTotalIncome = useMemo(
    () =>
      filteredDeposits.reduce((total, deposit) => {
        const amount = Number(deposit.depositAmount ?? 0);
        return total + (Number.isNaN(amount) ? 0 : amount);
      }, 0),
    [filteredDeposits],
  );

  const renderItem = useCallback(({ item }: { item: DriverDeposit }) => {
    return (
      <View style={styles.listItem}>
        <View style={styles.itemLeft}>
          <PayoutIcon />

          <View>
            <Text allowFontScaling={false} style={styles.itemTitle}>
              Paiment Recieved
            </Text>
            <Text allowFontScaling={false} style={styles.itemSubtitle}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>

        <Text allowFontScaling={false} style={styles.itemAmount}>
          {formatCurrency(item.depositAmount)}
        </Text>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: DriverDeposit) => `${item.id}-${item.createdAt}`, []);

  const renderSeparator = useCallback(() => <View style={styles.separator} />, []);

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
          <Text allowFontScaling={false} style={styles.errorText}>
            {error}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text allowFontScaling={false} style={styles.emptyTitle}>
          No payouts yet
        </Text>
        <Text allowFontScaling={false} style={styles.emptySubtitle}>
          Your payout history will appear here.
        </Text>
      </View>
    );
  }, [error, isLoading]);

  const monthOptions = useMemo<PickerOption[]>(
    () =>
      availableMonths.map((month) => ({
        label: MONTH_NAMES[month],
        value: month,
      })),
    [availableMonths],
  );

  const yearOptions = useMemo<PickerOption[]>(
    () => availableYears.map((year) => ({ label: `${year}`, value: year })),
    [availableYears],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            accessibilityLabel="Go back"
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft color="#1F1F1F" size={22} strokeWidth={2.4} />
          </TouchableOpacity>

          <Text allowFontScaling={false} style={styles.headerTitle}>
            Payout History
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            <Image resizeMode="contain" source={payoutsIllustration} style={styles.heroImage} />
          </View>

          <View style={styles.totalBadge}>
            <Text allowFontScaling={false} style={styles.totalBadgeLabel}>
              Total Income
            </Text>
            <Text allowFontScaling={false} style={styles.totalBadgeValue}>
              {formatCurrency(filteredTotalIncome)}
            </Text>
          </View>
        </View>

        <View style={styles.filtersRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.filterPill}
            onPress={() => setMonthPickerVisible(true)}
          >
            <CalendarDays color="#CA251B" size={18} strokeWidth={2.2} />
            <Text allowFontScaling={false} style={styles.filterPillText}>
              {MONTH_NAMES[selectedMonth]}
            </Text>
            <ChevronDown color="#CA251B" size={18} strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.filterPill, styles.yearPill]}
            onPress={() => setYearPickerVisible(true)}
          >
            <Text allowFontScaling={false} style={styles.filterPillText}>
              {selectedYear}
            </Text>
            <ChevronDown color="#CA251B" size={18} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredDeposits}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={renderSeparator}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#CA251B"
              colors={["#CA251B"]}
            />
          }
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <PickerModal
        title="Select month"
        visible={isMonthPickerVisible}
        options={monthOptions}
        selectedValue={selectedMonth}
        onSelect={setSelectedMonth}
        onClose={() => setMonthPickerVisible(false)}
      />

      <PickerModal
        title="Select year"
        visible={isYearPickerVisible}
        options={yearOptions}
        selectedValue={selectedYear}
        onSelect={setSelectedYear}
        onClose={() => setYearPickerVisible(false)}
      />
    </SafeAreaView>
  );
};

export default PayoutsScreen;

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: '24@s',
    paddingBottom: '24@vs',
    paddingTop: '12@vs',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: '44@s',
    height: '44@s',
    borderRadius: '22@s',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: '20@ms',
    fontWeight: '700',
    color: '#1F1F1F',
  },
  headerSpacer: {
    width: '44@s',
    height: '44@s',
  },
  heroSection: {
    marginTop: '24@vs',
    marginBottom: '36@vs',
    position: 'relative',
    alignItems: 'center',
    paddingBottom: '28@vs',
  },
  heroCard: {
    width: '100%',
    borderRadius: '24@s',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
    paddingVertical: '28@vs',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '200@s',
    height: '140@vs',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '20@vs',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '22@s',
    borderWidth: 1,
    borderColor: '#E3E3E3',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: '14@s',
    paddingVertical: '10@vs',
    marginRight: '12@s',
  },
  yearPill: {
    marginRight: 0,
    paddingHorizontal: '18@s',
  },
  filterPillText: {
    fontSize: '14@ms',
    color: '#1F1F1F',
    fontWeight: '600',
    marginHorizontal: '8@s',
  },
  totalBadge: {
    backgroundColor: '#CA251B',
    borderRadius: '24@s',
    paddingVertical: '12@vs',
    paddingHorizontal: '18@s',
    alignItems: 'flex-start',
    position: 'absolute',
    right: '20@s',
    bottom: 0,
  },
  totalBadgeLabel: {
    fontSize: '12@ms',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  totalBadgeValue: {
    fontSize: '18@ms',
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: '2@vs',
  },
  listContent: {
    paddingBottom: '40@vs',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: '14@s',
  },
  iconCircle: {
    width: '44@s',
    height: '44@s',
    borderRadius: '22@s',
    backgroundColor: '#CA251B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: '16@ms',
    color: '#1F1F1F',
    fontWeight: '600',
  },
  itemSubtitle: {
    marginTop: '4@vs',
    fontSize: '13@ms',
    color: '#8A8A8A',
  },
  itemAmount: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#CA251B',
  },
  separator: {
    height: '18@vs',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '40@vs',
  },
  errorContainer: {
    marginTop: '32@vs',
    paddingHorizontal: '20@s',
  },
  errorText: {
    textAlign: 'center',
    color: '#CA251B',
    fontSize: '14@ms',
  },
  emptyState: {
    marginTop: '60@vs',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#1F1F1F',
  },
  emptySubtitle: {
    marginTop: '6@vs',
    fontSize: '13@ms',
    color: '#8A8A8A',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '32@s',
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: '20@s',
    paddingVertical: '20@vs',
    paddingHorizontal: '20@s',
  },
  modalTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: '12@vs',
  },
  modalOption: {
    paddingVertical: '10@vs',
    paddingHorizontal: '12@s',
    borderRadius: '12@s',
    marginBottom: '8@vs',
  },
  modalOptionSelected: {
    backgroundColor: '#FCE9E7',
  },
  modalOptionLabel: {
    fontSize: '15@ms',
    color: '#1F1F1F',
  },
  modalOptionLabelSelected: {
    color: '#CA251B',
    fontWeight: '600',
  },
});
