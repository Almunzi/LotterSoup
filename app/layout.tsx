import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
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
  metadataBase: new URL("https://thelotterysoup.com"),
  title: {
    default: "The LotterySoup | Your Weekly Lottery Update",
    template: "%s | The LotterySoup",
  },
  description:
    "Weekly Powerball and Mega Millions insights, hot and cold numbers, lottery news, and an AI number generator—all in one simple update.",
  openGraph: {
    title: "The LotterySoup",
    description: "Hot numbers. Cold numbers. One weekly lottery update.",
    images: ["/lotterysoup-logo.jpg"],
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body>{children}</body>
    </html>
  );
}
