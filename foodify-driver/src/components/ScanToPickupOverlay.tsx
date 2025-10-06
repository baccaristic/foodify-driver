import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { PlatformBlurView } from './PlatformBlurView';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { X } from 'lucide-react-native';

export interface ScanToPickupOverlayProps {
  visible: boolean;
  onClose: () => void;
  onScanned?: (result: BarcodeScanningResult) => void;
}

export const ScanToPickupOverlay: React.FC<ScanToPickupOverlayProps> = ({
  visible,
  onClose,
  onScanned,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setHasScanned(false);

    if (!permission || permission.status === 'undetermined') {
      requestPermission();
    }
  }, [permission, requestPermission, visible]);

  const handleClose = useCallback(() => {
    setHasScanned(false);
    onClose();
  }, [onClose]);

  const handleRequestPermission = useCallback(() => {
    requestPermission();
  }, [requestPermission]);

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (hasScanned) {
        return;
      }

      setHasScanned(true);
      onScanned?.(result);
    },
    [hasScanned, onScanned],
  );

  const isPermissionDenied = useMemo(() => {
    if (!permission) {
      return false;
    }

    return permission.status === 'denied' && !permission.granted;
  }, [permission]);

  if (!visible) {
    return null;
  }

  return (
    <Modal animationType="fade" transparent visible>
      <View style={StyleSheet.absoluteFill}>
      <PlatformBlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />

        <View style={styles.container}>
          <View style={styles.cameraCard}>
            <View style={styles.header}>
              <Text allowFontScaling={false} style={styles.title}>
                Scan order QR code
              </Text>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close scanner"
                onPress={handleClose}
                style={styles.closeButton}
                activeOpacity={0.85}
              >
                <X color="#0F172A" size={moderateScale(18)} />
              </TouchableOpacity>
            </View>

            <View style={styles.cameraWrapper}>
              {!permission ? (
                <View style={styles.permissionPlaceholder}>
                  <ActivityIndicator color="#CA251B" size="large" />
                  <Text allowFontScaling={false} style={styles.permissionText}>
                    Preparing camera…
                  </Text>
                </View>
              ) : permission.granted ? (
                <CameraView
                  style={StyleSheet.absoluteFill}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={handleBarcodeScanned}
                >
                  <View style={styles.overlay}>
                    <View style={styles.focusFrame} />
                    <Text allowFontScaling={false} style={styles.instructions}>
                      Align the QR code within the frame
                    </Text>
                  </View>
                </CameraView>
              ) : (
                <View style={styles.permissionPlaceholder}>
                  <Text allowFontScaling={false} style={styles.permissionTitle}>
                    Camera access needed
                  </Text>
                  <Text allowFontScaling={false} style={styles.permissionText}>
                    Enable camera permission to scan the pickup QR code.
                  </Text>

                  {isPermissionDenied && !permission.canAskAgain ? (
                    <Text
                      allowFontScaling={false}
                      style={styles.permissionHelpText}
                    >
                      You can enable camera access from your device settings.
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={handleRequestPermission}
                      activeOpacity={0.85}
                      style={styles.permissionButton}
                    >
                      <Text
                        allowFontScaling={false}
                        style={styles.permissionButtonLabel}
                      >
                        Allow camera access
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  cameraCard: {
    width: '100%',
    maxWidth: moderateScale(360),
    borderRadius: moderateScale(24),
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    padding: scale(16),
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: verticalScale(10) },
    shadowRadius: moderateScale(24),
    elevation: moderateScale(8),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#0F172A',
  },
  closeButton: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraWrapper: {
    position: 'relative',
    width: '100%',
    height: verticalScale(320),
    borderRadius: moderateScale(18),
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(16),
    gap: verticalScale(16),
  },
  focusFrame: {
    width: '70%',
    aspectRatio: 1,
    borderWidth: moderateScale(4),
    borderColor: '#ffffff',
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  instructions: {
    color: '#ffffff',
    fontSize: moderateScale(14),
    textAlign: 'center',
    fontWeight: '500',
  },
  permissionPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(24),
    gap: verticalScale(12),
  },
  permissionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  permissionText: {
    fontSize: moderateScale(14),
    color: '#334155',
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: verticalScale(8),
    backgroundColor: '#CA251B',
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
  },
  permissionButtonLabel: {
    color: '#ffffff',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  permissionHelpText: {
    fontSize: moderateScale(13),
    color: '#64748B',
    textAlign: 'center',
  },
})