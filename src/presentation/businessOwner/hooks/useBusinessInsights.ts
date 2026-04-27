import { useState, useCallback, useEffect, useMemo } from 'react';
import { useBusinessOwnerStore } from '../store/businessOwnerStore';
import { container } from '@/core/di/container';
import type { RatingPoint, EngagementPoint, InsightDateRange } from '@/data/businessOwnerInsights/datasources/boInsightsRemoteDataSource';

export type InsightFilterMode = 'ALL' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';
export type { InsightDateRange, RatingPoint, EngagementPoint };

function startOfDay(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

const APP_EPOCH = new Date(2020, 0, 1);

export function rangeForInsightMode(mode: InsightFilterMode, custom: InsightDateRange): InsightDateRange {
  const today = startOfDay(new Date());
  if (mode === 'ALL')   return { start: APP_EPOCH, end: today };
  if (mode === 'WEEK')  return { start: new Date(today.getTime()-6*86400000), end: today };
  if (mode === 'MONTH') return { start: new Date(today.getFullYear(),today.getMonth(),1), end: new Date(today.getFullYear(),today.getMonth()+1,0) };
  if (mode === 'YEAR')  return { start: new Date(today.getFullYear(),0,1), end: new Date(today.getFullYear(),11,31) };
  return custom;
}

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
        container.boInsightsDataSource.fetchRatingPoints(business.id, activeRange),
        container.boInsightsDataSource.fetchEngagementPoints(business.id, activeRange),
      ]);
      setRatingPoints(pts); setEngagementPoints(eng);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load'); }
    finally { setIsLoading(false); }
  }, [business?.id, activeRange]);

  useEffect(() => { load(); }, [load]);

  return { business, mode, setMode, customRange, setCustomRange, showCalendar, setShowCalendar, activeRange, ratingPoints, engagementPoints, isLoading, error, refresh:load };
};
