import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export interface NetworkInfo {
  isConnected(): Promise<boolean>;
}

export class NetworkInfoImpl implements NetworkInfo {
  async isConnected(): Promise<boolean> {
    // Web: use navigator.onLine (NetInfo has limited web support)
    if (Platform.OS === 'web') {
      return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }
    const state = await NetInfo.fetch();
    // Treat null/unknown as connected (matches useNetworkStatus behaviour)
    return state.isConnected !== false;
  }
}
