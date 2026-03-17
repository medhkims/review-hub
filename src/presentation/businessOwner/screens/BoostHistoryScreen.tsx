import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { firestore } from '@/core/firebase/firebaseConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { colors } from '@/core/theme/colors';
import { useBusinessOwnerStore } from '../store/businessOwnerStore';
import type { BoostRecord } from '../hooks/usePremiumInsights';

const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
type SortKey = 'date' | 'impressions' | 'clicks';

function fmt(d: Date): string { return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; }

export default function BoostHistoryScreen() {
  const business = useBusinessOwnerStore(s => s.business);
  const [boosts, setBoosts]     = useState<BoostRecord[]>([]);
  const [loading, setLoading]   = useState(false);
  const [sortKey, setSortKey]   = useState<SortKey>('date');

  const load = useCallback(async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(
        collection(firestore, 'boosts'),
        where('business_id', '==', business.id),
        orderBy('created_at', 'desc'),
        limit(200),
      ));
      const now = new Date();
      setBoosts(snap.docs.map(d => {
        const data = d.data();
        const createdAt  = (data['created_at'] as Timestamp)?.toDate() ?? new Date();
        const expiresAt  = (data['expires_at'] as Timestamp)?.toDate() ?? new Date();
        return {
          id: d.id, createdAt, expiresAt,
          status:      expiresAt > now ? 'active' : 'expired',
          impressions: (data['impression_count'] as number) ?? 0,
          clicks:      (data['click_count']      as number) ?? 0,
          label:       (data['label']            as string) ?? `Boost #${d.id.slice(-4)}`,
        };
      }));
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, [business?.id]);

  useEffect(() => { load(); }, [load]);

  const sorted = [...boosts].sort((a, b) => {
    if (sortKey === 'impressions') return b.impressions - a.impressions;
    if (sortKey === 'clicks')      return b.clicks - a.clicks;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const SORTS: { key: SortKey; label: string }[] = [
    { key: 'date',        label: 'Date' },
    { key: 'impressions', label: 'Shown in Search' },
    { key: 'clicks',      label: 'Boost Clicks' },
  ];

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingTop:12, paddingBottom:12 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back"
          style={{ width:36,height:36,borderRadius:10,backgroundColor:colors.cardDark,borderWidth:1,borderColor:colors.borderDark,justifyContent:'center',alignItems:'center' }}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={colors.white} />
        </Pressable>
        <View>
          <AppText style={{ fontSize:17,fontWeight:'700',color:colors.white }}>Boost History</AppText>
          {business && <AppText style={{ fontSize:12,color:colors.textSlate400 }}>{business.name}</AppText>}
        </View>
      </View>

      {/* Sort pills */}
      <View style={{ flexDirection:'row', paddingHorizontal:16, gap:8, marginBottom:12 }}>
        <AppText style={{ fontSize:12,color:colors.textSlate500,alignSelf:'center' }}>Sort by:</AppText>
        {SORTS.map(s => (
          <Pressable key={s.key} onPress={() => setSortKey(s.key)} accessibilityRole="button" accessibilityLabel={s.label}
            style={{ paddingHorizontal:12,paddingVertical:6,borderRadius:9999,backgroundColor:sortKey===s.key?colors.yellow:colors.cardDark,borderWidth:1,borderColor:sortKey===s.key?colors.yellow:colors.borderDark }}>
            <AppText style={{ fontSize:11,fontWeight:sortKey===s.key?'700':'500',color:sortKey===s.key?colors.midnight:colors.textSlate400 }}>{s.label}</AppText>
          </Pressable>
        ))}
      </View>

      {loading && <ActivityIndicator size="large" color={colors.yellow} style={{ marginTop:60 }} />}

      {!loading && sorted.length === 0 && (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center', gap:12 }}>
          <MaterialCommunityIcons name="rocket-launch-outline" size={48} color={colors.textSlate600} />
          <AppText style={{ fontSize:15,color:colors.textSlate400 }}>No boosts yet</AppText>
          <AppText style={{ fontSize:13,color:colors.textSlate500,textAlign:'center',paddingHorizontal:40 }}>
            Boost your business to appear at the top of search results.
          </AppText>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:16, paddingBottom:100 }}>
        <AppText style={{ fontSize:12,color:colors.textSlate500,marginBottom:10 }}>{sorted.length} boost{sorted.length!==1?'s':''}</AppText>
        {sorted.map(boost => (
          <View key={boost.id} style={{ backgroundColor:colors.cardDark,borderRadius:14,padding:16,marginBottom:10,borderWidth:1,borderColor:boost.status==='active'?`${colors.yellow}44`:colors.borderDark }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <View>
                <AppText style={{ fontSize:14,fontWeight:'700',color:colors.white }}>{boost.label}</AppText>
                <AppText style={{ fontSize:11,color:colors.textSlate500,marginTop:2 }}>
                  {fmt(boost.createdAt)} → {fmt(boost.expiresAt)}
                </AppText>
              </View>
              <View style={{ paddingHorizontal:10,paddingVertical:3,borderRadius:9999,backgroundColor:boost.status==='active'?`${colors.yellow}22`:colors.borderDark }}>
                <AppText style={{ fontSize:11,fontWeight:'600',color:boost.status==='active'?colors.yellow:colors.textSlate400 }}>
                  {boost.status==='active'?'Active':'Expired'}
                </AppText>
              </View>
            </View>

            <View style={{ flexDirection:'row', gap:16 }}>
              <View style={{ flex:1,backgroundColor:colors.midnight,borderRadius:10,padding:12,alignItems:'center',gap:2,borderWidth:1,borderColor:`${colors.cyan}22` }}>
                <MaterialCommunityIcons name="eye-outline" size={18} color={colors.cyan} />
                <AppText style={{ fontSize:18,fontWeight:'800',color:colors.white }}>{boost.impressions.toLocaleString()}</AppText>
                <AppText style={{ fontSize:10,color:colors.textSlate500 }}>Shown in Search</AppText>
              </View>
              <View style={{ flex:1,backgroundColor:colors.midnight,borderRadius:10,padding:12,alignItems:'center',gap:2,borderWidth:1,borderColor:`${colors.orange}22` }}>
                <MaterialCommunityIcons name="cursor-default-click-outline" size={18} color={colors.orange} />
                <AppText style={{ fontSize:18,fontWeight:'800',color:colors.white }}>{boost.clicks.toLocaleString()}</AppText>
                <AppText style={{ fontSize:10,color:colors.textSlate500 }}>Boost Clicks</AppText>
              </View>
              {boost.impressions > 0 && (
                <View style={{ flex:1,backgroundColor:colors.midnight,borderRadius:10,padding:12,alignItems:'center',gap:2,borderWidth:1,borderColor:`${colors.emerald}22` }}>
                  <MaterialCommunityIcons name="percent" size={18} color={colors.emerald} />
                  <AppText style={{ fontSize:18,fontWeight:'800',color:colors.white }}>
                    {Math.round((boost.clicks/boost.impressions)*100)}%
                  </AppText>
                  <AppText style={{ fontSize:10,color:colors.textSlate500 }}>CTR</AppText>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenLayout>
  );
}
