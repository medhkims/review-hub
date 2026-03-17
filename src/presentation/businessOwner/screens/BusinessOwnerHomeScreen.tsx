import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useBusinessDashboard } from '../hooks/useBusinessDashboard';
import CompanyProfileFullScreen from './CompanyProfileFullScreen';
import { ErrorView } from '@/presentation/shared/components/ui/ErrorView';
import { PhoneVerificationModal } from '@/presentation/auth/components/PhoneVerificationModal';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';

export default function BusinessOwnerHomeScreen() {
  useAnalyticsScreen(AnalyticsScreens.BUSINESS_OWNER_HOME);
  const { business, isLoading, error, refresh } = useBusinessDashboard();
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const hasPromptedRef = useRef(false);

  // Show modal once after business loads and phone is not verified
  useEffect(() => {
    if (
      business &&
      !hasPromptedRef.current &&
      !business.contact.phoneVerified
    ) {
      hasPromptedRef.current = true;
      // Small delay so the screen renders first
      const timer = setTimeout(() => setPhoneModalVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [business]);

  const handleVerified = useCallback(() => {
    setPhoneModalVisible(false);
    refresh();
  }, [refresh]);

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

  return (
    <>
      <CompanyProfileFullScreen business={business} onRefresh={refresh} />
      {business && (
        <PhoneVerificationModal
          visible={phoneModalVisible}
          businessId={business.id}
          initialPhone={business.contact.phone}
          onVerified={handleVerified}
          onDismiss={() => setPhoneModalVisible(false)}
        />
      )}
    </>
  );
}
