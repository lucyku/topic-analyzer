import { Inter } from "next/font/google"
import "./globals.css"
import { Metadata } from "next"
import ThemeProviderWrapper from '@/components/ThemeProviderWrapper'
import { HistoryProvider } from '@/lib/HistoryContext'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Movie Topic Analyzer",
  description: "Discover how academic concepts appear in your favorite movies",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProviderWrapper>
          <HistoryProvider>
            {children}
          </HistoryProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  )
}
