import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  collection, getDocs, query, where, Timestamp,
  addDoc, serverTimestamp, orderBy, limit, getDoc, doc, documentId,
} from 'firebase/firestore';
import { firestore, auth } from '@/core/firebase/firebaseConfig';
import { useBusinessOwnerStore } from '../store/businessOwnerStore';
import { rangeForInsightMode, type InsightFilterMode, type InsightDateRange } from './useBusinessInsights';

export type { InsightFilterMode, InsightDateRange };

export interface KeywordStat    { keyword: string; findCount: number; openCount: number }
export interface SubcategoryStat{ subcategory: string; findCount: number; clickCount: number; count: number; percentage: number }
export interface BoostRecord    { id: string; createdAt: Date; expiresAt: Date; status: 'active'|'expired'; impressions: number; clicks: number; label: string }
export interface BoostTimePoint { label: string; impressions: number; clicks: number }
export interface ProfileClickItem { type: string; label: string; count: number }
export interface ProfileClickGroup { groupKey: string; groupLabel: string; icon: string; items: ProfileClickItem[]; total: number }
export interface MenuItemStat   { itemId: string; itemName: string; categoryName: string; clicks: number }
export interface PeakDayStat    { day: string; dayIndex: number; count: number }
export interface SentimentStat  { label: string; count: number; percentage: number; color: string }
export interface MonthlyStat    { label: string; thisMonth: number; lastMonth: number; delta: number; deltaSign: 'up'|'down'|'same'; icon: string; accent: string }
export interface AgeGroupStat   { label: string; count: number; percentage: number; color: string }
export interface GenderStat     { label: string; count: number; percentage: number; color: string }

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MON  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function sod(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function iso(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function span(a: Date, b: Date): number { return Math.round((b.getTime()-a.getTime())/86400000); }
function mkey(d: Date): string { return `${d.getFullYear()}-${d.getMonth()}`; }

function buildLabels(range: InsightDateRange): Array<{ key: string; label: string }> {
  const days = span(range.start, range.end) + 1;
  if (days <= 14) {
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(range.start.getTime() + i * 86400000);
      return { key: iso(d), label: `${d.getDate()}/${d.getMonth()+1}` };
    });
  }
  if (days <= 60) {
    const pts: Array<{ key: string; label: string }> = [];
    let ws = range.start;
    while (ws <= range.end) {
      pts.push({ key: iso(ws), label: `${ws.getDate()}/${ws.getMonth()+1}` });
      ws = new Date(ws.getTime() + 7 * 86400000);
    }
    return pts;
  }
  if (days <= 365) {
    const pts: Array<{ key: string; label: string }> = [];
    let cur = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
    while (cur <= range.end) { pts.push({ key: mkey(cur), label: MON[cur.getMonth()] }); cur = new Date(cur.getFullYear(), cur.getMonth()+1, 1); }
    return pts;
  }
  const pts: Array<{ key: string; label: string }> = [];
  for (let yr = range.start.getFullYear(); yr <= range.end.getFullYear(); yr++) pts.push({ key: String(yr), label: String(yr) });
  return pts;
}

function buckKey(d: Date, days: number): string {
  if (days <= 60) return iso(d);
  if (days <= 365) return mkey(d);
  return String(d.getFullYear());
}

