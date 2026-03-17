import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { Avatar } from '@/presentation/shared/components/ui/Avatar';
import { colors } from '@/core/theme/colors';
import { AdminContactItem, AdminAddressItem, VisibleTo } from '@/domain/admin/entities/adminInfoEntity';
import { useAdminInfo } from '../hooks/useAdminInfo';
import { AdminContactItemModal } from '../components/AdminContactItemModal';
import { AdminMenuButton } from '../components/AdminMenuButton';

const ALL_ROLES: { key: VisibleTo; labelKey: string }[] = [
  { key: 'business_owner', labelKey: 'adminInfo.businessOwner' },
  { key: 'simple_user', labelKey: 'adminInfo.user' },
  { key: 'moderator', labelKey: 'adminInfo.moderator' },
];

const VisibilityChips: React.FC<{
  visibleTo: VisibleTo[];
  onChange: (roles: VisibleTo[]) => void;
}> = ({ visibleTo, onChange }) => {
  const { t } = useTranslation();
  const toggle = (role: VisibleTo) =>
    onChange(
      visibleTo.includes(role) ? visibleTo.filter((r) => r !== role) : [...visibleTo, role],
    );
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
      {ALL_ROLES.map(({ key, labelKey }) => {
        const active = visibleTo.includes(key);
        return (
          <Pressable
            key={key}
            onPress={() => toggle(key)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            accessibilityLabel={t(labelKey)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: active ? colors.neonPurple : colors.borderDark,
              backgroundColor: active ? `${colors.neonPurple}20` : 'transparent',
            }}
          >
            <MaterialCommunityIcons
              name={active ? 'check-circle' : 'circle-outline'}
              size={14}
              color={active ? colors.neonPurple : colors.textSlate400}
            />
            <AppText style={{ fontSize: 12, color: active ? colors.white : colors.textSlate400 }}>
              {t(labelKey)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={{ marginBottom: 16 }}>
    <AppText style={{ fontSize: 11, fontWeight: '700', color: colors.textSlate400, letterSpacing: 0.8, marginBottom: 8 }}>
      {title.toUpperCase()}
    </AppText>
    <View
      style={{
        backgroundColor: colors.cardDark,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(51,65,85,0.3)',
        padding: 16,
      }}
    >
      {children}
    </View>
  </View>
);

export default function AdminInfoScreen() {
  const { t } = useTranslation();
  const {
    info,
    isLoading,
    isSaving,
    isUploadingPicture,
    error,
    successMessage,
    pickAndUploadPicture,
    saveAddress,
    upsertEmail,
    deleteEmail,
    upsertPhone,
    deletePhone,
  } = useAdminInfo();

  const [addressText, setAddressText] = useState('');
  const [addressRoles, setAddressRoles] = useState<VisibleTo[]>([]);
  const [addressEditing, setAddressEditing] = useState(false);

  const [modal, setModal] = useState<{
    visible: boolean;
    type: 'email' | 'phone';
    initial?: AdminContactItem;
  }>({ visible: false, type: 'email' });

  React.useEffect(() => {
    if (!isLoading) {
      setAddressText(info.address?.value ?? '');
      setAddressRoles(info.address?.visibleTo ?? []);
    }
  }, [isLoading, info.address]);

  const handleSaveAddress = () => {
    const trimmed = addressText.trim();
    saveAddress(trimmed ? { value: trimmed, visibleTo: addressRoles } : null);
    setAddressEditing(false);
  };

  const confirmDelete = (label: string, onConfirm: () => void) => {
    Alert.alert(t('adminInfo.deleteConfirm'), label, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), style: 'destructive', onPress: onConfirm },
    ]);
  };

  if (isLoading) {
    return (
      <ScreenLayout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.neonPurple} size="large" />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 }}>
          <AdminMenuButton />
          <AppText style={{ fontSize: 22, fontWeight: '700', color: colors.white, flex: 1 }}>
            {t('adminInfo.title')}
          </AppText>
          {(isSaving || isUploadingPicture) && (
            <ActivityIndicator color={colors.neonPurple} size="small" />
          )}
        </View>

        {error ? (
          <AppText style={{ color: '#EF4444', marginBottom: 12, fontSize: 13 }}>{error}</AppText>
        ) : null}
        {successMessage ? (
          <AppText style={{ color: '#22C55E', marginBottom: 12, fontSize: 13 }}>
            {t(successMessage)}
          </AppText>
        ) : null}

        {/* Picture */}
        <SectionCard title={t('adminInfo.picture')}>
          <Pressable
            onPress={pickAndUploadPicture}
            disabled={isUploadingPicture}
            accessibilityRole="button"
            accessibilityLabel={t('adminInfo.changePicture')}
            style={{ alignItems: 'center', gap: 12 }}
          >
            <Avatar
              imageUrl={info.pictureUrl}
              size="xl"
              withGlow
              initials="AD"
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.neonPurple,
                backgroundColor: `${colors.neonPurple}15`,
              }}
            >
              <MaterialCommunityIcons name="camera" size={16} color={colors.neonPurple} />
              <AppText style={{ color: colors.neonPurple, fontSize: 13, fontWeight: '600' }}>
                {isUploadingPicture ? t('adminInfo.uploadingPicture') : t('adminInfo.changePicture')}
              </AppText>
            </View>
          </Pressable>
        </SectionCard>

        {/* Address */}
        <SectionCard title={t('adminInfo.address')}>
          {addressEditing ? (
            <View>
              <TextInput
                value={addressText}
                onChangeText={setAddressText}
                placeholder={t('adminInfo.addressPlaceholder')}
                placeholderTextColor={colors.textSlate400}
                multiline
                style={{
                  backgroundColor: colors.midnight,
                  borderRadius: 10,
                  padding: 12,
                  color: colors.white,
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: colors.borderDark,
                  minHeight: 60,
                }}
                accessibilityLabel={t('adminInfo.address')}
              />
              <VisibilityChips visibleTo={addressRoles} onChange={setAddressRoles} />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <Pressable
                  onPress={() => setAddressEditing(false)}
                  accessibilityRole="button"
                  style={({ pressed }) => ({
                    flex: 1, paddingVertical: 10, borderRadius: 10,
                    borderWidth: 1, borderColor: colors.borderDark, alignItems: 'center',
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <AppText style={{ color: colors.textSlate400 }}>{t('common.cancel')}</AppText>
                </Pressable>
                <Pressable
                  onPress={handleSaveAddress}
                  accessibilityRole="button"
                  style={({ pressed }) => ({
                    flex: 1, paddingVertical: 10, borderRadius: 10,
                    backgroundColor: colors.neonPurple, alignItems: 'center',
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <AppText style={{ color: colors.white, fontWeight: '700' }}>{t('common.save')}</AppText>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setAddressEditing(true)}
              accessibilityRole="button"
              accessibilityLabel={t('adminInfo.editAddress')}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.neonPurple} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <AppText style={{ color: info.address ? colors.white : colors.textSlate400, fontSize: 14 }}>
                    {info.address?.value || t('adminInfo.noAddress')}
                  </AppText>
                  {info.address && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {info.address.visibleTo.map((role) => (
                        <View
                          key={role}
                          style={{
                            paddingHorizontal: 8, paddingVertical: 3,
                            borderRadius: 10, backgroundColor: `${colors.neonPurple}20`,
                          }}
                        >
                          <AppText style={{ fontSize: 11, color: colors.neonPurple }}>
                            {t(`adminInfo.${role === 'business_owner' ? 'businessOwner' : role === 'simple_user' ? 'user' : 'moderator'}`)}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.textSlate400} />
              </View>
            </Pressable>
          )}
        </SectionCard>

        {/* Emails */}
        <SectionCard title={t('adminInfo.emails')}>
          {info.emails.length === 0 && (
            <AppText style={{ color: colors.textSlate400, fontSize: 14, marginBottom: 12 }}>
              {t('adminInfo.noEmails')}
            </AppText>
          )}
          {info.emails.map((item) => (
            <ContactRow
              key={item.id}
              item={item}
              icon="email-outline"
              onEdit={() => setModal({ visible: true, type: 'email', initial: item })}
              onDelete={() => confirmDelete(item.value, () => deleteEmail(item.id))}
            />
          ))}
          <Pressable
            onPress={() => setModal({ visible: true, type: 'email', initial: undefined })}
            accessibilityRole="button"
            accessibilityLabel={t('adminInfo.addEmail')}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 8,
              paddingVertical: 10, opacity: pressed ? 0.7 : 1,
              marginTop: info.emails.length > 0 ? 8 : 0,
            })}
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={18} color={colors.neonPurple} />
            <AppText style={{ color: colors.neonPurple, fontSize: 14, fontWeight: '600' }}>
              {t('adminInfo.addEmail')}
            </AppText>
          </Pressable>
        </SectionCard>

        {/* Phones */}
        <SectionCard title={t('adminInfo.phones')}>
          {info.phones.length === 0 && (
            <AppText style={{ color: colors.textSlate400, fontSize: 14, marginBottom: 12 }}>
              {t('adminInfo.noPhones')}
            </AppText>
          )}
          {info.phones.map((item) => (
            <ContactRow
              key={item.id}
              item={item}
              icon="phone-outline"
              onEdit={() => setModal({ visible: true, type: 'phone', initial: item })}
              onDelete={() => confirmDelete(item.value, () => deletePhone(item.id))}
            />
          ))}
          <Pressable
            onPress={() => setModal({ visible: true, type: 'phone', initial: undefined })}
            accessibilityRole="button"
            accessibilityLabel={t('adminInfo.addPhone')}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 8,
              paddingVertical: 10, opacity: pressed ? 0.7 : 1,
              marginTop: info.phones.length > 0 ? 8 : 0,
            })}
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={18} color={colors.neonPurple} />
            <AppText style={{ color: colors.neonPurple, fontSize: 14, fontWeight: '600' }}>
              {t('adminInfo.addPhone')}
            </AppText>
          </Pressable>
        </SectionCard>
      </ScrollView>

      <AdminContactItemModal
        visible={modal.visible}
        type={modal.type}
        initial={modal.initial}
        onSave={modal.type === 'email' ? upsertEmail : upsertPhone}
        onClose={() => setModal((m) => ({ ...m, visible: false }))}
      />
    </ScreenLayout>
  );
}

