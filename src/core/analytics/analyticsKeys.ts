// ── Screen Names ──────────────────────────────────────────────────────────────

export class AnalyticsScreens {
  // Auth
  static readonly SIGN_IN = 'sign_in_screen';
  static readonly SIGN_UP = 'sign_up_screen';

  // Main
  static readonly HOME = 'home_screen';
  static readonly ALL_CATEGORIES = 'all_categories_screen';
  static readonly BUSINESS_DETAIL = 'business_detail_screen';
  static readonly SUB_CATEGORY_BROWSER = 'sub_category_browser_screen';
  static readonly ADD_BUSINESS = 'add_business_screen';
  static readonly CATEGORY_SELECTION = 'category_selection_screen';

  // Profile
  static readonly PROFILE = 'profile_screen';
  static readonly PERSONAL_INFO = 'personal_info_screen';
  static readonly CHANGE_EMAIL = 'change_email_screen';
  static readonly CHANGE_PASSWORD = 'change_password_screen';
  static readonly CONFIRM_PASSWORD_EMAIL = 'confirm_password_email_screen';
  static readonly ADD_EMAIL_FOR_PASSWORD = 'add_email_for_password_screen';
  static readonly VERIFY_ACCOUNT = 'verify_account_screen';

  // Features
  static readonly WISHLIST = 'wishlist_screen';
  static readonly CONVERSATIONS = 'conversations_screen';
  static readonly FEED = 'feed_screen';
  static readonly NOTIFICATIONS = 'notifications_screen';
  static readonly MY_REVIEWS = 'my_reviews_screen';
  static readonly WRITE_REVIEW = 'write_review_screen';
  static readonly SETTINGS = 'settings_screen';

  // Admin
  static readonly ADMIN_DASHBOARD = 'admin_dashboard_screen';
  static readonly ADMIN_USERS = 'admin_users_screen';
  static readonly ADMIN_BOOST_MANAGEMENT = 'admin_boost_management_screen';
  static readonly ADMIN_GLOBAL_INSIGHTS = 'admin_global_insights_screen';

  // Moderator
  static readonly MODERATOR_DASHBOARD = 'moderator_dashboard_screen';

  // Business Owner
  static readonly BUSINESS_OWNER_HOME = 'business_owner_home_screen';
  static readonly COMPANY_PROFILE_EMPTY = 'company_profile_empty_screen';
  static readonly COMPANY_PROFILE_FULL = 'company_profile_full_screen';
  static readonly BUSINESS_INSIGHTS = 'business_insights_screen';
}

// ── Event Names ──────────────────────────────────────────────────────────────

export class AnalyticsEvents {
  // Auth
  static readonly LOGIN = 'login';
  static readonly SIGN_UP = 'sign_up';
  static readonly SIGN_UP_BUSINESS_OWNER = 'sign_up_business_owner';
  static readonly LOGOUT = 'logout';
  static readonly LOGIN_GOOGLE = 'login_google';

  // Search
  static readonly SEARCH = 'search';

  // Category
  static readonly SELECT_CATEGORY = 'select_category';
  static readonly CLEAR_CATEGORY = 'clear_category';

  // Business
  static readonly VIEW_BUSINESS = 'view_business';
  static readonly TOGGLE_FAVORITE = 'toggle_favorite';
  static readonly REFRESH_BUSINESSES = 'refresh_businesses';

  // Wishlist
  static readonly ADD_TO_WISHLIST = 'add_to_wishlist';
  static readonly REMOVE_FROM_WISHLIST = 'remove_from_wishlist';

  // Profile
  static readonly UPDATE_PROFILE = 'update_profile';
  static readonly UPDATE_EMAIL = 'update_email';
  static readonly UPLOAD_AVATAR = 'upload_avatar';
  static readonly CHANGE_PASSWORD = 'change_password';

  // Settings
  static readonly TOGGLE_NOTIFICATIONS = 'toggle_notifications';
  static readonly TOGGLE_DARK_MODE = 'toggle_dark_mode';
  static readonly CHANGE_LANGUAGE = 'change_language';

  // Business Owner
  static readonly UPDATE_BUSINESS = 'update_business';
  static readonly LOAD_BUSINESS_DASHBOARD = 'load_business_dashboard';

  // Admin
  static readonly VIEW_ADMIN_DASHBOARD = 'view_admin_dashboard';
  static readonly CHANGE_USER_ROLE = 'change_user_role';

  // Moderator
  static readonly VIEW_MODERATOR_DASHBOARD = 'view_moderator_dashboard';
}

// ── Parameter Keys ───────────────────────────────────────────────────────────

export class AnalyticsParams {
  static readonly METHOD = 'method';
  static readonly SCREEN_NAME = 'screen_name';
  static readonly BUSINESS_ID = 'business_id';
  static readonly BUSINESS_NAME = 'business_name';
  static readonly CATEGORY_ID = 'category_id';
  static readonly SEARCH_QUERY = 'search_query';
  static readonly LANGUAGE = 'language';
  static readonly THEME = 'theme';
  static readonly IS_FAVORITE = 'is_favorite';
  static readonly ITEM_ID = 'item_id';
  static readonly ITEM_NAME = 'item_name';
  static readonly SUCCESS = 'success';
  static readonly ENABLED = 'enabled';
  static readonly USER_ROLE = 'user_role';
}

// ── Common Parameter Values ──────────────────────────────────────────────────

export class AnalyticsValues {
  static readonly METHOD_EMAIL = 'email';
  static readonly METHOD_GOOGLE = 'google';
  static readonly METHOD_FACEBOOK = 'facebook';
  static readonly METHOD_APPLE = 'apple';
  static readonly THEME_DARK = 'dark';
  static readonly THEME_LIGHT = 'light';
  static readonly LANGUAGE_EN = 'en';
  static readonly LANGUAGE_AR = 'ar';
}
