import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import DynamicBackground from '@/components/DynamicBackground';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Metricify - Your Spotify Metrics Dashboard',
  description: 'Visualize your Spotify listening data, discover your top artists and songs, and plan your festival experience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <DynamicBackground />
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