function withRange(range: InsightDateRange) {
  return {
    startTs: Timestamp.fromDate(range.start),
    endTs:   Timestamp.fromDate(new Date(range.end.getTime() + 86400000)),
  };
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export const usePremiumInsights = () => {
  const today = useMemo(() => sod(new Date()), []);
  const business = useBusinessOwnerStore(s => s.business);
  const initRange = useMemo<InsightDateRange>(() => ({ start: today, end: today }), [today]);

  const [keywords,       setKeywords]       = useState<KeywordStat[]>([]);
  const [subcatStats,    setSubcatStats]     = useState<SubcategoryStat[]>([]);
  const [kwLoading,      setKwLoading]       = useState(false);
  const [subcatLoading,  setSubcatLoading]   = useState(false);

  const [boostMode,      setBoostMode]       = useState<InsightFilterMode>('WEEK');
  const [boostCRange,    setBoostCRange]     = useState<InsightDateRange>(initRange);
  const [boostCal,       setBoostCal]        = useState(false);
  const boostRange = useMemo(() => rangeForInsightMode(boostMode, boostCRange), [boostMode, boostCRange]);
  const [boostPoints,    setBoostPoints]     = useState<BoostTimePoint[]>([]);
  const [boostHistory,   setBoostHistory]    = useState<BoostRecord[]>([]);
  const [boostLoading,   setBoostLoading]    = useState(false);
  const [activating,     setActivating]      = useState(false);

  const [profileMode,    setProfileMode]     = useState<InsightFilterMode>('WEEK');
  const [profileCRange,  setProfileCRange]   = useState<InsightDateRange>(initRange);
  const [profileCal,     setProfileCal]      = useState(false);
  const profileRange = useMemo(() => rangeForInsightMode(profileMode, profileCRange), [profileMode, profileCRange]);
  const [profileGroups,  setProfileGroups]   = useState<ProfileClickGroup[]>([]);
  const [profileLoading, setProfileLoading]  = useState(false);

  const [menuItems,      setMenuItems]       = useState<MenuItemStat[]>([]);
  const [menuLoading,    setMenuLoading]     = useState(false);

  const [peakDays,       setPeakDays]        = useState<PeakDayStat[]>([]);
  const [sentimentStats, setSentimentStats]  = useState<SentimentStat[]>([]);
  const [favCount,       setFavCount]        = useState(0);

  const [monthlyStats,   setMonthlyStats]    = useState<MonthlyStat[]>([]);
  const [monthlyLoading, setMonthlyLoading]  = useState(false);

  const [ageStats,            setAgeStats]           = useState<AgeGroupStat[]>([]);
  const [genderStats,         setGenderStats]         = useState<GenderStat[]>([]);
  const [demographicsLoading, setDemographicsLoading] = useState(false);

  // ── Load keywords & subcategory stats ─────────────────────────────────────
  const loadKeywords = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    setKwLoading(true);
    try {
      const snap = await getDocs(query(collection(firestore,'keyword_events'), where('business_id','==',biz.id), limit(500)));
      const kwMap = new Map<string,{find:number;open:number}>();
      snap.forEach(d => {
        const kw = d.data()['keyword'] as string|undefined;
        if (kw) { const k = kw.toLowerCase().trim(); const p = kwMap.get(k)??{find:0,open:0}; const opened=!!d.data()['opened']; kwMap.set(k,{find:p.find+(opened?0:1),open:p.open+(opened?1:0)}); }
      });
      setKeywords(Array.from(kwMap.entries()).map(([keyword,s])=>({keyword,findCount:s.find,openCount:s.open})).sort((a,b)=>b.findCount-a.findCount));
    } catch { setKeywords([]); }
    finally { setKwLoading(false); }
  }, []);

  // ── Load subcategory stats from dedicated subcategory_events ───────────────
  const loadSubcategoryStats = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    setSubcatLoading(true);
    try {
      const [eventsSnap, bizDoc] = await Promise.all([
        getDocs(query(collection(firestore,'subcategory_events'), where('business_id','==',biz.id), limit(1000))),
        getDoc(doc(firestore,'businesses',biz.id)),
      ]);
      const subs = (bizDoc.data()?.['sub_categories'] as string[]|undefined)??[];
      if (subs.length <= 1) { setSubcatStats([]); return; }
      const subMap = new Map<string,{find:number;click:number}>();
      eventsSnap.forEach(d => {
        const sub = d.data()['subcategory'] as string|undefined;
        if (!sub) return;
        const opened = !!d.data()['opened'];
        const p = subMap.get(sub)??{find:0,click:0};
        subMap.set(sub,{find:p.find+(opened?0:1),click:p.click+(opened?1:0)});
      });
      const tot = Array.from(subMap.values()).reduce((s,v)=>s+v.find+v.click,0);
      // Build from events first (correct names + real counts)
      const statsFromEvents = Array.from(subMap.entries())
        .map(([sub,v]) => { const count=v.find+v.click; return {subcategory:sub,findCount:v.find,clickCount:v.click,count,percentage:tot>0?Math.round((count/tot)*100):0}; });
      // Append subs from business doc that never appeared in any event (case-insensitive dedup)
      const eventSubsLower = new Set(statsFromEvents.map(s=>s.subcategory.toLowerCase()));
      const zeroStats = subs
        .filter(sub=>!eventSubsLower.has(sub.toLowerCase()))
        .map(sub=>({subcategory:sub,findCount:0,clickCount:0,count:0,percentage:0}));
      setSubcatStats([...statsFromEvents,...zeroStats].sort((a,b)=>b.count-a.count));
    } catch { setSubcatStats([]); }
    finally { setSubcatLoading(false); }
  }, []);

  // ── Load boost data ────────────────────────────────────────────────────────
  const loadBoostData = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    setBoostLoading(true);
    try {
      const { startTs, endTs } = withRange(boostRange);
      const days = span(boostRange.start, boostRange.end)+1;
      const [impSnap, clkSnap, histSnap] = await Promise.all([
        getDocs(query(collection(firestore,'boost_search_events'), where('business_id','==',biz.id), where('created_at','>=',startTs), where('created_at','<',endTs))),
        getDocs(query(collection(firestore,'boost_click_events'),  where('business_id','==',biz.id), where('created_at','>=',startTs), where('created_at','<',endTs))),
        getDocs(query(collection(firestore,'boosts'), where('business_id','==',biz.id), orderBy('created_at','desc'), limit(50))),
      ]);
      const impDates: Date[] = []; impSnap.forEach(d => { const ts=d.data()['created_at'] as Timestamp|undefined; if(ts?.toDate) impDates.push(sod(ts.toDate())); });
      const clkDates: Date[] = []; clkSnap.forEach(d => { const ts=d.data()['created_at'] as Timestamp|undefined; if(ts?.toDate) clkDates.push(sod(ts.toDate())); });
      const labels = buildLabels(boostRange);
      setBoostPoints(labels.map(({key,label})=>({ label, impressions:impDates.filter(d=>buckKey(d,days)===key).length, clicks:clkDates.filter(d=>buckKey(d,days)===key).length })));
      const now = new Date();
      setBoostHistory(histSnap.docs.map(d=>{
        const data=d.data();
        const createdAt=(data['created_at'] as Timestamp)?.toDate()??new Date();
        const expiresAt=(data['expires_at'] as Timestamp)?.toDate()??new Date();
        return { id:d.id, createdAt, expiresAt, status:expiresAt>now?'active':'expired', impressions:(data['impression_count'] as number)??0, clicks:(data['click_count'] as number)??0, label:(data['label'] as string)??`Boost #${d.id.slice(-4)}` };
      }));
    } catch { setBoostPoints([]); }
    finally { setBoostLoading(false); }
  }, [boostRange]);

  // ── Load profile clicks ────────────────────────────────────────────────────
  const loadProfileClicks = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    setProfileLoading(true);
    try {
      const { startTs, endTs } = withRange(profileRange);
      const snap = await getDocs(query(collection(firestore,'profile_click_events'), where('business_id','==',biz.id), where('created_at','>=',startTs), where('created_at','<',endTs)));
      const tc = new Map<string,number>();
      snap.forEach(d => { const t=d.data()['button_type'] as string|undefined; if(t) tc.set(t,(tc.get(t)??0)+1); });
      const c = biz.contact;
      const groups: ProfileClickGroup[] = [
        { groupKey:'location', groupLabel:'Location',     icon:'map-marker',    items:[{type:'location',    label:'Directions', count:tc.get('location')??0}], total:tc.get('location')??0 },
        { groupKey:'contact',  groupLabel:'Contact',      icon:'phone',         items:[
            {type:'phone',   label:'Phone',     count:tc.get('phone')??0},
            {type:'email',   label:'Email',     count:tc.get('email')??0},
            {type:'website', label:'Website',   count:tc.get('website')??0},
          ].filter(i=>(i.type==='phone'&&!!c.phone)||(i.type==='email'&&!!c.email)||(i.type==='website'&&!!c.website)),
          total:(tc.get('phone')??0)+(tc.get('email')??0)+(tc.get('website')??0) },
        { groupKey:'social',   groupLabel:'Social Media', icon:'instagram',     items:[
            {type:'instagram',label:'Instagram',count:tc.get('instagram')??0},
            {type:'facebook', label:'Facebook', count:tc.get('facebook')??0},
            {type:'tiktok',   label:'TikTok',   count:tc.get('tiktok')??0},
          ].filter(i=>(i.type==='instagram'&&!!c.instagramHandle)||(i.type==='facebook'&&!!c.facebookName)||(i.type==='tiktok'&&!!c.tiktokHandle)),
          total:(tc.get('instagram')??0)+(tc.get('facebook')??0)+(tc.get('tiktok')??0) },
        { groupKey:'delivery', groupLabel:'Delivery',     icon:'truck-delivery', items:biz.deliveryServices.filter(ds=>ds.isActive).map(ds=>({type:`delivery_${ds.abbreviation}`,label:ds.name,count:tc.get(`delivery_${ds.abbreviation}`)??0})), total:biz.deliveryServices.filter(ds=>ds.isActive).reduce((s,ds)=>s+(tc.get(`delivery_${ds.abbreviation}`)??0),0) },
      ].filter(g=>g.items.length>0);
      setProfileGroups(groups);
    } catch { setProfileGroups([]); }
    finally { setProfileLoading(false); }
  }, [profileRange]);

  // ── Load menu items ────────────────────────────────────────────────────────
  const loadMenuItems = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    setMenuLoading(true);
    try {
      const snap = await getDocs(query(collection(firestore,'menu_item_click_events'), where('business_id','==',biz.id), limit(500)));
      const itemMap = new Map<string,{name:string;cat:string;count:number}>();
      snap.forEach(d => {
        const id=d.data()['item_id'] as string|undefined, name=d.data()['item_name'] as string|undefined, cat=d.data()['category_name'] as string|undefined;
        if(!id||!name) return;
        const p=itemMap.get(id)??{name,cat:cat??'',count:0};
        itemMap.set(id,{...p,count:p.count+1});
      });
      setMenuItems(Array.from(itemMap.entries()).map(([itemId,s])=>({itemId,itemName:s.name,categoryName:s.cat,clicks:s.count})).sort((a,b)=>b.clicks-a.clicks));
    } catch { setMenuItems([]); }
    finally { setMenuLoading(false); }
  }, []);

  // ── Load additional insights ───────────────────────────────────────────────
  const loadAdditional = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;

    // Run independently so a rules-denied favorites query never suppresses review sentiment
    const [revResult, favResult] = await Promise.allSettled([
      getDocs(query(collection(firestore,'reviews'), where('business_id','==',biz.id), limit(300))),
      getDocs(query(collection(firestore,'favorites'), where('business_id','==',biz.id))),
    ]);

    if (revResult.status === 'fulfilled') {
      const dayCounts = new Array<number>(7).fill(0);
      let five=0, good=0, bad=0;
      revResult.value.forEach(d => {
        const ts=d.data()['created_at'] as Timestamp|undefined;
        if(ts?.toDate) dayCounts[ts.toDate().getDay()]++;
        const r=d.data()['overall_rating'] as number|undefined;
        if(r!=null) { if(r>=5) five++; else if(r>=3) good++; else bad++; }
      });
      setPeakDays(DAYS.map((day,i)=>({day,dayIndex:i,count:dayCounts[i]})));
      const tot=five+good+bad;
      setSentimentStats([
        {label:'Excellent (5★)',count:five, percentage:tot>0?Math.round((five/tot)*100):0,color:'#22C55E'},
        {label:'Good (3-4★)',   count:good, percentage:tot>0?Math.round((good/tot)*100):0,color:'#EAB308'},
        {label:'Poor (1-2★)',   count:bad,  percentage:tot>0?Math.round((bad/tot)*100) :0,color:'#EF4444'},
      ]);
    }

    if (favResult.status === 'fulfilled') {
      setFavCount(favResult.value.size);
    }
  }, []);

  // ── Load monthly summary ───────────────────────────────────────────────────
  const loadMonthly = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    setMonthlyLoading(true);
    try {
      const now = new Date();
      const thisStart  = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisEnd    = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const lastStart  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastEnd    = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      const tsThisStart = Timestamp.fromDate(thisStart);
      const tsThisEnd   = Timestamp.fromDate(thisEnd);
      const tsLastStart = Timestamp.fromDate(lastStart);
      const tsLastEnd   = Timestamp.fromDate(lastEnd);

      const [revThis, revLast, kwThis, kwLast, clkThis, clkLast, favSnap] = await Promise.allSettled([
        getDocs(query(collection(firestore,'reviews'),              where('business_id','==',biz.id), where('created_at','>=',tsThisStart), where('created_at','<=',tsThisEnd))),
        getDocs(query(collection(firestore,'reviews'),              where('business_id','==',biz.id), where('created_at','>=',tsLastStart), where('created_at','<=',tsLastEnd))),
        getDocs(query(collection(firestore,'keyword_events'),       where('business_id','==',biz.id), where('created_at','>=',tsThisStart), where('created_at','<=',tsThisEnd), limit(1000))),
        getDocs(query(collection(firestore,'keyword_events'),       where('business_id','==',biz.id), where('created_at','>=',tsLastStart), where('created_at','<=',tsLastEnd), limit(1000))),
        getDocs(query(collection(firestore,'profile_click_events'), where('business_id','==',biz.id), where('created_at','>=',tsThisStart), where('created_at','<=',tsThisEnd), limit(1000))),
        getDocs(query(collection(firestore,'profile_click_events'), where('business_id','==',biz.id), where('created_at','>=',tsLastStart), where('created_at','<=',tsLastEnd), limit(1000))),
        getDocs(query(collection(firestore,'favorites'),            where('business_id','==',biz.id))),
      ]);

      function cnt<T>(r: PromiseSettledResult<{ size: number } & T>): number {
        return r.status === 'fulfilled' ? r.value.size : 0;
      }

      const metrics = [
        { label:'Reviews',         thisMonth: cnt(revThis),  lastMonth: cnt(revLast),  icon:'comment-text-outline', accent:'#EC4899' },
        { label:'Searches',        thisMonth: cnt(kwThis),   lastMonth: cnt(kwLast),   icon:'magnify',              accent:'#F97316' },
        { label:'Profile Clicks',  thisMonth: cnt(clkThis),  lastMonth: cnt(clkLast),  icon:'cursor-default-click', accent:'#A855F7' },
        { label:'Wishlist Saves',  thisMonth: favSnap.status==='fulfilled'?favSnap.value.size:0, lastMonth: 0, icon:'heart-outline', accent:'#EF4444' },
      ];

      setMonthlyStats(metrics.map(m => {
        const delta     = m.thisMonth - m.lastMonth;
        const deltaSign: 'up'|'down'|'same' = delta > 0 ? 'up' : delta < 0 ? 'down' : 'same';
        return { ...m, delta: Math.abs(delta), deltaSign };
      }));
    } catch {
      setMonthlyStats([]);
    } finally {
      setMonthlyLoading(false);
    }
  }, []);

  // ── Load visitor demographics (age + gender) ───────────────────────────────
  const loadVisitorDemographics = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    setDemographicsLoading(true);
    try {
      const visitSnap = await getDocs(query(collection(firestore,'visit_events'), where('business_id','==',biz.id), limit(500)));
      const userIds = new Set<string>();
      visitSnap.forEach(d => { const uid = d.data()['user_id'] as string|undefined; if (uid) userIds.add(uid); });

      if (userIds.size === 0) { setAgeStats([]); setGenderStats([]); return; }

      const uidArr = Array.from(userIds);
      const chunks: string[][] = [];
      for (let i = 0; i < uidArr.length; i += 30) chunks.push(uidArr.slice(i, i + 30));

      const todayMs = Date.now();
      const ageBuckets = { u18: 0, a1824: 0, a2534: 0, a3544: 0, a45p: 0 };
      let maleCount = 0, femaleCount = 0;

      for (const chunk of chunks) {
        const profilesSnap = await getDocs(query(collection(firestore,'profiles'), where(documentId(),'in',chunk)));
        profilesSnap.forEach(d => {
          const data = d.data();
          const bdayTs = data['birthday'] as Timestamp|null|undefined;
          if (bdayTs?.toDate) {
            const age = Math.floor((todayMs - bdayTs.toDate().getTime()) / (365.25 * 86400000));
            if      (age < 18) ageBuckets.u18++;
            else if (age <= 24) ageBuckets.a1824++;
            else if (age <= 34) ageBuckets.a2534++;
            else if (age <= 44) ageBuckets.a3544++;
            else                ageBuckets.a45p++;
          }
          const g = data['gender'] as string|null|undefined;
          if (g === 'male')   maleCount++;
          else if (g === 'female') femaleCount++;
        });
      }

      const totalAge = ageBuckets.u18 + ageBuckets.a1824 + ageBuckets.a2534 + ageBuckets.a3544 + ageBuckets.a45p;
      setAgeStats([
        { label: 'Under 18', count: ageBuckets.u18,   percentage: totalAge > 0 ? Math.round((ageBuckets.u18   / totalAge) * 100) : 0, color: '#A855F7' },
        { label: '18 – 24',  count: ageBuckets.a1824, percentage: totalAge > 0 ? Math.round((ageBuckets.a1824 / totalAge) * 100) : 0, color: '#06B6D4' },
        { label: '25 – 34',  count: ageBuckets.a2534, percentage: totalAge > 0 ? Math.round((ageBuckets.a2534 / totalAge) * 100) : 0, color: '#F97316' },
        { label: '35 – 44',  count: ageBuckets.a3544, percentage: totalAge > 0 ? Math.round((ageBuckets.a3544 / totalAge) * 100) : 0, color: '#EC4899' },
        { label: '45+',      count: ageBuckets.a45p,  percentage: totalAge > 0 ? Math.round((ageBuckets.a45p  / totalAge) * 100) : 0, color: '#EAB308' },
      ]);

      const totalGender = maleCount + femaleCount;
      setGenderStats([
        { label: 'Male',   count: maleCount,   percentage: totalGender > 0 ? Math.round((maleCount   / totalGender) * 100) : 0, color: '#06B6D4' },
        { label: 'Female', count: femaleCount, percentage: totalGender > 0 ? Math.round((femaleCount / totalGender) * 100) : 0, color: '#EC4899' },
      ]);
    } catch { setAgeStats([]); setGenderStats([]); }
    finally { setDemographicsLoading(false); }
  }, []);

  // ── Activate boost ─────────────────────────────────────────────────────────
  const activateBoost = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id || !auth.currentUser) return;
    setActivating(true);
    try {
      const expiresAt = new Date(Date.now() + 30*24*60*60*1000);
      await addDoc(collection(firestore,'boosts'),{
        business_id: biz.id, owner_id: auth.currentUser.uid,
        created_at: serverTimestamp(), expires_at: Timestamp.fromDate(expiresAt),
        status:'active', label:`Boost`, impression_count:0, click_count:0,
      });
      await loadBoostData();
    } catch { /* silently fail */ }
    finally { setActivating(false); }
  }, [loadBoostData]);

  useEffect(() => { loadKeywords();              }, [loadKeywords]);
  useEffect(() => { loadSubcategoryStats();      }, [loadSubcategoryStats]);
  useEffect(() => { loadBoostData();             }, [loadBoostData]);
  useEffect(() => { loadProfileClicks();         }, [loadProfileClicks]);
  useEffect(() => { loadMenuItems();             }, [loadMenuItems]);
  useEffect(() => { loadAdditional();            }, [loadAdditional]);
  useEffect(() => { loadMonthly();               }, [loadMonthly]);
  useEffect(() => { loadVisitorDemographics();   }, [loadVisitorDemographics]);

  const activeBoost = useMemo(() => boostHistory.find(b=>b.status==='active')??null, [boostHistory]);

  return {
    business,
    keywords, subcatStats, kwLoading, subcatLoading,
    boostMode, setBoostMode, boostCRange, setBoostCRange, boostCal, setBoostCal, boostRange, boostPoints, boostHistory, boostLoading, activating, activeBoost, activateBoost,
    profileMode, setProfileMode, profileCRange, setProfileCRange, profileCal, setProfileCal, profileRange, profileGroups, profileLoading,
    menuItems, menuLoading,
    peakDays, sentimentStats, favCount,
    monthlyStats, monthlyLoading,
    ageStats, genderStats, demographicsLoading,
  };
};
