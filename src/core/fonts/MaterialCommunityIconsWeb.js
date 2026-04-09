// Web-only replacement for @expo/vector-icons/build/MaterialCommunityIcons.js
// On web, the original file passes the hashed asset URL as the font source to
// Font.loadAsync, which creates an @font-face pointing to /assets/.../hash.ttf.
// Firebase Hosting serves index.html for missing paths (SPA rewrite), so the
// browser gets HTML instead of a font → OTS parse error → no glyphs.
// Instead, we point Font.loadAsync at /fonts/MaterialCommunityIcons.ttf which
// is explicitly copied to dist/fonts/ and served as a real file.
'use client';
import createIconSet from '@expo/vector-icons/build/createIconSet';
import glyphMap from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json';

const FONT_URL = '/fonts/MaterialCommunityIcons.ttf';

export default createIconSet(glyphMap, 'material-community', FONT_URL);
