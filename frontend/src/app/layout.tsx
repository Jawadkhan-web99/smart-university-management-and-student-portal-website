import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/providers/ThemeProvider';
import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'Apex University of Science & Technology | Smart University Management & Student Portal',
  description:
    'Apex University is a premier higher education institution offering accredited undergraduate degrees in Computer Science, Software Engineering, Artificial Intelligence, and Data Science.',
  keywords: [
    'University',
    'Computer Science',
    'Software Engineering',
    'Artificial Intelligence',
    'Student Portal',
    'University Management System',
    'Higher Education',
  ],
  authors: [{ name: 'Apex University Faculty of Computing' }],
  metadataBase: new URL('https://apex-university.edu.pk'),
  openGraph: {
    title: 'Apex University of Science & Technology | Smart Student Portal',
    description:
      'Explore world-class academic programs, state-of-the-art campus facilities, and intelligent digital campus services at Apex University.',
    url: 'https://apex-university.edu.pk',
    siteName: 'Apex University',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Apex University Campus and Smart Student Portal',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apex University of Science & Technology',
    description: 'Empowering minds and engineering the future with smart computing education.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* Anti-Flicker script for dark mode preference */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('theme');
                if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
