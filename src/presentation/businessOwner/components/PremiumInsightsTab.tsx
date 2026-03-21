import React from 'react';
import { View, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { RangeCalendar } from '@/presentation/shared/components/ui/RangeCalendar';
import { InsightLineChart } from './InsightLineChart';
import { DonutChart } from './DonutChart';
import { usePremiumInsights } from '../hooks/usePremiumInsights';
import type { InsightFilterMode, InsightDateRange, BoostRecord, MonthlyStat, AgeGroupStat, GenderStat } from '../hooks/usePremiumInsights';

const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FILTERS: { key: InsightFilterMode; label: string }[] = [
  {key:'ALL',label:'All'},{key:'WEEK',label:'Week'},{key:'MONTH',label:'Month'},{key:'YEAR',label:'Year'},
];

// ── Shared sub-components ──────────────────────────────────────────────────────
const SectionTitle: React.FC<{icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; accent?: string}> = ({ icon, label, accent = colors.neonPurple }) => (
  <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:12, marginTop:8 }}>
    <View style={{ width:28,height:28,borderRadius:7,backgroundColor:`${accent}1A`,borderWidth:1,borderColor:`${accent}33`,justifyContent:'center',alignItems:'center' }}>
      <MaterialCommunityIcons name={icon} size={14} color={accent} />
    </View>
    <AppText style={{ fontSize:11,fontWeight:'700',color:colors.textSlate500,textTransform:'uppercase',letterSpacing:1 }}>{label}</AppText>
  </View>
);

const FilterRow: React.FC<{ mode: InsightFilterMode; setMode:(m:InsightFilterMode)=>void; onCalendar:()=>void; range: InsightDateRange; accent?: string }> = ({ mode, setMode, onCalendar, range, accent = colors.neonPurple }) => (
  <View style={{ gap:4, marginBottom:8 }}>
    <View style={{ flexDirection:'row', gap:6 }}>
      {FILTERS.map(f => (
        <Pressable key={f.key} onPress={() => setMode(f.key)} accessibilityRole="button" accessibilityLabel={f.label}
          style={{ flex:1,paddingVertical:8,borderRadius:9999,alignItems:'center',backgroundColor:mode===f.key?accent:colors.cardDark,borderWidth:1,borderColor:mode===f.key?accent:colors.borderDark }}>
          <AppText style={{ fontSize:11,fontWeight:mode===f.key?'700':'500',color:mode===f.key?colors.white:colors.textSlate400 }}>{f.label}</AppText>
        </Pressable>
      ))}
      <Pressable onPress={onCalendar} accessibilityRole="button" accessibilityLabel="Custom date range"
        style={{ paddingHorizontal:12,paddingVertical:8,borderRadius:9999,justifyContent:'center',backgroundColor:mode==='CUSTOM'?accent:colors.cardDark,borderWidth:1,borderColor:mode==='CUSTOM'?accent:colors.borderDark }}>
        <MaterialCommunityIcons name="calendar-month" size={16} color={mode==='CUSTOM'?colors.white:colors.textSlate400} />
      </Pressable>
    </View>
    <AppText style={{ fontSize:10,color:colors.textSlate500 }}>
      {`${range.start.getDate()} ${MON[range.start.getMonth()]} – ${range.end.getDate()} ${MON[range.end.getMonth()]} ${range.end.getFullYear()}`}
    </AppText>
  </View>
);

