import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { HistoryProvider } from "@/lib/HistoryContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MovieConcepts",
  description: "Analyze movie concepts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <HistoryProvider>
            {children}
          </HistoryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
