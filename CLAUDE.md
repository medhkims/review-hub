# CLAUDE.md — React Native Clean Architecture Project Rules

> **This file is the single source of truth for Claude Code when working on this codebase.**
> Every generated, modified, or refactored file MUST comply with these rules.

---

## 1. Project Overview

A React Native mobile application built with **Clean Architecture** and strict **layer separation** (Data → Domain → Presentation). Firebase is the backend with full offline-first support.

---

## 2. Tech Stack

| Concern | Technology |
|---|---|
| Framework | React Native — Expo (Bare / Dev Build) |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router (file-based routing) |
| State Management | Zustand |
| Backend | Firebase (Firestore, Auth, Cloud Storage, Cloud Functions) |
| Offline | Firestore persistence enabled (`persistentLocalCache`) |
| Styling | NativeWind (Tailwind CSS) |
| Forms | React Hook Form + Zod |
| i18n | react-i18next |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| DI Pattern | Manual Dependency Injection (constructor injection) |
| Testing | Jest + React Native Testing Library + Maestro (E2E) |
| Crash Reporting | Firebase Crashlytics |

---

## 3. Clean Architecture — Layer Rules

```
┌─────────────────────────────────────────────────┐
│              Presentation Layer                 │
│   (Screens, Widgets, ViewModels/Hooks, State)   │
│         Depends on: Domain only                 │
├─────────────────────────────────────────────────┤
│                Domain Layer                     │
│    (Entities, Use Cases, Repository Contracts)  │
│         Depends on: Nothing (pure)              │
├─────────────────────────────────────────────────┤
│                 Data Layer                      │
│  (Repository Impls, Data Sources, DTOs, Mappers)│
│         Depends on: Domain                      │
│         Depends on: Firebase SDK, Network, etc. │
└─────────────────────────────────────────────────┘
```

### Dependency Rule (CRITICAL — NEVER VIOLATE)

- **Domain Layer** has ZERO external dependencies. No Firebase imports, no React imports, no third-party libraries. Pure TypeScript only.
- **Data Layer** implements Domain interfaces. It may import Firebase SDK, network libraries, and storage.
- **Presentation Layer** depends on Domain (use cases, entities). It NEVER imports from Data layer directly.
- Dependencies always point **inward**: `Presentation → Domain ← Data`.
- Use **dependency injection** to provide Data implementations to Domain use cases consumed by Presentation.

---

## 4. Project Structure

