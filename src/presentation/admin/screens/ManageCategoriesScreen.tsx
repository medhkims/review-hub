import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Pressable,
  TextInput,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { ImageCropModal } from '@/presentation/shared/components/ui/ImageCropModal';
import { useImagePickerWithPreview } from '@/presentation/shared/hooks/useImagePickerWithPreview';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { container } from '@/core/di/container';
import { CategoryEntity } from '@/domain/business/entities/categoryEntity';
import { SubcategoryEntity } from '@/domain/business/entities/subcategoryEntity';
import { RatingCriterionEntity } from '@/domain/business/entities/ratingCriterionEntity';
import {
  DeletedCategoryItem,
  DeletedSubcategoryItem,
} from '@/domain/business/repositories/categoryRepository';
import { AdminMenuButton } from '../components/AdminMenuButton';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  confirmColor,
}: {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmColor?: string;
}) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: colors.cardDark, borderRadius: 16, padding: 20 }}>
          <AppText style={{ fontSize: 17, fontWeight: '700', color: colors.textWhite, marginBottom: 8 }}>{title}</AppText>
          <AppText style={{ color: colors.textSlate200, marginBottom: 20, lineHeight: 20 }}>{message}</AppText>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(51,65,85,0.4)', borderRadius: 8, padding: 12, alignItems: 'center' }} onPress={onCancel} accessibilityRole="button">
              <AppText style={{ color: colors.textSlate200 }}>{t('common.cancel')}</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, backgroundColor: confirmColor ?? colors.error, borderRadius: 8, padding: 12, alignItems: 'center' }} onPress={onConfirm} accessibilityRole="button">
              <AppText style={{ color: colors.white, fontWeight: '600' }}>{confirmLabel ?? t('common.confirm')}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Recover Category Modal (two choices) ─────────────────────────────────────
function RecoverCategoryModal({
  visible,
  category,
  onRecoverOnly,
  onRecoverWithSubs,
  onCancel,
}: {
  visible: boolean;
  category: CategoryEntity | null;
  onRecoverOnly: () => void;
  onRecoverWithSubs: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  if (!category) return null;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: colors.cardDark, borderRadius: 16, padding: 20 }}>
          <AppText style={{ fontSize: 17, fontWeight: '700', color: colors.textWhite, marginBottom: 8 }}>{t('manageCategories.recoverCategory')}</AppText>
          <AppText style={{ color: colors.textSlate200, marginBottom: 20, lineHeight: 20 }}>{t('manageCategories.recoverCategoryMessage', { name: category.name })}</AppText>
          <View style={{ gap: 10 }}>
            <TouchableOpacity style={{ backgroundColor: colors.primary, borderRadius: 8, padding: 13, alignItems: 'center' }} onPress={onRecoverWithSubs} accessibilityRole="button">
              <AppText style={{ color: colors.white, fontWeight: '600' }}>{t('manageCategories.recoverCategoryWithSubs')}</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: 'rgba(168,85,247,0.15)', borderRadius: 8, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: colors.primary }} onPress={onRecoverOnly} accessibilityRole="button">
              <AppText style={{ color: colors.primary, fontWeight: '600' }}>{t('manageCategories.recoverCategoryOnly')}</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: 'rgba(51,65,85,0.4)', borderRadius: 8, padding: 12, alignItems: 'center' }} onPress={onCancel} accessibilityRole="button">
              <AppText style={{ color: colors.textSlate200 }}>{t('common.cancel')}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── SubcategoryRow ────────────────────────────────────────────────────────────
function SubcategoryRow({
  sub,
  categoryId,
  onDelete,
  onEdit,
}: {
  sub: SubcategoryEntity;
  categoryId: string;
  onDelete: (categoryId: string, sub: SubcategoryEntity) => void;
  onEdit: (categoryId: string, sub: SubcategoryEntity) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingLeft: 20, paddingRight: 12, borderTopWidth: 1, borderTopColor: 'rgba(51,65,85,0.3)' }}>
      <MaterialCommunityIcons name="circle-small" size={16} color={colors.textSlate400} />
      <AppText style={{ flex: 1, color: colors.textSlate200, marginLeft: 4, fontSize: 14 }}>{sub.name}</AppText>
      <TouchableOpacity onPress={() => onEdit(categoryId, sub)} accessibilityRole="button" accessibilityLabel={t('manageCategories.editSubcategory')} style={{ marginRight: 14, padding: 4 }}>
        <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(categoryId, sub)} accessibilityRole="button" accessibilityLabel={t('manageCategories.deleteSubcategory')} style={{ padding: 4 }}>
        <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
}

// ── CategoryRow ───────────────────────────────────────────────────────────────
function CategoryRow({
  item,
  expanded,
  onToggle,
  onDeleteCategory,
  onDeleteSubcategory,
  onAddSubcategory,
  onEditCategory,
  onEditSubcategory,
}: {
  item: CategoryEntity;
  expanded: boolean;
  onToggle: (id: string) => void;
  onDeleteCategory: (category: CategoryEntity) => void;
  onDeleteSubcategory: (categoryId: string, sub: SubcategoryEntity) => void;
  onAddSubcategory: (categoryId: string) => void;
  onEditCategory: (category: CategoryEntity) => void;
  onEditSubcategory: (categoryId: string, sub: SubcategoryEntity) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ backgroundColor: colors.cardDark, borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark, marginBottom: 10, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
        <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => onToggle(item.id)} accessibilityRole="button" activeOpacity={0.7}>
          <MaterialCommunityIcons name={item.icon as IconName} size={22} color={colors.primary} style={{ marginRight: 10 }} />
          <AppText style={{ flex: 1, color: colors.textWhite, fontWeight: '600' }}>{item.name}</AppText>
          <AppText style={{ color: colors.textSlate400, fontSize: 12, marginRight: 6 }}>{item.subcategories.length} {t('manageCategories.subcategories')}</AppText>
          <MaterialCommunityIcons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSlate400} style={{ marginRight: 10 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onEditCategory(item)} accessibilityRole="button" style={{ padding: 6, marginRight: 4 }}>
          <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDeleteCategory(item)} accessibilityRole="button" style={{ padding: 6 }}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
      {expanded && (
        <>
          {item.subcategories.map((sub) => (
            <SubcategoryRow key={sub.id} sub={sub} categoryId={item.id} onDelete={onDeleteSubcategory} onEdit={onEditSubcategory} />
          ))}
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 10, paddingLeft: 20, borderTopWidth: 1, borderTopColor: 'rgba(51,65,85,0.3)' }} onPress={() => onAddSubcategory(item.id)} accessibilityRole="button">
            <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
            <AppText style={{ color: colors.primary, marginLeft: 6, fontSize: 13 }}>{t('manageCategories.addSubcategory')}</AppText>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// ── Deleted Tab ───────────────────────────────────────────────────────────────
