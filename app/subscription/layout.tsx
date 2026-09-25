import { createPrivatePageMetadata } from "../../lib/seo";

export const metadata = createPrivatePageMetadata("Subscription");

export default function SubscriptionLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
