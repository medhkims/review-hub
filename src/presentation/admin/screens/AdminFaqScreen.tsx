import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
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
import { FaqEntity } from '@/domain/faq/entities/faqEntity';

type FormState = {
  question: string;
  answer: string;
  order: string;
};

const INITIAL_FORM: FormState = { question: '', answer: '', order: '' };

type FaqCardProps = {
  faq: FaqEntity;
  onEdit: (faq: FaqEntity) => void;
  onDelete: (faq: FaqEntity) => void;
  theme: ReturnType<typeof useTheme>;
};

const FaqCard = React.memo(({ faq, onEdit, onDelete, theme }: FaqCardProps) => (
  <View
    style={{
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      marginBottom: 10,
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
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
        </View>
        <AppText style={{ fontSize: 15, fontWeight: '600', color: theme.text, marginBottom: 6 }}>
          {faq.question}
        </AppText>
        <AppText style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 20 }} numberOfLines={3}>
          {faq.answer}
        </AppText>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={() => onEdit(faq)}
          accessibilityRole="button"
          accessibilityLabel="Edit FAQ"
          style={{
            padding: 6,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <MaterialCommunityIcons name="pencil-outline" size={18} color={theme.text} />
        </Pressable>
        <Pressable
          onPress={() => onDelete(faq)}
          accessibilityRole="button"
          accessibilityLabel="Delete FAQ"
          style={{
            padding: 6,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#fca5a5',
          }}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  </View>
));

export default function AdminFaqScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { faqs, isLoading, isSaving, error, createFaq, updateFaq, deleteFaq } = useAdminFaq();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqEntity | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = useCallback(() => {
    setEditingFaq(null);
    setForm({ question: '', answer: '', order: String(faqs.length + 1) });
    setFormError(null);
    setModalVisible(true);
  }, [faqs.length]);

  const openEdit = useCallback((faq: FaqEntity) => {
    setEditingFaq(faq);
    setForm({ question: faq.question, answer: faq.answer, order: String(faq.order) });
    setFormError(null);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback((faq: FaqEntity) => {
    Alert.alert(
      t('helpCenter.admin.deleteTitle'),
      t('helpCenter.admin.deleteConfirm', { question: faq.question }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: () => deleteFaq(faq.id),
        },
      ],
    );
  }, [deleteFaq, t]);

  const handleSave = useCallback(async () => {
    const question = form.question.trim();
    const answer = form.answer.trim();
    const order = parseInt(form.order, 10);

    if (!question) { setFormError(t('helpCenter.admin.errorQuestion')); return; }
    if (!answer) { setFormError(t('helpCenter.admin.errorAnswer')); return; }
    if (isNaN(order) || order < 1) { setFormError(t('helpCenter.admin.errorOrder')); return; }

    setFormError(null);
    let success: boolean;
    if (editingFaq) {
      success = await updateFaq(editingFaq.id, question, answer, order);
    } else {
      success = await createFaq(question, answer, order);
    }
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

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.text} />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {error && (
            <AppText style={{ color: '#ef4444', marginBottom: 12, fontSize: 13 }}>{error}</AppText>
          )}
          {faqs.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <MaterialCommunityIcons name="help-circle-outline" size={48} color={theme.textSecondary} />
              <AppText style={{ color: theme.textSecondary, marginTop: 12 }}>
                {t('helpCenter.admin.empty')}
              </AppText>
            </View>
          ) : (
            faqs.map((faq) => (
              <FaqCard key={faq.id} faq={faq} onEdit={openEdit} onDelete={handleDelete} theme={theme} />
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
            }}
          >
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
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenLayout>
  );
}
