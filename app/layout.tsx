import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ViewTransition } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LaPlume - Your Smart Writing Space",
  description:
    "LaPlume is a minimalist SaaS app designed for writers who value focus, simplicity, and productivity.",
};

export default async function RootLayout(props: LayoutProps<"/">) {
  const { children, auth } = props;
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <ViewTransition>
              {auth}
              {children}
            </ViewTransition>
          </NuqsAdapter>
        </ThemeProvider>
        <Toaster richColors />
        <Analytics />
      </body>
    </html>
  );
}
