import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { container } from '@/core/di/container';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { RangeCalendar } from '@/presentation/shared/components/ui/RangeCalendar';
import { colors } from '@/core/theme/colors';
import { useBusinessOwnerStore } from '../store/businessOwnerStore';
import { rangeForInsightMode, type InsightFilterMode, type InsightDateRange } from '../hooks/useBusinessInsights';

const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const FILTERS: { key: InsightFilterMode; label: string }[] = [
  { key: 'ALL',   label: 'All'   },
  { key: 'WEEK',  label: 'Week'  },
  { key: 'MONTH', label: 'Month' },
  { key: 'YEAR',  label: 'Year'  },
];

type SortKey = 'found' | 'opened' | 'rate';
const SORTS: { key: SortKey; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'found',  label: 'Found',    icon: 'magnify'          },
  { key: 'opened', label: 'Opened',   icon: 'store-outline'    },
  { key: 'rate',   label: 'Conv. %',  icon: 'percent'          },
];

function sod(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function fmtRange(range: InsightDateRange): string {
  const s = range.start; const e = range.end;
  return `${s.getDate()} ${MON[s.getMonth()]} – ${e.getDate()} ${MON[e.getMonth()]} ${e.getFullYear()}`;
}
function convRate(find: number, open: number): number {
  const total = find + open;
  return total > 0 ? Math.round((open / total) * 100) : 0;
}
function rateColor(pct: number): string {
  if (pct >= 60) return colors.emerald;
  if (pct >= 30) return colors.yellow;
  return colors.red ?? '#EF4444';
}

interface KeywordRow { keyword: string; findCount: number; openCount: number }

export default function SearchKeywordsDetailsScreen() {
  const { t } = useTranslation();
  const business = useBusinessOwnerStore(s => s.business);
  const today = useMemo(() => sod(new Date()), []);

  const [mode,        setMode]        = useState<InsightFilterMode>('WEEK');
  const [customRange, setCustomRange] = useState<InsightDateRange>({ start: today, end: today });
  const [showCal,     setShowCal]     = useState(false);
  const [keywords,    setKeywords]    = useState<KeywordRow[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [sortKey,     setSortKey]     = useState<SortKey>('found');

  const range = useMemo(() => rangeForInsightMode(mode, customRange), [mode, customRange]);

  const load = useCallback(async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      setKeywords(await container.boInsightsDataSource.fetchKeywordsInRange(business.id, range, mode));
    } catch {
      setKeywords([]);
    } finally {
      setLoading(false);
    }
  }, [business?.id, range, mode]);

  useEffect(() => { load(); }, [load]);

  const sorted = useMemo(() => {
    return [...keywords].sort((a, b) => {
      if (sortKey === 'opened') return b.openCount - a.openCount;
      if (sortKey === 'rate')   return convRate(b.findCount, b.openCount) - convRate(a.findCount, a.openCount);
      return b.findCount - a.findCount;
    });
  }, [keywords, sortKey]);

  // Summary totals
  const totalFound  = keywords.reduce((s, k) => s + k.findCount + k.openCount, 0);
  const totalOpened = keywords.reduce((s, k) => s + k.openCount, 0);
  const overallRate = convRate(totalFound, totalOpened);

  return (
    <ScreenLayout>
      {showCal && (
        <RangeCalendar
          initial={customRange}
          onConfirm={r => { setCustomRange(r); setMode('CUSTOM'); setShowCal(false); }}
          onClose={() => setShowCal(false)}
        />
      )}

      {/* Header */}
      <View style={{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingTop:12, paddingBottom:12 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back"
          style={{ width:36, height:36, borderRadius:10, backgroundColor:colors.cardDark, borderWidth:1, borderColor:colors.borderDark, justifyContent:'center', alignItems:'center' }}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={colors.white} />
        </Pressable>
        <View>
          <AppText style={{ fontSize:17, fontWeight:'700', color:colors.white }}>{t('businessOwner.searchKeywords.title')}</AppText>
          {business && <AppText style={{ fontSize:12, color:colors.textSlate400 }}>{business.name}</AppText>}
        </View>
      </View>

      {/* Filter bar */}
      <View style={{ paddingHorizontal:16, gap:4, marginBottom:8 }}>
        <View style={{ flexDirection:'row', gap:6 }}>
          {FILTERS.map(f => (
            <Pressable key={f.key} onPress={() => setMode(f.key)} accessibilityRole="button" accessibilityLabel={f.label}
              style={{ flex:1, paddingVertical:8, borderRadius:9999, alignItems:'center', backgroundColor:mode===f.key?colors.neonPurple:colors.cardDark, borderWidth:1, borderColor:mode===f.key?colors.neonPurple:colors.borderDark }}>
              <AppText style={{ fontSize:11, fontWeight:mode===f.key?'700':'500', color:mode===f.key?colors.white:colors.textSlate400 }}>{f.label}</AppText>
            </Pressable>
          ))}
          <Pressable onPress={() => setShowCal(true)} accessibilityRole="button" accessibilityLabel="Custom date range"
            style={{ paddingHorizontal:12, paddingVertical:8, borderRadius:9999, justifyContent:'center', backgroundColor:mode==='CUSTOM'?colors.neonPurple:colors.cardDark, borderWidth:1, borderColor:mode==='CUSTOM'?colors.neonPurple:colors.borderDark }}>
            <MaterialCommunityIcons name="calendar-month" size={16} color={mode==='CUSTOM'?colors.white:colors.textSlate400} />
          </Pressable>
        </View>
        <AppText style={{ fontSize:10, color:colors.textSlate500 }}>{fmtRange(range)}</AppText>
      </View>

      {loading && <ActivityIndicator size="large" color={colors.neonPurple} style={{ marginTop:60 }} />}

      {!loading && keywords.length === 0 && (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center', gap:12 }}>
          <MaterialCommunityIcons name="magnify-close" size={48} color={colors.textSlate600} />
          <AppText style={{ fontSize:15, color:colors.textSlate400 }}>{t('businessOwner.searchKeywords.noKeywords')}</AppText>
          <AppText style={{ fontSize:13, color:colors.textSlate500, textAlign:'center', paddingHorizontal:40 }}>
            {t('businessOwner.searchKeywords.noKeywordsHint')}
          </AppText>
        </View>
      )}

      {!loading && keywords.length > 0 && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:16, paddingBottom:100 }}>

          {/* Summary strip */}
          <View style={{ flexDirection:'row', gap:8, marginBottom:14 }}>
            <View style={{ flex:1, backgroundColor:colors.cardDark, borderRadius:10, padding:12, alignItems:'center', borderWidth:1, borderColor:colors.borderDark }}>
              <MaterialCommunityIcons name="magnify" size={16} color={colors.cyan} />
              <AppText style={{ fontSize:16, fontWeight:'800', color:colors.white, marginTop:2 }}>{totalFound}</AppText>
              <AppText style={{ fontSize:10, color:colors.textSlate500 }}>{t('businessOwner.searchKeywords.totalFound')}</AppText>
            </View>
            <View style={{ flex:1, backgroundColor:colors.cardDark, borderRadius:10, padding:12, alignItems:'center', borderWidth:1, borderColor:colors.borderDark }}>
              <MaterialCommunityIcons name="store-outline" size={16} color={colors.orange} />
              <AppText style={{ fontSize:16, fontWeight:'800', color:colors.white, marginTop:2 }}>{totalOpened}</AppText>
              <AppText style={{ fontSize:10, color:colors.textSlate500 }}>{t('businessOwner.searchKeywords.totalOpened')}</AppText>
            </View>
            <View style={{ flex:1, backgroundColor:colors.cardDark, borderRadius:10, padding:12, alignItems:'center', borderWidth:1, borderColor:`${rateColor(overallRate)}44` }}>
              <MaterialCommunityIcons name="percent" size={16} color={rateColor(overallRate)} />
              <AppText style={{ fontSize:16, fontWeight:'800', color:rateColor(overallRate), marginTop:2 }}>{overallRate}%</AppText>
              <AppText style={{ fontSize:10, color:colors.textSlate500 }}>{t('businessOwner.searchKeywords.avgConv')}</AppText>
            </View>
          </View>

          {/* Sort pills */}
          <View style={{ flexDirection:'row', gap:6, marginBottom:12, alignItems:'center' }}>
            <AppText style={{ fontSize:11, color:colors.textSlate500 }}>{t('businessOwner.searchKeywords.sort')}</AppText>
            {SORTS.map(s => (
              <Pressable key={s.key} onPress={() => setSortKey(s.key)} accessibilityRole="button" accessibilityLabel={s.label}
                style={{ flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:10, paddingVertical:5, borderRadius:9999, backgroundColor:sortKey===s.key?colors.neonPurple:colors.cardDark, borderWidth:1, borderColor:sortKey===s.key?colors.neonPurple:colors.borderDark }}>
                <MaterialCommunityIcons name={s.icon} size={11} color={sortKey===s.key?colors.white:colors.textSlate400} />
                <AppText style={{ fontSize:11, fontWeight:sortKey===s.key?'700':'500', color:sortKey===s.key?colors.white:colors.textSlate400 }}>{s.label}</AppText>
              </Pressable>
            ))}
          </View>

          <AppText style={{ fontSize:11, color:colors.textSlate500, marginBottom:8 }}>
            {keywords.length} keyword{keywords.length !== 1 ? 's' : ''}
          </AppText>

          {sorted.map((kw, i) => {
            const rate  = convRate(kw.findCount, kw.openCount);
            const total = kw.findCount + kw.openCount;
            const barW  = total > 0 ? (kw.openCount / total) : 0;
            const rc    = rateColor(rate);
            return (
              <View key={kw.keyword} style={{ backgroundColor:colors.cardDark, borderRadius:12, padding:14, marginBottom:8, borderWidth:1, borderColor:colors.borderDark }}>
                {/* Row 1: rank + keyword + rate badge */}
                <View style={{ flexDirection:'row', alignItems:'center', marginBottom:8 }}>
                  <View style={{ width:28, height:28, borderRadius:14, backgroundColor:`${colors.neonPurple}22`, justifyContent:'center', alignItems:'center', marginRight:10 }}>
                    <AppText style={{ fontSize:11, fontWeight:'700', color:colors.neonPurple }}>#{i + 1}</AppText>
                  </View>
                  <AppText style={{ flex:1, fontSize:14, fontWeight:'600', color:colors.white }}>{kw.keyword}</AppText>
                  <View style={{ paddingHorizontal:8, paddingVertical:3, borderRadius:9999, backgroundColor:`${rc}22`, borderWidth:1, borderColor:`${rc}44` }}>
                    <AppText style={{ fontSize:12, fontWeight:'700', color:rc }}>{rate}%</AppText>
                  </View>
                </View>
                {/* Row 2: appearances / opened counts */}
                <View style={{ flexDirection:'row', gap:16, marginBottom:8 }}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
                    <MaterialCommunityIcons name="magnify" size={12} color={colors.cyan} />
                    <AppText style={{ fontSize:12, fontWeight:'600', color:colors.cyan }}>{total} found</AppText>
                  </View>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
                    <MaterialCommunityIcons name="store-outline" size={12} color={colors.orange} />
                    <AppText style={{ fontSize:12, fontWeight:'600', color:colors.orange }}>{kw.openCount} opened</AppText>
                  </View>
                </View>
                {/* Conversion bar */}
                <View style={{ height:4, borderRadius:2, backgroundColor:`${colors.borderDark}`, overflow:'hidden' }}>
                  <View style={{ height:'100%', width:`${barW * 100}%`, borderRadius:2, backgroundColor:rc }} />
                </View>
                <AppText style={{ fontSize:9, color:colors.textSlate500, marginTop:3 }}>
                  Conversion rate — {kw.openCount} opened out of {total} appearances
                </AppText>
              </View>
            );
          })}
        </ScrollView>
      )}
    </ScreenLayout>
  );
}