```
src/
│
├── core/                           # Shared cross-cutting concerns
│   ├── di/                         # Dependency injection container & providers
│   │   └── container.ts            # Central DI setup — wires Data → Domain → Presentation
│   ├── error/                      # Custom exception & failure classes
│   │   ├── exceptions.ts           # ServerException, CacheException, NetworkException, etc.
│   │   └── failures.ts             # ServerFailure, CacheFailure, NetworkFailure, etc.
│   ├── network/                    # Network info checker (online/offline detection)
│   │   └── networkInfo.ts
│   ├── firebase/                   # Firebase initialization & config
│   │   ├── firebaseConfig.ts       # Firebase app init + Firestore offline persistence setup
│   │   └── firebaseAdmin.ts        # Cloud Functions callable references
│   ├── theme/                      # Design tokens, colors, typography, spacing
│   ├── constants/                  # App-wide constants, enums, config keys
│   ├── utils/                      # Pure utility/helper functions (dateFormat, validators, etc.)
│   ├── i18n/                       # react-i18next setup, language files
│   │   ├── i18n.ts
│   │   └── locales/
│   │       ├── en.json
│   │       └── ar.json
│   └── types/                      # Global shared TypeScript types
│
├── data/                           # === DATA LAYER ===
│   ├── auth/
│   │   ├── datasources/
│   │   │   ├── authRemoteDataSource.ts      # Firebase Auth calls
│   │   │   └── authLocalDataSource.ts       # Cached auth state (MMKV/SecureStore)
│   │   ├── models/                          # DTOs — Firebase document shapes
│   │   │   └── userModel.ts                 # UserModel (mirrors Firestore doc)
│   │   ├── mappers/
│   │   │   └── userMapper.ts                # UserModel ↔ UserEntity mapping
│   │   └── repositories/
│   │       └── authRepositoryImpl.ts        # Implements domain AuthRepository
│   │
│   ├── profile/
│   │   ├── datasources/
│   │   │   ├── profileRemoteDataSource.ts
│   │   │   └── profileLocalDataSource.ts
│   │   ├── models/
│   │   │   └── profileModel.ts
│   │   ├── mappers/
│   │   │   └── profileMapper.ts
│   │   └── repositories/
│   │       └── profileRepositoryImpl.ts
│   │
│   ├── chat/
│   │   ├── datasources/
│   │   │   ├── chatRemoteDataSource.ts      # Firestore real-time listeners
│   │   │   └── chatLocalDataSource.ts       # Offline message queue
│   │   ├── models/
│   │   │   ├── messageModel.ts
│   │   │   └── conversationModel.ts
│   │   ├── mappers/
│   │   │   ├── messageMapper.ts
│   │   │   └── conversationMapper.ts
│   │   └── repositories/
│   │       └── chatRepositoryImpl.ts
│   │
│   ├── feed/
│   │   ├── datasources/
│   │   │   ├── feedRemoteDataSource.ts
│   │   │   └── feedLocalDataSource.ts
│   │   ├── models/
│   │   │   └── postModel.ts
│   │   ├── mappers/
│   │   │   └── postMapper.ts
│   │   └── repositories/
│   │       └── feedRepositoryImpl.ts
│   │
│   └── settings/
│       ├── datasources/
│       │   └── settingsLocalDataSource.ts   # MMKV for preferences
│       ├── models/
│       │   └── settingsModel.ts
│       ├── mappers/
│       │   └── settingsMapper.ts
│       └── repositories/
│           └── settingsRepositoryImpl.ts
│
├── domain/                         # === DOMAIN LAYER (PURE — NO EXTERNAL DEPS) ===
│   ├── auth/
│   │   ├── entities/
│   │   │   └── userEntity.ts                # Pure domain entity
│   │   ├── repositories/
│   │   │   └── authRepository.ts            # Abstract interface (TypeScript interface)
│   │   └── usecases/
│   │       ├── signInUseCase.ts
│   │       ├── signUpUseCase.ts
│   │       ├── signOutUseCase.ts
│   │       └── getCurrentUserUseCase.ts
│   │
│   ├── profile/
│   │   ├── entities/
│   │   │   └── profileEntity.ts
│   │   ├── repositories/
│   │   │   └── profileRepository.ts
│   │   └── usecases/
│   │       ├── getProfileUseCase.ts
│   │       └── updateProfileUseCase.ts
│   │
│   ├── chat/
│   │   ├── entities/
│   │   │   ├── messageEntity.ts
│   │   │   └── conversationEntity.ts
│   │   ├── repositories/
│   │   │   └── chatRepository.ts
│   │   └── usecases/
│   │       ├── getConversationsUseCase.ts
│   │       ├── getMessagesUseCase.ts
│   │       └── sendMessageUseCase.ts
│   │
│   ├── feed/
│   │   ├── entities/
│   │   │   └── postEntity.ts
│   │   ├── repositories/
│   │   │   └── feedRepository.ts
│   │   └── usecases/
│   │       ├── getPostsUseCase.ts
│   │       ├── createPostUseCase.ts
│   │       └── likePostUseCase.ts
│   │
│   └── settings/
│       ├── entities/
│       │   └── settingsEntity.ts
│       ├── repositories/
│       │   └── settingsRepository.ts
│       └── usecases/
│           ├── getSettingsUseCase.ts
│           └── updateSettingsUseCase.ts
│
├── presentation/                   # === PRESENTATION LAYER (FEATURE-BASED) ===
│   ├── auth/
│   │   ├── screens/
│   │   │   ├── SignInScreen.tsx
│   │   │   ├── SignUpScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── components/
│   │   │   ├── AuthForm.tsx
│   │   │   └── SocialLoginButtons.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts                   # Calls use cases, manages UI state
│   │   └── store/
│   │       └── authStore.ts                 # Zustand slice for auth state
│   │
│   ├── profile/
│   │   ├── screens/
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── EditProfileScreen.tsx
│   │   ├── components/
│   │   │   ├── ProfileHeader.tsx
│   │   │   └── ProfileStats.tsx
│   │   ├── hooks/
│   │   │   └── useProfile.ts
│   │   └── store/
│   │       └── profileStore.ts
│   │
│   ├── chat/
│   │   ├── screens/
│   │   │   ├── ConversationsScreen.tsx
│   │   │   └── ChatScreen.tsx
│   │   ├── components/
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── ConversationCard.tsx
│   │   ├── hooks/
│   │   │   ├── useConversations.ts
│   │   │   └── useMessages.ts
│   │   └── store/
│   │       └── chatStore.ts
│   │
│   ├── feed/
│   │   ├── screens/
│   │   │   ├── FeedScreen.tsx
│   │   │   └── PostDetailScreen.tsx
│   │   ├── components/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostActions.tsx
│   │   │   └── CreatePostModal.tsx
│   │   ├── hooks/
│   │   │   └── useFeed.ts
│   │   └── store/
│   │       └── feedStore.ts
│   │
│   ├── settings/
│   │   ├── screens/
│   │   │   └── SettingsScreen.tsx
│   │   ├── components/
│   │   │   ├── SettingsRow.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── hooks/
│   │   │   └── useSettings.ts
│   │   └── store/
│   │       └── settingsStore.ts
│   │
│   └── shared/                     # Cross-feature shared UI
│       ├── components/
│       │   ├── ui/                  # Design system primitives
│       │   │   ├── AppButton.tsx
│       │   │   ├── AppText.tsx
│       │   │   ├── AppInput.tsx
│       │   │   ├── AppModal.tsx
│       │   │   ├── LoadingIndicator.tsx
│       │   │   └── ErrorView.tsx
│       │   ├── ErrorBoundary.tsx
│       │   └── NetworkBanner.tsx    # Offline indicator banner
│       ├── hooks/
│       │   ├── useNetworkStatus.ts
│       │   └── useAppState.ts
│       └── layouts/
│           └── ScreenLayout.tsx     # SafeArea + KeyboardAvoidingView wrapper
│
├── app/                            # Expo Router entry — file-based routing
│   ├── _layout.tsx                 # Root layout (providers, DI, Firebase init)
│   ├── index.tsx                   # Entry redirect
│   ├── (auth)/
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── forgot-password.tsx
│   ├── (main)/
│   │   ├── _layout.tsx             # Tab navigator layout
│   │   ├── (feed)/
│   │   │   ├── index.tsx
│   │   │   └── [postId].tsx
│   │   ├── (chat)/
│   │   │   ├── index.tsx
│   │   │   └── [conversationId].tsx
│   │   ├── (profile)/
│   │   │   ├── index.tsx
│   │   │   └── edit.tsx
│   │   └── settings.tsx
│   └── +not-found.tsx
│
└── assets/                         # Images, fonts, Lottie animations
    ├── images/
    ├── fonts/
    └── animations/
```

