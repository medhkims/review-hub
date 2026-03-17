import React, { useState, useMemo } from 'react';
import { View, Pressable } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import type { SubcategoryStat } from '../hooks/usePremiumInsights';

const PALETTE = [colors.neonPurple, colors.cyan, colors.orange, colors.pink, colors.yellow, colors.blue, colors.emerald, colors.indigo];

type FilterMode = 'all' | 'search' | 'clicks';

const FILTERS: { key: FilterMode; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }[] = [
  { key: 'all',    label: 'All',    icon: 'chart-donut',          color: colors.neonPurple },
  { key: 'search', label: 'Search', icon: 'text-search',          color: colors.cyan },
  { key: 'clicks', label: 'Clicks', icon: 'cursor-default-click', color: colors.orange },
];

function slicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const span = endAngle - startAngle;
  // Full circle — split into two 180° arcs (SVG can't draw a full arc in one command)
  if (span >= 2 * Math.PI - 0.001) {
    const top    = { x: cx,     y: cy - r };
    const bottom = { x: cx,     y: cy + r };
    return `M${cx},${cy} L${top.x},${top.y} A${r},${r} 0 1,1 ${bottom.x},${bottom.y} A${r},${r} 0 1,1 ${top.x},${top.y} Z`;
  }
  const s = { x: cx + r * Math.cos(startAngle), y: cy + r * Math.sin(startAngle) };
  const e = { x: cx + r * Math.cos(endAngle),   y: cy + r * Math.sin(endAngle) };
  const large = span > Math.PI ? 1 : 0;
  return `M${cx},${cy} L${s.x},${s.y} A${r},${r} 0 ${large},1 ${e.x},${e.y} Z`;
}

interface DonutChartProps { data: SubcategoryStat[]; size?: number }

