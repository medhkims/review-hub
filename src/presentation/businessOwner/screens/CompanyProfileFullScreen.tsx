import React, { useCallback, useRef, useState } from 'react';
import { View, ScrollView, Pressable, StatusBar, TextInput, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ImageCropModal } from '@/presentation/shared/components/ui/ImageCropModal';
import { useImagePickerWithPreview } from '@/presentation/shared/hooks/useImagePickerWithPreview';
import { NetworkBanner } from '@/presentation/shared/components/NetworkBanner';
import { CoverPhotoSection } from '../components/CoverPhotoSection';
import { CategoryPickerModal } from '../components/CategoryPickerModal';
import { LocationPickerModal, LocationResult } from '../components/LocationPickerModal';
import { DescriptionCard } from '../components/DescriptionCard';
import { InformationCard } from '../components/InformationCard';
import { DeliveryCard } from '../components/DeliveryCard';
import { PriceListCard } from '../components/PriceListCard';
import { MenuCategoryModal } from '../components/MenuCategoryModal';
import { MenuItemModal } from '../components/MenuItemModal';
import { OpeningHoursModal } from '../components/OpeningHoursModal';
import { colors } from '@/core/theme/colors';
import { BusinessDetailEntity, OpeningHours } from '@/domain/business/entities/businessDetailEntity';
import { useBusinessOwnerStore } from '../store/businessOwnerStore';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { container } from '@/core/di/container';

interface CompanyProfileFullScreenProps {
  business: BusinessDetailEntity | null;
  onRefresh: () => void;
}

const CONTACT_FIELD_MAP: Record<string, { entityKey: keyof BusinessDetailEntity['contact']; firestoreKey: string }> = {
  phoneNumber: { entityKey: 'phone', firestoreKey: 'phone' },
  emailAddress: { entityKey: 'email', firestoreKey: 'email' },
  website: { entityKey: 'website', firestoreKey: 'website' },
  instagram: { entityKey: 'instagramHandle', firestoreKey: 'instagram_handle' },
  facebook: { entityKey: 'facebookName', firestoreKey: 'facebook_name' },
  tiktok: { entityKey: 'tiktokHandle', firestoreKey: 'tiktok_handle' },
};

