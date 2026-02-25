# Implementation Plan: Premium Dark Mode Theme

## Overview
Apply the premium dark mode theme from the provided HTML to the React Native app, creating a cohesive dark mode design system with neon purple accents, glassmorphic effects, and modern UI components.

## Current State Analysis

### Existing Infrastructure
- ✅ NativeWind configured and working
- ✅ Tailwind config exists (basic setup)
- ✅ Theme files in `src/core/theme/` (currently light mode)
- ✅ Basic UI components (AppText, LoadingIndicator, ErrorView)
- ✅ ScreenLayout with SafeArea support
- ✅ Expo Router with tab navigation
- ✅ i18n configured

### Gaps to Address
- ❌ Dark mode color palette not defined
- ❌ No custom Tailwind colors for midnight, card-dark, neon-purple
- ❌ Missing UI components: Card, Avatar, IconBadge, Toggle
- ❌ Profile/Settings screens are placeholders
- ❌ Tab navigation uses light mode styling
- ❌ No icon library configured
- ❌ No animations/effects (neon glow, pulse)

## Target Design (from HTML)

### Color Palette
```
Backgrounds:
  - midnight: #0F172A (deep background)
  - card-dark: #1E293B (card background)
  - border-dark: #334155 (borders)

Accents:
  - primary: #3B82F6 (blue)
  - neon-purple: #A855F7 (accent/active state)

Status Colors:
  - blue: #3B82F6
  - pink: #EC4899
  - green: #22C55E
  - orange: #F97316
  - indigo: #6366F1
  - purple: #A855F7
  - emerald: #10B981
  - yellow: #EAB308
  - cyan: #06B6D4
  - red: #EF4444

Text:
  - text-white: #FFFFFF
  - text-slate-100: #F1F5F9
  - text-slate-200: #E2E8F0
  - text-slate-400: #94A3B8
  - text-slate-500: #64748B
  - text-slate-600: #475569
```

### Key Design Features
1. **Neon Glow Effect**: Pulsing purple glow on avatar
2. **Glassmorphism**: Backdrop blur on tab bar
3. **Card Design**: Rounded cards with subtle borders and shadows
4. **Icon Badges**: Colored circular backgrounds for section icons
5. **Section Headers**: Small purple indicator bar + uppercase label
6. **Toggle Switches**: Custom styled with purple active state
7. **Tab Bar**: Fixed bottom navigation with glow effect on active tab

### Typography
- Font: Inter (weights: 400, 500, 600, 700)
- Tracking: Wide tracking on uppercase labels

## Implementation Steps

### Phase 1: Theme & Configuration Updates

#### 1.1 Update Theme Files
**File: `src/core/theme/colors.ts`**
- Replace light mode colors with dark mode palette
- Add all colors from the HTML design
- Export as const for type safety

**File: `src/core/theme/typography.ts`** (new)
- Define font families (Inter)
- Define font sizes, weights, line heights
- Define letter spacing values

**File: `src/core/theme/shadows.ts`** (new)
- Define shadow styles for cards
- Define glow effects for neon elements

**File: `src/core/theme/animations.ts`** (new)
- Define pulse animation for avatar
- Define transition durations

#### 1.2 Update Tailwind Config
**File: `tailwind.config.js`**
- Add custom colors (midnight, card-dark, border-dark, neon-purple)
- Add custom shadows
- Add custom animations (pulse-purple)
- Extend with backdrop-blur utilities
- Add Inter font family

### Phase 2: Core UI Components

#### 2.1 Update Existing Components
**File: `src/presentation/shared/components/ui/AppText.tsx`**
- Update default color to text-slate-100
- Add variant support (heading, body, caption, label)
- Add color prop support

**File: `src/presentation/shared/layouts/ScreenLayout.tsx`**
- Change background to bg-midnight
- Update padding/safe area handling

#### 2.2 Create New Components

**File: `src/presentation/shared/components/ui/Card.tsx`** (new)
- Rounded-2xl container with bg-card-dark
- Border with border-border-dark/30
- Shadow support
- Optional hover effect

