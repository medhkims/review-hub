import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { useFaq } from '@/presentation/settings/hooks/useFaq';
import { useTheme } from '@/core/theme/useTheme';
import { useRoleStore } from '@/presentation/auth/store/roleStore';
import { FaqEntity } from '@/domain/faq/entities/faqEntity';

type AudienceTab = 'user' | 'business' | 'moderator';

type FaqItemProps = {
  faq: FaqEntity;
  isExpanded: boolean;
  onToggle: () => void;
  theme: ReturnType<typeof useTheme>;
};

const FaqItem = React.memo(({ faq, isExpanded, onToggle, theme }: FaqItemProps) => (
  <Pressable
    onPress={onToggle}
    accessibilityRole="button"
    accessibilityLabel={faq.question}
    accessibilityState={{ expanded: isExpanded }}
    style={{
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <AppText
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: '600',
          color: theme.text,
          lineHeight: 22,
        }}
      >
        {faq.question}
      </AppText>
      <MaterialCommunityIcons
        name={isExpanded ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={theme.textSecondary}
      />
    </View>
    {isExpanded && (
      <AppText
        style={{
          marginTop: 10,
          fontSize: 14,
          color: theme.textSecondary,
          lineHeight: 22,
        }}
      >
        {faq.answer}
      </AppText>
    )}
  </Pressable>
));

type AudienceTabBarProps = {
  selected: AudienceTab;
  onSelect: (tab: AudienceTab) => void;
  theme: ReturnType<typeof useTheme>;
  t: (key: string) => string;
};

const TABS: AudienceTab[] = ['user', 'business', 'moderator'];

const AudienceTabBar = React.memo(({ selected, onSelect, theme, t }: AudienceTabBarProps) => (
  <View
    style={{
      flexDirection: 'row',
      marginHorizontal: 16,
      marginTop: 14,
      marginBottom: 4,
      backgroundColor: theme.border,
      borderRadius: 10,
      padding: 3,
    }}
  >
    {TABS.map((tab) => (
      <Pressable
        key={tab}
        onPress={() => onSelect(tab)}
        accessibilityRole="tab"
        accessibilityLabel={t(`helpCenter.tabs.${tab}`)}
        accessibilityState={{ selected: selected === tab }}
        style={{
          flex: 1,
          paddingVertical: 8,
          borderRadius: 8,
          alignItems: 'center',
          backgroundColor: selected === tab ? theme.card : 'transparent',
        }}
      >
        <AppText
          style={{
            fontSize: 13,
            fontWeight: selected === tab ? '700' : '400',
            color: selected === tab ? theme.text : theme.textSecondary,
          }}
        >
          {t(`helpCenter.tabs.${tab}`)}
        </AppText>
      </Pressable>
    ))}
  </View>
));

function filterFaqsByAudience(faqs: FaqEntity[], tab: AudienceTab): FaqEntity[] {
  return faqs.filter((f) => f.audience.includes(tab));
}

export default function HelpCenterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { faqs, isLoading, error, refetch } = useFaq();
  const { role } = useRoleStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [selectedTab, setSelectedTab] = useState<AudienceTab>('user');
  const tabInitialised = useRef(false);

  useEffect(() => {
    if (role === 'admin') {
      router.replace('/(main)/(settings)/manage-faq');
      return;
    }
    if (!tabInitialised.current && role) {
      tabInitialised.current = true;
      if (role === 'business' || role === 'moderator') {
        setSelectedTab(role);
      }
    }
  }, [role, router]);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleTabChange = useCallback((tab: AudienceTab) => {
    setSelectedTab(tab);
    setExpandedId(null);
  }, []);

  const visibleFaqs = filterFaqsByAudience(faqs, selectedTab);

  return (
    <ScreenLayout>
      {/* Header */}
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          style={{ marginRight: 12 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <AppText style={{ fontSize: 17, fontWeight: '600', color: theme.text }}>
          {t('helpCenter.title')}
        </AppText>
      </View>

      {/* Audience Tab Bar */}
      <AudienceTabBar
        selected={selectedTab}
        onSelect={handleTabChange}
        theme={theme}
        t={t}
      />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.text} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <AppText style={{ color: theme.textSecondary, textAlign: 'center', marginBottom: 16 }}>
            {error}
          </AppText>
          <Pressable
            onPress={refetch}
            accessibilityRole="button"
            accessibilityLabel={t('common.retry')}
            style={{
              backgroundColor: theme.text,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <AppText style={{ color: theme.card, fontWeight: '600' }}>{t('common.retry')}</AppText>
          </Pressable>
        </View>
      ) : visibleFaqs.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <MaterialCommunityIcons name="help-circle-outline" size={48} color={theme.textSecondary} />
          <AppText style={{ color: theme.textSecondary, marginTop: 12, textAlign: 'center' }}>
            {t('helpCenter.empty')}
          </AppText>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1, width: '100%' }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ padding: 16, paddingBottom: 8 }}>
            <AppText style={{ fontSize: 14, color: theme.textSecondary }}>
              {t('helpCenter.subtitle')}
            </AppText>
          </View>
          <View
            style={{
              marginHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.card,
              overflow: 'hidden',
              marginBottom: 24,
            }}
          >
            {visibleFaqs.map((faq) => (
              <FaqItem
                key={faq.id}
                faq={faq}
                isExpanded={expandedId === faq.id}
                onToggle={() => handleToggle(faq.id)}
                theme={theme}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </ScreenLayout>
  );
}