export default function CompanyProfileFullScreen({ business, onRefresh }: CompanyProfileFullScreenProps) {
  useAnalyticsScreen(AnalyticsScreens.COMPANY_PROFILE_FULL);
  const { t } = useTranslation();
  const router = useRouter();
  const setBusiness = useBusinessOwnerStore((s) => s.setBusiness);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [pendingModalVisible, setPendingModalVisible] = useState(false);
  const [editField, setEditField] = useState<{ label: string; value: string; onSave: (val: string) => void } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [menuCategoryModalVisible, setMenuCategoryModalVisible] = useState(false);
  const [menuItemModalVisible, setMenuItemModalVisible] = useState(false);
  const [openingHoursModalVisible, setOpeningHoursModalVisible] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingItemData, setEditingItemData] = useState<{ categoryId: string; itemId: string } | null>(null);

  // Deferred-save state: accumulates all changes made during edit mode
  const originalBusinessRef = useRef<BusinessDetailEntity | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, unknown>>({});

  // Writes to Firestore — only called on "Done"
  const updateField = useCallback(async (firestoreData: Record<string, unknown>) => {
    if (!business) return;
    const result = await container.updateBusinessUseCase.execute(business.id, firestoreData);
    if (result.isLeft()) return;
    // Re-fetch by document ID (getDoc) — avoids Firestore query-cache staleness
    // that can occur when getDocs(query) serves a snapshot predating the write.
    const refreshResult = await container.getBusinessDetailUseCase.execute(business.id, true);
    refreshResult.fold(
      () => onRefresh(), // fallback to query-based refresh on failure
      (entity) => setBusiness(entity),
    );
  }, [business, setBusiness, onRefresh]);

  // Stages a change: updates local entity for UI preview + queues for Firestore on Done
  const stagePendingChange = useCallback((
    firestoreData: Record<string, unknown>,
    entityUpdater: (b: BusinessDetailEntity) => BusinessDetailEntity,
  ) => {
    setPendingChanges((prev) => ({ ...prev, ...firestoreData }));
    if (business) {
      setBusiness(entityUpdater(business));
    }
  }, [business, setBusiness]);

  const handleEnterEditMode = useCallback(() => {
    originalBusinessRef.current = business;
    setPendingChanges({});
    setIsEditMode(true);
  }, [business]);

  const handleDone = useCallback(async () => {
    if (Object.keys(pendingChanges).length > 0) {
      await updateField(pendingChanges);
    }
    setIsEditMode(false);
    setPendingChanges({});
  }, [pendingChanges, updateField]);

  const handleCancel = useCallback(() => {
    if (originalBusinessRef.current) {
      setBusiness(originalBusinessRef.current);
    }
    setIsEditMode(false);
    setPendingChanges({});
  }, [setBusiness]);

  const openEditModal = useCallback((label: string, currentValue: string, onSave: (val: string) => void) => {
    setEditField({ label, value: currentValue, onSave });
    setEditValue(currentValue);
    setEditModalVisible(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editField) {
      editField.onSave(editValue);
    }
    setEditModalVisible(false);
    setEditField(null);
  }, [editField, editValue]);

  const handleDescriptionPress = useCallback(() => {
    openEditModal(
      t('businessOwner.companyProfile.description'),
      business?.description || '',
      (val) => stagePendingChange(
        { description: val },
        (b) => ({ ...b, description: val }),
      ),
    );
  }, [business, openEditModal, t, stagePendingChange]);

  const handleContactPress = useCallback((type: string) => {
    const mapping = CONTACT_FIELD_MAP[type];
    if (!mapping || !business) return;

    const rawValue = business.contact[mapping.entityKey];
    const currentValue = typeof rawValue === 'string' ? rawValue : '';
    openEditModal(
      t(`businessOwner.companyProfile.${type}`),
      currentValue,
      (val) => {
        const contactUpdate = { ...buildContactFirestore(business), [mapping.firestoreKey]: val || null };
        stagePendingChange(
          { contact: contactUpdate },
          (b) => ({ ...b, contact: { ...b.contact, [mapping.entityKey]: val || undefined } }),
        );
      },
    );
  }, [business, openEditModal, t, stagePendingChange]);

  const coverPicker = useImagePickerWithPreview({
    aspect: [16, 9],
    quality: 0.8,
    onSelected: useCallback(async (uri: string) => {
      if (!business) return;
      setBusiness({ ...business, coverImageUrl: uri });
      setIsUploadingImage(true);
      const uploadResult = await container.uploadBusinessImageUseCase.execute(business.id, uri, 'cover');
      setIsUploadingImage(false);
      uploadResult.fold(
        () => setBusiness(business),
        (downloadUrl) => stagePendingChange(
          { cover_image_url: downloadUrl },
          (b) => ({ ...b, coverImageUrl: downloadUrl }),
        ),
      );
    }, [business, setBusiness, stagePendingChange]),
  });

  const logoPicker = useImagePickerWithPreview({
    aspect: [1, 1],
    quality: 0.8,
    onSelected: useCallback(async (uri: string) => {
      if (!business) return;
      setBusiness({ ...business, logoUrl: uri });
      setIsUploadingImage(true);
      const uploadResult = await container.uploadBusinessImageUseCase.execute(business.id, uri, 'logo');
      setIsUploadingImage(false);
      uploadResult.fold(
        () => setBusiness(business),
        (downloadUrl) => stagePendingChange(
          { logo_url: downloadUrl },
          (b) => ({ ...b, logoUrl: downloadUrl }),
        ),
      );
    }, [business, setBusiness, stagePendingChange]),
  });

  const handleNamePress = useCallback(() => {
    if (!business) return;
    openEditModal(
      t('businessOwner.companyProfile.businessName'),
      business.name,
      (val) => stagePendingChange(
        { name: val },
        (b) => ({ ...b, name: val }),
      ),
    );
  }, [business, openEditModal, t, stagePendingChange]);

  const handleCategoryPress = useCallback(() => {
    setCategoryModalVisible(true);
  }, []);

  const handleSaveCategory = useCallback((categoryId: string, categoryName: string, subcategoryIds: string[]) => {
    setCategoryModalVisible(false);
    stagePendingChange(
      {
        category_id: categoryId,
        category_name: categoryName,
        sub_category: subcategoryIds[0] ?? '',
        sub_categories: subcategoryIds,
      },
      (b) => ({ ...b, categoryId, categoryName, subCategories: subcategoryIds }),
    );
  }, [stagePendingChange]);

  const handleSaveLocation = useCallback((result: LocationResult) => {
    stagePendingChange(
      {
        location: result.address,
        latitude: result.latitude,
        longitude: result.longitude,
      },
      (b) => ({ ...b, location: result.address, latitude: result.latitude, longitude: result.longitude }),
    );
  }, [stagePendingChange]);

  const handleToggleOnline = useCallback((value: boolean) => {
    stagePendingChange(
      { is_online: value },
      (b) => ({ ...b, isOnline: value }),
    );
  }, [stagePendingChange]);

  const handleToggleOpeningHoursVisible = useCallback((value: boolean) => {
    stagePendingChange(
      { opening_hours_visible: value },
      (b) => ({ ...b, openingHoursVisible: value }),
    );
  }, [stagePendingChange]);

  const handleSaveOpeningHours = useCallback((hours: OpeningHours) => {
    setOpeningHoursModalVisible(false);
    const firestoreHours = Object.fromEntries(
      Object.entries(hours).map(([day, s]) => [
        day,
        { is_open: s.isOpen, open_time: s.openTime, close_time: s.closeTime },
      ]),
    );
    stagePendingChange(
      { opening_hours: firestoreHours },
      (b) => ({ ...b, openingHours: hours }),
    );
  }, [stagePendingChange]);

  // Build contacts array from entity
  const contacts = business ? buildContactsList(business) : [];
  const hasContacts = contacts.some((c) => !!c.value);

  // Build delivery services from entity
  const deliveryServices = business?.deliveryServices?.length
    ? business.deliveryServices.map((ds) => ({
        id: ds.id,
        name: ds.name,
        abbreviation: ds.abbreviation,
        bgColor: ds.id === 'yassir' ? '#351C4D' : ds.id === 'glovo' ? '#3D371F' : '#2A2D3E',
        textColor: ds.id === 'yassir' ? '#FFFFFF' : ds.id === 'glovo' ? '#FFC244' : '#FFFFFF',
        linked: ds.isActive,
        url: ds.url,
        phone: ds.phone,
        isCustom: ds.id !== 'yassir' && ds.id !== 'glovo',
      }))
    : undefined;

  const isRestaurant = business?.categoryId === 'restaurant';

  const buildDeliveryFirestore = (services: BusinessDetailEntity['deliveryServices']) =>
    (services ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      abbreviation: s.abbreviation,
      is_active: s.isActive,
      url: s.url,
      phone: s.phone,
    }));

  const handleSaveDeliveryService = useCallback((serviceId: string, data: { url: string | null; phone: string | null }) => {
    if (!business) return;
    const existing = business.deliveryServices ?? [];
    const idx = existing.findIndex((s) => s.id === serviceId);
    const isActive = !!(data.url || data.phone);

    let name = serviceId;
    let abbreviation = serviceId.slice(0, 3).toUpperCase();
    if (serviceId === 'yassir') { name = 'Yassir'; abbreviation = 'YAS'; }
    if (serviceId === 'glovo') { name = 'Glovo'; abbreviation = 'GLO'; }

    const updated = idx >= 0
      ? existing.map((s, i) => i === idx ? { ...s, url: data.url, phone: data.phone, isActive } : s)
      : [...existing, { id: serviceId, name, abbreviation, isActive, url: data.url, phone: data.phone }];

    stagePendingChange(
      { delivery_services: buildDeliveryFirestore(updated) },
      (b) => ({ ...b, deliveryServices: updated }),
    );
  }, [business, stagePendingChange]);

  const handleAddDeliveryService = useCallback((data: { name: string; abbreviation: string; url: string | null; phone: string | null }) => {
    if (!business) return;
    const newService = {
      id: `custom_${Date.now()}`,
      name: data.name,
      abbreviation: data.abbreviation,
      isActive: !!(data.url || data.phone),
      url: data.url,
      phone: data.phone,
    };
    const updated = [...(business.deliveryServices ?? []), newService];
    stagePendingChange(
      { delivery_services: buildDeliveryFirestore(updated) },
      (b) => ({ ...b, deliveryServices: updated }),
    );
  }, [business, stagePendingChange]);

  const handleRemoveDeliveryService = useCallback((serviceId: string) => {
    if (!business) return;
    const updated = (business.deliveryServices ?? []).filter((s) => s.id !== serviceId);
    stagePendingChange(
      { delivery_services: buildDeliveryFirestore(updated) },
      (b) => ({ ...b, deliveryServices: updated }),
    );
  }, [business, stagePendingChange]);

  const buildMenuCategoriesFirestore = (cats: BusinessDetailEntity['menuCategories']) =>
    cats.map((cat) => ({
      id: cat.id,
      name: cat.name,
      image_url: cat.imageUrl ?? null,
      items: cat.items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        image_url: item.imageUrl ?? null,
        price: item.price,
        currency: item.currency,
      })),
    }));

  const handleMenuCategoryConfirm = useCallback(async (name: string, imageUri?: string) => {
    if (!business) return;
    const existing = business.menuCategories ?? [];
    let imageUrl: string | null = null;
    // Only upload if it's a new local URI (not an existing remote URL)
    const isLocalUri = imageUri && (imageUri.startsWith('file://') || imageUri.startsWith('content://') || imageUri.startsWith('blob:') || imageUri.startsWith('ph://'));
    if (isLocalUri) {
      setIsUploadingImage(true);
      const uploadResult = await container.uploadBusinessImageUseCase.execute(business.id, imageUri!, 'menu');
      setIsUploadingImage(false);
      uploadResult.fold(() => {}, (url) => { imageUrl = url; });
    } else if (imageUri) {
      imageUrl = imageUri; // already a remote URL (unchanged in edit mode)
    }

    let updated;
    if (editingCategoryId) {
      // Edit existing category
      updated = existing.map((cat) =>
        cat.id === editingCategoryId ? { ...cat, name, imageUrl } : cat,
      );
    } else {
      // Add new category
      updated = [...existing, { id: `cat_${Date.now()}`, name, imageUrl, items: [] }];
    }
    stagePendingChange(
      { menu_categories: buildMenuCategoriesFirestore(updated) },
      (b) => ({ ...b, menuCategories: updated }),
    );
    setMenuCategoryModalVisible(false);
    setEditingCategoryId(null);
  }, [business, editingCategoryId, stagePendingChange]);

  const handleMenuItemConfirm = useCallback(async (
    name: string,
    description: string,
    priceStr: string,
    imageUri?: string,
  ) => {
    if (!business) return;
    const existing = business.menuCategories ?? [];
    let imageUrl: string | null = null;
    const isLocalUri = imageUri && (imageUri.startsWith('file://') || imageUri.startsWith('content://') || imageUri.startsWith('blob:') || imageUri.startsWith('ph://'));
    if (isLocalUri) {
      setIsUploadingImage(true);
      const uploadResult = await container.uploadBusinessImageUseCase.execute(business.id, imageUri!, 'menu');
      setIsUploadingImage(false);
      uploadResult.fold(() => {}, (url) => { imageUrl = url; });
    } else if (imageUri) {
      imageUrl = imageUri;
    }
    const price = parseFloat(priceStr.replace(',', '.')) || 0;

    let updated;
    if (editingItemData) {
      // Edit existing item
      updated = existing.map((cat) =>
        cat.id === editingItemData.categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === editingItemData.itemId
                  ? { ...item, name, description, price, imageUrl }
                  : item,
              ),
            }
          : cat,
      );
    } else {
      // Add new item
      const catId = targetCategoryId!;
      const newItem = { id: `item_${Date.now()}`, name, description, imageUrl, price, currency: 'TND ' };
      updated = existing.map((cat) =>
        cat.id === catId ? { ...cat, items: [...cat.items, newItem] } : cat,
      );
    }
    stagePendingChange(
      { menu_categories: buildMenuCategoriesFirestore(updated) },
      (b) => ({ ...b, menuCategories: updated }),
    );
    setMenuItemModalVisible(false);
    setTargetCategoryId(null);
    setEditingItemData(null);
  }, [business, editingItemData, targetCategoryId, stagePendingChange]);

  // Build menu categories from entity
  const menuCategories = business?.menuCategories?.length
    ? business.menuCategories.map((mc) => ({
        id: mc.id,
        name: mc.name,
        imageUri: mc.imageUrl || undefined,
        items: mc.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: `${item.currency}${item.price.toFixed(2)}`,
          imageUri: item.imageUrl || undefined,
        })),
      }))
    : undefined;

  const hasCoverOrLogo = !!(business?.coverImageUrl || business?.logoUrl || business?.categoryId);
  const hasDescription = !!(business?.description);
  const hasDelivery = !!(deliveryServices && deliveryServices.length > 0);
  const hasMenu = !!(menuCategories && menuCategories.length > 0);

  const isDescriptionField = editField?.label === t('businessOwner.companyProfile.description');

  const isBlocked = business?.status === 'blocked';

  // --- Blocked screen: faded content + full overlay ---
  if (isBlocked) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.midnight }}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Faded background content */}
        <View style={{ flex: 1, opacity: 0.12, pointerEvents: 'none' }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
            <CoverPhotoSection
              populated={hasCoverOrLogo}
              coverImageUri={business?.coverImageUrl || undefined}
              logoImageUri={business?.logoUrl || undefined}
              businessName={business?.name}
              categoryName={business?.categoryName}
              categoryId={business?.categoryId}
            />
          </ScrollView>
        </View>

        {/* Blocked overlay */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 28,
          }}
        >
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
            style={{
              position: 'absolute',
              top: 52,
              left: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.5)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.white} />
          </Pressable>

          {/* Blocked card */}
          <View
            style={{
              backgroundColor: colors.cardDark,
              borderRadius: 24,
              padding: 28,
              alignItems: 'center',
              gap: 16,
              borderWidth: 1.5,
              borderColor: '#EF4444',
              width: '100%',
            }}
          >
            {/* Red icon ring */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                borderWidth: 1.5,
                borderColor: 'rgba(239, 68, 68, 0.3)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="shield-off-outline" size={34} color="#EF4444" />
            </View>

            <AppText style={{ fontSize: 20, fontWeight: '800', color: '#EF4444', textAlign: 'center', letterSpacing: -0.3 }}>
              {t('businessOwner.blocked.title')}
            </AppText>

            <AppText style={{ fontSize: 14, color: colors.textSlate400, textAlign: 'center', lineHeight: 22 }}>
              {t('businessOwner.blocked.message')}
            </AppText>

            {/* Divider */}
            <View style={{ width: '100%', height: 1, backgroundColor: 'rgba(239, 68, 68, 0.15)' }} />

            {/* Contact info */}
            <AppText style={{ fontSize: 13, color: colors.textSlate500, textAlign: 'center' }}>
              {t('businessOwner.blocked.contactPrompt')}
            </AppText>

            <Pressable
              onPress={() => {}}
              accessibilityLabel="Support@tchecki.tn"
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 12,
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.25)',
              }}
            >
              <MaterialCommunityIcons name="email-outline" size={18} color="#EF4444" />
              <AppText style={{ fontSize: 14, fontWeight: '700', color: '#EF4444' }}>
                Support@tchecki.tn
              </AppText>
            </Pressable>

            <AppText style={{ fontSize: 12, color: colors.textSlate500, textAlign: 'center', lineHeight: 18 }}>
              {t('businessOwner.blocked.replyNote')}
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.midnight }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <NetworkBanner />

      {/* Upload overlay */}
      {isUploadingImage && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: colors.cardDark, borderRadius: 16, padding: 24, alignItems: 'center', gap: 12 }}>
            <MaterialCommunityIcons name="cloud-upload-outline" size={32} color={colors.neonPurple} />
            <AppText style={{ color: colors.white, fontSize: 14, fontWeight: '600' }}>
              {t('businessOwner.companyProfile.uploadingImage')}
            </AppText>
          </View>
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
          {/* Backdrop tap-to-close — sits behind content, no nesting */}
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setEditModalVisible(false)}
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
          />
          {/* Content — View (not Pressable) to avoid nested <button> on web */}
          <View style={{ backgroundColor: colors.cardDark, borderRadius: 16, padding: 24 }}>
            <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white, marginBottom: 16 }}>
              {editField?.label}
            </AppText>
            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              style={{
                backgroundColor: colors.midnight,
                color: colors.white,
                borderRadius: 12,
                padding: 14,
                fontSize: 14,
                borderWidth: 1,
                borderColor: colors.borderDark,
                minHeight: isDescriptionField ? 120 : 48,
                textAlignVertical: isDescriptionField ? 'top' : 'center',
              }}
              placeholderTextColor={colors.textSlate500}
              multiline={isDescriptionField}
              autoFocus
              accessibilityLabel={editField?.label || ''}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Pressable
                onPress={() => setEditModalVisible(false)}
                accessibilityLabel={t('common.cancel')}
                accessibilityRole="button"
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark, alignItems: 'center' }}
              >
                <AppText style={{ color: colors.textSlate400, fontWeight: '600' }}>
                  {t('common.cancel')}
                </AppText>
              </Pressable>
              <Pressable
                onPress={handleSaveEdit}
                accessibilityLabel={t('businessOwner.companyProfile.saveChanges')}
                accessibilityRole="button"
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.neonPurple, alignItems: 'center' }}
              >
                <AppText style={{ color: colors.white, fontWeight: '600' }}>
                  {t('businessOwner.companyProfile.saveChanges')}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Status Modal — shows info for any business status */}
      <Modal
        visible={pendingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setPendingModalVisible(false)}
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
          />
          {(() => {
            const status = business?.status ?? 'pending';
            const statusConfig = {
              pending: {
                iconBg: 'rgba(245, 158, 11, 0.15)',
                iconColor: '#F59E0B',
                iconName: 'clock-outline' as const,
                btnBg: '#F59E0B',
                btnTextColor: '#1C1917',
                title: t('businessOwner.pendingBadge.title'),
                body: (
                  <>
                    <AppText style={{ fontSize: 14, color: colors.textSlate400, textAlign: 'center', lineHeight: 22 }}>
                      {t('businessOwner.pendingBadge.messageLine1')}
                    </AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
                      <MaterialCommunityIcons name="timer-outline" size={18} color="#F59E0B" />
                      <AppText style={{ fontSize: 13, fontWeight: '600', color: '#F59E0B' }}>
                        {t('businessOwner.pendingBadge.timeNote')}
                      </AppText>
                    </View>
                    <AppText style={{ fontSize: 13, color: colors.textSlate500, textAlign: 'center', lineHeight: 20 }}>
                      {t('businessOwner.pendingBadge.messageLine2')}
                    </AppText>
                  </>
                ),
                gotIt: t('businessOwner.pendingBadge.gotIt'),
              },
              active: {
                iconBg: 'rgba(34, 197, 94, 0.15)',
                iconColor: '#22C55E',
                iconName: 'check-circle-outline' as const,
                btnBg: '#22C55E',
                btnTextColor: '#14532D',
                title: t('businessOwner.activeStatus.title'),
                body: (
                  <AppText style={{ fontSize: 14, color: colors.textSlate400, textAlign: 'center', lineHeight: 22 }}>
                    {t('businessOwner.activeStatus.message')}
                  </AppText>
                ),
                gotIt: t('businessOwner.activeStatus.gotIt'),
              },
              rejected: {
                iconBg: 'rgba(239, 68, 68, 0.15)',
                iconColor: '#EF4444',
                iconName: 'close-circle-outline' as const,
                btnBg: '#EF4444',
                btnTextColor: '#fff',
                title: t('businessOwner.rejectedStatus.title'),
                body: (
                  <AppText style={{ fontSize: 14, color: colors.textSlate400, textAlign: 'center', lineHeight: 22 }}>
                    {t('businessOwner.rejectedStatus.message')}
                  </AppText>
                ),
                gotIt: t('businessOwner.rejectedStatus.gotIt'),
              },
              blocked: {
                iconBg: 'rgba(124, 58, 237, 0.15)',
                iconColor: '#7C3AED',
                iconName: 'cancel' as const,
                btnBg: '#7C3AED',
                btnTextColor: '#fff',
                title: t('businessOwner.blocked.title'),
                body: (
                  <>
                    <AppText style={{ fontSize: 14, color: colors.textSlate400, textAlign: 'center', lineHeight: 22 }}>
                      {t('businessOwner.blocked.message')}
                    </AppText>
                    <AppText style={{ fontSize: 13, color: colors.textSlate500, textAlign: 'center', lineHeight: 20 }}>
                      {t('businessOwner.blocked.contactPrompt')}
                    </AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
                      <MaterialCommunityIcons name="clock-fast" size={18} color="#7C3AED" />
                      <AppText style={{ fontSize: 13, fontWeight: '600', color: '#7C3AED' }}>
                        {t('businessOwner.blocked.replyNote')}
                      </AppText>
                    </View>
                  </>
                ),
                gotIt: t('common.ok'),
              },
            };
            const cfg = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;
            return (
              <View style={{ backgroundColor: colors.cardDark, borderRadius: 20, padding: 24, alignItems: 'center', gap: 16 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: cfg.iconBg, alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name={cfg.iconName} size={32} color={cfg.iconColor} />
                </View>
                <AppText style={{ fontSize: 20, fontWeight: '800', color: colors.white, textAlign: 'center', letterSpacing: -0.3 }}>
                  {cfg.title}
                </AppText>
                {cfg.body}
                <Pressable
                  onPress={() => setPendingModalVisible(false)}
                  accessibilityLabel={cfg.gotIt}
                  accessibilityRole="button"
                  style={{ width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: cfg.btnBg, alignItems: 'center', marginTop: 4 }}
                >
                  <AppText style={{ color: cfg.btnTextColor, fontWeight: '700', fontSize: 15 }}>
                    {cfg.gotIt}
                  </AppText>
                </Pressable>
              </View>
            );
          })()}
        </View>
      </Modal>

      <CategoryPickerModal
        visible={categoryModalVisible}
        currentCategoryId={business?.categoryId}
        currentSubcategoryIds={business?.subCategories}
        onClose={() => setCategoryModalVisible(false)}
        onSave={handleSaveCategory}
      />

      <LocationPickerModal
        visible={locationModalVisible}
        initialAddress={business?.location || undefined}
        onClose={() => setLocationModalVisible(false)}
        onSave={handleSaveLocation}
      />

      <OpeningHoursModal
        visible={openingHoursModalVisible}
        initialHours={business?.openingHours}
        onClose={() => setOpeningHoursModalVisible(false)}
        onSave={handleSaveOpeningHours}
      />

      <MenuCategoryModal
        visible={menuCategoryModalVisible}
        initialName={editingCategoryId
          ? business?.menuCategories?.find((c) => c.id === editingCategoryId)?.name
          : undefined}
        initialImageUri={editingCategoryId
          ? (business?.menuCategories?.find((c) => c.id === editingCategoryId)?.imageUrl ?? undefined)
          : undefined}
        onClose={() => { setMenuCategoryModalVisible(false); setEditingCategoryId(null); }}
        onConfirm={(name, imageUri) => { void handleMenuCategoryConfirm(name, imageUri); }}
      />

      <MenuItemModal
        visible={menuItemModalVisible}
        initialName={editingItemData
          ? business?.menuCategories?.find((c) => c.id === editingItemData.categoryId)?.items.find((i) => i.id === editingItemData.itemId)?.name
          : undefined}
        initialDescription={editingItemData
          ? business?.menuCategories?.find((c) => c.id === editingItemData.categoryId)?.items.find((i) => i.id === editingItemData.itemId)?.description
          : undefined}
        initialPrice={editingItemData
          ? String(business?.menuCategories?.find((c) => c.id === editingItemData.categoryId)?.items.find((i) => i.id === editingItemData.itemId)?.price ?? '')
          : undefined}
        initialImageUri={editingItemData
          ? (business?.menuCategories?.find((c) => c.id === editingItemData.categoryId)?.items.find((i) => i.id === editingItemData.itemId)?.imageUrl ?? undefined)
          : undefined}
        onClose={() => { setMenuItemModalVisible(false); setTargetCategoryId(null); setEditingItemData(null); }}
        onConfirm={(name, description, price, imageUri) => { void handleMenuItemConfirm(name, description, price, imageUri); }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Cover Photo + Logo + Name */}
        <CoverPhotoSection
          populated={hasCoverOrLogo}
          coverImageUri={business?.coverImageUrl || undefined}
          logoImageUri={business?.logoUrl || undefined}
          businessName={business?.name}
          categoryName={business?.categoryName}
          categoryId={business?.categoryId}
          onBackPress={() => router.back()}
          onLogoPress={isEditMode ? logoPicker.pickImage : undefined}
          onCoverPress={isEditMode ? coverPicker.pickImage : undefined}
          onNamePress={isEditMode ? handleNamePress : undefined}
          onCategoryPress={isEditMode ? handleCategoryPress : undefined}
          isPending={business?.status === 'pending'}
          businessStatus={business?.status}
          onPendingBadgePress={() => setPendingModalVisible(true)}
          isEditMode={isEditMode}
          onEditPress={!isEditMode ? handleEnterEditMode : undefined}
          onSavePress={isEditMode ? handleDone : undefined}
          onCancelPress={isEditMode ? handleCancel : undefined}
        />

        {/* Cards */}
        <View style={{ paddingHorizontal: 20, gap: 32, marginTop: 32 }}>
          {(isEditMode || hasDescription) && (
            <DescriptionCard
              populated={hasDescription}
              description={business?.description}
              onPress={isEditMode ? handleDescriptionPress : undefined}
            />
          )}

          {(isEditMode || hasContacts || business?.location || business?.isOnline || business?.openingHours) && (
            <InformationCard
              populated={isEditMode ? (hasContacts || !!business?.location || !!business?.isOnline || !!business?.openingHours) : (contacts.some((c) => !!c.value) || !!business?.location || !!business?.isOnline || !!business?.openingHours)}
              contacts={isEditMode ? contacts : contacts.filter((c) => !!c.value)}
              onContactPress={isEditMode ? handleContactPress : undefined}
              onLocationPress={isEditMode ? () => setLocationModalVisible(true) : undefined}
              location={business?.location || undefined}
              latitude={business?.latitude ?? undefined}
              longitude={business?.longitude ?? undefined}
              isOnline={business?.isOnline ?? false}
              onToggleOnline={isEditMode ? handleToggleOnline : undefined}
              openingHours={business?.openingHours}
              openingHoursVisible={business?.openingHoursVisible}
              onOpeningHoursPress={isEditMode ? () => setOpeningHoursModalVisible(true) : undefined}
              onToggleOpeningHoursVisible={isEditMode ? handleToggleOpeningHoursVisible : undefined}
            />
          )}

          {isRestaurant && (isEditMode || hasDelivery) && (
            <DeliveryCard
              populated={hasDelivery}
              services={deliveryServices}
              isEditMode={isEditMode}
              onSaveService={handleSaveDeliveryService}
              onAddService={handleAddDeliveryService}
              onRemoveService={handleRemoveDeliveryService}
            />
          )}

          {(isEditMode || hasMenu) && (
            <PriceListCard
              isEditMode={isEditMode}
              populated={hasMenu}
              categories={menuCategories}
              onAddCategory={() => { setEditingCategoryId(null); setMenuCategoryModalVisible(true); }}
              onAddItem={(catId) => { setTargetCategoryId(catId); setEditingItemData(null); setMenuItemModalVisible(true); }}
              onEditCategory={(catId) => { setEditingCategoryId(catId); setMenuCategoryModalVisible(true); }}
              onEditItem={(catId, itemId) => { setEditingItemData({ categoryId: catId, itemId }); setMenuItemModalVisible(true); }}
            />
          )}

          {/* Save/Cancel buttons — inline below all cards, only in edit mode */}
          {isEditMode && (
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <Pressable
                onPress={handleCancel}
                accessibilityLabel={t('common.cancel')}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: colors.cardDark,
                  borderWidth: 1,
                  borderColor: colors.borderDark,
                  paddingVertical: 14,
                  borderRadius: 14,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <MaterialCommunityIcons name="close" size={18} color={colors.textSlate400} />
                <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.textSlate400 }}>
                  {t('common.cancel')}
                </AppText>
              </Pressable>
              <Pressable
                onPress={handleDone}
                accessibilityLabel={t('common.done')}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: colors.success,
                  paddingVertical: 14,
                  borderRadius: 14,
                  shadowColor: colors.success,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 16,
                  elevation: 8,
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <MaterialCommunityIcons name="check" size={18} color={colors.white} />
                <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>
                  {t('common.done')}
                </AppText>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
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
      <ImageCropModal
        visible={logoPicker.isPreviewVisible}
        imageUri={logoPicker.pendingUri}
        onConfirm={logoPicker.confirmImage}
        onRetake={logoPicker.retakeImage}
        onCancel={logoPicker.cancelPreview}
        isLoading={logoPicker.isConfirming}
        originalWidth={logoPicker.pendingWidth}
        originalHeight={logoPicker.pendingHeight}
        aspect={logoPicker.aspect}
      />
    </View>
  );
}

function buildContactsList(business: BusinessDetailEntity) {
  return [
    { icon: 'phone', color: '#22C55E', labelKey: 'phoneNumber', value: business.contact.phone || undefined },
    { icon: 'email-outline', color: '#F97316', labelKey: 'emailAddress', value: business.contact.email || undefined },
    { icon: 'web', color: '#94A3B8', labelKey: 'website', value: business.contact.website || undefined },
    { icon: 'instagram', color: '#E1306C', labelKey: 'instagram', value: business.contact.instagramHandle || undefined },
    { icon: 'facebook', color: '#1877F2', labelKey: 'facebook', value: business.contact.facebookName || undefined },
    { icon: 'music-note', color: '#FFFFFF', labelKey: 'tiktok', value: business.contact.tiktokHandle || undefined },
  ];
}

function buildContactFirestore(business: BusinessDetailEntity) {
  return {
    phone: business.contact.phone || null,
    email: business.contact.email || null,
    website: business.contact.website || null,
    instagram_handle: business.contact.instagramHandle || null,
    facebook_name: business.contact.facebookName || null,
    tiktok_handle: business.contact.tiktokHandle || null,
  };
}
