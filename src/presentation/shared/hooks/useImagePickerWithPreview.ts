import { useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { crossPlatformAlert } from '@/core/utils/crossPlatformAlert';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

interface UseImagePickerWithPreviewOptions {
  aspect?: [number, number];
  quality?: number;
  onSelected: (uri: string, mimeType: string) => Promise<void> | void;
}

interface UseImagePickerWithPreviewResult {
  /** Opens the image picker (requests permission if needed) */
  pickImage: () => Promise<void>;
  /** URI of the original picked image — null when no image is pending */
  pendingUri: string | null;
  /** Original pixel width of the pending image */
  pendingWidth: number | null;
  /** Original pixel height of the pending image */
  pendingHeight: number | null;
  /** The aspect ratio passed to the hook — forward it to ImageCropModal */
  aspect: [number, number];
  /** Whether the crop modal should be shown */
  isPreviewVisible: boolean;
  /** Called by ImageCropModal after cropping — passes cropped URI to onSelected */
  confirmImage: (croppedUri: string, mimeType: string) => Promise<void>;
  /** Re-open the picker so the user can choose a different photo */
  retakeImage: () => Promise<void>;
  /** Dismiss the modal without uploading */
  cancelPreview: () => void;
  /** True while onSelected is executing */
  isConfirming: boolean;
}

export function useImagePickerWithPreview({
  aspect = [1, 1],
  quality = 0.8,
  onSelected,
}: UseImagePickerWithPreviewOptions): UseImagePickerWithPreviewResult {
  const { t } = useTranslation();
  const [pendingAsset, setPendingAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Keep a stable ref to onSelected to avoid stale closures
  const onSelectedRef = useRef(onSelected);
  onSelectedRef.current = onSelected;

  const openPicker = useCallback(async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        crossPlatformAlert(
          t('imageCrop.permissionTitle'),
          t('imageCrop.permissionMessage'),
          [{ text: t('common.ok') }],
        );
        return;
      }
    }

    // Cropping is handled by ImageCropModal — do NOT use allowsEditing here
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality,
    });

    if (result.canceled || !result.assets[0]) return;
    setPendingAsset(result.assets[0]);
  }, [quality, t]);

  const confirmImage = useCallback(async (croppedUri: string, mimeType: string) => {
    if (!pendingAsset) return;
    setIsConfirming(true);
    try {
      await onSelectedRef.current(croppedUri, mimeType);
      setPendingAsset(null);
    } finally {
      setIsConfirming(false);
    }
  }, [pendingAsset]);

  const retakeImage = useCallback(async () => {
    setPendingAsset(null);
    await openPicker();
  }, [openPicker]);

  const cancelPreview = useCallback(() => {
    setPendingAsset(null);
  }, []);

  return {
    pickImage: openPicker,
    pendingUri: pendingAsset?.uri ?? null,
    pendingWidth: pendingAsset?.width ?? null,
    pendingHeight: pendingAsset?.height ?? null,
    aspect,
    isPreviewVisible: !!pendingAsset,
    confirmImage,
    retakeImage,
    cancelPreview,
    isConfirming,
  };
}
