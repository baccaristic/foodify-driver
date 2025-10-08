import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
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
import { PlatformBlurView } from '../../components/PlatformBlurView';

import { useAuth } from '../../contexts/AuthContext';
import {
  getCurrentDriverShift,
  updateDriverAvailability,
  updateDriverLocation,
} from '../../services/driverService';
import { IncomingOrderOverlay } from '../../components/IncomingOrderOverlay';
import { OngoingOrderBanner } from '../../components/OngoingOrderBanner';
import { OngoingOrderDetailsOverlay } from '../../components/OngoingOrderDetailsOverlay';
import { ScanToPickupOverlay } from '../../components/ScanToPickupOverlay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DriverShift, DriverShiftStatus } from '../../types/shift';
import { ENV } from '../../constants/env';
import type { OrderDto } from '../../types/order';

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

type StompFrame = {
  command: string;
  headers: Record<string, string>;
  body: string;
};

const STOMP_FRAME_DELIMITER = '\u0000';
const ORDER_SUBSCRIPTION_ID = 'driver-orders';
const DEFAULT_INCOMING_COUNTDOWN_SECONDS = 90;

const ensureOrdersWebsocketPath = (url: URL) => {
  const rawPath = url.pathname ?? '';
  const trimmedPath =
    rawPath === '/' ? '' : rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;

  if (!trimmedPath) {
    url.pathname = '/ws';
    return;
  }

  if (trimmedPath === '/ws' || trimmedPath.endsWith('/ws')) {
    url.pathname = trimmedPath;
    return;
  }

  url.pathname = `${trimmedPath}/ws`;
};

const normalizeExplicitWebsocketUrl = (candidate: string | undefined | null): string | null => {
  if (!candidate) {
    return null;
  }

  try {
    const url = new URL(candidate);

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      ensureOrdersWebsocketPath(url);
      return url.toString();
    }

    if (url.protocol === 'ws:' || url.protocol === 'wss:') {
      if (!url.pathname || url.pathname === '/') {
        url.pathname = '/ws';
      }

      return url.toString();
    }
  } catch (error) {
    console.warn('[Dashboard] Invalid websocket URL candidate', candidate, error);
  }

  return null;
};

const normalizeBaseApiWebsocketUrl = (baseApiUrl: string | undefined | null): string | null => {
  if (!baseApiUrl) {
    return null;
  }

  try {
    const url = new URL(baseApiUrl);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }

    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    ensureOrdersWebsocketPath(url);

    return url.toString();
  } catch (error) {
    console.warn('[Dashboard] Invalid base API URL', baseApiUrl, error);
    return null;
  }
};

const readStompFrames = (
  bufferRef: React.MutableRefObject<string>,
  chunk: string,
): StompFrame[] => {
  bufferRef.current += chunk;

  let working = bufferRef.current;
  const frames: StompFrame[] = [];

  while (true) {
    while (working.startsWith('\n')) {
      working = working.slice(1);
    }

    if (!working) {
      break;
    }

    const commandEnd = working.indexOf('\n');

    if (commandEnd === -1) {
      break;
    }

    const command = working.slice(0, commandEnd).trim();

    if (!command) {
      working = working.slice(commandEnd + 1);
      continue;
    }

    let cursor = commandEnd + 1;
    const headers: Record<string, string> = {};

    while (cursor < working.length) {
      const lineEnd = working.indexOf('\n', cursor);

      if (lineEnd === -1) {
        bufferRef.current = working;
        return frames;
      }

      if (lineEnd === cursor) {
        cursor = lineEnd + 1;
        break;
      }

      const headerLine = working.slice(cursor, lineEnd);
      const separatorIndex = headerLine.indexOf(':');

      if (separatorIndex >= 0) {
        const key = headerLine.slice(0, separatorIndex).trim();
        const value = headerLine.slice(separatorIndex + 1).trim();

        headers[key] = value;
      }

      cursor = lineEnd + 1;
    }

    const contentLengthHeader = headers['content-length'];

    if (contentLengthHeader != null) {
      const contentLength = Number(contentLengthHeader);

      if (!Number.isNaN(contentLength)) {
        if (cursor + contentLength > working.length) {
          break;
        }

        const body = working.slice(cursor, cursor + contentLength);
        let frameEnd = cursor + contentLength;

        if (working[frameEnd] === '\n') {
          frameEnd += 1;
        }

        if (working[frameEnd] === STOMP_FRAME_DELIMITER) {
          frameEnd += 1;
        } else {
          const delimiterIndex = working.indexOf(STOMP_FRAME_DELIMITER, frameEnd);

          if (delimiterIndex === -1) {
            break;
          }

          frameEnd = delimiterIndex + 1;
        }

        frames.push({ command, headers, body });
        working = working.slice(frameEnd);
        continue;
      }
    }

    const terminatorIndex = working.indexOf(STOMP_FRAME_DELIMITER, cursor);

    if (terminatorIndex === -1) {
      break;
    }

    const body = working.slice(cursor, terminatorIndex);
    working = working.slice(terminatorIndex + 1);

    frames.push({ command, headers, body });
  }

  bufferRef.current = working;

  return frames;
};

