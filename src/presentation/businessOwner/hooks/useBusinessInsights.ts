import { useState, useCallback, useEffect, useMemo } from 'react';
import { collection, getDocs, query, where, Timestamp, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { firestore } from '@/core/firebase/firebaseConfig';
import { useBusinessOwnerStore } from '../store/businessOwnerStore';

export type InsightFilterMode = 'ALL' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';
export interface InsightDateRange { start: Date; end: Date }
export interface RatingPoint { label: string; avgRating: number; count: number }
export interface EngagementPoint { label: string; reviews: number; visits: number; searches: number }

const MON_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function startOfDay(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function daysBetween(a: Date, b: Date): number { return Math.round((b.getTime()-a.getTime())/86400000); }

const APP_EPOCH = new Date(2020, 0, 1);

export function rangeForInsightMode(mode: InsightFilterMode, custom: InsightDateRange): InsightDateRange {
  const today = startOfDay(new Date());
  if (mode === 'ALL')   return { start: APP_EPOCH, end: today };
  if (mode === 'WEEK')  return { start: new Date(today.getTime()-6*86400000), end: today };
  if (mode === 'MONTH') return { start: new Date(today.getFullYear(),today.getMonth(),1), end: new Date(today.getFullYear(),today.getMonth()+1,0) };
  if (mode === 'YEAR')  return { start: new Date(today.getFullYear(),0,1), end: new Date(today.getFullYear(),11,31) };
  return custom;
}

// ── Rating points ──────────────────────────────────────────────────────────────

async function fetchRatingPoints(businessId: string, range: InsightDateRange): Promise<RatingPoint[]> {
  const startTs = Timestamp.fromDate(range.start);
  const endTs   = Timestamp.fromDate(new Date(range.end.getTime()+86400000));
  const snap = await getDocs(query(
    collection(firestore,'reviews'),
    where('business_id','==',businessId),
    where('created_at','>=',startTs),
    where('created_at','<',endTs),
  ));

  const byKey = new Map<string,number[]>();
  snap.forEach((d) => {
    const ts = d.data()['created_at'] as Timestamp|undefined;
    const r  = d.data()['overall_rating'] as number|undefined;
    if (!ts?.toDate || typeof r !== 'number') return;
    const k = isoDay(startOfDay(ts.toDate()));
    const arr = byKey.get(k) ?? [];
    arr.push(r);
    byKey.set(k, arr);
  });

  const days = daysBetween(range.start, range.end)+1;

  if (days <= 14) {
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(range.start.getTime()+i*86400000);
      const ratings = byKey.get(isoDay(d)) ?? [];
      const avg = ratings.length ? ratings.reduce((a,b)=>a+b,0)/ratings.length : 0;
      return { label:`${d.getDate()}/${d.getMonth()+1}`, avgRating:parseFloat(avg.toFixed(1)), count:ratings.length };
    });
  }

  if (days <= 60) {
    const weeks: RatingPoint[] = [];
    let weekStart = range.start;
    while (weekStart <= range.end) {
      const weekEnd = new Date(Math.min(weekStart.getTime()+6*86400000, range.end.getTime()));
      const all: number[] = [];
      let cur2 = weekStart;
      while (cur2 <= weekEnd) {
        (byKey.get(isoDay(cur2)) ?? []).forEach(r => all.push(r));
        cur2 = new Date(cur2.getTime()+86400000);
      }
      const avg = all.length ? all.reduce((a,b)=>a+b,0)/all.length : 0;
      weeks.push({ label:`${weekStart.getDate()}/${weekStart.getMonth()+1}`, avgRating:parseFloat(avg.toFixed(1)), count:all.length });
      weekStart = new Date(weekEnd.getTime()+86400000);
    }
    return weeks;
  }

  if (days > 365) {
    const years: RatingPoint[] = [];
    for (let yr = range.start.getFullYear(); yr <= range.end.getFullYear(); yr++) {
      const all: number[] = [];
      byKey.forEach((ratings, key) => { if (new Date(key).getFullYear() === yr) ratings.forEach(r => all.push(r)); });
      const avg = all.length ? all.reduce((a,b)=>a+b,0)/all.length : 0;
      years.push({ label: String(yr), avgRating: parseFloat(avg.toFixed(1)), count: all.length });
    }
    return years;
  }

  const months: RatingPoint[] = [];
  let cur = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
  while (cur <= range.end) {
    const yr = cur.getFullYear(), mo = cur.getMonth();
    const all: number[] = [];
    byKey.forEach((ratings, key) => {
      const d = new Date(key);
      if (d.getFullYear()===yr && d.getMonth()===mo) ratings.forEach(r=>all.push(r));
    });
    const avg = all.length ? all.reduce((a,b)=>a+b,0)/all.length : 0;
    months.push({ label:MON_SHORT[mo], avgRating:parseFloat(avg.toFixed(1)), count:all.length });
    cur = new Date(yr, mo+1, 1);
  }
  return months;
}

