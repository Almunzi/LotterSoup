import type { Metadata } from "next";

export const siteName = "The LotterySoup";
export const siteDescription = "Weekly Powerball and Mega Millions results, number trends, lottery news, and a fun AI number generator in one easy update.";

function resolveSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "")
    || "https://lotterysoup.vercel.app";

  try {
    const url = new URL(configuredUrl);
    return url.protocol === "https:" || url.hostname === "localhost"
      ? url.origin
      : "https://lotterysoup.vercel.app";
  } catch {
    return "https://lotterysoup.vercel.app";
  }
}

export const siteUrl = resolveSiteUrl();

type PublicPageMetadata = {
  title: string;
  description: string;
  path: string;
};

export function createPublicPageMetadata({ title, description, path }: PublicPageMetadata): Metadata {
  const url = new URL(path, siteUrl).toString();
  const shareTitle = `${title} | ${siteName}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: shareTitle,
      description,
      url,
      siteName,
      locale: "en_US",
      type: "website",
      images: [{
        url: "/weekly-roundup-v3.png",
        width: 1672,
        height: 941,
        alt: "The LotterySoup weekly lottery newsletter with number slips, charts, and lottery information",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: ["/weekly-roundup-v3.png"],
    },
  };
}

export function createPrivatePageMetadata(title: string): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    },
  };
}
