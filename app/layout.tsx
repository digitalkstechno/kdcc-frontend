import type {Metadata} from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Digital Card',
  description: 'A digital business card and project showcase.',
};

import { ReduxProvider } from '@/lib/redux/provider';
import { Toaster } from 'sonner';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body suppressHydrationWarning className="font-sans">
        <ReduxProvider>
          {children}
        </ReduxProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