**File: `src/presentation/shared/components/ui/IconBadge.tsx`** (new)
- Circular/rounded badge with colored background
- Icon support (using vector icons)
- Color variants (blue, pink, green, orange, etc.)
- Size variants (sm, md, lg)

**File: `src/presentation/shared/components/ui/Avatar.tsx`** (new)
- Circular image container
- Border with neon-purple
- Optional neon glow effect (pulsing animation)
- Edit button overlay support

**File: `src/presentation/shared/components/ui/Toggle.tsx`** (new)
- Custom toggle switch
- Purple active state
- Smooth transition animation

**File: `src/presentation/shared/components/ui/SectionHeader.tsx`** (new)
- Purple indicator bar
- Uppercase label with tracking
- Consistent spacing

**File: `src/presentation/shared/components/ui/SettingsRow.tsx`** (new)
- Reusable row component for settings/profile sections
- Icon badge + label + right content (chevron/toggle/value)
- Hover effect
- Divider support

### Phase 3: Profile Screen Implementation

**File: `src/presentation/profile/screens/ProfileScreen.tsx`**
Implement full profile UI matching HTML:
1. **Header**: Back button + title (opacity 0 initially, for scroll effect)
2. **Avatar Section**:
   - Large avatar with neon glow
   - Edit button overlay
   - Name and email below
3. **Profile Section**:
   - Section header with purple indicator
   - Card with rows:
     - Personal Info
     - Wishlist
     - Verify account
     - Reset Password
4. **Settings Section**:
   - Section header
   - Card with rows:
     - Notifications (toggle)
     - Dark Mode (toggle)
     - Language (with value + chevron)
5. **Support Section**:
   - Section header
   - Card with rows:
     - Help Center
     - Privacy Policy
     - Log out (red accent)

**File: `src/presentation/profile/components/ProfileHeader.tsx`** (new)
- Avatar with glow effect
- Name and email display
- Edit functionality

**File: `src/presentation/profile/hooks/useProfile.ts`** (update if exists)
- Connect to profile use cases
- Handle profile data loading
- Handle profile updates

### Phase 4: Tab Navigation Updates

**File: `app/(main)/_layout.tsx`**
- Update tab bar styling to match dark theme
- Background: midnight with backdrop blur
- Border: slate-800
- Active tint: neon-purple
- Inactive tint: slate-500
- Add icon support with vector icons
- Add glow effect on active tab
- Adjust heights for iOS/Android (85px bottom bar)

### Phase 5: Icons Setup

**Option A: @expo/vector-icons** (recommended - already included with Expo)
- Use MaterialCommunityIcons for most icons
- Map icon names from HTML Material Symbols to React Native equivalents

**Option B: react-native-vector-icons**
- Install MaterialIcons
- Configure for both iOS and Android

**Implementation**: Create icon mapping utility
**File: `src/presentation/shared/components/ui/Icon.tsx`** (new)
- Wrapper component for consistent icon usage
- Support for icon name, size, color props
- Map common icon names

### Phase 6: Settings Integration

**Decision Point**: The HTML shows Settings as part of Profile screen
- Option A: Merge settings into Profile screen (matches HTML exactly)
- Option B: Keep separate Settings tab, style it similarly

**Recommendation**: Option A - Merge into Profile for cleaner UX matching the provided design

**Changes Required**:
- Update tab configuration to remove Settings tab OR
- Keep Settings tab but make it a duplicate/redirect to Profile
- Update translations

### Phase 7: Polish & Effects

#### 7.1 Animations
- Add pulse animation to avatar (using Animated API or Reanimated)
- Add smooth transitions to toggles
- Add press feedback to buttons/rows

#### 7.2 Blur Effects
- Add backdrop blur to tab bar (if supported on device)
- Add blur to header on scroll (optional enhancement)

#### 7.3 Accessibility
- Add accessibilityLabel to all interactive elements
- Add accessibilityRole to buttons, toggles
- Ensure color contrast meets WCAG AA standards
- Support dynamic font scaling

