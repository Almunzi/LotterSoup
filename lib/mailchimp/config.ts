import "server-only";

export type MailchimpMemberStatus = "subscribed" | "pending" | "transactional";

export type MailchimpConfig = {
  apiKey: string;
  serverPrefix: string;
  audienceId: string;
  newMemberStatus: MailchimpMemberStatus;
  archiveLimit: number;
};

const memberStatuses = new Set<MailchimpMemberStatus>(["subscribed", "pending", "transactional"]);

function serverPrefixFromKey(apiKey: string) {
  return apiKey.includes("-") ? apiKey.split("-").at(-1) || "" : "";
}

export function isMailchimpConfigured() {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim() || "";
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX?.trim() || serverPrefixFromKey(apiKey);

  return Boolean(apiKey && serverPrefix && process.env.MAILCHIMP_AUDIENCE_ID?.trim());
}

export function getMailchimpConfig(): MailchimpConfig {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim() || "";
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX?.trim() || serverPrefixFromKey(apiKey);
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID?.trim() || "";
  const requestedStatus = process.env.MAILCHIMP_NEW_MEMBER_STATUS?.trim().toLowerCase() || "pending";
  const requestedLimit = Number.parseInt(process.env.MAILCHIMP_ARCHIVE_LIMIT || "100", 10);

  if (!apiKey || !serverPrefix || !audienceId) {
    throw new Error("Mailchimp API key, server prefix, and existing audience ID are required.");
  }

  if (!/^[a-z]{2,4}\d+$/i.test(serverPrefix)) {
    throw new Error("MAILCHIMP_SERVER_PREFIX is invalid.");
  }

  if (!memberStatuses.has(requestedStatus as MailchimpMemberStatus)) {
    throw new Error("MAILCHIMP_NEW_MEMBER_STATUS must be subscribed, pending, or transactional.");
  }

  return {
    apiKey,
    serverPrefix,
    audienceId,
    newMemberStatus: requestedStatus as MailchimpMemberStatus,
    archiveLimit: Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 500) : 100,
  };
}
