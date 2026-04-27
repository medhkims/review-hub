import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from './ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import {
  TUNISIA_GOVERNORATES,
  ALL_MUNICIPALITIES,
  getMunicipalitiesForGovernorate,
  searchTunisiaLocations,
  type LocationSearchResult,
} from '@/core/constants/tunisiaLocations';

export interface LocationFilter {
  governorates: string[];
  municipalities: string[];
}

export const DEFAULT_LOCATION_FILTER: LocationFilter = {
  governorates: [],
  municipalities: [],
};

interface LocationFilterSheetProps {
  visible: boolean;
  initialFilter?: LocationFilter;
  onApply: (filter: LocationFilter) => void;
}

// ── Checkbox row ─────────────────────────────────────────────────────────────

interface CheckRowProps {
  label: string;
  sublabel?: string;
  isSelected: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

const CheckRow = React.memo<CheckRowProps>(({ label, sublabel, isSelected, onToggle, isLast }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 10,
        backgroundColor: pressed
          ? 'rgba(168,85,247,0.08)'
          : isSelected
          ? 'rgba(168,85,247,0.05)'
          : 'transparent',
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.border,
      })}
    >
      <View style={{ flex: 1, marginRight: 10 }}>
        <AppText
          style={{
            fontSize: 14,
            color: isSelected ? colors.neonPurple : theme.text,
            fontWeight: isSelected ? '600' : '400',
          }}
        >
          {label}
        </AppText>
        {sublabel ? (
          <AppText style={{ fontSize: 11, color: theme.textMuted, marginTop: 1 }}>
            {sublabel}
          </AppText>
        ) : null}
      </View>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          borderWidth: 1.5,
          borderColor: isSelected ? colors.neonPurple : theme.border,
          backgroundColor: isSelected ? colors.neonPurple : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isSelected && <MaterialCommunityIcons name="check" size={13} color="#fff" />}
      </View>
    </Pressable>
  );
});

// ── Dropdown trigger button ───────────────────────────────────────────────────

interface DropdownTriggerProps {
  icon: string;
  placeholder: string;
  selectedItems: string[];
  isOpen: boolean;
  onPress: () => void;
  onClear: () => void;
  moreLabel: string; // e.g. "{{count}} selected"
}

const MAX_SHOWN = 3;

const DropdownTrigger = React.memo<DropdownTriggerProps>(
  ({ icon, placeholder, selectedItems, isOpen, onPress, onClear, moreLabel }) => {
    const theme = useTheme();
    const count = selectedItems.length;
    const isActive = count > 0;

    const displayLabel = (() => {
      if (count === 0) return placeholder;
      if (count <= MAX_SHOWN) return selectedItems.join(', ');
      return moreLabel.replace('{{count}}', String(count));
    })();

    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={placeholder}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: 12,
          gap: 8,
          borderBottomWidth: 1,
          borderBottomColor: isOpen ? colors.neonPurple : theme.border,
          backgroundColor: isOpen ? 'rgba(168,85,247,0.04)' : 'transparent',
        }}
      >
        <MaterialCommunityIcons
          name={icon as never}
          size={17}
          color={isActive ? colors.neonPurple : theme.textMuted}
        />
        <AppText
          style={{
            flex: 1,
            fontSize: 14,
            color: isActive ? colors.neonPurple : theme.textMuted,
            fontWeight: isActive ? '600' : '400',
          }}
          numberOfLines={2}
        >
          {displayLabel}
        </AppText>
        {isActive && (
          <Pressable
            onPress={(e) => { e.stopPropagation(); onClear(); }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear"
          >
            <MaterialCommunityIcons name="close-circle" size={15} color={theme.textMuted} />
          </Pressable>
        )}
        <MaterialCommunityIcons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={theme.textMuted}
        />
      </Pressable>
    );
  },
);

// ── Main component ────────────────────────────────────────────────────────────

type OpenPanel = 'gov' | 'mun' | null;

