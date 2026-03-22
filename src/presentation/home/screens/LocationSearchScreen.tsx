import React, { useState } from 'react';
import { View, TextInput, Pressable, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { SectionHeader } from '@/presentation/shared/components/ui/SectionHeader';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

interface LocationItem {
  id: string;
  name: string;
}

const RECENT_SEARCHES: LocationItem[] = [
  { id: '1', name: 'Sousse' },
  { id: '2', name: 'Tunis' },
  { id: '3', name: 'Hammamet' },
];

const LocationRow: React.FC<{
  item: LocationItem;
  onPress: (name: string) => void;
  onRemove: (id: string) => void;
}> = ({ item, onPress, onRemove }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}
    >
      <Pressable
        onPress={() => onPress(item.name)}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16 }}
        accessibilityLabel={`Select ${item.name}`}
        accessibilityRole="button"
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.card,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="clock-outline" size={22} color={theme.textMuted} />
        </View>
        <AppText style={{ fontSize: 16, color: theme.text, fontWeight: '500' }}>{item.name}</AppText>
      </Pressable>
      <Pressable
        onPress={() => onRemove(item.id)}
        accessibilityLabel={`Remove ${item.name}`}
        accessibilityRole="button"
        style={{ padding: 8 }}
      >
        <MaterialCommunityIcons name="close" size={20} color={theme.textMuted} />
      </Pressable>
    </View>
  );
};

export default function LocationSearchScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);

  const handleSelectLocation = (name: string) => {
    // Will be wired to backend later
    router.back();
  };

  const handleRemoveRecent = (id: string) => {
    setRecentSearches((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setRecentSearches([]);
  };

  const handleCurrentLocation = () => {
    // Will use GPS location later
    router.back();
  };

  return (
    <ScreenLayout>
      {/* Header with search */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{ padding: 4 }}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.text} />
        </Pressable>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.card,
            borderRadius: 12,
            paddingHorizontal: 16,
            height: 48,
            borderWidth: 1.5,
            borderColor: colors.neonPurple,
            shadowColor: colors.neonPurple,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          <MaterialCommunityIcons name="map-marker" size={20} color={colors.neonPurple} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search location..."
            placeholderTextColor={theme.textMuted}
            style={{ flex: 1, color: theme.text, fontSize: 15, marginLeft: 10, paddingVertical: 0 }}
            accessibilityLabel="Search location"
            autoFocus
          />
        </View>
      </View>

      {/* Current Location */}
      <Pressable
        onPress={handleCurrentLocation}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 16,
          gap: 16,
        }}
        accessibilityLabel="Use current location"
        accessibilityRole="button"
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(59,130,246,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={22} color={colors.primary} />
        </View>
        <View>
          <AppText style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>Current Location</AppText>
          <AppText style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>Using GPS</AppText>
        </View>
      </Pressable>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Recent Searches</AppText>
            <Pressable onPress={handleClearAll} accessibilityLabel="Clear all recent searches" accessibilityRole="button">
              <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.neonPurple }}>Clear All</AppText>
            </Pressable>
          </View>
          <FlatList
            data={recentSearches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <LocationRow item={item} onPress={handleSelectLocation} onRemove={handleRemoveRecent} />
            )}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScreenLayout>
  );
}
