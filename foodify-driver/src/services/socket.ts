import { ENV } from '../constants/env';

export const createDriverSocket = (): WebSocket => {
  return new WebSocket(ENV.websocketUrl);
};
