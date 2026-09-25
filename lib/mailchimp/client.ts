import "server-only";

import { createHash } from "node:crypto";
import { getMailchimpConfig } from "./config";

type MailchimpErrorBody = {
  title?: string;
  detail?: string;
  status?: number;
};

export class MailchimpApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "MailchimpApiError";
    this.status = status;
  }
}

export function mailchimpSubscriberHash(email: string) {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

export async function mailchimpRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = getMailchimpConfig();
  const response = await fetch(`https://${config.serverPrefix}.api.mailchimp.com/3.0${path}`, {
    ...init,
    cache: "no-store",
    signal: init.signal || AbortSignal.timeout(10_000),
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`lotterysoup:${config.apiKey}`).toString("base64")}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    let body: MailchimpErrorBody = {};
    try {
      body = await response.json() as MailchimpErrorBody;
    } catch {
      // Mailchimp occasionally returns an empty response for upstream errors.
    }

    throw new MailchimpApiError(
      response.status,
      body.detail || body.title || `Mailchimp request failed with HTTP ${response.status}.`,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
