import React, { useMemo, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop, Rect, G } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

export interface InsightDataPoint { label: string; value: number }

interface InsightLineChartProps {
  data: InsightDataPoint[];
  title: string;
  accent: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  formatValue?: (v: number) => string;
  emptyLabel?: string;
}

const CHART_H = 160;
const PAD_L = 32; const PAD_R = 12; const PAD_T = 56; const PAD_B = 24;

export const InsightLineChart: React.FC<InsightLineChartProps> = ({
  data, title, accent, icon, formatValue, emptyLabel = 'No data yet',
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const CHART_W = Math.max(200, screenWidth - 64);
  const INNER_W = CHART_W - PAD_L - PAD_R;
  const INNER_H = CHART_H - PAD_T - PAD_B;
  const [selIdx, setSelIdx] = useState<number|null>(null);

  const fmt = formatValue ?? ((v: number) => String(v));
  const maxVal = useMemo(() => Math.max(...data.map(d=>d.value), 1), [data]);

  const pts = useMemo(() => data.map((d,i) => {
    const x = PAD_L + (i/Math.max(data.length-1,1))*INNER_W;
    const y = PAD_T + INNER_H - (d.value/maxVal)*INNER_H;
    return { x, y, ...d };
  }), [data, maxVal, INNER_W, INNER_H]);

  const pathD = useMemo(() => {
    if (!pts.length) return '';
    if (pts.length===1) return `M${pts[0].x},${pts[0].y}`;
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i=1; i<pts.length; i++) {
      const cp = (pts[i-1].x+pts[i].x)/2;
      d += ` C${cp},${pts[i-1].y} ${cp},${pts[i].y} ${pts[i].x},${pts[i].y}`;
    }
    return d;
  }, [pts]);

  const fillD = useMemo(() => {
    if (!pathD || !pts.length) return '';
    const bottom = PAD_T + INNER_H;
    return `${pathD} L${pts[pts.length-1].x},${bottom} L${pts[0].x},${bottom} Z`;
  }, [pathD, pts, INNER_H]);

  const gradId = `ig_${icon.replace(/[^a-z0-9]/gi, '')}`;

  const yLabels = useMemo(() => Array.from({length:4},(_,i)=>({
    value: maxVal/3*i,
    y: PAD_T+INNER_H-(i/3)*INNER_H,
  })), [maxVal, INNER_H]);

  const total = data.reduce((s,d)=>s+d.value,0);

  if (!data.length) return (
    <View style={{ backgroundColor:colors.cardDark, borderRadius:14, padding:20, marginBottom:16, borderWidth:1, borderColor:'rgba(255,255,255,0.05)', alignItems:'center', justifyContent:'center', height:120, gap:8 }}>
      <MaterialCommunityIcons name={icon} size={28} color={colors.textSlate600} />
      <AppText style={{ fontSize:13, color:colors.textSlate500 }}>{emptyLabel}</AppText>
    </View>
  );

  return (
    <View style={{ backgroundColor:colors.cardDark, borderRadius:14, padding:16, marginBottom:16, borderWidth:1, borderColor:'rgba(255,255,255,0.05)' }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:14 }}>
        <View style={{ width:32,height:32,borderRadius:8,backgroundColor:`${accent}1A`,borderWidth:1,borderColor:`${accent}33`,justifyContent:'center',alignItems:'center' }}>
          <MaterialCommunityIcons name={icon} size={16} color={accent} />
        </View>
        <View style={{ flex:1 }}>
          <AppText style={{ fontSize:13, fontWeight:'700', color:colors.white }}>{title}</AppText>
          <AppText style={{ fontSize:11, color:colors.textSlate400 }}>Total: {fmt(total)}</AppText>
        </View>
        <AppText style={{ fontSize:22, fontWeight:'800', color:accent }}>{fmt(total)}</AppText>
      </View>

      <Svg width={CHART_W} height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={accent} stopOpacity="0.35" />
            <Stop offset="1" stopColor={accent} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {selIdx!==null && <Rect x={0} y={0} width={CHART_W} height={CHART_H} fill="transparent" onPress={()=>setSelIdx(null)} />}
        {yLabels.map((yl,yi)=>(
          <React.Fragment key={yi}>
            <Line x1={PAD_L} y1={yl.y} x2={CHART_W-PAD_R} y2={yl.y} stroke={colors.borderDark} strokeWidth="0.8" strokeDasharray="3,3" />
            <SvgText x={PAD_L-4} y={yl.y+4} fontSize="9" fill={colors.textSlate500} textAnchor="end">{fmt(parseFloat(yl.value.toFixed(1)))}</SvgText>
          </React.Fragment>
        ))}
        {fillD ? <Path d={fillD} fill={`url(#${gradId})`} /> : null}
        {pathD ? <Path d={pathD} stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
        {pts.map((pt,i)=>{
          const isSel = selIdx===i;
          const show = i%Math.max(1,Math.ceil(pts.length/12))===0||i===pts.length-1;
          const TT_W=80,TT_H=42,ARR=6,GAP=4;
          const rawX=pt.x-TT_W/2;
          const ttX=Math.max(PAD_L,Math.min(rawX,CHART_W-PAD_R-TT_W));
          const aboveY=pt.y-TT_H-ARR-GAP;
          const above=aboveY>=0;
          const ttY=above?aboveY:pt.y+ARR+GAP;
          return (
            <G key={i} onPress={()=>setSelIdx(isSel?null:i)}>
              {isSel && <Line x1={pt.x} y1={PAD_T} x2={pt.x} y2={PAD_T+INNER_H} stroke={accent} strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />}
              {isSel && (
                <G>
                  <Rect x={ttX} y={ttY} width={TT_W} height={TT_H} rx="8" ry="8" fill={colors.midnight} stroke={accent} strokeWidth="1.5" />
                  {above
                    ? <Path d={`M${Math.max(ttX+8,Math.min(pt.x-ARR,ttX+TT_W-8))},${ttY+TT_H} L${pt.x},${ttY+TT_H+ARR} L${Math.max(ttX+8,Math.min(pt.x+ARR,ttX+TT_W-8))},${ttY+TT_H} Z`} fill={colors.midnight} stroke={accent} strokeWidth="1.5" />
                    : <Path d={`M${Math.max(ttX+8,Math.min(pt.x-ARR,ttX+TT_W-8))},${ttY} L${pt.x},${ttY-ARR} L${Math.max(ttX+8,Math.min(pt.x+ARR,ttX+TT_W-8))},${ttY} Z`} fill={colors.midnight} stroke={accent} strokeWidth="1.5" />
                  }
                  <SvgText x={ttX+TT_W/2} y={ttY+15} fontSize="10" fill={colors.textSlate400} textAnchor="middle">{pt.label}</SvgText>
                  <SvgText x={ttX+TT_W/2} y={ttY+32} fontSize="15" fill={accent} textAnchor="middle" fontWeight="700">{fmt(pt.value)}</SvgText>
                </G>
              )}
              <Circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />
              <Circle cx={pt.x} cy={pt.y} r={isSel?6:4} fill={isSel?accent:colors.midnight} stroke={accent} strokeWidth="2" />
              {show && <SvgText x={pt.x} y={CHART_H-4} fontSize="9" textAnchor="middle" fill={isSel?accent:colors.textSlate500} fontWeight={isSel?'700':'400'}>{pt.label}</SvgText>}
            </G>
          );
        })}
      </Svg>
    </View>
  );
};
