import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useRoleStore } from '../store/roleStore';
import { useSavedAccountsStore } from '../store/savedAccountsStore';
import { useHomeStore } from '@/presentation/home/store/homeStore';
import { container } from '@/core/di/container';
import { router } from 'expo-router';
import { RegisterBusinessParams } from '@/domain/business/usecases/registerBusinessUseCase';
import { AnalyticsHelper } from '@/core/analytics/analyticsHelper';
import { AnalyticsEvents, AnalyticsParams, AnalyticsValues } from '@/core/analytics/analyticsKeys';
import { UserEntity } from '@/domain/auth/entities/userEntity';

export const useAuth = () => {
  const { user, isLoading, isAuthenticated, error, setUser, setLoading, setError, setProvider, reset } = useAuthStore();
  const { setRole, reset: resetRole } = useRoleStore();
  const resetHome = useHomeStore((s) => s.reset);
  const saveAccount = useSavedAccountsStore((s) => s.save);
  const hasLoadedRef = useRef(false);

  const persistAccount = useCallback((u: UserEntity, role: string, provider: 'email' | 'google' | 'facebook' | 'apple' = 'email') => {
    saveAccount({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      type: role === 'business_owner' ? 'business' : role === 'moderator' ? 'moderator' : role === 'admin' ? 'admin' : 'user',
      provider,
    });
  }, [saveAccount]);

  const getCurrentUserUseCase = container.getCurrentUserUseCase;
  const signInUseCase = container.signInUseCase;
  const signUpUseCase = container.signUpUseCase;
  const signOutUseCase = container.signOutUseCase;
  const getUserRoleUseCase = container.getUserRoleUseCase;
  const signInWithGoogleUseCase = container.signInWithGoogleUseCase;
  const registerBusinessUseCase = container.registerBusinessUseCase;
  const continueAsGuestUseCase = container.continueAsGuestUseCase;

  const loadRole = useCallback(async (userId: string) => {
    const roleResult = await getUserRoleUseCase.execute(userId);
    roleResult.fold(
      () => setRole('simple_user'),
      (role) => setRole(role),
    );
  }, [getUserRoleUseCase, setRole]);

  const loadCurrentUser = useCallback(async () => {
    setLoading(true);
    const result = await getCurrentUserUseCase.execute();
    result.fold(
      (failure) => {
        setError(failure.message);
        setUser(null);
        resetRole();
      },
      async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          setProvider(currentUser.provider);
          await loadRole(currentUser.id);
          const role = useRoleStore.getState().role ?? 'simple_user';
          persistAccount(currentUser, role, currentUser.provider);
        } else {
          resetRole();
        }
      }
    );
    setLoading(false);
  }, [getCurrentUserUseCase, setLoading, setError, setUser, setProvider, resetRole, loadRole, persistAccount]);

  // Load current user on mount (once)
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadCurrentUser();
    }
  }, [loadCurrentUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const result = await signInUseCase.execute(email, password);

    result.fold(
      (failure) => {
        setError(failure.message);
        setLoading(false);
      },
      async (loggedInUser) => {
        setUser(loggedInUser);
        setProvider(loggedInUser.provider);
        await loadRole(loggedInUser.id);
        const role = useRoleStore.getState().role ?? 'simple_user';
        persistAccount(loggedInUser, role, loggedInUser.provider);
        AnalyticsHelper.sendEvent(AnalyticsEvents.LOGIN, {
          [AnalyticsParams.METHOD]: AnalyticsValues.METHOD_EMAIL,
        });
        setLoading(false);
        router.replace('/(main)/(feed)');
      }
    );
  }, [signInUseCase, setLoading, setError, setUser, setProvider, loadRole, persistAccount]);

  const signUp = useCallback(async (email: string, password: string, displayName: string, gender?: 'male' | 'female', birthday?: Date) => {
    setLoading(true);
    setError(null);

    const result = await signUpUseCase.execute(email, password, displayName, undefined, undefined, gender, birthday);

    result.fold(
      (failure) => {
        setError(failure.message);
        setLoading(false);
      },
      (newUser) => {
        setUser(newUser);
        setRole('simple_user');
        persistAccount(newUser, 'simple_user');
        AnalyticsHelper.sendEvent(AnalyticsEvents.SIGN_UP, {
          [AnalyticsParams.METHOD]: AnalyticsValues.METHOD_EMAIL,
        });
        setLoading(false);
        router.replace('/(main)/(feed)');
      }
    );
  }, [signUpUseCase, setLoading, setError, setUser, setRole, persistAccount]);

  const signUpAsBusinessOwner = useCallback(async (
    email: string,
    password: string,
    displayName: string,
    businessData: RegisterBusinessParams,
  ) => {
    setLoading(true);
    setError(null);

    // Step 1: Create Firebase Auth account + profile with business_owner role
    const signUpResult = await signUpUseCase.execute(
      email,
      password,
      displayName,
      'business_owner',
      businessData.phone,
    );

    if (signUpResult.isLeft()) {
      signUpResult.fold(
        (failure) => {
          setError(failure.message);
          setLoading(false);
        },
        () => {},
      );
      return;
    }

    const newUser = signUpResult.fold(
      () => null,
      (u) => u,
    );

    if (!newUser) {
      setLoading(false);
      return;
    }

    setUser(newUser);

    // Step 2: Create business document in Firestore
    const businessResult = await registerBusinessUseCase.execute(businessData);

    businessResult.fold(
      (failure) => {
        setRole('business_owner');
        persistAccount(newUser, 'business_owner');
        setError(failure.message);
        AnalyticsHelper.sendEvent(AnalyticsEvents.SIGN_UP_BUSINESS_OWNER, {
          [AnalyticsParams.SUCCESS]: false,
        });
        setLoading(false);
        router.replace('/(main)/(feed)');
      },
      () => {
        setRole('business_owner');
        persistAccount(newUser, 'business_owner');
        AnalyticsHelper.sendEvent(AnalyticsEvents.SIGN_UP_BUSINESS_OWNER, {
          [AnalyticsParams.SUCCESS]: true,
        });
        setLoading(false);
        router.replace('/(main)/(feed)');
      },
    );
  }, [signUpUseCase, registerBusinessUseCase, setLoading, setError, setUser, setRole, persistAccount]);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await signOutUseCase.execute();

    result.fold(
      (failure) => {
        setError(failure.message);
        setLoading(false);
      },
      () => {
        AnalyticsHelper.sendEvent(AnalyticsEvents.LOGOUT);
        reset();
        resetRole();
        resetHome();
        router.replace('/(auth)/sign-in');
      }
    );
  }, [signOutUseCase, setLoading, setError, reset, resetRole, resetHome]);

  const signInWithGoogle = useCallback(async (loginHint?: string) => {
    setLoading(true);
    setError(null);

    const result = await signInWithGoogleUseCase.execute(loginHint);

    result.fold(
      (failure) => {
        setError(failure.message);
        setLoading(false);
      },
      async (loggedInUser) => {
        setUser(loggedInUser);
        setProvider(loggedInUser.provider);
        await loadRole(loggedInUser.id);
        const role = useRoleStore.getState().role ?? 'simple_user';
        persistAccount(loggedInUser, role, loggedInUser.provider);
        AnalyticsHelper.sendEvent(AnalyticsEvents.LOGIN_GOOGLE, {
          [AnalyticsParams.METHOD]: AnalyticsValues.METHOD_GOOGLE,
        });
        setLoading(false);
        router.replace('/(main)/(feed)');
      }
    );
  }, [signInWithGoogleUseCase, setLoading, setError, setUser, setProvider, loadRole, persistAccount]);

  const continueAsGuest = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await continueAsGuestUseCase.execute();

    result.fold(
      (failure) => {
        setError(failure.message);
        setLoading(false);
      },
      (guestUser) => {
        setUser(guestUser);
        setRole('guest');
        setLoading(false);
        router.replace('/(main)/(feed)');
      }
    );
  }, [continueAsGuestUseCase, setLoading, setError, setUser, setRole]);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    loadCurrentUser,
    signIn,
    signUp,
    signUpAsBusinessOwner,
    signOut,
    signInWithGoogle,
    continueAsGuest,
  };
};
