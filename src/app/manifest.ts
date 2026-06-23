import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Arké Tarot',
    short_name: 'Arké',
    description: 'Draw cards. Listen to what arises.',
    start_url: '/arke-tarot/en',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0d0b1a',
    theme_color: '#0d0b1a',
    icons: [
      { src: '/arke-tarot/icons/icon-48.png',  sizes: '48x48',   type: 'image/png' },
      { src: '/arke-tarot/icons/icon-72.png',  sizes: '72x72',   type: 'image/png' },
      { src: '/arke-tarot/icons/icon-96.png',  sizes: '96x96',   type: 'image/png' },
      { src: '/arke-tarot/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
      { src: '/arke-tarot/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
      { src: '/arke-tarot/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
      { src: '/arke-tarot/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/arke-tarot/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
      { src: '/arke-tarot/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/arke-tarot/icon.svg',           sizes: 'any',      type: 'image/svg+xml' },
    ],
  };
}
