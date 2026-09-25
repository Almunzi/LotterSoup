import Image from "next/image";
import Link from "next/link";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  copy: string;
  children: React.ReactNode;
};

export function AuthShell({ eyebrow, title, copy, children }: AuthShellProps) {
  return <main className="auth-main">
    <section className="auth-brand-panel">
      <Link href="/" aria-label="The LotterySoup home">
        <Image src="/lotterysoup-logo.jpg" width={1024} height={1024} priority alt="The LotterySoup" />
      </Link>
      <div>
        <p className="auth-kicker">Members get the whole serving</p>
        <h2>One weekly update. All your lottery information in one place.</h2>
      </div>
      <span>18+ only · Play responsibly</span>
    </section>
    <section className="auth-form-panel">
      <div className="auth-card">
        <p className="section-label">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="auth-copy">{copy}</p>
        {children}
      </div>
    </section>
  </main>;
}

export function AuthMessage({ children, tone = "info" }: {
  children: React.ReactNode;
  tone?: "info" | "error" | "success";
}) {
  return <p className={`auth-message auth-message-${tone}`} role="status">{children}</p>;
}
