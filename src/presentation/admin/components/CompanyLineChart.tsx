import React, { useMemo, useState } from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop, Rect, G } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { CompanyRankItem } from '@/domain/admin/entities/adminDashboardEntity';

export type ChartPeriod = 'week' | 'month' | 'year';

interface ChartDataPoint {
  label: string;
  value: number;
  cumulative: number;
}

export interface ChartDateRange { start: Date; end: Date }

interface CompanyLineChartProps {
  companies: CompanyRankItem[];
  period: ChartPeriod;
  onPeriodChange: (p: ChartPeriod) => void;
  customRange: ChartDateRange | null;
  onOpenDatePicker: () => void;
}

function buildDataPoints(companies: CompanyRankItem[], period: ChartPeriod, from: Date | null, to: Date | null): ChartDataPoint[] {
  const now = new Date();
  const valid = companies.filter((c) => c.createdAt !== null) as (CompanyRankItem & { createdAt: Date })[];

  if (from && to) {
    // Custom range — group by day
    const days: ChartDataPoint[] = [];
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    const msPerDay = 86400000;
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / msPerDay) + 1);
    const step = totalDays <= 14 ? 1 : totalDays <= 60 ? Math.ceil(totalDays / 14) : Math.ceil(totalDays / 12);
    let cumulative = valid.filter((c) => c.createdAt < start).length;
    for (let i = 0; i < totalDays; i += step) {
      const day = new Date(start.getTime() + i * msPerDay);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      const added = valid.filter((c) => c.createdAt >= day && c.createdAt <= dayEnd).length;
      cumulative += added;
      days.push({
        label: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: added,
        cumulative,
      });
    }
    return days;
  }

  if (period === 'week') {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now);
      day.setDate(day.getDate() - (6 - i));
      day.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      const added = valid.filter((c) => c.createdAt >= day && c.createdAt <= dayEnd).length;
      const cumulative = valid.filter((c) => c.createdAt <= dayEnd).length;
      return {
        label: day.toLocaleDateString('en-US', { weekday: 'short' }),
        value: added,
        cumulative,
      };
    });
  }

  if (period === 'month') {
    return Array.from({ length: 4 }, (_, i) => {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      weekEnd.setHours(23, 59, 59, 999);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      const added = valid.filter((c) => c.createdAt >= weekStart && c.createdAt <= weekEnd).length;
      const cumulative = valid.filter((c) => c.createdAt <= weekEnd).length;
      return {
        label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: added,
        cumulative,
      };
    }).reverse();
  }

  // year — 12 months
  return Array.from({ length: 12 }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);
    const added = valid.filter((c) => c.createdAt >= month && c.createdAt <= monthEnd).length;
    const cumulative = valid.filter((c) => c.createdAt <= monthEnd).length;
    return {
      label: month.toLocaleDateString('en-US', { month: 'short' }),
      value: added,
      cumulative,
    };
  });
}

const CHART_H = 160;
const PAD_L = 28;
const PAD_R = 12;
const PAD_T = 56;   // room for tooltip above the highest point
const PAD_B = 24;

