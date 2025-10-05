import React, { useMemo } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
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
        <View style={styles.header}>
          <View style={styles.menuButton}>
            <View style={styles.menuLine} />
            <View style={[styles.menuLine, { width: 18 }]} />
            <View style={[styles.menuLine, { width: 12 }]} />
          </View>

          <View style={styles.balancePill}>
            <Text style={styles.balanceLabel}>0,00 DT</Text>
          </View>
        </View>

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

          <TouchableOpacity activeOpacity={0.85} style={styles.goButton}>
            <View style={styles.goRing}>
              <Text style={styles.goLabel}>GO!</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.footerGreeting}>HELLO, {formattedName}</Text>
            <Text style={styles.footerSubtitle}>Ready to work?</Text>
          </View>

          <View style={styles.statusWrapper}>
            <Text style={[styles.footerSubtitle, { marginRight: 8 }]}>{isOnline ? 'Online' : 'Offline'}</Text>
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
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 24,
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    elevation: 4,
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  menuLine: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#1f2937',
  },
  balancePill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#CA251B',
    borderRadius: 999,
  },
  balanceLabel: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mapOuter: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginVertical: 8,
    position: 'relative',
  },
  mapMarker: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#CA251B',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  markerCore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  goButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: '#CA251B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 10,
    zIndex: 3,
  },
  goRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goLabel: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
  },
  footer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9D9D9',
  },
  footerGreeting: {
    fontSize: 16,
    fontWeight: '700',
    color: '#17213A',
  },
  footerSubtitle: {
    fontSize: 14,
    color: '#4B5563',
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutButton: {
    marginTop: 8,
    backgroundColor: '#17213A',
  },
  signOutLabel: {
    color: '#ffffff',
  },
});
