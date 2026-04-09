import { useCallback, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { container } from '@/core/di/container';
import { AdminInfoEntity, AdminContactItem, AdminAddressItem } from '@/domain/admin/entities/adminInfoEntity';

const EMPTY_INFO: AdminInfoEntity = {
  pictureUrl: null,
  address: null,
  emails: [],
  phones: [],
};

export const useAdminInfo = () => {
  const [info, setInfo] = useState<AdminInfoEntity>(EMPTY_INFO);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await container.getAdminInfoUseCase.execute();
    result.fold(
      (failure) => setError(failure.message),
      (data) => setInfo(data),
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (updated: AdminInfoEntity) => {
      setIsSaving(true);
      setError(null);
      const result = await container.updateAdminInfoUseCase.execute(updated);
      result.fold(
        (failure) => setError(failure.message),
        () => {
          setInfo(updated);
          setSuccessMessage('adminInfo.saved');
          setTimeout(() => setSuccessMessage(null), 3000);
        },
      );
      setIsSaving(false);
    },
    [],
  );

  const pickAndUploadPicture = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('personalInfo.permissionRequired');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (picked.canceled || !picked.assets[0]) return;

    const asset = picked.assets[0];
    setIsUploadingPicture(true);
    setError(null);

    const result = await container.uploadAdminPictureUseCase.execute(
      asset.uri,
      asset.mimeType ?? 'image/jpeg',
    );
    if (result.isLeft()) {
      setError((result.value as { message: string }).message);
    } else {
      await save({ ...info, pictureUrl: result.value as string });
    }
    setIsUploadingPicture(false);
  }, [info, save]);

  const saveAddress = useCallback(
    (address: AdminAddressItem | null) => save({ ...info, address }),
    [info, save],
  );

  const upsertEmail = useCallback(
    (item: AdminContactItem) => {
      const emails = info.emails.some((e) => e.id === item.id)
        ? info.emails.map((e) => (e.id === item.id ? item : e))
        : [...info.emails, item];
      save({ ...info, emails });
    },
    [info, save],
  );

  const deleteEmail = useCallback(
    (id: string) => save({ ...info, emails: info.emails.filter((e) => e.id !== id) }),
    [info, save],
  );

  const upsertPhone = useCallback(
    (item: AdminContactItem) => {
      const phones = info.phones.some((p) => p.id === item.id)
        ? info.phones.map((p) => (p.id === item.id ? item : p))
        : [...info.phones, item];
      save({ ...info, phones });
    },
    [info, save],
  );

  const deletePhone = useCallback(
    (id: string) => save({ ...info, phones: info.phones.filter((p) => p.id !== id) }),
    [info, save],
  );

  return {
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
    reload: load,
  };
};
