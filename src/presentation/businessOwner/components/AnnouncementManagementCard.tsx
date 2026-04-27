import React, { useState, useCallback } from 'react';
import { View, Pressable, TextInput, Modal, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { crossPlatformAlert } from '@/core/utils/crossPlatformAlert';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { AnnouncementEntity } from '@/domain/announcement/entities/announcementEntity';

interface AnnouncementManagementCardProps {
  announcements: AnnouncementEntity[];
  isEditMode: boolean;
  onCreate: (title: string, description: string) => Promise<void>;
  onDelete: (announcementId: string) => Promise<void>;
}

export const AnnouncementManagementCard: React.FC<AnnouncementManagementCardProps> = ({
  announcements,
  isEditMode,
  onCreate,
  onDelete,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!title.trim() || !description.trim()) return;
    setIsSubmitting(true);
    await onCreate(title.trim(), description.trim());
    setIsSubmitting(false);
    setTitle('');
    setDescription('');
    setCreateModalVisible(false);
  }, [title, description, onCreate]);

  const handleDelete = useCallback((id: string) => {
    crossPlatformAlert(
      t('businessOwner.announcements.delete'),
      t('businessOwner.announcements.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), style: 'destructive', onPress: () => onDelete(id) },
      ],
    );
  }, [onDelete, t]);

  if (!isEditMode && announcements.length === 0) return null;

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialCommunityIcons name="bullhorn-outline" size={20} color={colors.neonPurple} />
          <AppText style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>
            {t('businessOwner.announcements.title')}
          </AppText>
        </View>
        <AppText style={{ fontSize: 12, color: theme.textMuted }}>
          {announcements.length}
        </AppText>
      </View>

      {/* Announcement list */}
      {announcements.map((ann) => (
        <View
          key={ann.id}
          style={{
            backgroundColor: theme.background,
            borderRadius: 12,
            padding: 14,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <View style={{ flex: 1 }}>
            <AppText style={{ fontSize: 14, fontWeight: '600', color: theme.text }}>{ann.title}</AppText>
            <AppText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }} numberOfLines={2}>
              {ann.description}
            </AppText>
          </View>
          {isEditMode && (
            <Pressable
              onPress={() => handleDelete(ann.id)}
              accessibilityRole="button"
              accessibilityLabel={t('businessOwner.announcements.delete')}
              style={{ padding: 8 }}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
            </Pressable>
          )}
        </View>
      ))}

      {/* Add button */}
      {isEditMode && (
        <Pressable
          onPress={() => setCreateModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={t('businessOwner.announcements.add')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: 14,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: `${colors.neonPurple}50`,
            backgroundColor: `${colors.neonPurple}08`,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <MaterialCommunityIcons name="plus" size={20} color={colors.neonPurple} />
          <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.neonPurple }}>
            {t('businessOwner.announcements.add')}
          </AppText>
        </Pressable>
      )}

      {/* Create Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
        statusBarTranslucent={Platform.OS !== 'web'}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: theme.card,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              paddingBottom: 40,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 20 }}>
              {t('businessOwner.announcements.add')}
            </AppText>

            <AppText style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 }}>
              {t('businessOwner.announcements.titleField')}
            </AppText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t('businessOwner.announcements.titlePlaceholder')}
              placeholderTextColor={theme.textMuted}
              maxLength={100}
              style={{
                backgroundColor: theme.background,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 14,
                color: theme.text,
                fontSize: 14,
                marginBottom: 16,
              }}
            />

            <AppText style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 }}>
              {t('businessOwner.announcements.descriptionField')}
            </AppText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('businessOwner.announcements.descriptionPlaceholder')}
              placeholderTextColor={theme.textMuted}
              multiline
              maxLength={500}
              style={{
                backgroundColor: theme.background,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 14,
                color: theme.text,
                fontSize: 14,
                minHeight: 100,
                textAlignVertical: 'top',
                marginBottom: 24,
              }}
            />

            <View style={{ gap: 10 }}>
              <AppButton
                title={isSubmitting ? t('common.saving') : t('businessOwner.announcements.add')}
                variant="primary"
                size="md"
                shape="pill"
                accessibilityLabel={t('businessOwner.announcements.add')}
                accessibilityRole="button"
                onPress={handleCreate}
                disabled={!title.trim() || !description.trim() || isSubmitting}
              />
              <Pressable
                onPress={() => { setCreateModalVisible(false); setTitle(''); setDescription(''); }}
                accessibilityLabel={t('common.cancel')}
                accessibilityRole="button"
                style={{ paddingVertical: 12, alignItems: 'center' }}
              >
                <AppText style={{ fontSize: 15, fontWeight: '600', color: theme.textSecondary }}>
                  {t('common.cancel')}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
