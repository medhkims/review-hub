import React from 'react';
import { View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

// ── Types ────────────────────────────────────────────────────────────────────
interface CompanyItem {
  id: string;
  rank: number;
  name: string;
  category: string;
  views: string;
}

interface Top5CompaniesSectionProps {
  title: string;
  seeAllLabel: string;
  companies: CompanyItem[];
  onSeeAll?: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────
export const Top5CompaniesSection: React.FC<Top5CompaniesSectionProps> = ({
  title,
  seeAllLabel,
  companies,
  onSeeAll,
}) => (
  <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
    {/* Section header */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white }}>{title}</AppText>
      <Pressable
        onPress={onSeeAll}
        accessibilityRole="button"
        accessibilityLabel={seeAllLabel}
      >
        <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.neonPurple }}>{seeAllLabel}</AppText>
      </Pressable>
    </View>

    {/* Company list */}
    <View
      style={{
        backgroundColor: colors.cardDark,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      {companies.map((company, index) => (
        <View
          key={company.id}
          accessibilityLabel={`${company.rank}. ${company.name}, ${company.category}, ${company.views} views`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 10,
            borderBottomWidth: index < companies.length - 1 ? 1 : 0,
            borderBottomColor: 'rgba(255,255,255,0.05)',
          }}
        >
          {/* Rank */}
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: index === 0 ? `${colors.neonPurple}1A` : 'rgba(255,255,255,0.05)',
              borderWidth: index === 0 ? 1 : 0,
              borderColor: `${colors.neonPurple}33`,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <AppText
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: index === 0 ? colors.neonPurple : colors.textSlate400,
              }}
            >
              {String(company.rank)}
            </AppText>
          </View>

          {/* Company avatar */}
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: colors.borderDark,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <MaterialCommunityIcons name="domain" size={18} color={colors.textSlate400} />
          </View>

          {/* Info */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText
              style={{ fontSize: 13, fontWeight: '600', color: colors.white }}
              numberOfLines={1}
            >
              {company.name}
            </AppText>
            <AppText
              style={{ fontSize: 11, color: colors.textSlate400, marginTop: 1 }}
              numberOfLines={1}
            >
              {company.category}
            </AppText>
          </View>

          {/* Views */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialCommunityIcons name="eye-outline" size={12} color={colors.textSlate500} />
            <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate200 }}>
              {company.views}
            </AppText>
          </View>
        </View>
      ))}
    </View>
  </View>
);

// ── Mock Data ────────────────────────────────────────────────────────────────
export const MOCK_TOP_COMPANIES: CompanyItem[] = [
  { id: '1', rank: 1, name: 'Bella Pizza', category: 'Food & Dining', views: '12.5k' },
  { id: '2', rank: 2, name: 'Tunis Dental', category: 'Healthcare', views: '9.2k' },
  { id: '3', rank: 3, name: 'Gym Master', category: 'Fitness', views: '8.8k' },
  { id: '4', rank: 4, name: 'Tech Solutions', category: 'IT Services', views: '6.4k' },
  { id: '5', rank: 5, name: 'Cafe Culture', category: 'Food & Dining', views: '5.8k' },
];
