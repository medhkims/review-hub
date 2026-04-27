import { Alert, Platform } from 'react-native';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Cross-platform alert that works on both native and web.
 * On native: uses React Native's Alert.alert.
 * On web: uses window.confirm / window.alert as fallback.
 */
export function crossPlatformAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  // Web fallback
  if (!buttons || buttons.length === 0) {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }

  if (buttons.length === 1) {
    window.alert(message ? `${title}\n\n${message}` : title);
    buttons[0].onPress?.();
    return;
  }

  // Two or more buttons: use confirm dialog
  // The last non-cancel button is the "confirm" action
  const cancelButton = buttons.find((b) => b.style === 'cancel');
  const confirmButton = buttons.find((b) => b.style !== 'cancel') ?? buttons[buttons.length - 1];

  const confirmed = window.confirm(message ? `${title}\n\n${message}` : title);
  if (confirmed) {
    confirmButton?.onPress?.();
  } else {
    cancelButton?.onPress?.();
  }
}
