import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { PwaRegister } from "../components/pwa-register";
import { siteDescription, siteName, siteUrl } from "../lib/seo";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-barlow",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
  variable: "--font-barlow-condensed",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The LotterySoup | Your Weekly Lottery Update",
    template: "%s | The LotterySoup",
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  category: "Lottery news and information",
  keywords: [
    "lottery newsletter",
    "weekly lottery update",
    "Powerball results",
    "Mega Millions results",
    "lottery news",
    "hot and cold lottery numbers",
    "lottery number generator",
  ],
  formatDetection: { telephone: false },
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LotterySoup",
    startupImage: [
      {
        url: "/apple-splash-1290x2796.png",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/apple-splash-1179x2556.png",
        media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/apple-splash-750x1334.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  icons: {
    icon: [{ url: "/icon", sizes: "64x64", type: "image/png" }],
    shortcut: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined,
    other: process.env.BING_SITE_VERIFICATION?.trim()
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION.trim() }
      : undefined,
  },
  openGraph: {
    title: "The LotterySoup | Your Weekly Lottery Update",
    description: siteDescription,
    url: siteUrl,
    siteName,
    locale: "en_US",
    images: [{
      url: "/weekly-roundup-v3.png",
      width: 1672,
      height: 941,
      alt: "The LotterySoup weekly lottery newsletter with number slips, charts, and lottery information",
    }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The LotterySoup | Your Weekly Lottery Update",
    description: siteDescription,
    images: ["/weekly-roundup-v3.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#001c52",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body><PwaRegister />{children}</body>
    </html>
  );
}
