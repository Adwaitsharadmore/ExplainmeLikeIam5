import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AvatarProvider } from "@/contexts/avatar-context"
import { ConversationProvider } from "@/contexts/conversation-context"
import { ConversationalAvatar } from "@/components/conversational-avatar"
import { SoundInitializer } from "@/components/sound-initializer"
import { AssetPreloader } from "@/components/asset-preloader"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HealthQuest Kingdom",
  description: "A fun health adventure for kids",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AvatarProvider>
            <ConversationProvider>
              {children}
              <ConversationalAvatar />
              <SoundInitializer />
              <AssetPreloader />
            </ConversationProvider>
          </AvatarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
