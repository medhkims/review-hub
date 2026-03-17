import React, { useState, useRef } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { colors } from '@/core/theme/colors';
import { useBusinessInsights } from '../hooks/useBusinessInsights';
import { InsightLineChart } from '../components/InsightLineChart';
import { RangeCalendar } from '@/presentation/shared/components/ui/RangeCalendar';
import { PremiumInsightsTab } from '../components/PremiumInsightsTab';
import type { InsightFilterMode, EngagementPoint } from '../hooks/useBusinessInsights';

// ── Filter pill ────────────────────────────────────────────────────────────────
interface PillProps { label: string; active: boolean; onPress: () => void }
const FilterPill: React.FC<PillProps> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: active }}
    style={{ flex:1, paddingVertical:10, borderRadius:9999, alignItems:'center', backgroundColor:active?colors.neonPurple:colors.cardDark, borderWidth:1, borderColor:active?colors.neonPurple:colors.borderDark }}>
    <AppText style={{ fontSize:12, fontWeight:active?'700':'500', color:active?colors.white:colors.textSlate400 }}>{label}</AppText>
  </Pressable>
);

// ── Engagement bar chart ───────────────────────────────────────────────────────
interface ChartProps { points: EngagementPoint[]; metricKey: keyof Omit<EngagementPoint,'label'>; accent: string; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
const MetricChart: React.FC<ChartProps> = ({ points, metricKey, accent, label, icon }) => {
  const values  = points.map(p => p[metricKey] as number);
  const maxVal  = Math.max(...values, 1);
  const total   = values.reduce((s,v) => s+v, 0);
  const [selIdx, setSelIdx] = useState<number|null>(null);
  const prevLen = useRef(points.length);
  if (prevLen.current !== points.length) { prevLen.current = points.length; if (selIdx !== null) setSelIdx(null); }

  return (
    <View style={{ backgroundColor:colors.cardDark, borderRadius:14, padding:16, marginBottom:16, borderWidth:1, borderColor:'rgba(255,255,255,0.05)' }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:16 }}>
        <View style={{ width:32,height:32,borderRadius:8,backgroundColor:`${accent}1A`,borderWidth:1,borderColor:`${accent}33`,justifyContent:'center',alignItems:'center' }}>
          <MaterialCommunityIcons name={icon} size={16} color={accent} />
        </View>
        <View style={{ flex:1 }}>
          <AppText style={{ fontSize:13, fontWeight:'700', color:colors.white }}>{label}</AppText>
          <AppText style={{ fontSize:11, color:colors.textSlate400 }}>Total: {total.toLocaleString()}</AppText>
        </View>
        <AppText style={{ fontSize:22, fontWeight:'800', color:accent }}>{total.toLocaleString()}</AppText>
      </View>
      <View style={{ flexDirection:'row', alignItems:'flex-end', height:80, gap:points.length>20?2:4 }}>
        {points.map((p,i) => {
          const val = p[metricKey] as number;
          const barH = Math.max(4,(val/maxVal)*72);
          const isSel = selIdx===i;
          const isHigh = val===maxVal && maxVal>0;
          return (
            <Pressable key={i} style={{ flex:1, alignItems:'center', gap:3 }} onPress={() => setSelIdx(isSel?null:i)} accessibilityRole="button" accessibilityLabel={`${p.label}: ${val}`}>
              <View style={{ width:'100%', height:barH, borderRadius:3, backgroundColor:isSel?accent:isHigh?accent:`${accent}55` }} />
              {points.length<=14 && <AppText style={{ fontSize:7, color:isSel?accent:colors.textSlate500, textAlign:'center' }} numberOfLines={1}>{p.label}</AppText>}
            </Pressable>
          );
        })}
      </View>
      {points.length>14 && (
        <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop:4 }}>
          <AppText style={{ fontSize:8, color:colors.textSlate500 }}>{points[0].label}</AppText>
          <AppText style={{ fontSize:8, color:colors.textSlate500 }}>{points[Math.floor(points.length/2)].label}</AppText>
          <AppText style={{ fontSize:8, color:colors.textSlate500 }}>{points[points.length-1].label}</AppText>
        </View>
      )}
    </View>
  );
};


function formatCount(n: number): string {
  if (n>=1_000_000) return `${(n/1_000_000).toFixed(1)}M`;
  if (n>=1_000)     return `${(n/1_000).toFixed(1)}k`;
  return String(n);
}

const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

