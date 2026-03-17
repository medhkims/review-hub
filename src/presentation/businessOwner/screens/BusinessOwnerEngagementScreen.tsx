import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { collection, getDocs, query, where, Timestamp, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { firestore } from '@/core/firebase/firebaseConfig';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { RangeCalendar } from '@/presentation/shared/components/ui/RangeCalendar';
import { colors } from '@/core/theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBusinessOwnerStore } from '../store/businessOwnerStore';

type FilterMode = 'ALL' | 'DAY' | 'MONTH' | 'YEAR' | 'CUSTOM';
interface DateRange { start: Date; end: Date }
interface DataPoint { label: string; reviews: number; visits: number; searches: number }

const MON_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const APP_EPOCH = new Date(2024,0,1);

function startOfDay(d: Date): Date { return new Date(d.getFullYear(),d.getMonth(),d.getDate()); }
function isoDay(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function daysBetween(a: Date, b: Date): number { return Math.round((b.getTime()-a.getTime())/86400000); }
function shortDate(d: Date): string { return `${d.getDate()} ${MON_SHORT[d.getMonth()]} ${d.getFullYear()}`; }
function rangeLabel(r: DateRange): string { const s=shortDate(r.start),e=shortDate(r.end); return s===e?s:`${s}  →  ${e}`; }

function rangeForMode(mode: FilterMode, custom: DateRange): DateRange {
  const today = startOfDay(new Date());
  if (mode==='ALL')   return { start:APP_EPOCH, end:today };
  if (mode==='DAY')   return { start:today, end:today };
  if (mode==='MONTH') return { start:new Date(today.getFullYear(),today.getMonth(),1), end:new Date(today.getFullYear(),today.getMonth()+1,0) };
  if (mode==='YEAR')  return { start:new Date(today.getFullYear(),0,1), end:new Date(today.getFullYear(),11,31) };
  return custom;
}

function getGranularity(range: DateRange): 'summary'|'day'|'month'|'year' {
  const days = daysBetween(range.start,range.end)+1;
  if (days===1) return 'summary';
  if (days<=60) return 'day';
  if (days<=730) return 'month';
  return 'year';
}

function countByKey(dates: Date[], keyFn: (d:Date)=>string): Map<string,number> {
  const map = new Map<string,number>();
  dates.forEach(d=>{ const k=keyFn(d); map.set(k,(map.get(k)??0)+1); });
  return map;
}

function extractDates(snap: QuerySnapshot<DocumentData>): Date[] {
  const out: Date[] = [];
  snap.forEach(d=>{ const ts=d.data()['created_at'] as Timestamp|undefined; if(ts?.toDate) out.push(startOfDay(ts.toDate())); });
  return out;
}

async function fetchEngagement(businessId: string, range: DateRange): Promise<DataPoint[]> {
  const startTs = Timestamp.fromDate(range.start);
  const endTs   = Timestamp.fromDate(new Date(range.end.getTime()+86400000));
  const biz     = where('business_id','==',businessId);

  const [rev,vis,sea] = await Promise.all([
    getDocs(query(collection(firestore,'reviews'),      biz,where('created_at','>=',startTs),where('created_at','<',endTs))),
    getDocs(query(collection(firestore,'visit_events'), biz,where('created_at','>=',startTs),where('created_at','<',endTs))),
    getDocs(query(collection(firestore,'search_events'),biz,where('created_at','>=',startTs),where('created_at','<',endTs))),
  ]);

  const rDates=extractDates(rev), vDates=extractDates(vis), sDates=extractDates(sea);
  const gran = getGranularity(range);

  if (gran==='summary') return [{ label:isoDay(range.start),reviews:rDates.length,visits:vDates.length,searches:sDates.length }];

  if (gran==='day') {
    const days=daysBetween(range.start,range.end)+1;
    const rM=countByKey(rDates,isoDay),vM=countByKey(vDates,isoDay),sM=countByKey(sDates,isoDay);
    return Array.from({length:days},(_,i)=>{ const d=new Date(range.start.getTime()+i*86400000); const k=isoDay(d); return { label:`${d.getDate()}/${d.getMonth()+1}`,reviews:rM.get(k)??0,visits:vM.get(k)??0,searches:sM.get(k)??0 }; });
  }

  if (gran==='month') {
    const months: {yr:number;mo:number}[] = [];
    let cur=new Date(range.start.getFullYear(),range.start.getMonth(),1);
    while(cur<=range.end){ months.push({yr:cur.getFullYear(),mo:cur.getMonth()}); cur=new Date(cur.getFullYear(),cur.getMonth()+1,1); }
    const kFn=(d:Date)=>`${d.getFullYear()}-${d.getMonth()}`;
    const rM=countByKey(rDates,kFn),vM=countByKey(vDates,kFn),sM=countByKey(sDates,kFn);
    return months.map(({yr,mo})=>({ label:months.length>13?`${MON_SHORT[mo]}'${String(yr).slice(2)}`:MON_SHORT[mo],reviews:rM.get(`${yr}-${mo}`)??0,visits:vM.get(`${yr}-${mo}`)??0,searches:sM.get(`${yr}-${mo}`)??0 }));
  }

  const years: number[] = [];
  for(let y=range.start.getFullYear();y<=range.end.getFullYear();y++) years.push(y);
  const kFn=(d:Date)=>String(d.getFullYear());
  const rM=countByKey(rDates,kFn),vM=countByKey(vDates,kFn),sM=countByKey(sDates,kFn);
  return years.map(yr=>({ label:String(yr),reviews:rM.get(String(yr))??0,visits:vM.get(String(yr))??0,searches:sM.get(String(yr))??0 }));
}

// ── Bar chart ──────────────────────────────────────────────────────────────────
interface ChartProps { points: DataPoint[]; metricKey: keyof Omit<DataPoint,'label'>; accent: string; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
const MetricChart: React.FC<ChartProps> = ({ points,metricKey,accent,label,icon }) => {
  const values = points.map(p=>p[metricKey] as number);
  const maxVal  = Math.max(...values,1);
  const total   = values.reduce((s,v)=>s+v,0);
  const [selIdx,setSelIdx] = useState<number|null>(null);
  const selPt = selIdx!==null ? points[selIdx] : null;
  const prevLen = useRef(points.length);
  if (prevLen.current!==points.length){ prevLen.current=points.length; if(selIdx!==null) setSelIdx(null); }

  return (
    <View style={{ backgroundColor:colors.cardDark,borderRadius:14,padding:16,marginBottom:16,borderWidth:1,borderColor:'rgba(255,255,255,0.05)' }}>
      <View style={{ flexDirection:'row',alignItems:'center',gap:8,marginBottom:16 }}>
        <View style={{ width:32,height:32,borderRadius:8,backgroundColor:`${accent}1A`,borderWidth:1,borderColor:`${accent}33`,justifyContent:'center',alignItems:'center' }}>
          <MaterialCommunityIcons name={icon} size={16} color={accent} />
        </View>
        <View style={{ flex:1 }}>
          <AppText style={{ fontSize:13,fontWeight:'700',color:colors.white }}>{label}</AppText>
          <AppText style={{ fontSize:11,color:colors.textSlate400 }}>Total: {total.toLocaleString()}</AppText>
        </View>
        <AppText style={{ fontSize:22,fontWeight:'800',color:accent }}>{total.toLocaleString()}</AppText>
      </View>
      <View style={{ flexDirection:'row',alignItems:'flex-end',height:80,gap:points.length>20?2:4 }}>
        {points.map((p,i)=>{ const val=p[metricKey] as number; const barH=Math.max(4,(val/maxVal)*72); const isSel=selIdx===i; const isHigh=val===maxVal&&maxVal>0;
          return <Pressable key={i} style={{ flex:1,alignItems:'center',gap:3 }} onPress={()=>setSelIdx(isSel?null:i)} accessibilityRole="button" accessibilityLabel={`${p.label}: ${val}`}>
            <View style={{ width:'100%',height:barH,borderRadius:3,backgroundColor:isSel?accent:isHigh?accent:`${accent}55` }} />
            {points.length<=14 && <AppText style={{ fontSize:7,color:isSel?accent:colors.textSlate500,textAlign:'center' }} numberOfLines={1}>{p.label}</AppText>}
          </Pressable>;
        })}
      </View>
      {points.length>14 && <View style={{ flexDirection:'row',justifyContent:'space-between',marginTop:4 }}>
        <AppText style={{ fontSize:8,color:colors.textSlate500 }}>{points[0].label}</AppText>
        <AppText style={{ fontSize:8,color:colors.textSlate500 }}>{points[Math.floor(points.length/2)].label}</AppText>
        <AppText style={{ fontSize:8,color:colors.textSlate500 }}>{points[points.length-1].label}</AppText>
      </View>}
    </View>
  );
};

// ── Day summary ────────────────────────────────────────────────────────────────
const DaySummary: React.FC<{points:DataPoint[]}> = ({points}) => {
  const p = points[0]??{reviews:0,visits:0,searches:0};
  return <View style={{ gap:12 }}>{([{label:'Visits',value:p.visits,accent:colors.cyan,icon:'eye'},{label:'Searches',value:p.searches,accent:colors.orange,icon:'magnify'},{label:'Reviews',value:p.reviews,accent:colors.pink,icon:'star'}] as const).map(m=>(
    <View key={m.label} style={{ backgroundColor:colors.cardDark,borderRadius:14,padding:20,borderWidth:1,borderColor:'rgba(255,255,255,0.05)',flexDirection:'row',alignItems:'center',gap:16 }}>
      <View style={{ width:48,height:48,borderRadius:12,backgroundColor:`${m.accent}1A`,borderWidth:1,borderColor:`${m.accent}33`,justifyContent:'center',alignItems:'center' }}>
        <MaterialCommunityIcons name={m.icon} size={22} color={m.accent} />
      </View>
      <View style={{ flex:1 }}>
        <AppText style={{ fontSize:12,color:colors.textSlate400,marginBottom:4 }}>{m.label}</AppText>
        <AppText style={{ fontSize:28,fontWeight:'800',color:m.accent }}>{m.value.toLocaleString()}</AppText>
      </View>
    </View>
  ))}</View>;
};

// ── Filter pill ────────────────────────────────────────────────────────────────
interface PillProps { label:string; active:boolean; onPress:()=>void }
const FilterPill: React.FC<PillProps> = ({label,active,onPress}) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{selected:active}}
    style={{ flex:1,paddingVertical:10,borderRadius:9999,alignItems:'center',backgroundColor:active?colors.neonPurple:colors.cardDark,borderWidth:1,borderColor:active?colors.neonPurple:colors.borderDark }}>
    <AppText style={{ fontSize:12,fontWeight:active?'700':'500',color:active?colors.white:colors.textSlate400 }}>{label}</AppText>
  </Pressable>
);

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function BusinessOwnerEngagementScreen() {
  const business = useBusinessOwnerStore((s) => s.business);
  const today = useMemo(()=>startOfDay(new Date()),[]);
  const [mode,setMode]               = useState<FilterMode>('ALL');
  const [customRange,setCustomRange] = useState<DateRange>({start:today,end:today});
  const [showCal,setShowCal]         = useState(false);
  const [points,setPoints]           = useState<DataPoint[]>([]);
  const [loading,setLoading]         = useState(true);
  const [error,setError]             = useState<string|null>(null);

  const activeRange = useMemo(()=>rangeForMode(mode,customRange),[mode,customRange]);

  const loadData = useCallback(async(range:DateRange)=>{
    if (!business?.id) return;
    setLoading(true); setError(null);
    try { setPoints(await fetchEngagement(business.id,range)); }
    catch(e) { setError(e instanceof Error?e.message:'Failed to load data'); }
    finally { setLoading(false); }
  },[business?.id]);

  useEffect(()=>{ loadData(activeRange); },[loadData,activeRange]);

  const gran = getGranularity(activeRange);

  return (
    <ScreenLayout>
      {showCal && <RangeCalendar initial={mode==='CUSTOM'?customRange:activeRange} onConfirm={(r)=>{ setCustomRange(r); setMode('CUSTOM'); setShowCal(false); }} onClose={()=>setShowCal(false)} />}

      <View style={{ flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingTop:12,paddingBottom:12,gap:12 }}>
        <Pressable onPress={()=>router.back()} accessibilityRole="button" accessibilityLabel="Go back"
          style={{ padding:8,borderRadius:9999,backgroundColor:colors.cardDark }}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.white} />
        </Pressable>
        <AppText style={{ fontSize:18,fontWeight:'700',color:colors.white,flex:1 }}>My Business Stats</AppText>
      </View>

      <View style={{ flexDirection:'row',paddingHorizontal:16,gap:8,marginBottom:10 }}>
        {(['ALL','DAY','MONTH','YEAR'] as FilterMode[]).map(m=><FilterPill key={m} label={m==='ALL'?'All':m==='DAY'?'Day':m==='MONTH'?'Month':'Year'} active={mode===m} onPress={()=>setMode(m)} />)}
        <Pressable onPress={()=>setShowCal(true)} accessibilityRole="button" accessibilityLabel="Custom date range"
          style={{ paddingHorizontal:14,paddingVertical:10,borderRadius:9999,alignItems:'center',justifyContent:'center',backgroundColor:mode==='CUSTOM'?colors.neonPurple:colors.cardDark,borderWidth:1,borderColor:mode==='CUSTOM'?colors.neonPurple:colors.borderDark }}>
          <MaterialCommunityIcons name="calendar-month" size={18} color={mode==='CUSTOM'?colors.white:colors.textSlate400} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal:16,marginBottom:16 }}>
        <AppText style={{ fontSize:12,color:colors.textSlate400 }}>
          {'Showing: '}
          <AppText style={{ color:colors.neonPurple,fontWeight:'600' }}>{mode==='ALL'?'All time':rangeLabel(activeRange)}</AppText>
        </AppText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:16,paddingBottom:100 }}>
        {loading && <View style={{ alignItems:'center',paddingVertical:60 }}><ActivityIndicator size="large" color={colors.neonPurple} /></View>}
        {!loading && !!error && (
          <View style={{ alignItems:'center',paddingVertical:60,gap:12 }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={40} color={colors.red} />
            <AppText style={{ fontSize:14,color:colors.textSlate400,textAlign:'center' }}>{error}</AppText>
            <Pressable onPress={()=>loadData(activeRange)} accessibilityRole="button" accessibilityLabel="Retry"
              style={{ paddingHorizontal:24,paddingVertical:10,borderRadius:9999,backgroundColor:`${colors.neonPurple}1A`,borderWidth:1,borderColor:`${colors.neonPurple}33` }}>
              <AppText style={{ fontSize:13,fontWeight:'600',color:colors.neonPurple }}>Retry</AppText>
            </Pressable>
          </View>
        )}
        {!loading && !error && points.length>0 && (
          gran==='summary' ? <DaySummary points={points} /> : <>
            <MetricChart points={points} metricKey="visits"   accent={colors.cyan}   label="Visits"   icon="eye" />
            <MetricChart points={points} metricKey="searches" accent={colors.orange} label="Searches" icon="magnify" />
            <MetricChart points={points} metricKey="reviews"  accent={colors.pink}   label="Reviews"  icon="star" />
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
