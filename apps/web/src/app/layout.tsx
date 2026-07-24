import type { Metadata, Viewport } from 'next';
import { Inter, Poppins, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Providers } from '@/components/providers';
import { PwaInstallPrompt } from '@/components/pwa/install-prompt';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://laximotech.ai'),
  title: {
    default: 'laximotech.ai — India\'s Most Affordable AI & Tech Courses | Rs 399',
    template: '%s | laximotech.ai',
  },
  description: 'Learn AI, Machine Learning, Data Science, Robotics & Cybersecurity at just Rs 399 per course. Get a verifiable certificate. Job-ready skills for Indian students.',
  keywords: ['AI course India', 'Machine Learning course India', 'Data Science course', 'Rs 399 course', 'tech course Greater Noida', 'Python course India', 'affordable tech education India'],
  authors: [{ name: 'laximotech.ai', url: 'https://laximotech.ai' }],
  creator: 'laximotech.ai',
  openGraph: {
    type:        'website',
    locale:      'en_IN',
    url:         'https://laximotech.ai',
    siteName:    'laximotech.ai',
    title:       'laximotech.ai — AI & Tech Courses at Rs 399',
    description: 'Learn AI, ML, Data Science. Only Rs 399. Certificate included.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'laximotech.ai — AI & Tech Courses at Rs 399',
    description: 'Learn AI, ML, Data Science. Only Rs 399.',
    images:      ['/og-image.png'],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor:    '#1F4E79',
  width:         'device-width',
  initialScale:  1,
  maximumScale:  5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${playfair.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-sans bg-brand-ice text-brand-dark antialiased">
        <Providers>
          <PwaInstallPrompt />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1F4E79',
                color:      '#fff',
                fontFamily: 'var(--font-poppins)',
                borderRadius: '12px',
                padding: '12px 16px',
              },
              success: { iconTheme: { primary: '#1abc9c', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#FF6B00', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