---

## 5. Layer Implementation Rules

### 5.1 Domain Layer

The domain layer is the **heart** of the application. It must remain **pure**.

#### Entities

```typescript
// domain/auth/entities/userEntity.ts
export interface UserEntity {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Date;
}
```

- Entities are plain TypeScript interfaces or classes.
- No decorators, no Firebase types, no external library types.
- Entities represent **business objects**, not database documents.

#### Repository Contracts (Interfaces)

```typescript
// domain/auth/repositories/authRepository.ts
import { UserEntity } from '../entities/userEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface AuthRepository {
  signIn(email: string, password: string): Promise<Either<Failure, UserEntity>>;
  signUp(email: string, password: string, displayName: string): Promise<Either<Failure, UserEntity>>;
  signOut(): Promise<Either<Failure, void>>;
  getCurrentUser(): Promise<Either<Failure, UserEntity | null>>;
}
```

- Repositories are **interfaces only** in Domain. No implementation.
- Return `Either<Failure, T>` pattern for explicit error handling (no thrown exceptions at domain boundary).

#### Use Cases

```typescript
// domain/auth/usecases/signInUseCase.ts
import { AuthRepository } from '../repositories/authRepository';
import { UserEntity } from '../entities/userEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class SignInUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<Either<Failure, UserEntity>> {
    return this.authRepository.signIn(email, password);
  }
}
```

