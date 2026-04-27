import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator, Modal } from 'react-native';
import { router } from 'expo-router';
import { container } from '@/core/di/container';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ── Types ─────────────────────────────────────────────────────────────────────
type FilterMode = 'ALL' | 'DAY' | 'MONTH' | 'YEAR' | 'CUSTOM';
type Granularity = 'summary' | 'day' | 'month' | 'year';
interface DateRange { start: Date; end: Date }
interface DataPoint { label: string; reviews: number; visits: number; searches: number }

// ── Constants ─────────────────────────────────────────────────────────────────
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// ── Date helpers ──────────────────────────────────────────────────────────────
function startOfDay(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function daysBetween(a: Date, b: Date): number { return Math.round((b.getTime() - a.getTime()) / 86400000); }
function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function shortDate(d: Date): string { return `${d.getDate()} ${MON_SHORT[d.getMonth()]} ${d.getFullYear()}`; }

// Earliest date we consider "the beginning" of the platform
const APP_EPOCH = new Date(2024, 0, 1);

function rangeForMode(mode: FilterMode, custom: DateRange): DateRange {
  const today = startOfDay(new Date());
  if (mode === 'ALL')   return { start: APP_EPOCH, end: today };
  if (mode === 'DAY')   return { start: today, end: today };
  if (mode === 'MONTH') return {
    start: new Date(today.getFullYear(), today.getMonth(), 1),
    end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
  };
  if (mode === 'YEAR')  return {
    start: new Date(today.getFullYear(), 0, 1),
    end: new Date(today.getFullYear(), 11, 31),
  };
  return custom;
}

function getGranularity(range: DateRange): Granularity {
  const days = daysBetween(range.start, range.end) + 1;
  if (days === 1) return 'summary';
  if (days <= 60) return 'day';
  if (days <= 730) return 'month';
  return 'year';
}

// ── Data loading ──────────────────────────────────────────────────────────────
async function fetchEngagement(range: DateRange): Promise<DataPoint[]> {
  return container.boInsightsDataSource.fetchGlobalEngagement(range);
}

// ── Range Calendar ────────────────────────────────────────────────────────────
interface RangeCalendarProps { initial: DateRange; onConfirm: (r: DateRange) => void; onClose: () => void }

const RangeCalendar: React.FC<RangeCalendarProps> = ({ initial, onConfirm, onClose }) => {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewMonth, setViewMonth] = useState(() => new Date(initial.start.getFullYear(), initial.start.getMonth(), 1));
  const [rangeStart, setRangeStart] = useState<Date | null>(startOfDay(initial.start));
  const [rangeEnd, setRangeEnd] = useState<Date | null>(startOfDay(initial.end));

  const handleDayPress = useCallback((date: Date) => {
    if (date > today) return;
    if (!rangeStart || rangeEnd) {
      setRangeStart(date);
      setRangeEnd(null);
    } else {
      if (date < rangeStart) { setRangeEnd(rangeStart); setRangeStart(date); }
      else setRangeEnd(date);
    }
  }, [rangeStart, rangeEnd, today]);

  const dayCells = useMemo(() => {
    const yr = viewMonth.getFullYear(), mo = viewMonth.getMonth();
    const firstDow = new Date(yr, mo, 1).getDay();
    const last = new Date(yr, mo + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= last; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewMonth]);

  const canGoNext = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1) <= today;

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center' }} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}
          style={{ backgroundColor: colors.cardDark, borderRadius: 20, padding: 20, width: 320, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>

          {/* Month nav */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Pressable onPress={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              style={{ padding: 6 }} accessibilityRole="button" accessibilityLabel="Previous month">
              <MaterialCommunityIcons name="chevron-left" size={22} color={colors.textSlate400} />
            </Pressable>
            <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white }}>
              {MON_FULL[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </AppText>
            <Pressable onPress={() => { if (canGoNext) setViewMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); }}
              style={{ padding: 6, opacity: canGoNext ? 1 : 0.3 }} accessibilityRole="button" accessibilityLabel="Next month">
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSlate400} />
            </Pressable>
          </View>

          {/* DOW headers */}
          <View style={{ flexDirection: 'row', marginBottom: 6 }}>
            {DOW.map((d) => (
              <View key={d} style={{ flex: 1, alignItems: 'center' }}>
                <AppText style={{ fontSize: 10, fontWeight: '600', color: colors.textSlate500 }}>{d[0]}</AppText>
              </View>
            ))}
          </View>

          {/* Day grid */}
          {Array.from({ length: dayCells.length / 7 }, (_, row) => (
            <View key={row} style={{ flexDirection: 'row', marginBottom: 2 }}>
              {dayCells.slice(row * 7, row * 7 + 7).map((day, col) => {
                if (!day) return <View key={col} style={{ flex: 1, height: 36 }} />;
                const cellDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
                const isFuture = cellDate > today;
                const isStart = !!rangeStart && cellDate.getTime() === rangeStart.getTime();
                const isEnd = !!rangeEnd && cellDate.getTime() === rangeEnd.getTime();
                const inRange = !!rangeStart && !!rangeEnd && cellDate > rangeStart && cellDate < rangeEnd;
                const isSelected = isStart || isEnd;
                return (
                  <Pressable key={col} onPress={() => handleDayPress(cellDate)}
                    accessibilityRole="button" accessibilityLabel={String(day)}
                    style={{ flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', opacity: isFuture ? 0.25 : 1, borderRadius: isSelected ? 9999 : inRange ? 0 : 9999, backgroundColor: isSelected ? colors.neonPurple : inRange ? `${colors.neonPurple}30` : 'transparent' }}>
                    <AppText style={{ fontSize: 13, fontWeight: isSelected ? '700' : '400', color: isSelected ? colors.white : inRange ? colors.neonPurple : colors.textSlate200 }}>
                      {day}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          ))}

          {/* Range display */}
          <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderColor: colors.borderDark, flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText style={{ fontSize: 11, color: colors.textSlate400 }}>
              {'From: '}
              <AppText style={{ color: colors.white, fontWeight: '600' }}>{rangeStart ? shortDate(rangeStart) : '—'}</AppText>
            </AppText>
            <AppText style={{ fontSize: 11, color: colors.textSlate400 }}>
              {'To: '}
              <AppText style={{ color: colors.white, fontWeight: '600' }}>
                {rangeEnd ? shortDate(rangeEnd) : rangeStart ? shortDate(rangeStart) : '—'}
              </AppText>
            </AppText>
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Cancel"
              style={{ flex: 1, paddingVertical: 12, borderRadius: 9999, borderWidth: 1, borderColor: colors.borderDark, alignItems: 'center' }}>
              <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.textSlate400 }}>Cancel</AppText>
            </Pressable>
            <Pressable onPress={() => rangeStart && onConfirm({ start: rangeStart, end: rangeEnd ?? rangeStart })}
              accessibilityRole="button" accessibilityLabel="Confirm"
              style={{ flex: 1, paddingVertical: 12, borderRadius: 9999, backgroundColor: rangeStart ? colors.neonPurple : colors.borderDark, alignItems: 'center', opacity: rangeStart ? 1 : 0.5 }}>
              <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.white }}>Confirm</AppText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ── Bar chart ─────────────────────────────────────────────────────────────────
interface ChartProps {
  points: DataPoint[];
  metricKey: keyof Omit<DataPoint, 'label'>;
  accent: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}
const MetricChart: React.FC<ChartProps> = ({ points, metricKey, accent, label, icon }) => {
  const values = points.map((p) => p[metricKey] as number);
  const maxVal = Math.max(...values, 1);
  const total = values.reduce((s, v) => s + v, 0);
  const [selIdx, setSelIdx] = useState<number | null>(null);
  const selPoint = selIdx !== null ? points[selIdx] : null;

  // Reset selection when data changes
  const prevLengthRef = useRef(points.length);
  if (prevLengthRef.current !== points.length) {
    prevLengthRef.current = points.length;
    if (selIdx !== null) setSelIdx(null);
  }

  return (
    <View style={{ backgroundColor: colors.cardDark, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: selPoint ? 8 : 16 }}>
        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${accent}1A`, borderWidth: 1, borderColor: `${accent}33`, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialCommunityIcons name={icon} size={16} color={accent} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.white }}>{label}</AppText>
          <AppText style={{ fontSize: 11, color: colors.textSlate400 }}>Total: {total.toLocaleString()}</AppText>
        </View>
        <AppText style={{ fontSize: 22, fontWeight: '800', color: accent }}>{total.toLocaleString()}</AppText>
      </View>

      {/* Selected bar detail */}
      {selPoint && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: `${accent}15`, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, borderWidth: 1, borderColor: `${accent}30` }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="calendar-outline" size={13} color={accent} />
            <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.textSlate200 }}>{selPoint.label}</AppText>
          </View>
          <AppText style={{ fontSize: 18, fontWeight: '800', color: accent }}>{(selPoint[metricKey] as number).toLocaleString()}</AppText>
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: points.length > 20 ? 2 : 4 }}>
        {points.map((p, i) => {
          const val = p[metricKey] as number;
          const barH = Math.max(4, (val / maxVal) * 72);
          const isSelected = selIdx === i;
          const isHighest = val === maxVal && maxVal > 0;
          return (
            <Pressable
              key={i}
              style={{ flex: 1, alignItems: 'center', gap: 3 }}
              onPress={() => setSelIdx(isSelected ? null : i)}
              accessibilityRole="button"
              accessibilityLabel={`${p.label}: ${val.toLocaleString()}`}
            >
              <View style={{ width: '100%', height: barH, borderRadius: 3, backgroundColor: isSelected ? accent : isHighest ? accent : `${accent}55` }} />
              {points.length <= 14 && (
                <AppText style={{ fontSize: 7, color: isSelected ? accent : colors.textSlate500, textAlign: 'center' }} numberOfLines={1}>{p.label}</AppText>
              )}
            </Pressable>
          );
        })}
      </View>
      {points.length > 14 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <AppText style={{ fontSize: 8, color: colors.textSlate500 }}>{points[0].label}</AppText>
          <AppText style={{ fontSize: 8, color: colors.textSlate500 }}>{points[Math.floor(points.length / 2)].label}</AppText>
          <AppText style={{ fontSize: 8, color: colors.textSlate500 }}>{points[points.length - 1].label}</AppText>
        </View>
      )}
    </View>
  );
};

// ── Day summary cards ─────────────────────────────────────────────────────────
const DaySummary: React.FC<{ points: DataPoint[] }> = ({ points }) => {
  const p = points[0] ?? { reviews: 0, visits: 0, searches: 0 };
  return (
    <View style={{ gap: 12 }}>
      {([
        { label: 'Total Visits', value: p.visits, accent: colors.cyan, icon: 'eye' },
        { label: 'Searches', value: p.searches, accent: colors.orange, icon: 'magnify' },
        { label: 'Reviews', value: p.reviews, accent: colors.pink, icon: 'star' },
      ] as const).map((m) => (
        <View key={m.label} style={{ backgroundColor: colors.cardDark, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: `${m.accent}1A`, borderWidth: 1, borderColor: `${m.accent}33`, justifyContent: 'center', alignItems: 'center' }}>
            <MaterialCommunityIcons name={m.icon} size={22} color={m.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={{ fontSize: 12, color: colors.textSlate400, marginBottom: 4 }}>{m.label}</AppText>
            <AppText style={{ fontSize: 28, fontWeight: '800', color: m.accent }}>{m.value.toLocaleString()}</AppText>
          </View>
        </View>
      ))}
    </View>
  );
};

// ── Filter pill ───────────────────────────────────────────────────────────────
interface PillProps { label: string; active: boolean; onPress: () => void }
const FilterPill: React.FC<PillProps> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: active }}
    style={{ flex: 1, paddingVertical: 10, borderRadius: 9999, alignItems: 'center', backgroundColor: active ? colors.neonPurple : colors.cardDark, borderWidth: 1, borderColor: active ? colors.neonPurple : colors.borderDark }}>
    <AppText style={{ fontSize: 12, fontWeight: active ? '700' : '500', color: active ? colors.white : colors.textSlate400 }}>
      {label}
    </AppText>
  </Pressable>
);

function rangeLabel(range: DateRange): string {
  const s = shortDate(range.start);
  const e = shortDate(range.end);
  return s === e ? s : `${s}  →  ${e}`;
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function EngagementDetailsScreen() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [mode, setMode] = useState<FilterMode>('ALL');
  const [customRange, setCustomRange] = useState<DateRange>({ start: today, end: today });
  const [showCal, setShowCal] = useState(false);
  const [points, setPoints] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeRange = useMemo(() => rangeForMode(mode, customRange), [mode, customRange]);

  const loadData = useCallback(async (range: DateRange) => {
    setLoading(true);
    setError(null);
    try { setPoints(await fetchEngagement(range)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(activeRange); }, [loadData, activeRange]);

  const handleCalConfirm = useCallback((range: DateRange) => {
    setCustomRange(range);
    setMode('CUSTOM');
    setShowCal(false);
  }, []);

  const gran = getGranularity(activeRange);

  return (
    <ScreenLayout>
      {showCal && (
        <RangeCalendar
          initial={mode === 'CUSTOM' ? customRange : activeRange}
          onConfirm={handleCalConfirm}
          onClose={() => setShowCal(false)}
        />
      )}

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, gap: 12 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back"
          style={{ padding: 8, borderRadius: 9999, backgroundColor: colors.cardDark }}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.white} />
        </Pressable>
        <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white, flex: 1 }}>Global Engagement</AppText>
      </View>

      {/* Filter row: All | Day | Month | Year | Calendar */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 10 }}>
        <FilterPill label="All" active={mode === 'ALL'} onPress={() => setMode('ALL')} />
        <FilterPill label="Day" active={mode === 'DAY'} onPress={() => setMode('DAY')} />
        <FilterPill label="Month" active={mode === 'MONTH'} onPress={() => setMode('MONTH')} />
        <FilterPill label="Year" active={mode === 'YEAR'} onPress={() => setMode('YEAR')} />
        <Pressable onPress={() => setShowCal(true)} accessibilityRole="button" accessibilityLabel="Custom date range"
          style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 9999, alignItems: 'center', justifyContent: 'center', backgroundColor: mode === 'CUSTOM' ? colors.neonPurple : colors.cardDark, borderWidth: 1, borderColor: mode === 'CUSTOM' ? colors.neonPurple : colors.borderDark }}>
          <MaterialCommunityIcons name="calendar-month" size={18} color={mode === 'CUSTOM' ? colors.white : colors.textSlate400} />
        </Pressable>
      </View>

      {/* Range label */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>
          {'Showing: '}
          <AppText style={{ color: colors.neonPurple, fontWeight: '600' }}>
            {mode === 'ALL' ? 'All time' : rangeLabel(activeRange)}
          </AppText>
        </AppText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        {loading && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <ActivityIndicator size="large" color={colors.neonPurple} />
          </View>
        )}

        {!loading && !!error && (
          <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={40} color={colors.red} />
            <AppText style={{ fontSize: 14, color: colors.textSlate400, textAlign: 'center' }}>{error}</AppText>
            <Pressable onPress={() => loadData(activeRange)} accessibilityRole="button" accessibilityLabel="Retry"
              style={{ paddingHorizontal: 24, paddingVertical: 10, borderRadius: 9999, backgroundColor: `${colors.neonPurple}1A`, borderWidth: 1, borderColor: `${colors.neonPurple}33` }}>
              <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.neonPurple }}>Retry</AppText>
            </Pressable>
          </View>
        )}

        {!loading && !error && points.length > 0 && (
          <>
            {gran === 'summary' ? (
              <DaySummary points={points} />
            ) : (
              <>
                <MetricChart points={points} metricKey="visits" accent={colors.cyan} label="Total Visits" icon="eye" />
                <MetricChart points={points} metricKey="searches" accent={colors.orange} label="Searches" icon="magnify" />
                <MetricChart points={points} metricKey="reviews" accent={colors.pink} label="Reviews" icon="star" />
              </>
            )}
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
