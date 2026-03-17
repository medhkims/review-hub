import React, { useState, useCallback } from 'react';
import { View, Pressable, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

interface DeliveryService {
  id: string;
  name: string;
  abbreviation: string;
  bgColor: string;
  textColor: string;
  linked: boolean;
  url: string | null;
  phone: string | null;
  isCustom?: boolean;
}

interface DeliveryCardProps {
  services?: DeliveryService[];
  onSaveService?: (serviceId: string, data: { url: string | null; phone: string | null }) => void;
  onAddService?: (data: { name: string; abbreviation: string; url: string | null; phone: string | null }) => void;
  onRemoveService?: (serviceId: string) => void;
  populated?: boolean;
  isEditMode?: boolean;
}

const DEFAULT_SERVICES: DeliveryService[] = [
  { id: 'yassir', name: 'Yassir', abbreviation: 'YAS', bgColor: '#351C4D', textColor: '#FFFFFF', linked: false, url: null, phone: null },
  { id: 'glovo', name: 'Glovo', abbreviation: 'GLO', bgColor: '#3D371F', textColor: '#FFC244', linked: false, url: null, phone: null },
];

export const DeliveryCard: React.FC<DeliveryCardProps> = ({
  services = DEFAULT_SERVICES,
  onSaveService,
  onAddService,
  onRemoveService,
  populated = false,
  isEditMode = false,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingService, setEditingService] = useState<DeliveryService | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalUrl, setModalUrl] = useState('');
  const [modalPhone, setModalPhone] = useState('');

  const openEditModal = useCallback((service: DeliveryService) => {
    setIsAddingNew(false);
    setEditingService(service);
    setModalName(service.name);
    setModalUrl(service.url || '');
    setModalPhone(service.phone || '');
    setModalVisible(true);
  }, []);

  const openAddModal = useCallback(() => {
    setIsAddingNew(true);
    setEditingService(null);
    setModalName('');
    setModalUrl('');
    setModalPhone('');
    setModalVisible(true);
  }, []);

  const handleModalSave = useCallback(() => {
    const url = modalUrl.trim() || null;
    const phone = modalPhone.trim() || null;
    if (!url && !phone) return;

    if (isAddingNew) {
      const name = modalName.trim();
      if (!name) return;
      onAddService?.({ name, abbreviation: name.slice(0, 3).toUpperCase(), url, phone });
    } else if (editingService) {
      onSaveService?.(editingService.id, { url, phone });
    }
    setModalVisible(false);
  }, [isAddingNew, modalName, modalUrl, modalPhone, editingService, onAddService, onSaveService]);

  return (
    <View
      style={{
        backgroundColor: colors.cardDark,
        borderRadius: populated ? 24 : 16,
        overflow: 'hidden',
        borderWidth: populated ? 1 : 0,
        borderColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      {!populated && (
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: colors.neonPurple }} />
      )}

      {/* Header */}
      <Pressable
        onPress={() => setExpanded(!expanded)}
        accessibilityLabel={t('businessOwner.companyProfile.delivery')}
        accessibilityRole="button"
        style={populated ? {
          backgroundColor: `${colors.neonPurple}08`,
          paddingHorizontal: 24,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderLeftWidth: 6,
          borderLeftColor: colors.neonPurple,
        } : {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          paddingBottom: expanded ? 4 : 20,
          paddingLeft: 28,
        }}
      >
        <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.neonPurple, letterSpacing: populated ? 0.5 : 0 }}>
          {t('businessOwner.companyProfile.delivery')}
        </AppText>
        <MaterialCommunityIcons name={expanded ? 'chevron-up' : 'chevron-down'} size={24} color={colors.neonPurple} />
      </Pressable>

      {expanded && (
        <View style={{ padding: populated ? 24 : 20, paddingTop: populated ? 24 : 16, gap: 16 }}>
          {/* Services row */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {services.map((service) => (
              <View
                key={service.id}
                style={{
                  flex: 1,
                  minWidth: '40%',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  paddingVertical: 20,
                  borderRadius: populated ? 16 : 20,
                  backgroundColor: colors.midnight,
                  borderWidth: 1,
                  borderColor: service.linked ? `${colors.success}30` : `${colors.error}30`,
                }}
              >
                {/* Status dot */}
                <View
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: service.linked ? colors.success : colors.error,
                    shadowColor: service.linked ? colors.success : colors.error,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                />

                {/* Logo circle */}
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: service.bgColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                    marginBottom: 4,
                  }}
                >
                  <AppText style={{ color: service.textColor, fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' }}>
                    {service.abbreviation}
                  </AppText>
                </View>

                <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.white, letterSpacing: 0.3 }}>
                  {service.name}
                </AppText>

                {/* Edit mode: tap to edit / View mode: status badge */}
                {isEditMode ? (
                  <Pressable
                    onPress={() => openEditModal(service)}
                    accessibilityLabel={`${service.linked ? t('businessOwner.companyProfile.editLink') : t('businessOwner.companyProfile.addLink')} ${service.name}`}
                    accessibilityRole="button"
                    style={{
                      width: '100%',
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: service.linked ? `${colors.success}22` : '#2E2344',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      borderWidth: 1,
                      borderColor: service.linked ? `${colors.success}40` : 'transparent',
                    }}
                  >
                    <MaterialCommunityIcons
                      name={service.linked ? 'pencil' : 'link-plus'}
                      size={16}
                      color={service.linked ? colors.success : colors.neonPurple}
                    />
                    <AppText style={{ fontSize: 12, fontWeight: '500', color: service.linked ? colors.success : colors.neonPurple }}>
                      {service.linked ? t('businessOwner.companyProfile.editLink') : t('businessOwner.companyProfile.addLink')}
                    </AppText>
                  </Pressable>
                ) : (
                  <View
                    style={{
                      width: '100%',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor: service.linked ? `${colors.success}1A` : `${colors.error}1A`,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      borderWidth: 1,
                      borderColor: service.linked ? `${colors.success}33` : `${colors.error}33`,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={service.linked ? 'check-circle' : 'minus-circle'}
                      size={14}
                      color={service.linked ? colors.success : colors.error}
                    />
                    <AppText style={{ fontSize: 12, fontWeight: '500', color: service.linked ? colors.success : colors.error }}>
                      {service.linked ? t('businessOwner.companyProfile.active') : t('businessOwner.companyProfile.inactive')}
                    </AppText>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Add custom delivery service (edit mode only) */}
          {isEditMode && (
            <Pressable
              onPress={openAddModal}
              accessibilityLabel={t('businessOwner.companyProfile.addDeliveryService')}
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: `${colors.neonPurple}40`,
                backgroundColor: `${colors.neonPurple}08`,
              }}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={18} color={colors.neonPurple} />
              <AppText style={{ fontSize: 14, fontWeight: '500', color: colors.neonPurple }}>
                {t('businessOwner.companyProfile.addDeliveryService')}
              </AppText>
            </Pressable>
          )}
        </View>
      )}

      {/* Edit / Add Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setModalVisible(false)}
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
          />
          <View style={{ backgroundColor: colors.cardDark, borderRadius: 20, padding: 24, gap: 16 }}>
            <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>
              {isAddingNew ? t('businessOwner.companyProfile.addDeliveryService') : editingService?.name}
            </AppText>

            {/* Name field (new only) */}
            {isAddingNew && (
              <View style={{ gap: 6 }}>
                <AppText style={{ fontSize: 13, color: colors.textSlate400, fontWeight: '500' }}>
                  {t('businessOwner.companyProfile.deliveryServiceName')} *
                </AppText>
                <TextInput
                  value={modalName}
                  onChangeText={setModalName}
                  placeholder={t('businessOwner.companyProfile.deliveryServiceNamePlaceholder')}
                  placeholderTextColor={colors.textSlate500}
                  style={{ backgroundColor: colors.midnight, color: colors.white, borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: colors.borderDark }}
                  accessibilityLabel={t('businessOwner.companyProfile.deliveryServiceName')}
                />
              </View>
            )}

            {/* Link field */}
            <View style={{ gap: 6 }}>
              <AppText style={{ fontSize: 13, color: colors.textSlate400, fontWeight: '500' }}>
                {t('businessOwner.companyProfile.deliveryLink')}
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.midnight, borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark, paddingHorizontal: 14 }}>
                <MaterialCommunityIcons name="link" size={16} color={colors.textSlate500} />
                <TextInput
                  value={modalUrl}
                  onChangeText={setModalUrl}
                  placeholder={t('businessOwner.companyProfile.deliveryLinkPlaceholder')}
                  placeholderTextColor={colors.textSlate500}
                  autoCapitalize="none"
                  keyboardType="url"
                  style={{ flex: 1, color: colors.white, padding: 14, fontSize: 14 }}
                  accessibilityLabel={t('businessOwner.companyProfile.deliveryLink')}
                />
              </View>
            </View>

            {/* Phone field */}
            <View style={{ gap: 6 }}>
              <AppText style={{ fontSize: 13, color: colors.textSlate400, fontWeight: '500' }}>
                {t('businessOwner.companyProfile.deliveryPhone')}
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.midnight, borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark, paddingHorizontal: 14 }}>
                <MaterialCommunityIcons name="phone-outline" size={16} color={colors.textSlate500} />
                <TextInput
                  value={modalPhone}
                  onChangeText={setModalPhone}
                  placeholder={t('businessOwner.companyProfile.deliveryPhonePlaceholder')}
                  placeholderTextColor={colors.textSlate500}
                  keyboardType="phone-pad"
                  style={{ flex: 1, color: colors.white, padding: 14, fontSize: 14 }}
                  accessibilityLabel={t('businessOwner.companyProfile.deliveryPhone')}
                />
              </View>
            </View>

            <AppText style={{ fontSize: 12, color: colors.textSlate500, lineHeight: 18 }}>
              {t('businessOwner.companyProfile.deliveryHint')}
            </AppText>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
              {/* Remove — custom services only */}
              {!isAddingNew && editingService?.isCustom && (
                <Pressable
                  onPress={() => { onRemoveService?.(editingService.id); setModalVisible(false); }}
                  accessibilityLabel={t('businessOwner.companyProfile.removeDeliveryService')}
                  accessibilityRole="button"
                  style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: `${colors.error}40`, alignItems: 'center', justifyContent: 'center' }}
                >
                  <MaterialCommunityIcons name="delete-outline" size={18} color={colors.error} />
                </Pressable>
              )}
              <Pressable
                onPress={() => setModalVisible(false)}
                accessibilityLabel={t('common.cancel')}
                accessibilityRole="button"
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark, alignItems: 'center' }}
              >
                <AppText style={{ color: colors.textSlate400, fontWeight: '600' }}>{t('common.cancel')}</AppText>
              </Pressable>
              <Pressable
                onPress={handleModalSave}
                accessibilityLabel={t('common.save')}
                accessibilityRole="button"
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.neonPurple, alignItems: 'center' }}
              >
                <AppText style={{ color: colors.white, fontWeight: '600' }}>{t('common.save')}</AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
