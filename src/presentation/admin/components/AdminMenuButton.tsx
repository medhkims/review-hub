import React from 'react';
import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/core/theme/colors';
import { useAdminDrawerStore } from '../store/adminDrawerStore';

export const AdminMenuButton: React.FC = () => {
  const open = useAdminDrawerStore((s) => s.open);
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
    </Pressable>
  );
};
