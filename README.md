# ReviewHub

A React Native mobile app built with Clean Architecture, Expo Router, and Firebase.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with three main layers:

- **Domain Layer** (`src/domain/`): Business logic, entities, and repository interfaces
- **Data Layer** (`src/data/`): Data sources, models, mappers, and repository implementations
- **Presentation Layer** (`src/presentation/`): UI components, screens, hooks, and state management

## 📁 Project Structure

```
ReviewHub/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                   # Auth group (sign-in, sign-up)
│   ├── (main)/                   # Main app group (bottom tabs)
│   │   ├── (feed)/               # Feed tab
│   │   ├── (chat)/               # Chat tab
│   │   ├── (profile)/            # Profile tab
│   │   └── settings.tsx          # Settings tab
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # App entry point
│
├── src/
│   ├── core/                     # Core utilities
│   │   ├── di/                   # Dependency injection
│   │   ├── error/                # Error handling (exceptions, failures)
│   │   ├── network/              # Network info
│   │   ├── firebase/             # Firebase config
│   │   ├── theme/                # Theme (colors, spacing)
│   │   ├── constants/            # App constants
│   │   ├── i18n/                 # Internationalization
│   │   └── types/                # Shared types (Either)
│   │
│   ├── data/                     # Data layer (per feature)
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── chat/
│   │   ├── feed/
│   │   └── settings/
│   │
│   ├── domain/                   # Domain layer (per feature)
│   │   ├── auth/
│   │   │   ├── entities/         # UserEntity
│   │   │   ├── repositories/     # AuthRepository interface
│   │   │   └── usecases/         # SignIn, SignUp, etc.
│   │   ├── profile/
│   │   ├── chat/
│   │   ├── feed/
│   │   └── settings/
│   │
│   ├── presentation/             # Presentation layer (per feature)
│   │   ├── auth/
│   │   │   ├── screens/          # SignInScreen, SignUpScreen
│   │   │   ├── components/       # Feature-specific components
│   │   │   ├── hooks/            # Feature-specific hooks
│   │   │   └── store/            # Feature-specific state (Zustand)
│   │   ├── profile/
│   │   ├── chat/
│   │   ├── feed/
│   │   ├── settings/
│   │   └── shared/               # Shared presentation components
│   │       ├── components/ui/    # AppText, LoadingIndicator, ErrorView
│   │       ├── hooks/            # useNetworkStatus
│   │       └── layouts/          # ScreenLayout
│   │
│   └── assets/                   # Images, fonts, animations
│
├── e2e/                          # End-to-end tests
├── .env.example                  # Environment variables template
├── app.json                      # Expo config
├── babel.config.js               # Babel config (NativeWind, module resolver)
├── tailwind.config.js            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

## 🚀 Tech Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand
- **Backend**: Firebase (Auth, Firestore)
- **Forms**: React Hook Form + Zod
- **Internationalization**: react-i18next
- **Language**: TypeScript

## 📦 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Add your Firebase credentials

3. **Start the development server**:
   ```bash
   npm start
   ```

## 🔧 Next Steps

1. **Configure Firebase**:
   - Add your Firebase config to `.env`
   - Update `src/core/firebase/firebaseConfig.ts` to use environment variables

2. **Implement Data Layer**:
   - Create data sources (Firebase, local storage)
   - Implement repository interfaces
   - Create mappers to convert models to entities

3. **Implement Domain Layer**:
   - Create use cases for each feature
   - Wire up dependencies in `src/core/di/container.ts`

4. **Add Tab Bar Icons**:
   - Install an icon library (e.g., `lucide-react-native`)
   - Update `app/(main)/_layout.tsx` with `tabBarIcon` options

5. **Build Features**:
   - Implement authentication forms
   - Build feed, chat, profile, and settings features
   - Add proper error handling and loading states

## 📱 Features

- **Authentication**: Sign in, sign up, sign out
- **Feed**: View and create posts
- **Chat**: Real-time conversations
- **Profile**: User profiles with edit functionality
- **Settings**: App settings and preferences
- **Internationalization**: English and Arabic support
- **Offline Support**: Network detection and offline banner

## 🧪 Testing

- End-to-end tests location: `e2e/`

## 📄 License

This project is private and proprietary.
