import "server-only";

import { getSupabaseAdmin } from "../billing/supabase-admin";
import { sanitizeMailchimpHtml } from "../mailchimp/sanitize";

export type NewsletterIssue = {
  slug: string;
  title: string;
  excerpt: string;
  imagePath: string | null;
  imageWidth: number;
  imageHeight: number;
  contentHtml: string | null;
  thumbnailUrl: string | null;
  source: "local" | "mailchimp";
  publishedAt: string;
};

const bundledIssue: NewsletterIssue = {
  slug: "weekly-lottery-update",
  title: "Your Weekly Lottery Update",
  excerpt: "Powerball, Mega Millions, number trends, lottery news, and the weekly AI number generator.",
  imagePath: "/weekly-newsletter.png",
  imageWidth: 1080,
  imageHeight: 2410,
  contentHtml: null,
  thumbnailUrl: "/newsletter-header.png",
  source: "local",
  publishedAt: "2026-09-21T00:00:00.000Z",
};

type IssueRow = {
  slug: string;
  title: string;
  excerpt: string;
  image_path: string | null;
  image_width: number;
  image_height: number;
  content_html: string | null;
  thumbnail_url: string | null;
  source: string;
  published_at: string;
};

function toIssue(row: IssueRow): NewsletterIssue {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    imagePath: row.image_path?.startsWith("/") ? row.image_path : null,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    contentHtml: row.content_html ? sanitizeMailchimpHtml(row.content_html) : null,
    thumbnailUrl: row.thumbnail_url?.startsWith("https://") ? row.thumbnail_url : null,
    source: row.source === "mailchimp" ? "mailchimp" : "local",
    publishedAt: row.published_at,
  };
}

export async function getPublishedIssues() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("newsletter_issues")
      .select("slug, title, excerpt, image_path, image_width, image_height, content_html, thumbnail_url, source, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data?.length ? (data as IssueRow[]).map(toIssue) : [bundledIssue];
  } catch (error) {
    console.error("Unable to load newsletter archive; using bundled issue", error);
    return [bundledIssue];
  }
}

export async function getLatestIssue() {
  return (await getPublishedIssues())[0];
}

export async function getPublishedIssue(slug: string) {
  return (await getPublishedIssues()).find((issue) => issue.slug === slug) || null;
}

export function formatIssueDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(value));
}
