import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Image,
  Pressable,
  ActivityIndicator,
  StatusBar,
  Platform,
  PanResponder,
  GestureResponderHandlers,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from './AppText';
import { colors } from '@/core/theme/colors';

const isWeb = Platform.OS === 'web';

const HANDLE = 44;   // touch target size for corner handles
const BRACKET = 22;  // visual L-bracket size
const LINE = 3;      // L-bracket line thickness
const MIN = 90;      // minimum crop box size (screen px)

interface CropBox { x: number; y: number; width: number; height: number; }

export interface ImageCropModalProps {
  visible: boolean;
  imageUri: string | null;
  originalWidth: number | null;
  originalHeight: number | null;
  aspect: [number, number];
  onConfirm: (croppedUri: string, mimeType: string) => Promise<void> | void;
  onRetake: () => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
}

function computeRendered(imgW: number, imgH: number, areaW: number, areaH: number) {
  const scale = Math.min(areaW / imgW, areaH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  return { w, h, ox: (areaW - w) / 2, oy: (areaH - h) / 2, scale };
}

function initialBox(rW: number, rH: number, ar: number): CropBox {
  const w = rW / rH > ar ? rH * ar * 0.85 : rW * 0.85;
  const h = w / ar;
  return { x: (rW - w) / 2, y: (rH - h) / 2, width: w, height: h };
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  visible, imageUri, originalWidth, originalHeight, aspect,
  onConfirm, onRetake, onCancel, isLoading = false,
}) => {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [crop, setCropState] = useState<CropBox>({ x: 0, y: 0, width: MIN, height: MIN });
  const [area, setArea] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);

  // Refs — stable across renders, readable inside PanResponder handlers
  const cropRef = useRef<CropBox>({ x: 0, y: 0, width: MIN, height: MIN });
  const rendered = useRef({ w: 0, h: 0, ox: 0, oy: 0, scale: 1 });
  const arRef = useRef(aspect[0] / aspect[1]);
  arRef.current = aspect[0] / aspect[1];

  // Stable setter that keeps both ref and state in sync
  const setFn = useRef((b: CropBox) => { cropRef.current = b; setCropState(b); });

  // Init crop box once we know the layout and image dimensions
  useEffect(() => {
    if (!visible || !originalWidth || !originalHeight || area.w === 0) return;
    const r = computeRendered(originalWidth, originalHeight, area.w, area.h);
    rendered.current = r;
    const box = initialBox(r.w, r.h, arRef.current);
    setFn.current(box);
    setReady(true);
  }, [visible, originalWidth, originalHeight, area]);

  useEffect(() => {
    if (!visible) { setReady(false); setBusy(false); }
  }, [visible]);

  // ── Gesture move/resize logic (shared between native PanResponder & web pointer events) ──

  // Move handler: compute new position from dx/dy
  const moveHandler = useCallback((dx: number, dy: number, start: CropBox) => {
    const { w: rW, h: rH } = rendered.current;
    setFn.current({
      ...start,
      x: Math.max(0, Math.min(rW - start.width, start.x + dx)),
      y: Math.max(0, Math.min(rH - start.height, start.y + dy)),
    });
  }, []);

  // Corner resize handlers keyed by corner name
  const cornerHandler = useCallback((corner: 'br' | 'tl' | 'tr' | 'bl', dx: number, dy: number, start: CropBox) => {
    const ar = arRef.current;
    const { w: rW, h: rH } = rendered.current;
    const s = start;
    if (corner === 'br') {
      const delta = (dx + dy * ar) / 2;
      const nW = Math.max(MIN, Math.min(rW - s.x, s.width + delta));
      const nH = Math.min(rH - s.y, nW / ar);
      setFn.current({ x: s.x, y: s.y, width: nH * ar, height: nH });
    } else if (corner === 'tl') {
      const delta = (-dx - dy * ar) / 2;
      const nW = Math.max(MIN, Math.min(s.x + s.width, s.width + delta));
      const nH = Math.min(s.y + s.height, nW / ar);
      const fW = nH * ar;
      const nX = s.x + s.width - fW;
      const nY = s.y + s.height - nH;
      if (nX >= 0 && nY >= 0) setFn.current({ x: nX, y: nY, width: fW, height: nH });
    } else if (corner === 'tr') {
      const delta = (dx - dy * ar) / 2;
      const nW = Math.max(MIN, Math.min(rW - s.x, s.width + delta));
      const nH = Math.min(s.y + s.height, nW / ar);
      const fW = nH * ar;
      const nY = s.y + s.height - nH;
      if (nY >= 0) setFn.current({ x: s.x, y: nY, width: fW, height: nH });
    } else { // bl
      const delta = (-dx + dy * ar) / 2;
      const nW = Math.max(MIN, Math.min(s.x + s.width, s.width + delta));
      const nH = Math.min(rH - s.y, nW / ar);
      const fW = nH * ar;
      const nX = s.x + s.width - fW;
      if (nX >= 0) setFn.current({ x: nX, y: s.y, width: fW, height: nH });
    }
  }, []);

  // ── Native PanResponders (iOS/Android only) ──────────────────────────────
  const ms = useRef<CropBox>({ x: 0, y: 0, width: 0, height: 0 });
  const cs = useRef<CropBox>({ x: 0, y: 0, width: 0, height: 0 });

  const movePan = useRef(isWeb ? { panHandlers: {} as GestureResponderHandlers } : PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { ms.current = { ...cropRef.current }; },
    onPanResponderMove: (_, { dx, dy }) => moveHandler(dx, dy, ms.current),
  })).current;

  const makePan = (corner: 'br' | 'tl' | 'tr' | 'bl') =>
    isWeb ? { panHandlers: {} as GestureResponderHandlers } : PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { cs.current = { ...cropRef.current }; },
      onPanResponderMove: (_, { dx, dy }) => cornerHandler(corner, dx, dy, cs.current),
    });

  const brPan = useRef(makePan('br')).current;
  const tlPan = useRef(makePan('tl')).current;
  const trPan = useRef(makePan('tr')).current;
  const blPan = useRef(makePan('bl')).current;

  // ── Web pointer event helpers (attach via refs to avoid RN type conflicts) ──
  const moveRef = useRef<View>(null);
  const tlRef = useRef<View>(null);
  const trRef = useRef<View>(null);
  const blRef = useRef<View>(null);
  const brRef = useRef<View>(null);

  useEffect(() => {
    if (!isWeb || !ready) return;

    const attach = (
      ref: React.RefObject<View | null>,
      kind: 'move' | 'br' | 'tl' | 'tr' | 'bl',
    ) => {
      // On web, View refs resolve to HTMLDivElement
      const el = ref.current as unknown as HTMLElement | null;
      if (!el) return () => {};

      const onDown = (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const startCrop = { ...cropRef.current };

        const onMove = (ev: PointerEvent) => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          if (kind === 'move') {
            moveHandler(dx, dy, startCrop);
          } else {
            cornerHandler(kind, dx, dy, startCrop);
          }
        };

        const onUp = () => {
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerup', onUp);
        };

        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
      };

      el.addEventListener('pointerdown', onDown);
      el.style.touchAction = 'none';
      return () => el.removeEventListener('pointerdown', onDown);
    };

    const cleanups = [
      attach(moveRef, 'move'),
      attach(tlRef, 'tl'),
      attach(trRef, 'tr'),
      attach(blRef, 'bl'),
      attach(brRef, 'br'),
    ];

    return () => cleanups.forEach((fn) => fn());
  }, [ready, moveHandler, cornerHandler]);

  // ── Crop & confirm ────────────────────────────────────────────────────────
  const handleUsePhoto = useCallback(async () => {
    if (!imageUri || !originalWidth || !originalHeight) return;
    setBusy(true);
    try {
      const { scale } = rendered.current;
      const b = cropRef.current;
      const originX = Math.max(0, Math.round(b.x / scale));
      const originY = Math.max(0, Math.round(b.y / scale));
      const cW = Math.max(1, Math.min(originalWidth - originX, Math.round(b.width / scale)));
      const cH = Math.max(1, Math.min(originalHeight - originY, Math.round(b.height / scale)));

      let croppedUri = imageUri;
      try {
        const res = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ crop: { originX, originY, width: cW, height: cH } }],
          { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG },
        );
        croppedUri = res.uri;
      } catch {
        // crop failed — use original image
      }

      await onConfirm(croppedUri, 'image/jpeg');
    } finally {
      setBusy(false);
    }
  }, [imageUri, originalWidth, originalHeight, onConfirm]);

  // ── Layout ────────────────────────────────────────────────────────────────
  const { ox: imgOx, oy: imgOy } = rendered.current;
  const ax = imgOx + crop.x;
  const ay = imgOy + crop.y;
  const isDisabled = busy || isLoading;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent={Platform.OS !== 'web'}
      onRequestClose={onCancel}
    >
      {Platform.OS !== 'web' && <StatusBar barStyle="light-content" backgroundColor="#000" />}
      <View style={{ flex: 1, backgroundColor: '#000' }}>

        {/* Top bar */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: Platform.OS === 'web' ? 16 : 52,
          paddingBottom: 12,
        }}>
          <Pressable
            onPress={onCancel}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialCommunityIcons name="close" size={22} color="#fff" />
          </Pressable>
          <AppText style={{ fontSize: 16, fontWeight: '600', color: '#fff', letterSpacing: 0.2 }}>
            {t('imageCrop.title')}
          </AppText>
          <View style={{ width: 44 }} />
        </View>

        {/* Image + Crop UI */}
        <View
          style={{ flex: 1 }}
          onLayout={(e) => {
            const { width: w, height: h } = e.nativeEvent.layout;
            setArea({ w, h });
          }}
        >
          {imageUri && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
                accessibilityLabel={t('imageCrop.title')}
              />
            </View>
          )}

          {ready && (
            <>
              {/* Dark overlays around crop box */}
              <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: ay, backgroundColor: 'rgba(0,0,0,0.6)' }} />
              <View pointerEvents="none" style={{ position: 'absolute', top: ay + crop.height, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />
              <View pointerEvents="none" style={{ position: 'absolute', top: ay, left: 0, width: ax, height: crop.height, backgroundColor: 'rgba(0,0,0,0.6)' }} />
              <View pointerEvents="none" style={{ position: 'absolute', top: ay, left: ax + crop.width, right: 0, height: crop.height, backgroundColor: 'rgba(0,0,0,0.6)' }} />

              {/* Crop border */}
              <View pointerEvents="none" style={{ position: 'absolute', left: ax, top: ay, width: crop.width, height: crop.height, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)' }} />

              {/* Rule-of-thirds grid */}
              <View pointerEvents="none" style={{ position: 'absolute', left: ax + crop.width / 3, top: ay, width: 1, height: crop.height, backgroundColor: 'rgba(255,255,255,0.25)' }} />
              <View pointerEvents="none" style={{ position: 'absolute', left: ax + (crop.width * 2) / 3, top: ay, width: 1, height: crop.height, backgroundColor: 'rgba(255,255,255,0.25)' }} />
              <View pointerEvents="none" style={{ position: 'absolute', left: ax, top: ay + crop.height / 3, width: crop.width, height: 1, backgroundColor: 'rgba(255,255,255,0.25)' }} />
              <View pointerEvents="none" style={{ position: 'absolute', left: ax, top: ay + (crop.height * 2) / 3, width: crop.width, height: 1, backgroundColor: 'rgba(255,255,255,0.25)' }} />

              {/* Corner brackets (visual only, ┌ ┐ └ ┘) */}
              <View pointerEvents="none" style={{ position: 'absolute', left: ax, top: ay, width: BRACKET, height: BRACKET, borderTopWidth: LINE, borderLeftWidth: LINE, borderColor: '#fff' }} />
              <View pointerEvents="none" style={{ position: 'absolute', left: ax + crop.width - BRACKET, top: ay, width: BRACKET, height: BRACKET, borderTopWidth: LINE, borderRightWidth: LINE, borderColor: '#fff' }} />
              <View pointerEvents="none" style={{ position: 'absolute', left: ax, top: ay + crop.height - BRACKET, width: BRACKET, height: BRACKET, borderBottomWidth: LINE, borderLeftWidth: LINE, borderColor: '#fff' }} />
              <View pointerEvents="none" style={{ position: 'absolute', left: ax + crop.width - BRACKET, top: ay + crop.height - BRACKET, width: BRACKET, height: BRACKET, borderBottomWidth: LINE, borderRightWidth: LINE, borderColor: '#fff' }} />

              {/* Move zone (full crop box interior) */}
              <View ref={moveRef} {...movePan.panHandlers} style={[{ position: 'absolute', left: ax, top: ay, width: crop.width, height: crop.height }, isWeb && { cursor: 'move' } as Record<string, unknown>]} />

              {/* Corner touch targets — rendered after move zone to get gesture priority */}
              <View ref={tlRef} {...tlPan.panHandlers} style={[{ position: 'absolute', left: ax - HANDLE / 2, top: ay - HANDLE / 2, width: HANDLE, height: HANDLE }, isWeb && { cursor: 'nwse-resize' } as Record<string, unknown>]} />
              <View ref={trRef} {...trPan.panHandlers} style={[{ position: 'absolute', left: ax + crop.width - HANDLE / 2, top: ay - HANDLE / 2, width: HANDLE, height: HANDLE }, isWeb && { cursor: 'nesw-resize' } as Record<string, unknown>]} />
              <View ref={blRef} {...blPan.panHandlers} style={[{ position: 'absolute', left: ax - HANDLE / 2, top: ay + crop.height - HANDLE / 2, width: HANDLE, height: HANDLE }, isWeb && { cursor: 'nesw-resize' } as Record<string, unknown>]} />
              <View ref={brRef} {...brPan.panHandlers} style={[{ position: 'absolute', left: ax + crop.width - HANDLE / 2, top: ay + crop.height - HANDLE / 2, width: HANDLE, height: HANDLE }, isWeb && { cursor: 'nwse-resize' } as Record<string, unknown>]} />
            </>
          )}
        </View>

        {/* Bottom panel */}
        <View style={{
          paddingHorizontal: 24, paddingTop: 20,
          paddingBottom: Platform.OS === 'web' ? 24 : 40,
          backgroundColor: 'rgba(15,23,42,0.96)',
          borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
          gap: 12,
        }}>
          <AppText style={{ fontSize: 13, color: colors.textSlate400, textAlign: 'center', marginBottom: 4 }}>
            {t('imageCrop.hint')}
          </AppText>

          <Pressable
            onPress={handleUsePhoto}
            disabled={isDisabled || !imageUri}
            accessibilityRole="button"
            accessibilityLabel={t('imageCrop.usePhoto')}
            style={({ pressed }) => ({
              alignItems: 'center', justifyContent: 'center',
              paddingVertical: 16, borderRadius: 14,
              backgroundColor: isDisabled || !imageUri ? `${colors.neonPurple}80` : colors.neonPurple,
              opacity: pressed ? 0.85 : 1,
              shadowColor: colors.neonPurple,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.45, shadowRadius: 14, elevation: 8,
            })}
          >
            {isDisabled ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <AppText style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>
                {t('imageCrop.usePhoto')}
              </AppText>
            )}
          </Pressable>

          <Pressable
            onPress={onRetake}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel={t('imageCrop.retake')}
            style={({ pressed }) => ({
              alignItems: 'center', justifyContent: 'center',
              paddingVertical: 14, borderRadius: 14,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
              opacity: pressed || isDisabled ? 0.6 : 1,
              backgroundColor: 'rgba(255,255,255,0.05)',
              flexDirection: 'row', gap: 8,
            })}
          >
            <MaterialCommunityIcons name="image-multiple-outline" size={18} color={colors.textSlate100} />
            <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.textSlate100 }}>
              {t('imageCrop.retake')}
            </AppText>
          </Pressable>
        </View>

      </View>
    </Modal>
  );
};