- One class per use case. Single `execute()` method.
- Use cases receive repository interfaces via **constructor injection**.
- Use cases contain **business logic only**. No UI logic, no Firebase logic.
- Use cases may call multiple repositories if needed (e.g., a transaction across features).
- Name pattern: `VerbNounUseCase` (e.g., `GetPostsUseCase`, `SendMessageUseCase`).

### 5.2 Data Layer

#### Models (DTOs)

```typescript
// data/auth/models/userModel.ts
import { Timestamp } from 'firebase/firestore';

export interface UserModel {
  uid: string;
  email: string;
  display_name: string;        // Firestore snake_case
  avatar_url: string | null;
  created_at: Timestamp;       // Firebase Timestamp type
}
```

- Models mirror the exact Firestore document shape.
- Models may use Firebase-specific types (`Timestamp`, `GeoPoint`, etc.).
- Models are **never** used outside the Data layer.

#### Mappers

```typescript
// data/auth/mappers/userMapper.ts
import { UserModel } from '../models/userModel';
import { UserEntity } from '@/domain/auth/entities/userEntity';

export class UserMapper {
  static toEntity(model: UserModel): UserEntity {
    return {
      id: model.uid,
      email: model.email,
      displayName: model.display_name,
      avatarUrl: model.avatar_url,
      createdAt: model.created_at.toDate(),
    };
  }

  static toModel(entity: UserEntity): Omit<UserModel, 'created_at'> {
    return {
      uid: entity.id,
      email: entity.email,
      display_name: entity.displayName,
      avatar_url: entity.avatarUrl,
    };
  }
}
```

- Every model has a corresponding mapper.
- Mappers are static utility classes.
- Mappers handle all type conversions (e.g., `Timestamp` → `Date`).

#### Data Sources

```typescript
// data/auth/datasources/authRemoteDataSource.ts
import { auth, firestore } from '@/core/firebase/firebaseConfig';
import { UserModel } from '../models/userModel';

export interface AuthRemoteDataSource {
  signIn(email: string, password: string): Promise<UserModel>;
  signUp(email: string, password: string, displayName: string): Promise<UserModel>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<UserModel | null>;
}

export class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  // Firebase SDK calls go HERE and ONLY here
}
```

- **Remote data sources**: Firestore, Firebase Auth, Cloud Storage, Cloud Functions calls.
- **Local data sources**: MMKV, SecureStore, AsyncStorage, local cache.
- Data sources throw **exceptions** (`ServerException`, `CacheException`).
- Data sources return **models**, never entities.

#### Repository Implementations

