import React, { useMemo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import MapView, { Marker } from 'react-native-maps';

import { useAuth } from '../../contexts/AuthContext';

const DEFAULT_REGION = {
  latitude: 47.5726,
  longitude: -122.3863,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

export const DashboardScreen: React.FC = () => {
  const { phoneNumber, toggleOnlineStatus, isOnline, logout } = useAuth();

  const formattedName = (phoneNumber ? phoneNumber : 'RIDER').toUpperCase();
  const mapRegion = useMemo(() => DEFAULT_REGION, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.mapOuter}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={mapRegion}
            customMapStyle={customMapStyle}
          >
            <Marker coordinate={mapRegion}>
              <View style={styles.mapMarker}>
                <View style={styles.markerHead}>
                  <View style={styles.markerCore} />
                </View>
                <View style={styles.markerTail} />
              </View>
            </Marker>
          </MapView>

          <View pointerEvents="box-none" style={styles.mapOverlay}>
            <View style={styles.header}>
              <TouchableOpacity activeOpacity={0.8} style={styles.menuButton}>
                <View style={styles.menuLine} />
                <View style={styles.menuLineMedium} />
                <View style={styles.menuLineSmall} />
              </TouchableOpacity>

              <View style={styles.balancePill}>
                <Text allowFontScaling={false} style={styles.balanceLabel}>
                  0,00 DT
                </Text>
              </View>

              <TouchableOpacity activeOpacity={0.85} style={styles.locationButton}>
                <View style={styles.locationCircle}>
                  <View style={styles.locationDot} />
                </View>
                <View style={styles.locationPointer} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.goButton}>
              <View style={styles.goRing}>
                <Text allowFontScaling={false} style={styles.goLabel}>
                  GO!
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <Text allowFontScaling={false} style={styles.footerGreeting}>
              HELLO, {formattedName}
            </Text>
            <Text allowFontScaling={false} style={styles.footerSubtitle}>
              Ready to work ?
            </Text>
          </View>

          <View style={styles.statusWrapper}>
            <Text allowFontScaling={false} style={styles.statusLabel}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={toggleOnlineStatus}
              trackColor={{ false: '#E5E7EB', true: '#CA251B' }}
              thumbColor={isOnline ? '#ffffff' : undefined}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const customMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f7f7f7' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4d4d4d' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road.highway',
    stylers: [{ color: '#e0e0e0' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    stylers: [{ color: '#dfe6f2' }],
  },
];

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f3f5',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: '#ffffff',
    elevation: moderateScale(6),
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(4),
  },
  menuLine: {
    width: moderateScale(24),
    height: verticalScale(3),
    borderRadius: moderateScale(2),
    backgroundColor: '#1f2937',
  },
  menuLineMedium: {
    width: moderateScale(18),
    height: verticalScale(3),
    borderRadius: moderateScale(2),
    backgroundColor: '#1f2937',
  },
  menuLineSmall: {
    width: moderateScale(12),
    height: verticalScale(3),
    borderRadius: moderateScale(2),
    backgroundColor: '#1f2937',
  },
  balancePill: {
    paddingHorizontal: moderateScale(22),
    paddingVertical: verticalScale(10),
    backgroundColor: '#CA251B',
    borderRadius: moderateScale(999),
    shadowColor: 'rgba(202, 37, 27, 0.4)',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.6,
    shadowRadius: moderateScale(10),
    elevation: moderateScale(4),
  },
  balanceLabel: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: moderateScale(0.4),
  },
  locationButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: moderateScale(5),
    shadowColor: 'rgba(0,0,0,0.12)',
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowRadius: moderateScale(12),
  },
  locationCircle: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    borderWidth: moderateScale(2),
    borderColor: '#CA251B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: '#CA251B',
  },
  locationPointer: {
    width: 0,
    height: 0,
    marginTop: verticalScale(2),
    borderLeftWidth: moderateScale(6),
    borderRightWidth: moderateScale(6),
    borderTopWidth: moderateScale(8),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#CA251B',
  },
  mapOuter: {
    flex: 1,
    borderRadius: moderateScale(28),
    overflow: 'hidden',
    marginHorizontal: moderateScale(16),
    marginTop: verticalScale(12),
    marginBottom: verticalScale(16),
    position: 'relative',
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(20),
    elevation: moderateScale(8),
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(24),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(28),
  },
  mapMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerHead: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#CA251B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerCore: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: '#ffffff',
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: moderateScale(8),
    borderRightWidth: moderateScale(8),
    borderTopWidth: moderateScale(10),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#CA251B',
  },
  goButton: {
    alignSelf: 'center',
    width: moderateScale(140),
    height: moderateScale(140),
    borderRadius: moderateScale(70),
    backgroundColor: '#CA251B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: verticalScale(14) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(30),
    elevation: moderateScale(12),
  },
  goRing: {
    width: moderateScale(108),
    height: moderateScale(108),
    borderRadius: moderateScale(54),
    borderWidth: moderateScale(10),
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goLabel: {
    fontSize: moderateScale(30),
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: moderateScale(1.2),
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(18),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: moderateScale(24),
    marginHorizontal: moderateScale(16),
    marginBottom: verticalScale(16),
    shadowColor: 'rgba(15, 23, 42, 0.12)',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(20),
    elevation: moderateScale(10),
  },
  footerGreeting: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#17213A',
    letterSpacing: moderateScale(0.6),
  },
  footerSubtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    marginTop: verticalScale(2),
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    marginRight: moderateScale(8),
    fontSize: moderateScale(14),
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
});
