export const APP_NAME = 'ReviewHub';
export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;

// Timeouts
export const API_TIMEOUT_MS = 15000;
export const CACHE_STALE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Validation
export const PASSWORD_MIN_LENGTH = 6;
export const DISPLAY_NAME_MAX_LENGTH = 50;
export const BIO_MAX_LENGTH = 300;