```typescript
// data/auth/repositories/authRepositoryImpl.ts
import { AuthRepository } from '@/domain/auth/repositories/authRepository';
import { AuthRemoteDataSource } from '../datasources/authRemoteDataSource';
import { AuthLocalDataSource } from '../datasources/authLocalDataSource';
import { UserMapper } from '../mappers/userMapper';
import { NetworkInfo } from '@/core/network/networkInfo';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure, NetworkFailure } from '@/core/error/failures';
import { ServerException } from '@/core/error/exceptions';
import { UserEntity } from '@/domain/auth/entities/userEntity';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    private readonly remote: AuthRemoteDataSource,
    private readonly local: AuthLocalDataSource,
    private readonly network: NetworkInfo,
  ) {}

  async signIn(email: string, password: string): Promise<Either<Failure, UserEntity>> {
    try {
      const model = await this.remote.signIn(email, password);
      const entity = UserMapper.toEntity(model);
      await this.local.cacheUser(model);
      return right(entity);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new NetworkFailure('Connection failed'));
    }
  }
}
```

- Repository implementations handle the **remote vs. local** data source decision.
- Catch exceptions from data sources → convert to `Failure` objects → return `Either`.
- Check `NetworkInfo` to decide whether to use remote or local data source.
- Map models to entities before returning.

### 5.3 Presentation Layer

#### Feature Hooks (ViewModel Pattern)

```typescript
// presentation/auth/hooks/useAuth.ts
import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { container } from '@/core/di/container';

export const useAuth = () => {
  const { user, isLoading, error, setUser, setLoading, setError } = useAuthStore();
  const signInUseCase = container.signInUseCase;

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const result = await signInUseCase.execute(email, password);
    result.fold(
      (failure) => setError(failure.message),
      (user) => setUser(user),
    );
    setLoading(false);
  }, []);

  return { user, isLoading, error, signIn };
};
```

- Feature hooks act as the **ViewModel**. They bridge use cases to UI.
- Hooks call use cases from the DI container.
- Hooks manage loading/error/success states via Zustand store.
- Hooks NEVER import from the Data layer.

#### Zustand Stores

```typescript
// presentation/auth/store/authStore.ts
import { create } from 'zustand';
import { UserEntity } from '@/domain/auth/entities/userEntity';

interface AuthState {
  user: UserEntity | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: UserEntity | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ user: null, isLoading: false, error: null }),
}));
```

- One Zustand store per feature.
- Stores hold **UI state only** (loading, error, cached entities for display).
- Stores use Domain entities, never Data models.
- Keep stores minimal — avoid duplicating server state.

#### Screens

```typescript
// presentation/auth/screens/SignInScreen.tsx
import React from 'react';
import { View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { AuthForm } from '../components/AuthForm';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { ErrorView } from '@/presentation/shared/components/ui/ErrorView';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';

export default function SignInScreen() {
  const { signIn, isLoading, error } = useAuth();

  if (isLoading) return <LoadingIndicator />;

  return (
    <ScreenLayout>
      {error && <ErrorView message={error} />}
      <AuthForm onSubmit={signIn} />
    </ScreenLayout>
  );
}
```

- Screens are **thin**. They compose components and connect hooks.
- Screens use `default export` (required by Expo Router).
- All other components use **named exports**.

---

## 6. Dependency Injection

```typescript
// core/di/container.ts
import { AuthRemoteDataSourceImpl } from '@/data/auth/datasources/authRemoteDataSource';
import { AuthLocalDataSourceImpl } from '@/data/auth/datasources/authLocalDataSource';
import { AuthRepositoryImpl } from '@/data/auth/repositories/authRepositoryImpl';
import { SignInUseCase } from '@/domain/auth/usecases/signInUseCase';
import { SignUpUseCase } from '@/domain/auth/usecases/signUpUseCase';
import { NetworkInfoImpl } from '@/core/network/networkInfo';
// ... repeat for each feature

const networkInfo = new NetworkInfoImpl();

// --- Auth ---
const authRemote = new AuthRemoteDataSourceImpl();
const authLocal = new AuthLocalDataSourceImpl();
const authRepository = new AuthRepositoryImpl(authRemote, authLocal, networkInfo);

const signInUseCase = new SignInUseCase(authRepository);
const signUpUseCase = new SignUpUseCase(authRepository);

// ... repeat for profile, chat, feed, settings

export const container = {
  signInUseCase,
  signUpUseCase,
  // ... all use cases
};
```