const BoostHistoryCard: React.FC<{boost: BoostRecord}> = ({ boost }) => {
  const fmt = (d: Date) => `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
  return (
    <View style={{ backgroundColor:colors.midnight,borderRadius:10,padding:12,borderWidth:1,borderColor:boost.status==='active'?`${colors.yellow}44`:colors.borderDark,gap:4 }}>
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <AppText style={{ fontSize:12,fontWeight:'700',color:colors.white }}>{boost.label}</AppText>
        <View style={{ paddingHorizontal:8,paddingVertical:2,borderRadius:9999,backgroundColor:boost.status==='active'?`${colors.yellow}22`:colors.borderDark }}>
          <AppText style={{ fontSize:10,fontWeight:'600',color:boost.status==='active'?colors.yellow:colors.textSlate400 }}>{boost.status==='active'?'Active':'Expired'}</AppText>
        </View>
      </View>
      <AppText style={{ fontSize:10,color:colors.textSlate500 }}>{fmt(boost.createdAt)} → {fmt(boost.expiresAt)}</AppText>
      <View style={{ flexDirection:'row', gap:16, marginTop:4 }}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
          <MaterialCommunityIcons name="eye" size={12} color={colors.cyan} />
          <AppText style={{ fontSize:12,color:colors.white,fontWeight:'600' }}>{boost.impressions.toLocaleString()}</AppText>
          <AppText style={{ fontSize:10,color:colors.textSlate500 }}>shown</AppText>
        </View>
        <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
          <MaterialCommunityIcons name="cursor-default-click" size={12} color={colors.orange} />
          <AppText style={{ fontSize:12,color:colors.white,fontWeight:'600' }}>{boost.clicks.toLocaleString()}</AppText>
          <AppText style={{ fontSize:10,color:colors.textSlate500 }}>clicks</AppText>
        </View>
      </View>
    </View>
  );
};

// ── Gender pie chart helpers ───────────────────────────────────────────────────
function pieSlicePath(cx: number, cy: number, r: number, start: number, end: number): string {
  const span = end - start;
  if (span >= 2 * Math.PI - 0.001) {
    return `M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 1,1 ${cx - 0.001},${cy - r} Z`;
  }
  const sx = cx + r * Math.cos(start), sy = cy + r * Math.sin(start);
  const ex = cx + r * Math.cos(end),   ey = cy + r * Math.sin(end);
  return `M${cx},${cy} L${sx},${sy} A${r},${r} 0 ${span > Math.PI ? 1 : 0},1 ${ex},${ey} Z`;
}

const AgeDistributionCard: React.FC<{ data: AgeGroupStat[] }> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  return (
    <View style={{ gap: 10 }}>
      {data.map(item => (
        <View key={item.label} style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.white }}>{item.label}</AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AppText style={{ fontSize: 11, color: item.color, fontWeight: '700' }}>{item.percentage}%</AppText>
              <AppText style={{ fontSize: 10, color: colors.textSlate500 }}>({item.count})</AppText>
            </View>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.borderDark, overflow: 'hidden' }}>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: item.color, width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%`, opacity: 0.85 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

const GenderPieChart: React.FC<{ data: GenderStat[] }> = ({ data }) => {
  const SIZE = 120;
  const cx = SIZE / 2, cy = SIZE / 2, r = SIZE * 0.4, innerR = SIZE * 0.24;
  const total = data.reduce((s, d) => s + d.count, 0);
  let start = -Math.PI / 2;
  const segments = data.map(item => {
    const angle = total > 0 ? (item.count / total) * 2 * Math.PI : Math.PI;
    const seg = { ...item, startAngle: start, endAngle: start + angle };
    start += angle;
    return seg;
  });
  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <Svg width={SIZE} height={SIZE}>
        {segments.map((seg, i) => (
          <Path key={i} d={pieSlicePath(cx, cy, r, seg.startAngle, seg.endAngle)} fill={seg.color} opacity={0.9} />
        ))}
        <Circle cx={cx} cy={cy} r={innerR} fill={colors.cardDark} />
        <SvgText x={cx} y={cy - 4} fontSize="11" fontWeight="800" fill={colors.white} textAnchor="middle">{total}</SvgText>
        <SvgText x={cx} y={cy + 9} fontSize="8" fill={colors.textSlate400} textAnchor="middle">visitors</SvgText>
      </Svg>
      <View style={{ flexDirection: 'row', gap: 20 }}>
        {data.map(item => (
          <View key={item.label} style={{ alignItems: 'center', gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons
                name={item.label === 'Male' ? 'gender-male' : 'gender-female'}
                size={16}
                color={item.color}
              />
              <AppText style={{ fontSize: 13, fontWeight: '700', color: item.color }}>{item.percentage}%</AppText>
            </View>
            <AppText style={{ fontSize: 11, color: colors.textSlate400 }}>{item.label}</AppText>
            <AppText style={{ fontSize: 10, color: colors.textSlate500 }}>{item.count} visitors</AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

// ── Main tab ───────────────────────────────────────────────────────────────────
export const PremiumInsightsTab: React.FC = () => {
  const {
    keywords, subcatStats, kwLoading, subcatLoading,
    boostMode, setBoostMode, boostCRange, setBoostCRange, boostCal, setBoostCal, boostRange, boostPoints, boostHistory, boostLoading, activating, activeBoost, activateBoost,
    profileMode, setProfileMode, profileCRange, setProfileCRange, profileCal, setProfileCal, profileRange, profileGroups, profileLoading,
    menuItems, menuLoading,
    peakDays, sentimentStats, favCount,
    monthlyStats, monthlyLoading,
    ageStats, genderStats, demographicsLoading,
  } = usePremiumInsights();

  const displayedKeywords = keywords.slice(0, 3);

  const impData  = boostPoints.map(p => ({ label: p.label, value: p.impressions }));
  const clkData  = boostPoints.map(p => ({ label: p.label, value: p.clicks }));
  const peakMax  = Math.max(...peakDays.map(d => d.count), 1);

  const handleBoost = () => {
    if (activeBoost) { Alert.alert('Active Boost', 'You already have an active boost running.'); return; }
    Alert.alert('Boost Your Business', 'Your business will appear at the top of search results for 30 days.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Boost Now', onPress: activateBoost },
    ]);
  };

  return (
    <>
      {boostCal && (
        <RangeCalendar initial={boostCRange} onConfirm={r=>{setBoostCRange(r);setBoostMode('CUSTOM');setBoostCal(false);}} onClose={()=>setBoostCal(false)} />
      )}
      {profileCal && (
        <RangeCalendar initial={profileCRange} onConfirm={r=>{setProfileCRange(r);setProfileMode('CUSTOM');setProfileCal(false);}} onClose={()=>setProfileCal(false)} />
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:16, paddingBottom:120 }}>

        {/* ── Top Search Keywords ── */}
        <SectionTitle icon="magnify" label="Top Search Keywords" />
        {kwLoading && <ActivityIndicator color={colors.neonPurple} style={{ marginBottom:16 }} />}
        {!kwLoading && keywords.length === 0 && (
          <View style={{ backgroundColor:colors.cardDark,borderRadius:12,padding:20,alignItems:'center',marginBottom:16,borderWidth:1,borderColor:colors.borderDark }}>
            <AppText style={{ fontSize:13,color:colors.textSlate500 }}>No search keyword data yet</AppText>
          </View>
        )}
        {!kwLoading && displayedKeywords.map((kw, i) => (
          <View key={kw.keyword} style={{ backgroundColor:colors.cardDark,borderRadius:12,padding:12,marginBottom:8,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:colors.borderDark }}>
            <View style={{ width:28,height:28,borderRadius:14,backgroundColor:`${colors.neonPurple}22`,justifyContent:'center',alignItems:'center',marginRight:10 }}>
              <AppText style={{ fontSize:12,fontWeight:'700',color:colors.neonPurple }}>#{i+1}</AppText>
            </View>
            <AppText style={{ flex:1,fontSize:13,fontWeight:'600',color:colors.white }}>{kw.keyword}</AppText>
            <View style={{ alignItems:'flex-end', gap:2 }}>
              <AppText style={{ fontSize:11,color:colors.cyan }}>{kw.findCount} found</AppText>
              <AppText style={{ fontSize:11,color:colors.orange }}>{kw.openCount} opened</AppText>
            </View>
          </View>
        ))}
        {!kwLoading && keywords.length > 0 && (
          <Pressable
            onPress={() => router.push('/(main)/(insights)/search-keywords' as never)}
            accessibilityRole="button"
            accessibilityLabel="See all keyword details"
            style={{ flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,paddingVertical:10,borderRadius:10,borderWidth:1,borderColor:`${colors.neonPurple}55`,backgroundColor:`${colors.neonPurple}11`,marginBottom:16 }}
          >
            <MaterialCommunityIcons name="chart-bar" size={14} color={colors.neonPurple} />
            <AppText style={{ fontSize:12,color:colors.neonPurple,fontWeight:'600' }}>See More Details</AppText>
          </Pressable>
        )}

        {/* ── Subcategory Discovery ── */}
        <SectionTitle icon="chart-pie" label="Discovery by Subcategory" accent={colors.cyan} />
        {subcatLoading && <ActivityIndicator color={colors.cyan} style={{ marginBottom:16 }} />}
        {!subcatLoading && subcatStats.length === 0 && (
          <View style={{ backgroundColor:colors.cardDark,borderRadius:12,padding:20,alignItems:'center',marginBottom:16,borderWidth:1,borderColor:colors.borderDark }}>
            <AppText style={{ fontSize:13,color:colors.textSlate500,textAlign:'center' }}>
              No subcategory discovery data yet.{'\n'}Data is tracked when users browse your subcategory.
            </AppText>
          </View>
        )}
        {!subcatLoading && subcatStats.length > 0 && (
          <View style={{ backgroundColor:colors.cardDark,borderRadius:14,padding:16,marginBottom:16,borderWidth:1,borderColor:colors.borderDark }}>
            <DonutChart data={subcatStats} />
          </View>
        )}

        {/* ── Boost Section ── */}
        <SectionTitle icon="rocket-launch" label="Boost Your Business" accent={colors.yellow} />
        <FilterRow mode={boostMode} setMode={setBoostMode} onCalendar={()=>setBoostCal(true)} range={boostRange} />

        <Pressable onPress={handleBoost} disabled={activating} accessibilityRole="button" accessibilityLabel="Boost your business"
          style={{ flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingVertical:14,borderRadius:12,backgroundColor:activeBoost?`${colors.yellow}22`:colors.yellow,borderWidth:1,borderColor:colors.yellow,marginBottom:12 }}>
          {activating ? <ActivityIndicator size="small" color={colors.midnight} /> : <MaterialCommunityIcons name="rocket-launch" size={18} color={activeBoost?colors.yellow:colors.midnight} />}
          <AppText style={{ fontSize:13,fontWeight:'700',color:activeBoost?colors.yellow:colors.midnight }}>{activating?'Boosting…':activeBoost?'Active Boost ✓':'Boost Now'}</AppText>
        </Pressable>

        {boostLoading && <ActivityIndicator color={colors.yellow} style={{ marginBottom:16 }} />}
        {!boostLoading && (
          <>
            <InsightLineChart data={impData} title="Search Impressions" accent={colors.cyan} icon="eye" formatValue={v=>String(v)} emptyLabel="No impressions in this period" />
            <InsightLineChart data={clkData} title="Boost Clicks" accent={colors.orange} icon="cursor-default-click" formatValue={v=>String(v)} emptyLabel="No clicks in this period" />
          </>
        )}

        {/* ── Boost History ── */}
        <SectionTitle icon="history" label="Boost History" accent={colors.yellow} />
        {boostHistory.length === 0 && (
          <View style={{ backgroundColor:colors.cardDark,borderRadius:12,padding:20,alignItems:'center',marginBottom:16,borderWidth:1,borderColor:colors.borderDark }}>
            <AppText style={{ fontSize:13,color:colors.textSlate500 }}>No boost history yet</AppText>
          </View>
        )}
        <View style={{ gap:8, marginBottom:boostHistory.length>3?4:16 }}>
          {boostHistory.slice(0,3).map(b => <BoostHistoryCard key={b.id} boost={b} />)}
        </View>
        {boostHistory.length > 3 && (
          <Pressable onPress={() => router.push('/(main)/(insights)/boost-history' as never)} accessibilityRole="button" accessibilityLabel="See all boosts"
            style={{ alignItems:'center',paddingVertical:10,borderRadius:10,borderWidth:1,borderColor:colors.borderDark,marginBottom:16 }}>
            <AppText style={{ fontSize:12,color:colors.yellow,fontWeight:'600' }}>See All Boost History</AppText>
          </Pressable>
        )}

        {/* ── Profile Interactions ── */}
        <SectionTitle icon="cursor-default-click-outline" label="Profile Interactions" accent={colors.pink} />
        <FilterRow mode={profileMode} setMode={setProfileMode} onCalendar={()=>setProfileCal(true)} range={profileRange} />
        {profileLoading && <ActivityIndicator color={colors.pink} style={{ marginBottom:16 }} />}
        {!profileLoading && profileGroups.length === 0 && (
          <View style={{ backgroundColor:colors.cardDark,borderRadius:12,padding:20,alignItems:'center',marginBottom:16,borderWidth:1,borderColor:colors.borderDark }}>
            <AppText style={{ fontSize:13,color:colors.textSlate500 }}>No interaction data yet</AppText>
          </View>
        )}
        {!profileLoading && profileGroups.map(group => (
          <View key={group.groupKey} style={{ backgroundColor:colors.cardDark,borderRadius:12,padding:12,marginBottom:8,borderWidth:1,borderColor:colors.borderDark }}>
            <View style={{ flexDirection:'row',alignItems:'center',gap:6,marginBottom:8 }}>
              <MaterialCommunityIcons name={group.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={14} color={colors.pink} />
              <AppText style={{ fontSize:12,fontWeight:'700',color:colors.white }}>{group.groupLabel}</AppText>
              <View style={{ flex:1 }} />
              <AppText style={{ fontSize:12,fontWeight:'700',color:colors.pink }}>{group.total}</AppText>
            </View>
            {group.items.map(item => (
              <View key={item.type} style={{ flexDirection:'row',justifyContent:'space-between',paddingVertical:4,borderTopWidth:1,borderTopColor:colors.borderDark }}>
                <AppText style={{ fontSize:12,color:colors.textSlate400 }}>{item.label}</AppText>
                <AppText style={{ fontSize:12,fontWeight:'600',color:colors.white }}>{item.count}</AppText>
              </View>
            ))}
          </View>
        ))}

        {/* ── Top Menu Items ── */}
        <SectionTitle icon="food" label="Top Services" accent={colors.emerald} />
        {menuLoading && <ActivityIndicator color={colors.emerald} style={{ marginBottom:16 }} />}
        {!menuLoading && menuItems.length === 0 && (
          <View style={{ backgroundColor:colors.cardDark,borderRadius:12,padding:20,alignItems:'center',marginBottom:16,borderWidth:1,borderColor:colors.borderDark }}>
            <AppText style={{ fontSize:13,color:colors.textSlate500 }}>No menu item interaction data yet</AppText>
          </View>
        )}
        {!menuLoading && menuItems.slice(0,3).map((item,i) => (
          <View key={item.itemId} style={{ backgroundColor:colors.cardDark,borderRadius:12,padding:12,marginBottom:8,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:colors.borderDark }}>
            <View style={{ width:24,height:24,borderRadius:12,backgroundColor:`${colors.emerald}22`,justifyContent:'center',alignItems:'center',marginRight:10 }}>
              <AppText style={{ fontSize:11,fontWeight:'700',color:colors.emerald }}>#{i+1}</AppText>
            </View>
            <View style={{ flex:1 }}>
              <AppText style={{ fontSize:13,fontWeight:'600',color:colors.white }}>{item.itemName}</AppText>
              {item.categoryName ? <AppText style={{ fontSize:10,color:colors.textSlate500 }}>{item.categoryName}</AppText> : null}
            </View>
            <View style={{ flexDirection:'row',alignItems:'center',gap:4 }}>
              <MaterialCommunityIcons name="cursor-default-click" size={13} color={colors.emerald} />
              <AppText style={{ fontSize:13,fontWeight:'700',color:colors.emerald }}>{item.clicks}</AppText>
            </View>
          </View>
        ))}
        {!menuLoading && menuItems.length > 3 && (
          <Pressable onPress={() => router.push('/(main)/(insights)/top-menu-items' as never)} accessibilityRole="button" accessibilityLabel="See all menu items"
            style={{ alignItems:'center',paddingVertical:10,borderRadius:10,borderWidth:1,borderColor:colors.borderDark,marginBottom:16 }}>
            <AppText style={{ fontSize:12,color:colors.emerald,fontWeight:'600' }}>See All Services</AppText>
          </Pressable>
        )}

        {/* ── Peak Days ── */}
        <SectionTitle icon="calendar-week" label="Peak Days" accent={colors.blue} />
        <View style={{ backgroundColor:colors.cardDark,borderRadius:14,padding:16,marginBottom:16,borderWidth:1,borderColor:colors.borderDark }}>
          <View style={{ flexDirection:'row', alignItems:'flex-end', height:72, gap:6 }}>
            {peakDays.map(d => {
              const barH = Math.max(4,(d.count/Math.max(...peakDays.map(p=>p.count),1))*64);
              return (
                <View key={d.dayIndex} style={{ flex:1, alignItems:'center', gap:4 }}>
                  <View style={{ width:'100%',height:barH,borderRadius:3,backgroundColor:`${colors.blue}88` }} />
                  <AppText style={{ fontSize:9,color:colors.textSlate500 }}>{d.day}</AppText>
                </View>
              );
            })}
          </View>
          <AppText style={{ fontSize:11,color:colors.textSlate400,marginTop:8 }}>Based on review activity by day of week</AppText>
        </View>

        {/* ── Visitor Demographics ── */}
        <SectionTitle icon="account-group" label="Visitor Demographics" accent={colors.indigo} />
        {demographicsLoading && <ActivityIndicator color={colors.indigo} style={{ marginBottom: 16 }} />}
        {!demographicsLoading && ageStats.length === 0 && genderStats.length === 0 && (
          <View style={{ backgroundColor: colors.cardDark, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: colors.borderDark }}>
            <AppText style={{ fontSize: 13, color: colors.textSlate500 }}>No visitor data yet</AppText>
          </View>
        )}
        {!demographicsLoading && (ageStats.length > 0 || genderStats.length > 0) && (
          <View style={{ backgroundColor: colors.cardDark, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.borderDark, gap: 20 }}>
            {/* Age distribution */}
            {ageStats.length > 0 && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <MaterialCommunityIcons name="chart-bar" size={13} color={colors.indigo} />
                  <AppText style={{ fontSize: 11, fontWeight: '700', color: colors.textSlate400, textTransform: 'uppercase', letterSpacing: 0.8 }}>Age Distribution</AppText>
                </View>
                <AgeDistributionCard data={ageStats} />
              </View>
            )}
            {/* Divider */}
            {ageStats.length > 0 && genderStats.length > 0 && (
              <View style={{ height: 1, backgroundColor: colors.borderDark }} />
            )}
            {/* Gender distribution */}
            {genderStats.length > 0 && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <MaterialCommunityIcons name="gender-male-female" size={13} color={colors.indigo} />
                  <AppText style={{ fontSize: 11, fontWeight: '700', color: colors.textSlate400, textTransform: 'uppercase', letterSpacing: 0.8 }}>Gender Distribution</AppText>
                </View>
                <GenderPieChart data={genderStats} />
              </View>
            )}
          </View>
        )}

        {/* ── Wishlist & Sentiment ── */}
        <SectionTitle icon="heart" label="Wishlist & Reviews" accent={colors.pink} />
        <View style={{ flexDirection:'row', gap:10, marginBottom:16 }}>
          <View style={{ flex:1,backgroundColor:colors.cardDark,borderRadius:12,padding:14,alignItems:'center',borderWidth:1,borderColor:`${colors.pink}33` }}>
            <MaterialCommunityIcons name="heart" size={22} color={colors.pink} />
            <AppText style={{ fontSize:22,fontWeight:'800',color:colors.white,marginTop:4 }}>{favCount.toLocaleString()}</AppText>
            <AppText style={{ fontSize:11,color:colors.textSlate400 }}>Wishlist Saves</AppText>
          </View>
          <View style={{ flex:2,backgroundColor:colors.cardDark,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.borderDark,gap:6 }}>
            {sentimentStats.map(s => (
              <View key={s.label} style={{ flexDirection:'row',alignItems:'center',gap:6 }}>
                <View style={{ width:8,height:8,borderRadius:4,backgroundColor:s.color }} />
                <AppText style={{ flex:1,fontSize:10,color:colors.textSlate400 }}>{s.label}</AppText>
                <AppText style={{ fontSize:11,fontWeight:'700',color:colors.white }}>{s.percentage}%</AppText>
              </View>
            ))}
          </View>
        </View>

        {/* ── Review Reply Rate (TODO: implement when reply feature is built) ── */}
        <SectionTitle icon="reply" label="Review Reply Rate" accent={colors.cyan} />
        <View style={{ backgroundColor:colors.cardDark,borderRadius:12,padding:16,marginBottom:16,borderWidth:1,borderColor:`${colors.cyan}33`,alignItems:'center',gap:8 }}>
          <MaterialCommunityIcons name="tools" size={28} color={colors.cyan} style={{ opacity:0.5 }} />
          <AppText style={{ fontSize:13,fontWeight:'600',color:colors.textSlate400 }}>Coming Soon</AppText>
          <AppText style={{ fontSize:11,color:colors.textSlate500,textAlign:'center' }}>
            Track how often you reply to customer reviews. Requires the review reply feature to be enabled.
          </AppText>
        </View>

        {/* ── Monthly Summary ── */}
        <SectionTitle icon="calendar-month" label="Monthly Summary" accent={colors.neonPurple} />
        {monthlyLoading && <ActivityIndicator color={colors.neonPurple} style={{ marginBottom:16 }} />}
        {!monthlyLoading && monthlyStats.length > 0 && (
          <>
            <View style={{ backgroundColor:colors.cardDark,borderRadius:12,padding:12,marginBottom:8,borderWidth:1,borderColor:colors.borderDark }}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:10 }}>
                <AppText style={{ fontSize:11,fontWeight:'600',color:colors.textSlate500,textTransform:'uppercase',letterSpacing:0.5 }}>This Month</AppText>
                <AppText style={{ fontSize:11,color:colors.textSlate500 }}>vs Last Month</AppText>
              </View>
              {monthlyStats.map((s: MonthlyStat) => (
                <View key={s.label} style={{ flexDirection:'row',alignItems:'center',paddingVertical:8,borderTopWidth:1,borderTopColor:colors.borderDark }}>
                  <View style={{ width:28,height:28,borderRadius:7,backgroundColor:`${s.accent}1A`,borderWidth:1,borderColor:`${s.accent}33`,justifyContent:'center',alignItems:'center',marginRight:10 }}>
                    <MaterialCommunityIcons name={s.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={13} color={s.accent} />
                  </View>
                  <AppText style={{ flex:1,fontSize:13,color:colors.white }}>{s.label}</AppText>
                  <AppText style={{ fontSize:16,fontWeight:'800',color:colors.white,marginRight:10 }}>{s.thisMonth.toLocaleString()}</AppText>
                  <View style={{ flexDirection:'row',alignItems:'center',gap:2,minWidth:48,justifyContent:'flex-end' }}>
                    {s.deltaSign !== 'same' && (
                      <MaterialCommunityIcons
                        name={s.deltaSign==='up'?'trending-up':'trending-down'}
                        size={14}
                        color={s.deltaSign==='up'?colors.emerald:'#EF4444'}
                      />
                    )}
                    <AppText style={{ fontSize:11,fontWeight:'600',color:s.deltaSign==='up'?colors.emerald:s.deltaSign==='down'?'#EF4444':colors.textSlate500 }}>
                      {s.deltaSign==='same'?'—':`${s.deltaSign==='up'?'+':'−'}${s.delta}`}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
            <AppText style={{ fontSize:10,color:colors.textSlate500,marginBottom:16,textAlign:'center' }}>
              Wishlist Saves shows total all-time (historical data not tracked monthly)
            </AppText>
          </>
        )}

      </ScrollView>
    </>
  );
};
