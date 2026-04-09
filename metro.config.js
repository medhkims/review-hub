const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Metro picks the ESM (*.mjs) version of zustand/middleware which uses
// import.meta — not supported in Metro web bundles.
// Force it to the CJS build instead.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'zustand/middleware') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/zustand/middleware.js'),
      type: 'sourceFile',
    };
  }
  // On web, @expo/vector-icons passes the hashed TTF asset URL to Font.loadAsync,
  // which injects a @font-face pointing to /assets/.../hash.ttf. Firebase Hosting
  // returns index.html for missing paths (SPA rewrite), so the browser gets HTML
  // instead of a font (OTS parse error → no glyphs).
  //
  // Two redirects are needed:
  // 1. Replace MaterialCommunityIcons.js with our shim that uses /fonts/ URL directly.
  // 2. Replace all vector-icons TTF imports with null so they don't pollute the bundle.
  if (platform === 'web' && moduleName.endsWith('MaterialCommunityIcons.js') && moduleName.includes('vector-icons')) {
    return {
      filePath: path.resolve(__dirname, 'src/core/fonts/MaterialCommunityIconsWeb.js'),
      type: 'sourceFile',
    };
  }
  if (platform === 'web' && moduleName.endsWith('.ttf') && moduleName.includes('react-native-vector-icons')) {
    return {
      filePath: path.resolve(__dirname, 'src/core/fonts/nullFont.js'),
      type: 'sourceFile',
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

const windConfig = withNativeWind(config, { input: './global.css' });

// Expo's Metro web dev server sets Cross-Origin-Opener-Policy: same-origin which
// makes window.opener null in popups, breaking Firebase's signInWithPopup.
// same-origin-allow-popups keeps security benefits while allowing popup communication.
windConfig.server = {
  ...windConfig.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      const origSetHeader = res.setHeader.bind(res);
      res.setHeader = (name, value) => {
        if (typeof name === 'string' &&
            name.toLowerCase() === 'cross-origin-opener-policy') {
          return origSetHeader(name, 'same-origin-allow-popups');
        }
        return origSetHeader(name, value);
      };
      return middleware(req, res, next);
    };
  },
};

module.exports = windConfig;
