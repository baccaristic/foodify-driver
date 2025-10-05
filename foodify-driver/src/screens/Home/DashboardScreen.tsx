import React, { useMemo } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const TUNIS_CENTER = {
  latitude: 36.8065,
  longitude: 10.1815,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

export const DashboardScreen: React.FC = () => {
  const { phoneNumber, toggleOnlineStatus, isOnline, logout } = useAuth();

  const formattedName = phoneNumber ? phoneNumber : 'RIDER';
  const mapRegion = useMemo(() => TUNIS_CENTER, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.mapOuter}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_GOOGLE}
            initialRegion={mapRegion}
            customMapStyle={customMapStyle}
          >
            <Marker coordinate={mapRegion}>
              <View style={styles.mapMarker}>
                <View style={styles.markerCore} />
              </View>
            </Marker>
          </MapView>

          <View pointerEvents="box-none" style={styles.mapOverlay}>
            <View style={styles.header}>
              <View style={styles.menuButton}>
                <View style={styles.menuLine} />
                <View style={styles.menuLineMedium} />
                <View style={styles.menuLineSmall} />
              </View>

              <View style={styles.balancePill}>
                <Text allowFontScaling={false} style={styles.balanceLabel}>
                  0,00 DT
                </Text>
              </View>
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
              Ready to work?
            </Text>
          </View>

          <View style={styles.statusWrapper}>
            <Text allowFontScaling={false} style={styles.statusLabel}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={toggleOnlineStatus}
              trackColor={{ false: '#D9D9D9', true: '#CA251B' }}
              thumbColor={isOnline ? '#ffffff' : undefined}
            />
          </View>
        </View>

        <Button
          label="Sign out"
          onPress={logout}
          style={styles.signOutButton}
          labelStyle={styles.signOutLabel}
        />
      </View>
    </SafeAreaView>
  );
};

const customMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#17213A' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#D9D9D9' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#E8EBF2' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#fdfcf8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#D9D9D9' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#CAD7F5' }],
  },
];

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#17213A',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: moderateScale(16),
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(28),
    paddingHorizontal: moderateScale(24),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(24),
    gap: verticalScale(24),
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 0, height: verticalScale(12) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(24),
    elevation: moderateScale(12),
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
    elevation: moderateScale(4),
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: verticalScale(8) },
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
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(12),
    backgroundColor: '#CA251B',
    borderRadius: moderateScale(999),
  },
  balanceLabel: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: moderateScale(0.5),
  },
  mapOuter: {
    flex: 1,
    borderRadius: moderateScale(24),
    overflow: 'hidden',
    marginVertical: verticalScale(8),
    position: 'relative',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(24),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(24),
  },
  mapMarker: {
    width: moderateScale(76),
    height: moderateScale(76),
    borderRadius: moderateScale(38),
    backgroundColor: '#CA251B',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  markerCore: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#ffffff',
  },
  goButton: {
    alignSelf: 'center',
    width: moderateScale(156),
    height: moderateScale(156),
    borderRadius: moderateScale(78),
    backgroundColor: '#CA251B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 0, height: verticalScale(12) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(24),
    elevation: moderateScale(10),
  },
  goRing: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    borderWidth: moderateScale(8),
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goLabel: {
    fontSize: moderateScale(36),
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: moderateScale(2),
  },
  footer: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(20),
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(18),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: moderateScale(1),
    borderColor: '#D9D9D9',
  },
  footerGreeting: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#17213A',
  },
  footerSubtitle: {
    fontSize: moderateScale(14),
    color: '#4B5563',
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    marginRight: moderateScale(8),
    fontSize: moderateScale(14),
    color: '#4B5563',
  },
  signOutButton: {
    marginTop: verticalScale(8),
    backgroundColor: '#17213A',
  },
  signOutLabel: {
    color: '#ffffff',
  },
});
