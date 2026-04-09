import React, { useState } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './ui/AppText';
import { AppButton } from './ui/AppButton';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';

interface NoResultsViewProps {
  searchQuery?: string;
  fuzzyMatch?: BusinessEntity | null;
  isFuzzySearching?: boolean;
  onOpenSuggestion?: (business: BusinessEntity) => void;
  onAddNew?: () => void;
}

export const NoResultsView: React.FC<NoResultsViewProps> = ({
  searchQuery,
  fuzzyMatch,
  isFuzzySearching,
  onOpenSuggestion,
  onAddNew,
}) => {
  const theme = useTheme();
  const [imageError, setImageError] = useState(false);

  // ── Fuzzy suggestion view ────────────────────────────────────────────────
  if (fuzzyMatch && !isFuzzySearching) {
    return (
      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 32 }}>
        {/* Icon */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: `${colors.neonPurple}22`,
            borderWidth: 1,
            borderColor: `${colors.neonPurple}44`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <MaterialCommunityIcons name="magnify" size={30} color={colors.neonPurple} />
        </View>

        {/* Title */}
        <AppText
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: theme.text,
            textAlign: 'center',
            marginBottom: 6,
          }}
        >
          {`No results found for "${searchQuery ?? ''}"`}
        </AppText>

        {/* Subtitle */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
          <AppText style={{ fontSize: 14, color: theme.textSecondary }}>Did you mean </AppText>
          <AppText
            style={{
              fontSize: 14,
              color: colors.neonPurple,
              fontStyle: 'italic',
              fontWeight: '600',
            }}
          >
            {`"${fuzzyMatch.name}"`}
          </AppText>
          <AppText style={{ fontSize: 14, color: theme.textSecondary }}>?</AppText>
        </View>

        {/* Business Card */}
        <View
          style={{
            width: '100%',
            backgroundColor: theme.card,
            borderRadius: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.border,
            marginBottom: 20,
          }}
        >
          {/* Cover image */}
          <View style={{ width: '100%', height: 180, backgroundColor: theme.border }}>
            {fuzzyMatch.coverImageUrl && !imageError ? (
              <Image
                source={{ uri: fuzzyMatch.coverImageUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                accessibilityLabel={fuzzyMatch.name}
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="store" size={48} color={theme.textMuted} />
              </View>
            )}

            {/* Rating badge — top right */}
            <View
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.65)',
                borderRadius: 20,
                paddingHorizontal: 8,
                paddingVertical: 4,
                gap: 3,
              }}
            >
              <MaterialCommunityIcons name="star" size={13} color={colors.ratingGold} />
              <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.textWhite }}>
                {fuzzyMatch.rating.toFixed(1)}
              </AppText>
            </View>

            {/* TOP MATCH badge — bottom left */}
            <View
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                backgroundColor: colors.neonPurple,
                borderRadius: 6,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <AppText style={{ fontSize: 11, fontWeight: '800', color: colors.white, letterSpacing: 0.5 }}>
                TOP MATCH
              </AppText>
            </View>
          </View>

          {/* Card body */}
          <View style={{ padding: 16, gap: 8 }}>
            {/* Name + category tag */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <AppText style={{ fontSize: 18, fontWeight: '800', color: theme.text, flex: 1 }} numberOfLines={1}>
                {fuzzyMatch.name}
              </AppText>
              {fuzzyMatch.categoryName ? (
                <View
                  style={{
                    backgroundColor: theme.border,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <AppText style={{ fontSize: 12, color: theme.text, fontWeight: '600' }}>
                    {fuzzyMatch.categoryName}
                  </AppText>
                </View>
              ) : null}
            </View>

            {/* Location */}
            {fuzzyMatch.location ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.neonPurple} />
                <AppText style={{ fontSize: 13, color: theme.textSecondary }} numberOfLines={1}>
                  {fuzzyMatch.location}
                </AppText>
              </View>
            ) : null}

            {/* Review count */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <MaterialCommunityIcons name="comment-outline" size={14} color={theme.textMuted} />
              <AppText style={{ fontSize: 13, color: theme.textSecondary }}>
                {`${fuzzyMatch.reviewCount} reviews`}
              </AppText>
            </View>
          </View>
        </View>

        {/* Yes button */}
        {onOpenSuggestion && (
          <View style={{ width: '100%', marginBottom: 12 }}>
            <AppButton
              title="Yes, open this business"
              variant="primary"
              size="lg"
              shape="pill"
              onPress={() => onOpenSuggestion(fuzzyMatch)}
              accessibilityLabel={`Open ${fuzzyMatch.name}`}
              icon={<MaterialCommunityIcons name="arrow-right-circle-outline" size={20} color={colors.white} />}
            />
          </View>
        )}

        {/* No button */}
        {onAddNew && (
          <View style={{ width: '100%' }}>
            <AppButton
              title="No, add new business"
              variant="secondary"
              size="lg"
              shape="pill"
              onPress={onAddNew}
              accessibilityLabel="Add a new business"
            />
          </View>
        )}
      </View>
    );
  }

  // ── Fuzzy searching spinner ──────────────────────────────────────────────
  if (isFuzzySearching) {
    return (
      <View style={{ flex: 1, alignItems: 'center', paddingTop: 60 }}>
        <ActivityIndicator size="large" color={colors.neonPurple} />
        <AppText style={{ marginTop: 12, color: theme.textSecondary, fontSize: 14 }}>
          Looking for suggestions…
        </AppText>
      </View>
    );
  }

  // ── Default no-results view ──────────────────────────────────────────────
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40 }}>
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: theme.card,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
        }}
      >
        <MaterialCommunityIcons name="magnify-close" size={56} color={colors.neonPurple} />
      </View>

      <View
        style={{
          width: '100%',
          backgroundColor: theme.card,
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 8, textAlign: 'center' }}>
          {searchQuery ? `No results found for "${searchQuery}"` : 'Oops! No results found'}
        </AppText>
        <AppText style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 20 }}>
          It looks like the business you're searching for isn't in our database yet.
        </AppText>
      </View>

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
