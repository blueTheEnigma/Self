import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { NotificationCenter } from '@/components/NotificationCenter'

export const metadata: Metadata = {
  title: 'SELF.',
  description: 'Private accountability for people who keep their word.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="midnight">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          <NotificationCenter />
          {children}
        </Providers>
      </body>
    </html>
  )
}
