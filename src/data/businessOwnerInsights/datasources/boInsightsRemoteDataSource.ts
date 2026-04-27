/**
 * Business Owner Insights Remote Data Source
 *
 * Centralises all Firestore queries that power the Business-Owner
 * analytics screens (insights, boost history, keywords, menu items,
 * engagement, demographics, etc.).
 *
 * Presentation hooks import this data source via the DI container
 * instead of importing Firebase directly.
 */

import {
  collection, getDocs, query, where, Timestamp,
  addDoc, serverTimestamp, orderBy, limit, getDoc, doc, documentId,
  QuerySnapshot, DocumentData,
} from 'firebase/firestore';
import { firestore, auth } from '@/core/firebase/firebaseConfig';

// ── Shared types (mirror what the presentation hooks use) ───────────────────

export interface InsightDateRange { start: Date; end: Date }

export interface RatingPoint       { label: string; avgRating: number; count: number }
export interface EngagementPoint   { label: string; reviews: number; visits: number; searches: number }
export interface KeywordStat       { keyword: string; findCount: number; openCount: number }
export interface SubcategoryStat   { subcategory: string; findCount: number; clickCount: number; count: number; percentage: number }
export interface BoostRecord       { id: string; createdAt: Date; expiresAt: Date; status: 'active'|'expired'; impressions: number; clicks: number; label: string }
export interface BoostTimePoint    { label: string; impressions: number; clicks: number }
export interface ProfileClickItem  { type: string; label: string; count: number }
export interface ProfileClickGroup { groupKey: string; groupLabel: string; icon: string; items: ProfileClickItem[]; total: number }
export interface MenuItemStat      { itemId: string; itemName: string; categoryName: string; clicks: number }
export interface PeakDayStat       { day: string; dayIndex: number; count: number }
export interface SentimentStat     { label: string; count: number; percentage: number; color: string }
export interface MonthlyStat       { label: string; thisMonth: number; lastMonth: number; delta: number; deltaSign: 'up'|'down'|'same'; icon: string; accent: string }
export interface AgeGroupStat      { label: string; count: number; percentage: number; color: string }
export interface GenderStat        { label: string; count: number; percentage: number; color: string }

