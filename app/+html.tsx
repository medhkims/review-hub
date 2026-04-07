import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

const FONT_PATH =
  '/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.6e435534bd35da5fef04168860a9b8fa.ttf';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Force-load the icon font synchronously before React hydrates */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'material-community';
              src: url('${FONT_PATH}') format('truetype');
              font-display: block;
              unicode-range: U+0020-FFFF;
            }
          `,
        }} />

        {/* Use JS FontFace API for reliable cross-browser loading */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var font = new FontFace('material-community', 'url(${FONT_PATH})', { display: 'block' });
              font.load().then(function(loadedFont) {
                document.fonts.add(loadedFont);
              });
            })();
          `,
        }} />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
