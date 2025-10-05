declare module 'expo-constants' {
  type ExpoConstants = {
    expoConfig?: {
      extra?: Record<string, unknown>;
    };
  };

  const Constants: ExpoConstants;
  export default Constants;
}

declare module 'expo-secure-store' {
  export function getItemAsync(key: string): Promise<string | null>;
  export function setItemAsync(key: string, value: string): Promise<void>;
  export function deleteItemAsync(key: string): Promise<void>;
}

declare module 'axios' {
  export type AxiosRequestConfig = Record<string, unknown>;
  export type AxiosResponse<T = any> = { data: T } & Record<string, unknown>;
  export type AxiosError = Error & { response?: AxiosResponse };
  export interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<AxiosResponse>;
    create: (config?: AxiosRequestConfig) => AxiosInstance;
    interceptors: {
      request: { use: (fulfilled: (config: AxiosRequestConfig) => AxiosRequestConfig, rejected?: (error: any) => any) => void };
      response: {
        use: (
          fulfilled: (response: AxiosResponse) => AxiosResponse,
          rejected?: (error: AxiosError) => any,
        ) => void;
      };
    };
  }
  const axios: AxiosInstance;
  export default axios;
}

declare module 'zustand' {
  export type SetState<T> = (updater: (state: T) => T | Partial<T>) => void;
  export type StateCreator<T> = (set: SetState<T>, get: () => T) => T;
  export function create<T>(creator: StateCreator<T>): () => T;
}

declare module 'zustand/middleware' {
  import type { StateCreator } from 'zustand';

  export type StateStorage = {
    getItem: (name: string) => string | Promise<string | null> | null;
    setItem: (name: string, value: string) => void | Promise<void>;
    removeItem: (name: string) => void | Promise<void>;
  };

  export function persist<T>(creator: StateCreator<T>, options: Record<string, unknown>): StateCreator<T>;
  export function createJSONStorage<T>(getStorage: () => StateStorage): any;
}

declare module 'react-native-maps' {
  import type { ComponentType } from 'react';
  import type { ViewProps } from 'react-native';

  export type Region = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };

  export type MapViewProps = ViewProps & {
    provider?: 'google' | 'default';
    initialRegion?: Region;
    customMapStyle?: Array<Record<string, unknown>>;
  };

  export type MarkerProps = ViewProps & {
    coordinate: {
      latitude: number;
      longitude: number;
    };
  };

  export const PROVIDER_GOOGLE: 'google';

  const MapView: ComponentType<MapViewProps> & {
    Marker: ComponentType<MarkerProps>;
  };

  export const Marker: ComponentType<MarkerProps>;

  export default MapView;
}

declare module 'react-native-size-matters' {
  export function scale(size: number): number;
  export function verticalScale(size: number): number;
  export function moderateScale(size: number, factor?: number): number;
}