const computeInitialIncomingCountdown = (order: OrderDto): number => {
  const pickUpValue = order?.estimatedPickUpTime;
  const asNumber = typeof pickUpValue === 'string' ? Number(pickUpValue) : pickUpValue;

  if (typeof asNumber === 'number' && Number.isFinite(asNumber)) {
    const deltaMs = asNumber - Date.now();

    if (Number.isFinite(deltaMs) && deltaMs > 0) {
      return Math.max(Math.ceil(deltaMs / 1000), 1);
    }
  }

  return DEFAULT_INCOMING_COUNTDOWN_SECONDS;
};

const DEFAULT_REGION = {
  latitude: 47.5726,
  longitude: -122.3863,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

export const DashboardScreen: React.FC = () => {
  const { user, isOnline, accessToken, hasHydrated, setOnlineStatus } = useAuth();

  const formattedName = (user?.name || user?.email || 'Driver').toUpperCase();
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
  const ordersSocketRef = useRef<WebSocket | null>(null);
  const ordersReconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stompBufferRef = useRef('');
  const stompConnectedRef = useRef(false);
  const isOrdersSubscribedRef = useRef(false);
  const shouldMaintainOrdersConnectionRef = useRef(false);
  const [incomingOrder, setIncomingOrder] = useState<OrderDto | null>(null);
  const [isIncomingOrderVisible, setIncomingOrderVisible] = useState<boolean>(false);
  const [incomingCountdown, setIncomingCountdown] = useState<number>(0);
  const [ongoingOrder, setOngoingOrder] = useState<OrderDto | null>(null);
  const [isOngoingOrderVisible, setOngoingOrderVisible] = useState<boolean>(false);
  const [isOrderDetailsVisible, setOrderDetailsVisible] = useState<boolean>(false);
  const [isScanOverlayVisible, setScanOverlayVisible] = useState<boolean>(false);
  const [currentShift, setCurrentShift] = useState<DriverShift | null>(null);
  const [isUpdatingShift, setIsUpdatingShift] = useState<boolean>(false);
  const hasActiveShift =
    currentShift?.status === DriverShiftStatus.ACTIVE && Boolean(currentShift.startedAt);
  const goPulse = useRef(new Animated.Value(0)).current;
  const instes = useSafeAreaInsets();
  const shiftUpdateSequenceRef = useRef(0);
  const isMountedRef = useRef(true);

  const clearOrdersReconnectTimeout = useCallback(() => {
    if (ordersReconnectTimeoutRef.current) {
      clearTimeout(ordersReconnectTimeoutRef.current);
      ordersReconnectTimeoutRef.current = null;
    }
  }, []);

  const closeOrdersSocket = useCallback(() => {
    clearOrdersReconnectTimeout();

    const socket = ordersSocketRef.current;

    if (socket) {
      try {
        if (isOrdersSubscribedRef.current && socket.readyState === 1) {
          socket.send(
            ['UNSUBSCRIBE', `id:${ORDER_SUBSCRIPTION_ID}`, '', STOMP_FRAME_DELIMITER].join('\n'),
          );
        }
      } catch (error) {
        console.warn('[Dashboard] Failed to unsubscribe from driver orders channel', error);
      }

      try {
        if (stompConnectedRef.current && socket.readyState === 1) {
          socket.send(['DISCONNECT', '', STOMP_FRAME_DELIMITER].join('\n'));
        }
      } catch (error) {
        console.warn('[Dashboard] Failed to send STOMP disconnect frame', error);
      }

      try {
        socket.close();
      } catch (error) {
        console.warn('[Dashboard] Failed to close orders websocket', error);
      }
    }

    ordersSocketRef.current = null;
    stompConnectedRef.current = false;
    isOrdersSubscribedRef.current = false;
    stompBufferRef.current = '';
  }, [clearOrdersReconnectTimeout]);

  const resolveOrdersWebsocketUrl = useCallback((): string | null => {
    const explicitUrl = normalizeExplicitWebsocketUrl(ENV.websocketUrl);

    if (explicitUrl) {
      return explicitUrl;
    }

    const derivedUrl = normalizeBaseApiWebsocketUrl(ENV.baseApiUrl);

    if (!derivedUrl) {
      console.warn('[Dashboard] Unable to determine orders websocket URL');
    }

    return derivedUrl;
  }, []);

  const dismissIncomingOrder = useCallback(() => {
    setIncomingOrder(null);
    setIncomingOrderVisible(false);
    setIncomingCountdown(0);
  }, []);

  const handleDriverOrderMessage = useCallback(
    (order: OrderDto) => {
      if (order.upcoming) {
        setOngoingOrder(null);
        setOngoingOrderVisible(false);
        setIncomingOrder(order);
        setIncomingCountdown(computeInitialIncomingCountdown(order));
        setIncomingOrderVisible(true);
        setOrderDetailsVisible(false);
        return;
      }

      dismissIncomingOrder();
      setOngoingOrder(order);
      setOngoingOrderVisible(true);
    },
    [dismissIncomingOrder],
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          console.warn('Permission to access location was denied');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });

        if (!isMounted) {
          return;
        }

        applyRegionUpdate(currentLocation.coords, true);
        await sendLocationUpdateRef.current?.(currentLocation.coords);

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
    };
  }, [applyRegionUpdate]);

  useEffect(() => {
    const shouldConnect = Boolean(accessToken && hasActiveShift && isOnline);

    shouldMaintainOrdersConnectionRef.current = shouldConnect;

    if (!shouldConnect) {
      closeOrdersSocket();
      return;
    }

    const websocketUrl = resolveOrdersWebsocketUrl();

    if (!websocketUrl) {
      return;
    }

    let isCancelled = false;

    const connect = () => {
      clearOrdersReconnectTimeout();

      if (isCancelled || !shouldMaintainOrdersConnectionRef.current) {
        return;
      }

      try {
        const socket = new (WebSocket as unknown as {
          new (url: string, protocols?: string | string[], options?: unknown): WebSocket;
        })(websocketUrl, undefined, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        ordersSocketRef.current = socket;
        stompConnectedRef.current = false;
        isOrdersSubscribedRef.current = false;
        stompBufferRef.current = '';

        socket.onopen = () => {
          if (isCancelled || socket !== ordersSocketRef.current) {
            return;
          }

          let hostHeader: string | undefined;

          try {
            const parsed = new URL(websocketUrl);
            hostHeader = parsed.host;
          } catch (error) {
            console.warn('[Dashboard] Unable to determine websocket host header', error);
          }

          const headerLines = [
            hostHeader ? `host:${hostHeader}` : null,
            'accept-version:1.2',
            'heart-beat:0,0',
            `Authorization:Bearer ${accessToken}`,
          ].filter(Boolean) as string[];

          const frame = ['CONNECT', ...headerLines, '', STOMP_FRAME_DELIMITER].join('\n');

          try {
            socket.send(frame);
          } catch (error) {
            console.warn('[Dashboard] Failed to send STOMP CONNECT frame', error);
          }
        };

        socket.onmessage = (event) => {
          if (isCancelled || socket !== ordersSocketRef.current) {
            return;
          }

          if (typeof event.data !== 'string') {
            return;
          }

          const frames = readStompFrames(stompBufferRef, event.data);

          frames.forEach((frame) => {
            if (frame.command === 'CONNECTED') {
              stompConnectedRef.current = true;

              if (socket.readyState === 1) {
                const subscribeFrame = [
                  'SUBSCRIBE',
                  `id:${ORDER_SUBSCRIPTION_ID}`,
                  'ack:auto',
                  'destination:/user/queue/orders',
                  '',
                  STOMP_FRAME_DELIMITER,
                ].join('\n');

                try {
                  socket.send(subscribeFrame);
                  isOrdersSubscribedRef.current = true;
                } catch (error) {
                  console.warn('[Dashboard] Failed to subscribe to orders queue', error);
                }
              }

              return;
            }

            if (frame.command === 'MESSAGE') {
              if (!frame.body) {
                return;
              }

              try {
                const payload = JSON.parse(frame.body) as OrderDto;
                handleDriverOrderMessage(payload);
              } catch (error) {
                console.warn('[Dashboard] Failed to parse order message', error);
              }

              return;
            }

            if (frame.command === 'ERROR') {
              const message = frame.headers.message || frame.body || 'Unknown STOMP error';
              console.warn('[Dashboard] STOMP error', message);
            }
          });
        };

        socket.onerror = (event) => {
          console.warn('[Dashboard] Orders websocket error', event);
        };

        socket.onclose = () => {
          if (socket === ordersSocketRef.current) {
            ordersSocketRef.current = null;
          }

          stompConnectedRef.current = false;
          isOrdersSubscribedRef.current = false;
          stompBufferRef.current = '';

          if (isCancelled || !shouldMaintainOrdersConnectionRef.current) {
            return;
          }

          clearOrdersReconnectTimeout();

          ordersReconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        };
      } catch (error) {
        console.warn('[Dashboard] Failed to open orders websocket', error);

        if (isCancelled || !shouldMaintainOrdersConnectionRef.current) {
          return;
        }

        clearOrdersReconnectTimeout();
        ordersReconnectTimeoutRef.current = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      isCancelled = true;
      shouldMaintainOrdersConnectionRef.current = false;
      closeOrdersSocket();
    };
  }, [
    accessToken,
    clearOrdersReconnectTimeout,
    closeOrdersSocket,
    handleDriverOrderMessage,
    hasActiveShift,
    isOnline,
    resolveOrdersWebsocketUrl,
  ]);

  const handleRecenter = useCallback(() => {
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
  }, [userRegion]);

  useEffect(() => {
    if (!isIncomingOrderVisible) {
      return;
    }

    const intervalId = setInterval(() => {
      setIncomingCountdown((prev) => {
        if (prev <= 1) {
          dismissIncomingOrder();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [dismissIncomingOrder, isIncomingOrderVisible]);

  useEffect(() => {
    if (hasActiveShift && isOnline) {
      return;
    }

    dismissIncomingOrder();
    setOngoingOrder(null);
    setOngoingOrderVisible(false);
    setOrderDetailsVisible(false);
  }, [dismissIncomingOrder, hasActiveShift, isOnline]);

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

  const handleAcceptOrder = useCallback(() => {
    if (!incomingOrder) {
      dismissIncomingOrder();
      return;
    }

    setOngoingOrder(incomingOrder);
    setOngoingOrderVisible(true);
    dismissIncomingOrder();
  }, [dismissIncomingOrder, incomingOrder]);

  const handleDeclineOrder = useCallback(() => {
    dismissIncomingOrder();
    setOngoingOrder(null);
    setOngoingOrderVisible(false);
  }, [dismissIncomingOrder]);

  const handleCallRestaurant = useCallback(() => {
    console.log('Call Restaurant pressed');
  }, []);

  const handleSeeOrderDetails = useCallback(() => {
    if (!ongoingOrder) {
      return;
    }

    console.log('See order details pressed');
    setOrderDetailsVisible(true);
  }, [ongoingOrder]);

  const handleLookForDirection = useCallback(() => {
    console.log('Look for direction pressed');
  }, []);

  const handleScanToPickup = useCallback(() => {
    setScanOverlayVisible(true);
  }, []);

  const handleCloseOrderDetails = useCallback(() => {
    setOrderDetailsVisible(false);
  }, []);

  const handleCloseScanner = useCallback(() => {
    setScanOverlayVisible(false);
  }, []);

  const handleQRCodeScanned = useCallback((result: BarcodeScanningResult) => {
    console.log('QR code scanned:', result.data);
    setScanOverlayVisible(false);
  }, []);

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

  const shouldShowIncomingOverlay = Boolean(isIncomingOrderVisible && incomingOrder);
  const incomingOrderLabel = incomingOrder?.restaurantName ?? 'New Order';
  const incomingOrderSubtitle = incomingOrder?.restaurantAddress
    ? `Pickup at ${incomingOrder.restaurantAddress}`
    : incomingOrder?.clientAddress
      ? `Deliver to ${incomingOrder.clientAddress}`
      : 'You have a new pickup request';
  const shouldShowOngoingBanner = Boolean(isOngoingOrderVisible && ongoingOrder);

  useEffect(() => {
    if (hasActiveShift && !isOnline) {
      setOnlineStatus(true);
    }
  }, [hasActiveShift, isOnline, setOnlineStatus]);

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
              {hasActiveShift && shiftFinishableDisplay && (
                <View style={styles.shiftTimerWrapper}>
                  <Text allowFontScaling={false} style={styles.shiftTimerLabel}>
                    SHIFT CAN END {shiftFinishableDisplay.date ? 'ON' : 'AT'}
                  </Text>
                  <Text allowFontScaling={false} style={styles.shiftTimerValue}>
                    {shiftFinishableDisplay.time}
                  </Text>
                  {shiftFinishableDisplay.date && (
                    <Text allowFontScaling={false} style={styles.shiftTimerSubValue}>
                      {shiftFinishableDisplay.date}
                    </Text>
                  )}
                </View>
              )}
              {shouldShowOngoingBanner ? (
                <OngoingOrderBanner
                  onCallRestaurant={handleCallRestaurant}
                  onSeeOrderDetails={handleSeeOrderDetails}
                  onLookForDirection={handleLookForDirection}
                  onScanToPickup={handleScanToPickup}
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

        <View style={{...styles.footer, paddingBottom: instes.bottom}}>
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
              onValueChange={handleToggleOnline}
              trackColor={{ false: '#E5E7EB', true: '#CA251B' }}
              thumbColor={isOnline ? '#ffffff' : undefined}
              disabled={isUpdatingShift}
            />
          </View>
        </View>

        {shouldShowIncomingOverlay && (
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
            <OngoingOrderDetailsOverlay onClose={handleCloseOrderDetails} />
          </>
        )}
        {isScanOverlayVisible && (
          <ScanToPickupOverlay
            onClose={handleCloseScanner}
            onScanned={handleQRCodeScanned}
            visible={isScanOverlayVisible}
          />
        )}
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
    backgroundColor: '#CA251B',
  },
  menuLineMedium: {
    width: moderateScale(18),
    height: verticalScale(3),
    borderRadius: moderateScale(2),
    backgroundColor: '#CA251B',
  },
  menuLineSmall: {
    width: moderateScale(12),
    height: verticalScale(3),
    borderRadius: moderateScale(2),
    backgroundColor: '#CA251B',
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
  shiftTimerWrapper: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(28),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(999),
    backgroundColor: '#ffffff',
    shadowColor: 'rgba(15, 23, 42, 0.12)',
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowOpacity: 1,
    shadowRadius: moderateScale(18),
    elevation: moderateScale(10),
    marginBottom: verticalScale(18),
    minWidth: moderateScale(200),
  },
  shiftTimerLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    letterSpacing: moderateScale(1),
    color: '#6B7280',
  },
  shiftTimerValue: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(30),
    fontWeight: '700',
    color: '#111827',
    letterSpacing: moderateScale(1.2),
  },
  shiftTimerSubValue: {
    marginTop: verticalScale(2),
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: moderateScale(0.4),
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
