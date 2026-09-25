import { readFile } from "node:fs/promises";
import path from "node:path";
import { getFreshAuthenticatedUser } from "../../../../../lib/auth/session";
import { getSubscriptionAccessForUser } from "../../../../../lib/billing/access";
import { getPublishedIssue } from "../../../../../lib/content/issues";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getFreshAuthenticatedUser();
  if (!user) return new Response("Not found", { status: 404 });

  const access = await getSubscriptionAccessForUser(user.id);
  if (!access.allowed) return new Response("Not found", { status: 404 });

  const issue = await getPublishedIssue((await params).slug);
  if (!issue?.imagePath) return new Response("Not found", { status: 404 });

  const fileName = path.basename(issue.imagePath);
  if (!/^[a-z0-9][a-z0-9._-]*\.(?:png|jpe?g|webp)$/i.test(fileName)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const bytes = await readFile(path.join(process.cwd(), "content", "issues", fileName));
    const extension = path.extname(fileName).toLowerCase();
    const contentType = extension === ".png" ? "image/png"
      : extension === ".webp" ? "image/webp"
        : "image/jpeg";

    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(`Unable to load protected issue image ${fileName}`, error);
    return new Response("Not found", { status: 404 });
  }
}
