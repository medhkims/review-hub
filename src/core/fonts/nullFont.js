// On web, @expo/vector-icons imports TTF files as asset URLs and uses them as
// the CSS font-family name. But RN Web serializes path-based font-family values
// as unquoted CSS (font-family:/path/...) which is invalid and ignored by browsers.
// By exporting null here, fontFile becomes falsy in create-icon-set.js, causing
// fontReference to fall back to the fontFamily string ('material-community'),
// which is a valid CSS identifier and matches our @font-face in +html.tsx.
export default null;
