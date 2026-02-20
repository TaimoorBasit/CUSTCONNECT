import { Providers } from '@/components/layout/Providers';
import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'CustConnect | Your Student Hub',
  description: 'Your all-in-one digital hub for campus life. Connect, study, and thrive.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}