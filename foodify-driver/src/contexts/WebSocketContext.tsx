import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import { ENV } from '../constants/env';
import { OrderDto, OrderStatus } from '../types/order';

interface WebSocketContextValue {
  isConnected: boolean;
  incomingOrder: OrderDto | null;
  ongoingOrder: OrderDto | null;
  clearIncomingOrder: () => void;
  setOngoingOrder: (order: OrderDto | null) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, user } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingOrder, setIncomingOrder] = useState<OrderDto | null>(null);
  const [ongoingOrder, setOngoingOrder] = useState<OrderDto | null>(null);



  useEffect(() => {
    if (!accessToken) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setIsConnected(false);
      setIncomingOrder(null);
      setOngoingOrder(null);
      return;
    }

    if (!ENV.baseApiUrl) {
      console.warn('BASE_WS_URL is not defined. Skipping WebSocket connection.');
      return;
    }

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(ENV.baseApiUrl + '/ws'),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: (msg) => console.log('[STOMP]', msg),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    // ✅ Subscribe to personal user queue once connected
    stompClient.onConnect = () => {
      console.log('✅ STOMP connected');
      setIsConnected(true);

      stompClient.subscribe(`/user/${user?.id}/queue/orders`, (message: IMessage) => {
        try {
          const data = JSON.parse(message.body) as OrderDto;
          console.log('📦 Received order update:', data);
          if (data.upcoming) {
            console.log('This is an upcoming order we should display the overlay');
            setIncomingOrder(data);
            setOngoingOrder(null);
          } else {
            console.log('This means we are in an ongoing order and the order status changed');
            setIncomingOrder(null);
            const isCompleted =
              data.status === OrderStatus.DELIVERED ||
              data.status === OrderStatus.CANCELED ||
              data.status === OrderStatus.REJECTED;

            if (isCompleted) {
              setOngoingOrder(null);
            } else {
              setOngoingOrder(data);
            }
          }
        } catch {
          console.warn('Received non-JSON message from /user/queue/orders:', message.body);
        }
      });
    };

    stompClient.onDisconnect = () => {
      console.log('❌ STOMP disconnected');
      setIsConnected(false);
      setIncomingOrder(null);
      setOngoingOrder(null);
    };

    stompClient.onStompError = (frame) => {
      console.error('Broker error:', frame.headers['message'], frame.body);
    };

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
      clientRef.current = null;
      setIsConnected(false);
      setIncomingOrder(null);
      setOngoingOrder(null);
    };
  }, [accessToken, user?.id]);

  const clearIncomingOrder = useCallback(() => {
    setIncomingOrder(null);
  }, []);

  const handleSetOngoingOrder = useCallback((order: OrderDto | null) => {
    setOngoingOrder(order);
    if (order) {
      setIncomingOrder(null);
    }
  }, []);

  const value = useMemo<WebSocketContextValue>(
    () => ({
      isConnected,
      incomingOrder,
      ongoingOrder,
      clearIncomingOrder,
      setOngoingOrder: handleSetOngoingOrder,
    }),
    [clearIncomingOrder, handleSetOngoingOrder, incomingOrder, isConnected, ongoingOrder],
  );

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocketContext = () => {
  const context = React.useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};
