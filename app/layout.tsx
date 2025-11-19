import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ui/theme-provider';

export const metadata: Metadata = {
  title: 'Attendance Hub - 出欠確認アプリ',
  description: 'グループの出欠確認を簡単に管理できるアプリケーション',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider defaultTheme="system" storageKey="attendance-hub-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
