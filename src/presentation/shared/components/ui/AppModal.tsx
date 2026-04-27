import React, { useCallback, useEffect } from 'react';
import { Modal, ModalProps, Pressable, View, Platform } from 'react-native';

interface AppModalProps extends Omit<ModalProps, 'statusBarTranslucent'> {
  /** Called when the user taps the backdrop or presses Escape */
  onDismiss?: () => void;
  /** Whether to show a dark backdrop (default: true when transparent is true) */
  showBackdrop?: boolean;
  /** Content inside the modal */
  children: React.ReactNode;
}

/**
 * Cross-platform Modal that:
 * - Adds Escape key handling on web
 * - Provides a proper backdrop that doesn't propagate clicks
 * - Handles statusBarTranslucent only on native
 * - Works consistently across iOS, Android, and Web
 */
export const AppModal: React.FC<AppModalProps> = ({
  onDismiss,
  onRequestClose,
  showBackdrop = true,
  children,
  transparent,
  visible,
  ...rest
}) => {
  const handleClose = useCallback(() => {
    onDismiss?.();
    onRequestClose?.(undefined as unknown as never);
  }, [onDismiss, onRequestClose]);

  // Web: handle Escape key
  useEffect(() => {
    if (Platform.OS !== 'web' || !visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, handleClose]);

  return (
    <Modal
      visible={visible}
      transparent={transparent}
      onRequestClose={handleClose}
      animationType={Platform.OS === 'web' ? 'none' : rest.animationType}
      statusBarTranslucent={Platform.OS !== 'web' ? true : undefined}
      {...rest}
    >
      {transparent && showBackdrop ? (
        <View style={{ flex: 1 }}>
          {/* Backdrop */}
          <Pressable
            onPress={handleClose}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}
            accessibilityLabel="Close"
            accessibilityRole="button"
          />
          {/* Content - stopPropagation via Pressable wrapper */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="box-none">
            <Pressable onPress={(e) => e.stopPropagation()} style={{ maxWidth: '90%' }}>
              {children}
            </Pressable>
          </View>
        </View>
      ) : (
        children
      )}
    </Modal>
  );
};