interface ContactRowProps {
  item: AdminContactItem;
  icon: string;
  onEdit: () => void;
  onDelete: () => void;
}

const ContactRow: React.FC<ContactRowProps> = ({ item, icon, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(51,65,85,0.3)',
        gap: 10,
      }}
    >
      <MaterialCommunityIcons
        name={icon as never}
        size={18}
        color={colors.neonPurple}
        style={{ marginTop: 2 }}
      />
      <View style={{ flex: 1 }}>
        {item.label ? (
          <AppText style={{ fontSize: 11, color: colors.textSlate400, marginBottom: 2 }}>
            {item.label}
          </AppText>
        ) : null}
        <AppText style={{ color: colors.white, fontSize: 14 }}>{item.value}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
          {item.visibleTo.length === 0 ? (
            <AppText style={{ fontSize: 11, color: '#EF4444' }}>{t('adminInfo.visibleToNone')}</AppText>
          ) : (
            item.visibleTo.map((role) => (
              <View
                key={role}
                style={{
                  paddingHorizontal: 7, paddingVertical: 2,
                  borderRadius: 8, backgroundColor: `${colors.neonPurple}20`,
                }}
              >
                <AppText style={{ fontSize: 10, color: colors.neonPurple }}>
                  {t(`adminInfo.${role === 'business_owner' ? 'businessOwner' : role === 'simple_user' ? 'user' : 'moderator'}`)}
                </AppText>
              </View>
            ))
          )}
        </View>
      </View>
      <Pressable
        onPress={onEdit}
        accessibilityRole="button"
        accessibilityLabel="Edit"
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
      >
        <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.textSlate400} />
      </Pressable>
      <Pressable
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel="Delete"
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
      </Pressable>
    </View>
  );
};
