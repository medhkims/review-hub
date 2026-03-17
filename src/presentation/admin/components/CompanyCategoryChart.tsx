import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { CompanyRankItem } from '@/domain/admin/entities/adminDashboardEntity';

interface CategoryStat {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

const PALETTE = [
  colors.neonPurple, colors.cyan, colors.pink, colors.green,
  colors.yellow, colors.orange, colors.blue, colors.indigo,
  colors.emerald, colors.red, colors.ratingGold, '#8B5CF6',
];

function buildCategoryStats(companies: CompanyRankItem[]): CategoryStat[] {
  const map = new Map<string, number>();
  companies.forEach((c) => {
    const key = c.categoryName || 'Uncategorized';
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  const total = companies.length || 1;
  const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  return sorted.map(([name, count], i) => ({
    name,
    count,
    percentage: Math.round((count / total) * 100),
    color: PALETTE[i % PALETTE.length],
  }));
}

const RADIUS = 56;
const STROKE = 22;
const SIZE = (RADIUS + STROKE / 2 + 4) * 2;
const CX = SIZE / 2;
const CY = SIZE / 2;

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const toRad = (a: number) => ((a - 90) * Math.PI) / 180;
  const start = { x: cx + r * Math.cos(toRad(startAngle)), y: cy + r * Math.sin(toRad(startAngle)) };
  const end = { x: cx + r * Math.cos(toRad(endAngle)), y: cy + r * Math.sin(toRad(endAngle)) };
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M${start.x},${start.y} A${r},${r} 0 ${largeArc} 1 ${end.x},${end.y}`;
}

interface CompanyCategoryChartProps {
  companies: CompanyRankItem[];
}

export const CompanyCategoryChart: React.FC<CompanyCategoryChartProps> = ({ companies }) => {
  const stats = useMemo(() => buildCategoryStats(companies), [companies]);

  const arcs = useMemo(() => {
    const total = stats.reduce((s, c) => s + c.count, 0) || 1;
    let currentAngle = 0;
    return stats.map((stat) => {
      const sweep = (stat.count / total) * 360;
      const end = currentAngle + sweep;
      const arc = describeArc(CX, CY, RADIUS, currentAngle, Math.min(end, currentAngle + sweep - 0.01));
      currentAngle = end;
      return { arc, color: stat.color, sweep };
    });
  }, [stats]);

  if (stats.length === 0) return null;

  return (
    <View style={{
      marginHorizontal: 16, marginBottom: 16,
      backgroundColor: colors.cardDark, borderRadius: 16,
      borderWidth: 1, borderColor: colors.borderDark, padding: 16,
    }}>
      <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white, marginBottom: 16 }}>
        Companies by Category
      </AppText>

      {/* Donut Chart — centered */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {stats.length === 1 ? (
            <Circle
              cx={CX} cy={CY} r={RADIUS}
              fill="none"
              stroke={stats[0].color}
              strokeWidth={STROKE}
            />
          ) : (
            <G>
              {arcs.map((a, i) => (
                <Path
                  key={i}
                  d={a.arc}
                  stroke={a.color}
                  strokeWidth={STROKE}
                  fill="none"
                  strokeLinecap="butt"
                />
              ))}
            </G>
          )}
          <Circle cx={CX} cy={CY} r={RADIUS - STROKE / 2} fill={colors.cardDark} />
        </Svg>
      </View>

      {/* Legend — explicit 2 columns, centered */}
      {(() => {
        const half = Math.ceil(stats.length / 2);
        const col1 = stats.slice(0, half);
        const col2 = stats.slice(half);
        const renderItem = (s: CategoryStat, i: number) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.color, flexShrink: 0, marginRight: 6 }} />
            <AppText style={{ fontSize: 11, color: colors.textSlate200, width: 80 }} numberOfLines={1}>
              {s.name}
            </AppText>
            <AppText style={{ fontSize: 11, fontWeight: '700', color: s.color, width: 20, textAlign: 'right' }}>
              {s.count}
            </AppText>
            <AppText style={{ fontSize: 10, color: colors.textSlate500, width: 30, textAlign: 'right' }}>
              {s.percentage}%
            </AppText>
          </View>
        );
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 56 }}>
            <View>{col1.map(renderItem)}</View>
            <View>{col2.map(renderItem)}</View>
          </View>
        );
      })()}
    </View>
  );
};
