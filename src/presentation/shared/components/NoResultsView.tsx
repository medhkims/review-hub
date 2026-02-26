import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './ui/AppText';
import { AppButton } from './ui/AppButton';
import { SectionHeader } from './ui/SectionHeader';
import { colors } from '@/core/theme/colors';

interface NoResultsViewProps {
  searchQuery?: string;
  onAddNew?: () => void;
}

export const NoResultsView: React.FC<NoResultsViewProps> = ({ searchQuery, onAddNew }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40 }}>
      {/* Icon */}
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.cardDark,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
        }}
      >
        <MaterialCommunityIcons name="magnify-close" size={56} color={colors.neonPurple} />
      </View>

      {/* Section label */}
      <View style={{ alignSelf: 'flex-start', marginBottom: 16 }}>
        <SectionHeader title="SEARCH STATUS" />
      </View>

      {/* Message card */}
      <View
        style={{
          width: '100%',
          backgroundColor: colors.cardDark,
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: `${colors.borderDark}50`,
        }}
      >
        <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.textWhite, marginBottom: 8, textAlign: 'center' }}>
          Oops! No results found
        </AppText>
        <AppText style={{ fontSize: 14, color: colors.textSlate400, textAlign: 'center', lineHeight: 20 }}>
          It looks like the business you're searching for isn't in our database yet.
        </AppText>
      </View>

      {/* Add new button */}
      {onAddNew && (
        <View style={{ width: '100%', marginTop: 24 }}>
          <AppButton
            title="Add a new one"
            variant="primary"
            size="lg"
            shape="pill"
            onPress={onAddNew}
            accessibilityLabel="Add a new business"
            icon={<MaterialCommunityIcons name="plus-circle" size={20} color={colors.textWhite} />}
          />
        </View>
      )}
    </View>
  );
};