- Single `container.ts` file wires **all** dependencies.
- Presentation layer accesses use cases via `container.useCase`.
- Data layer classes are instantiated **only** in the container.
- This is the **only** place where Data layer classes are directly referenced from outside Data layer.

---

## 7. Error Handling System

### Exceptions (Data Layer — thrown)

```typescript
// core/error/exceptions.ts
export class ServerException extends Error {
  constructor(message: string = 'Server error occurred', public code?: string) {
    super(message);
    this.name = 'ServerException';
  }
}

export class CacheException extends Error {
  constructor(message: string = 'Cache error occurred') {
    super(message);
    this.name = 'CacheException';
  }
}

export class NetworkException extends Error {
  constructor(message: string = 'No internet connection') {
    super(message);
    this.name = 'NetworkException';
  }
}

export class AuthException extends Error {
  constructor(message: string = 'Authentication failed', public code?: string) {
    super(message);
    this.name = 'AuthException';
  }
}
```

### Failures (Domain Layer — returned)

```typescript
// core/error/failures.ts
export abstract class Failure {
  constructor(public readonly message: string) {}
}

export class ServerFailure extends Failure {}
export class CacheFailure extends Failure {}
export class NetworkFailure extends Failure {}
export class AuthFailure extends Failure {}
export class ValidationFailure extends Failure {}
```

### Either Type

```typescript
// core/types/either.ts
export type Either<L, R> = Left<L> | Right<R>;

export class Left<L> {
  constructor(public readonly value: L) {}
  isLeft(): this is Left<L> { return true; }
  isRight(): boolean { return false; }
  fold<T>(onLeft: (l: L) => T, _onRight: (r: never) => T): T { return onLeft(this.value); }
}

export class Right<R> {
  constructor(public readonly value: R) {}
  isLeft(): boolean { return false; }
  isRight(): this is Right<R> { return true; }
  fold<T>(_onLeft: (l: never) => T, onRight: (r: R) => T): T { return onRight(this.value); }
}

export const left = <L>(value: L): Either<L, never> => new Left(value);
export const right = <R>(value: R): Either<never, R> => new Right(value);
```

### Error Flow

```
DataSource throws Exception
    → Repository catches Exception → returns left(Failure)
        → Use Case passes Either through
            → Hook calls fold() → updates Zustand error state
                → Screen renders ErrorView
```

- Data sources **throw** exceptions.
- Repositories **catch** exceptions and return `Either<Failure, T>`.
- Use cases return `Either` — they do NOT try/catch (unless adding business logic).
- Presentation hooks call `.fold()` to handle success/failure.
- **Never let an unhandled exception escape a repository.**

---

## 8. Firebase Rules

### Initialization & Offline

```typescript
// core/firebase/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = { /* from env */ };

const app = initializeApp(firebaseConfig);

// Firestore with OFFLINE PERSISTENCE
export const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Auth with RN persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
```

### Firebase-Specific Rules

- **Firestore offline mode MUST be enabled** at initialization. Users expect the app to work offline.
- All Firestore reads should handle both cached and server data gracefully.
- Use `onSnapshot` for **real-time data** (chat messages, feed updates). Wrap in data source classes.
- Use `getDoc` / `getDocs` for **one-time reads**.
- Use `serverTimestamp()` for all timestamp fields written to Firestore.
- Firebase SDK imports are **only allowed in the Data layer** and `core/firebase/`.
- Never import `firebase/*` in Domain or Presentation layers.
- Store Firebase config values in environment variables (`.env`). Never hardcode.
- Use `react-native-firebase` (`@react-native-firebase/*`) for native module features (FCM, Crashlytics). Use the modular web SDK (`firebase/*`) for Firestore/Auth if using Expo.

