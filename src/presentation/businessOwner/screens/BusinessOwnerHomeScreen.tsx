import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useBusinessDashboard } from '../hooks/useBusinessDashboard';
import CompanyProfileFullScreen from './CompanyProfileFullScreen';
import { ErrorView } from '@/presentation/shared/components/ui/ErrorView';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';

export default function BusinessOwnerHomeScreen() {
  useAnalyticsScreen(AnalyticsScreens.BUSINESS_OWNER_HOME);
  const { business, isLoading, error, refresh } = useBusinessDashboard();

  if (isLoading && !business) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.midnight, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.neonPurple} />
      </View>
    );
  }

  if (error && !business) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.midnight, alignItems: 'center', justifyContent: 'center' }}>
        <ErrorView message={error} onRetry={refresh} />
      </View>
    );
  }

  return <CompanyProfileFullScreen business={business} onRefresh={refresh} />;
}