export const LocationFilterSheet: React.FC<LocationFilterSheetProps> = ({
  visible,
  initialFilter = DEFAULT_LOCATION_FILTER,
  onApply,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [selectedGovs, setSelectedGovs] = useState<string[]>(initialFilter.governorates);
  const [selectedMuns, setSelectedMuns] = useState<string[]>(initialFilter.municipalities);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setSelectedGovs(initialFilter.governorates);
      setSelectedMuns(initialFilter.municipalities);
      setOpenPanel(null);
      setSearchQuery('');
    }
  }, [visible]);

  // Search results across all governorates + municipalities
  const searchResults = useMemo<LocationSearchResult[]>(() => {
    if (!searchQuery.trim()) return [];
    return searchTunisiaLocations(searchQuery);
  }, [searchQuery]);

  const govResults = useMemo(() => searchResults.filter((r) => r.type === 'governorate'), [searchResults]);
  const munResults = useMemo(() => searchResults.filter((r) => r.type === 'municipality'), [searchResults]);
  const isSearching = searchQuery.trim().length > 0;

  // Municipality list for dropdown:
  // - if govs selected → only their municipalities
  // - otherwise → all Tunisia
  const munList = useMemo(() => {
    if (selectedGovs.length === 0) return ALL_MUNICIPALITIES;
    return selectedGovs
      .flatMap((gov) => getMunicipalitiesForGovernorate(gov).map((m) => ({ name: m, governorate: gov })))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedGovs]);

  const toggleGov = (name: string) => {
    const next = selectedGovs.includes(name)
      ? selectedGovs.filter((g) => g !== name)
      : [...selectedGovs, name];
    setSelectedGovs(next);
    // Drop municipalities that don't belong to any of the next governorates
    if (next.length > 0) {
      const allowed = new Set(next.flatMap((g) => getMunicipalitiesForGovernorate(g)));
      setSelectedMuns((prev) => prev.filter((m) => allowed.has(m)));
    }
  };

  const toggleMun = (name: string) =>
    setSelectedMuns((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    );

  const handleSearchSelect = (result: LocationSearchResult) => {
    if (result.type === 'governorate') {
      if (!selectedGovs.includes(result.value)) {
        const next = [...selectedGovs, result.value];
        setSelectedGovs(next);
        // Drop municipalities no longer in scope
        const allowed = new Set(next.flatMap((g) => getMunicipalitiesForGovernorate(g)));
        setSelectedMuns((prev) => prev.filter((m) => allowed.has(m)));
      }
    } else {
      // Auto-add its governorate too if not already selected
      if (!selectedGovs.includes(result.governorate)) {
        setSelectedGovs((prev) => [...prev, result.governorate]);
      }
      if (!selectedMuns.includes(result.value)) {
        setSelectedMuns((prev) => [...prev, result.value]);
      }
    }
    setSearchQuery('');
  };

  const handleReset = () => {
    setSelectedGovs([]);
    setSelectedMuns([]);
    setSearchQuery('');
    setOpenPanel(null);
  };

  const togglePanel = (panel: OpenPanel) =>
    setOpenPanel((prev) => (prev === panel ? null : panel));

  const totalSelected = selectedGovs.length + selectedMuns.length;

  if (!visible) return null;

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 2,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.neonPurple,
        borderRadius: 16,
        backgroundColor: theme.card,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      }}
    >
      {/* ── Search bar (always visible at top) ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 8,
          borderBottomWidth: 1,
          borderBottomColor: isSearching ? colors.neonPurple : theme.border,
          backgroundColor: isSearching ? 'rgba(168,85,247,0.04)' : 'transparent',
        }}
      >
        <MaterialCommunityIcons name="magnify" size={18} color={isSearching ? colors.neonPurple : theme.textMuted} />
        <TextInput
          ref={searchRef}
          value={searchQuery}
          onChangeText={(t) => { setSearchQuery(t); setOpenPanel(null); }}
          placeholder={t('locationFilter.searchPlaceholder')}
          placeholderTextColor={theme.textMuted}
          style={{ flex: 1, fontSize: 14, color: theme.text, paddingVertical: 0 }}
          autoCorrect={false}
          accessibilityLabel={t('locationFilter.searchPlaceholder')}
          accessibilityRole="search"
        />
        {isSearching && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={6} accessibilityRole="button" accessibilityLabel="Clear">
            <MaterialCommunityIcons name="close-circle" size={16} color={theme.textMuted} />
          </Pressable>
        )}
      </View>

      {/* ── Search results (shown while typing) ── */}
      {isSearching && (
        <ScrollView style={{ maxHeight: 220, borderBottomWidth: 1, borderBottomColor: theme.border }} showsVerticalScrollIndicator={false} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {searchResults.length === 0 ? (
            <View style={{ padding: 14 }}>
              <AppText style={{ fontSize: 13, color: theme.textMuted }}>{t('locationFilter.noResults')}</AppText>
            </View>
          ) : (
            <>
              {govResults.length > 0 && (
                <>
                  <View style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(168,85,247,0.06)' }}>
                    <AppText style={{ fontSize: 11, fontWeight: '700', color: colors.neonPurple, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                      {t('locationFilter.governorates')}
                    </AppText>
                  </View>
                  {govResults.map((r, idx) => {
                    const isSelected = selectedGovs.includes(r.value);
                    return (
                      <Pressable
                        key={`sg-${r.value}`}
                        onPress={() => handleSearchSelect(r)}
                        accessibilityRole="button"
                        accessibilityLabel={r.value}
                        style={({ pressed }) => ({
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          paddingHorizontal: 16,
                          paddingVertical: 11,
                          backgroundColor: pressed ? 'rgba(168,85,247,0.08)' : 'transparent',
                          borderBottomWidth: 1,
                          borderBottomColor: theme.border,
                        })}
                      >
                        <MaterialCommunityIcons name="map-marker" size={15} color={isSelected ? colors.neonPurple : theme.textMuted} />
                        <AppText style={{ flex: 1, fontSize: 14, color: isSelected ? colors.neonPurple : theme.text, fontWeight: isSelected ? '600' : '400' }}>
                          {r.value}
                        </AppText>
                        {isSelected && <MaterialCommunityIcons name="check-circle" size={16} color={colors.neonPurple} />}
                      </Pressable>
                    );
                  })}
                </>
              )}

              {munResults.length > 0 && (
                <>
                  <View style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(168,85,247,0.06)' }}>
                    <AppText style={{ fontSize: 11, fontWeight: '700', color: colors.neonPurple, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                      {t('locationFilter.municipalities')}
                    </AppText>
                  </View>
                  {munResults.map((r) => {
                    const isSelected = selectedMuns.includes(r.value);
                    return (
                      <Pressable
                        key={`sm-${r.governorate}-${r.value}`}
                        onPress={() => handleSearchSelect(r)}
                        accessibilityRole="button"
                        accessibilityLabel={`${r.value}, ${r.governorate}`}
                        style={({ pressed }) => ({
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          paddingHorizontal: 16,
                          paddingVertical: 11,
                          backgroundColor: pressed ? 'rgba(168,85,247,0.08)' : 'transparent',
                          borderBottomWidth: 1,
                          borderBottomColor: theme.border,
                        })}
                      >
                        <MaterialCommunityIcons name="map-marker-outline" size={15} color={isSelected ? colors.neonPurple : theme.textMuted} />
                        <View style={{ flex: 1 }}>
                          <AppText style={{ fontSize: 14, color: isSelected ? colors.neonPurple : theme.text, fontWeight: isSelected ? '600' : '400' }}>
                            {r.value}
                          </AppText>
                          <AppText style={{ fontSize: 11, color: theme.textMuted }}>{r.governorate}</AppText>
                        </View>
                        {isSelected && <MaterialCommunityIcons name="check-circle" size={16} color={colors.neonPurple} />}
                      </Pressable>
                    );
                  })}
                </>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* ── Governorate dropdown (hidden while searching) ── */}
      {!isSearching && (
        <>
          <DropdownTrigger
            icon="map-marker-radius-outline"
            placeholder={t('locationFilter.selectGovernorate')}
            selectedItems={selectedGovs}
            moreLabel={t('locationFilter.moreSelected')}
            isOpen={openPanel === 'gov'}
            onPress={() => togglePanel('gov')}
            onClear={() => { setSelectedGovs([]); setSelectedMuns([]); }}
          />

          {openPanel === 'gov' && (
            <ScrollView
              style={{ maxHeight: 200, borderBottomWidth: 1, borderBottomColor: theme.border }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {TUNISIA_GOVERNORATES.map((gov, idx) => (
                <CheckRow
                  key={gov.name}
                  label={gov.name}
                  isSelected={selectedGovs.includes(gov.name)}
                  onToggle={() => toggleGov(gov.name)}
                  isLast={idx === TUNISIA_GOVERNORATES.length - 1}
                />
              ))}
            </ScrollView>
          )}

          {/* ── Municipality dropdown ── */}
          <DropdownTrigger
            icon="city-variant-outline"
            placeholder={
              selectedGovs.length === 0
                ? t('locationFilter.selectMunicipalityAll')
                : t('locationFilter.selectMunicipality')
            }
            selectedItems={selectedMuns}
            moreLabel={t('locationFilter.moreSelected')}
            isOpen={openPanel === 'mun'}
            onPress={() => togglePanel('mun')}
            onClear={() => setSelectedMuns([])}
          />

          {openPanel === 'mun' && (
            <>
              {selectedGovs.length === 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(168,85,247,0.06)', borderBottomWidth: 1, borderBottomColor: theme.border }}>
                  <MaterialCommunityIcons name="information-outline" size={13} color={colors.neonPurple} />
                  <AppText style={{ fontSize: 12, color: colors.neonPurple }}>{t('locationFilter.allTunisiaHint')}</AppText>
                </View>
              )}
              <ScrollView
                style={{ maxHeight: 200, borderBottomWidth: 1, borderBottomColor: theme.border }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                {munList.map((mun, idx) => (
                  <CheckRow
                    key={`${mun.governorate}-${mun.name}`}
                    label={mun.name}
                    sublabel={selectedGovs.length !== 1 ? mun.governorate : undefined}
                    isSelected={selectedMuns.includes(mun.name)}
                    onToggle={() => toggleMun(mun.name)}
                    isLast={idx === munList.length - 1}
                  />
                ))}
              </ScrollView>
            </>
          )}
        </>
      )}

      {/* ── Footer ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        }}
      >
        <Pressable onPress={handleReset} accessibilityRole="button" accessibilityLabel={t('filterBy.reset')}>
          <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.neonPurple }}>
            {t('filterBy.reset')}
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => onApply({ governorates: selectedGovs, municipalities: selectedMuns })}
          style={{ backgroundColor: colors.neonPurple, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 }}
          accessibilityRole="button"
          accessibilityLabel={t('filterBy.apply')}
        >
          <AppText style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>
            {totalSelected > 0 ? `${t('filterBy.apply')} (${totalSelected})` : t('filterBy.apply')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};
