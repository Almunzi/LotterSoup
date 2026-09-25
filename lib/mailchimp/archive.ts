import "server-only";

import { getSupabaseAdmin } from "../billing/supabase-admin";
import { mailchimpRequest } from "./client";
import { getMailchimpConfig } from "./config";
import { plainTextFromHtml, sanitizeMailchimpHtml } from "./sanitize";

type MailchimpCampaign = {
  id: string;
  archive_url?: string;
  create_time?: string;
  send_time?: string;
  settings?: {
    preview_text?: string;
    subject_line?: string;
    title?: string;
  };
};

type CampaignList = { campaigns?: MailchimpCampaign[] };
type CampaignContent = { html?: string; plain_text?: string };

function issueSlug(campaign: MailchimpCampaign) {
  const date = (campaign.send_time || campaign.create_time || new Date().toISOString()).slice(0, 10);
  const id = campaign.id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `mailchimp-${date}-${id}`.slice(0, 120).replace(/-$/g, "");
}

function firstImageUrl(html: string) {
  for (const match of html.matchAll(/<img\b([^>]*)\bsrc=["'](https?:\/\/[^"']+)["']([^>]*)>/gi)) {
    const attributes = `${match[1]} ${match[3]}`;
    const url = match[2];
    const tiny = /\b(?:width|height)=["']?1(?:px)?["']?/i.test(attributes);
    const tracking = /(?:track\/open|open\.php|campaign-activity)/i.test(url);
    if (!tiny && !tracking) return url;
  }
  return null;
}

function excerptFor(campaign: MailchimpCampaign, content: CampaignContent) {
  const preferred = campaign.settings?.preview_text?.trim()
    || content.plain_text?.trim()
    || plainTextFromHtml(content.html || "")
    || campaign.settings?.subject_line?.trim()
    || "LotterySoup weekly subscriber newsletter.";
  return preferred.replace(/\s+/g, " ").slice(0, 300);
}

export async function syncMailchimpCampaignArchive() {
  const config = getMailchimpConfig();
  const params = new URLSearchParams({
    status: "sent",
    list_id: config.audienceId,
    count: String(config.archiveLimit),
    sort_field: "send_time",
    sort_dir: "DESC",
  });
  const response = await mailchimpRequest<CampaignList>(`/campaigns?${params.toString()}`);
  const campaigns = response.campaigns || [];

  if (!campaigns.length) return { available: 0, imported: 0, existing: 0 };

  const ids = campaigns.map((campaign) => campaign.id);
  const { data: existingRows, error: existingError } = await getSupabaseAdmin()
    .from("newsletter_issues")
    .select("mailchimp_campaign_id")
    .in("mailchimp_campaign_id", ids);

  if (existingError) throw new Error(existingError.message);
  const existingIds = new Set((existingRows || []).map((row) => row.mailchimp_campaign_id));
  const pending = campaigns.filter((campaign) => !existingIds.has(campaign.id));
  let imported = 0;

  for (let index = 0; index < pending.length; index += 5) {
    const rows = await Promise.all(pending.slice(index, index + 5).map(async (campaign) => {
      const content = await mailchimpRequest<CampaignContent>(`/campaigns/${encodeURIComponent(campaign.id)}/content`);
      const contentHtml = sanitizeMailchimpHtml(content.html || "");
      const title = campaign.settings?.subject_line?.trim()
        || campaign.settings?.title?.trim()
        || "LotterySoup Weekly Update";

      return {
        slug: issueSlug(campaign),
        title,
        excerpt: excerptFor(campaign, content),
        image_path: null,
        image_width: 1080,
        image_height: 1350,
        content_html: contentHtml,
        thumbnail_url: firstImageUrl(contentHtml),
        source: "mailchimp",
        mailchimp_campaign_id: campaign.id,
        mailchimp_archive_url: campaign.archive_url || null,
        published_at: campaign.send_time || campaign.create_time || new Date().toISOString(),
        is_published: Boolean(contentHtml),
        updated_at: new Date().toISOString(),
      };
    }));

    if (rows.length) {
      const { error } = await getSupabaseAdmin()
        .from("newsletter_issues")
        .upsert(rows, { onConflict: "mailchimp_campaign_id" });
      if (error) throw new Error(error.message);
      imported += rows.length;
    }
  }

  return { available: campaigns.length, imported, existing: campaigns.length - pending.length };
}
