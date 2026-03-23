import React from 'react';
import { Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/core/theme/colors';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { useAdminDrawerStore } from '../store/adminDrawerStore';
import { useAdminBadgeStore } from '../store/adminBadgeStore';

export const AdminMenuButton: React.FC = () => {
  const open = useAdminDrawerStore((s) => s.open);
  const { tickets, supportTickets, verification, chat } = useAdminBadgeStore();
  const total = tickets + supportTickets + verification + chat;

  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel="Open admin menu"
      style={({ pressed }) => ({
        padding: 8,
        borderRadius: 10,
        backgroundColor: pressed ? `${colors.neonPurple}30` : `${colors.neonPurple}18`,
        borderWidth: 1,
        borderColor: `${colors.neonPurple}40`,
      })}
    >
      <MaterialCommunityIcons name="menu" size={22} color={colors.neonPurple} />
      {total > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#EF4444',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 3,
          }}
        >
          <AppText style={{ fontSize: 9, color: '#FFFFFF', fontWeight: '700', lineHeight: 12 }}>
            {total > 99 ? '99+' : String(total)}
          </AppText>
        </View>
      )}
    </Pressable>
  );
};
