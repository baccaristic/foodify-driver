import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  AppState,
  AppStateStatus,
  Easing,
  Linking,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import MapView, { AnimatedRegion, MarkerAnimated, Region } from 'react-native-maps';
import type { default as MapViewType } from 'react-native-maps/lib/MapView';
import * as Location from 'expo-location';
import { BarcodeScanningResult } from 'expo-camera';
import { Audio } from 'expo-av';
import { PlatformBlurView } from '../../components/PlatformBlurView';

import { useAuth } from '../../contexts/AuthContext';
import { useWebSocketContext } from '../../contexts/WebSocketContext';
import {
  acceptOrder,
  confirmOrderDelivery,
  getDriverOngoingOrder,
  getCurrentDriverShift,
  getCurrentDriverShiftBalance,
  getDriverFinanceSummary,
  markOrderAsPickedUp,
  updateDriverAvailability,
  updateDriverLocation,
} from '../../services/driverService';
import {
  startBackgroundLocationUpdates,
  stopBackgroundLocationUpdates,
} from '../../services/backgroundLocationTask';
import { IncomingOrderOverlay } from '../../components/IncomingOrderOverlay';
import { OngoingOrderBanner } from '../../components/OngoingOrderBanner';
import { OngoingOrderDetailsOverlay } from '../../components/OngoingOrderDetailsOverlay';
import { ScanToPickupOverlay } from '../../components/ScanToPickupOverlay';
import { ConfirmDeliveryOverlay } from '../../components/ConfirmDeliveryOverlay';
import { ActionResultModal } from '../../components/ActionResultModal';
import { OngoingOrderStatusOverlay } from '../../components/OngoingOrderStatusOverlay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DriverShift, DriverShiftStatus } from '../../types/shift';
import type { DriverFinanceSummary } from '../../types/driver';
import { OrderDto, OrderStatus } from '../../types/order';
import { DashboardSidebar } from './components/DashboardSidebar';
import { Menu, TriangleAlert } from 'lucide-react-native';

const parseShiftDate = (value: string | null | undefined): Date | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  const directDate = new Date(trimmed);

  if (!Number.isNaN(directDate.getTime())) {
    return directDate;
  }

  const normalized = trimmed.includes('T')
    ? trimmed
    : trimmed.replace(' ', 'T');
  const withTimezone = /[zZ]|[+-]\d\d:?\d\d$/.test(normalized)
    ? normalized
    : `${normalized}Z`;
  const zonedDate = new Date(withTimezone);

  if (!Number.isNaN(zonedDate.getTime())) {
    return zonedDate;
  }

  const localMatch = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(\.(\d+))?)?$/,
  );

  if (!localMatch) {
    return null;
  }

  const [, year, month, day, hours, minutes, seconds = '0', , fractionalSeconds] = localMatch;
  const milliseconds = fractionalSeconds
    ? Math.floor(Number((fractionalSeconds + '000').slice(0, 3)))
    : 0;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds),
    milliseconds,
  );
};

const DEFAULT_REGION = {
  latitude: 47.5726,
  longitude: -122.3863,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

const INCOMING_ORDER_COUNTDOWN_SECONDS = 89;

type StatusOverlayContent = {
  badgeLabel: string;
  title: string;
  message: string;
};

const formatStatusLabel = (status: OrderStatus) =>
  status
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const buildStatusOverlayContent = (order: OrderDto | null, status: OrderStatus): StatusOverlayContent => {
  const orderLabel = order?.id ? `Order #${order.id}` : 'Order update';
  const restaurantName = order?.restaurantName?.trim();

  switch (status) {
    case OrderStatus.ACCEPTED:
      return {
        badgeLabel: orderLabel,
        title: 'Order accepted',
        message: `${orderLabel} has been accepted. Get ready to head to the restaurant.`,
      };
    case OrderStatus.PREPARING:
      return {
        badgeLabel: orderLabel,
        title: 'Order preparing',
        message: `${restaurantName ?? 'The restaurant'} is preparing ${orderLabel.toLowerCase()}.`,
      };
    case OrderStatus.READY_FOR_PICK_UP:
      return {
        badgeLabel: orderLabel,
        title: 'Ready for pickup',
        message: `${orderLabel} is ready for pickup${
          restaurantName ? ` at ${restaurantName}` : ''
        }.`,
      };
    case OrderStatus.IN_DELIVERY:
      return {
        badgeLabel: orderLabel,
        title: 'On the way',
        message: `${orderLabel} is now out for delivery. Keep the customer updated.`,
      };
    case OrderStatus.PENDING:
      return {
        badgeLabel: orderLabel,
        title: 'Awaiting confirmation',
        message: `${orderLabel} is waiting for the restaurant to confirm.`,
      };
    case OrderStatus.REJECTED:
      return {
        badgeLabel: orderLabel,
        title: 'Order rejected',
        message: `${orderLabel} was rejected by the restaurant.`,
      };
    case OrderStatus.CANCELED:
      return {
        badgeLabel: orderLabel,
        title: 'Order canceled',
        message: `${orderLabel} was canceled.`,
      };
    default: {
      const formattedStatus = formatStatusLabel(status);
      return {
        badgeLabel: orderLabel,
        title: formattedStatus,
        message: `${orderLabel} is now ${formattedStatus.toLowerCase()}.`,
      };
    }
  }
};

const parseNumericValue = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const normalized = Number(value.replace(',', '.'));

    return Number.isFinite(normalized) ? normalized : null;
  }

  return null;
};

const parseBooleanValue = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return false;
};

const EMPTY_ONGOING_ORDER_PLACEHOLDER: OrderDto = {
  id: 0,
  restaurantName: null,
  restaurantId: null,
  restaurantAddress: null,
  restaurantLocation: null,
  restaurantPhone: null,
  clientId: null,
  clientName: null,
  clientPhone: null,
  clientAddress: null,
  clientLocation: null,
  savedAddress: null,
  total: null,
  status: OrderStatus.ACCEPTED,
  createdAt: null,
  items: [],
  driverId: null,
  driverName: null,
  driverPhone: null,
  estimatedPickUpTime: null,
  estimatedDeliveryTime: null,
  driverAssignedAt: null,
  pickedUpAt: null,
  deliveredAt: null,
  upcoming: false,
};

