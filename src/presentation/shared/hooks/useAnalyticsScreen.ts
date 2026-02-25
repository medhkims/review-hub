import { useEffect } from 'react';
import { AnalyticsHelper } from '@/core/analytics/analyticsHelper';

export const useAnalyticsScreen = (screenName: string): void => {
  useEffect(() => {
    AnalyticsHelper.sendScreenView(screenName);
  }, [screenName]);
};
