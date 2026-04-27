import React, { useState, useRef, useEffect } from 'react';
import { View, Modal, ScrollView, Pressable, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import type { OpeningHours, DayKey, DaySchedule } from '@/domain/business/entities/businessDetailEntity';

interface OpeningHoursModalProps {
  visible: boolean;
  initialHours?: OpeningHours;
  onClose: () => void;
  onSave: (hours: OpeningHours) => void;
}

const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DEFAULT_HOURS: OpeningHours = {
  monday:    { isOpen: true,  openTime: '09:00', closeTime: '18:00' },
  tuesday:   { isOpen: true,  openTime: '09:00', closeTime: '18:00' },
  wednesday: { isOpen: true,  openTime: '09:00', closeTime: '18:00' },
  thursday:  { isOpen: true,  openTime: '09:00', closeTime: '18:00' },
  friday:    { isOpen: true,  openTime: '09:00', closeTime: '18:00' },
  saturday:  { isOpen: false, openTime: '09:00', closeTime: '18:00' },
  sunday:    { isOpen: false, openTime: '09:00', closeTime: '18:00' },
};

const TRACK_W = 40;
const TRACK_H = 22;
const THUMB = 16;
const OFFSET = 3;

function MiniToggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  const tx = useRef(new Animated.Value(value ? TRACK_W - THUMB - OFFSET : OFFSET)).current;
  useEffect(() => {
    Animated.spring(tx, {
      toValue: value ? TRACK_W - THUMB - OFFSET : OFFSET,
      useNativeDriver: true,
      bounciness: 4,
      speed: 20,
    }).start();
  }, [value, tx]);
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={{
        width: TRACK_W, height: TRACK_H, borderRadius: TRACK_H / 2,
        backgroundColor: value ? colors.neonPurple : 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
      }}
    >
      <Animated.View style={{
        width: THUMB, height: THUMB, borderRadius: THUMB / 2,
        backgroundColor: value ? colors.white : colors.textSlate500,
        transform: [{ translateX: tx }],
      }} />
    </Pressable>
  );
}

function TimeStepper({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [h, m] = value.split(':').map(Number);
  const pad = (n: number) => String(n).padStart(2, '0');
  const setH = (nh: number) => onChange(`${pad((nh + 24) % 24)}:${pad(m)}`);
  const setM = (nm: number) => onChange(`${pad(h)}:${pad(((nm % 60) + 60) % 60)}`);
  const MINUTES = [0, 15, 30, 45];
  const nextM = MINUTES[(MINUTES.indexOf(Math.round(m / 15) * 15 % 60 as 0 | 15 | 30 | 45) + 1) % 4] ?? 0;
  const prevM = MINUTES[((MINUTES.indexOf(Math.round(m / 15) * 15 % 60 as 0 | 15 | 30 | 45) - 1) + 4) % 4] ?? 45;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <View style={{ alignItems: 'center', gap: 2 }}>
        <Pressable onPress={() => setH(h + 1)} accessibilityRole="button" hitSlop={6} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="chevron-up" size={16} color={colors.neonPurple} />
        </Pressable>
        <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white, width: 24, textAlign: 'center' }}>{pad(h)}</AppText>
        <Pressable onPress={() => setH(h - 1)} accessibilityRole="button" hitSlop={6} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="chevron-down" size={16} color={colors.neonPurple} />
        </Pressable>
      </View>
      <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.textSlate400, marginBottom: 2 }}>:</AppText>
      <View style={{ alignItems: 'center', gap: 2 }}>
        <Pressable onPress={() => setM(nextM)} accessibilityRole="button" hitSlop={6} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="chevron-up" size={16} color={colors.neonPurple} />
        </Pressable>
        <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white, width: 24, textAlign: 'center' }}>{pad(m)}</AppText>
        <Pressable onPress={() => setM(prevM)} accessibilityRole="button" hitSlop={6} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="chevron-down" size={16} color={colors.neonPurple} />
        </Pressable>
      </View>
    </View>
  );
}

export const OpeningHoursModal: React.FC<OpeningHoursModalProps> = ({ visible, initialHours, onClose, onSave }) => {
  const { t } = useTranslation();
  const [hours, setHours] = useState<OpeningHours>(initialHours ?? DEFAULT_HOURS);

  useEffect(() => {
    if (visible) setHours(initialHours ?? DEFAULT_HOURS);
  }, [visible, initialHours]);

  const updateDay = (day: DayKey, patch: Partial<DaySchedule>) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: colors.cardDark, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 32 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
            <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>
              {t('businessOwner.companyProfile.openingHours')}
            </AppText>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('common.cancel')} hitSlop={8} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="close" size={22} color={colors.textSlate400} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 }}>
            {DAY_KEYS.map((day) => {
              const sched = hours[day];
              return (
                <View key={day} style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <AppText style={{ fontSize: 14, fontWeight: '600', color: sched.isOpen ? colors.white : colors.textSlate500, width: 100 }}>
                      {t(`businessOwner.companyProfile.${day}`)}
                    </AppText>
                    <MiniToggle value={sched.isOpen} onToggle={() => updateDay(day, { isOpen: !sched.isOpen })} />
                  </View>
                  {sched.isOpen && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12, paddingLeft: 4 }}>
                      <TimeStepper value={sched.openTime} onChange={(v) => updateDay(day, { openTime: v })} />
                      <MaterialCommunityIcons name="arrow-right" size={14} color={colors.textSlate500} />
                      <TimeStepper value={sched.closeTime} onChange={(v) => updateDay(day, { closeTime: v })} />
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingTop: 16 }}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
              style={{ flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark, alignItems: 'center' }}
            >
              <AppText style={{ color: colors.textSlate400, fontWeight: '600' }}>{t('common.cancel')}</AppText>
            </Pressable>
            <Pressable
              onPress={() => onSave(hours)}
              accessibilityRole="button"
              accessibilityLabel={t('common.done')}
              style={{ flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: colors.neonPurple, alignItems: 'center' }}
            >
              <AppText style={{ color: colors.white, fontWeight: '700' }}>{t('common.done')}</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
