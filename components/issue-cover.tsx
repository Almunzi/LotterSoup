import Image from "next/image";
import type { NewsletterIssue } from "../lib/content/issues";

type IssueCoverProps = {
  issue: NewsletterIssue;
  sizes: string;
  priority?: boolean;
};

export function IssueCover({ issue, sizes, priority = false }: IssueCoverProps) {
  if (issue.imagePath) {
    return <Image
      src={`/api/issues/${encodeURIComponent(issue.slug)}/image`}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized
      alt={`${issue.title} cover`}
    />;
  }

  if (issue.thumbnailUrl) {
    return <img
      src={issue.thumbnailUrl}
      alt={`${issue.title} cover`}
      loading={priority ? "eager" : "lazy"}
      referrerPolicy="no-referrer"
    />;
  }

  return <Image
    src="/newsletter-header.png"
    fill
    sizes={sizes}
    priority={priority}
    alt={`${issue.title} cover`}
  />;
}
