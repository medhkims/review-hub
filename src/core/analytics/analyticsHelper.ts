import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';
import { Platform } from 'react-native';
import { getAnalyticsConsent } from '@/presentation/shared/components/CookieConsentBanner';

export class AnalyticsHelper {
  private static analyticsInstance: ReturnType<typeof getAnalytics> | null = null;
  private static supported: boolean | null = null;

  private static async getInstance() {
    if (Platform.OS !== 'web') return null;
    if (this.supported === false) return null;

    // Check user consent before initializing analytics
    const consent = await getAnalyticsConsent();
    if (consent !== 'accepted') return null;

    if (this.analyticsInstance) return this.analyticsInstance;

    try {
      this.supported = await isSupported();
      if (!this.supported) return null;
      this.analyticsInstance = getAnalytics();
      return this.analyticsInstance;
    } catch {
      this.supported = false;
      return null;
    }
  }

  static async sendEvent(
    eventName: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<void> {
    try {
      const instance = await this.getInstance();
      if (!instance) return;
      logEvent(instance, eventName, params);
    } catch {
      // Analytics not available — silently skip
    }
  }

  static async sendScreenView(
    screenName: string,
    screenClass?: string,
  ): Promise<void> {
    try {
      const instance = await this.getInstance();
      if (!instance) return;
      (logEvent as (a: ReturnType<typeof getAnalytics>, name: string, p?: Record<string, unknown>) => void)(
        instance, 'screen_view', { firebase_screen: screenName, firebase_screen_class: screenClass ?? screenName },
      );
    } catch {
      // Analytics not available — silently skip
    }
  }
}
