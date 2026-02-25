import { useRoleStore } from '@/presentation/auth/store/roleStore';
import { UserRole } from '@/domain/profile/entities/userRole';

interface TabConfig {
  name: string;
  title: string;
  icon: string;
  iconFocused: string;
}

const TABS_BY_ROLE: Record<UserRole, TabConfig[]> = {
  simple_user: [
    { name: '(feed)', title: 'tabs.home', icon: 'home-outline', iconFocused: 'home' },
    { name: '(notifications)', title: 'tabs.notifications', icon: 'bell-outline', iconFocused: 'bell' },
    { name: '(reviews)', title: 'tabs.myReviews', icon: 'star-outline', iconFocused: 'star' },
    { name: 'settings', title: 'tabs.settings', icon: 'cog-outline', iconFocused: 'cog' },
  ],
  admin: [
    { name: '(feed)', title: 'tabs.dashboard', icon: 'view-dashboard-outline', iconFocused: 'view-dashboard' },
    { name: '(admin)', title: 'tabs.users', icon: 'account-group-outline', iconFocused: 'account-group' },
    { name: '(notifications)', title: 'tabs.notifications', icon: 'bell-outline', iconFocused: 'bell' },
    { name: 'settings', title: 'tabs.settings', icon: 'cog-outline', iconFocused: 'cog' },
  ],
  moderator: [
    { name: '(feed)', title: 'tabs.queue', icon: 'clipboard-list-outline', iconFocused: 'clipboard-list' },
    { name: '(notifications)', title: 'tabs.notifications', icon: 'bell-outline', iconFocused: 'bell' },
    { name: '(reviews)', title: 'tabs.activity', icon: 'history', iconFocused: 'history' },
    { name: 'settings', title: 'tabs.settings', icon: 'cog-outline', iconFocused: 'cog' },
  ],
  business_owner: [
    { name: '(feed)', title: 'tabs.myBusiness', icon: 'store-outline', iconFocused: 'store' },
    { name: '(reviews)', title: 'tabs.reviews', icon: 'star-outline', iconFocused: 'star' },
    { name: '(notifications)', title: 'tabs.notifications', icon: 'bell-outline', iconFocused: 'bell' },
    { name: 'settings', title: 'tabs.settings', icon: 'cog-outline', iconFocused: 'cog' },
  ],
};

export const useRoleNavigation = () => {
  const { role, isRoleLoaded } = useRoleStore();
  const currentRole = role ?? 'simple_user';
  const tabs = TABS_BY_ROLE[currentRole];

  return { role: currentRole, isRoleLoaded, tabs };
};
