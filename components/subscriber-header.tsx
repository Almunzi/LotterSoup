import Image from "next/image";
import Link from "next/link";
import { Archive, Home, Newspaper, User } from "./icons";
import { InstallAppButton } from "./install-app-button";
import { PendingForm, PendingSubmitButton } from "./pending-form";

export function SubscriberHeader() {
  return <header className="subscriber-header">
    <div className="shell subscriber-nav">
      <Link href="/app" className="subscriber-brand" aria-label="LotterySoup subscriber home">
        <Image src="/lotterysoup-logo.jpg" width={1024} height={1024} priority alt="LotterySoup" />
      </Link>
      <nav aria-label="Subscriber navigation">
        <Link href="/app"><Home /> <span>Home</span></Link>
        <Link href="/app/issues/latest"><Newspaper /> <span>Latest issue</span></Link>
        <Link href="/app/archive"><Archive /> <span>Archive</span></Link>
        <Link href="/account"><User /> <span>Account</span></Link>
      </nav>
      <div className="subscriber-actions">
        <InstallAppButton compact />
        <PendingForm action="/auth/logout" method="post"><PendingSubmitButton pendingLabel="Logging out…">Log out</PendingSubmitButton></PendingForm>
      </div>
    </div>
  </header>;
}
