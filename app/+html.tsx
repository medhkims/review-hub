import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

const FONT_PATH = '/fonts/MaterialCommunityIcons.ttf';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="preload" href={FONT_PATH} as="font" type="font/ttf" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'material-community';
              src: url('${FONT_PATH}') format('truetype');
              font-display: block;
            }
          `,
        }} />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var font = new FontFace('material-community', 'url(${FONT_PATH})', { display: 'block' });
              font.load().then(function(f) { document.fonts.add(f); });
            })();
          `,
        }} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
