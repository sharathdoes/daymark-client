import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, DM_Serif_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";
import Header from "@/components/header";
import RootLayoutClient from "@/components/root-layout-client";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
});

const dmSerifDisplay = DM_Serif_Display({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-dm-serif-display",
});

export const metadata: Metadata = {
  title: "Daymark — Daily News Quiz",
  description: "Quiz yourself on today's headlines. Every question pulled from a real article published in the last 24 hours.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${dmSerifDisplay.variable} font-sans antialiased`}>
        <RootLayoutClient>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <Header />
            {children}
            <Analytics />
          </ThemeProvider>
        </RootLayoutClient>
      </body>
    </html>
  );
}
