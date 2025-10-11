import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ScaledSheet, s, vs, moderateScale } from 'react-native-size-matters';
import { Image } from 'expo-image';
import { HandPlatter, ChevronDown, ChevronUp } from 'lucide-react-native';

export default function ShiftDetailsOverlay({ onClose }: any) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const data = [
    { id: '1', title: '2 Items - Di Napoli', time: '13:00 - 13:30', code: '1234567898765432', amount: '19,300 DT' },
    { id: '2', title: '2 Items - Di Napoli', time: '13:00 - 13:30', code: '1234567898765432', amount: '19,300 DT' },
    { id: '3', title: '2 Items - Di Napoli', time: '13:00 - 13:30', code: '1234567898765432', amount: '19,300 DT' },
  ];

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: vs(30) }}
        >
          {/* Icon */}
          <Image
            source={require('../../assets/moto.png')}
            style={styles.icon}
            contentFit="contain"
          />

          {/* Shift Summary */}
          <View style={styles.summaryBox}>
            <Text allowFontScaling={false} style={styles.summaryDate}>23 November 2025</Text>
            <Text allowFontScaling={false} style={styles.summaryTime}>From : 13:00  to 16:30</Text>
            <Text allowFontScaling={false} style={styles.summaryAmount}>123.45 dt</Text>
          </View>

          {/* Section Title */}
          <Text allowFontScaling={false} style={styles.sectionTitle}>Shift Breakdown</Text>

          {/* Orders List */}
          {data.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => toggleExpand(item.id)}
                style={styles.itemHeader}
              >
                <View style={styles.itemLeft}>
                  <HandPlatter size={moderateScale(32)} color="#CA251B" />
                  <View>
                    <Text allowFontScaling={false} style={styles.itemTitle}>{item.title}</Text>
                    <Text allowFontScaling={false} style={styles.itemTime}>{item.time}</Text>
                    <Text allowFontScaling={false} style={styles.itemCode}>{item.code}</Text>
                  </View>
                </View>

                <View style={styles.itemRight}>
                  <Text allowFontScaling={false} style={styles.itemAmount}>{item.amount}</Text>
                  {expandedItem === item.id ? (
                    <ChevronUp
                      color="white"
                      size={moderateScale(24)}
                      style={styles.arrowIcon}
                    />
                  ) : (
                    <ChevronDown
                      color="white"
                      size={moderateScale(24)}
                      style={styles.arrowIcon}
                    />
                  )}
                </View>
              </TouchableOpacity>

              {/* Expanded Details */}
              {expandedItem === item.id && (
                <View style={styles.expandedBox}>
                  <View style={styles.redLine} />
                  <View style={styles.breakdownRow}>
                    <Text allowFontScaling={false} style={styles.label}>Base fee</Text>
                    <Text allowFontScaling={false} style={styles.value}>xx.00 dt</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text allowFontScaling={false} style={styles.label}>Tips</Text>
                    <Text allowFontScaling={false} style={styles.value}>xx.00 dt</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text allowFontScaling={false} style={styles.totalLabel}>Total Earnings</Text>
                    <Text allowFontScaling={false} style={styles.totalValue}>xx.00 dt</Text>
                  </View>

                  <Text allowFontScaling={false} style={styles.subSectionTitle}>Location & Order Info</Text>

                  <View style={styles.infoRow}>
                    <Text allowFontScaling={false} style={styles.infoLabel}>Pickup Location</Text>
                    <Text allowFontScaling={false} style={styles.infoValue}>Di Napoli Menzah 5</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text allowFontScaling={false} style={styles.infoLabel}>Delivery Location</Text>
                    <Text allowFontScaling={false} style={styles.infoValue}>Résidence Elyes, Soukra</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text allowFontScaling={false} style={styles.infoLabel}>Order Code</Text>
                    <Text allowFontScaling={false} style={styles.infoValue}>1234567898765432</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text allowFontScaling={false} style={styles.infoLabel}>Delivery ID</Text>
                    <Text allowFontScaling={false} style={styles.infoValue}>876543234567</Text>
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Close Button */}
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
  },
  summaryAmount: {
    color: '#CA251B',
    fontWeight: '700',
    fontSize: '20@ms',
    marginTop: '6@vs',
  },

  sectionTitle: {
    color: '#17213A',
    fontWeight: '800',
    fontSize: '16@ms',
    marginBottom: '10@vs',
  },

  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: '14@ms',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    marginBottom: '10@vs',
    elevation: 2,
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '12@vs',
    paddingHorizontal: '12@s',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemTitle: { color: '#17213A', fontWeight: '700', fontSize: '13@ms' },
  itemTime: { color: '#17213A', fontWeight: '400', fontSize: '12@ms' },
  itemCode: { color: '#9CA3AF', fontSize: '11@ms' },
  itemAmount: { color: '#CA251B', fontWeight: '800', fontSize: '15@ms' },
  arrowIcon: {
    backgroundColor: '#CA251B',
    borderRadius: moderateScale(7),
    padding: 3,
  },

  expandedBox: {
    paddingHorizontal: '14@s',
    paddingVertical: '8@vs',
    borderTopColor: '#CA251B',
    borderTopWidth: 1,
    backgroundColor: '#FAFAFA',
  },
  redLine: {
    height: 1,
    backgroundColor: '#CA251B',
    marginVertical: '8@vs',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: '3@vs',
  },
  label: {
    color: '#CA251B',
    fontWeight: '600',
    fontSize: '13@ms',
  },
  value: {
    color: '#17213A',
    fontWeight: '700',
    fontSize: '13@ms',
  },
  totalLabel: {
    color: '#CA251B',
    fontWeight: '700',
    fontSize: '14@ms',
  },
  totalValue: {
    color: '#17213A',
    fontWeight: '800',
    fontSize: '14@ms',
  },
  subSectionTitle: {
    color: '#17213A',
    fontWeight: '700',
    fontSize: '14@ms',
    marginTop: '10@vs',
    marginBottom: '4@vs',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: '2@vs',
  },
  infoLabel: {
    color: '#CA251B',
    fontWeight: '600',
    fontSize: '13@ms',
  },
  infoValue: {
    color: '#17213A',
    fontWeight: '700',
    fontSize: '13@ms',
    textAlign: 'right',
  },

  closeBtn: {
    backgroundColor: '#CA251B',
    borderRadius: '10@ms',
    paddingVertical: '12@vs',
    paddingHorizontal: '34@s',
    marginTop: '20@vs',
    alignSelf: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '14@ms',
  },
});
