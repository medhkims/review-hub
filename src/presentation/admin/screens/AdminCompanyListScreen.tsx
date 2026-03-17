import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, Pressable, ActivityIndicator, Modal, TextInput, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { container } from '@/core/di/container';
import { CompanyFilter, CompanyRankItem } from '@/domain/admin/entities/adminDashboardEntity';
import { CompanyLineChart, ChartPeriod, ChartDateRange } from '@/presentation/admin/components/CompanyLineChart';
import { CompanyCategoryChart } from '@/presentation/admin/components/CompanyCategoryChart';
import { DateRangePickerModal, DateRange } from '@/presentation/admin/components/DateRangePickerModal';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;
type CompanySort = 'default' | 'rating' | 'reviews' | 'views' | 'date';
type FilterKey = 'active' | 'pending' | 'premium' | 'basic' | 'verified';

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return '—';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function sortCompanies(items: CompanyRankItem[], sort: CompanySort): CompanyRankItem[] {
  const arr = [...items];
  switch (sort) {
    case 'rating':  return arr.sort((a, b) => b.rating - a.rating);
    case 'reviews': return arr.sort((a, b) => b.reviews - a.reviews);
    case 'views':   return arr.sort((a, b) => b.visits - a.visits);
    case 'date':    return arr.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    default:        return arr;
  }
}

function applyFilters(items: CompanyRankItem[], selected: Set<FilterKey>): CompanyRankItem[] {
  if (selected.size === 0) return items;
  return items.filter((c) => {
    if (selected.has('active')   && c.status === 'active')              return true;
    if (selected.has('pending')  && c.status === 'pending')             return true;
    if (selected.has('premium')  && c.isPremium)                        return true;
    if (selected.has('basic')    && c.isOwnerVerified && !c.isPremium)  return true;
    if (selected.has('verified') && c.isOwnerVerified)                  return true;
    return false;
  });
}

// ── Sort option sheet ────────────────────────────────────────────────────────

interface SheetOption { key: string; label: string; icon: IconName; color: string }

interface SortSheetProps {
  visible: boolean; activeKey: string;
  onSelect: (key: string) => void; onClose: () => void;
}

const SortSheet: React.FC<SortSheetProps> = ({ visible, activeKey, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }} onPress={onClose}>
      <Pressable style={{
        backgroundColor: colors.cardDark, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        paddingTop: 16, paddingBottom: 36, borderTopWidth: 1, borderColor: colors.borderDark,
      }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderDark, alignSelf: 'center', marginBottom: 14 }} />
        <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.textSlate500, paddingHorizontal: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Sort by
        </AppText>
        {SORT_OPTIONS.map((opt) => {
          const active = activeKey === opt.key;
          return (
            <Pressable key={opt.key} onPress={() => { onSelect(opt.key); onClose(); }}
              accessibilityRole="menuitem" accessibilityLabel={opt.label}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14,
                backgroundColor: active ? `${opt.color}18` : pressed ? `${colors.borderDark}80` : 'transparent',
              })}>
              <MaterialCommunityIcons name={opt.icon} size={20} color={active ? opt.color : colors.textSlate400} />
              <AppText style={{ flex: 1, fontSize: 15, fontWeight: active ? '700' : '400', color: active ? opt.color : colors.textSlate200 }}>
                {opt.label}
              </AppText>
              {active && <MaterialCommunityIcons name="check" size={18} color={opt.color} />}
            </Pressable>
          );
        })}
      </Pressable>
    </Pressable>
  </Modal>
);

// ── Filter multi-select sheet ────────────────────────────────────────────────

interface FilterSheetProps {
  visible: boolean; selected: Set<FilterKey>;
  onToggle: (key: FilterKey) => void; onClear: () => void; onClose: () => void;
}

