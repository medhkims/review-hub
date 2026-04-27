import { useState, useCallback, useEffect, useMemo } from 'react';
import { useBusinessOwnerStore } from '../store/businessOwnerStore';
import { container } from '@/core/di/container';
import { rangeForInsightMode, type InsightFilterMode, type InsightDateRange } from './useBusinessInsights';
import type {
  KeywordStat, SubcategoryStat, BoostRecord, BoostTimePoint,
  ProfileClickGroup, MenuItemStat, PeakDayStat, SentimentStat,
  MonthlyStat, AgeGroupStat, GenderStat,
} from '@/data/businessOwnerInsights/datasources/boInsightsRemoteDataSource';

export type { InsightFilterMode, InsightDateRange };
export type { KeywordStat, SubcategoryStat, BoostRecord, BoostTimePoint, ProfileClickGroup, MenuItemStat, PeakDayStat, SentimentStat, MonthlyStat, AgeGroupStat, GenderStat };
export interface ProfileClickItem { type: string; label: string; count: number }

function sod(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

export const usePremiumInsights = () => {
  const today = useMemo(() => sod(new Date()), []);
  const business = useBusinessOwnerStore(s => s.business);
  const initRange = useMemo<InsightDateRange>(() => ({ start: today, end: today }), [today]);
  const ds = container.boInsightsDataSource;

  const [keywords,       setKeywords]       = useState<KeywordStat[]>([]);
  const [subcatStats,    setSubcatStats]    = useState<SubcategoryStat[]>([]);
  const [kwLoading,      setKwLoading]      = useState(false);
  const [subcatLoading,  setSubcatLoading]  = useState(false);

  const [boostMode,      setBoostMode]      = useState<InsightFilterMode>('WEEK');
  const [boostCRange,    setBoostCRange]    = useState<InsightDateRange>(initRange);
  const [boostCal,       setBoostCal]       = useState(false);
  const boostRange = useMemo(() => rangeForInsightMode(boostMode, boostCRange), [boostMode, boostCRange]);
  const [boostPoints,    setBoostPoints]    = useState<BoostTimePoint[]>([]);
  const [boostHistory,   setBoostHistory]   = useState<BoostRecord[]>([]);
  const [boostLoading,   setBoostLoading]   = useState(false);
  const [activating,     setActivating]     = useState(false);

  const [profileMode,    setProfileMode]    = useState<InsightFilterMode>('WEEK');
  const [profileCRange,  setProfileCRange]  = useState<InsightDateRange>(initRange);
  const [profileCal,     setProfileCal]     = useState(false);
  const profileRange = useMemo(() => rangeForInsightMode(profileMode, profileCRange), [profileMode, profileCRange]);
  const [profileGroups,  setProfileGroups]  = useState<ProfileClickGroup[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  const [menuItems,      setMenuItems]      = useState<MenuItemStat[]>([]);
  const [menuLoading,    setMenuLoading]    = useState(false);

  const [peakDays,       setPeakDays]       = useState<PeakDayStat[]>([]);
  const [sentimentStats, setSentimentStats] = useState<SentimentStat[]>([]);
  const [favCount,       setFavCount]       = useState(0);

  const [monthlyStats,   setMonthlyStats]   = useState<MonthlyStat[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  const [ageStats,            setAgeStats]           = useState<AgeGroupStat[]>([]);
  const [genderStats,         setGenderStats]        = useState<GenderStat[]>([]);
  const [demographicsLoading, setDemographicsLoading] = useState(false);

  const loadKeywords = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    setKwLoading(true);
    try { setKeywords(await ds.fetchKeywords(biz.id)); } catch { setKeywords([]); }
    finally { setKwLoading(false); }
  }, [ds]);

  const loadSubcategoryStats = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    setSubcatLoading(true);
    try { setSubcatStats(await ds.fetchSubcategoryStats(biz.id)); } catch { setSubcatStats([]); }
    finally { setSubcatLoading(false); }
  }, [ds]);

  const loadBoostData = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    setBoostLoading(true);
    try {
      const { points, history } = await ds.fetchBoostData(biz.id, boostRange);
      setBoostPoints(points); setBoostHistory(history);
    } catch { setBoostPoints([]); }
    finally { setBoostLoading(false); }
  }, [boostRange, ds]);

  const loadProfileClicks = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    setProfileLoading(true);
    try { setProfileGroups(await ds.fetchProfileClicks(biz.id, profileRange, biz.contact as unknown as Record<string, unknown>, biz.deliveryServices)); } catch { setProfileGroups([]); }
    finally { setProfileLoading(false); }
  }, [profileRange, ds]);

  const loadMenuItems = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    setMenuLoading(true);
    try { setMenuItems(await ds.fetchMenuItems(biz.id)); } catch { setMenuItems([]); }
    finally { setMenuLoading(false); }
  }, [ds]);

  const loadAdditional = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    const result = await ds.fetchAdditionalInsights(biz.id);
    setPeakDays(result.peakDays); setSentimentStats(result.sentimentStats); setFavCount(result.favCount);
  }, [ds]);

  const loadMonthly = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    setMonthlyLoading(true);
    try { setMonthlyStats(await ds.fetchMonthlyStats(biz.id)); } catch { setMonthlyStats([]); }
    finally { setMonthlyLoading(false); }
  }, [ds]);

  const loadVisitorDemographics = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    setDemographicsLoading(true);
    try { const result = await ds.fetchVisitorDemographics(biz.id); setAgeStats(result.ageStats); setGenderStats(result.genderStats); } catch { setAgeStats([]); setGenderStats([]); }
    finally { setDemographicsLoading(false); }
  }, [ds]);

  const activateBoost = useCallback(async () => {
    const biz = useBusinessOwnerStore.getState().business;
    if (!biz?.id) return;
    setActivating(true);
    try { await ds.activateBoost(biz.id); await loadBoostData(); } catch { /* silently fail */ }
    finally { setActivating(false); }
  }, [loadBoostData, ds]);

  useEffect(() => { loadKeywords();            }, [loadKeywords]);
  useEffect(() => { loadSubcategoryStats();    }, [loadSubcategoryStats]);
  useEffect(() => { loadBoostData();           }, [loadBoostData]);
  useEffect(() => { loadProfileClicks();       }, [loadProfileClicks]);
  useEffect(() => { loadMenuItems();           }, [loadMenuItems]);
  useEffect(() => { loadAdditional();          }, [loadAdditional]);
  useEffect(() => { loadMonthly();             }, [loadMonthly]);
  useEffect(() => { loadVisitorDemographics(); }, [loadVisitorDemographics]);

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
