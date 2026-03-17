import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ImageCropModal } from '@/presentation/shared/components/ui/ImageCropModal';
import { useImagePickerWithPreview } from '@/presentation/shared/hooks/useImagePickerWithPreview';
import { AdminMenuButton } from '../components/AdminMenuButton';
import { CategoryDefaultEntity } from '@/domain/categoryDefaults/entities/categoryDefaultEntity';
import { CategoryEntity } from '@/domain/business/entities/categoryEntity';
import { colors } from '@/core/theme/colors';
import { container } from '@/core/di/container';
import { useCategoryDefaultStore } from '@/presentation/shared/store/categoryDefaultStore';

type Tab = 'active' | 'deleted';

interface CategoryRow {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
}

interface EditState {
  categoryId: string;
  categoryName: string;
  profileImageUri: string | null;
  profileMimeType?: string;
  profileChanged: boolean;
  coverImageUri: string | null;
  coverMimeType?: string;
  coverChanged: boolean;
}

export function CategoryDefaultImagesScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [defaults, setDefaults] = useState<Record<string, CategoryDefaultEntity>>({});
  const [activeCategories, setActiveCategories] = useState<CategoryEntity[]>([]);
  const [deletedCategories, setDeletedCategories] = useState<CategoryEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editState, setEditState] = useState<EditState | null>(null);
  const editStateRef = useRef<EditState | null>(null);
  editStateRef.current = editState;
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const setGlobalDefault = useCategoryDefaultStore((s) => s.setDefault);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    const [defaultsResult, activeCatsResult, deletedResult] = await Promise.all([
      container.getCategoryDefaultsUseCase.execute(),
      container.getCategoriesForAdminUseCase.execute(),
      container.getDeletedCategoryItemsUseCase.execute(),
    ]);

    defaultsResult.fold(
      () => undefined,
      (data) => {
        const map: Record<string, CategoryDefaultEntity> = {};
        data.forEach((d) => { map[d.categoryId] = d; });
        setDefaults(map);
      },
    );

    activeCatsResult.fold(
      () => undefined,
      (data) => setActiveCategories(data),
    );

    deletedResult.fold(
      () => undefined,
      (data) => setDeletedCategories(data.deletedCategories.map((d) => d.category)),
    );

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const buildRows = useCallback(
    (cats: CategoryEntity[]): CategoryRow[] =>
      cats.map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        profileImageUrl: defaults[cat.id]?.profileImageUrl ?? null,
        coverImageUrl: defaults[cat.id]?.coverImageUrl ?? null,
      })),
    [defaults],
  );

  const openEdit = useCallback((row: CategoryRow) => {
    setSaveError(null);
    setEditState({
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      profileImageUri: row.profileImageUrl,
      profileChanged: false,
      coverImageUri: row.coverImageUrl,
      coverChanged: false,
    });
  }, []);

  const saveImages = useCallback(async (
    categoryId: string,
    options: {
      profileImageUri?: string;
      profileMimeType?: string;
      coverImageUri?: string;
      coverMimeType?: string;
    },
  ) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const result = await container.updateCategoryDefaultUseCase.execute(categoryId, options);
      result.fold(
        (failure) => setSaveError(failure.message),
        (updated) => {
          setDefaults((prev) => ({ ...prev, [updated.categoryId]: updated }));
          setGlobalDefault(updated);
          setEditState(null);
        },
      );
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? t('common.error'));
    } finally {
      setIsSaving(false);
    }
  }, [setGlobalDefault, t]);

  const profilePicker = useImagePickerWithPreview({
    aspect: [1, 1],
    quality: 0.85,
    onSelected: useCallback(async (uri: string, mimeType: string) => {
      const current = editStateRef.current;
      if (!current) return;
      await saveImages(current.categoryId, { profileImageUri: uri, profileMimeType: mimeType });
    }, [saveImages]),
  });

  const coverPicker = useImagePickerWithPreview({
    aspect: [16, 9],
    quality: 0.85,
    onSelected: useCallback(async (uri: string, mimeType: string) => {
      const current = editStateRef.current;
      if (!current) return;
      await saveImages(current.categoryId, { coverImageUri: uri, coverMimeType: mimeType });
    }, [saveImages]),
  });

  const handleSave = useCallback(() => {
    setEditState(null);
  }, []);

  const renderItem = useCallback(
    ({ item, isReadOnly }: { item: CategoryRow; isReadOnly?: boolean }) => (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.cardDark,
          borderRadius: 14,
          marginBottom: 10,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderWidth: 1,
          borderColor: isReadOnly ? 'rgba(239,68,68,0.2)' : 'rgba(51,65,85,0.3)',
          gap: 12,
          opacity: isReadOnly ? 0.75 : 1,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: isReadOnly ? 'rgba(239,68,68,0.1)' : `${colors.neonPurple}18`,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <MaterialCommunityIcons
            name={item.categoryIcon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={22}
            color={isReadOnly ? '#EF4444' : colors.neonPurple}
          />
        </View>

        <AppText style={{ flex: 1, color: colors.white, fontSize: 14, fontWeight: '600' }}>
          {item.categoryName}
        </AppText>

        {/* Profile thumbnail */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              overflow: 'hidden',
              backgroundColor: 'rgba(51,65,85,0.5)',
              borderWidth: 1.5,
              borderColor: item.profileImageUrl ? colors.neonPurple : 'rgba(51,65,85,0.4)',
            }}
          >
            {item.profileImageUrl ? (
              <Image source={{ uri: item.profileImageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="account-outline" size={20} color={colors.textSlate500} />
              </View>
            )}
          </View>
          <AppText style={{ color: colors.textSlate500, fontSize: 10 }}>{t('admin.categoryDefaults.logo')}</AppText>
        </View>

        {/* Cover thumbnail */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <View
            style={{
              width: 70,
              height: 44,
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: 'rgba(51,65,85,0.5)',
              borderWidth: 1.5,
              borderColor: item.coverImageUrl ? '#06B6D4' : 'rgba(51,65,85,0.4)',
            }}
          >
            {item.coverImageUrl ? (
              <Image source={{ uri: item.coverImageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="image-outline" size={20} color={colors.textSlate500} />
              </View>
            )}
          </View>
          <AppText style={{ color: colors.textSlate500, fontSize: 10 }}>{t('admin.categoryDefaults.cover')}</AppText>
        </View>

        {!isReadOnly && (
          <Pressable
            onPress={() => openEdit(item)}
            style={{ padding: 8 }}
            accessibilityRole="button"
            accessibilityLabel={t('admin.categoryDefaults.editImages', { category: item.categoryName })}
          >
            <MaterialCommunityIcons name="pencil-outline" size={22} color={colors.neonPurple} />
          </Pressable>
        )}

        {isReadOnly && (
          <View style={{ padding: 8 }}>
            <MaterialCommunityIcons name="delete-outline" size={22} color="#EF4444" />
          </View>
        )}
      </View>
    ),
    [t, openEdit],
  );

  const keyExtractor = useCallback((item: CategoryRow) => item.categoryId, []);

  const activeRows = buildRows(activeCategories);
  const deletedRows = buildRows(deletedCategories);

  return (
    <ScreenLayout>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 16,
            gap: 12,
          }}
        >
          <AdminMenuButton />
          <Pressable
            onPress={() => router.back()}
            style={{ padding: 4 }}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
          </Pressable>
          <AppText style={{ fontSize: 22, fontWeight: '700', color: colors.white, flex: 1 }}>
            {t('admin.categoryDefaults.title')}
          </AppText>
        </View>

        {/* Tab Toggle */}
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 16,
            marginBottom: 16,
            backgroundColor: 'rgba(51,65,85,0.3)',
            borderRadius: 12,
            padding: 4,
          }}
        >
          <Pressable
            onPress={() => setActiveTab('active')}
            accessibilityRole="button"
            accessibilityLabel={t('admin.categoryDefaults.tabActive')}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              borderRadius: 10,
              backgroundColor: activeTab === 'active' ? colors.neonPurple : 'transparent',
            }}
          >
            <AppText style={{ color: activeTab === 'active' ? colors.white : colors.textSlate400, fontWeight: '600', fontSize: 13 }}>
              {t('admin.categoryDefaults.tabActive')}
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('deleted')}
            accessibilityRole="button"
            accessibilityLabel={t('admin.categoryDefaults.tabDeleted')}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              borderRadius: 10,
              backgroundColor: activeTab === 'deleted' ? '#EF4444' : 'transparent',
            }}
          >
            <AppText style={{ color: activeTab === 'deleted' ? colors.white : colors.textSlate400, fontWeight: '600', fontSize: 13 }}>
              {t('admin.categoryDefaults.tabDeleted')}
            </AppText>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.neonPurple} />
          </View>
        ) : (
          <FlatList
            key={activeTab}
            data={activeTab === 'active' ? activeRows : deletedRows}
            renderItem={({ item }) => renderItem({ item, isReadOnly: activeTab === 'deleted' })}
            keyExtractor={keyExtractor}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
                <MaterialCommunityIcons
                  name={activeTab === 'active' ? 'folder-open-outline' : 'delete-empty-outline'}
                  size={48}
                  color={colors.textSlate500}
                />
                <AppText style={{ color: colors.textSlate400, fontSize: 15 }}>
                  {activeTab === 'active'
                    ? t('admin.categoryDefaults.emptyActive')
                    : t('admin.categoryDefaults.emptyDeleted')}
                </AppText>
              </View>
            }
          />
        )}
      </View>

      {/* Edit Modal */}
      <Modal
        visible={!!editState}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditState(null)}
      >
        {editState && (
          <>
          <ImageCropModal
            visible={profilePicker.isPreviewVisible}
            imageUri={profilePicker.pendingUri}
            onConfirm={profilePicker.confirmImage}
            onRetake={profilePicker.retakeImage}
            onCancel={profilePicker.cancelPreview}
            isLoading={profilePicker.isConfirming}
            originalWidth={profilePicker.pendingWidth}
            originalHeight={profilePicker.pendingHeight}
            aspect={profilePicker.aspect}
          />
          <ImageCropModal
            visible={coverPicker.isPreviewVisible}
            imageUri={coverPicker.pendingUri}
            onConfirm={coverPicker.confirmImage}
            onRetake={coverPicker.retakeImage}
            onCancel={coverPicker.cancelPreview}
            isLoading={coverPicker.isConfirming}
            originalWidth={coverPicker.pendingWidth}
            originalHeight={coverPicker.pendingHeight}
            aspect={coverPicker.aspect}
          />
          <View style={{ flex: 1, backgroundColor: colors.midnight }}>
            {/* Modal Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(51,65,85,0.3)',
              }}
            >
              <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>
                {editState.categoryName}
              </AppText>
              <Pressable
                onPress={() => setEditState(null)}
                accessibilityRole="button"
                accessibilityLabel={t('common.cancel')}
                style={{ padding: 4 }}
              >
                <MaterialCommunityIcons name="close" size={24} color={colors.textSlate400} />
              </Pressable>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20, gap: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Profile Image */}
              <View style={{ gap: 10 }}>
                <AppText style={{ color: colors.textSlate400, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  {t('admin.categoryDefaults.profileImage')}
                </AppText>
                <AppText style={{ color: colors.textSlate500, fontSize: 12, lineHeight: 17 }}>
                  {t('admin.categoryDefaults.profileImageHint')}
                </AppText>
                <Pressable
                  onPress={profilePicker.pickImage}
                  accessibilityRole="button"
                  accessibilityLabel={t('admin.categoryDefaults.tapToSelectProfile')}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    overflow: 'hidden',
                    backgroundColor: colors.cardDark,
                    borderWidth: 2,
                    borderColor: editState.profileImageUri ? colors.neonPurple : 'rgba(51,65,85,0.5)',
                    borderStyle: editState.profileImageUri ? 'solid' : 'dashed',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center',
                  }}
                >
                  {editState.profileImageUri ? (
                    <Image source={{ uri: editState.profileImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <View style={{ alignItems: 'center', gap: 6 }}>
                      <MaterialCommunityIcons name="image-plus" size={32} color={colors.textSlate500} />
                      <AppText style={{ color: colors.textSlate500, fontSize: 11, textAlign: 'center' }}>
                        {t('admin.categoryDefaults.tapToSelectProfile')}
                      </AppText>
                    </View>
                  )}
                </Pressable>
                {editState.profileImageUri && (
                  <Pressable
                    onPress={profilePicker.pickImage}
                    style={{ alignSelf: 'center' }}
                    accessibilityRole="button"
                    accessibilityLabel={t('admin.banners.changeImage')}
                  >
                    <AppText style={{ color: colors.neonPurple, fontSize: 13, fontWeight: '600' }}>
                      {t('admin.banners.changeImage')}
                    </AppText>
                  </Pressable>
                )}
              </View>

              {/* Cover Image */}
              <View style={{ gap: 10 }}>
                <AppText style={{ color: colors.textSlate400, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  {t('admin.categoryDefaults.coverImage')}
                </AppText>
                <AppText style={{ color: colors.textSlate500, fontSize: 12, lineHeight: 17 }}>
                  {t('admin.categoryDefaults.coverImageHint')}
                </AppText>
                <Pressable
                  onPress={coverPicker.pickImage}
                  accessibilityRole="button"
                  accessibilityLabel={t('admin.categoryDefaults.tapToSelectCover')}
                  style={{
                    width: '100%',
                    height: 150,
                    borderRadius: 14,
                    overflow: 'hidden',
                    backgroundColor: colors.cardDark,
                    borderWidth: 2,
                    borderColor: editState.coverImageUri ? '#06B6D4' : 'rgba(51,65,85,0.5)',
                    borderStyle: editState.coverImageUri ? 'solid' : 'dashed',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {editState.coverImageUri ? (
                    <Image source={{ uri: editState.coverImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <View style={{ alignItems: 'center', gap: 8 }}>
                      <MaterialCommunityIcons name="image-plus" size={36} color={colors.textSlate500} />
                      <AppText style={{ color: colors.textSlate500, fontSize: 13 }}>
                        {t('admin.categoryDefaults.tapToSelectCover')}
                      </AppText>
                    </View>
                  )}
                </Pressable>
                {editState.coverImageUri && (
                  <Pressable
                    onPress={coverPicker.pickImage}
                    style={{ alignSelf: 'flex-end' }}
                    accessibilityRole="button"
                    accessibilityLabel={t('admin.banners.changeImage')}
                  >
                    <AppText style={{ color: '#06B6D4', fontSize: 13, fontWeight: '600' }}>
                      {t('admin.banners.changeImage')}
                    </AppText>
                  </Pressable>
                )}
              </View>
            </ScrollView>

            {/* Save Button */}
            <View
              style={{
                paddingHorizontal: 20,
                paddingBottom: 32,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: 'rgba(51,65,85,0.3)',
                gap: 10,
              }}
            >
              {saveError && (
                <View style={{ backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 10, padding: 12 }}>
                  <AppText style={{ color: '#EF4444', fontSize: 13 }}>{saveError}</AppText>
                </View>
              )}
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                style={{
                  backgroundColor: colors.neonPurple,
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: 'center',
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <AppText style={{ color: colors.white, fontSize: 16, fontWeight: '700' }}>
                    {t('common.close')}
                  </AppText>
                )}
              </Pressable>
            </View>
          </View>
          </>
        )}
      </Modal>
    </ScreenLayout>
  );
}