const FilterSheet: React.FC<FilterSheetProps> = ({ visible, selected, onToggle, onClear, onClose }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }} onPress={onClose}>
      <Pressable style={{
        backgroundColor: colors.cardDark, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        paddingTop: 16, paddingBottom: 36, borderTopWidth: 1, borderColor: colors.borderDark,
      }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderDark, alignSelf: 'center', marginBottom: 14 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 }}>
          <AppText style={{ flex: 1, fontSize: 12, fontWeight: '600', color: colors.textSlate500, textTransform: 'uppercase', letterSpacing: 0.8 }}>Filter by</AppText>
          {selected.size > 0 && (
            <Pressable onPress={onClear} accessibilityRole="button" accessibilityLabel="Clear filters">
              <AppText style={{ fontSize: 13, color: colors.pink, fontWeight: '600' }}>Clear all</AppText>
            </Pressable>
          )}
        </View>
        <View style={{ paddingHorizontal: 16, gap: 10, marginBottom: 4 }}>
          {FILTER_OPTIONS.map((opt) => {
            const active = selected.has(opt.key as FilterKey);
            return (
              <Pressable key={opt.key} onPress={() => onToggle(opt.key as FilterKey)}
                accessibilityRole="checkbox" accessibilityLabel={opt.label} accessibilityState={{ checked: active }}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14,
                  borderRadius: 14, borderWidth: 1.5,
                  borderColor: active ? opt.color : colors.borderDark,
                  backgroundColor: active ? `${opt.color}22` : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                })}>
                <MaterialCommunityIcons name={opt.icon} size={20} color={opt.color} />
                <AppText style={{ flex: 1, fontSize: 15, fontWeight: active ? '700' : '500', color: active ? opt.color : colors.textSlate200 }}>
                  {opt.label}
                </AppText>
                <View style={{
                  width: 22, height: 22, borderRadius: 6, borderWidth: 2,
                  borderColor: active ? opt.color : colors.borderDark,
                  backgroundColor: active ? opt.color : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {active && <MaterialCommunityIcons name="check" size={13} color={colors.white} />}
                </View>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Done"
          style={({ pressed }) => ({
            marginHorizontal: 20, marginTop: 16, paddingVertical: 14, borderRadius: 12,
            backgroundColor: pressed ? `${colors.neonPurple}CC` : colors.neonPurple, alignItems: 'center',
          })}>
          <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white }}>Done</AppText>
        </Pressable>
      </Pressable>
    </Pressable>
  </Modal>
);

// ── Category sheet ────────────────────────────────────────────────────────────

interface CategorySheetProps {
  visible: boolean; categories: string[]; selected: Set<string>;
  onToggle: (cat: string) => void; onClear: () => void; onClose: () => void;
}

const CategorySheet: React.FC<CategorySheetProps> = ({ visible, categories, selected, onToggle, onClear, onClose }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }} onPress={onClose}>
      <Pressable style={{
        backgroundColor: colors.cardDark, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        paddingTop: 16, paddingBottom: 36, borderTopWidth: 1, borderColor: colors.borderDark, maxHeight: '70%',
      }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderDark, alignSelf: 'center', marginBottom: 14 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 }}>
          <AppText style={{ flex: 1, fontSize: 12, fontWeight: '600', color: colors.textSlate500, textTransform: 'uppercase', letterSpacing: 0.8 }}>Category</AppText>
          {selected.size > 0 && (
            <Pressable onPress={onClear} accessibilityRole="button" accessibilityLabel="Clear categories">
              <AppText style={{ fontSize: 13, color: colors.pink, fontWeight: '600' }}>Clear all</AppText>
            </Pressable>
          )}
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16 }}>
          {categories.map((cat) => {
            const active = selected.has(cat);
            return (
              <Pressable key={cat} onPress={() => onToggle(cat)}
                accessibilityRole="checkbox" accessibilityLabel={cat} accessibilityState={{ checked: active }}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14,
                  marginBottom: 6, borderRadius: 14, borderWidth: 1.5,
                  borderColor: active ? colors.cyan : colors.borderDark,
                  backgroundColor: active ? `${colors.cyan}22` : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                })}>
                <MaterialCommunityIcons name="tag-outline" size={18} color={active ? colors.cyan : colors.textSlate400} />
                <AppText style={{ flex: 1, fontSize: 15, fontWeight: active ? '700' : '500', color: active ? colors.cyan : colors.textSlate200 }}>
                  {cat}
                </AppText>
                <View style={{
                  width: 22, height: 22, borderRadius: 6, borderWidth: 2,
                  borderColor: active ? colors.cyan : colors.borderDark,
                  backgroundColor: active ? colors.cyan : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {active && <MaterialCommunityIcons name="check" size={13} color={colors.white} />}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Done"
          style={({ pressed }) => ({
            marginHorizontal: 20, marginTop: 16, paddingVertical: 14, borderRadius: 12,
            backgroundColor: pressed ? `${colors.neonPurple}CC` : colors.neonPurple, alignItems: 'center',
          })}>
          <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white }}>Done</AppText>
        </Pressable>
      </Pressable>
    </Pressable>
  </Modal>
);

// ── Toolbar button ───────────────────────────────────────────────────────────

interface ToolbarBtnProps { icon: IconName; label: string; badge?: number; isActive: boolean; activeColor: string; onPress: () => void }

