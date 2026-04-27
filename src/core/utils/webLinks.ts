import { Linking, Platform, Share } from 'react-native';

/**
 * Cross-platform URL opener that works on both native and web.
 * On web, uses window.open for better compatibility with tel:, mailto:, etc.
 */
export function openURL(url: string): void {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    Linking.openURL(url).catch(() => {});
  }
}

/**
 * Cross-platform phone call that works on both native and web.
 */
export function openPhone(phoneNumber: string): void {
  const url = `tel:${phoneNumber}`;
  if (Platform.OS === 'web') {
    window.open(url);
  } else {
    Linking.openURL(url).catch(() => {});
  }
}

/**
 * Cross-platform email link.
 */
export function openEmail(email: string): void {
  const url = `mailto:${email}`;
  if (Platform.OS === 'web') {
    window.open(url);
  } else {
    Linking.openURL(url).catch(() => {});
  }
}

/**
 * Cross-platform share that works on both native and web.
 * On web, uses navigator.share if available, falls back to clipboard.
 */
export async function crossPlatformShare(params: {
  title?: string;
  message: string;
  url?: string;
}): Promise<void> {
  if (Platform.OS === 'web') {
    if (navigator.share) {
      try {
        await navigator.share({
          title: params.title,
          text: params.message,
          url: params.url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      const text = params.url ?? params.message;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Clipboard not available
      }
    }
    return;
  }

  // Native
  try {
    await Share.share({
      message: Platform.OS === 'ios' ? params.message : params.message,
      url: Platform.OS === 'ios' ? params.url : undefined,
    });
  } catch {
    // User cancelled
  }
}
