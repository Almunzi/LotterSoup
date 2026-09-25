import { SubscriberHeader } from "../../components/subscriber-header";
import { createPrivatePageMetadata } from "../../lib/seo";

export const metadata = createPrivatePageMetadata("Subscriber App");

export default function SubscriberLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>
    <SubscriberHeader />
    {children}
  </>;
}
