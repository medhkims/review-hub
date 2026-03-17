import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Modal,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

const GMAPS_KEY: string =
  ((Constants.expoConfig?.extra as Record<string, string> | undefined)?.googleMapsApiKey) ?? '';

// New Places API v1 — supports CORS in browsers
const AUTOCOMPLETE_V1 = 'https://places.googleapis.com/v1/places:autocomplete';
const DETAILS_V1_BASE = 'https://places.googleapis.com/v1/places';

interface PlaceSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullDescription: string;
}

export interface LocationResult {
  address: string;
  latitude: number | null;
  longitude: number | null;
}

interface LocationPickerModalProps {
  visible: boolean;
  initialAddress?: string;
  onClose: () => void;
  onSave: (result: LocationResult) => void;
}

async function fetchSuggestionsFromGoogle(text: string): Promise<PlaceSuggestion[]> {
  if (!GMAPS_KEY || !text.trim()) return [];
  try {
    const res = await fetch(AUTOCOMPLETE_V1, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GMAPS_KEY,
      },
      body: JSON.stringify({
        input: text,
        includedRegionCodes: ['tn'],
        languageCode: 'en',
      }),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      suggestions?: Array<{
        placePrediction?: {
          placeId: string;
          text?: { text: string };
          structuredFormat?: {
            mainText?: { text: string };
            secondaryText?: { text: string };
          };
        };
      }>;
    };
    return (json.suggestions ?? [])
      .map((s) => s.placePrediction)
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map((p) => ({
        placeId: p.placeId,
        mainText: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
        secondaryText: p.structuredFormat?.secondaryText?.text ?? '',
        fullDescription: p.text?.text ?? '',
      }));
  } catch {
    return [];
  }
}

