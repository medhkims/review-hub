import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children,
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View
      style={{
        backgroundColor: colors.cardDark,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <Pressable
        onPress={() => setExpanded(!expanded)}
        accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
        accessibilityRole="button"
        style={{
          backgroundColor: 'rgba(168, 85, 247, 0.05)',
          paddingHorizontal: 24,
          paddingVertical: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderLeftWidth: 6,
          borderLeftColor: colors.neonPurple,
        }}
      >
        <AppText style={{ fontWeight: '700', fontSize: 18, color: colors.neonPurple, letterSpacing: 0.5 }}>
          {title}
        </AppText>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={colors.neonPurple}
        />
      </Pressable>
      {expanded && (
        <View style={{ padding: 24 }}>
          {children}
        </View>
      )}
    </View>
  );
};
