import React, { useCallback, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { colors } from '@/core/theme/colors';

// ─── Shared data ─────────────────────────────────────────────────────────────

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const YEARS = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - 10 - i));

const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')} / ${String(d.getMonth() + 1).padStart(2, '0')} / ${d.getFullYear()}`;

// ─── Mobile scroll-wheel column ──────────────────────────────────────────────

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface ColumnPickerProps {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const ColumnPicker: React.FC<ColumnPickerProps> = ({ items, selectedIndex, onSelect }) => {
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      if (clamped !== selectedIndex) onSelect(clamped);
    },
    [items.length, selectedIndex, onSelect],
  );

  return (
    <View style={{ flex: 1, height: PICKER_HEIGHT, overflow: 'hidden' }}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: ITEM_HEIGHT * 2,
          left: 4,
          right: 4,
          height: ITEM_HEIGHT,
          borderRadius: 10,
          backgroundColor: 'rgba(168,85,247,0.15)',
          borderWidth: 1,
          borderColor: 'rgba(168,85,247,0.35)',
          zIndex: 1,
        }}
      />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        contentOffset={{ x: 0, y: selectedIndex * ITEM_HEIGHT }}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
      >
        {items.map((item, index) => (
          <View key={item} style={{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
            <AppText style={{
              fontSize: 16,
              fontWeight: index === selectedIndex ? '700' : '400',
              color: index === selectedIndex ? colors.textWhite : colors.textSlate500,
            }}>
              {item}
            </AppText>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// ─── Web click-to-select dropdown column ─────────────────────────────────────

interface WebDropdownProps {
  label: string;
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const WebDropdown: React.FC<WebDropdownProps> = ({ label, items, selectedIndex, onSelect }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <AppText style={{
        textAlign: 'center',
        fontSize: 11,
        color: colors.textSlate500,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
      }}>
        {label}
      </AppText>

      {/* Trigger */}
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: open ? colors.neonPurple : colors.borderDark,
          backgroundColor: open ? 'rgba(168,85,247,0.1)' : colors.cardDark,
        }}
      >
        <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.textWhite }}>
          {items[selectedIndex]}
        </AppText>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textSlate400}
        />
      </Pressable>

      {/* Dropdown list */}
      {open && (
        <View style={{
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.borderDark,
          backgroundColor: colors.cardDark,
          marginTop: 4,
          maxHeight: 200,
          overflow: 'hidden',
          zIndex: 10,
        }}>
          <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {items.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <Pressable
                  key={item}
                  onPress={() => { onSelect(index); setOpen(false); }}
                  accessibilityRole="button"
                  accessibilityLabel={item}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    backgroundColor: isSelected ? 'rgba(168,85,247,0.15)' : 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <AppText style={{
                    fontSize: 14,
                    fontWeight: isSelected ? '600' : '400',
                    color: isSelected ? colors.neonPurple : colors.textSlate200,
                  }}>
                    {item}
                  </AppText>
                  {isSelected && (
                    <MaterialCommunityIcons name="check" size={14} color={colors.neonPurple} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ─── Main BirthdayPicker ──────────────────────────────────────────────────────

interface BirthdayPickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
}

export const BirthdayPicker: React.FC<BirthdayPickerProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const now = value ?? new Date(2000, 0, 1);
  const [dayIdx, setDayIdx] = useState(now.getDate() - 1);
  const [monthIdx, setMonthIdx] = useState(now.getMonth());
  const [yearIdx, setYearIdx] = useState(
    Math.max(0, YEARS.indexOf(String(now.getFullYear()))),
  );

  const MONTHS = [
    t('common.months.jan'), t('common.months.feb'), t('common.months.mar'),
    t('common.months.apr'), t('common.months.may'), t('common.months.jun'),
    t('common.months.jul'), t('common.months.aug'), t('common.months.sep'),
    t('common.months.oct'), t('common.months.nov'), t('common.months.dec'),
  ];

  const handleConfirm = useCallback(() => {
    onChange(new Date(parseInt(YEARS[yearIdx], 10), monthIdx, dayIdx + 1));
    setOpen(false);
  }, [dayIdx, monthIdx, yearIdx, onChange]);

  const isWeb = Platform.OS === 'web';

  // ── Trigger button (same on both platforms) ──────────────────────────────

  const trigger = (
    <Pressable
      onPress={() => setOpen((v) => !v)}
      accessibilityRole="button"
      accessibilityLabel={t('auth.signUp.birthday')}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: open ? colors.neonPurple : colors.borderDark,
        backgroundColor: colors.cardDark,
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 16,
      }}
    >
      <MaterialCommunityIcons
        name="cake-variant-outline"
        size={18}
        color={value ? colors.neonPurple : colors.textSlate500}
      />
      <AppText style={{ flex: 1, fontSize: 15, color: value ? colors.textWhite : colors.textSlate500 }}>
        {value ? formatDate(value) : t('auth.signUp.birthdayPlaceholder')}
      </AppText>
      <MaterialCommunityIcons
        name={open ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={colors.textSlate400}
      />
    </Pressable>
  );

  // ── Web: inline dropdowns, no modal ──────────────────────────────────────

  if (isWeb) {
    return (
      <View style={{ marginBottom: 16 }}>
        <Pressable
          onPress={() => setOpen((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={t('auth.signUp.birthday')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 52,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: open ? colors.neonPurple : colors.borderDark,
            backgroundColor: colors.cardDark,
            paddingHorizontal: 16,
            gap: 10,
          }}
        >
          <MaterialCommunityIcons
            name="cake-variant-outline"
            size={18}
            color={value ? colors.neonPurple : colors.textSlate500}
          />
          <AppText style={{ flex: 1, fontSize: 15, color: value ? colors.textWhite : colors.textSlate500 }}>
            {value ? formatDate(value) : t('auth.signUp.birthdayPlaceholder')}
          </AppText>
          <MaterialCommunityIcons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSlate400}
          />
        </Pressable>

        {open && (
          <View style={{
            marginTop: 8,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.borderDark,
            backgroundColor: colors.cardDark,
            padding: 16,
          }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <WebDropdown
                label={t('common.date.day')}
                items={DAYS}
                selectedIndex={dayIdx}
                onSelect={setDayIdx}
              />
              <WebDropdown
                label={t('common.date.month')}
                items={MONTHS}
                selectedIndex={monthIdx}
                onSelect={setMonthIdx}
              />
              <WebDropdown
                label={t('common.date.year')}
                items={YEARS}
                selectedIndex={yearIdx}
                onSelect={setYearIdx}
              />
            </View>
            <AppButton
              title={t('common.confirm')}
              onPress={handleConfirm}
              size="lg"
              style={{ marginTop: 16, borderRadius: 12 }}
              accessibilityRole="button"
              accessibilityLabel={t('common.confirm')}
            />
          </View>
        )}
      </View>
    );
  }

  // ── Native: bottom-sheet modal with scroll-wheel ──────────────────────────

  return (
    <>
      {trigger}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.cardDark,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderColor: colors.borderDark,
              padding: 24,
            }}
          >
            <AppText style={{
              fontSize: 17,
              fontWeight: '700',
              color: colors.textWhite,
              textAlign: 'center',
              marginBottom: 20,
            }}>
              {t('auth.signUp.birthday')}
            </AppText>

            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              {[t('common.date.day'), t('common.date.month'), t('common.date.year')].map((label) => (
                <AppText key={label} style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 11,
                  color: colors.textSlate500,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}>
                  {label}
                </AppText>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 4 }}>
              <ColumnPicker items={DAYS} selectedIndex={dayIdx} onSelect={setDayIdx} />
              <ColumnPicker items={MONTHS} selectedIndex={monthIdx} onSelect={setMonthIdx} />
              <ColumnPicker items={YEARS} selectedIndex={yearIdx} onSelect={setYearIdx} />
            </View>

            <AppButton
              title={t('common.confirm')}
              onPress={handleConfirm}
              size="lg"
              style={{ marginTop: 20, borderRadius: 14 }}
              accessibilityRole="button"
              accessibilityLabel={t('common.confirm')}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};
