import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { useAdminFaq } from '@/presentation/admin/hooks/useAdminFaq';
import { AdminMenuButton } from '@/presentation/admin/components/AdminMenuButton';
import { useTheme } from '@/core/theme/useTheme';
import { FaqAudience, FaqEntity } from '@/domain/faq/entities/faqEntity';

type AudienceTab = FaqAudience;

type FormState = {
  question: string;
  answer: string;
  order: string;
  audiences: FaqAudience[];
};

const INITIAL_FORM: FormState = { question: '', answer: '', order: '', audiences: ['user'] };

const AUDIENCE_OPTIONS: FaqAudience[] = ['user', 'business', 'moderator'];

const AUDIENCE_COLORS: Record<FaqAudience, string> = {
  user: '#3b82f6',
  business: '#f59e0b',
  moderator: '#8b5cf6',
};

const ALL_AUDIENCES: FaqAudience[] = ['user', 'business', 'moderator'];

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

type TabBarProps = {
  selected: AudienceTab;
  onSelect: (tab: AudienceTab) => void;
  theme: ReturnType<typeof useTheme>;
  t: (key: string) => string;
};

const AudienceTabBar = React.memo(({ selected, onSelect, theme, t }: TabBarProps) => (
  <View
    style={{
      flexDirection: 'row',
      marginHorizontal: 16,
      marginTop: 14,
      marginBottom: 4,
      backgroundColor: theme.border,
      borderRadius: 10,
      padding: 3,
    }}
  >
    {AUDIENCE_OPTIONS.map((tab) => (
      <Pressable
        key={tab}
        onPress={() => onSelect(tab)}
        accessibilityRole="tab"
        accessibilityLabel={t(`helpCenter.tabs.${tab}`)}
        accessibilityState={{ selected: selected === tab }}
        style={{
          flex: 1,
          paddingVertical: 8,
          borderRadius: 8,
          alignItems: 'center',
          backgroundColor: selected === tab ? theme.card : 'transparent',
        }}
      >
        <AppText
          style={{
            fontSize: 13,
            fontWeight: selected === tab ? '700' : '400',
            color: selected === tab ? AUDIENCE_COLORS[tab] : theme.textSecondary,
          }}
        >
          {t(`helpCenter.tabs.${tab}`)}
        </AppText>
      </Pressable>
    ))}
  </View>
));

// ─── FAQ Card ─────────────────────────────────────────────────────────────────

type FaqCardProps = {
  faq: FaqEntity;
  confirmingDelete: boolean;
  onEdit: (faq: FaqEntity) => void;
  onRequestDelete: (faq: FaqEntity) => void;
  onConfirmDelete: (faq: FaqEntity) => void;
  onCancelDelete: () => void;
  theme: ReturnType<typeof useTheme>;
  t: (key: string) => string;
};