type InsightTab = 'free' | 'premium';

const FILTERS: { key: InsightFilterMode; label: string }[] = [
  { key:'ALL', label:'All' }, { key:'WEEK', label:'Week' }, { key:'MONTH', label:'Month' }, { key:'YEAR', label:'Year' },
];

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function BusinessInsightsScreen() {
  const [activeTab, setActiveTab] = useState<InsightTab>('free');
  const {
    business, mode, setMode, customRange, setCustomRange,
    showCalendar, setShowCalendar, activeRange, ratingPoints, engagementPoints, isLoading, error, refresh,
  } = useBusinessInsights();

  const avgRatingData   = ratingPoints.map((p) => ({ label:p.label, value:p.avgRating }));
  const reviewCountData = ratingPoints.map((p) => ({ label:p.label, value:p.count }));

  return (
    <ScreenLayout>
      {showCalendar && (
        <RangeCalendar
          initial={customRange}
          onConfirm={(r) => { setCustomRange(r); setMode('CUSTOM'); setShowCalendar(false); }}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {/* Header */}
      <View style={{ paddingHorizontal:16, paddingTop:12, paddingBottom:12 }}>
        <AppText style={{ fontSize:18, fontWeight:'700', color:colors.white }}>Insights</AppText>
        {business && <AppText style={{ fontSize:12, color:colors.textSlate400, marginTop:2 }}>{business.name}</AppText>}

        {/* Free / Premium tab switcher */}
        <View style={{ flexDirection:'row', marginTop:14, borderRadius:12, backgroundColor:colors.cardDark, padding:4, borderWidth:1, borderColor:colors.borderDark }}>
          <Pressable onPress={() => setActiveTab('free')}
            accessibilityRole="tab" accessibilityLabel="Free Insights" accessibilityState={{ selected: activeTab==='free' }}
            style={{ flex:1, paddingVertical:10, borderRadius:9, alignItems:'center', justifyContent:'center', flexDirection:'row', gap:6,
              backgroundColor: activeTab==='free' ? colors.neonPurple : 'transparent' }}>
            <MaterialCommunityIcons name="shield-check" size={15} color={activeTab==='free' ? colors.white : colors.textSlate400} />
            <AppText style={{ fontSize:13, fontWeight:'700', color: activeTab==='free' ? colors.white : colors.textSlate400 }}>Free</AppText>
          </Pressable>
          <Pressable onPress={() => setActiveTab('premium')}
            accessibilityRole="tab" accessibilityLabel="Premium Insights" accessibilityState={{ selected: activeTab==='premium' }}
            style={{ flex:1, paddingVertical:10, borderRadius:9, alignItems:'center', justifyContent:'center', flexDirection:'row', gap:6,
              backgroundColor: activeTab==='premium' ? colors.yellow : 'transparent' }}>
            <MaterialCommunityIcons name="crown" size={15} color={activeTab==='premium' ? colors.midnight : colors.textSlate400} />
            <AppText style={{ fontSize:13, fontWeight:'700', color: activeTab==='premium' ? colors.midnight : colors.textSlate400 }}>Premium</AppText>
          </Pressable>
        </View>
      </View>

      {/* ── FREE TAB ─────────────────────────────────────────────────────────── */}
      {activeTab === 'free' && (
        <>
          {/* Filter row */}
          <View style={{ flexDirection:'row', paddingHorizontal:16, gap:8, marginBottom:4 }}>
            {FILTERS.map((f) => (
              <FilterPill key={f.key} label={f.label} active={mode===f.key} onPress={() => setMode(f.key)} />
            ))}
            <Pressable onPress={() => setShowCalendar(true)} accessibilityRole="button" accessibilityLabel="Custom date range"
              style={{ paddingHorizontal:14, paddingVertical:10, borderRadius:9999, alignItems:'center', justifyContent:'center',
                backgroundColor:mode==='CUSTOM'?colors.neonPurple:colors.cardDark, borderWidth:1, borderColor:mode==='CUSTOM'?colors.neonPurple:colors.borderDark }}>
              <MaterialCommunityIcons name="calendar-month" size={18} color={mode==='CUSTOM'?colors.white:colors.textSlate400} />
            </Pressable>
          </View>

          {/* Active range label */}
          <View style={{ paddingHorizontal:16, marginBottom:8 }}>
            <AppText style={{ fontSize:11, color:colors.textSlate400 }}>
              {`${activeRange.start.getDate()} ${MON[activeRange.start.getMonth()]} ${activeRange.start.getFullYear()}  →  ${activeRange.end.getDate()} ${MON[activeRange.end.getMonth()]} ${activeRange.end.getFullYear()}`}
            </AppText>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:16, paddingBottom:120 }}>
            {isLoading && <View style={{ alignItems:'center', paddingVertical:60 }}><ActivityIndicator size="large" color={colors.neonPurple} /></View>}

            {!isLoading && !!error && (
              <View style={{ alignItems:'center', paddingVertical:40, gap:12 }}>
                <MaterialCommunityIcons name="alert-circle-outline" size={40} color={colors.red} />
                <AppText style={{ fontSize:14, color:colors.textSlate400, textAlign:'center' }}>{error}</AppText>
                <Pressable onPress={refresh} accessibilityRole="button" accessibilityLabel="Retry"
                  style={{ paddingHorizontal:24, paddingVertical:10, borderRadius:9999, backgroundColor:`${colors.neonPurple}1A`, borderWidth:1, borderColor:`${colors.neonPurple}33` }}>
                  <AppText style={{ fontSize:13, fontWeight:'600', color:colors.neonPurple }}>Retry</AppText>
                </Pressable>
              </View>
            )}

            {!isLoading && !error && (
              <>
                <AppText style={{ fontSize:11, fontWeight:'600', color:colors.textSlate500, textTransform:'uppercase', letterSpacing:1, marginBottom:10, marginTop:8 }}>Rating Average</AppText>
                <InsightLineChart data={avgRatingData} title="Average Rating" accent={colors.yellow} icon="star"
                  formatValue={(v) => v===0?'—':`${v}★`} emptyLabel="No ratings in this period" />

                <AppText style={{ fontSize:11, fontWeight:'600', color:colors.textSlate500, textTransform:'uppercase', letterSpacing:1, marginBottom:10, marginTop:4 }}>Review Count</AppText>
                <InsightLineChart data={reviewCountData} title="Reviews Received" accent={colors.pink} icon="comment-text-outline"
                  formatValue={formatCount} emptyLabel="No reviews in this period" />

                <AppText style={{ fontSize:11, fontWeight:'600', color:colors.textSlate500, textTransform:'uppercase', letterSpacing:1, marginBottom:10, marginTop:4 }}>Engagement</AppText>
                <View style={{ flexDirection:'row', gap:12, marginBottom:16 }}>
                  {[
                    { label:'Searches', value: engagementPoints.reduce((s,p)=>s+p.searches,0), accent:colors.orange, icon:'magnify' as const },
                    { label:'Reviews',  value: engagementPoints.reduce((s,p)=>s+p.reviews,0),  accent:colors.pink,   icon:'star' as const },
                    { label:'Visits',   value: engagementPoints.reduce((s,p)=>s+p.visits,0),   accent:colors.cyan,   icon:'eye' as const },
                  ].map(({ label, value, accent, icon }) => (
                    <View key={label} style={{ flex:1, backgroundColor:colors.cardDark, borderRadius:12, padding:12, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.05)', overflow:'hidden' }}>
                      <View style={{ position:'absolute',bottom:0,left:0,right:0,height:2,backgroundColor:`${accent}80` }} />
                      <View style={{ width:32,height:32,borderRadius:16,backgroundColor:`${accent}1A`,borderWidth:1,borderColor:`${accent}33`,justifyContent:'center',alignItems:'center',marginBottom:8 }}>
                        <MaterialCommunityIcons name={icon} size={16} color={accent} />
                      </View>
                      <AppText style={{ fontSize:10,fontWeight:'500',color:colors.textSlate400,textAlign:'center' }}>{label}</AppText>
                      <AppText style={{ fontSize:14,fontWeight:'700',color:colors.white,marginTop:4 }}>{formatCount(value)}</AppText>
                    </View>
                  ))}
                </View>
                <MetricChart points={engagementPoints} metricKey="visits"   accent={colors.cyan}   label="Visits"   icon="eye" />
                <MetricChart points={engagementPoints} metricKey="searches" accent={colors.orange} label="Searches" icon="magnify" />
                <MetricChart points={engagementPoints} metricKey="reviews"  accent={colors.pink}   label="Reviews"  icon="star" />
              </>
            )}
          </ScrollView>
        </>
      )}

      {/* ── PREMIUM TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'premium' && <PremiumInsightsTab />}
    </ScreenLayout>
  );
}
