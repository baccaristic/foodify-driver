import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { ScaledSheet, s, vs, moderateScale } from 'react-native-size-matters';
import { Image } from 'expo-image';
import { CheckCircle } from 'lucide-react-native';

const { width } = Dimensions.get('screen');

export default function EarningDetailsOverlay({ onClose, item }: any) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Image
          source={require('../../assets/moto.png')} 
          style={styles.icon}
          contentFit="contain"
        />

        <Text allowFontScaling={false} style={styles.amount}>123.45 dt</Text>
        <Text allowFontScaling={false} style={styles.deliveryId}>
          Delivery #{item?.code ?? '1234567898'}
        </Text>

        <View style={styles.statusBox}>
          <Text allowFontScaling={false} style={styles.statusText}>Completed</Text>
          <CheckCircle color="#FFF" size={moderateScale(14)} style={{ marginLeft: s(6) }} />
        </View>

        <Text allowFontScaling={false} style={styles.timeText}>
          Accepted : 11:30 | Completed: 12:01
        </Text>

        <Text allowFontScaling={false} style={styles.sectionTitle}>Earnings Breakdown</Text>
        <View style={styles.infoBox}>
          <View style={styles.row}>
            <Text allowFontScaling={false} style={styles.label}>Base fee</Text>
            <Text allowFontScaling={false} style={styles.value}>xx.00 dt</Text>
          </View>
          <View style={styles.row}>
            <Text allowFontScaling={false} style={styles.label}>Tips</Text>
            <Text allowFontScaling={false} style={styles.value}>xx.00 dt</Text>
          </View>
          <View style={[styles.row, { marginTop: vs(6) }]}>
            <Text allowFontScaling={false} style={styles.totalLabel}>Total Earnings</Text>
            <Text allowFontScaling={false} style={styles.totalValue}>xx.00 dt</Text>
          </View>
        </View>

        <Text allowFontScaling={false} style={styles.sectionTitle}>Location & Order Info</Text>
        <View style={styles.infoBox}>
          <View style={styles.row}>
            <Text allowFontScaling={false} style={styles.infoLabel}>Pickup Location</Text>
            <Text allowFontScaling={false} style={styles.infoValue}>Di Napoli Menzah 5</Text>
          </View>
          <View style={styles.row}>
            <Text allowFontScaling={false} style={styles.infoLabel}>Order Code</Text>
            <Text allowFontScaling={false} style={styles.infoValue}>1234567898765432</Text>
          </View>
          <View style={styles.row}>
            <Text allowFontScaling={false} style={styles.infoLabel}>Delivery ID</Text>
            <Text allowFontScaling={false} style={styles.infoValue}>876543234567</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={styles.closeBtn}>
          <Text allowFontScaling={false} style={styles.closeText}>Close</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    width: '110@s',
    height: '110@s',
    marginBottom: '10@vs',
  },
  amount: {
    color: '#CA251B',
    fontWeight: '800',
    fontSize: '22@ms',
    marginTop: '4@vs',
  },
  deliveryId: {
    color: '#9CA3AF',
    fontSize: '12@ms',
    marginTop: '2@vs',
  },

  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CA251B',
    borderRadius: '8@ms',
    paddingHorizontal: '12@s',
    paddingVertical: '4@vs',
    marginTop: '8@vs',
  },
  statusText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: '13@ms',
  },
  timeText: {
    color: '#17213A',
    fontSize: '12@ms',
    marginTop: '10@vs',
  },

  sectionTitle: {
    color: '#17213A',
    fontWeight: '800',
    fontSize: '16@ms',
    alignSelf: 'flex-start',
    marginTop: '20@vs',
    marginBottom: '6@vs',
  },

  infoBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: '12@ms',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    padding: '14@s',
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: '4@vs',
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

  infoLabel: {
    color: '#CA251B',
    fontWeight: '600',
    fontSize: '13@ms',
  },
  infoValue: {
    color: '#17213A',
    fontWeight: '700',
    fontSize: '13@ms',
    flexShrink: 1,
    textAlign: 'right',
  },

  closeBtn: {
    backgroundColor: '#CA251B',
    borderRadius: '10@ms',
    paddingVertical: '12@vs',
    paddingHorizontal: '34@s',
    marginTop: '22@vs',
  },
  closeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '14@ms',
  },
});
