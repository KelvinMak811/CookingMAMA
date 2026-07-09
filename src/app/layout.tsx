import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "SmartCook — 智能煮餸買餸助手",
  description: "香港風味煮食與買餸應用程式，菜式庫、買餸清單、煮食紀錄一站搞掂",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK">
      <body className={`${notoSansTC.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
