import NetInfo from '@react-native-community/netinfo';

export interface NetworkInfo {
  isConnected(): Promise<boolean>;
}

export class NetworkInfoImpl implements NetworkInfo {
  async isConnected(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }
}