const FaqCard = React.memo(({
  faq,
  confirmingDelete,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  theme,
  t,
}: FaqCardProps) => {
  const isAll = faq.audience.length === 3;
  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: confirmingDelete ? '#fca5a5' : theme.border,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            <View
              style={{
                backgroundColor: theme.border,
                borderRadius: 6,
                paddingHorizontal: 7,
                paddingVertical: 2,
              }}
            >
              <AppText style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '600' }}>
                #{faq.order}
              </AppText>
            </View>
            {isAll ? (
              <View
                style={{
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  backgroundColor: '#10b98122',
                  borderWidth: 1,
                  borderColor: '#10b98155',
                }}
              >
                <AppText style={{ fontSize: 11, color: '#10b981', fontWeight: '600' }}>
                  {t('helpCenter.audience.all')}
                </AppText>
              </View>
            ) : (
              faq.audience.map((a) => (
                <View
                  key={a}
                  style={{
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    backgroundColor: AUDIENCE_COLORS[a] + '22',
                    borderWidth: 1,
                    borderColor: AUDIENCE_COLORS[a] + '55',
                  }}
                >
                  <AppText style={{ fontSize: 11, color: AUDIENCE_COLORS[a], fontWeight: '600' }}>
                    {t(`helpCenter.audience.${a}`)}
                  </AppText>
                </View>
              ))
            )}
          </View>
          <AppText style={{ fontSize: 15, fontWeight: '600', color: theme.text, marginBottom: 6 }}>
            {faq.question}
          </AppText>
          <AppText style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 20 }} numberOfLines={3}>
            {faq.answer}
          </AppText>
        </View>

        {!confirmingDelete && (
          <View style={{ flexDirection: 'column', gap: 6 }}>
            <Pressable
              onPress={() => onEdit(faq)}
              accessibilityRole="button"
              accessibilityLabel="Edit FAQ"
              hitSlop={8}
              style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}
            >
              <MaterialCommunityIcons name="pencil-outline" size={18} color={theme.text} />
            </Pressable>
            <Pressable
              onPress={() => onRequestDelete(faq)}
              accessibilityRole="button"
              accessibilityLabel="Delete FAQ"
              hitSlop={8}
              style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#fca5a5' }}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" />
            </Pressable>
          </View>
        )}
      </View>

      {confirmingDelete && (
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: '#fca5a5',
          }}
        >
          <AppText style={{ flex: 1, fontSize: 13, color: '#ef4444', fontWeight: '600', alignSelf: 'center' }}>
            {t('helpCenter.admin.deleteConfirmInline')}
          </AppText>
          <Pressable
            onPress={onCancelDelete}
            accessibilityRole="button"
            accessibilityLabel="Cancel delete"
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}
          >
            <AppText style={{ fontSize: 13, color: theme.textSecondary, fontWeight: '600' }}>{t('common.cancel')}</AppText>
          </Pressable>
          <Pressable
            onPress={() => onConfirmDelete(faq)}
            accessibilityRole="button"
            accessibilityLabel="Confirm delete"
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#ef4444' }}
          >
            <AppText style={{ fontSize: 13, color: '#fff', fontWeight: '700' }}>{t('helpCenter.admin.deleteConfirm')}</AppText>
          </Pressable>
        </View>
      )}
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AdminFaqScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { faqs, isLoading, isSaving, isSeeding, error, createFaq, updateFaq, deleteFaq, seedDefaultFaqs } = useAdminFaq();

  const [selectedTab, setSelectedTab] = useState<AudienceTab>('user');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqEntity | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const visibleFaqs = faqs.filter((f) => f.audience.includes(selectedTab));

  const openCreate = useCallback(() => {
    setEditingFaq(null);
    setForm({ question: '', answer: '', order: String(faqs.length + 1), audiences: [selectedTab] });
    setFormError(null);
    setConfirmDeleteId(null);
    setModalVisible(true);
  }, [faqs.length, selectedTab]);

  const openEdit = useCallback((faq: FaqEntity) => {
    setEditingFaq(faq);
    setForm({ question: faq.question, answer: faq.answer, order: String(faq.order), audiences: [...faq.audience] });
    setFormError(null);
    setConfirmDeleteId(null);
    setModalVisible(true);
  }, []);

  const handleRequestDelete = useCallback((faq: FaqEntity) => setConfirmDeleteId(faq.id), []);
  const handleCancelDelete = useCallback(() => setConfirmDeleteId(null), []);
  const handleConfirmDelete = useCallback(async (faq: FaqEntity) => {
    setConfirmDeleteId(null);
    await deleteFaq(faq.id);
  }, [deleteFaq]);

  const handleTabChange = useCallback((tab: AudienceTab) => {
    setSelectedTab(tab);
    setConfirmDeleteId(null);
  }, []);

  const toggleAudience = useCallback((opt: FaqAudience) => {
    setForm((prev) => {
      const already = prev.audiences.includes(opt);
      if (already && prev.audiences.length === 1) return prev; // keep at least 1
      return {
        ...prev,
        audiences: already
          ? prev.audiences.filter((a) => a !== opt)
          : [...prev.audiences, opt],
      };
    });
  }, []);

  const selectAllAudiences = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      audiences: prev.audiences.length === 3 ? ['user'] : [...ALL_AUDIENCES],
    }));
  }, []);

  const handleSave = useCallback(async () => {
    const question = form.question.trim();
    const answer = form.answer.trim();
    const order = parseInt(form.order, 10);

    if (!question) { setFormError(t('helpCenter.admin.errorQuestion')); return; }
    if (!answer) { setFormError(t('helpCenter.admin.errorAnswer')); return; }
    if (isNaN(order) || order < 1) { setFormError(t('helpCenter.admin.errorOrder')); return; }
    if (form.audiences.length === 0) { setFormError(t('helpCenter.admin.errorAudience')); return; }

    setFormError(null);
    const success = editingFaq
      ? await updateFaq(editingFaq.id, question, answer, order, form.audiences)
      : await createFaq(question, answer, order, form.audiences);
    if (success) setModalVisible(false);
  }, [form, editingFaq, createFaq, updateFaq, t]);

  return (
    <ScreenLayout>
      {/* Header */}
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <AdminMenuButton />
          <AppText style={{ fontSize: 17, fontWeight: '600', color: theme.text }}>
            {t('helpCenter.admin.title')}
          </AppText>
        </View>
        <Pressable
          onPress={openCreate}
          accessibilityRole="button"
          accessibilityLabel={t('helpCenter.admin.addFaq')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: theme.text,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <MaterialCommunityIcons name="plus" size={16} color={theme.card} />
          <AppText style={{ color: theme.card, fontSize: 14, fontWeight: '600' }}>
            {t('helpCenter.admin.addFaq')}
          </AppText>
        </Pressable>
      </View>

      {/* Audience Tabs */}
      <AudienceTabBar selected={selectedTab} onSelect={handleTabChange} theme={theme} t={t} />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.text} />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {error && (
            <AppText style={{ color: '#ef4444', marginBottom: 12, fontSize: 13 }}>{error}</AppText>
          )}
          {visibleFaqs.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <MaterialCommunityIcons name="help-circle-outline" size={48} color={theme.textSecondary} />
              <AppText style={{ color: theme.textSecondary, marginTop: 12, textAlign: 'center' }}>
                {t('helpCenter.admin.emptyTab')}
              </AppText>
              {faqs.length === 0 && (
                <Pressable
                  onPress={seedDefaultFaqs}
                  disabled={isSeeding}
                  accessibilityRole="button"
                  accessibilityLabel={t('helpCenter.admin.seedFaqs')}
                  style={{
                    marginTop: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: '#10b981',
                    backgroundColor: '#10b98112',
                  }}
                >
                  {isSeeding ? (
                    <ActivityIndicator size="small" color="#10b981" />
                  ) : (
                    <MaterialCommunityIcons name="database-import-outline" size={20} color="#10b981" />
                  )}
                  <AppText style={{ color: '#10b981', fontWeight: '700', fontSize: 14 }}>
                    {isSeeding ? t('helpCenter.admin.seeding') : t('helpCenter.admin.seedFaqs')}
                  </AppText>
                </Pressable>
              )}
            </View>
          ) : (
            visibleFaqs.map((faq) => (
              <FaqCard
                key={faq.id}
                faq={faq}
                confirmingDelete={confirmDeleteId === faq.id}
                onEdit={openEdit}
                onRequestDelete={handleRequestDelete}
                onConfirmDelete={handleConfirmDelete}
                onCancelDelete={handleCancelDelete}
                theme={theme}
                t={t}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* Create / Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View
            style={{
              backgroundColor: theme.card,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 36,
              borderTopWidth: 1,
              borderColor: theme.border,
              maxHeight: '92%',
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <AppText style={{ fontSize: 17, fontWeight: '700', color: theme.text }}>
                  {editingFaq ? t('helpCenter.admin.editFaq') : t('helpCenter.admin.addFaq')}
                </AppText>
                <Pressable onPress={() => setModalVisible(false)} accessibilityRole="button" accessibilityLabel={t('common.close')}>
                  <MaterialCommunityIcons name="close" size={22} color={theme.textSecondary} />
                </Pressable>
              </View>

              {formError && (
                <AppText style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{formError}</AppText>
              )}

              {/* Question */}
              <AppText style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 }}>
                {t('helpCenter.admin.questionLabel')}
              </AppText>
              <TextInput
                value={form.question}
                onChangeText={(v) => setForm((p) => ({ ...p, question: v }))}
                placeholder={t('helpCenter.admin.questionPlaceholder')}
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 10,
                  padding: 12,
                  color: theme.text,
                  fontSize: 14,
                  marginBottom: 14,
                  textAlignVertical: 'top',
                }}
              />

              {/* Answer */}
              <AppText style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 }}>
                {t('helpCenter.admin.answerLabel')}
              </AppText>
              <TextInput
                value={form.answer}
                onChangeText={(v) => setForm((p) => ({ ...p, answer: v }))}
                placeholder={t('helpCenter.admin.answerPlaceholder')}
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={5}
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 10,
                  padding: 12,
                  color: theme.text,
                  fontSize: 14,
                  marginBottom: 14,
                  textAlignVertical: 'top',
                }}
              />

              {/* Audience multi-select */}
              <AppText style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 8 }}>
                {t('helpCenter.admin.audienceLabel')}
              </AppText>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                {AUDIENCE_OPTIONS.map((opt) => {
                  const selected = form.audiences.includes(opt);
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => toggleAudience(opt)}
                      accessibilityRole="checkbox"
                      accessibilityLabel={t(`helpCenter.audience.${opt}`)}
                      accessibilityState={{ checked: selected }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: 14,
                        paddingVertical: 9,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: selected ? AUDIENCE_COLORS[opt] : theme.border,
                        backgroundColor: selected ? AUDIENCE_COLORS[opt] + '18' : 'transparent',
                      }}
                    >
                      <MaterialCommunityIcons
                        name={selected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={18}
                        color={selected ? AUDIENCE_COLORS[opt] : theme.textSecondary}
                      />
                      <AppText
                        style={{
                          fontSize: 13,
                          fontWeight: selected ? '700' : '400',
                          color: selected ? AUDIENCE_COLORS[opt] : theme.textSecondary,
                        }}
                      >
                        {t(`helpCenter.audience.${opt}`)}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
              {/* Select All toggle */}
              <Pressable
                onPress={selectAllAudiences}
                accessibilityRole="button"
                accessibilityLabel={t('helpCenter.admin.selectAll')}
                style={{
                  alignSelf: 'flex-start',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: form.audiences.length === 3 ? '#10b981' : theme.border,
                  backgroundColor: form.audiences.length === 3 ? '#10b98118' : 'transparent',
                  marginBottom: 16,
                }}
              >
                <AppText
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: form.audiences.length === 3 ? '#10b981' : theme.textSecondary,
                  }}
                >
                  {form.audiences.length === 3
                    ? t('helpCenter.admin.deselectAll')
                    : t('helpCenter.admin.selectAll')}
                </AppText>
              </Pressable>

              {/* Order */}
              <AppText style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 }}>
                {t('helpCenter.admin.orderLabel')}
              </AppText>
              <TextInput
                value={form.order}
                onChangeText={(v) => setForm((p) => ({ ...p, order: v }))}
                placeholder="1"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 10,
                  padding: 12,
                  color: theme.text,
                  fontSize: 14,
                  marginBottom: 20,
                  width: 80,
                }}
              />

              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel={t('common.save')}
                style={{
                  backgroundColor: isSaving ? theme.border : theme.text,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
              >
                {isSaving ? (
                  <ActivityIndicator color={theme.card} />
                ) : (
                  <AppText style={{ color: theme.card, fontWeight: '700', fontSize: 15 }}>
                    {t('common.save')}
                  </AppText>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenLayout>
  );
}