function DeletedTab({
  deletedCategories,
  deletedSubcategories,
  isLoading,
  onRecoverCategory,
  onRecoverSubcategory,
}: {
  deletedCategories: DeletedCategoryItem[];
  deletedSubcategories: DeletedSubcategoryItem[];
  isLoading: boolean;
  onRecoverCategory: (category: CategoryEntity) => void;
  onRecoverSubcategory: (item: DeletedSubcategoryItem) => void;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  if (deletedCategories.length === 0 && deletedSubcategories.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
        <MaterialCommunityIcons name="delete-empty-outline" size={48} color={colors.textSlate400} />
        <AppText style={{ color: colors.textSlate400, fontSize: 15 }}>{t('manageCategories.emptyDeleted')}</AppText>
      </View>
    );
  }

  // Group deleted subcategories by parent category id
  const subsByParent: Record<string, { parent: CategoryEntity; subs: DeletedSubcategoryItem[] }> = {};
  for (const item of deletedSubcategories) {
    const pid = item.parentCategory.id;
    if (!subsByParent[pid]) subsByParent[pid] = { parent: item.parentCategory, subs: [] };
    subsByParent[pid].subs.push(item);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      {/* Deleted categories */}
      {deletedCategories.length > 0 && (
        <>
          <AppText style={{ color: colors.textSlate400, fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {t('manageCategories.deletedCategories')}
          </AppText>
          {deletedCategories.map(({ category }) => (
            <View key={category.id} style={{ backgroundColor: colors.cardDark, borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark, marginBottom: 10, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
                <MaterialCommunityIcons name={category.icon as IconName} size={22} color={colors.textSlate400} style={{ marginRight: 10 }} />
                <AppText style={{ flex: 1, color: colors.textSlate400, fontWeight: '600' }}>{category.name}</AppText>
                <AppText style={{ color: colors.textSlate400, fontSize: 11, marginRight: 10 }}>{category.subcategories.length} subs</AppText>
                <TouchableOpacity onPress={() => onRecoverCategory(category)} accessibilityRole="button" style={{ backgroundColor: 'rgba(168,85,247,0.15)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.primary }}>
                  <AppText style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>{t('manageCategories.recoverConfirm')}</AppText>
                </TouchableOpacity>
              </View>
              {category.subcategories.map((sub) => (
                <View key={sub.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingLeft: 20, paddingRight: 14, borderTopWidth: 1, borderTopColor: 'rgba(51,65,85,0.2)' }}>
                  <MaterialCommunityIcons name="circle-small" size={16} color={colors.textSlate400} />
                  <AppText style={{ flex: 1, color: colors.textSlate400, marginLeft: 4, fontSize: 13 }}>{sub.name}</AppText>
                </View>
              ))}
            </View>
          ))}
        </>
      )}

      {/* Deleted subcategories (from non-deleted categories) */}
      {Object.keys(subsByParent).length > 0 && (
        <>
          <AppText style={{ color: colors.textSlate400, fontSize: 12, fontWeight: '600', marginBottom: 8, marginTop: deletedCategories.length > 0 ? 12 : 0, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {t('manageCategories.deletedSubcategories')}
          </AppText>
          {Object.values(subsByParent).map(({ parent, subs }) => (
            <View key={parent.id} style={{ backgroundColor: colors.cardDark, borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark, marginBottom: 10, overflow: 'hidden' }}>
              {/* Parent header — gray because the category itself is active */}
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
                <MaterialCommunityIcons name={parent.icon as IconName} size={20} color={colors.textSlate400} style={{ marginRight: 10 }} />
                <AppText style={{ flex: 1, color: colors.textSlate400, fontWeight: '600', fontSize: 13 }}>{parent.name}</AppText>
              </View>
              {subs.map((item) => (
                <View key={item.subcategory.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingLeft: 20, paddingRight: 14, borderTopWidth: 1, borderTopColor: 'rgba(51,65,85,0.3)' }}>
                  <MaterialCommunityIcons name="circle-small" size={16} color={colors.textSlate400} />
                  <AppText style={{ flex: 1, color: colors.textSlate400, marginLeft: 4, fontSize: 14 }}>{item.subcategory.name}</AppText>
                  <TouchableOpacity onPress={() => onRecoverSubcategory(item)} accessibilityRole="button" style={{ backgroundColor: 'rgba(168,85,247,0.15)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.primary }}>
                    <AppText style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>{t('manageCategories.recoverConfirm')}</AppText>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

// ── Form Modals ───────────────────────────────────────────────────────────────
function CategoryFormModal({ visible, title, name, logoUri, isSaving, onChangeName, onPickLogo, onSave, onCancel }: {
  visible: boolean; title: string; name: string; logoUri: string | null; isSaving: boolean;
  onChangeName: (v: string) => void; onPickLogo: () => void; onSave: () => void; onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: colors.cardDark, borderRadius: 16, padding: 20 }}>
          <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.textWhite, marginBottom: 16 }}>{title}</AppText>
          <AppText style={{ color: colors.textSlate400, marginBottom: 6, fontSize: 13 }}>{t('manageCategories.categoryName')}</AppText>
          <TextInput value={name} onChangeText={onChangeName} placeholder={t('manageCategories.categoryNamePlaceholder')} placeholderTextColor={colors.textSlate400} style={{ backgroundColor: 'rgba(51,65,85,0.4)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: colors.textWhite, marginBottom: 12 }} />
          <AppText style={{ color: colors.textSlate400, marginBottom: 6, fontSize: 13 }}>{t('manageCategories.categoryLogo')}</AppText>
          <Pressable onPress={onPickLogo} accessibilityRole="button" style={({ pressed }) => ({ height: 80, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: logoUri ? colors.primary : colors.borderDark, backgroundColor: pressed ? 'rgba(168,85,247,0.08)' : 'rgba(51,65,85,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden' })}>
            {logoUri ? <Image source={{ uri: logoUri }} style={{ width: 80, height: 80, borderRadius: 10 }} resizeMode="cover" /> : <View style={{ alignItems: 'center', gap: 4 }}><MaterialCommunityIcons name="image-plus" size={24} color={colors.textSlate400} /><AppText style={{ color: colors.textSlate400, fontSize: 12 }}>{t('manageCategories.pickLogo')}</AppText></View>}
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(51,65,85,0.4)', borderRadius: 8, padding: 12, alignItems: 'center' }} onPress={onCancel}><AppText style={{ color: colors.textSlate200 }}>{t('common.cancel')}</AppText></TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 8, padding: 12, alignItems: 'center', opacity: isSaving ? 0.6 : 1 }} onPress={onSave} disabled={isSaving}>{isSaving ? <ActivityIndicator size="small" color={colors.white} /> : <AppText style={{ color: colors.white, fontWeight: '600' }}>{t('common.save')}</AppText>}</TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SubcategoryFormModal({ visible, title, name, isSaving, onChangeName, onSave, onCancel }: {
  visible: boolean; title: string; name: string; isSaving: boolean;
  onChangeName: (v: string) => void; onSave: () => void; onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: colors.cardDark, borderRadius: 16, padding: 20 }}>
          <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.textWhite, marginBottom: 16 }}>{title}</AppText>
          <AppText style={{ color: colors.textSlate400, marginBottom: 6, fontSize: 13 }}>{t('manageCategories.subcategoryName')}</AppText>
          <TextInput value={name} onChangeText={onChangeName} placeholder={t('manageCategories.subcategoryNamePlaceholder')} placeholderTextColor={colors.textSlate400} style={{ backgroundColor: 'rgba(51,65,85,0.4)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: colors.textWhite, marginBottom: 16 }} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(51,65,85,0.4)', borderRadius: 8, padding: 12, alignItems: 'center' }} onPress={onCancel}><AppText style={{ color: colors.textSlate200 }}>{t('common.cancel')}</AppText></TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 8, padding: 12, alignItems: 'center', opacity: isSaving ? 0.6 : 1 }} onPress={onSave} disabled={isSaving}>{isSaving ? <ActivityIndicator size="small" color={colors.white} /> : <AppText style={{ color: colors.white, fontWeight: '600' }}>{t('common.save')}</AppText>}</TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Criterion Form Modal ──────────────────────────────────────────────────────
function CriterionFormModal({
  visible, title, label, criterionKey, icon, isSaving,
  onChangeLabel, onChangeKey, onChangeIcon, onSave, onCancel,
}: {
  visible: boolean; title: string; label: string; criterionKey: string; icon: string; isSaving: boolean;
  onChangeLabel: (v: string) => void; onChangeKey: (v: string) => void; onChangeIcon: (v: string) => void;
  onSave: () => void; onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: colors.cardDark, borderRadius: 16, padding: 20 }}>
          <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.textWhite, marginBottom: 16 }}>{title}</AppText>
          <AppText style={{ color: colors.textSlate400, marginBottom: 6, fontSize: 13 }}>{t('manageCategories.criterionLabel')}</AppText>
          <TextInput
            value={label} onChangeText={onChangeLabel}
            placeholder={t('manageCategories.criterionLabelPlaceholder')}
            placeholderTextColor={colors.textSlate400}
            style={{ backgroundColor: 'rgba(51,65,85,0.4)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: colors.textWhite, marginBottom: 12 }}
          />
          <AppText style={{ color: colors.textSlate400, marginBottom: 6, fontSize: 13 }}>{t('manageCategories.criterionKey')}</AppText>
          <TextInput
            value={criterionKey} onChangeText={onChangeKey}
            placeholder={t('manageCategories.criterionKeyPlaceholder')}
            placeholderTextColor={colors.textSlate400}
            style={{ backgroundColor: 'rgba(51,65,85,0.4)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: colors.textWhite, marginBottom: 12 }}
          />
          <AppText style={{ color: colors.textSlate400, marginBottom: 6, fontSize: 13 }}>{t('manageCategories.criterionIcon')}</AppText>
          <TextInput
            value={icon} onChangeText={onChangeIcon}
            placeholder={t('manageCategories.criterionIconPlaceholder')}
            placeholderTextColor={colors.textSlate400}
            style={{ backgroundColor: 'rgba(51,65,85,0.4)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: colors.textWhite, marginBottom: 16 }}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(51,65,85,0.4)', borderRadius: 8, padding: 12, alignItems: 'center' }} onPress={onCancel} accessibilityRole="button">
              <AppText style={{ color: colors.textSlate200 }}>{t('common.cancel')}</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 8, padding: 12, alignItems: 'center', opacity: isSaving ? 0.6 : 1 }} onPress={onSave} disabled={isSaving} accessibilityRole="button">
              {isSaving ? <ActivityIndicator size="small" color={colors.white} /> : <AppText style={{ color: colors.white, fontWeight: '600' }}>{t('common.save')}</AppText>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Rating Criteria Card ──────────────────────────────────────────────────────
function RatingCriteriaCard({
  categories,
  onAddCriterion,
  onEditCriterion,
  onDeleteCriterion,
}: {
  categories: CategoryEntity[];
  onAddCriterion: (categoryId: string) => void;
  onEditCriterion: (categoryId: string, criterion: RatingCriterionEntity, index: number) => void;
  onDeleteCriterion: (categoryId: string, criterion: RatingCriterionEntity) => void;
}) {
  const { t } = useTranslation();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  return (
    <View style={{ backgroundColor: colors.cardDark, borderRadius: 14, borderWidth: 1, borderColor: colors.borderDark, overflow: 'hidden' }}>
      {categories.map((cat) => {
        const expanded = expandedIds.has(cat.id);
        return (
          <View key={cat.id} style={{ borderTopWidth: 1, borderTopColor: 'rgba(51,65,85,0.3)' }}>
            {/* Category row */}
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 }}
              onPress={() => toggle(cat.id)}
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name={cat.icon as IconName} size={18} color={colors.primary} style={{ marginRight: 8 }} />
              <AppText style={{ flex: 1, color: colors.textWhite, fontWeight: '600', fontSize: 14 }}>{cat.name}</AppText>
              <AppText style={{ color: colors.textSlate400, fontSize: 12, marginRight: 6 }}>{cat.ratingCriteria.length} {t('manageCategories.ratingCriteriaCard').toLowerCase()}</AppText>
              <MaterialCommunityIcons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSlate400} />
            </TouchableOpacity>

            {expanded && (
              <>
                {cat.ratingCriteria.length === 0 && (
                  <View style={{ paddingLeft: 40, paddingRight: 14, paddingVertical: 8 }}>
                    <AppText style={{ color: colors.textSlate400, fontSize: 13 }}>{t('manageCategories.ratingCriteriaEmpty')}</AppText>
                  </View>
                )}
                {cat.ratingCriteria.map((criterion, idx) => (
                  <View key={`${criterion.key}-${idx}`} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingLeft: 36, paddingRight: 12, borderTopWidth: 1, borderTopColor: 'rgba(51,65,85,0.2)' }}>
                    <MaterialCommunityIcons name={criterion.icon as IconName} size={16} color={colors.textSlate400} style={{ marginRight: 8 }} />
                    <AppText style={{ flex: 1, color: colors.textSlate200, fontSize: 13 }}>{criterion.label}</AppText>
                    <AppText style={{ color: colors.textSlate400, fontSize: 11, marginRight: 10 }}>{criterion.key}</AppText>
                    <TouchableOpacity onPress={() => onEditCriterion(cat.id, criterion, idx)} accessibilityRole="button" style={{ marginRight: 10, padding: 4 }}>
                      <MaterialCommunityIcons name="pencil-outline" size={15} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDeleteCriterion(cat.id, criterion)} accessibilityRole="button" style={{ padding: 4 }}>
                      <MaterialCommunityIcons name="trash-can-outline" size={15} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingLeft: 36, paddingRight: 14, borderTopWidth: 1, borderTopColor: 'rgba(51,65,85,0.2)' }}
                  onPress={() => onAddCriterion(cat.id)}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons name="plus" size={15} color={colors.primary} />
                  <AppText style={{ color: colors.primary, marginLeft: 6, fontSize: 13 }}>{t('manageCategories.addCriterion')}</AppText>
                </TouchableOpacity>
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export function ManageCategoriesScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'active' | 'deleted'>('active');

  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [isLoadingActive, setIsLoadingActive] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [subTab, setSubTab] = useState<null | 'categories' | 'rating'>(null);
  const [criteriaTab, setCriteriaTab] = useState<'active' | 'deleted'>('active');

  const [deletedCategories, setDeletedCategories] = useState<DeletedCategoryItem[]>([]);
  const [deletedSubcategories, setDeletedSubcategories] = useState<DeletedSubcategoryItem[]>([]);
  const [isLoadingDeleted, setIsLoadingDeleted] = useState(false);
  const [deletedLoaded, setDeletedLoaded] = useState(false);

  const [addCategoryVisible, setAddCategoryVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLogoUri, setNewCategoryLogoUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [addSubVisible, setAddSubVisible] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [newSubName, setNewSubName] = useState('');

  const [editCategoryVisible, setEditCategoryVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryEntity | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryLogoUri, setEditCategoryLogoUri] = useState<string | null>(null);

  const [editSubVisible, setEditSubVisible] = useState(false);
  const [editingSubCategoryId, setEditingSubCategoryId] = useState('');
  const [editingSub, setEditingSub] = useState<SubcategoryEntity | null>(null);
  const [editSubName, setEditSubName] = useState('');

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => undefined);

  const [recoverCatVisible, setRecoverCatVisible] = useState(false);
  const [recoveringCategory, setRecoveringCategory] = useState<CategoryEntity | null>(null);

  const [recoverSubVisible, setRecoverSubVisible] = useState(false);

  // ── Rating Criteria state ──
  const [criterionCategoryId, setCriterionCategoryId] = useState('');
  const [addCriterionVisible, setAddCriterionVisible] = useState(false);
  const [newCriterionLabel, setNewCriterionLabel] = useState('');
  const [newCriterionKey, setNewCriterionKey] = useState('');
  const [newCriterionIcon, setNewCriterionIcon] = useState('');

  const [editCriterionVisible, setEditCriterionVisible] = useState(false);
  const [editingCriterionIndex, setEditingCriterionIndex] = useState(-1);
  const [editCriterionLabel, setEditCriterionLabel] = useState('');
  const [editCriterionKey, setEditCriterionKey] = useState('');
  const [editCriterionIcon, setEditCriterionIcon] = useState('');
  const [recoveringSubItem, setRecoveringSubItem] = useState<DeletedSubcategoryItem | null>(null);

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    setConfirmTitle(title); setConfirmMessage(message); setConfirmAction(() => onConfirm); setConfirmVisible(true);
  }, []);

  const loadActive = useCallback(async () => {
    setIsLoadingActive(true);
    const result = await container.getCategoriesForAdminUseCase.execute();
    result.fold(() => setIsLoadingActive(false), (data) => { setCategories(data); setIsLoadingActive(false); });
  }, []);

  const loadDeleted = useCallback(async () => {
    setIsLoadingDeleted(true);
    const result = await container.getDeletedCategoryItemsUseCase.execute();
    result.fold(
      () => setIsLoadingDeleted(false),
      ({ deletedCategories: dc, deletedSubcategories: ds }) => { setDeletedCategories(dc); setDeletedSubcategories(ds); setIsLoadingDeleted(false); setDeletedLoaded(true); },
    );
  }, []);

  useEffect(() => { loadActive(); }, [loadActive]);

  const handleTabChange = useCallback((next: 'active' | 'deleted') => {
    setTab(next);
    // Only reset to landing when NOT already inside the Category sub-screen
    if (subTab !== 'categories') setSubTab(null);
    setCriteriaTab('active');
    if (next === 'deleted' && !deletedLoaded) loadDeleted();
  }, [subTab, deletedLoaded, loadDeleted]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }, []);

  const handleDeleteCategory = useCallback((category: CategoryEntity) => {
    showConfirm(
      t('manageCategories.deleteCategory'),
      t('manageCategories.deleteCategoryConfirm', { name: category.name }),
      async () => {
        setConfirmVisible(false);
        const result = await container.softDeleteCategoryUseCase.execute(category.id);
        result.fold(() => undefined, () => { setCategories((prev) => prev.filter((c) => c.id !== category.id)); setDeletedLoaded(false); });
      },
    );
  }, [t, showConfirm]);

  const handleDeleteSubcategory = useCallback((categoryId: string, sub: SubcategoryEntity) => {
    showConfirm(
      t('manageCategories.deleteSubcategory'),
      t('manageCategories.deleteSubcategoryConfirm', { name: sub.name }),
      async () => {
        setConfirmVisible(false);
        const result = await container.softDeleteSubcategoryUseCase.execute(categoryId, sub.id);
        result.fold(() => undefined, () => { setCategories((prev) => prev.map((c) => c.id === categoryId ? { ...c, subcategories: c.subcategories.filter((s) => s.id !== sub.id) } : c)); setDeletedLoaded(false); });
      },
    );
  }, [t, showConfirm]);

  const openAddSubcategory = useCallback((categoryId: string) => { setTargetCategoryId(categoryId); setNewSubName(''); setAddSubVisible(true); }, []);
  const openEditCategory = useCallback((category: CategoryEntity) => { setEditingCategory(category); setEditCategoryName(category.name); setEditCategoryLogoUri(category.logoUrl ?? null); setEditCategoryVisible(true); }, []);
  const openEditSubcategory = useCallback((categoryId: string, sub: SubcategoryEntity) => { setEditingSubCategoryId(categoryId); setEditingSub(sub); setEditSubName(sub.name); setEditSubVisible(true); }, []);

  const newLogoPicker = useImagePickerWithPreview({
    aspect: [1, 1],
    quality: 0.8,
    onSelected: useCallback((uri: string) => { setNewCategoryLogoUri(uri); }, []),
  });

  const editLogoPicker = useImagePickerWithPreview({
    aspect: [1, 1],
    quality: 0.8,
    onSelected: useCallback((uri: string) => { setEditCategoryLogoUri(uri); }, []),
  });

  const handleAddCategory = useCallback(async () => {
    if (!newCategoryName.trim()) return;
    setIsSaving(true);
    const result = await container.addCategoryUseCase.execute(newCategoryName.trim(), 'shape', newCategoryLogoUri ?? undefined);
    result.fold(() => setIsSaving(false), (entity) => { setCategories((prev) => [...prev, entity]); setIsSaving(false); setAddCategoryVisible(false); setNewCategoryName(''); setNewCategoryLogoUri(null); });
  }, [newCategoryName, newCategoryLogoUri]);

  const handleEditCategory = useCallback(async () => {
    if (!editCategoryName.trim() || !editingCategory) return;
    setIsSaving(true);
    const result = await container.updateCategoryUseCase.execute(editingCategory.id, editCategoryName.trim(), editingCategory.icon, editCategoryLogoUri ?? undefined);
    result.fold(() => setIsSaving(false), (entity) => { setCategories((prev) => prev.map((c) => (c.id === entity.id ? { ...entity, subcategories: c.subcategories } : c))); setIsSaving(false); setEditCategoryVisible(false); setEditingCategory(null); });
  }, [editingCategory, editCategoryName, editCategoryLogoUri]);

  const handleAddSubcategory = useCallback(async () => {
    if (!newSubName.trim()) return;
    setIsSaving(true);
    const result = await container.addSubcategoryUseCase.execute(targetCategoryId, newSubName.trim());
    result.fold(() => setIsSaving(false), (entity) => { setCategories((prev) => prev.map((c) => c.id === targetCategoryId ? { ...c, subcategories: [...c.subcategories, entity] } : c)); setIsSaving(false); setAddSubVisible(false); setNewSubName(''); });
  }, [targetCategoryId, newSubName]);

  const handleEditSubcategory = useCallback(async () => {
    if (!editSubName.trim() || !editingSub) return;
    setIsSaving(true);
    const result = await container.updateSubcategoryUseCase.execute(editingSubCategoryId, editingSub.id, editSubName.trim());
    result.fold(() => setIsSaving(false), (entity) => { setCategories((prev) => prev.map((c) => c.id === editingSubCategoryId ? { ...c, subcategories: c.subcategories.map((s) => (s.id === entity.id ? entity : s)) } : c)); setIsSaving(false); setEditSubVisible(false); setEditingSub(null); });
  }, [editingSubCategoryId, editingSub, editSubName]);

  const handleRecoverCategoryOnly = useCallback(async () => {
    if (!recoveringCategory) return;
    setRecoverCatVisible(false);
    const result = await container.recoverCategoryUseCase.execute(recoveringCategory.id, false);
    result.fold(() => undefined, () => { loadActive(); loadDeleted(); });
  }, [recoveringCategory, loadActive, loadDeleted]);

  const handleRecoverCategoryWithSubs = useCallback(async () => {
    if (!recoveringCategory) return;
    setRecoverCatVisible(false);
    const result = await container.recoverCategoryUseCase.execute(recoveringCategory.id, true);
    result.fold(() => undefined, () => { loadActive(); loadDeleted(); });
  }, [recoveringCategory, loadActive, loadDeleted]);

  const handleRecoverSubcategory = useCallback(async () => {
    if (!recoveringSubItem) return;
    setRecoverSubVisible(false);
    const result = await container.recoverSubcategoryUseCase.execute(recoveringSubItem.parentCategory.id, recoveringSubItem.subcategory.id);
    result.fold(() => undefined, () => { loadActive(); loadDeleted(); });
  }, [recoveringSubItem, loadActive, loadDeleted]);

  const handleRecoverCriterion = useCallback(async (categoryId: string, criterion: RatingCriterionEntity) => {
    const result = await container.recoverRatingCriterionUseCase.execute(categoryId, criterion.key);
    result.fold(() => undefined, () => {
      setCategories((prev) => prev.map((c) => {
        if (c.id !== categoryId) return c;
        return {
          ...c,
          ratingCriteria: [...c.ratingCriteria, criterion],
          deletedRatingCriteria: (c.deletedRatingCriteria ?? []).filter((cr) => cr.key !== criterion.key),
        };
      }));
    });
  }, []);

  // ── Rating Criteria handlers ──
  const openAddCriterion = useCallback((categoryId: string) => {
    setCriterionCategoryId(categoryId);
    setNewCriterionLabel('');
    setNewCriterionKey('');
    setNewCriterionIcon('');
    setAddCriterionVisible(true);
  }, []);

  const openEditCriterion = useCallback((categoryId: string, criterion: RatingCriterionEntity, index: number) => {
    setCriterionCategoryId(categoryId);
    setEditingCriterionIndex(index);
    setEditCriterionLabel(criterion.label);
    setEditCriterionKey(criterion.key);
    setEditCriterionIcon(criterion.icon);
    setEditCriterionVisible(true);
  }, []);

  const handleAddCriterion = useCallback(async () => {
    if (!newCriterionLabel.trim()) return;
    setIsSaving(true);
    const key = newCriterionKey.trim() || newCriterionLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const cat = categories.find((c) => c.id === criterionCategoryId);
    if (!cat) { setIsSaving(false); return; }
    const updated: RatingCriterionEntity[] = [...cat.ratingCriteria, { key, label: newCriterionLabel.trim(), icon: newCriterionIcon.trim() || 'star' }];
    const result = await container.updateRatingCriteriaUseCase.execute(criterionCategoryId, updated);
    result.fold(
      () => setIsSaving(false),
      () => {
        setCategories((prev) => prev.map((c) => c.id === criterionCategoryId ? { ...c, ratingCriteria: updated } : c));
        setIsSaving(false); setAddCriterionVisible(false);
      },
    );
  }, [newCriterionLabel, newCriterionKey, newCriterionIcon, criterionCategoryId, categories]);

  const handleEditCriterion = useCallback(async () => {
    if (!editCriterionLabel.trim()) return;
    setIsSaving(true);
    const cat = categories.find((c) => c.id === criterionCategoryId);
    if (!cat) { setIsSaving(false); return; }
    const updated: RatingCriterionEntity[] = cat.ratingCriteria.map((cr, idx) =>
      idx === editingCriterionIndex
        ? { key: editCriterionKey.trim() || cr.key, label: editCriterionLabel.trim(), icon: editCriterionIcon.trim() || cr.icon }
        : cr,
    );
    const result = await container.updateRatingCriteriaUseCase.execute(criterionCategoryId, updated);
    result.fold(
      () => setIsSaving(false),
      () => {
        setCategories((prev) => prev.map((c) => c.id === criterionCategoryId ? { ...c, ratingCriteria: updated } : c));
        setIsSaving(false); setEditCriterionVisible(false);
      },
    );
  }, [editCriterionLabel, editCriterionKey, editCriterionIcon, criterionCategoryId, editingCriterionIndex, categories]);

  const handleDeleteCriterion = useCallback((categoryId: string, criterion: RatingCriterionEntity) => {
    showConfirm(
      t('manageCategories.deleteCriterion'),
      t('manageCategories.deleteCriterionConfirm', { label: criterion.label }),
      async () => {
        setConfirmVisible(false);
        const result = await container.softDeleteRatingCriterionUseCase.execute(categoryId, criterion.key);
        result.fold(() => undefined, () => {
          setCategories((prev) => prev.map((c) => {
            if (c.id !== categoryId) return c;
            return {
              ...c,
              ratingCriteria: c.ratingCriteria.filter((cr) => cr.key !== criterion.key),
              deletedRatingCriteria: [...(c.deletedRatingCriteria ?? []), criterion],
            };
          }));
        });
      },
    );
  }, [showConfirm, t]);

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <View style={{ marginRight: 12 }}><AdminMenuButton /></View>
        <AppText style={{ flex: 1, fontSize: 20, fontWeight: '700', color: colors.textWhite }}>{t('manageCategories.title')}</AppText>
      </View>

      {/* Top-level tabs — visible only inside Category sub-screen */}
      {subTab === 'categories' && (
        <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: 'rgba(51,65,85,0.3)', borderRadius: 10, padding: 3 }}>
          {(['active', 'deleted'] as const).map((tabKey) => (
            <TouchableOpacity
              key={tabKey}
              style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: tab === tabKey ? (tabKey === 'deleted' ? colors.error : colors.primary) : 'transparent' }}
              onPress={() => handleTabChange(tabKey)}
              accessibilityRole="tab"
            >
              <AppText style={{ color: tab === tabKey ? colors.white : colors.textSlate400, fontWeight: '600', fontSize: 13 }}>
                {tabKey === 'active' ? t('manageCategories.tabActive') : t('manageCategories.tabDeleted')}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content */}
      {tab === 'deleted' && subTab === 'categories' ? (
        <DeletedTab deletedCategories={deletedCategories} deletedSubcategories={deletedSubcategories} isLoading={isLoadingDeleted} onRecoverCategory={(cat) => { setRecoveringCategory(cat); setRecoverCatVisible(true); }} onRecoverSubcategory={(item) => { setRecoveringSubItem(item); setRecoverSubVisible(true); }} />
      ) : tab === 'active' ? (
        isLoadingActive ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={colors.primary} size="large" /></View>
        ) : subTab === null ? (
          /* ── Landing: two big cards ── */
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
            {/* Card: Category */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSubTab('categories')}
              accessibilityRole="button"
              style={{ backgroundColor: colors.cardDark, borderRadius: 18, borderWidth: 1, borderColor: colors.borderDark, padding: 28, alignItems: 'center', gap: 12 }}
            >
              <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(168,85,247,0.18)', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="shape" size={36} color={colors.primary} />
              </View>
              <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.textWhite }}>{t('manageCategories.subTabCategory')}</AppText>
              <AppText style={{ fontSize: 13, color: colors.textSlate400, textAlign: 'center' }}>{t('manageCategories.categoryCardDesc')}</AppText>
              <View style={{ marginTop: 4, backgroundColor: 'rgba(168,85,247,0.15)', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 8, borderWidth: 1, borderColor: colors.primary }}>
                <AppText style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>{t('manageCategories.manage')} →</AppText>
              </View>
            </TouchableOpacity>

            {/* Card: Rating Criteria */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSubTab('rating')}
              accessibilityRole="button"
              style={{ backgroundColor: colors.cardDark, borderRadius: 18, borderWidth: 1, borderColor: colors.borderDark, padding: 28, alignItems: 'center', gap: 12 }}
            >
              <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(20,184,166,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="star-half-full" size={36} color="#14b8a6" />
              </View>
              <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.textWhite }}>{t('manageCategories.subTabRatingCriteria')}</AppText>
              <AppText style={{ fontSize: 13, color: colors.textSlate400, textAlign: 'center' }}>{t('manageCategories.ratingCardDesc')}</AppText>
              <View style={{ marginTop: 4, backgroundColor: 'rgba(20,184,166,0.12)', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 8, borderWidth: 1, borderColor: '#14b8a6' }}>
                <AppText style={{ color: '#14b8a6', fontWeight: '600', fontSize: 14 }}>{t('manageCategories.manage')} →</AppText>
              </View>
            </TouchableOpacity>
          </ScrollView>
        ) : subTab === 'categories' ? (
          /* ── Category sub-screen ── */
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10, gap: 10 }}>
              <TouchableOpacity onPress={() => setSubTab(null)} accessibilityRole="button" style={{ padding: 6 }}>
                <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textWhite} />
              </TouchableOpacity>
              <AppText style={{ flex: 1, fontSize: 16, fontWeight: '700', color: colors.textWhite }}>{t('manageCategories.subTabCategory')}</AppText>
              <Pressable
                onPress={() => { setNewCategoryName(''); setNewCategoryLogoUri(null); setAddCategoryVisible(true); }}
                accessibilityRole="button"
                style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, flexDirection: 'row', alignItems: 'center' }}
              >
                <MaterialCommunityIcons name="plus" size={16} color={colors.white} />
                <AppText style={{ color: colors.white, fontWeight: '600', marginLeft: 4, fontSize: 13 }}>{t('manageCategories.addCategory')}</AppText>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
              {categories.map((item) => (
                <CategoryRow
                  key={item.id}
                  item={item}
                  expanded={expandedIds.has(item.id)}
                  onToggle={toggleExpand}
                  onDeleteCategory={handleDeleteCategory}
                  onDeleteSubcategory={handleDeleteSubcategory}
                  onAddSubcategory={openAddSubcategory}
                  onEditCategory={openEditCategory}
                  onEditSubcategory={openEditSubcategory}
                />
              ))}
            </ScrollView>
          </>
        ) : (
          /* ── Rating Criteria sub-screen ── */
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 }}>
              <TouchableOpacity onPress={() => { setSubTab(null); setCriteriaTab('active'); }} accessibilityRole="button" style={{ padding: 6, marginRight: 8 }}>
                <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textWhite} />
              </TouchableOpacity>
              <AppText style={{ flex: 1, fontSize: 16, fontWeight: '700', color: colors.textWhite }}>{t('manageCategories.subTabRatingCriteria')}</AppText>
            </View>

            {/* Criteria sub-tabs */}
            <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: 'rgba(51,65,85,0.3)', borderRadius: 10, padding: 3 }}>
              {(['active', 'deleted'] as const).map((tabKey) => (
                <TouchableOpacity
                  key={tabKey}
                  style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: criteriaTab === tabKey ? (tabKey === 'deleted' ? colors.error : colors.primary) : 'transparent' }}
                  onPress={() => setCriteriaTab(tabKey)}
                  accessibilityRole="tab"
                >
                  <AppText style={{ color: criteriaTab === tabKey ? colors.white : colors.textSlate400, fontWeight: '600', fontSize: 13 }}>
                    {tabKey === 'active' ? t('manageCategories.tabActiveCriteria') : t('manageCategories.tabDeletedCriteria')}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>

            {criteriaTab === 'active' ? (
              <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
                <RatingCriteriaCard
                  categories={categories}
                  onAddCriterion={openAddCriterion}
                  onEditCriterion={openEditCriterion}
                  onDeleteCriterion={handleDeleteCriterion}
                />
              </ScrollView>
            ) : (
              /* ── Deleted criteria tab ── */
              <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
                {categories.every((c) => (c.deletedRatingCriteria ?? []).length === 0) ? (
                  <View style={{ flex: 1, alignItems: 'center', marginTop: 60, gap: 12 }}>
                    <MaterialCommunityIcons name="delete-empty-outline" size={48} color={colors.textSlate400} />
                    <AppText style={{ color: colors.textSlate400, fontSize: 15 }}>{t('manageCategories.deletedCriteriaEmpty')}</AppText>
                  </View>
                ) : (
                  categories.filter((c) => (c.deletedRatingCriteria ?? []).length > 0).map((cat) => (
                    <View key={cat.id} style={{ backgroundColor: colors.cardDark, borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark, marginBottom: 10, overflow: 'hidden' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
                        <MaterialCommunityIcons name={cat.icon as IconName} size={20} color={colors.textSlate400} style={{ marginRight: 10 }} />
                        <AppText style={{ flex: 1, color: colors.textSlate400, fontWeight: '600', fontSize: 13 }}>{cat.name}</AppText>
                      </View>
                      {(cat.deletedRatingCriteria ?? []).map((criterion) => (
                        <View key={criterion.key} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingLeft: 36, paddingRight: 14, borderTopWidth: 1, borderTopColor: 'rgba(51,65,85,0.3)' }}>
                          <MaterialCommunityIcons name={criterion.icon as IconName} size={16} color={colors.textSlate400} style={{ marginRight: 8 }} />
                          <AppText style={{ flex: 1, color: colors.textSlate400, fontSize: 13 }}>{criterion.label}</AppText>
                          <AppText style={{ color: colors.textSlate400, fontSize: 11, marginRight: 10 }}>{criterion.key}</AppText>
                          <TouchableOpacity
                            onPress={() => showConfirm(
                              t('manageCategories.recoverCriterion'),
                              t('manageCategories.recoverCriterionMessage', { label: criterion.label, category: cat.name }),
                              () => { setConfirmVisible(false); void handleRecoverCriterion(cat.id, criterion); },
                            )}
                            accessibilityRole="button"
                            style={{ backgroundColor: 'rgba(168,85,247,0.15)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.primary }}
                          >
                            <AppText style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>{t('manageCategories.recoverConfirm')}</AppText>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </>
        )
      ) : null}

      {/* Modals */}
      <ConfirmModal visible={confirmVisible} title={confirmTitle} message={confirmMessage} onConfirm={confirmAction} onCancel={() => setConfirmVisible(false)} />

      <RecoverCategoryModal visible={recoverCatVisible} category={recoveringCategory} onRecoverOnly={handleRecoverCategoryOnly} onRecoverWithSubs={handleRecoverCategoryWithSubs} onCancel={() => setRecoverCatVisible(false)} />

      <ConfirmModal
        visible={recoverSubVisible}
        title={t('manageCategories.recoverSubcategory')}
        message={recoveringSubItem ? t('manageCategories.recoverSubcategoryMessage', { name: recoveringSubItem.subcategory.name, parent: recoveringSubItem.parentCategory.name }) : ''}
        confirmLabel={t('manageCategories.recoverConfirm')}
        confirmColor={colors.primary}
        onConfirm={handleRecoverSubcategory}
        onCancel={() => setRecoverSubVisible(false)}
      />

      <CategoryFormModal visible={addCategoryVisible} title={t('manageCategories.addCategory')} name={newCategoryName} logoUri={newCategoryLogoUri} isSaving={isSaving} onChangeName={setNewCategoryName} onPickLogo={newLogoPicker.pickImage} onSave={handleAddCategory} onCancel={() => { setAddCategoryVisible(false); setNewCategoryLogoUri(null); }} />

      <CategoryFormModal visible={editCategoryVisible} title={t('manageCategories.editCategory')} name={editCategoryName} logoUri={editCategoryLogoUri} isSaving={isSaving} onChangeName={setEditCategoryName} onPickLogo={editLogoPicker.pickImage} onSave={handleEditCategory} onCancel={() => { setEditCategoryVisible(false); setEditingCategory(null); }} />

      <SubcategoryFormModal visible={addSubVisible} title={t('manageCategories.addSubcategory')} name={newSubName} isSaving={isSaving} onChangeName={setNewSubName} onSave={handleAddSubcategory} onCancel={() => setAddSubVisible(false)} />

      <SubcategoryFormModal visible={editSubVisible} title={t('manageCategories.editSubcategory')} name={editSubName} isSaving={isSaving} onChangeName={setEditSubName} onSave={handleEditSubcategory} onCancel={() => { setEditSubVisible(false); setEditingSub(null); }} />

      <CriterionFormModal
        visible={addCriterionVisible}
        title={t('manageCategories.addCriterion')}
        label={newCriterionLabel}
        criterionKey={newCriterionKey}
        icon={newCriterionIcon}
        isSaving={isSaving}
        onChangeLabel={(v) => { setNewCriterionLabel(v); if (!newCriterionKey) setNewCriterionKey(v.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')); }}
        onChangeKey={setNewCriterionKey}
        onChangeIcon={setNewCriterionIcon}
        onSave={handleAddCriterion}
        onCancel={() => setAddCriterionVisible(false)}
      />

      <CriterionFormModal
        visible={editCriterionVisible}
        title={t('manageCategories.editCriterion')}
        label={editCriterionLabel}
        criterionKey={editCriterionKey}
        icon={editCriterionIcon}
        isSaving={isSaving}
        onChangeLabel={setEditCriterionLabel}
        onChangeKey={setEditCriterionKey}
        onChangeIcon={setEditCriterionIcon}
        onSave={handleEditCriterion}
        onCancel={() => setEditCriterionVisible(false)}
      />

      <ImageCropModal
        visible={newLogoPicker.isPreviewVisible}
        imageUri={newLogoPicker.pendingUri}
        onConfirm={newLogoPicker.confirmImage}
        onRetake={newLogoPicker.retakeImage}
        onCancel={newLogoPicker.cancelPreview}
        originalWidth={newLogoPicker.pendingWidth}
        originalHeight={newLogoPicker.pendingHeight}
        aspect={newLogoPicker.aspect}
      />
      <ImageCropModal
        visible={editLogoPicker.isPreviewVisible}
        imageUri={editLogoPicker.pendingUri}
        onConfirm={editLogoPicker.confirmImage}
        onRetake={editLogoPicker.retakeImage}
        onCancel={editLogoPicker.cancelPreview}
        originalWidth={editLogoPicker.pendingWidth}
        originalHeight={editLogoPicker.pendingHeight}
        aspect={editLogoPicker.aspect}
      />
    </ScreenLayout>
  );
}
