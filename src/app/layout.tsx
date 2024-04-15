import { type Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { type ReactNode } from 'react';

import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { ViewTransitions } from 'next-view-transitions';

import { cn } from '@/lib/utils';

import { NavBar } from '@/components/navbar';
import { ScreenSize } from '@/components/screen';
import { ThemeProvider } from '@/components/theme-provider';

import './globals.css';

export const metadata: Metadata = {
  title: 'playground | voit.dev',
  description: 'Where I test new stuff or attempt to replicate shiny things I saw on X(Twitter).',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html
        lang='en'
        suppressHydrationWarning
        className={`${GeistSans.variable} ${GeistMono.variable}`}
      >
        <body className={cn('bg-white font-sans text-black dark:bg-black dark:text-white')}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <NavBar />
            {children}
            <Analytics />
            <ScreenSize />
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