#### 7.4 Status Bar
**File: `app/_layout.tsx`**
- Change StatusBar style to "light" (white text on dark background)

### Phase 8: Testing & Refinement

1. **Visual Testing**:
   - Test on iOS and Android
   - Verify safe area insets on different devices
   - Test on different screen sizes

2. **Functionality Testing**:
   - Test toggle switches
   - Test navigation
   - Test edit profile flow
   - Test logout functionality

3. **Performance Testing**:
   - Verify animations run smoothly (60fps)
   - Check for unnecessary re-renders
   - Optimize image loading for avatar

## Dependencies to Add

1. **Fonts** (if Inter not available):
   ```bash
   npx expo install expo-font @expo-google-fonts/inter
   ```

2. **Icons** (if not using @expo/vector-icons):
   ```bash
   npm install react-native-vector-icons
   ```

3. **Blur** (for backdrop blur effect):
   ```bash
   npx expo install expo-blur
   ```

4. **Animations** (if not using Animated API):
   ```bash
   npm install react-native-reanimated
   ```

## File Checklist

### To Create
- [ ] `src/core/theme/typography.ts`
- [ ] `src/core/theme/shadows.ts`
- [ ] `src/core/theme/animations.ts`
- [ ] `src/presentation/shared/components/ui/Card.tsx`
- [ ] `src/presentation/shared/components/ui/IconBadge.tsx`
- [ ] `src/presentation/shared/components/ui/Avatar.tsx`
- [ ] `src/presentation/shared/components/ui/Toggle.tsx`
- [ ] `src/presentation/shared/components/ui/SectionHeader.tsx`
- [ ] `src/presentation/shared/components/ui/SettingsRow.tsx`
- [ ] `src/presentation/shared/components/ui/Icon.tsx`
- [ ] `src/presentation/profile/components/ProfileHeader.tsx`

### To Modify
- [ ] `tailwind.config.js`
- [ ] `src/core/theme/colors.ts`
- [ ] `src/core/theme/index.ts`
- [ ] `src/presentation/shared/components/ui/AppText.tsx`
- [ ] `src/presentation/shared/layouts/ScreenLayout.tsx`
- [ ] `src/presentation/profile/screens/ProfileScreen.tsx`
- [ ] `app/(main)/_layout.tsx`
- [ ] `app/_layout.tsx`

### Optional (Based on Decisions)
- [ ] `src/presentation/settings/screens/SettingsScreen.tsx` (may merge into Profile)
- [ ] Translation files for new text content

## Implementation Order

1. **Start with Foundation** (Phase 1): Theme files + Tailwind config
2. **Build UI Kit** (Phase 2): Core components
3. **Implement Profile** (Phase 3): Main profile screen
4. **Update Navigation** (Phase 4): Tab bar styling
5. **Polish** (Phase 5-7): Icons, animations, accessibility
6. **Test** (Phase 8): Comprehensive testing

## Estimated Impact

- **Files Created**: ~11 new files
- **Files Modified**: ~8 existing files
- **Total Changes**: ~19 files
- **Complexity**: Medium-High (requires careful attention to design details)
- **Breaking Changes**: None (additive changes only)

## Notes & Considerations

1. **Clean Architecture Compliance**: All new components stay in Presentation layer
2. **No Business Logic**: UI components are pure presentation, no domain/data layer changes needed
3. **Reusability**: All new components are designed to be reusable across features
4. **Performance**: Use React.memo() for list items and frequently re-rendered components
5. **Type Safety**: All components will have proper TypeScript interfaces
6. **Testing**: Focus on visual regression testing and component integration tests
7. **Gradual Rollout**: Can implement phase by phase without breaking existing functionality

## Success Criteria

- [ ] Profile screen matches the HTML design visually
- [ ] Dark mode theme is applied consistently across the app
- [ ] All interactions work smoothly (toggles, navigation, buttons)
- [ ] Animations run at 60fps
- [ ] Works on both iOS and Android
- [ ] Passes accessibility audit
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] App compiles and runs successfully
