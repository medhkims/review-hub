import React, { useCallback, useState } from 'react';
import { View, ScrollView, Pressable, StatusBar, TextInput, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { NetworkBanner } from '@/presentation/shared/components/NetworkBanner';
import { CoverPhotoSection } from '../components/CoverPhotoSection';
import { DescriptionCard } from '../components/DescriptionCard';
import { InformationCard } from '../components/InformationCard';
import { DeliveryCard } from '../components/DeliveryCard';
import { PriceListCard } from '../components/PriceListCard';
import { colors } from '@/core/theme/colors';
import { BusinessDetailEntity } from '@/domain/business/entities/businessDetailEntity';
import { useBusinessOwnerStore } from '../store/businessOwnerStore';
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
  const { t } = useTranslation();
  const router = useRouter();
  const setBusiness = useBusinessOwnerStore((s) => s.setBusiness);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<{ label: string; value: string; onSave: (val: string) => void } | null>(null);
  const [editValue, setEditValue] = useState('');

  const updateField = useCallback(async (firestoreData: Record<string, unknown>) => {
    if (!business) return;
    const result = await container.updateBusinessUseCase.execute(business.id, firestoreData);
    result.fold(
      () => {},
      () => onRefresh(),
    );
  }, [business, onRefresh]);

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
      (val) => updateField({ description: val }),
    );
  }, [business, openEditModal, t, updateField]);

  const handleContactPress = useCallback((type: string) => {
    const mapping = CONTACT_FIELD_MAP[type];
    if (!mapping || !business) return;

    const currentValue = business.contact[mapping.entityKey] || '';
    openEditModal(
      t(`businessOwner.companyProfile.${type}`),
      currentValue,
      (val) => {
        const contactUpdate = { ...buildContactFirestore(business), [mapping.firestoreKey]: val || null };
        updateField({ contact: contactUpdate });
      },
    );
  }, [business, openEditModal, t, updateField]);

  const handleImagePick = useCallback(async (type: 'cover' | 'logo') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'cover' ? [16, 9] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0] && business) {
      const uri = result.assets[0].uri;
      const updated = { ...business };
      if (type === 'cover') {
        updated.coverImageUrl = uri;
      } else {
        updated.logoUrl = uri;
      }
      setBusiness(updated);
    }
  }, [business, setBusiness]);

  const handleNamePress = useCallback(() => {
    if (!business) return;
    openEditModal(
      t('businessOwner.companyProfile.businessName'),
      business.name,
      (val) => updateField({ name: val }),
    );
  }, [business, openEditModal, t, updateField]);

  // Build contacts array from entity
  const contacts = business ? buildContactsList(business) : [];
  const hasContacts = contacts.some((c) => !!c.value);

  // Build delivery services from entity
  const deliveryServices = business?.deliveryServices?.length
    ? business.deliveryServices.map((ds) => ({
        id: ds.id,
        name: ds.name,
        abbreviation: ds.abbreviation,
        bgColor: ds.name === 'Yassir' ? '#351C4D' : '#3D371F',
        textColor: ds.name === 'Yassir' ? '#FFFFFF' : '#FFC244',
        linked: ds.isActive,
      }))
    : undefined;

  // Build menu categories from entity
  const menuCategories = business?.menuCategories?.length
    ? business.menuCategories.map((mc) => ({
        id: mc.id,
        name: mc.name,
        items: mc.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: `${item.currency}${item.price.toFixed(2)}`,
          imageUri: item.imageUrl || undefined,
        })),
      }))
    : undefined;

  const hasCoverOrLogo = !!(business?.coverImageUrl || business?.logoUrl);
  const hasDescription = !!(business?.description);
  const hasDelivery = !!(deliveryServices && deliveryServices.length > 0);
  const hasMenu = !!(menuCategories && menuCategories.length > 0);

  const isDescriptionField = editField?.label === t('businessOwner.companyProfile.description');

  return (
    <View style={{ flex: 1, backgroundColor: colors.midnight }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <NetworkBanner />

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}
          onPress={() => setEditModalVisible(false)}
          accessibilityLabel={t('common.cancel')}
          accessibilityRole="button"
        >
          <Pressable
            style={{ backgroundColor: colors.cardDark, borderRadius: 16, padding: 24 }}
            onPress={() => {}}
            accessibilityLabel={editField?.label || ''}
            accessibilityRole="none"
          >
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
          </Pressable>
        </Pressable>
      </Modal>

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
          onBackPress={() => router.back()}
          onLogoPress={() => handleImagePick('logo')}
          onCoverPress={() => handleImagePick('cover')}
          onNamePress={handleNamePress}
        />

        {/* Cards */}
        <View style={{ paddingHorizontal: 20, gap: 32, marginTop: 32 }}>
          <DescriptionCard
            populated={hasDescription}
            description={business?.description}
            onPress={handleDescriptionPress}
          />

          <InformationCard
            populated={hasContacts}
            contacts={contacts}
            onContactPress={handleContactPress}
          />

          <DeliveryCard
            populated={hasDelivery}
            services={deliveryServices}
          />

          <PriceListCard
            populated={hasMenu}
            categories={menuCategories}
          />
        </View>
      </ScrollView>

      {/* Edit Profile FAB */}
      <View
        style={{
          position: 'absolute',
          bottom: 100,
          right: 24,
        }}
      >
        <Pressable
          onPress={handleDescriptionPress}
          accessibilityLabel={t('businessOwner.companyProfile.editProfile')}
          accessibilityRole="button"
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: colors.neonPurple,
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderRadius: 9999,
            shadowColor: colors.neonPurple,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 20,
            elevation: 10,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <MaterialCommunityIcons name="pencil" size={20} color={colors.white} />
          <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>
            {t('businessOwner.companyProfile.editProfile')}
          </AppText>
        </Pressable>
      </View>
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