// ── Pure helpers (no Firebase) ──────────────────────────────────────────────

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MON  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function sod(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function isoDay(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function daysBetween(a: Date, b: Date): number { return Math.round((b.getTime()-a.getTime())/86400000); }
function mkey(d: Date): string { return `${d.getFullYear()}-${d.getMonth()}`; }

function buckKey(d: Date, days: number): string {
  if (days <= 60) return isoDay(d);
  if (days <= 365) return mkey(d);
  return String(d.getFullYear());
}

function buildLabels(range: InsightDateRange): Array<{ key: string; label: string }> {
  const days = daysBetween(range.start, range.end) + 1;
  if (days <= 14) return Array.from({ length: days }, (_, i) => { const d = new Date(range.start.getTime()+i*86400000); return { key:isoDay(d), label:`${d.getDate()}/${d.getMonth()+1}` }; });
  if (days <= 60) { const pts: Array<{ key: string; label: string }> = []; let ws = range.start; while (ws <= range.end) { pts.push({ key:isoDay(ws), label:`${ws.getDate()}/${ws.getMonth()+1}` }); ws = new Date(ws.getTime()+7*86400000); } return pts; }
  if (days <= 365) { const pts: Array<{ key: string; label: string }> = []; let cur = new Date(range.start.getFullYear(), range.start.getMonth(), 1); while (cur <= range.end) { pts.push({ key:mkey(cur), label:MON[cur.getMonth()] }); cur = new Date(cur.getFullYear(), cur.getMonth()+1, 1); } return pts; }
  const pts: Array<{ key: string; label: string }> = []; for (let yr = range.start.getFullYear(); yr <= range.end.getFullYear(); yr++) pts.push({ key:String(yr), label:String(yr) }); return pts;
}

function withRange(range: InsightDateRange) { return { startTs: Timestamp.fromDate(range.start), endTs: Timestamp.fromDate(new Date(range.end.getTime()+86400000)) }; }

function extractDates(snap: QuerySnapshot<DocumentData>): Date[] {
  const out: Date[] = []; snap.forEach(d => { const ts = d.data()['created_at'] as Timestamp|undefined; if (ts?.toDate) out.push(sod(ts.toDate())); }); return out;
}
function countByKey(dates: Date[], keyFn: (d: Date) => string): Map<string,number> {
  const map = new Map<string,number>(); dates.forEach(d => { const k = keyFn(d); map.set(k, (map.get(k) ?? 0)+1); }); return map;
}

// ── Data Source class ───────────────────────────────────────────────────────

export interface BOInsightsRemoteDataSource {
  fetchRatingPoints(businessId: string, range: InsightDateRange): Promise<RatingPoint[]>;
  fetchEngagementPoints(businessId: string, range: InsightDateRange): Promise<EngagementPoint[]>;
  fetchKeywords(businessId: string): Promise<KeywordStat[]>;
  fetchKeywordsInRange(businessId: string, range: InsightDateRange, mode: string): Promise<KeywordStat[]>;
  fetchSubcategoryStats(businessId: string): Promise<SubcategoryStat[]>;
  fetchBoostData(businessId: string, range: InsightDateRange): Promise<{ points: BoostTimePoint[]; history: BoostRecord[] }>;
  fetchBoostHistory(businessId: string): Promise<BoostRecord[]>;
  fetchProfileClicks(businessId: string, range: InsightDateRange, contact: Record<string, unknown>, deliveryServices: Array<{ isActive: boolean; abbreviation: string; name: string }>): Promise<ProfileClickGroup[]>;
  fetchMenuItems(businessId: string): Promise<MenuItemStat[]>;
  fetchMenuItemsInRange(businessId: string, range: InsightDateRange, mode: string): Promise<MenuItemStat[]>;
  fetchAdditionalInsights(businessId: string): Promise<{ peakDays: PeakDayStat[]; sentimentStats: SentimentStat[]; favCount: number }>;
  fetchMonthlyStats(businessId: string): Promise<MonthlyStat[]>;
  fetchVisitorDemographics(businessId: string): Promise<{ ageStats: AgeGroupStat[]; genderStats: GenderStat[] }>;
  activateBoost(businessId: string): Promise<void>;
  fetchEngagementDetailsData(businessId: string, range: InsightDateRange): Promise<EngagementPoint[]>;
}

export class BOInsightsRemoteDataSourceImpl implements BOInsightsRemoteDataSource {

  async fetchRatingPoints(businessId: string, range: InsightDateRange): Promise<RatingPoint[]> {
    const startTs = Timestamp.fromDate(range.start);
    const endTs   = Timestamp.fromDate(new Date(range.end.getTime()+86400000));
    const snap = await getDocs(query(collection(firestore,'reviews'), where('business_id','==',businessId), where('created_at','>=',startTs), where('created_at','<',endTs)));
    const byKey = new Map<string,number[]>();
    snap.forEach((d) => { const ts = d.data()['created_at'] as Timestamp|undefined; const r = d.data()['overall_rating'] as number|undefined; if (!ts?.toDate || typeof r !== 'number') return; const k = isoDay(sod(ts.toDate())); const arr = byKey.get(k) ?? []; arr.push(r); byKey.set(k, arr); });
    const days = daysBetween(range.start, range.end)+1;

    if (days <= 14) return Array.from({ length: days }, (_, i) => { const d = new Date(range.start.getTime()+i*86400000); const ratings = byKey.get(isoDay(d)) ?? []; const avg = ratings.length ? ratings.reduce((a,b)=>a+b,0)/ratings.length : 0; return { label:`${d.getDate()}/${d.getMonth()+1}`, avgRating:parseFloat(avg.toFixed(1)), count:ratings.length }; });

    if (days <= 60) { const weeks: RatingPoint[] = []; let weekStart = range.start; while (weekStart <= range.end) { const weekEnd = new Date(Math.min(weekStart.getTime()+6*86400000, range.end.getTime())); const all: number[] = []; let cur2 = weekStart; while (cur2 <= weekEnd) { (byKey.get(isoDay(cur2)) ?? []).forEach(r => all.push(r)); cur2 = new Date(cur2.getTime()+86400000); } const avg = all.length ? all.reduce((a,b)=>a+b,0)/all.length : 0; weeks.push({ label:`${weekStart.getDate()}/${weekStart.getMonth()+1}`, avgRating:parseFloat(avg.toFixed(1)), count:all.length }); weekStart = new Date(weekEnd.getTime()+86400000); } return weeks; }

    if (days > 365) { const years: RatingPoint[] = []; for (let yr = range.start.getFullYear(); yr <= range.end.getFullYear(); yr++) { const all: number[] = []; byKey.forEach((ratings, key) => { if (new Date(key).getFullYear() === yr) ratings.forEach(r => all.push(r)); }); const avg = all.length ? all.reduce((a,b)=>a+b,0)/all.length : 0; years.push({ label: String(yr), avgRating: parseFloat(avg.toFixed(1)), count: all.length }); } return years; }

    const months: RatingPoint[] = []; let cur = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
    while (cur <= range.end) { const yr = cur.getFullYear(), mo = cur.getMonth(); const all: number[] = []; byKey.forEach((ratings, key) => { const d = new Date(key); if (d.getFullYear()===yr && d.getMonth()===mo) ratings.forEach(r=>all.push(r)); }); const avg = all.length ? all.reduce((a,b)=>a+b,0)/all.length : 0; months.push({ label:MON[mo], avgRating:parseFloat(avg.toFixed(1)), count:all.length }); cur = new Date(yr, mo+1, 1); }
    return months;
  }

  async fetchEngagementPoints(businessId: string, range: InsightDateRange): Promise<EngagementPoint[]> {
    const startTs = Timestamp.fromDate(range.start);
    const endTs   = Timestamp.fromDate(new Date(range.end.getTime()+86400000));
    const biz     = where('business_id','==',businessId);
    const [rev, vis, sea] = await Promise.all([
      getDocs(query(collection(firestore,'reviews'),      biz, where('created_at','>=',startTs), where('created_at','<',endTs))),
      getDocs(query(collection(firestore,'visit_events'), biz, where('created_at','>=',startTs), where('created_at','<',endTs))),
      getDocs(query(collection(firestore,'search_events'),biz, where('created_at','>=',startTs), where('created_at','<',endTs))),
    ]);
    const rDates = extractDates(rev), vDates = extractDates(vis), sDates = extractDates(sea);
    const days = daysBetween(range.start, range.end)+1;

    if (days <= 14) { const rM = countByKey(rDates,isoDay), vM = countByKey(vDates,isoDay), sM = countByKey(sDates,isoDay); return Array.from({ length:days }, (_,i) => { const d = new Date(range.start.getTime()+i*86400000); const k = isoDay(d); return { label:`${d.getDate()}/${d.getMonth()+1}`, reviews:rM.get(k)??0, visits:vM.get(k)??0, searches:sM.get(k)??0 }; }); }

    if (days <= 60) { const points: EngagementPoint[] = []; let weekStart = range.start; while (weekStart <= range.end) { const weekEnd = new Date(Math.min(weekStart.getTime()+6*86400000, range.end.getTime())); let r=0, v=0, s=0, cur2=weekStart; while (cur2 <= weekEnd) { const k = isoDay(cur2); rDates.forEach(d => { if (isoDay(d)===k) r++; }); vDates.forEach(d => { if (isoDay(d)===k) v++; }); sDates.forEach(d => { if (isoDay(d)===k) s++; }); cur2 = new Date(cur2.getTime()+86400000); } points.push({ label:`${weekStart.getDate()}/${weekStart.getMonth()+1}`, reviews:r, visits:v, searches:s }); weekStart = new Date(weekEnd.getTime()+86400000); } return points; }

    if (days > 365) { const kFn = (d: Date) => String(d.getFullYear()); const rM = countByKey(rDates,kFn), vM = countByKey(vDates,kFn), sM = countByKey(sDates,kFn); const years: EngagementPoint[] = []; for (let yr = range.start.getFullYear(); yr <= range.end.getFullYear(); yr++) years.push({ label:String(yr), reviews:rM.get(String(yr))??0, visits:vM.get(String(yr))??0, searches:sM.get(String(yr))??0 }); return years; }

    const monthList: { yr:number; mo:number }[] = []; let cur = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
    while (cur <= range.end) { monthList.push({ yr:cur.getFullYear(), mo:cur.getMonth() }); cur = new Date(cur.getFullYear(), cur.getMonth()+1, 1); }
    const kFn = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
    const rM = countByKey(rDates,kFn), vM = countByKey(vDates,kFn), sM = countByKey(sDates,kFn);
    return monthList.map(({ yr, mo }) => ({ label:MON[mo], reviews:rM.get(`${yr}-${mo}`)??0, visits:vM.get(`${yr}-${mo}`)??0, searches:sM.get(`${yr}-${mo}`)??0 }));
  }

  async fetchKeywords(businessId: string): Promise<KeywordStat[]> {
    const snap = await getDocs(query(collection(firestore,'keyword_events'), where('business_id','==',businessId), limit(500)));
    const kwMap = new Map<string,{find:number;open:number}>();
    snap.forEach(d => { const kw = d.data()['keyword'] as string|undefined; if (kw) { const k = kw.toLowerCase().trim(); const p = kwMap.get(k)??{find:0,open:0}; const opened=!!d.data()['opened']; kwMap.set(k,{find:p.find+(opened?0:1),open:p.open+(opened?1:0)}); } });
    return Array.from(kwMap.entries()).map(([keyword,s])=>({keyword,findCount:s.find,openCount:s.open})).sort((a,b)=>b.findCount-a.findCount);
  }

  async fetchKeywordsInRange(businessId: string, range: InsightDateRange, mode: string): Promise<KeywordStat[]> {
    const snap = await getDocs(query(collection(firestore,'keyword_events'), where('business_id','==',businessId), limit(1000)));
    const rangeStart = range.start.getTime();
    const rangeEnd   = range.end.getTime() + 86400000;
    const kwMap = new Map<string, { find: number; open: number }>();
    snap.forEach(d => {
      const kw = d.data()['keyword'] as string | undefined;
      if (!kw) return;
      if (mode !== 'ALL') {
        const ts = d.data()['created_at'] as Timestamp | undefined;
        const t  = ts?.toDate?.().getTime();
        if (!t || t < rangeStart || t >= rangeEnd) return;
      }
      const key  = kw.toLowerCase().trim();
      const prev = kwMap.get(key) ?? { find: 0, open: 0 };
      const opened = !!d.data()['opened'];
      kwMap.set(key, { find: prev.find + (opened ? 0 : 1), open: prev.open + (opened ? 1 : 0) });
    });
    return Array.from(kwMap.entries()).map(([keyword, s]) => ({ keyword, findCount: s.find, openCount: s.open })).sort((a, b) => b.findCount - a.findCount);
  }

  async fetchSubcategoryStats(businessId: string): Promise<SubcategoryStat[]> {
    const [eventsSnap, bizDoc] = await Promise.all([
      getDocs(query(collection(firestore,'subcategory_events'), where('business_id','==',businessId), limit(1000))),
      getDoc(doc(firestore,'businesses',businessId)),
    ]);
    const subs = (bizDoc.data()?.['sub_categories'] as string[]|undefined)??[];
    if (subs.length <= 1) return [];
    const subMap = new Map<string,{find:number;click:number}>();
    eventsSnap.forEach(d => { const sub = d.data()['subcategory'] as string|undefined; if (!sub) return; const opened = !!d.data()['opened']; const p = subMap.get(sub)??{find:0,click:0}; subMap.set(sub,{find:p.find+(opened?0:1),click:p.click+(opened?1:0)}); });
    const tot = Array.from(subMap.values()).reduce((s,v)=>s+v.find+v.click,0);
    const statsFromEvents = Array.from(subMap.entries()).map(([sub,v]) => { const count=v.find+v.click; return {subcategory:sub,findCount:v.find,clickCount:v.click,count,percentage:tot>0?Math.round((count/tot)*100):0}; });
    const eventSubsLower = new Set(statsFromEvents.map(s=>s.subcategory.toLowerCase()));
    const zeroStats = subs.filter(sub=>!eventSubsLower.has(sub.toLowerCase())).map(sub=>({subcategory:sub,findCount:0,clickCount:0,count:0,percentage:0}));
    return [...statsFromEvents,...zeroStats].sort((a,b)=>b.count-a.count);
  }

  async fetchBoostData(businessId: string, range: InsightDateRange): Promise<{ points: BoostTimePoint[]; history: BoostRecord[] }> {
    const { startTs, endTs } = withRange(range);
    const days = daysBetween(range.start, range.end)+1;
    const [impSnap, clkSnap, histSnap] = await Promise.all([
      getDocs(query(collection(firestore,'boost_search_events'), where('business_id','==',businessId), where('created_at','>=',startTs), where('created_at','<',endTs))),
      getDocs(query(collection(firestore,'boost_click_events'),  where('business_id','==',businessId), where('created_at','>=',startTs), where('created_at','<',endTs))),
      getDocs(query(collection(firestore,'boosts'), where('business_id','==',businessId), orderBy('created_at','desc'), limit(50))),
    ]);
    const impDates: Date[] = []; impSnap.forEach(d => { const ts=d.data()['created_at'] as Timestamp|undefined; if(ts?.toDate) impDates.push(sod(ts.toDate())); });
    const clkDates: Date[] = []; clkSnap.forEach(d => { const ts=d.data()['created_at'] as Timestamp|undefined; if(ts?.toDate) clkDates.push(sod(ts.toDate())); });
    const labels = buildLabels(range);
    const points = labels.map(({key,label})=>({ label, impressions:impDates.filter(d=>buckKey(d,days)===key).length, clicks:clkDates.filter(d=>buckKey(d,days)===key).length }));
    const now = new Date();
    const history = histSnap.docs.map(d => {
      const data=d.data(); const createdAt=(data['created_at'] as Timestamp)?.toDate()??new Date(); const expiresAt=(data['expires_at'] as Timestamp)?.toDate()??new Date();
      return { id:d.id, createdAt, expiresAt, status:(expiresAt>now?'active':'expired') as 'active'|'expired', impressions:(data['impression_count'] as number)??0, clicks:(data['click_count'] as number)??0, label:(data['label'] as string)??`Boost #${d.id.slice(-4)}` };
    });
    return { points, history };
  }

  async fetchBoostHistory(businessId: string): Promise<BoostRecord[]> {
    const snap = await getDocs(query(collection(firestore,'boosts'), where('business_id','==',businessId), orderBy('created_at','desc'), limit(200)));
    const now = new Date();
    return snap.docs.map(d => {
      const data = d.data(); const createdAt = (data['created_at'] as Timestamp)?.toDate() ?? new Date(); const expiresAt = (data['expires_at'] as Timestamp)?.toDate() ?? new Date();
      return { id:d.id, createdAt, expiresAt, status:(expiresAt>now?'active':'expired') as 'active'|'expired', impressions:(data['impression_count'] as number)??0, clicks:(data['click_count'] as number)??0, label:(data['label'] as string)??`Boost #${d.id.slice(-4)}` };
    });
  }

  async fetchProfileClicks(businessId: string, range: InsightDateRange, contact: Record<string, unknown>, deliveryServices: Array<{ isActive: boolean; abbreviation: string; name: string }>): Promise<ProfileClickGroup[]> {
    const { startTs, endTs } = withRange(range);
    const snap = await getDocs(query(collection(firestore,'profile_click_events'), where('business_id','==',businessId), where('created_at','>=',startTs), where('created_at','<',endTs)));
    const tc = new Map<string,number>();
    snap.forEach(d => { const t=d.data()['button_type'] as string|undefined; if(t) tc.set(t,(tc.get(t)??0)+1); });
    const groups: ProfileClickGroup[] = [
      { groupKey:'location', groupLabel:'Location', icon:'map-marker', items:[{type:'location', label:'Directions', count:tc.get('location')??0}], total:tc.get('location')??0 },
      { groupKey:'contact', groupLabel:'Contact', icon:'phone', items:[ {type:'phone',label:'Phone',count:tc.get('phone')??0}, {type:'email',label:'Email',count:tc.get('email')??0}, {type:'website',label:'Website',count:tc.get('website')??0} ].filter(i=>(i.type==='phone'&&!!contact.phone)||(i.type==='email'&&!!contact.email)||(i.type==='website'&&!!contact.website)), total:(tc.get('phone')??0)+(tc.get('email')??0)+(tc.get('website')??0) },
      { groupKey:'social', groupLabel:'Social Media', icon:'instagram', items:[ {type:'instagram',label:'Instagram',count:tc.get('instagram')??0}, {type:'facebook',label:'Facebook',count:tc.get('facebook')??0}, {type:'tiktok',label:'TikTok',count:tc.get('tiktok')??0} ].filter(i=>(i.type==='instagram'&&!!contact.instagramHandle)||(i.type==='facebook'&&!!contact.facebookName)||(i.type==='tiktok'&&!!contact.tiktokHandle)), total:(tc.get('instagram')??0)+(tc.get('facebook')??0)+(tc.get('tiktok')??0) },
      { groupKey:'delivery', groupLabel:'Delivery', icon:'truck-delivery', items:deliveryServices.filter(ds=>ds.isActive).map(ds=>({type:`delivery_${ds.abbreviation}`,label:ds.name,count:tc.get(`delivery_${ds.abbreviation}`)??0})), total:deliveryServices.filter(ds=>ds.isActive).reduce((s,ds)=>s+(tc.get(`delivery_${ds.abbreviation}`)??0),0) },
    ].filter(g=>g.items.length>0);
    return groups;
  }

  async fetchMenuItems(businessId: string): Promise<MenuItemStat[]> {
    const snap = await getDocs(query(collection(firestore,'menu_item_click_events'), where('business_id','==',businessId), limit(500)));
    const itemMap = new Map<string,{name:string;cat:string;count:number}>();
    snap.forEach(d => { const id=d.data()['item_id'] as string|undefined, name=d.data()['item_name'] as string|undefined, cat=d.data()['category_name'] as string|undefined; if(!id||!name) return; const p=itemMap.get(id)??{name,cat:cat??'',count:0}; itemMap.set(id,{...p,count:p.count+1}); });
    return Array.from(itemMap.entries()).map(([itemId,s])=>({itemId,itemName:s.name,categoryName:s.cat,clicks:s.count})).sort((a,b)=>b.clicks-a.clicks);
  }

  async fetchMenuItemsInRange(businessId: string, range: InsightDateRange, mode: string): Promise<MenuItemStat[]> {
    const startTs = Timestamp.fromDate(range.start);
    const endTs   = Timestamp.fromDate(new Date(range.end.getTime() + 86400000));
    const q = mode === 'ALL'
      ? query(collection(firestore,'menu_item_click_events'), where('business_id','==',businessId), limit(500))
      : query(collection(firestore,'menu_item_click_events'), where('business_id','==',businessId), where('created_at','>=',startTs), where('created_at','<',endTs));
    const snap = await getDocs(q);
    const itemMap = new Map<string,{name:string;cat:string;count:number}>();
    snap.forEach(d => { const id=d.data()['item_id'] as string|undefined; const name=d.data()['item_name'] as string|undefined; const cat=d.data()['category_name'] as string|undefined; if (!id||!name) return; const p=itemMap.get(id)??{name,cat:cat??'',count:0}; itemMap.set(id,{...p,count:p.count+1}); });
    return Array.from(itemMap.entries()).map(([itemId,s])=>({itemId,itemName:s.name,categoryName:s.cat,clicks:s.count}));
  }

  async fetchAdditionalInsights(businessId: string): Promise<{ peakDays: PeakDayStat[]; sentimentStats: SentimentStat[]; favCount: number }> {
    const [revResult, favResult] = await Promise.allSettled([
      getDocs(query(collection(firestore,'reviews'), where('business_id','==',businessId), limit(300))),
      getDocs(query(collection(firestore,'favorites'), where('business_id','==',businessId))),
    ]);
    let peakDays: PeakDayStat[] = []; let sentimentStats: SentimentStat[] = []; let favCount = 0;
    if (revResult.status === 'fulfilled') {
      const dayCounts = new Array<number>(7).fill(0); let five=0, good=0, bad=0;
      revResult.value.forEach(d => { const ts=d.data()['created_at'] as Timestamp|undefined; if(ts?.toDate) dayCounts[ts.toDate().getDay()]++; const r=d.data()['overall_rating'] as number|undefined; if(r!=null) { if(r>=5) five++; else if(r>=3) good++; else bad++; } });
      peakDays = DAYS.map((day,i)=>({day,dayIndex:i,count:dayCounts[i]}));
      const tot=five+good+bad;
      sentimentStats = [ {label:'Excellent (5★)',count:five,percentage:tot>0?Math.round((five/tot)*100):0,color:'#22C55E'}, {label:'Good (3-4★)',count:good,percentage:tot>0?Math.round((good/tot)*100):0,color:'#EAB308'}, {label:'Poor (1-2★)',count:bad,percentage:tot>0?Math.round((bad/tot)*100):0,color:'#EF4444'} ];
    }
    if (favResult.status === 'fulfilled') favCount = favResult.value.size;
    return { peakDays, sentimentStats, favCount };
  }

  async fetchMonthlyStats(businessId: string): Promise<MonthlyStat[]> {
    const now = new Date();
    const thisStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisEnd   = new Date(now.getFullYear(), now.getMonth()+1, 0, 23, 59, 59);
    const lastStart = new Date(now.getFullYear(), now.getMonth()-1, 1);
    const lastEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const tsThisStart=Timestamp.fromDate(thisStart), tsThisEnd=Timestamp.fromDate(thisEnd), tsLastStart=Timestamp.fromDate(lastStart), tsLastEnd=Timestamp.fromDate(lastEnd);
    const [revThis,revLast,kwThis,kwLast,clkThis,clkLast,favSnap] = await Promise.allSettled([
      getDocs(query(collection(firestore,'reviews'),where('business_id','==',businessId),where('created_at','>=',tsThisStart),where('created_at','<=',tsThisEnd))),
      getDocs(query(collection(firestore,'reviews'),where('business_id','==',businessId),where('created_at','>=',tsLastStart),where('created_at','<=',tsLastEnd))),
      getDocs(query(collection(firestore,'keyword_events'),where('business_id','==',businessId),where('created_at','>=',tsThisStart),where('created_at','<=',tsThisEnd),limit(1000))),
      getDocs(query(collection(firestore,'keyword_events'),where('business_id','==',businessId),where('created_at','>=',tsLastStart),where('created_at','<=',tsLastEnd),limit(1000))),
      getDocs(query(collection(firestore,'profile_click_events'),where('business_id','==',businessId),where('created_at','>=',tsThisStart),where('created_at','<=',tsThisEnd),limit(1000))),
      getDocs(query(collection(firestore,'profile_click_events'),where('business_id','==',businessId),where('created_at','>=',tsLastStart),where('created_at','<=',tsLastEnd),limit(1000))),
      getDocs(query(collection(firestore,'favorites'),where('business_id','==',businessId))),
    ]);
    function cnt(r: PromiseSettledResult<{ size: number }>): number { return r.status === 'fulfilled' ? r.value.size : 0; }
    const metrics = [
      { label:'Reviews',thisMonth:cnt(revThis),lastMonth:cnt(revLast),icon:'comment-text-outline',accent:'#EC4899' },
      { label:'Searches',thisMonth:cnt(kwThis),lastMonth:cnt(kwLast),icon:'magnify',accent:'#F97316' },
      { label:'Profile Clicks',thisMonth:cnt(clkThis),lastMonth:cnt(clkLast),icon:'cursor-default-click',accent:'#A855F7' },
      { label:'Wishlist Saves',thisMonth:favSnap.status==='fulfilled'?favSnap.value.size:0,lastMonth:0,icon:'heart-outline',accent:'#EF4444' },
    ];
    return metrics.map(m => { const delta=m.thisMonth-m.lastMonth; const deltaSign:('up'|'down'|'same')=delta>0?'up':delta<0?'down':'same'; return { ...m, delta:Math.abs(delta), deltaSign }; });
  }

  async fetchVisitorDemographics(businessId: string): Promise<{ ageStats: AgeGroupStat[]; genderStats: GenderStat[] }> {
    const visitSnap = await getDocs(query(collection(firestore,'visit_events'), where('business_id','==',businessId), limit(500)));
    const userIds = new Set<string>(); visitSnap.forEach(d => { const uid = d.data()['user_id'] as string|undefined; if (uid) userIds.add(uid); });
    if (userIds.size === 0) return { ageStats: [], genderStats: [] };
    const uidArr = Array.from(userIds); const chunks: string[][] = []; for (let i = 0; i < uidArr.length; i += 30) chunks.push(uidArr.slice(i, i + 30));
    const todayMs = Date.now(); const ageBuckets = { u18:0, a1824:0, a2534:0, a3544:0, a45p:0 }; let maleCount=0, femaleCount=0;
    for (const chunk of chunks) {
      const profilesSnap = await getDocs(query(collection(firestore,'profiles'), where(documentId(),'in',chunk)));
      profilesSnap.forEach(d => { const data = d.data(); const bdayTs = data['birthday'] as Timestamp|null|undefined;
        if (bdayTs?.toDate) { const age = Math.floor((todayMs - bdayTs.toDate().getTime()) / (365.25*86400000)); if(age<18) ageBuckets.u18++; else if(age<=24) ageBuckets.a1824++; else if(age<=34) ageBuckets.a2534++; else if(age<=44) ageBuckets.a3544++; else ageBuckets.a45p++; }
        const g = data['gender'] as string|null|undefined; if (g==='male') maleCount++; else if (g==='female') femaleCount++;
      });
    }
    const totalAge = ageBuckets.u18+ageBuckets.a1824+ageBuckets.a2534+ageBuckets.a3544+ageBuckets.a45p;
    const ageStats: AgeGroupStat[] = [
      { label:'Under 18',count:ageBuckets.u18,percentage:totalAge>0?Math.round((ageBuckets.u18/totalAge)*100):0,color:'#A855F7' },
      { label:'18 – 24',count:ageBuckets.a1824,percentage:totalAge>0?Math.round((ageBuckets.a1824/totalAge)*100):0,color:'#06B6D4' },
      { label:'25 – 34',count:ageBuckets.a2534,percentage:totalAge>0?Math.round((ageBuckets.a2534/totalAge)*100):0,color:'#F97316' },
      { label:'35 – 44',count:ageBuckets.a3544,percentage:totalAge>0?Math.round((ageBuckets.a3544/totalAge)*100):0,color:'#EC4899' },
      { label:'45+',count:ageBuckets.a45p,percentage:totalAge>0?Math.round((ageBuckets.a45p/totalAge)*100):0,color:'#EAB308' },
    ];
    const totalGender = maleCount+femaleCount;
    const genderStats: GenderStat[] = [
      { label:'Male',count:maleCount,percentage:totalGender>0?Math.round((maleCount/totalGender)*100):0,color:'#06B6D4' },
      { label:'Female',count:femaleCount,percentage:totalGender>0?Math.round((femaleCount/totalGender)*100):0,color:'#EC4899' },
    ];
    return { ageStats, genderStats };
  }

  async activateBoost(businessId: string): Promise<void> {
    if (!auth.currentUser) return;
    const expiresAt = new Date(Date.now() + 30*24*60*60*1000);
    await addDoc(collection(firestore,'boosts'),{
      business_id: businessId, owner_id: auth.currentUser.uid,
      created_at: serverTimestamp(), expires_at: Timestamp.fromDate(expiresAt),
      status:'active', label:'Boost', impression_count:0, click_count:0,
    });
  }

  async fetchEngagementDetailsData(businessId: string, range: InsightDateRange): Promise<EngagementPoint[]> {
    return this.fetchEngagementPoints(businessId, range);
  }

  async fetchGlobalEngagement(range: InsightDateRange): Promise<EngagementPoint[]> {
    const startTs = Timestamp.fromDate(range.start);
    const endTs   = Timestamp.fromDate(new Date(range.end.getTime()+86400000));
    const [rev, vis, sea] = await Promise.all([
      getDocs(query(collection(firestore,'reviews'), where('created_at','>=',startTs), where('created_at','<',endTs))),
      getDocs(query(collection(firestore,'visit_events'), where('created_at','>=',startTs), where('created_at','<',endTs))),
      getDocs(query(collection(firestore,'search_events'), where('created_at','>=',startTs), where('created_at','<',endTs))),
    ]);
    const rDates = extractDates(rev), vDates = extractDates(vis), sDates = extractDates(sea);
    const days = daysBetween(range.start, range.end)+1;

    if (days <= 1) return [{ label:isoDay(range.start), reviews:rDates.length, visits:vDates.length, searches:sDates.length }];

    if (days <= 60) { const rM = countByKey(rDates,isoDay), vM = countByKey(vDates,isoDay), sM = countByKey(sDates,isoDay); return Array.from({ length:days }, (_,i) => { const d = new Date(range.start.getTime()+i*86400000); const k = isoDay(d); return { label:`${d.getDate()}/${d.getMonth()+1}`, reviews:rM.get(k)??0, visits:vM.get(k)??0, searches:sM.get(k)??0 }; }); }

    if (days > 730) { const kFn = (d: Date) => String(d.getFullYear()); const rM = countByKey(rDates,kFn), vM = countByKey(vDates,kFn), sM = countByKey(sDates,kFn); const years: EngagementPoint[] = []; for (let yr = range.start.getFullYear(); yr <= range.end.getFullYear(); yr++) years.push({ label:String(yr), reviews:rM.get(String(yr))??0, visits:vM.get(String(yr))??0, searches:sM.get(String(yr))??0 }); return years; }

    const monthList: { yr:number; mo:number }[] = []; let cur = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
    while (cur <= range.end) { monthList.push({ yr:cur.getFullYear(), mo:cur.getMonth() }); cur = new Date(cur.getFullYear(), cur.getMonth()+1, 1); }
    const kFn = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
    const rM = countByKey(rDates,kFn), vM = countByKey(vDates,kFn), sM = countByKey(sDates,kFn);
    return monthList.map(({ yr, mo }) => ({ label: monthList.length > 13 ? `${MON[mo]}'${String(yr).slice(2)}` : MON[mo], reviews:rM.get(`${yr}-${mo}`)??0, visits:vM.get(`${yr}-${mo}`)??0, searches:sM.get(`${yr}-${mo}`)??0 }));
  }
}