// ── Engagement points ──────────────────────────────────────────────────────────

function extractDates(snap: QuerySnapshot<DocumentData>): Date[] {
  const out: Date[] = [];
  snap.forEach(d => { const ts = d.data()['created_at'] as Timestamp|undefined; if (ts?.toDate) out.push(startOfDay(ts.toDate())); });
  return out;
}

function countByKey(dates: Date[], keyFn: (d: Date) => string): Map<string,number> {
  const map = new Map<string,number>();
  dates.forEach(d => { const k = keyFn(d); map.set(k, (map.get(k) ?? 0)+1); });
  return map;
}

async function fetchEngagementPoints(businessId: string, range: InsightDateRange): Promise<EngagementPoint[]> {
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

  if (days <= 14) {
    const rM = countByKey(rDates,isoDay), vM = countByKey(vDates,isoDay), sM = countByKey(sDates,isoDay);
    return Array.from({ length:days }, (_,i) => {
      const d = new Date(range.start.getTime()+i*86400000); const k = isoDay(d);
      return { label:`${d.getDate()}/${d.getMonth()+1}`, reviews:rM.get(k)??0, visits:vM.get(k)??0, searches:sM.get(k)??0 };
    });
  }

  if (days <= 60) {
    const points: EngagementPoint[] = [];
    let weekStart = range.start;
    while (weekStart <= range.end) {
      const weekEnd = new Date(Math.min(weekStart.getTime()+6*86400000, range.end.getTime()));
      let r=0, v=0, s=0, cur2=weekStart;
      while (cur2 <= weekEnd) {
        const k = isoDay(cur2);
        rDates.forEach(d => { if (isoDay(d)===k) r++; });
        vDates.forEach(d => { if (isoDay(d)===k) v++; });
        sDates.forEach(d => { if (isoDay(d)===k) s++; });
        cur2 = new Date(cur2.getTime()+86400000);
      }
      points.push({ label:`${weekStart.getDate()}/${weekStart.getMonth()+1}`, reviews:r, visits:v, searches:s });
      weekStart = new Date(weekEnd.getTime()+86400000);
    }
    return points;
  }

  if (days > 365) {
    const kFn = (d: Date) => String(d.getFullYear());
    const rM = countByKey(rDates,kFn), vM = countByKey(vDates,kFn), sM = countByKey(sDates,kFn);
    const years: EngagementPoint[] = [];
    for (let yr = range.start.getFullYear(); yr <= range.end.getFullYear(); yr++)
      years.push({ label:String(yr), reviews:rM.get(String(yr))??0, visits:vM.get(String(yr))??0, searches:sM.get(String(yr))??0 });
    return years;
  }

  const monthList: { yr:number; mo:number }[] = [];
  let cur = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
  while (cur <= range.end) { monthList.push({ yr:cur.getFullYear(), mo:cur.getMonth() }); cur = new Date(cur.getFullYear(), cur.getMonth()+1, 1); }
  const kFn = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
  const rM = countByKey(rDates,kFn), vM = countByKey(vDates,kFn), sM = countByKey(sDates,kFn);
  return monthList.map(({ yr, mo }) => ({ label:MON_SHORT[mo], reviews:rM.get(`${yr}-${mo}`)??0, visits:vM.get(`${yr}-${mo}`)??0, searches:sM.get(`${yr}-${mo}`)??0 }));
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export const useBusinessInsights = () => {
  const business = useBusinessOwnerStore((s) => s.business);
  const [mode, setMode]               = useState<InsightFilterMode>('WEEK');
  const [customRange, setCustomRange] = useState<InsightDateRange>({ start:startOfDay(new Date()), end:startOfDay(new Date()) });
  const [showCalendar, setShowCalendar] = useState(false);
  const [ratingPoints, setRatingPoints]         = useState<RatingPoint[]>([]);
  const [engagementPoints, setEngagementPoints] = useState<EngagementPoint[]>([]);
  const [isLoading, setIsLoading]               = useState(false);
  const [error, setError]                       = useState<string|null>(null);

  const activeRange = useMemo(() => rangeForInsightMode(mode, customRange), [mode, customRange]);

  const load = useCallback(async () => {
    if (!business?.id) return;
    setIsLoading(true); setError(null);
    try {
      const [pts, eng] = await Promise.all([
        fetchRatingPoints(business.id, activeRange),
        fetchEngagementPoints(business.id, activeRange),
      ]);
      setRatingPoints(pts); setEngagementPoints(eng);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load'); }
    finally { setIsLoading(false); }
  }, [business?.id, activeRange]);

  useEffect(() => { load(); }, [load]);

  return { business, mode, setMode, customRange, setCustomRange, showCalendar, setShowCalendar, activeRange, ratingPoints, engagementPoints, isLoading, error, refresh:load };
};