export const DonutChart: React.FC<DonutChartProps> = ({ data, size = 160 }) => {
  const [filter, setFilter] = useState<FilterMode>('all');

  const cx = size / 2, cy = size / 2;
  const r = size * 0.38;
  const innerR = size * 0.24;
  /** how far outside the ring the % label floats (pixel distance from ring edge) */
  const labelGap = 18;
  const labelR = r + labelGap;

  const filtered = useMemo(() => data.map(d => ({
    ...d,
    activeCount: filter === 'search' ? d.findCount : filter === 'clicks' ? d.clickCount : d.count,
  })), [data, filter]);

  const total = filtered.reduce((s, d) => s + d.activeCount, 0);

  let start = -Math.PI / 2;
  const segments = filtered.map((item, i) => {
    const angle = total > 0 ? (item.activeCount / total) * 2 * Math.PI : 0;
    const midAngle = start + angle / 2;
    const seg = {
      ...item,
      startAngle: start,
      endAngle: start + angle,
      midAngle,
      pct: total > 0 ? Math.round((item.activeCount / total) * 100) : 0,
      color: PALETTE[i % PALETTE.length],
    };
    start += angle;
    return seg;
  });

  const centerLabel = filter === 'search' ? 'searches' : filter === 'clicks' ? 'clicks' : 'total';
  const activeFilter = FILTERS.find(f => f.key === filter)!;

  /**
   * SVG is rendered at `size` × `size`.
   * % labels are React Native <AppText> components positioned absolutely
   * around the SVG container, so they're never clipped by the SVG viewport.
   * Container size = size + 2 * labelGap  (room for labels on every side).
   */
  const containerSize = size + labelGap * 2;
  const offset = labelGap; // SVG sits `offset` from top-left of container

  return (
    <View style={{ gap: 14 }}>

      {/* ── Filter buttons ── */}
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
        {FILTERS.map(f => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${f.label}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: active ? f.color : 'rgba(255,255,255,0.1)',
                backgroundColor: active ? `${f.color}22` : 'transparent',
              }}
            >
              <MaterialCommunityIcons name={f.icon} size={13} color={active ? f.color : colors.textSlate400} />
              <AppText style={{ fontSize: 12, fontWeight: active ? '700' : '500', color: active ? f.color : colors.textSlate400 }}>
                {f.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {/* ── Donut + floating % labels ── */}
      <View style={{ alignItems: 'center' }}>
        {/* Outer container — large enough for the labels */}
        <View style={{ width: containerSize, height: containerSize }}>

          {/* SVG donut — centered inside container */}
          <View style={{ position: 'absolute', top: offset, left: offset }}>
            <Svg width={size} height={size}>
              {segments.map((seg, i) => (
                seg.activeCount > 0
                  ? <Path key={i} d={slicePath(cx, cy, r, seg.startAngle, seg.endAngle)} fill={seg.color} opacity={0.9} />
                  : null
              ))}
              <Circle cx={cx} cy={cy} r={innerR} fill={colors.cardDark} />
              <SvgText x={cx} y={cy - 5} fontSize="15" fontWeight="800" fill={colors.white} textAnchor="middle">
                {total}
              </SvgText>
              <SvgText x={cx} y={cy + 11} fontSize="9" fill={activeFilter.color} textAnchor="middle">
                {centerLabel}
              </SvgText>
            </Svg>
          </View>

          {/* % labels as RN Text — positioned absolutely, never clipped */}
          {segments.map((seg, i) => {
            if (seg.pct < 10) return null;
            // pixel center of the label relative to the outer container
            const lx = offset + cx + labelR * Math.cos(seg.midAngle);
            const ly = offset + cy + labelR * Math.sin(seg.midAngle);
            return (
              <AppText
                key={`pct-${i}`}
                style={{
                  position: 'absolute',
                  left: lx,
                  top: ly,
                  transform: [{ translateX: -14 }, { translateY: -7 }],
                  fontSize: 10,
                  fontWeight: '700',
                  color: seg.color,
                  width: 28,
                  textAlign: 'center',
                }}
              >
                {seg.pct}%
              </AppText>
            );
          })}
        </View>
      </View>

      {/* ── Legend — always shows ALL subcategories from original data ── */}
      <View style={{ gap: 10 }}>
        {data.map((item, i) => {
          const color = PALETTE[i % PALETTE.length];
          const ctr = item.findCount > 0 ? Math.round((item.clickCount / item.findCount) * 100) : 0;
          const seg = { ...item, color };
          return (
            <View key={i} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: seg.color }} />
                <AppText style={{ flex: 1, fontSize: 12, fontWeight: '600', color: colors.white }} numberOfLines={1}>
                  {seg.subcategory}
                </AppText>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 3,
                  paddingHorizontal: 7, paddingVertical: 2,
                  borderRadius: 10,
                  backgroundColor: `${colors.orange}22`,
                  borderWidth: 1, borderColor: `${colors.orange}44`,
                }}>
                  <MaterialCommunityIcons name="cursor-default-click" size={10} color={colors.orange} />
                  <AppText style={{ fontSize: 11, fontWeight: '700', color: colors.orange }}>{ctr}%</AppText>
                  <AppText style={{ fontSize: 9, color: colors.textSlate400 }}>click rate</AppText>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 16, paddingLeft: 18 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MaterialCommunityIcons name="text-search" size={12} color={colors.cyan} />
                  <AppText style={{ fontSize: 11, color: colors.cyan, fontWeight: '600' }}>{seg.findCount}</AppText>
                  <AppText style={{ fontSize: 10, color: colors.textSlate500 }}>searches</AppText>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MaterialCommunityIcons name="cursor-default-click" size={12} color={colors.orange} />
                  <AppText style={{ fontSize: 11, color: colors.orange, fontWeight: '600' }}>{seg.clickCount}</AppText>
                  <AppText style={{ fontSize: 10, color: colors.textSlate500 }}>profile views</AppText>
                </View>
              </View>
            </View>
          );
        })}
      </View>

    </View>
  );
};
