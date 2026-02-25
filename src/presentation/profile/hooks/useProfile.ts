import { useCallback, useEffect, useState } from 'react';
import { useProfileStore } from '../store/profileStore';
import { container } from '@/core/di/container';
import { ProfileEntity } from '@/domain/profile/entities/profileEntity';

export const useProfile = (userId?: string) => {
  const { profile, isLoading, error, setProfile, setLoading, setError } = useProfileStore();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const getProfileUseCase = container.getProfileUseCase;
  const updateProfileUseCase = container.updateProfileUseCase;
  const updateEmailUseCase = container.updateEmailUseCase;
  const uploadAvatarUseCase = container.uploadAvatarUseCase;

  const fetchProfile = useCallback(
    async (targetUserId: string) => {
      setLoading(true);
      setError(null);

      const result = await getProfileUseCase.execute(targetUserId);

      result.fold(
        (failure) => {
          setError(failure.message);
          setLoading(false);
        },
        (fetchedProfile) => {
          setProfile(fetchedProfile);
          setLoading(false);
        }
      );
    },
    [getProfileUseCase, setLoading, setError, setProfile]
  );

  const updateProfile = useCallback(
    async (targetUserId: string, updates: Partial<ProfileEntity>) => {
      setLoading(true);
      setError(null);

      const result = await updateProfileUseCase.execute(targetUserId, updates);

      result.fold(
        (failure) => {
          setError(failure.message);
          setLoading(false);
        },
        (updatedProfile) => {
          setProfile(updatedProfile);
          setLoading(false);
        }
      );
    },
    [updateProfileUseCase, setLoading, setError, setProfile]
  );

  const updateEmail = useCallback(
    async (targetUserId: string, newEmail: string) => {
      setLoading(true);
      setError(null);

      const result = await updateEmailUseCase.execute(targetUserId, newEmail);

      result.fold(
        (failure) => {
          setError(failure.message);
          setLoading(false);
        },
        () => {
          // Refresh profile after email update
          fetchProfile(targetUserId);
        }
      );
    },
    [updateEmailUseCase, fetchProfile, setLoading, setError]
  );

  const uploadAvatar = useCallback(
    async (targetUserId: string, imageUri: string, mimeType?: string) => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      const result = await uploadAvatarUseCase.execute(
        targetUserId,
        imageUri,
        mimeType,
        (progress) => setUploadProgress(progress),
      );

      result.fold(
        (failure) => {
          setError(failure.message);
          setIsUploading(false);
          setUploadProgress(0);
        },
        (avatarUrl) => {
          // Optimistically update the profile in the store
          if (profile) {
            setProfile({ ...profile, avatarUrl });
          }
          setIsUploading(false);
          setUploadProgress(0);
        },
      );
    },
    [uploadAvatarUseCase, profile, setError, setProfile],
  );

  // Auto-fetch profile when userId is provided
  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId, fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    uploadProgress,
    isUploading,
    fetchProfile,
    updateProfile,
    updateEmail,
    uploadAvatar,
  };
};
