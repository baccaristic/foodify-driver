import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

import { PlatformBlurView } from './PlatformBlurView';
import { IncomingOrderOverlay } from './IncomingOrderOverlay';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import { OrderDto } from '../types/order';
import { acceptOrder } from '../services/driverService';

const INCOMING_ORDER_COUNTDOWN_SECONDS = 89;

export const GlobalIncomingOrderNotifier: React.FC = () => {
  const { upcomingOrder, clearUpcomingOrder } = useWebSocketContext();
  const [pendingOrder, setPendingOrder] = useState<OrderDto | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(INCOMING_ORDER_COUNTDOWN_SECONDS);
  const [isProcessing, setIsProcessing] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    }).catch((error) => {
      console.warn('[GlobalIncomingOrderNotifier] Unable to configure audio mode', error);
    });
  }, []);

  useEffect(() => {
    if (upcomingOrder?.upcoming) {
      setPendingOrder(upcomingOrder);
      setCountdown(INCOMING_ORDER_COUNTDOWN_SECONDS);
      setIsVisible(true);
      return;
    }

    if (!upcomingOrder) {
      setIsVisible(false);
      setPendingOrder(null);
      setIsProcessing(false);
    }
  }, [upcomingOrder]);

  useEffect(() => {
    let isActive = true;

    const ensurePlayback = async () => {
      try {
        if (!isVisible) {
          if (soundRef.current) {
            await soundRef.current.stopAsync();
          }
          return;
        }

        if (!soundRef.current) {
          const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/incomming-order-sound.mp3'),
            {
              isLooping: true,
              volume: 1,
            },
          );

          if (!isActive) {
            await sound.stopAsync().catch(() => undefined);
            await sound.unloadAsync().catch(() => undefined);
            return;
          }

          soundRef.current = sound;
        }

        await soundRef.current?.replayAsync();
      } catch (error) {
        console.warn('[GlobalIncomingOrderNotifier] Unable to manage incoming order sound', error);
      }
    };

    void ensurePlayback();

    return () => {
      isActive = false;
    };
  }, [isVisible]);

  useEffect(() => () => {
    const sound = soundRef.current;
    soundRef.current = null;

    if (sound) {
      sound.stopAsync().catch(() => undefined);
      sound.unloadAsync().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const intervalId = setInterval(() => {
      setCountdown((previous) => {
        if (previous <= 0) {
          clearInterval(intervalId);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) {
      setCountdown(INCOMING_ORDER_COUNTDOWN_SECONDS);
    }
  }, [isVisible]);

  const handleHide = useCallback(() => {
    setIsVisible(false);
    setPendingOrder(null);
    setIsProcessing(false);
    clearUpcomingOrder();
  }, [clearUpcomingOrder]);

  useEffect(() => {
    if (countdown <= 0 && isVisible) {
      handleHide();
    }
  }, [countdown, handleHide, isVisible]);

  const handleAccept = useCallback(async () => {
    if (isProcessing) {
      return;
    }

    const orderId = pendingOrder?.id;

    if (!orderId) {
      return;
    }

    setIsProcessing(true);

    try {
      await acceptOrder(orderId);
      handleHide();
    } catch (error) {
      console.warn('[GlobalIncomingOrderNotifier] Failed to accept order', error);
      Alert.alert('Unable to accept order', 'Please try again in a moment.');
      setIsProcessing(false);
    }
  }, [handleHide, isProcessing, pendingOrder]);

  const handleDecline = useCallback(() => {
    handleHide();
  }, [handleHide]);

  const orderLabel = useMemo(() => {
    if (!pendingOrder) {
      return 'New Order';
    }

    const restaurantName = pendingOrder.restaurantName?.trim();

    if (restaurantName) {
      return restaurantName;
    }

    return `Order #${pendingOrder.id}`;
  }, [pendingOrder]);

  const subtitle = useMemo(() => {
    if (!pendingOrder) {
      return 'You have a new pickup request';
    }

    const delivery = pendingOrder.clientAddress?.trim();

    if (delivery) {
      return `Deliver to ${delivery}`;
    }

    const savedDelivery = pendingOrder.savedAddress?.formattedAddress?.trim();

    if (savedDelivery) {
      return `Deliver to ${savedDelivery}`;
    }

    const restaurantName = pendingOrder.restaurantName?.trim();

    if (restaurantName) {
      return `Pickup from ${restaurantName}`;
    }

    return 'You have a new pickup request';
  }, [pendingOrder]);

  if (!isVisible || !pendingOrder) {
    return null;
  }

  return (
    <>
      <PlatformBlurView intensity={45} tint="dark" style={styles.blurOverlay} />
      <IncomingOrderOverlay
        countdownSeconds={countdown}
        onAccept={handleAccept}
        onDecline={handleDecline}
        orderLabel={orderLabel}
        subtitle={subtitle}
      />
    </>
  );
};

const styles = StyleSheet.create({
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
