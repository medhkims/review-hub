import { useCallback, useEffect, useState } from 'react';
import { crossPlatformAlert } from '@/core/utils/crossPlatformAlert';
import { useProfileStore } from '../store/profileStore';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { container } from '@/core/di/container';
import { ProfileEntity } from '@/domain/profile/entities/profileEntity';
import { AnalyticsHelper } from '@/core/analytics/analyticsHelper';
import { AnalyticsEvents } from '@/core/analytics/analyticsKeys';

export const useProfile = (userId?: string) => {
  const { profile, isLoading, error, setProfile, setLoading, setError } = useProfileStore();
  const { user: authUser, setUser: setAuthUser } = useAuthStore();
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
          if (authUser) {
            setAuthUser({ ...authUser, displayName: updatedProfile.displayName });
          }
          AnalyticsHelper.sendEvent(AnalyticsEvents.UPDATE_PROFILE);
          setLoading(false);
        }
      );
    },
    [updateProfileUseCase, setLoading, setError, setProfile, authUser, setAuthUser]
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
          AnalyticsHelper.sendEvent(AnalyticsEvents.UPDATE_EMAIL);
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

      try {
        const result = await uploadAvatarUseCase.execute(
          targetUserId,
          imageUri,
          mimeType,
          (progress) => setUploadProgress(progress),
        );

        result.fold(
          (failure) => {
            setError(failure.message);
            crossPlatformAlert('Upload Failed', failure.message, [{ text: 'OK' }]);
          },
          (avatarUrl) => {
            // Optimistically update the profile in the store
            if (profile) {
              setProfile({ ...profile, avatarUrl });
            }
            if (authUser) {
              setAuthUser({ ...authUser, avatarUrl });
            }
            AnalyticsHelper.sendEvent(AnalyticsEvents.UPLOAD_AVATAR);
          },
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload profile picture. Please try again.';
        setError(message);
        crossPlatformAlert('Upload Failed', message, [{ text: 'OK' }]);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [uploadAvatarUseCase, profile, setError, setProfile, authUser, setAuthUser],
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
