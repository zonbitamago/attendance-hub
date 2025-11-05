import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '出欠確認アプリ - Attendance Hub',
  description: 'グループの出欠管理を簡単に。イベントやミーティングの出欠確認をスムーズに行えます。',
  keywords: ['出欠確認', '出欠管理', 'イベント管理', 'グループ管理'],
  authors: [{ name: 'Attendance Hub Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
          <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-blue-600">📋 Attendance Hub</h1>
              <p className="text-sm text-gray-600">出欠確認アプリ</p>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="mt-16 bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
              © 2025 Attendance Hub - プロトタイプ版
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
