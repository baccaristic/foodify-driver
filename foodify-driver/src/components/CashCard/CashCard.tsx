import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Coins, TriangleAlert } from 'lucide-react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

type Props = {
  cashOnHand: number | null;
  depositThreshold: number;
  isCritical: boolean;
  isBlocked: boolean;
  deadlineHours: number | null;
  onPress: () => void;
};

export const CashCard: React.FC<Props> = ({
  cashOnHand,
  depositThreshold,
  isCritical,
  isBlocked,
  deadlineHours,
  onPress,
}) => {
  const display = cashOnHand !== null ? `${cashOnHand.toFixed(2)} DT` : '--';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: isBlocked || isCritical ? '#B91C1C' : '#3BCA1B',
        paddingHorizontal: moderateScale(14),
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(20),
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: moderateScale(140),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontSize: moderateScale(11), fontWeight: '600' }}>
          CASH ON HAND
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(5) }}>        <Coins color={'#fff'} />
          <Text style={{ color: '#fff', fontSize: moderateScale(12), fontWeight: '500', marginTop: 4 }}>
            {display}
          </Text>
        </View>
      </View>

      {(isCritical || isBlocked) && (
        <View style={{
          backgroundColor: '#fff',
          padding: moderateScale(4),
          borderRadius: moderateScale(20),
          marginBottom: verticalScale(20)
        }}>
          <Text>
            <TriangleAlert color="#B91C1C" size={moderateScale(24)} />
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};