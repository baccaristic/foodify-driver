import React from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export const DashboardScreen: React.FC = () => {
  const { phoneNumber, toggleOnlineStatus, isOnline, logout } = useAuth();

  const formattedName = phoneNumber ? phoneNumber : 'RIDER';

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

        <View style={styles.mapContainer}>
          {Array.from({ length: 5 }).map((_, index) => (
            <View
              // eslint-disable-next-line react/no-array-index-key
              key={`v-${index}`}
              style={[styles.verticalLine, { left: `${20 * index}%` }]}
            />
          ))}
          {Array.from({ length: 5 }).map((_, index) => (
            <View
              // eslint-disable-next-line react/no-array-index-key
              key={`h-${index}`}
              style={[styles.horizontalLine, { top: `${20 * index}%` }]}
            />
          ))}

          <View style={styles.mapMarker}>
            <View style={styles.markerCore} />
          </View>

          <TouchableOpacity activeOpacity={0.9} style={styles.goButton}>
            <Text style={styles.goLabel}>GO!</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.footerGreeting}>HELLO, {formattedName}</Text>
            <Text style={styles.footerSubtitle}>Ready to work?</Text>
          </View>

          <View style={styles.statusWrapper}>
            <Text style={[styles.footerSubtitle, { marginRight: 8 }]}>{isOnline ? 'Online' : 'Offline'}</Text>
            <Switch value={isOnline} onValueChange={toggleOnlineStatus} trackColor={{ false: '#9ca3af', true: '#22c55e' }} />
          </View>
        </View>

        <Button
          label="Sign out"
          onPress={logout}
          style={{ marginTop: 24, backgroundColor: '#e5e7eb' }}
          labelStyle={{ color: '#111827' }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 24,
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
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
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
    backgroundColor: '#dc2626',
    borderRadius: 999,
  },
  balanceLabel: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
    marginVertical: 8,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  horizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  mapMarker: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#dc2626',
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
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#dc2626',
    zIndex: 3,
  },
  goLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#dc2626',
    letterSpacing: 1.2,
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
    borderColor: '#e5e7eb',
  },
  footerGreeting: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  footerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
