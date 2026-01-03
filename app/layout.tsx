import type { Metadata } from 'next';
import { Fredoka } from 'next/font/google';
import './globals.css';
import MainMenu from '@/components/mainmenu';
import { AuthProvider } from '@/components/auth/AuthProvider';

const fredoka = Fredoka({
  variable: '--font-fredoka',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Reader Labs',
  description: "Generate children's books using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fredoka.variable} antialiased`}>
        <AuthProvider>
          <MainMenu />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