async function fetchPlaceDetails(
  placeId: string,
): Promise<{ lat: number; lng: number; address: string } | null> {
  if (!GMAPS_KEY) return null;
  try {
    const res = await fetch(
      `${DETAILS_V1_BASE}/${placeId}?fields=location,formattedAddress`,
      {
        headers: { 'X-Goog-Api-Key': GMAPS_KEY },
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      location?: { latitude: number; longitude: number };
      formattedAddress?: string;
    };
    if (!json.location) return null;
    return {
      lat: json.location.latitude,
      lng: json.location.longitude,
      address: json.formattedAddress ?? '',
    };
  } catch {
    return null;
  }
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  initialAddress,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialAddress ?? '');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [manualAddress, setManualAddress] = useState(initialAddress ?? '');
  const [selected, setSelected] = useState<LocationResult | null>(
    initialAddress ? { address: initialAddress, latitude: null, longitude: null } : null,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (text: string) => {
    if (!text.trim() || text.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await fetchSuggestionsFromGoogle(text);
      setSuggestions(results);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      setSelected(null);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchSuggestions(text), 350);
    },
    [fetchSuggestions],
  );

  const handleSelectSuggestion = useCallback(async (suggestion: PlaceSuggestion) => {
    setQuery(suggestion.fullDescription);
    setSuggestions([]);
    setIsLoadingDetails(true);
    try {
      const details = await fetchPlaceDetails(suggestion.placeId);
      setSelected({
        address: details?.address || suggestion.fullDescription,
        latitude: details?.lat ?? null,
        longitude: details?.lng ?? null,
      });
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  const handleSave = useCallback(() => {
    if (isManual) {
      onSave({ address: manualAddress.trim(), latitude: null, longitude: null });
    } else if (selected) {
      onSave(selected);
    }
    onClose();
  }, [isManual, manualAddress, selected, onSave, onClose]);

  const handleClose = useCallback(() => {
    setSuggestions([]);
    onClose();
  }, [onClose]);

  const canSave = isManual
    ? manualAddress.trim().length > 0
    : selected !== null && !isLoadingDetails;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={handleClose}
          accessibilityLabel={t('common.cancel')}
          accessibilityRole="button"
        />
        <View
          style={{
            backgroundColor: colors.cardDark,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 40 : 24,
            maxHeight: '85%',
          }}
        >
          {/* Handle bar */}
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.borderDark,
              alignSelf: 'center',
              marginBottom: 16,
            }}
          />

          {/* Title row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              marginBottom: 16,
            }}
          >
            <MaterialCommunityIcons name="map-marker" size={22} color={colors.neonPurple} />
            <AppText
              style={{ fontSize: 18, fontWeight: '700', color: colors.white, marginLeft: 10, flex: 1 }}
            >
              {t('locationPicker.title')}
            </AppText>
            <Pressable
              onPress={handleClose}
              accessibilityLabel={t('common.cancel')}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="close" size={22} color={colors.textSlate400} />
            </Pressable>
          </View>

          {!isManual ? (
            <View style={{ paddingHorizontal: 20 }}>
              {/* Search input */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.midnight,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.borderDark,
                  paddingHorizontal: 14,
                  marginBottom: 4,
                }}
              >
                <MaterialCommunityIcons name="magnify" size={20} color={colors.textSlate400} />
                <TextInput
                  value={query}
                  onChangeText={handleQueryChange}
                  placeholder={t('locationPicker.searchPlaceholder')}
                  placeholderTextColor={colors.textSlate500}
                  style={{
                    flex: 1,
                    color: colors.white,
                    fontSize: 14,
                    paddingVertical: 14,
                    paddingHorizontal: 10,
                  }}
                  autoFocus
                  returnKeyType="search"
                  accessibilityLabel={t('locationPicker.searchPlaceholder')}
                />
                {(isSearching || isLoadingDetails) && (
                  <ActivityIndicator size="small" color={colors.neonPurple} />
                )}
                {!isSearching && !isLoadingDetails && query.length > 0 && (
                  <Pressable
                    onPress={() => {
                      setQuery('');
                      setSuggestions([]);
                      setSelected(null);
                    }}
                    accessibilityLabel="Clear"
                    accessibilityRole="button"
                  >
                    <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSlate500} />
                  </Pressable>
                )}
              </View>

              {/* Powered by Google */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, marginBottom: 2 }}>
                <AppText style={{ fontSize: 10, color: colors.textSlate500 }}>
                  Powered by Google
                </AppText>
              </View>

              {/* Selected result */}
              {selected && suggestions.length === 0 && !isLoadingDetails && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: `${colors.neonPurple}18`,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: `${colors.neonPurple}40`,
                    padding: 12,
                    marginTop: 8,
                  }}
                >
                  <MaterialCommunityIcons name="check-circle" size={18} color={colors.neonPurple} />
                  <AppText style={{ flex: 1, fontSize: 13, color: colors.textSlate200 }}>
                    {selected.address}
                  </AppText>
                </View>
              )}

              {/* Suggestions list */}
              {suggestions.length > 0 && (
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item.placeId}
                  style={{ marginTop: 4, maxHeight: 300 }}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => handleSelectSuggestion(item)}
                      accessibilityLabel={item.fullDescription}
                      accessibilityRole="button"
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 4,
                        borderBottomWidth: 1,
                        borderBottomColor: 'rgba(255,255,255,0.04)',
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: `${colors.neonPurple}18`,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="map-marker-outline"
                          size={18}
                          color={colors.neonPurple}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText
                          style={{ fontSize: 14, fontWeight: '600', color: colors.white }}
                          numberOfLines={1}
                        >
                          {item.mainText}
                        </AppText>
                        {item.secondaryText.length > 0 && (
                          <AppText
                            style={{ fontSize: 12, color: colors.textSlate400, marginTop: 1 }}
                            numberOfLines={1}
                          >
                            {item.secondaryText}
                          </AppText>
                        )}
                      </View>
                    </Pressable>
                  )}
                />
              )}

              {/* Manual entry toggle */}
              <Pressable
                onPress={() => {
                  setIsManual(true);
                  setManualAddress(query);
                }}
                accessibilityLabel={t('locationPicker.enterManually')}
                accessibilityRole="button"
                style={{ alignItems: 'center', paddingVertical: 16, marginTop: 4 }}
              >
                <AppText style={{ fontSize: 13, color: colors.neonPurple, fontWeight: '600' }}>
                  {t('locationPicker.enterManually')}
                </AppText>
              </Pressable>
            </View>
          ) : (
            /* ── Manual Entry Mode ── */
            <View style={{ paddingHorizontal: 20 }}>
              <AppText style={{ fontSize: 13, color: colors.textSlate400, marginBottom: 8 }}>
                {t('locationPicker.manualLabel')}
              </AppText>
              <TextInput
                value={manualAddress}
                onChangeText={setManualAddress}
                placeholder={t('locationPicker.manualPlaceholder')}
                placeholderTextColor={colors.textSlate500}
                multiline
                style={{
                  backgroundColor: colors.midnight,
                  color: colors.white,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.borderDark,
                  padding: 14,
                  fontSize: 14,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
                autoFocus
                accessibilityLabel={t('locationPicker.manualLabel')}
              />
              <Pressable
                onPress={() => {
                  setIsManual(false);
                  setQuery(manualAddress);
                }}
                accessibilityLabel={t('locationPicker.searchInstead')}
                accessibilityRole="button"
                style={{ alignItems: 'center', paddingVertical: 14 }}
              >
                <AppText style={{ fontSize: 13, color: colors.neonPurple, fontWeight: '600' }}>
                  {t('locationPicker.searchInstead')}
                </AppText>
              </Pressable>
            </View>
          )}

          {/* Save / Cancel */}
          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 8 }}>
            <Pressable
              onPress={handleClose}
              accessibilityLabel={t('common.cancel')}
              accessibilityRole="button"
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.borderDark,
                alignItems: 'center',
              }}
            >
              <AppText style={{ color: colors.textSlate400, fontWeight: '600' }}>
                {t('common.cancel')}
              </AppText>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              accessibilityLabel={t('common.save')}
              accessibilityRole="button"
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: canSave ? colors.neonPurple : `${colors.neonPurple}40`,
                alignItems: 'center',
              }}
            >
              <AppText style={{ color: colors.white, fontWeight: '700' }}>
                {t('common.save')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
