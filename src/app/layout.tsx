import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Washoku Keto — Japanese Diet Tracker",
  description:
    "Your personal Japanese-fusion keto dietist. Track meals, plan your week, and shop smart.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-stone-950 text-stone-100 min-h-screen`}
      >
        <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur border-b border-stone-800">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍱</span>
              <span className="font-bold text-stone-100 tracking-tight">
                Washoku Keto
              </span>
              <span className="text-xs text-stone-500 hidden sm:block">
                和食ケトー
              </span>
            </div>
            <div className="hidden md:block">
              <Navigation />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 pb-24 md:pb-8 pt-4">
          {children}
        </main>

        <div className="md:hidden">
          <Navigation />
        </div>
      </body>
    </html>
  );
}
