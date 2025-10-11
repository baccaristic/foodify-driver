import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ScaledSheet, vs } from 'react-native-size-matters';
import { Image } from 'expo-image';
import type { DriverShiftEarning } from '../types/driver';

type ShiftDetailsOverlayProps = {
  onClose: () => void;
  shift: DriverShiftEarning | null;
};

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) {
    return '--';
  }

  return `${value.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} dt`;
};

const formatShiftWindow = (startTime: string, endTime: string | null) => {
  if (!startTime && !endTime) {
    return 'No time information available';
  }

  if (startTime && endTime) {
    return `From ${startTime} to ${endTime}`;
  }

  if (startTime) {
    return `Started at ${startTime}`;
  }

  return `Ended at ${endTime}`;
};

const getShiftStatus = (endTime: string | null) => {
  if (!endTime) {
    return 'In progress';
  }

  return 'Completed';
};

export default function ShiftDetailsOverlay({ onClose, shift }: ShiftDetailsOverlayProps) {
  if (!shift) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: vs(30) }}
        >
          <Image
            source={require('../../assets/moto.png')}
            style={styles.icon}
            contentFit="contain"
          />

          <View style={styles.summaryBox}>
            <Text allowFontScaling={false} style={styles.summaryDate}>{`Shift #${shift.id}`}</Text>
            <Text allowFontScaling={false} style={styles.summaryTime}>
              {formatShiftWindow(shift.startTime, shift.endTime)}
            </Text>
            <Text allowFontScaling={false} style={styles.summaryAmount}>
              {formatCurrency(shift.total)}
            </Text>
            <View style={styles.statusPill}>
              <Text allowFontScaling={false} style={styles.statusText}>
                {getShiftStatus(shift.endTime)}
              </Text>
            </View>
          </View>

          <Text allowFontScaling={false} style={styles.sectionTitle}>Shift Breakdown</Text>

          <View style={styles.emptyBox}>
            <Text allowFontScaling={false} style={styles.emptyTitle}>No additional details</Text>
            <Text allowFontScaling={false} style={styles.emptyMessage}>
              Shift breakdown data is not available for this shift.
            </Text>
          </View>

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
    textAlign: 'center',
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
  statusPill: {
    marginTop: '8@vs',
    paddingVertical: '4@vs',
    paddingHorizontal: '12@s',
    backgroundColor: '#FEE2E2',
    borderRadius: '12@ms',
  },
  statusText: {
    color: '#CA251B',
    fontWeight: '700',
    fontSize: '12@ms',
  },
  emptyBox: {
    backgroundColor: '#FFF',
    borderRadius: '14@ms',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    padding: '16@s',
    alignItems: 'center',
    gap: 6,
    elevation: 2,
  },
  emptyTitle: {
    color: '#17213A',
    fontWeight: '700',
    fontSize: '13@ms',
  },
  emptyMessage: {
    color: '#6B7280',
    fontSize: '12@ms',
    textAlign: 'center',
  },
  closeBtn: {
    marginTop: '18@vs',
    backgroundColor: '#CA251B',
    borderRadius: '12@ms',
    paddingVertical: '12@vs',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '14@ms',
  },
});
