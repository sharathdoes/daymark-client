import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Bricolage_Grotesque } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Sidebar from "@/components/sidebar";
import RootLayoutClient from "@/components/root-layout-client";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
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
      <body className={`${GeistSans.variable} ${GeistMono.variable} ${bricolage.variable} font-sans antialiased`}>
        <RootLayoutClient>
          <Sidebar />
          <div className="md:pl-12">
            {children}
            <Analytics />
          </div>
        </RootLayoutClient>
      </body>
    </html>
  );
}