const ToolbarBtn: React.FC<ToolbarBtnProps> = ({ icon, label, badge, isActive, activeColor, onPress }) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
    style={({ pressed }) => ({
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
      borderWidth: 1,
      borderColor: isActive ? activeColor : colors.borderDark,
      backgroundColor: isActive ? `${activeColor}18` : colors.cardDark,
      opacity: pressed ? 0.75 : 1,
    })}>
    <MaterialCommunityIcons name={icon} size={14} color={isActive ? activeColor : colors.textSlate400} />
    <AppText style={{ fontSize: 13, fontWeight: isActive ? '700' : '500', color: isActive ? activeColor : colors.textSlate400 }}>
      {label}
    </AppText>
    {badge !== undefined && badge > 0 ? (
      <View style={{ minWidth: 18, height: 18, borderRadius: 9, backgroundColor: activeColor, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
        <AppText style={{ fontSize: 11, fontWeight: '700', color: colors.white }}>{badge}</AppText>
      </View>
    ) : (
      <MaterialCommunityIcons name="chevron-down" size={14} color={isActive ? activeColor : colors.textSlate500} />
    )}
  </Pressable>
);

// ── Company card ─────────────────────────────────────────────────────────────

interface StatBitProps { icon: IconName; value: string; color: string }
const StatBit: React.FC<StatBitProps> = ({ icon, value, color }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
    <MaterialCommunityIcons name={icon} size={11} color={color} />
    <AppText style={{ fontSize: 11, color: colors.textSlate400 }}>{value}</AppText>
  </View>
);

const STATUS_COLORS: Record<string, string> = {
  active: colors.green, pending: colors.warning, blocked: colors.error, rejected: colors.textSlate500,
};

interface CompanyCardProps { item: CompanyRankItem; rank?: number }
const CompanyCard: React.FC<CompanyCardProps> = ({ item, rank }) => {
  const statusColor = STATUS_COLORS[item.status] ?? colors.textSlate500;
  return (
    <Pressable
      onPress={() => router.push(`/(main)/(feed)/business/${item.id}`)}
      accessibilityRole="button" accessibilityLabel={item.name}
      style={({ pressed }) => ({
        backgroundColor: colors.cardDark, borderRadius: 14,
        marginHorizontal: 16, marginVertical: 6, padding: 16,
        borderWidth: 1, borderColor: colors.borderDark, opacity: pressed ? 0.8 : 1,
      })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {rank !== undefined && (
          <View style={{ width: 24, alignItems: 'center' }}>
            <AppText style={{ fontSize: 13, fontWeight: '700', color: rank <= 3 ? colors.ratingGold : colors.textSlate500 }}>
              #{rank}
            </AppText>
          </View>
        )}
        <View style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: `${colors.neonPurple}1A`, borderWidth: 1, borderColor: `${colors.neonPurple}33`,
          justifyContent: 'center', alignItems: 'center',
        }}>
          <MaterialCommunityIcons name="domain" size={22} color={colors.neonPurple} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white, flexShrink: 1 }} numberOfLines={1}>
              {item.name}
            </AppText>
            <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: `${statusColor}22` }}>
              <AppText style={{ fontSize: 10, fontWeight: '600', color: statusColor }}>{item.status}</AppText>
            </View>
            {item.isOwnerVerified && <MaterialCommunityIcons name="check-decagram" size={14} color={colors.cyan} />}
            {item.isPremium && <MaterialCommunityIcons name="crown" size={13} color={colors.yellow} />}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
            <StatBit icon="eye-outline"           value={formatCount(item.visits)}   color={colors.cyan} />
            <StatBit icon="comment-text-outline"  value={formatCount(item.reviews)}  color={colors.pink} />
            <StatBit icon="star-outline"          value={item.rating.toFixed(1)}     color={colors.ratingGold} />
            <StatBit icon="calendar-plus-outline" value={formatDate(item.createdAt)} color={colors.textSlate500} />
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSlate500} />
      </View>
    </Pressable>
  );
};

// ── Config ───────────────────────────────────────────────────────────────────

const FILTER_LABELS: Record<CompanyFilter, string> = {
  all: 'All Companies', active: 'Active Companies', pending: 'Pending Companies',
  ownerVerified: 'Owner Verified', ownerUnverified: 'Unclaimed',
  premium: 'Premium Companies', verifiedBasic: 'Verified Basic',
};

const SORT_OPTIONS: SheetOption[] = [
  { key: 'default', label: 'Default',    icon: 'sort-variant',          color: colors.neonPurple },
  { key: 'rating',  label: 'Rating',     icon: 'star-outline',          color: colors.ratingGold },
  { key: 'reviews', label: 'Reviews',    icon: 'comment-text-outline',  color: colors.pink },
  { key: 'views',   label: 'Views',      icon: 'eye-outline',           color: colors.cyan },
  { key: 'date',    label: 'Date Added', icon: 'calendar-plus-outline', color: colors.textSlate400 },
];

