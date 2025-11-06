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
import { OrderDto } from '../types/order';

export interface DepositWarningMessage {
  type: string;
  title: string;
  message: string;
  cashOnHand: number;
  depositThreshold: number;
  deadlineHours: number;
}

interface WebSocketContextValue {
  isConnected: boolean;
  upcomingOrder: OrderDto | null;
  clearUpcomingOrder: () => void;
  ongoingOrderUpdate: OrderDto | null;
  depositWarning: DepositWarningMessage | null;
  clearDepositWarning: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, user } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [upcomingOrder, setUpcomingOrder] = useState<OrderDto | null>(null);
  const [ongoingOrderUpdate, setOngoingOrderUpdate] = useState<OrderDto | null>(null);
  const [depositWarning, setDepositWarning] = useState<DepositWarningMessage | null>(null);



  useEffect(() => {
    if (!accessToken) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setIsConnected(false);
      setUpcomingOrder(null);
      setOngoingOrderUpdate(null);
      setDepositWarning(null);
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
            setUpcomingOrder(data);
          } else {
            setOngoingOrderUpdate(data);
          }
        } catch {
          console.warn('Received non-JSON message from /user/queue/orders:', message.body);
        }
      });

      stompClient.subscribe(`/user/${user?.id}/queue/warnings`, (message: IMessage) => {
        try {
          const data = JSON.parse(message.body) as DepositWarningMessage;
          console.log('⚠️ Received deposit warning:', data);
          if (data.type === 'DEPOSIT_WARNING') {
            setDepositWarning(data);
          }
        } catch {
          console.warn('Received non-JSON message from /user/queue/warnings:', message.body);
        }
      });
    };

    stompClient.onDisconnect = () => {
      console.log('❌ STOMP disconnected');
      setIsConnected(false);
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
      setUpcomingOrder(null);
      setOngoingOrderUpdate(null);
      setDepositWarning(null);
    };
  }, [accessToken, user?.id]);

  const clearUpcomingOrder = useCallback(() => {
    setUpcomingOrder(null);
  }, []);

  const clearDepositWarning = useCallback(() => {
    setDepositWarning(null);
  }, []);

  const value = useMemo<WebSocketContextValue>(
    () => ({
      isConnected,
      upcomingOrder,
      clearUpcomingOrder,
      ongoingOrderUpdate,
      depositWarning,
      clearDepositWarning,
    }),
    [clearUpcomingOrder, clearDepositWarning, depositWarning, isConnected, ongoingOrderUpdate, upcomingOrder],
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