### Firestore Data Design

- Collection and document IDs use **camelCase**.
- Document field names use **snake_case** (Firestore convention).
- Always define Firestore security rules — never leave collections open.
- Subcollections are preferred over deeply nested maps for lists.
- Denormalize data where needed for read performance (e.g., user display name in message docs).

### Offline Behavior

- The app must remain **fully functional** for read operations when offline (Firestore cache serves data).
- Write operations while offline are queued by Firestore and synced when connectivity returns.
- Show a `NetworkBanner` component when the device is offline so the user is aware.
- Use `onSnapshot` metadata (`fromCache`) to indicate stale data to the user when appropriate.
- Chat feature: queue messages locally and sync when back online. Show pending state on unsent messages.
- Never block the UI waiting for network. Always show cached data first, then update when server responds.

---

## 9. Code Style & Conventions

### General

- Use **TypeScript** for all files. No `.js` files unless required by tooling.
- Use **functional components** with hooks. Never use class components.
- Use **named exports** for all components and hooks. **Default exports** only for screen files (Expo Router requirement).
- All components must have an explicit **Props type/interface** defined above the component.
- Destructure props in the function signature.
- Keep files under **200 lines**. Extract logic into hooks or sub-components.

### Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Components | PascalCase | `PostCard.tsx` |
| Screens | PascalCase + `Screen` suffix | `FeedScreen.tsx` |
| Hooks | camelCase + `use` prefix | `useFeed.ts` |
| Use Cases | PascalCase + `UseCase` suffix | `GetPostsUseCase.ts` |
| Repositories | PascalCase + `Repository` suffix | `FeedRepository.ts` |
| Repository Impls | PascalCase + `RepositoryImpl` suffix | `FeedRepositoryImpl.ts` |
| Data Sources | PascalCase + `DataSource` suffix | `FeedRemoteDataSource.ts` |
| Models (DTOs) | PascalCase + `Model` suffix | `PostModel.ts` |
| Entities | PascalCase + `Entity` suffix | `PostEntity.ts` |
| Mappers | PascalCase + `Mapper` suffix | `PostMapper.ts` |
| Zustand stores | camelCase + `Store` suffix | `feedStore.ts` |
| Constants | UPPER_SNAKE_CASE | `API_TIMEOUT` |
| Folders | camelCase | `datasources/`, `usecases/` |

### Imports

- Use **absolute imports** via path alias `@/` mapped to `src/`.
- Order imports: (1) React/RN, (2) third-party libs, (3) Domain layer, (4) Data layer (only in Data files), (5) Presentation layer, (6) Core, (7) types, (8) assets.
- Never use `require()` for TS/JS modules.

---

## 10. React Native UI Rules

### Components

- Use `Pressable` instead of `TouchableOpacity` for new code.
- Always wrap raw strings in `<Text>` (or `AppText`). Bare strings crash Android.
- Use `FlashList` or `FlatList` for lists. Never `ScrollView` for dynamic-length lists.
- Use the `ScreenLayout` wrapper for all screens (handles SafeArea + Keyboard).
- Show `NetworkBanner` when offline (leverage `useNetworkStatus` hook).

### NativeWind / Styling

- Use NativeWind `className` for styling. Define complex/reusable styles in theme config.
- Use theme tokens for colors, spacing, typography. No hardcoded hex values or magic numbers.
- Support both **iOS and Android**. Use `Platform.select()` for platform-specific styles.
- Avoid fixed pixel widths for layout — use `flex`, `w-full`, percentages.

### Performance

- Memoize with `React.memo()` for components in lists or heavy re-render paths.
- Use `useCallback` for functions passed as props to child components or FlatList.
- Use `useMemo` for expensive computations only.
- Extract `FlatList` `renderItem` to a named component — never define inline.
- Use stable `keyExtractor` with unique IDs. Never use array index as key.

### Forms (React Hook Form + Zod)

