import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ban } from 'lucide-react-native';
import { moderateScale } from 'react-native-size-matters';

export const BlockedScreen: React.FC = () => {
  return (
    <>
      <Image
        source={require('../../../assets/background.png')}
        style={[styles.backgroundImage, StyleSheet.absoluteFillObject]}
        resizeMode="cover"
      />

      <View style={styles.overlay} />

      <View style={styles.content}>
        <Ban color="#B91C1C" size={moderateScale(90)} />

        <Text style={styles.title}>Application Disabled</Text>

        <Text style={styles.message}>
          Please visit headquarters to deposit your balance.
          Once the deposit is verified, your access will be automatically restored and you will be able to receive new orders.
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    opacity: 0.12, width: null,
    height: null,
    resizeMode: 'contain'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(40),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: '#B91C1C',
    textAlign: 'center',
    marginTop: moderateScale(32),
  },
  message: {
    fontSize: moderateScale(14),
    color: '#17213A',
    textAlign: 'center',
    marginTop: moderateScale(20),
  },
});