import React from 'react';
import { View, Text } from 'react-native';
import { ArrowBigUp, TriangleAlert } from 'lucide-react-native';
import { moderateScale } from 'react-native-size-matters';
import { verticalScale } from 'react-native-size-matters';

export const CashTooltip: React.FC<any> = ({ depositThreshold }) => {
  return (
    <View style={{
      backgroundColor: 'rgba(116, 122, 137, 100);',
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(24),
      borderRadius: moderateScale(24),
      width: '80%',
      maxWidth: moderateScale(380),
      alignSelf: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.55,
      shadowRadius: 28,
      elevation: 32,
    }} >

      <Text style={{
        color: '#F8FAFC',
        fontSize: moderateScale(17),
        fontWeight: '500',
        textAlign: 'left',
        marginBottom: moderateScale(8),
        paddingHorizontal: moderateScale(8),

      }}>
        This is the total cash amount you are currently carrying.
      </Text>
      <TriangleAlert color="#FBBF24" size={34} style={{
        alignSelf: 'center',
        paddingHorizontal: moderateScale(8),
        marginBottom: verticalScale(8)

      }} />
      <View style={{
        flexDirection: 'row', alignSelf: 'center', gap: moderateScale(12), paddingHorizontal: moderateScale(8),
      }}>
        <Text style={{
          color: 'white',
          fontSize: moderateScale(11),
          fontWeight: '400',
        }}>
          Important: If your cash balance reaches {depositThreshold.toFixed(2)} DT, you must deposit it at headquarters before receiving new orders.
          Failure to deposit will block new order assignments until compliance.
        </Text>

      </View>
    </View>
  );
};