import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuizForge AI - Generate Quizzes from PDFs",
  description: "AI-powered web application that allows users to upload educational PDFs and automatically generates quizzes, question banks, and flashcards.",
};

import SplashScreen from "@/components/SplashScreen";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <SplashScreen />
        <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="text-gradient">QuizForge AI</h1>
          <div>
            {/* Nav links could go here */}
          </div>
        </nav>
        <main style={{ flex: 1 }}>
          {children}
        </main>

        <Script
          src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
