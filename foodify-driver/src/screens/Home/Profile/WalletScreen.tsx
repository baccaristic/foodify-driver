import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { moderateScale, verticalScale, s } from 'react-native-size-matters';
import { Calendar } from 'react-native-calendars';
import { Wallet, Calendar as CalendarIcon, DollarSign, CircleDollarSign } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';

const { width } = Dimensions.get('screen');

export const WalletScreen: React.FC = () => {
  const navigation = useNavigation();

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start?: string; end?: string }>({});
  const [earnings, setEarnings] = useState('123,32 dt');
  const [balance, setBalance] = useState('123.45 dt');

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

  const handleApplyRange = () => {
    setShowCalendar(false);
  };

  const resetRange = () => {
    setSelectedRange({});
  };

  const renderEarningsSummary = () => {
    if (selectedRange.start && selectedRange.end) {
      return (
        <View style={styles.rangeSummary}>
          <View style={styles.rangeRow}>
            <Text style={styles.rangeLabel}>From</Text>
            <Text style={styles.rangeDate}>{formatDate(selectedRange.start)}</Text>
          </View>
          <View style={styles.rangeRow}>
            <Text style={styles.rangeLabel}>To</Text>
            <Text style={styles.rangeDate}>{formatDate(selectedRange.end)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total earnings</Text>
            <Text style={styles.totalValue}>{earnings}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.summaryBlock}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Today</Text>
          <Text style={styles.summaryValue}>{earnings}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>This Week</Text>
          <Text style={styles.summaryValue}>1213,32 dt</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>This Month</Text>
          <Text style={styles.summaryValue}>1213,32 dt</Text>
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
    <>

      <View style={styles.header}>
        <HeaderWithBackButton title="Wallet" titleMarginLeft={s(100)} />
      </View>
      <View style={styles.container}>


        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>{balance}</Text>
            <Text style={styles.balanceSub}>Next payout on Friday, Oct 27</Text>
          </View>
          <Wallet color="#CA251B" size={moderateScale(60)} strokeWidth={2.5} />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.earningsButton}>

            <Text style={styles.earningsText}>View Earnings</Text>
            <CircleDollarSign color="#fff" size={moderateScale(26)} strokeWidth={1.6} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => setShowCalendar(true)}
          >
            <CalendarIcon color="#17213A" size={moderateScale(22)} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

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
                <Text style={styles.applyLabel}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={resetRange}>
                <Text style={styles.resetLabel}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: moderateScale(15),
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
});
