import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    // Web: use native browser events (NetInfo has limited web support)
    if (Platform.OS === 'web') {
      setIsConnected(navigator.onLine);
      const handleOnline = () => setIsConnected(true);
      const handleOffline = () => setIsConnected(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected };
};
