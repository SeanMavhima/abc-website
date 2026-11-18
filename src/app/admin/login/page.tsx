import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Database } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/env";
import { getAdminSession } from "@/lib/auth";
import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ next?: string; error?: string; reset?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  if (await getAdminSession()) redirect("/admin");

  if (!isSupabaseConfigured) {
    return (
      <AuthShell title="Connect a database first" description="The content manager needs a Supabase project.">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="flex items-center gap-2 font-semibold">
            <Database className="size-4" /> Development preview mode
          </p>
          <p className="mt-2 leading-relaxed">
            Supabase environment variables are not set, so sign-in is unavailable and the public site is showing bundled seed
            content.
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5">
            <li>Create a free Supabase project.</li>
            <li>Run the SQL migrations in <code>supabase/migrations</code>.</li>
            <li>
              Copy <code>.env.example</code> to <code>.env.local</code> and add your keys.
            </li>
            <li>Create the first administrator (see README).</li>
          </ol>
        </div>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-evergreen hover:underline">
          Back to the website
        </Link>
      </AuthShell>
    );
  }

  const notice =
    sp.error === "unauthorised"
      ? "Please sign in with an administrator account."
      : sp.reset === "1"
        ? "Your password has been updated. Please sign in."
        : sp.error === "link"
          ? "That link is invalid or has expired. Please request a new one."
          : undefined;

  return (
    <AuthShell title="Sign in" description="Administrator access to the ABC website.">
      <LoginForm next={sp.next ?? "/admin"} notice={notice} />
    </AuthShell>
  );
}