- Define Zod schemas in the feature's `hooks/` or a co-located `schemas/` folder.
- Use `zodResolver` with `useForm`.
- Show field-level validation errors inline.
- Disable submit button while `isSubmitting`.

### Accessibility

- All interactive elements must have `accessibilityLabel` and `accessibilityRole`.
- All images must have `accessibilityLabel` (alt text equivalent).
- Support dynamic font scaling — don't disable `allowFontScaling`.

---

## 11. i18n (react-i18next)

- All user-facing strings go through `t('key')`. **No hardcoded display strings**.
- Translation keys use dot notation: `auth.signIn.title`, `feed.post.likeButton`.
- Default language: English (`en.json`).
- Keep translation files organized by feature to match the feature folders.

---

## 12. Testing Strategy

### Unit Tests (Jest)

- **Use Cases**: Test business logic with mocked repository interfaces.
- **Mappers**: Test model ↔ entity conversions.
- **Utils**: Test pure utility functions.
- Place test files next to source: `signInUseCase.test.ts` alongside `signInUseCase.ts`.

### Integration Tests (React Native Testing Library)

- **Screens**: Render with mocked hooks/stores. Test user flows.
- **Components**: Test rendering, user interactions, conditional display.
- Test behavior, not implementation details.

### E2E Tests (Maestro)

- Cover critical paths: sign in, create post, send message, change settings.
- Maestro flow files live in `e2e/` at project root.

### Test Commands

```bash
npx jest --passWithNoTests          # Unit + Integration
maestro test e2e/                   # E2E
```

---

## 13. Security

- Never store tokens or sensitive data in `AsyncStorage`. Use `expo-secure-store` or `react-native-keychain`.
- Never log sensitive information (tokens, passwords, PII).
- Sanitize user input before writing to Firestore.
- All network requests over HTTPS only.
- Do not commit `.env` files, `google-services.json`, or `GoogleService-Info.plist`.
- Add these to `.gitignore`.

---

## 14. Git & Workflow

- Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`.
- One logical change per commit.
- Do not modify unrelated files.
- Run checks before committing:
  ```bash
  npx tsc --noEmit && npx eslint . --ext .ts,.tsx && npx jest --passWithNoTests
  ```

---

## 15. Common Pitfalls — NEVER DO THESE

1. **Never import Firebase SDK in Domain or Presentation layers.**
2. **Never use `any` type.** Use `unknown` and narrow, or define proper types.
3. **Never let a Data layer model leak into Presentation.** Always map to entities.
4. **Never throw exceptions from Use Cases.** Return `Either<Failure, T>`.
5. **Never use `@ts-ignore`.** Use `@ts-expect-error` with explanation if absolutely necessary.
6. **Never use `console.log` in production code.** Use a logger utility.
7. **Never install new packages** without confirming with the user.
8. **Never modify native iOS/Android files** without explicit instruction.
9. **Never use `useEffect` for derived state.** Compute during render or use `useMemo`.
10. **Never put business logic in screens or components.** It belongs in use cases.
11. **Never call a repository directly from Presentation.** Always go through a use case.
12. **Never skip the mapper.** Even if model and entity look identical today.

---

## 16. Pre-Completion Checklist

Before marking any task as complete, verify:

- [ ] Code compiles: `npx tsc --noEmit`
- [ ] Linting passes: `npx eslint . --ext .ts,.tsx`
- [ ] Tests pass: `npx jest --passWithNoTests`
- [ ] No `any` types introduced
- [ ] No hardcoded strings (use i18n), colors (use theme), or URLs (use env)
- [ ] Layer boundaries respected (no cross-layer imports)
- [ ] Firebase imports only in Data layer and `core/firebase/`
- [ ] Models mapped to entities at repository boundary
- [ ] Error handling follows Exception → Failure → Either flow
- [ ] Works on both iOS and Android
- [ ] Accessibility labels on interactive elements
- [ ] Offline behavior considered (Firestore persistence)
