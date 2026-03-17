import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { collection, getDocs, query, where, limit, Timestamp } from 'firebase/firestore';
import { firestore } from '@/core/firebase/firebaseConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { RangeCalendar } from '@/presentation/shared/components/ui/RangeCalendar';
import { colors } from '@/core/theme/colors';
import { useBusinessOwnerStore } from '../store/businessOwnerStore';
import { rangeForInsightMode, type InsightFilterMode, type InsightDateRange } from '../hooks/useBusinessInsights';
import type { MenuItemStat } from '../hooks/usePremiumInsights';

const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
type SortKey = 'clicks' | 'name' | 'category';

const FILTERS: { key: InsightFilterMode; label: string }[] = [
  {key:'ALL',label:'All'},{key:'WEEK',label:'Week'},{key:'MONTH',label:'Month'},{key:'YEAR',label:'Year'},
];

export default function TopMenuItemsScreen() {
  const business = useBusinessOwnerStore(s => s.business);
  const [mode,   setMode]   = useState<InsightFilterMode>('ALL');
  const [cRange, setCRange] = useState<InsightDateRange>({ start: new Date(), end: new Date() });
  const [showCal,setShowCal]= useState(false);
  const [sortKey,setSortKey]= useState<SortKey>('clicks');
  const [items,  setItems]  = useState<MenuItemStat[]>([]);
  const [loading,setLoading]= useState(false);

  const activeRange = rangeForInsightMode(mode, cRange);

  const load = useCallback(async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const startTs = Timestamp.fromDate(activeRange.start);
      const endTs   = Timestamp.fromDate(new Date(activeRange.end.getTime() + 86400000));

      const q = mode === 'ALL'
        ? query(collection(firestore,'menu_item_click_events'), where('business_id','==',business.id), limit(500))
        : query(collection(firestore,'menu_item_click_events'), where('business_id','==',business.id), where('created_at','>=',startTs), where('created_at','<',endTs));

      const snap = await getDocs(q);
      const itemMap = new Map<string,{name:string;cat:string;count:number}>();
      snap.forEach(d => {
        const id   = d.data()['item_id']       as string|undefined;
        const name = d.data()['item_name']     as string|undefined;
        const cat  = d.data()['category_name'] as string|undefined;
        if (!id || !name) return;
        const p = itemMap.get(id) ?? { name, cat: cat??'', count:0 };
        itemMap.set(id, { ...p, count: p.count+1 });
      });
      setItems(Array.from(itemMap.entries()).map(([itemId,s])=>({itemId,itemName:s.name,categoryName:s.cat,clicks:s.count})));
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, [business?.id, activeRange, mode]);

  useEffect(() => { load(); }, [load]);

  const sorted = [...items].sort((a, b) => {
    if (sortKey === 'name')     return a.itemName.localeCompare(b.itemName);
    if (sortKey === 'category') return a.categoryName.localeCompare(b.categoryName);
    return b.clicks - a.clicks;
  });

  const maxClicks = Math.max(...sorted.map(i => i.clicks), 1);

  const SORTS: { key: SortKey; label: string }[] = [
    { key:'clicks',   label:'Most Clicked' },
    { key:'name',     label:'Name' },
    { key:'category', label:'Category' },
  ];

  return (
    <ScreenLayout>
      {showCal && (
        <RangeCalendar initial={cRange} onConfirm={r=>{setCRange(r);setMode('CUSTOM');setShowCal(false);}} onClose={()=>setShowCal(false)} />
      )}

      {/* Header */}
      <View style={{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingTop:12, paddingBottom:8 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back"
          style={{ width:36,height:36,borderRadius:10,backgroundColor:colors.cardDark,borderWidth:1,borderColor:colors.borderDark,justifyContent:'center',alignItems:'center' }}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={colors.white} />
        </Pressable>
        <View>
          <AppText style={{ fontSize:17,fontWeight:'700',color:colors.white }}>Top Services</AppText>
          {business && <AppText style={{ fontSize:12,color:colors.textSlate400 }}>{business.name}</AppText>}
        </View>
      </View>

      {/* Date filter */}
      <View style={{ paddingHorizontal:16, marginBottom:8 }}>
        <View style={{ flexDirection:'row', gap:6, marginBottom:4 }}>
          {FILTERS.map(f => (
            <Pressable key={f.key} onPress={() => setMode(f.key)} accessibilityRole="button" accessibilityLabel={f.label}
              style={{ flex:1,paddingVertical:8,borderRadius:9999,alignItems:'center',backgroundColor:mode===f.key?colors.emerald:colors.cardDark,borderWidth:1,borderColor:mode===f.key?colors.emerald:colors.borderDark }}>
              <AppText style={{ fontSize:11,fontWeight:mode===f.key?'700':'500',color:mode===f.key?colors.midnight:colors.textSlate400 }}>{f.label}</AppText>
            </Pressable>
          ))}
          <Pressable onPress={() => setShowCal(true)} accessibilityRole="button" accessibilityLabel="Custom date range"
            style={{ paddingHorizontal:12,paddingVertical:8,borderRadius:9999,justifyContent:'center',backgroundColor:mode==='CUSTOM'?colors.emerald:colors.cardDark,borderWidth:1,borderColor:mode==='CUSTOM'?colors.emerald:colors.borderDark }}>
            <MaterialCommunityIcons name="calendar-month" size={16} color={mode==='CUSTOM'?colors.midnight:colors.textSlate400} />
          </Pressable>
        </View>
        <AppText style={{ fontSize:10,color:colors.textSlate500 }}>
          {`${activeRange.start.getDate()} ${MON[activeRange.start.getMonth()]} – ${activeRange.end.getDate()} ${MON[activeRange.end.getMonth()]} ${activeRange.end.getFullYear()}`}
        </AppText>
      </View>

      {/* Sort pills */}
      <View style={{ flexDirection:'row', paddingHorizontal:16, gap:8, marginBottom:12, alignItems:'center' }}>
        <AppText style={{ fontSize:12,color:colors.textSlate500 }}>Sort:</AppText>
        {SORTS.map(s => (
          <Pressable key={s.key} onPress={() => setSortKey(s.key)} accessibilityRole="button" accessibilityLabel={s.label}
            style={{ paddingHorizontal:12,paddingVertical:6,borderRadius:9999,backgroundColor:sortKey===s.key?colors.emerald:colors.cardDark,borderWidth:1,borderColor:sortKey===s.key?colors.emerald:colors.borderDark }}>
            <AppText style={{ fontSize:11,fontWeight:sortKey===s.key?'700':'500',color:sortKey===s.key?colors.midnight:colors.textSlate400 }}>{s.label}</AppText>
          </Pressable>
        ))}
      </View>

      {loading && <ActivityIndicator size="large" color={colors.emerald} style={{ marginTop:60 }} />}

      {!loading && sorted.length === 0 && (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center', gap:12 }}>
          <MaterialCommunityIcons name="food-off" size={48} color={colors.textSlate600} />
          <AppText style={{ fontSize:15,color:colors.textSlate400 }}>No service interaction data yet</AppText>
          <AppText style={{ fontSize:13,color:colors.textSlate500,textAlign:'center',paddingHorizontal:40 }}>
            Clicks on your menu items will appear here.
          </AppText>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:16, paddingBottom:100 }}>
        {sorted.length > 0 && (
          <AppText style={{ fontSize:12,color:colors.textSlate500,marginBottom:10 }}>
            {sorted.length} item{sorted.length!==1?'s':''}
          </AppText>
        )}
        {sorted.map((item, i) => (
          <View key={item.itemId} style={{ backgroundColor:colors.cardDark,borderRadius:12,padding:14,marginBottom:8,borderWidth:1,borderColor:colors.borderDark }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:8 }}>
              <View style={{ width:28,height:28,borderRadius:14,backgroundColor:`${colors.emerald}22`,justifyContent:'center',alignItems:'center' }}>
                <AppText style={{ fontSize:11,fontWeight:'700',color:colors.emerald }}>#{i+1}</AppText>
              </View>
              <View style={{ flex:1 }}>
                <AppText style={{ fontSize:13,fontWeight:'600',color:colors.white }}>{item.itemName}</AppText>
                {item.categoryName ? (
                  <AppText style={{ fontSize:10,color:colors.textSlate500 }}>{item.categoryName}</AppText>
                ) : null}
              </View>
              <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
                <MaterialCommunityIcons name="cursor-default-click" size={14} color={colors.emerald} />
                <AppText style={{ fontSize:15,fontWeight:'800',color:colors.emerald }}>{item.clicks}</AppText>
              </View>
            </View>
            {/* Progress bar */}
            <View style={{ height:4, backgroundColor:colors.borderDark, borderRadius:2, overflow:'hidden' }}>
              <View style={{ height:'100%', width:`${Math.round((item.clicks/maxClicks)*100)}%`, backgroundColor:colors.emerald, borderRadius:2 }} />
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenLayout>
  );
}
