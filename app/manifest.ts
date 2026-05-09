import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SELF - Accountability Tracker',
    short_name: 'SELF',
    description: 'A serene, gamified accountability tracker to build high integrity habits.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080912',
    theme_color: '#080912',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
