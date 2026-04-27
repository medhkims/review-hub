import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Served from public/fonts/ → dist/fonts/ at build time.
// Metro redirects vector-icons TTF imports to null on web (see metro.config.js),
// so icon components use fontFamily:'material-community' — a valid CSS identifier
// that the browser can match against this @font-face declaration.
const FONT_PATH = '/fonts/MaterialCommunityIcons.ttf';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Open Graph meta tags for rich share previews */}
        <meta property="og:site_name" content="Tchecki" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Tchecki — Discover & Review Businesses" />
        <meta property="og:description" content="Find the best businesses in Tunisia. Read reviews, compare ratings, and discover new places." />
        <meta name="description" content="Find the best businesses in Tunisia. Read reviews, compare ratings, and discover new places." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tchecki — Discover & Review Businesses" />
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
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