export const DashboardScreen: React.FC = () => {
  const { user, isOnline, accessToken, hasHydrated, setOnlineStatus } = useAuth();
  const { upcomingOrder, clearUpcomingOrder, ongoingOrderUpdate } = useWebSocketContext();

  const formattedName = (user?.name || user?.email || 'Driver').toUpperCase();
  const friendlyName = useMemo(() => {
    const raw = (user?.name || user?.email || 'Driver').trim();
    const normalized = raw.includes('@') ? raw.split('@')[0] : raw;
    const firstWord = normalized.split(/\s+/)[0] || 'Driver';
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
  }, [user?.email, user?.name]);
  const [userRegion, setUserRegion] = useState<Region | null>(null);
  const mapRef = useRef<MapViewType | null>(null);
  const locationWatcher = useRef<Location.LocationSubscription | null>(null);
  const sendLocationUpdateRef = useRef<
    ((coords: Location.LocationObjectCoords) => Promise<void>) | null
  >(null);
  const driverCoordinate = useRef(
    new AnimatedRegion({
      latitude: DEFAULT_REGION.latitude,
      longitude: DEFAULT_REGION.longitude,
      latitudeDelta: DEFAULT_REGION.latitudeDelta,
      longitudeDelta: DEFAULT_REGION.longitudeDelta,
    }),
  );
  const [isIncomingOrderVisible, setIncomingOrderVisible] = useState<boolean>(false);
  const [isOngoingOrderVisible, setOngoingOrderVisible] = useState<boolean>(false);
  const [ongoingOrder, setOngoingOrder] = useState<OrderDto | null>(null);
  const [incomingCountdown, setIncomingCountdown] = useState<number>(
    INCOMING_ORDER_COUNTDOWN_SECONDS,
  );
  const [pendingIncomingOrder, setPendingIncomingOrder] = useState<OrderDto | null>(null);
  const [isAcceptingOrder, setIsAcceptingOrder] = useState<boolean>(false);
  const [isOrderDetailsVisible, setOrderDetailsVisible] = useState<boolean>(false);
  const [isScanOverlayVisible, setScanOverlayVisible] = useState<boolean>(false);
  const [isConfirmDeliveryOverlayVisible, setConfirmDeliveryOverlayVisible] =
    useState<boolean>(false);
  const [isProcessingPickup, setIsProcessingPickup] = useState<boolean>(false);
  const [isProcessingDelivery, setIsProcessingDelivery] = useState<boolean>(false);
  const [resultModal, setResultModal] = useState<
    | {
        status: 'success' | 'error';
        title: string;
        message: string;
        onAfterClose?: () => void;
      }
    | null
  >(null);
  const [statusOverlay, setStatusOverlay] = useState<StatusOverlayContent | null>(null);
  const [currentShift, setCurrentShift] = useState<DriverShift | null>(null);
  const [isUpdatingShift, setIsUpdatingShift] = useState<boolean>(false);
  const [shiftBalance, setShiftBalance] = useState<number | null>(null);
  const [financeSummary, setFinanceSummary] = useState<DriverFinanceSummary | null>(null);
  const [isCashTooltipVisible, setCashTooltipVisible] = useState<boolean>(false);
  const hasActiveShift =
    currentShift?.status === DriverShiftStatus.ACTIVE && Boolean(currentShift.startedAt);
  const goPulse = useRef(new Animated.Value(0)).current;
  const instes = useSafeAreaInsets();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const shiftUpdateSequenceRef = useRef(0);
  const isMountedRef = useRef(true);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState as AppStateStatus);
  const ongoingOrderRequestIdRef = useRef(0);

  const ongoingStatus = ongoingOrder?.status ?? null;
  const shouldCallRestaurant = useMemo(
    () =>
      ongoingStatus === OrderStatus.PREPARING ||
      ongoingStatus === OrderStatus.READY_FOR_PICK_UP,
    [ongoingStatus],
  );

  const shiftBalanceDisplay = useMemo(() => {
    if (shiftBalance === null) {
      return '0,00 DT';
    }

    const formatted = shiftBalance.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${formatted} DT`;
  }, [shiftBalance]);

  const cashSummary = useMemo(() => {
    const cashValue = parseNumericValue(financeSummary?.cashOnHand ?? null);
    const thresholdValue = parseNumericValue(financeSummary?.depositThreshold ?? null);

    const cashDisplay = cashValue !== null
      ? `${cashValue.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} DT`
      : '0,00 DT';

    const thresholdDisplay = thresholdValue !== null
      ? `${thresholdValue.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} DT`
      : null;

    return {
      cashValue,
      thresholdValue,
      cashDisplay,
      thresholdDisplay,
    };
  }, [financeSummary]);

  const cashOnHandValue = cashSummary.cashValue;
  const depositThresholdValue = cashSummary.thresholdValue;
  const cashOnHandDisplay = cashSummary.cashDisplay;
  const depositThresholdDisplay = cashSummary.thresholdDisplay;

  const isCashAtOrAboveThreshold =
    cashOnHandValue !== null &&
    depositThresholdValue !== null &&
    cashOnHandValue >= depositThresholdValue;

  const cashCardBackground = isCashAtOrAboveThreshold ? '#CA251B' : '#17213A';
  const cashCardShadowColor = isCashAtOrAboveThreshold
    ? 'rgba(202, 37, 27, 0.42)'
    : 'rgba(15, 23, 42, 0.35)';
  const depositThresholdTooltipDisplay = depositThresholdDisplay ?? '250 DT';

  const callLabel = shouldCallRestaurant ? 'Call Restaurant' : 'Call Client';
  const callPhone = shouldCallRestaurant
    ? ongoingOrder?.restaurantPhone
    : ongoingOrder?.clientPhone;
  const isCallDisabled = !callPhone;

  const isScanToPickupVisible = ongoingStatus === OrderStatus.READY_FOR_PICK_UP;
  const isConfirmDeliveryVisible = ongoingStatus === OrderStatus.IN_DELIVERY;

  const scanAvailabilityRef = useRef(isScanToPickupVisible);
  const confirmAvailabilityRef = useRef(isConfirmDeliveryVisible);
  const incomingOrderSoundRef = useRef<Audio.Sound | null>(null);
  const statusSoundRef = useRef<Audio.Sound | null>(null);
  const previousOngoingStatusRef = useRef<{ id: number | null; status: OrderStatus | null }>({
    id: null,
    status: null,
  });

  const navigationTarget = useMemo(() => {
    if (!ongoingOrder) {
      return null;
    }

    if (ongoingStatus === OrderStatus.IN_DELIVERY) {
      return { label: 'client' as const, location: ongoingOrder.clientLocation };
    }

    return { label: 'restaurant' as const, location: ongoingOrder.restaurantLocation };
  }, [ongoingOrder, ongoingStatus]);

  const deliveryAddress = useMemo(() => {
    if (!ongoingOrder) {
      return null;
    }

    const directAddress = ongoingOrder.clientAddress?.trim();
    if (directAddress) {
      return directAddress;
    }

    const savedAddress = ongoingOrder.savedAddress?.formattedAddress?.trim();

    return savedAddress ?? null;
  }, [ongoingOrder]);

  const incomingOrderLabel = useMemo(() => {
    if (!pendingIncomingOrder) {
      return 'New Order';
    }

    const restaurantName = pendingIncomingOrder.restaurantName?.trim();

    if (restaurantName) {
      return restaurantName;
    }

    return `Order #${pendingIncomingOrder.id}`;
  }, [pendingIncomingOrder]);

  const incomingOrderSubtitle = useMemo(() => {
    if (!pendingIncomingOrder) {
      return 'You have a new pickup request';
    }

    const delivery = pendingIncomingOrder.clientAddress?.trim();

    if (delivery) {
      return `Deliver to ${delivery}`;
    }

    const savedDelivery = pendingIncomingOrder.savedAddress?.formattedAddress?.trim();

    if (savedDelivery) {
      return `Deliver to ${savedDelivery}`;
    }

    const restaurantName = pendingIncomingOrder.restaurantName?.trim();

    if (restaurantName) {
      return `Pickup from ${restaurantName}`;
    }

    return 'You have a new pickup request';
  }, [pendingIncomingOrder]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    }).catch((error) => {
      console.warn('Unable to configure audio mode', error);
    });
  }, []);

  useEffect(() => {
    let isActive = true;

    const ensurePlaybackState = async () => {
      try {
        if (isIncomingOrderVisible) {
          if (!incomingOrderSoundRef.current) {
            const { sound } = await Audio.Sound.createAsync(
              require('../../../assets/sounds/incomming-order-sound.mp3'),
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

            incomingOrderSoundRef.current = sound;
          }

          if (incomingOrderSoundRef.current) {
            await incomingOrderSoundRef.current.replayAsync();
          }
        } else if (incomingOrderSoundRef.current) {
          await incomingOrderSoundRef.current.stopAsync();
        }
      } catch (error) {
        console.warn('Unable to manage incoming order sound', error);
      }
    };

    ensurePlaybackState();

    return () => {
      isActive = false;
    };
  }, [isIncomingOrderVisible]);

  useEffect(() => () => {
    const sound = incomingOrderSoundRef.current;
    incomingOrderSoundRef.current = null;

    if (sound) {
      sound.stopAsync().catch(() => undefined);
      sound.unloadAsync().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      const sound = statusSoundRef.current;
      statusSoundRef.current = null;

      if (sound) {
        sound.stopAsync().catch(() => undefined);
        sound.unloadAsync().catch(() => undefined);
      }
    };
  }, []);

  useEffect(() => {
    if (!upcomingOrder || !upcomingOrder.upcoming) {
      return;
    }

    setPendingIncomingOrder(upcomingOrder);
    setIncomingCountdown(INCOMING_ORDER_COUNTDOWN_SECONDS);
    setIncomingOrderVisible(true);
  }, [upcomingOrder]);

  useEffect(() => {
    if (!ongoingOrderUpdate) {
      return;
    }

    setOngoingOrder(ongoingOrderUpdate);
  }, [ongoingOrderUpdate]);

  const playStatusChangeSound = useCallback(async () => {
    try {
      if (!statusSoundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/order-ready-sound.mp3'),
          {
            isLooping: true,
            volume: 1,
          },
        );

        statusSoundRef.current = sound;
      }

      await statusSoundRef.current?.replayAsync();
    } catch (error) {
      console.warn('Unable to play status update sound', error);
    }
  }, []);

  const stopStatusChangeSound = useCallback(async () => {
    try {
      if (!statusSoundRef.current) {
        return;
      }

      await statusSoundRef.current.stopAsync();
    } catch (error) {
      console.warn('Unable to stop status update sound', error);
    }
  }, []);

  useEffect(() => {
    const currentStatus = ongoingOrder?.status ?? null;
    const currentOrderId = ongoingOrder?.id ?? null;
    const previousStatus = previousOngoingStatusRef.current.status;
    const previousOrderId = previousOngoingStatusRef.current.id;

    if (currentStatus === previousStatus && currentOrderId === previousOrderId) {
      return;
    }

    previousOngoingStatusRef.current = {
      id: currentOrderId,
      status: currentStatus,
    };

    if (!currentStatus) {
      setStatusOverlay(null);
      void stopStatusChangeSound();
      return;
    }

    if (currentStatus === OrderStatus.DELIVERED) {
      setStatusOverlay(null);
      void stopStatusChangeSound();
      return;
    }

    if (currentStatus !== OrderStatus.READY_FOR_PICK_UP) {
      setStatusOverlay(null);
      void stopStatusChangeSound();
      return;
    }

    const content = buildStatusOverlayContent(ongoingOrder, currentStatus);

    setStatusOverlay(content);
    playStatusChangeSound();
  }, [ongoingOrder, playStatusChangeSound, stopStatusChangeSound]);

  const handleDismissStatusOverlay = useCallback(() => {
    void stopStatusChangeSound();
    setStatusOverlay(null);
  }, [stopStatusChangeSound]);

  useEffect(() => {
    const hasOrder = Boolean(ongoingOrder);

    setOngoingOrderVisible(hasOrder);

    if (hasOrder && !pendingIncomingOrder) {
      setIncomingOrderVisible(false);
      clearUpcomingOrder();
    }
  }, [clearUpcomingOrder, ongoingOrder, pendingIncomingOrder]);

  useEffect(() => {
    scanAvailabilityRef.current = isScanToPickupVisible;
  }, [isScanToPickupVisible]);

  useEffect(() => {
    confirmAvailabilityRef.current = isConfirmDeliveryVisible;
  }, [isConfirmDeliveryVisible]);

  const applyShiftUpdate = useCallback(
    (shift: DriverShift | null, expectedSequence?: number) => {
      if (!isMountedRef.current) {
        return;
      }

      if (
        typeof expectedSequence === 'number' &&
        expectedSequence !== shiftUpdateSequenceRef.current
      ) {
        return;
      }

      shiftUpdateSequenceRef.current += 1;
      setCurrentShift(shift);
    },
    [],
  );

  const applyRegionUpdate = useCallback(
    (coords: Location.LocationObjectCoords, animateMap: boolean) => {
      const region: Region = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      driverCoordinate.current
        .timing({
          latitude: region.latitude,
          longitude: region.longitude,
          duration: 750,
          useNativeDriver: false,
        })
        .start();

      setUserRegion(region);

      if (animateMap && mapRef.current) {
        mapRef.current.animateCamera(
          {
            center: {
              latitude: region.latitude,
              longitude: region.longitude,
            },
            pitch: 0,
            heading: 0,
            altitude: 1200,
          },
          { duration: 750 },
        );
      }
    },
    [],
  );

  const sendLocationUpdate = useCallback(
    async (coords: Location.LocationObjectCoords) => {
      const driverId = user?.id;

      if (!driverId || !isOnline) {
        return;
      }

      try {
        await updateDriverLocation({
          driverId,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      } catch (error) {
        console.warn('[Dashboard] Failed to update driver location', error);
      }
    },
    [isOnline, user?.id],
  );

  useEffect(() => {
    sendLocationUpdateRef.current = sendLocationUpdate;
  }, [sendLocationUpdate]);

  const syncOngoingOrder = useCallback(async () => {
    ongoingOrderRequestIdRef.current += 1;
    const requestId = ongoingOrderRequestIdRef.current;

    if (!hasHydrated || !accessToken) {
      if (isMountedRef.current && requestId === ongoingOrderRequestIdRef.current) {
        setOngoingOrder(null);
      }
      return;
    }

    try {
      const order = await getDriverOngoingOrder();

      if (!isMountedRef.current || requestId !== ongoingOrderRequestIdRef.current) {
        return;
      }

      setOngoingOrder(order);
    } catch (error) {
      console.warn('[Dashboard] Failed to fetch ongoing order', error);
    }
  }, [accessToken, hasHydrated]);

  const refreshShiftBalance = useCallback(async () => {
    try {
      const balance = await getCurrentDriverShiftBalance();

      if (!isMountedRef.current) {
        return;
      }

      const normalizedTotal = parseNumericValue(balance?.currentTotal ?? null);

      setShiftBalance(normalizedTotal);
    } catch (error) {
      console.warn('[Dashboard] Failed to fetch shift balance', error);
    }
  }, []);

  const refreshFinanceSummary = useCallback(async () => {
    try {
      const summary = await getDriverFinanceSummary();

      if (!isMountedRef.current) {
        return;
      }

      if (!summary) {
        setFinanceSummary(null);
        return;
      }

      setFinanceSummary({
        cashOnHand: parseNumericValue(summary.cashOnHand),
        unpaidEarnings: parseNumericValue(summary.unpaidEarnings),
        outstandingDailyFees: parseNumericValue(summary.outstandingDailyFees),
        depositThreshold: parseNumericValue(summary.depositThreshold),
        depositRequired: parseBooleanValue(summary.depositRequired),
        hasPendingDeposit: parseBooleanValue(summary.hasPendingDeposit),
        nextPayoutAmount: parseNumericValue(summary.nextPayoutAmount),
        feesToDeduct: parseNumericValue(summary.feesToDeduct),
      });
    } catch (error) {
      console.warn('[Dashboard] Failed to fetch finance summary', error);
    }
  }, []);

  useEffect(() => {
    if (!financeSummary) {
      setCashTooltipVisible(false);
    }
  }, [financeSummary]);

  const handleCloseCashTooltip = useCallback(() => {
    setCashTooltipVisible(false);
  }, []);

  const handleToggleCashTooltip = useCallback(() => {
    setCashTooltipVisible((previous) => !previous);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    void syncOngoingOrder();
  }, [hasHydrated, syncOngoingOrder]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!accessToken) {
      setShiftBalance(null);
      setFinanceSummary(null);
      return;
    }

    void refreshShiftBalance();
    void refreshFinanceSummary();
  }, [accessToken, hasHydrated, refreshFinanceSummary, refreshShiftBalance]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (
        (previousState === 'inactive' || previousState === 'background') &&
        nextAppState === 'active'
      ) {
        void syncOngoingOrder();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [syncOngoingOrder]);

  const fetchShift = useCallback(async (): Promise<DriverShift | null | undefined> => {
    try {
      const shift = await getCurrentDriverShift();

      return shift;
    } catch (error) {
      console.warn('[Dashboard] Failed to fetch current shift', error);
      return undefined;
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const syncShift = async () => {
      const sequenceSnapshot = shiftUpdateSequenceRef.current;

      if (!hasHydrated || !accessToken) {
        applyShiftUpdate(null, sequenceSnapshot);
        return;
      }

      const shift = await fetchShift();

      if (!isActive || shift === undefined) {
        return;
      }

      applyShiftUpdate(shift, sequenceSnapshot);
    };

    void syncShift();

    return () => {
      isActive = false;
    };
  }, [accessToken, applyShiftUpdate, fetchShift, hasHydrated]);

  useEffect(() => {
    if (!isOnline) {
      return;
    }

    let isActive = true;

    const syncShift = async () => {
      if (!hasHydrated || !accessToken) {
        return;
      }

      const sequenceSnapshot = shiftUpdateSequenceRef.current;
      const shift = await fetchShift();

      if (!isActive || shift === undefined) {
        return;
      }

      applyShiftUpdate(shift, sequenceSnapshot);
    };

    void syncShift();

    return () => {
      isActive = false;
    };
  }, [accessToken, applyShiftUpdate, fetchShift, hasHydrated, isOnline]);

  useEffect(() => {
    let isMounted = true;

    const startLocationTracking = async () => {
      try {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

        if (foregroundStatus !== 'granted') {
          console.warn('Permission to access location was denied');
          return;
        }

        const backgroundPermissions = await Location.requestBackgroundPermissionsAsync();
        const backgroundStatus = backgroundPermissions.status;

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });

        if (!isMounted) {
          return;
        }

        applyRegionUpdate(currentLocation.coords, true);
        await sendLocationUpdateRef.current?.(currentLocation.coords);

        if (backgroundStatus === 'granted') {
          await startBackgroundLocationUpdates();
        } else {
          console.warn('Background location permission was denied');
        }

        locationWatcher.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000,
            distanceInterval: 5,
          },
          (location) => {
            if (!isMounted) {
              return;
            }

            applyRegionUpdate(location.coords, true);
            void sendLocationUpdateRef.current?.(location.coords);
          },
        );
      } catch (error) {
        console.warn('Unable to start location tracking', error);
      }
    };

    startLocationTracking();

    return () => {
      isMounted = false;
      locationWatcher.current?.remove();
      locationWatcher.current = null;
      void stopBackgroundLocationUpdates();
    };
  }, [applyRegionUpdate]);

  const handleRecenter = useCallback(() => {
    handleCloseCashTooltip();

    if (userRegion && mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: userRegion.latitude,
            longitude: userRegion.longitude,
          },
          pitch: 0,
          heading: 0,
          altitude: 1200,
        },
        { duration: 750 },
      );
    }
  }, [handleCloseCashTooltip, userRegion]);

  useEffect(() => {
    if (!isIncomingOrderVisible) {
      return;
    }

    const intervalId = setInterval(() => {
      setIncomingCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(intervalId);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isIncomingOrderVisible]);

  useEffect(() => {
    if (!isIncomingOrderVisible) {
      setIncomingCountdown(INCOMING_ORDER_COUNTDOWN_SECONDS);
    }
  }, [isIncomingOrderVisible]);

  useEffect(() => {
    if (incomingCountdown <= 0 && isIncomingOrderVisible) {
      setIncomingOrderVisible(false);
      setPendingIncomingOrder(null);
      clearUpcomingOrder();
    }
  }, [clearUpcomingOrder, incomingCountdown, isIncomingOrderVisible]);

  const shiftFinishableDisplay = useMemo(() => {
    if (!currentShift?.finishableAt) {
      return null;
    }

    const rawTimestamp = currentShift.finishableAt;
    const finishableDate = parseShiftDate(rawTimestamp);

    if (!finishableDate) {
      return {
        time: rawTimestamp.replace('T', ' '),
        date: null,
      };
    }

    const timeString = finishableDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const today = new Date();
    const isSameDay = finishableDate.toDateString() === today.toDateString();
    const dateString = isSameDay
      ? null
      : finishableDate.toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
        });

    return {
      time: timeString,
      date: dateString,
    };
  }, [currentShift?.finishableAt]);

  const shiftStatusMessage = useMemo(() => {
    if (!shiftFinishableDisplay) {
      return null;
    }

    return shiftFinishableDisplay.date
      ? `Shift can end on ${shiftFinishableDisplay.date} at ${shiftFinishableDisplay.time}`
      : `Shift can end at ${shiftFinishableDisplay.time}`;
  }, [shiftFinishableDisplay]);

  const handleStartShift = useCallback(async () => {
    if (isUpdatingShift) {
      return;
    }

    setIsUpdatingShift(true);

    try {
      const shift = await updateDriverAvailability({ available: true });

      applyShiftUpdate(shift);
      setOnlineStatus(true);
    } catch (error) {
      console.warn('[Dashboard] Failed to start shift', error);
      Alert.alert('Unable to start shift', 'Please try again in a moment.');
    } finally {
      setIsUpdatingShift(false);
    }
  }, [applyShiftUpdate, isUpdatingShift, setOnlineStatus, updateDriverAvailability]);

  const handleToggleOnline = useCallback(
    async (nextValue: boolean) => {
      if (isUpdatingShift) {
        return;
      }

      if (nextValue) {
        setOnlineStatus(true);
        return;
      }

      if (!hasActiveShift) {
        setOnlineStatus(false);
        return;
      }

      const finishableAt = parseShiftDate(currentShift?.finishableAt ?? null);

      if (finishableAt && !Number.isNaN(finishableAt.getTime())) {
        const now = Date.now();

        if (now < finishableAt.getTime()) {
          const timeString = finishableAt.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          Alert.alert('Shift in progress', `You can end your shift at ${timeString}.`);
          setOnlineStatus(true);
          return;
        }
      }

      setIsUpdatingShift(true);

      try {
        const shift = await updateDriverAvailability({ available: false });

        applyShiftUpdate(shift);
        setOnlineStatus(false);
      } catch (error) {
        console.warn('[Dashboard] Failed to end shift', error);
        Alert.alert('Unable to end shift', 'Please try again in a moment.');
        setOnlineStatus(true);
      } finally {
        setIsUpdatingShift(false);
      }
    },
    [
      applyShiftUpdate,
      currentShift?.finishableAt,
      hasActiveShift,
      isUpdatingShift,
      setOnlineStatus,
      updateDriverAvailability,
    ],
  );

  const handleAcceptOrder = useCallback(async () => {
    if (isAcceptingOrder) {
      return;
    }

    const orderId = pendingIncomingOrder?.id;

    if (!orderId) {
      return;
    }

    setIsAcceptingOrder(true);

    try {
      const order = await acceptOrder(orderId);
      setOngoingOrder(order ?? EMPTY_ONGOING_ORDER_PLACEHOLDER);
      setIncomingOrderVisible(false);
      setPendingIncomingOrder(null);
      clearUpcomingOrder();
    } catch (error) {
      console.warn('[Dashboard] Failed to accept order', error);
      Alert.alert('Unable to accept order', 'Please try again in a moment.');
    } finally {
      setIsAcceptingOrder(false);
    }
  }, [
    acceptOrder,
    clearUpcomingOrder,
    isAcceptingOrder,
    pendingIncomingOrder,
  ]);

  const handleDeclineOrder = useCallback(() => {
    setIncomingOrderVisible(false);
    setPendingIncomingOrder(null);
    clearUpcomingOrder();
  }, [clearUpcomingOrder]);

  const callTargetLabel = shouldCallRestaurant ? 'restaurant' : 'client';

  const handleCallContact = useCallback(async () => {
    if (!callPhone) {
      Alert.alert(
        'Contact unavailable',
        `The ${callTargetLabel} phone number is not available for this order yet.`,
      );
      return;
    }

    const telUrl = `tel:${callPhone}`;

    try {
      const canOpen = await Linking.canOpenURL(telUrl);

      if (!canOpen) {
        Alert.alert('Unable to place call', 'Phone calls are not supported on this device.');
        return;
      }

      await Linking.openURL(telUrl);
    } catch (error) {
      console.warn('[Dashboard] Failed to open phone dialer', error);
      Alert.alert('Unable to place call', 'Please try again in a moment.');
    }
  }, [callPhone, callTargetLabel]);

  const handleSeeOrderDetails = useCallback(() => {
    console.log('See order details pressed');
    setOrderDetailsVisible(true);
  }, []);

  const handleLookForDirection = useCallback(async () => {
    if (!navigationTarget) {
      Alert.alert(
        'Directions unavailable',
        'Location details are not available for this order yet.',
      );
      return;
    }

    const { location, label } = navigationTarget;
    if (!location) {
      Alert.alert(
        'Directions unavailable',
        `The ${label} location is not available for this order yet.`,
      );
      return;
    }
    const coordinates = `${location.lat},${location.lng}`;
    const nativeUrl = `comgooglemaps://?daddr=${coordinates}&directionsmode=driving`;
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates}`;

    try {
      const canOpenNative = await Linking.canOpenURL(nativeUrl);

      if (canOpenNative) {
        await Linking.openURL(nativeUrl);
        return;
      }

      await Linking.openURL(fallbackUrl);
    } catch (error) {
      console.warn('[Dashboard] Failed to open maps', error);
      Alert.alert(
        'Unable to open Google Maps',
        `Please try again in a moment. The ${label} location could not be opened.`,
      );
    }
  }, [navigationTarget]);

  const handleScanToPickup = useCallback(() => {
    if (!isScanToPickupVisible) {
      return;
    }

    setScanOverlayVisible(true);
  }, [isScanToPickupVisible]);

  const handleOpenConfirmDelivery = useCallback(() => {
    if (!isConfirmDeliveryVisible) {
      return;
    }

    setConfirmDeliveryOverlayVisible(true);
  }, [isConfirmDeliveryVisible]);

  const handleCloseConfirmDelivery = useCallback(() => {
    setConfirmDeliveryOverlayVisible(false);
  }, []);

  const handleCloseResultModal = useCallback(() => {
    setResultModal((previous) => {
      previous?.onAfterClose?.();
      return null;
    });
  }, []);

  const handleSubmitDeliveryCode = useCallback(
    async (code: string) => {
      if (isProcessingDelivery) {
        return;
      }

      const orderId = ongoingOrder?.id;

      if (!orderId) {
        setConfirmDeliveryOverlayVisible(false);
        setResultModal({
          status: 'error',
          title: 'Incorrect Code !',
          message: 'Please verify the confirmation code and try again.',
        });
        return;
      }

      setIsProcessingDelivery(true);

      try {
        const isDelivered = await confirmOrderDelivery({
          orderId,
          token: code,
        });

        setConfirmDeliveryOverlayVisible(false);

        if (isDelivered) {
          setResultModal({
            status: 'success',
            title: 'Correct Code !',
            message: 'The delivery has been confirmed successfully.',
          });
          await syncOngoingOrder();
          await Promise.all([refreshShiftBalance(), refreshFinanceSummary()]);
        } else {
          setResultModal({
            status: 'error',
            title: 'Incorrect Code !',
            message: 'Please verify the confirmation code and try again.',
            onAfterClose: () => {
              if (confirmAvailabilityRef.current) {
                setConfirmDeliveryOverlayVisible(true);
              }
            },
          });
        }
      } catch (error) {
        console.warn('[Dashboard] Failed to confirm delivery', error);
        setConfirmDeliveryOverlayVisible(false);
        setResultModal({
          status: 'error',
          title: 'Incorrect Code !',
          message: 'Please verify the confirmation code and try again.',
          onAfterClose: () => {
            if (confirmAvailabilityRef.current) {
              setConfirmDeliveryOverlayVisible(true);
            }
          },
        });
      } finally {
        setIsProcessingDelivery(false);
      }
    },
    [
      isProcessingDelivery,
      ongoingOrder?.id,
      refreshFinanceSummary,
      refreshShiftBalance,
      syncOngoingOrder,
    ],
  );

  const handleCloseOrderDetails = useCallback(() => {
    setOrderDetailsVisible(false);
  }, []);

  const handleCloseScanner = useCallback(() => {
    setScanOverlayVisible(false);
  }, []);

  const handleQRCodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      if (isProcessingPickup) {
        return;
      }

      const orderId = ongoingOrder?.id;
      const token = typeof result.data === 'string' ? result.data.trim() : '';

      setIsProcessingPickup(true);
      setScanOverlayVisible(false);

      if (!orderId || !token) {
        setResultModal({
          status: 'error',
          title: 'Incorrect QR Code !',
          message: 'Please check your order again',
          onAfterClose: () => {
            if (scanAvailabilityRef.current) {
              setScanOverlayVisible(true);
            }
          },
        });
        setIsProcessingPickup(false);
        return;
      }

      try {
        await markOrderAsPickedUp({
          orderId,
          token,
        });

        setResultModal({
          status: 'success',
          title: 'Correct QR Code !',
          message: 'You can pick up your order',
        });

        await syncOngoingOrder();
      } catch (error) {
        console.warn('[Dashboard] Failed to mark order as picked up', error);
        setResultModal({
          status: 'error',
          title: 'Incorrect QR Code !',
          message: 'Please check your order again',
          onAfterClose: () => {
            if (scanAvailabilityRef.current) {
              setScanOverlayVisible(true);
            }
          },
        });
      } finally {
        setIsProcessingPickup(false);
      }
    },
    [isProcessingPickup, ongoingOrder?.id, syncOngoingOrder],
  );

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(goPulse, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(goPulse, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [goPulse]);

  const goScale = goPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const goGlowScale = goPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.24],
  });

  const goGlowOpacity = goPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.18],
  });

  const goInnerOpacity = goPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.45],
  });

  useEffect(() => {
    if (hasActiveShift && !isOnline) {
      setOnlineStatus(true);
    }
  }, [hasActiveShift, isOnline, setOnlineStatus]);

  const handleOpenSidebar = useCallback(() => {
    handleCloseCashTooltip();
    setIsSidebarOpen(true);
  }, [handleCloseCashTooltip]);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.mapOuter}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={userRegion ?? DEFAULT_REGION}
            customMapStyle={customMapStyle}
            ref={mapRef}
          >
            {userRegion && (
              <MarkerAnimated coordinate={driverCoordinate.current}>
                <View style={styles.mapMarker}>
                  <View style={styles.markerHead}>
                    <View style={styles.markerCore} />
                  </View>
                  <View style={styles.markerTail} />
                </View>
              </MarkerAnimated>
            )}
          </MapView>

          <View pointerEvents="box-none" style={{ ...styles.mapOverlay, paddingTop: instes.top }}>
            <View style={styles.header}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.menuButton}
                onPress={handleOpenSidebar}
              >
                <Menu style={styles.menuLine} size={moderateScale(30)}/>
              </TouchableOpacity>

              <View style={styles.balanceContainer} pointerEvents="box-none">
                <View style={styles.balancePill}>
                  <Text allowFontScaling={false} style={styles.balanceLabel}>
                    {shiftBalanceDisplay}
                  </Text>
                </View>

                <View style={styles.cashCardWrapper} pointerEvents="box-none">
                  {isCashTooltipVisible ? (
                    <View style={styles.cashTooltipContainer} pointerEvents="none">
                      <View style={styles.cashTooltipArrow} />
                      <View style={styles.cashTooltip}>
                        <Text allowFontScaling={false} style={styles.cashTooltipTitle}>
                          This is the total cash amount you are currently carrying.
                        </Text>
                        <Text allowFontScaling={false} style={styles.cashTooltipWarning}>
                          ⚠️ Important: If your cash balance reaches {depositThresholdTooltipDisplay}, you must
                          deposit it at headquarters before receiving new orders. Failure to deposit will
                          block new order assignments until compliance.
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleToggleCashTooltip}
                    style={styles.cashCardPressable}
                  >
                    <View
                      style={[
                        styles.cashCard,
                        { backgroundColor: cashCardBackground, shadowColor: cashCardShadowColor },
                      ]}
                    >
                      <Text allowFontScaling={false} style={styles.cashCardLabel}>
                        Cash on hand
                      </Text>
                      <Text allowFontScaling={false} style={styles.cashCardAmount}>
                        {cashOnHandDisplay}
                      </Text>

                      {isCashAtOrAboveThreshold ? (
                        <View style={styles.cashWarningIndicator}>
                          <TriangleAlert color="#ffffff" size={moderateScale(14)} strokeWidth={2.25} />
                        </View>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.locationButton}
                onPress={handleRecenter}
                disabled={!userRegion}
              >
                <View style={styles.locationCircle}>
                  <View style={styles.locationDot} />
                </View>
                <View style={styles.locationPointer} />
              </TouchableOpacity>
            </View>

            <View style={styles.overlayBottomContainer}>
              {isOngoingOrderVisible ? (
                <OngoingOrderBanner
                  callLabel={callLabel}
                  isCallDisabled={isCallDisabled}
                  onCallContact={handleCallContact}
                  onSeeOrderDetails={handleSeeOrderDetails}
                  onLookForDirection={handleLookForDirection}
                  onScanToPickup={handleScanToPickup}
                  isScanToPickupVisible={isScanToPickupVisible}
                  onConfirmDelivery={handleOpenConfirmDelivery}
                  isConfirmDeliveryVisible={isConfirmDeliveryVisible}
                  orderId={ongoingOrder?.id ?? null}
                  restaurantName={ongoingOrder?.restaurantName ?? null}
                  clientName={ongoingOrder?.clientName ?? null}
                  clientAddress={deliveryAddress}
                  orderTotal={ongoingOrder?.total ?? null}
                  orderStatus={ongoingOrder?.status ?? null}
                />
              ) : (
                !hasActiveShift && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.goWrapper}
                    onPress={handleStartShift}
                    disabled={isUpdatingShift}
                  >
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.goGlow,
                        { opacity: goGlowOpacity, transform: [{ scale: goGlowScale }] },
                      ]}
                    />
                    <Animated.View style={[styles.goButton, { transform: [{ scale: goScale }] }]}>
                      <Animated.View style={[styles.goInnerPulse, { opacity: goInnerOpacity }]} />
                      <View style={styles.goRing}>
                        <Text allowFontScaling={false} style={styles.goLabel}>
                          GO!
                        </Text>
                      </View>
                    </Animated.View>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        </View>

        <View style={{ ...styles.footer, paddingBottom: instes.bottom }}>
          <View style={styles.footerTextWrapper}>
            <Text allowFontScaling={false} style={styles.footerGreeting}>
              HELLO, {formattedName}
            </Text>
            {hasActiveShift && shiftStatusMessage ? (
              <View style={styles.shiftStatusPill}>
                <Text allowFontScaling={false} style={styles.shiftStatusText}>
                  {shiftStatusMessage}
                </Text>
              </View>
            ) : (
              <Text allowFontScaling={false} style={styles.footerSubtitle}>
                Ready to work ?
              </Text>
            )}
          </View>

          <View style={styles.statusWrapper}>
            <Text allowFontScaling={false} style={styles.statusLabel}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: '#E5E7EB', true: '#CA251B' }}
              thumbColor={isOnline ? '#ffffff' : undefined}
              disabled={isUpdatingShift}
            />
          </View>
        </View>

        {isIncomingOrderVisible && (
          <>
            <PlatformBlurView intensity={45} tint="dark" style={styles.blurOverlay} />
            <IncomingOrderOverlay
              countdownSeconds={incomingCountdown}
              onAccept={handleAcceptOrder}
              onDecline={handleDeclineOrder}
              orderLabel={incomingOrderLabel}
              subtitle={incomingOrderSubtitle}
            />
          </>
        )}
        {isOrderDetailsVisible && (
          <>
            <PlatformBlurView intensity={45} tint="dark" style={styles.blurOverlay} />
            <OngoingOrderDetailsOverlay order={ongoingOrder} onClose={handleCloseOrderDetails} />
          </>
        )}
        {isScanOverlayVisible && (
          <ScanToPickupOverlay
            onClose={handleCloseScanner}
            onScanned={handleQRCodeScanned}
            visible={isScanOverlayVisible}
          />
        )}
        {isConfirmDeliveryOverlayVisible && (
          <ConfirmDeliveryOverlay
            onClose={handleCloseConfirmDelivery}
            onSubmit={handleSubmitDeliveryCode}
            visible={isConfirmDeliveryOverlayVisible}
            isSubmitting={isProcessingDelivery}
          />
        )}
        {statusOverlay && (
          <>
            {!isIncomingOrderVisible && (
              <PlatformBlurView intensity={45} tint="dark" style={styles.blurOverlay} />
            )}
            <OngoingOrderStatusOverlay
              badgeLabel={statusOverlay.badgeLabel}
              title={statusOverlay.title}
              message={statusOverlay.message}
              onDismiss={handleDismissStatusOverlay}
            />
          </>
        )}
        <ActionResultModal
          visible={Boolean(resultModal)}
          status={resultModal?.status ?? 'success'}
          title={resultModal?.title ?? ''}
          message={resultModal?.message ?? ''}
          onClose={handleCloseResultModal}
        />
        <DashboardSidebar
          visible={isSidebarOpen}
          friendlyName={friendlyName}
          hasActiveShift={hasActiveShift}
          shiftStatusMessage={shiftStatusMessage}
          topInset={instes.top}
          bottomInset={instes.bottom}
          onClose={handleCloseSidebar}
        />
      </View>
    </View>
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
    position: 'relative',
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
    color:'#CA251B',
  },
  balanceContainer: {
    alignItems: 'center',
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
  cashCardWrapper: {
    marginTop: verticalScale(12),
    alignItems: 'center',
    position: 'relative',
  },
  cashCardPressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashCard: {
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(10),
    minWidth: moderateScale(140),
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.38,
    shadowRadius: moderateScale(10),
    elevation: moderateScale(4),
    alignItems: 'center',
  },
  cashCardLabel: {
    color: '#E2E8F0',
    fontSize: moderateScale(11),
    fontWeight: '600',
    letterSpacing: moderateScale(0.5),
    textTransform: 'uppercase',
  },
  cashCardAmount: {
    marginTop: verticalScale(4),
    color: '#ffffff',
    fontSize: moderateScale(19),
    fontWeight: '700',
    letterSpacing: moderateScale(0.4),
  },
  cashTooltipContainer: {
    position: 'absolute',
    top: '100%',
    alignItems: 'center',
    width: '100%',
    paddingTop: verticalScale(12),
  },
  cashTooltip: {
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    paddingHorizontal: moderateScale(18),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(18),
    maxWidth: moderateScale(280),
  },
  cashTooltipTitle: {
    color: '#F8FAFC',
    fontSize: moderateScale(13),
    fontWeight: '600',
    lineHeight: moderateScale(18),
  },
  cashTooltipWarning: {
    marginTop: verticalScale(8),
    color: '#FCD34D',
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
  },
  cashTooltipArrow: {
    marginBottom: verticalScale(4),
    width: 0,
    height: 0,
    borderLeftWidth: moderateScale(10),
    borderRightWidth: moderateScale(10),
    borderBottomWidth: moderateScale(12),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(15, 23, 42, 0.96)',
  },
  cashWarningIndicator: {
    marginTop: verticalScale(8),
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: '#B91C1C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(185, 28, 28, 0.28)',
    shadowOpacity: 1,
    shadowRadius: moderateScale(8),
    shadowOffset: { width: 0, height: verticalScale(3) },
    elevation: moderateScale(3),
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
    overflow: 'hidden',
    position: 'relative',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(24),
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
  goWrapper: {
    alignSelf: 'center',
    width: moderateScale(160),
    height: moderateScale(160),
    justifyContent: 'center',
    alignItems: 'center',
  },
  goGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(80),
    backgroundColor: '#CA251B',
  },
  goButton: {
    width: moderateScale(140),
    height: moderateScale(140),
    borderRadius: moderateScale(70),
    backgroundColor: '#CA251B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(202, 37, 27, 0.45)',
    shadowOffset: { width: 0, height: verticalScale(16) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(34),
    elevation: moderateScale(14),
    overflow: 'hidden',
  },
  goInnerPulse: {
    position: 'absolute',
    width: '78%',
    height: '78%',
    borderRadius: moderateScale(999),
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  goRing: {
    width: moderateScale(108),
    height: moderateScale(108),
    borderRadius: moderateScale(54),
    borderWidth: moderateScale(10),
    borderColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goLabel: {
    fontSize: moderateScale(30),
    fontWeight: '800',
    color: '#F9FAFB',
    letterSpacing: moderateScale(1.2),
  },
  overlayBottomContainer: {
    alignItems: 'center',
    width: '100%',
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: moderateScale(24),
    paddingTop: verticalScale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: 'rgba(15, 23, 42, 0.12)',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(20),
    elevation: moderateScale(10),
  },
  footerTextWrapper: {
    flex: 1,
    paddingRight: moderateScale(16),
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
  shiftStatusPill: {
    marginTop: verticalScale(8),
    alignSelf: 'flex-start',
    backgroundColor: '#CA251B',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(999),
  },
  shiftStatusText: {
    color: '#ffffff',
    fontSize: moderateScale(13),
    fontWeight: '600',
    letterSpacing: moderateScale(0.2),
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
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
