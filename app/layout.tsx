import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "বাংলা প্রাইভেসি কোড এডিটর",
  description: "Privacy-first Bengali coding assistant - সম্পূর্ণ লোকাল AI-পাওয়ারড কোডিং এডিটর",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bn">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
