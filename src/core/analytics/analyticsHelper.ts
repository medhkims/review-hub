import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

export class AnalyticsHelper {
  private static isAvailable(): boolean {
    return Platform.OS !== 'web';
  }

  static async sendEvent(
    eventName: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      await analytics().logEvent(eventName, params);
    } catch {
      // Analytics not available — silently skip
    }
  }

  static async sendScreenView(
    screenName: string,
    screenClass?: string,
  ): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass ?? screenName,
      });
    } catch {
      // Analytics not available — silently skip
    }
  }
}
