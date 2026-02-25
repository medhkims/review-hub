import { useCallback, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useRoleStore } from '../store/roleStore';
import { container } from '@/core/di/container';
import { useRouter } from 'expo-router';
import { RegisterBusinessParams } from '@/domain/business/usecases/registerBusinessUseCase';

export const useAuth = () => {
  const { user, isLoading, isAuthenticated, error, setUser, setLoading, setError, reset } = useAuthStore();
  const { setRole, reset: resetRole } = useRoleStore();
  const router = useRouter();

  const getCurrentUserUseCase = container.getCurrentUserUseCase;
  const signInUseCase = container.signInUseCase;
  const signUpUseCase = container.signUpUseCase;
  const signOutUseCase = container.signOutUseCase;
  const getUserRoleUseCase = container.getUserRoleUseCase;
  const signInWithGoogleUseCase = container.signInWithGoogleUseCase;
  const registerBusinessUseCase = container.registerBusinessUseCase;

  // Load current user on mount
  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadRole = useCallback(async (userId: string) => {
    const roleResult = await getUserRoleUseCase.execute(userId);
    roleResult.fold(
      () => setRole('simple_user'),
      (role) => setRole(role),
    );
  }, []);

  const loadCurrentUser = useCallback(async () => {
    setLoading(true);
    const result = await getCurrentUserUseCase.execute();
    result.fold(
      (failure) => {
        setError(failure.message);
        setUser(null);
        resetRole();
      },
      (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          loadRole(currentUser.id);
        } else {
          resetRole();
        }
      }
    );
    setLoading(false);
  }, []);

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
        await loadRole(loggedInUser.id);
        setLoading(false);
        router.replace('/(main)/(feed)');
      }
    );
  }, [router]);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);

    const result = await signUpUseCase.execute(email, password, displayName);

    result.fold(
      (failure) => {
        setError(failure.message);
        setLoading(false);
      },
      (newUser) => {
        setUser(newUser);
        setRole('simple_user');
        setLoading(false);
        router.replace('/(main)/(feed)');
      }
    );
  }, [router]);

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
        setError(failure.message);
        setLoading(false);
        router.replace('/(main)/(feed)');
      },
      () => {
        setRole('business_owner');
        setLoading(false);
        router.replace('/(main)/(feed)');
      },
    );
  }, [router]);

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
        reset();
        resetRole();
        router.replace('/(auth)/sign-in');
      }
    );
  }, [router]);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await signInWithGoogleUseCase.execute();

    result.fold(
      (failure) => {
        setError(failure.message);
        setLoading(false);
      },
      async (loggedInUser) => {
        setUser(loggedInUser);
        await loadRole(loggedInUser.id);
        setLoading(false);
        router.replace('/(main)/(feed)');
      }
    );
  }, [router]);

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
  };
};
