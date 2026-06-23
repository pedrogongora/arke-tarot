import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from '@ducanh2912/next-pwa';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // API routes — never cache AI calls
      {
        urlPattern: /^\/api\/.*/i,
        handler: 'NetworkOnly',
      },
      // Next.js compiled assets — versioned, safe to cache forever
      {
        urlPattern: /^\/_next\/static\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          },
        },
      },
      // Next.js image optimizer output
      {
        urlPattern: /^\/_next\/image\?.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-image',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },
      // Tarot card images — static, cache forever
      {
        urlPattern: /\/cards\/.*\.(jpg|png|webp)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'card-images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // PWA icons — static, cache forever
      {
        urlPattern: /\/icons\/.*\.png$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'pwa-icons',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // Pages — network first so users always get the latest version
      {
        urlPattern: /^https?:\/\/.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/arke-tarot',
  images: {
    unoptimized: true,
  },
};

export default withPWA(withNextIntl(nextConfig));
