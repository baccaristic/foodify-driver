import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import { Calendar, ChevronRight, HandPlatter } from 'lucide-react-native';
import { ScaledSheet, s, vs, moderateScale } from 'react-native-size-matters';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import EarningDetailsOverlay from '../../../components/EarningDetailsOverlay';
import { Image } from 'expo-image';

export default function EarningsScreen() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const data = [
    { id: '1', title: '2X Pizza Pepperoni Di Napoli', time: '13:00 - 13:30', code: '1234567898765432', amount: '19,300 DT' },
    { id: '2', title: '2X Pizza Pepperoni Di Napoli', time: '13:00 - 13:30', code: '1234567898765432', amount: '19,300 DT' },
    { id: '3', title: '2X Pizza Pepperoni Di Napoli', time: '13:00 - 13:30', code: '1234567898765432', amount: '19,300 DT' },
  ];

  const openDetails = (item: any) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  return (
    <>
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
              Today: 8 August 2025
            </Text>
          </View>
          <TouchableOpacity style={styles.calendarButton}>
            <Calendar color="#17213A" size={moderateScale(20)} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text allowFontScaling={false} style={styles.summaryLabel}>Total Income</Text>
            <Text allowFontScaling={false} style={styles.summaryValue}>123.45 dt</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRight}>
            <Text allowFontScaling={false} style={styles.summaryLabel}>Deliveries</Text>
            <Text allowFontScaling={false} style={styles.summarySub}>17 Completed | 2 Cancelled</Text>
          </View>
        </View>

        {data.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            style={styles.itemCard}
            onPress={() => openDetails(item)}
          >
            <View style={styles.itemLeft}>
              <HandPlatter size={moderateScale(34)} color="#CA251B" />
              <View>
                <Text allowFontScaling={false} style={styles.itemTitle}>
                  {item.title}
                </Text>
                <Text allowFontScaling={false} style={styles.itemTime}>
                  {item.time}
                </Text>
                <Text allowFontScaling={false} style={styles.itemCode}>
                  {item.code}
                </Text>
              </View>
            </View>

            <View style={styles.itemRight}>
              <View style={styles.amountRow}>
                <Text allowFontScaling={false} style={styles.itemAmount}>
                  {item.amount}
                </Text>
                <ChevronRight
                  color="white"
                  size={moderateScale(25)}
                  style={{
                    backgroundColor: '#CA251B',
                    borderRadius: moderateScale(7),
                  }}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={showDetails} transparent animationType="fade">
        <EarningDetailsOverlay onClose={() => setShowDetails(false)} item={selectedItem} />
      </Modal>
    </>
  );
}

const styles = ScaledSheet.create({
  header: {
    paddingTop: moderateScale(15),
  },

  container: {
    flex: 1,
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
  divider: {
    width: 1,
    height: '55@vs',
    backgroundColor: '#CA251B',
    marginHorizontal: moderateScale(10),
  },
  summaryLeft: {
    flex: 1,
  },
  summaryRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  summaryLabel: {
    color: '#17213A',
    fontWeight: '600',
    fontSize: '18@ms',
  },
  summaryValue: {
    color: '#CA251B',
    fontWeight: '600',
    fontSize: '20@ms',
    marginTop: '4@vs',
  },
  summarySub: {
    color: '#17213A',
    fontWeight: '600',
    fontSize: '11@ms',
    marginTop: '4@vs',
  },

  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '12@ms',
    paddingVertical: '12@vs',
    paddingHorizontal: '12@s',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    marginBottom: '10@vs',
    elevation: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    marginTop: '2@vs',
  },
  itemCode: {
    color: '#9CA3AF',
    fontSize: '11@ms',
    marginTop: '1@vs',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemAmount: {
    color: '#CA251B',
    fontWeight: '800',
    fontSize: '15@ms',
  },
});
