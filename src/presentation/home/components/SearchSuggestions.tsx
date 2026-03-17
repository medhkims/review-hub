import React, { useCallback, useEffect, useRef } from 'react';
import { View, FlatList, Pressable, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

interface SuggestionItem {
  id: string;
  name: string;
}

interface SearchSuggestionsProps {
  items: SuggestionItem[];
  sectionTitle: string;
  onSelect: (id: string, name: string) => void;
  /** Called once per unique item that enters the viewport */
  onVisible?: (id: string) => void;
}

// Approximate height of each suggestion row (paddingVertical 13*2 + fontSize 15 ~22px + border 1px)
const ITEM_HEIGHT = 47;
// maxHeight of the FlatList
const LIST_HEIGHT = 280;

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  items,
  sectionTitle,
  onSelect,
  onVisible,
}) => {
  if (items.length === 0) return null;

  // seenIds persists for the entire search session — never reset while the dropdown is open.
  // This prevents re-counting the same business when the user refines their query keystroke by keystroke.
  const seenIds = useRef(new Set<string>());

  const reportVisible = useCallback((startIndex: number, endIndex: number) => {
    if (!onVisible) return;
    const clamped = Math.min(endIndex, items.length - 1);
    for (let i = Math.max(0, startIndex); i <= clamped; i++) {
      const id = items[i].id;
      if (!seenIds.current.has(id)) {
        seenIds.current.add(id);
        onVisible(id);
      }
    }
  }, [items, onVisible]);

  // When items change (new query results), fire for the initially-visible window.
  // seenIds prevents re-counting businesses already seen in this session.
  useEffect(() => {
    const initialEnd = Math.ceil(LIST_HEIGHT / ITEM_HEIGHT) - 1;
    reportVisible(0, initialEnd);
  }, [items, reportVisible]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    const startIndex = Math.floor(offset / ITEM_HEIGHT);
    const endIndex = Math.ceil((offset + LIST_HEIGHT) / ITEM_HEIGHT) - 1;
    reportVisible(startIndex, endIndex);
  }, [reportVisible]);

  const renderItem = useCallback(
    ({ item }: { item: SuggestionItem }) => (
      <Pressable
        onPress={() => onSelect(item.id, item.name)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 13,
          backgroundColor: pressed ? `${colors.borderDark}80` : 'transparent',
          borderTopWidth: 1,
          borderTopColor: `${colors.borderDark}60`,
        })}
        accessibilityLabel={item.name}
        accessibilityRole="button"
      >
        <AppText style={{ flex: 1, color: colors.white, fontSize: 15 }} numberOfLines={1}>
          {item.name}
        </AppText>
        <MaterialCommunityIcons name="magnify" size={18} color={colors.textSlate500} />
      </Pressable>
    ),
    [onSelect],
  );

  return (
    <View
      style={{
        marginHorizontal: 24,
        backgroundColor: colors.cardDark,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderDark,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
      }}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}>
        <AppText style={{ color: colors.textSlate400, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 }}>
          {sectionTitle.toUpperCase()}
        </AppText>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ maxHeight: LIST_HEIGHT }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};
