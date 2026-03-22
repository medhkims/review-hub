import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

export interface DateRange { start: Date; end: Date }

interface RangeCalendarProps {
  initial: DateRange;
  onConfirm: (range: DateRange) => void;
  onClose: () => void;
}

const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MON_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MON_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function startOfDay(d: Date): Date { return new Date(d.getFullYear(),d.getMonth(),d.getDate()); }
function shortDate(d: Date): string { return `${d.getDate()} ${MON_SHORT[d.getMonth()]} ${d.getFullYear()}`; }

export const RangeCalendar: React.FC<RangeCalendarProps> = ({ initial, onConfirm, onClose }) => {
  const theme = useTheme();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewMonth, setViewMonth] = useState(() => new Date(initial.start.getFullYear(), initial.start.getMonth(), 1));
  const [rangeStart, setRangeStart] = useState<Date|null>(startOfDay(initial.start));
  const [rangeEnd,   setRangeEnd]   = useState<Date|null>(startOfDay(initial.end));

  const handleDayPress = useCallback((date: Date) => {
    if (date > today) return;
    if (!rangeStart || rangeEnd) { setRangeStart(date); setRangeEnd(null); }
    else if (date < rangeStart) { setRangeEnd(rangeStart); setRangeStart(date); }
    else setRangeEnd(date);
  }, [rangeStart, rangeEnd, today]);

  const dayCells = useMemo(() => {
    const yr = viewMonth.getFullYear(), mo = viewMonth.getMonth();
    const firstDow = new Date(yr,mo,1).getDay();
    const last = new Date(yr,mo+1,0).getDate();
    const cells: (number|null)[] = Array(firstDow).fill(null);
    for (let d=1; d<=last; d++) cells.push(d);
    while (cells.length%7!==0) cells.push(null);
    return cells;
  }, [viewMonth]);

  const canGoNext = new Date(viewMonth.getFullYear(), viewMonth.getMonth()+1, 1) <= today;

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex:1,backgroundColor:'rgba(0,0,0,0.65)',justifyContent:'center',alignItems:'center' }} onPress={onClose}>
        <Pressable onPress={(e)=>e.stopPropagation()}
          style={{ backgroundColor:theme.card,borderRadius:20,padding:20,width:320,borderWidth:1,borderColor:theme.border }}>

          {/* Month nav */}
          <View style={{ flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
            <Pressable onPress={()=>setViewMonth(d=>new Date(d.getFullYear(),d.getMonth()-1,1))} style={{ padding:6 }} accessibilityRole="button" accessibilityLabel="Previous month">
              <MaterialCommunityIcons name="chevron-left" size={22} color={theme.textMuted} />
            </Pressable>
            <AppText style={{ fontSize:15,fontWeight:'700',color:theme.text }}>{MON_FULL[viewMonth.getMonth()]} {viewMonth.getFullYear()}</AppText>
            <Pressable onPress={()=>{ if(canGoNext) setViewMonth(d=>new Date(d.getFullYear(),d.getMonth()+1,1)); }} style={{ padding:6,opacity:canGoNext?1:0.3 }} accessibilityRole="button" accessibilityLabel="Next month">
              <MaterialCommunityIcons name="chevron-right" size={22} color={theme.textMuted} />
            </Pressable>
          </View>

          {/* DOW headers */}
          <View style={{ flexDirection:'row',marginBottom:6 }}>
            {DOW.map((d)=>(
              <View key={d} style={{ flex:1,alignItems:'center' }}>
                <AppText style={{ fontSize:10,fontWeight:'600',color:theme.textMuted }}>{d[0]}</AppText>
              </View>
            ))}
          </View>

          {/* Day grid */}
          {Array.from({length:dayCells.length/7},(_,row)=>(
            <View key={row} style={{ flexDirection:'row',marginBottom:2 }}>
              {dayCells.slice(row*7,row*7+7).map((day,col)=>{
                if (!day) return <View key={col} style={{ flex:1,height:36 }} />;
                const cellDate = new Date(viewMonth.getFullYear(),viewMonth.getMonth(),day);
                const isFuture = cellDate > today;
                const isStart  = !!rangeStart && cellDate.getTime()===rangeStart.getTime();
                const isEnd    = !!rangeEnd   && cellDate.getTime()===rangeEnd.getTime();
                const inRange  = !!rangeStart && !!rangeEnd && cellDate>rangeStart && cellDate<rangeEnd;
                const isSel    = isStart||isEnd;
                return (
                  <Pressable key={col} onPress={()=>handleDayPress(cellDate)} accessibilityRole="button" accessibilityLabel={String(day)}
                    style={{ flex:1,height:36,alignItems:'center',justifyContent:'center',opacity:isFuture?0.25:1,borderRadius:isSel?9999:inRange?0:9999,backgroundColor:isSel?colors.neonPurple:inRange?`${colors.neonPurple}30`:'transparent' }}>
                    <AppText style={{ fontSize:13,fontWeight:isSel?'700':'400',color:isSel?theme.text:inRange?colors.neonPurple:theme.textSecondary }}>{day}</AppText>
                  </Pressable>
                );
              })}
            </View>
          ))}

          {/* Range display */}
          <View style={{ marginTop:14,paddingTop:12,borderTopWidth:1,borderColor:theme.border,flexDirection:'row',justifyContent:'space-between' }}>
            <AppText style={{ fontSize:11,color:theme.textMuted }}>{'From: '}<AppText style={{ color:theme.text,fontWeight:'600' }}>{rangeStart?shortDate(rangeStart):'—'}</AppText></AppText>
            <AppText style={{ fontSize:11,color:theme.textMuted }}>{'To: '}<AppText style={{ color:theme.text,fontWeight:'600' }}>{rangeEnd?shortDate(rangeEnd):rangeStart?shortDate(rangeStart):'—'}</AppText></AppText>
          </View>

          {/* Actions */}
          <View style={{ flexDirection:'row',gap:10,marginTop:14 }}>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Cancel"
              style={{ flex:1,paddingVertical:12,borderRadius:9999,borderWidth:1,borderColor:theme.border,alignItems:'center' }}>
              <AppText style={{ fontSize:13,fontWeight:'600',color:theme.textMuted }}>Cancel</AppText>
            </Pressable>
            <Pressable onPress={()=>rangeStart&&onConfirm({start:rangeStart,end:rangeEnd??rangeStart})}
              accessibilityRole="button" accessibilityLabel="Confirm"
              style={{ flex:1,paddingVertical:12,borderRadius:9999,backgroundColor:rangeStart?colors.neonPurple:theme.border,alignItems:'center',opacity:rangeStart?1:0.5 }}>
              <AppText style={{ fontSize:13,fontWeight:'700',color:theme.text }}>Confirm</AppText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
