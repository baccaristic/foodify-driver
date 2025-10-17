import React from 'react';

import { useDriverHeartbeat } from '../hooks/useDriverHeartbeat';

export const SessionHeartbeatManager: React.FC = () => {
  useDriverHeartbeat();

  return null;
};