const FILTER_OPTIONS: SheetOption[] = [
  { key: 'active',   label: 'Active',   icon: 'check-circle-outline',  color: colors.green },
  { key: 'pending',  label: 'Pending',  icon: 'clock-outline',         color: colors.warning },
  { key: 'basic',    label: 'Basic',    icon: 'account-check-outline', color: colors.ratingGold },
  { key: 'premium',  label: 'Premium',  icon: 'crown-outline',         color: colors.pink },
  { key: 'verified', label: 'Verified', icon: 'check-decagram',        color: colors.cyan },
];

const SORT_LABEL: Record<CompanySort, string> = {
  default: 'Sort', rating: 'Rating', reviews: 'Reviews', views: 'Views', date: 'Date Added',
};

// ── Screen ───────────────────────────────────────────────────────────────────

export function AdminCompanyListScreen() {
  const { filter = 'all', mode = 'dashboard' } = useLocalSearchParams<{ filter: CompanyFilter; mode: string }>();
  const isDashboard = mode !== 'list';

  const [companies, setCompanies] = useState<CompanyRankItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSort, setActiveSort] = useState<CompanySort>('default');
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('month');
  const [customRange, setCustomRange] = useState<ChartDateRange | null>(null);

  const isAllView = filter === 'all';

  const load = useCallback(async () => {
    setIsLoading(true);
    const result = await container.getAdminCompanyListUseCase.execute(filter as CompanyFilter);
    result.fold(() => setCompanies([]), (data) => setCompanies(data));
    setIsLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const toggleFilter = useCallback((key: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => setActiveFilters(new Set()), []);

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }, []);

  const clearCategories = useCallback(() => setSelectedCategories(new Set()), []);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => { if (c.categoryName) set.add(c.categoryName); });
    return Array.from(set).sort();
  }, [companies]);

  const processed = useMemo(() => {
    const filtered = isAllView ? applyFilters(companies, activeFilters) : companies;
    const sorted = sortCompanies(filtered, activeSort);
    const byCat = selectedCategories.size > 0
      ? sorted.filter((c) => selectedCategories.has(c.categoryName))
      : sorted;
    if (!searchQuery.trim()) return byCat;
    const q = searchQuery.trim().toLowerCase();
    return byCat.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, activeSort, activeFilters, isAllView, searchQuery, selectedCategories]);

  const top5 = useMemo(() => processed.slice(0, 5), [processed]);

  const renderItem = useCallback(({ item }: { item: CompanyRankItem }) => (
    <CompanyCard item={item} />
  ), []);

  const handleSeeAll = useCallback(() => {
    router.push({ pathname: '/(main)/(feed)/admin-companies', params: { filter, mode: 'list' } });
  }, [filter]);

  const handleDateConfirm = useCallback((range: DateRange) => {
    setCustomRange(range);
    setShowDatePicker(false);
  }, []);

  // ── Shared top section (search + toolbar) ────────────────────────────────

  const TopSection = (
    <>
      {/* Search bar */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 10,
        marginHorizontal: 16, marginBottom: 4,
        paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 14, borderWidth: 1,
        borderColor: colors.borderDark, backgroundColor: colors.cardDark,
      }}>
        <MaterialCommunityIcons name="magnify" size={18} color={colors.textSlate400} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search companies…"
          placeholderTextColor={colors.textSlate500}
          accessibilityLabel="Search companies"
          style={{ flex: 1, fontSize: 14, color: colors.white, padding: 0 }}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} accessibilityRole="button" accessibilityLabel="Clear search">
            <MaterialCommunityIcons name="close-circle" size={16} color={colors.textSlate400} />
          </Pressable>
        )}
      </View>

      {/* Toolbar */}
      {!isLoading && companies.length > 0 && (
        <View style={{
          flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 10,
          borderBottomWidth: 1, borderBottomColor: colors.borderDark,
        }}>
          <ToolbarBtn icon="sort-variant" label={SORT_LABEL[activeSort]}
            isActive={activeSort !== 'default'} activeColor={colors.neonPurple}
            onPress={() => setShowSort(true)} />
          {isAllView && (
            <ToolbarBtn icon="filter-outline" label="Filter" badge={activeFilters.size}
              isActive={activeFilters.size > 0} activeColor={colors.pink}
              onPress={() => setShowFilter(true)} />
          )}
          {availableCategories.length > 0 && (
            <ToolbarBtn icon="tag-outline" label="Category" badge={selectedCategories.size}
              isActive={selectedCategories.size > 0} activeColor={colors.cyan}
              onPress={() => setShowCategory(true)} />
          )}
        </View>
      )}
    </>
  );

  // ── Shared modals ────────────────────────────────────────────────────────

  const Modals = (
    <>
      <SortSheet visible={showSort} activeKey={activeSort}
        onSelect={(k) => setActiveSort(k as CompanySort)} onClose={() => setShowSort(false)} />
      <FilterSheet visible={showFilter} selected={activeFilters}
        onToggle={toggleFilter} onClear={clearFilters} onClose={() => setShowFilter(false)} />
      <CategorySheet visible={showCategory} categories={availableCategories} selected={selectedCategories}
        onToggle={toggleCategory} onClear={clearCategories} onClose={() => setShowCategory(false)} />
      {showDatePicker && (
        <DateRangePickerModal
          visible={showDatePicker}
          initial={customRange ?? { start: new Date(), end: new Date() }}
          onConfirm={handleDateConfirm}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </>
  );

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back"
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.white} />
        </Pressable>
        <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.white, flex: 1 }}>
          {FILTER_LABELS[filter as CompanyFilter] ?? 'Companies'}
        </AppText>
        {!isLoading && (
          <View style={{
            minWidth: 28, height: 24, borderRadius: 12,
            backgroundColor: `${colors.neonPurple}33`, borderWidth: 1, borderColor: `${colors.neonPurple}4D`,
            alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
          }}>
            <AppText style={{ fontSize: 12, fontWeight: '700', color: colors.neonPurple }}>
              {processed.length}
            </AppText>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.neonPurple} />
        </View>
      ) : isDashboard ? (
        /* ── DASHBOARD MODE ─────────────────────────────────────────────── */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {TopSection}

          {companies.length > 0 && (
            <>
              {/* Line chart */}
              <View style={{ marginTop: 16 }}>
                <CompanyLineChart
                  companies={processed.length > 0 ? processed : companies}
                  period={chartPeriod}
                  onPeriodChange={(p) => { setChartPeriod(p); setCustomRange(null); }}
                  customRange={customRange}
                  onOpenDatePicker={() => setShowDatePicker(true)}
                />
              </View>

              {/* Category donut */}
              <CompanyCategoryChart companies={processed.length > 0 ? processed : companies} />

              {/* Top 5 section */}
              <View style={{ marginHorizontal: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                <AppText style={{ flex: 1, fontSize: 16, fontWeight: '700', color: colors.white }}>
                  Top Companies
                </AppText>
                <AppText style={{ fontSize: 12, color: colors.textSlate500 }}>
                  {Math.min(processed.length, 5)} of {processed.length}
                </AppText>
              </View>

              {top5.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                  <MaterialCommunityIcons name="store-off-outline" size={40} color={colors.textSlate500} />
                  <AppText style={{ fontSize: 14, color: colors.textSlate400, marginTop: 8 }}>No companies found</AppText>
                </View>
              ) : (
                top5.map((item, index) => (
                  <CompanyCard key={item.id} item={item} rank={index + 1} />
                ))
              )}

              {/* See All button */}
              {processed.length > 5 && (
                <Pressable
                  onPress={handleSeeAll}
                  accessibilityRole="button"
                  accessibilityLabel="See all companies"
                  style={({ pressed }) => ({
                    marginHorizontal: 16, marginTop: 8, paddingVertical: 14,
                    borderRadius: 14, borderWidth: 1, borderColor: colors.neonPurple,
                    backgroundColor: pressed ? `${colors.neonPurple}22` : `${colors.neonPurple}11`,
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                  })}
                >
                  <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.neonPurple }}>
                    See All {processed.length} Companies
                  </AppText>
                  <MaterialCommunityIcons name="chevron-down" size={18} color={colors.neonPurple} />
                </Pressable>
              )}
            </>
          )}

          {companies.length === 0 && (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 }}>
              <MaterialCommunityIcons name="store-off-outline" size={48} color={colors.textSlate500} />
              <AppText style={{ fontSize: 16, color: colors.textSlate400 }}>No companies found</AppText>
            </View>
          )}
        </ScrollView>
      ) : (
        /* ── LIST MODE ──────────────────────────────────────────────────── */
        <>
          {TopSection}
          {processed.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <MaterialCommunityIcons name="store-off-outline" size={48} color={colors.textSlate500} />
              <AppText style={{ fontSize: 16, color: colors.textSlate400 }}>No companies found</AppText>
            </View>
          ) : (
            <FlatList
              data={processed}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingTop: 4, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}

      {Modals}
    </ScreenLayout>
  );
}
