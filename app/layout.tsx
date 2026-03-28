import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";
import Header from "@/components/header";
import RootLayoutClient from "@/components/root-layout-client";
import "./globals.css";

const _merriweather = Merriweather({ weight: ["300", "400", "700", "900"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Daymark",
  description: "Get 6 chances to guess today's news. Test your knowledge with Daymark.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
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