export const CompanyLineChart: React.FC<CompanyLineChartProps> = ({
  companies, period, onPeriodChange, customRange, onOpenDatePicker,
}) => {
  const dateFrom = customRange?.start ?? null;
  const dateTo = customRange?.end ?? null;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { width: screenWidth } = useWindowDimensions();
  // card = screenWidth - 32px margin - 32px internal padding
  const CHART_W = Math.max(200, screenWidth - 64);
  const INNER_W = CHART_W - PAD_L - PAD_R;
  const INNER_H = CHART_H - PAD_T - PAD_B;

  const data = useMemo(() => {
    setSelectedIndex(null);
    return buildDataPoints(companies, period, dateFrom, dateTo);
  }, [companies, period, dateFrom, dateTo]);

  const maxVal = useMemo(() => Math.max(...data.map((d) => d.cumulative), 1), [data]);

  const points = useMemo(() => data.map((d, i) => {
    const x = PAD_L + (i / Math.max(data.length - 1, 1)) * INNER_W;
    const y = PAD_T + INNER_H - (d.cumulative / maxVal) * INNER_H;
    return { x, y, ...d };
  }), [data, maxVal, INNER_W, INNER_H]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M${points[0].x},${points[0].y}`;
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = (points[i - 1].x + points[i].x) / 2;
      d += ` C${cp1x},${points[i - 1].y} ${cp1x},${points[i].y} ${points[i].x},${points[i].y}`;
    }
    return d;
  }, [points]);

  const fillD = useMemo(() => {
    if (points.length === 0) return '';
    const bottom = PAD_T + INNER_H;
    return `${pathD} L${points[points.length - 1].x},${bottom} L${points[0].x},${bottom} Z`;
  }, [pathD, points, INNER_H]);

  const yLabels = useMemo(() => {
    const steps = 3;
    return Array.from({ length: steps + 1 }, (_, i) => ({
      value: Math.round((maxVal / steps) * i),
      y: PAD_T + INNER_H - (i / steps) * INNER_H,
    }));
  }, [maxVal, INNER_H]);

  const isCustom = !!(dateFrom && dateTo);
  const PERIODS: { key: ChartPeriod; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];

  const MON_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function shortDate(d: Date) { return `${d.getDate()} ${MON_SHORT[d.getMonth()]} ${d.getFullYear()}`; }

  const rangeLabel = isCustom && dateFrom && dateTo
    ? (shortDate(dateFrom) === shortDate(dateTo) ? shortDate(dateFrom) : `${shortDate(dateFrom)}  →  ${shortDate(dateTo)}`)
    : period === 'week' ? 'Last 7 days'
    : period === 'month' ? 'Last 4 weeks'
    : 'Last 12 months';

  return (
    <View style={{
      marginHorizontal: 16, marginBottom: 16,
      backgroundColor: colors.cardDark, borderRadius: 16,
      borderWidth: 1, borderColor: colors.borderDark, padding: 16,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <AppText style={{ flex: 1, fontSize: 14, fontWeight: '700', color: colors.white }}>
          Company Growth
        </AppText>
        <AppText style={{ fontSize: 22, fontWeight: '800', color: colors.neonPurple }}>
          {companies.length}
        </AppText>
      </View>

      {/* Period pills + calendar — matches engagement details design */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        {PERIODS.map((p) => {
          const active = !isCustom && period === p.key;
          return (
            <Pressable
              key={p.key}
              onPress={() => onPeriodChange(p.key)}
              accessibilityRole="button"
              accessibilityLabel={p.label}
              accessibilityState={{ selected: active }}
              style={{
                flex: 1, paddingVertical: 10, borderRadius: 9999,
                alignItems: 'center',
                backgroundColor: active ? colors.neonPurple : colors.cardDark,
                borderWidth: 1, borderColor: active ? colors.neonPurple : colors.borderDark,
              }}
            >
              <AppText style={{ fontSize: 12, fontWeight: active ? '700' : '500', color: active ? colors.white : colors.textSlate400 }}>
                {p.label}
              </AppText>
            </Pressable>
          );
        })}
        {/* Icon-only calendar button */}
        <Pressable
          onPress={onOpenDatePicker}
          accessibilityRole="button"
          accessibilityLabel="Custom date range"
          style={{
            paddingHorizontal: 14, paddingVertical: 10, borderRadius: 9999,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: isCustom ? colors.neonPurple : colors.cardDark,
            borderWidth: 1, borderColor: isCustom ? colors.neonPurple : colors.borderDark,
          }}
        >
          <MaterialCommunityIcons name="calendar-month" size={18} color={isCustom ? colors.white : colors.textSlate400} />
        </Pressable>
      </View>

      {/* Range label */}
      <View style={{ marginBottom: 14 }}>
        <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>
          {'Showing: '}
          <AppText style={{ color: colors.neonPurple, fontWeight: '600' }}>
            {rangeLabel}
          </AppText>
        </AppText>
      </View>

      {/* SVG Chart */}
      <View style={{ width: '100%' }}>
        <Svg width={CHART_W} height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
          <Defs>
            <LinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.neonPurple} stopOpacity="0.35" />
              <Stop offset="1" stopColor={colors.neonPurple} stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Dismiss backdrop — clears selection on tap outside dots */}
          {selectedIndex !== null && (
            <Rect
              x={0} y={0} width={CHART_W} height={CHART_H}
              fill="transparent"
              onPress={() => setSelectedIndex(null)}
            />
          )}

          {/* Y-axis grid lines */}
          {yLabels.map((yl, yi) => (
            <React.Fragment key={yi}>
              <Line
                x1={PAD_L} y1={yl.y} x2={CHART_W - PAD_R} y2={yl.y}
                stroke={colors.borderDark} strokeWidth="0.8" strokeDasharray="3,3"
              />
              <SvgText
                x={PAD_L - 4} y={yl.y + 4}
                fontSize="9" fill={colors.textSlate500} textAnchor="end"
              >
                {yl.value}
              </SvgText>
            </React.Fragment>
          ))}

          {/* Fill area */}
          {fillD ? <Path d={fillD} fill="url(#lineGrad)" /> : null}

          {/* Line */}
          {pathD ? (
            <Path d={pathD} stroke={colors.neonPurple} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : null}

          {/* Data points + x labels */}
          {points.map((pt, i) => {
            const isSelected = selectedIndex === i;
            const showXLabel = i % Math.max(1, Math.ceil(points.length / 12)) === 0 || i === points.length - 1;

            // Tooltip layout
            const TT_W = 76;
            const TT_H = 42;
            const ARROW = 6;
            const GAP = 4;
            // Clamp X so tooltip stays within SVG
            const rawTtX = pt.x - TT_W / 2;
            const ttX = Math.max(PAD_L, Math.min(rawTtX, CHART_W - PAD_R - TT_W));
            // Flip below if not enough room above
            const aboveY = pt.y - TT_H - ARROW - GAP;
            const showAbove = aboveY >= 0;
            const ttY = showAbove ? aboveY : pt.y + ARROW + GAP;

            return (
              <G key={i} onPress={() => setSelectedIndex(isSelected ? null : i)}>
                {/* Vertical guide line */}
                {isSelected && (
                  <Line
                    x1={pt.x} y1={PAD_T} x2={pt.x} y2={PAD_T + INNER_H}
                    stroke={colors.neonPurple} strokeWidth="1" strokeDasharray="3,3" opacity="0.4"
                  />
                )}

                {/* Tooltip */}
                {isSelected && (
                  <G>
                    {/* Card */}
                    <Rect
                      x={ttX} y={ttY} width={TT_W} height={TT_H}
                      rx="8" ry="8"
                      fill={colors.midnight}
                      stroke={colors.neonPurple} strokeWidth="1.5"
                    />
                    {/* Arrow pointer */}
                    {showAbove ? (
                      <Path
                        d={`M${Math.max(ttX + 8, Math.min(pt.x - ARROW, ttX + TT_W - 8))},${ttY + TT_H} L${pt.x},${ttY + TT_H + ARROW} L${Math.max(ttX + 8, Math.min(pt.x + ARROW, ttX + TT_W - 8))},${ttY + TT_H} Z`}
                        fill={colors.midnight} stroke={colors.neonPurple} strokeWidth="1.5"
                      />
                    ) : (
                      <Path
                        d={`M${Math.max(ttX + 8, Math.min(pt.x - ARROW, ttX + TT_W - 8))},${ttY} L${pt.x},${ttY - ARROW} L${Math.max(ttX + 8, Math.min(pt.x + ARROW, ttX + TT_W - 8))},${ttY} Z`}
                        fill={colors.midnight} stroke={colors.neonPurple} strokeWidth="1.5"
                      />
                    )}
                    {/* Date label */}
                    <SvgText
                      x={ttX + TT_W / 2} y={ttY + 15}
                      fontSize="10" fill={colors.textSlate400} textAnchor="middle"
                    >
                      {pt.label}
                    </SvgText>
                    {/* Count */}
                    <SvgText
                      x={ttX + TT_W / 2} y={ttY + 32}
                      fontSize="15" fill={colors.neonPurple} textAnchor="middle" fontWeight="700"
                    >
                      {pt.cumulative}
                    </SvgText>
                  </G>
                )}

                {/* Hit area */}
                <Circle
                  cx={pt.x} cy={pt.y} r="16"
                  fill="transparent"
                />

                {/* Visible dot */}
                <Circle
                  cx={pt.x} cy={pt.y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? colors.neonPurple : colors.midnight}
                  stroke={colors.neonPurple} strokeWidth="2"
                />

                {/* X-axis label */}
                {showXLabel && (
                  <SvgText
                    x={pt.x} y={CHART_H - 4}
                    fontSize="9" textAnchor="middle"
                    fill={isSelected ? colors.neonPurple : colors.textSlate500}
                    fontWeight={isSelected ? '700' : '400'}
                  >
                    {pt.label}
                  </SvgText>
                )}
              </G>
            );
          })}
        </Svg>
      </View>

      <AppText style={{ fontSize: 11, color: colors.textSlate500, marginTop: 4, textAlign: 'center' }}>
        Cumulative company count over time
      </AppText>
    </View>
  );
};
