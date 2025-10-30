import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { HandCoins } from 'lucide-react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import { getDriverDeposits } from '../../../services/driverService';
import type { DriverDeposit } from '../../../types/driver';

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

const PayoutsScreen: React.FC = () => {
  const [deposits, setDeposits] = useState<DriverDeposit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sortedDeposits = useMemo(
    () =>
      [...deposits].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [deposits],
  );

  const totalIncome = useMemo(
    () =>
      sortedDeposits.reduce((total, deposit) => {
        const amount = Number(deposit.depositAmount ?? 0);
        return total + (Number.isNaN(amount) ? 0 : amount);
      }, 0),
    [sortedDeposits],
  );

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

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerSection}>
        <View style={styles.headerImageWrapper}>
          <Image
            source={require('../../../../assets/hand coin.png')}
            style={styles.headerImage}
            contentFit="contain"
          />
        </View>

        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeLabel}>Total Income</Text>
          <Text style={styles.totalBadgeValue}>{formatCurrency(totalIncome)}</Text>
        </View>
      </View>
    ),
    [totalIncome],
  );

  const renderItem = useCallback(({ item }: { item: DriverDeposit }) => {
    return (
      <View style={styles.listItem}>
        <View style={styles.itemLeft}>
          <View style={styles.iconWrapper}>
            <HandCoins color="#CA251B" size={moderateScale(26)} strokeWidth={2.3} />
          </View>

          <View>
            <Text style={styles.itemTitle}>Paiment Recieved</Text>
            <Text style={styles.itemSubtitle}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        <Text style={styles.itemAmount}>{formatCurrency(item.depositAmount)}</Text>
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
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No payouts yet</Text>
        <Text style={styles.emptySubtitle}>Your payout history will appear here.</Text>
      </View>
    );
  }, [error, isLoading]);

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Payout History" titleMarginLeft={moderateScale(48)} />

      <FlatList
        data={sortedDeposits}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
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
      />
    </View>
  );
};

export default PayoutsScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: '16@vs',
    paddingBottom: '40@vs',
  },
  headerImageWrapper: {
    width: '180@s',
    height: '140@vs',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerImage: {
    width: '180@s',
    height: '140@vs',
  },
  totalBadge: {
    position: 'absolute',
    right: '20@s',
    bottom: '8@vs',
    backgroundColor: '#CA251B',
    borderRadius: '999@s',
    paddingVertical: '10@vs',
    paddingHorizontal: '22@s',
  },
  totalBadgeLabel: {
    fontSize: '12@ms',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  totalBadgeValue: {
    marginTop: '2@vs',
    fontSize: '18@ms',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: '20@s',
    paddingTop: '12@vs',
    paddingBottom: '32@vs',
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
  iconWrapper: {
    width: '52@s',
    height: '52@s',
    borderRadius: '26@s',
    backgroundColor: '#FCE9E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '14@s',
  },
  itemTitle: {
    fontSize: '15@ms',
    color: '#1F1F1F',
    fontWeight: '600',
  },
  itemSubtitle: {
    marginTop: '4@vs',
    fontSize: '12@ms',
    color: '#8A8A8A',
  },
  itemAmount: {
    fontSize: '17@ms',
    fontWeight: '700',
    color: '#CA251B',
  },
  separator: {
    height: '24@vs',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: '48@vs',
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
});
