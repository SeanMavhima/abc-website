import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/primitives";
import { AddAdministrator, RevokeButton } from "./admin-forms";

export const metadata: Metadata = { title: "Administrators" };

export default async function AdministratorsPage() {
  const { supabase, user } = await requireAdminPage();
  const { data } = await supabase.from("profiles").select("*").eq("role", "admin").order("created_at");
  const admins = (data ?? []) as Profile[];
  const serviceKeyConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <>
      <AdminPageHeader title="Administrators" description="People who can sign in and manage the website. There is no public registration." />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
            {admins.map((a) => (
              <li key={a.id} className="flex items-center gap-4 px-5 py-4">
                <span className="flex size-10 items-center justify-center rounded-full bg-sage/30 font-display text-sm font-bold text-forest">
                  {(a.full_name || a.email).slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {a.full_name || a.email}
                    {a.id === user.id ? <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span> : null}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {a.email} · since {formatDate(a.created_at)}
                  </p>
                </div>
                {a.id !== user.id && admins.length > 1 ? <RevokeButton id={a.id} name={a.full_name || a.email} /> : null}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2">
          {serviceKeyConfigured ? (
            <AddAdministrator />
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              <p className="font-semibold">Adding administrators from here is not enabled</p>
              <p className="mt-2 leading-relaxed">
                Set <code>SUPABASE_SERVICE_ROLE_KEY</code> on the server to add administrators from this page, or use{" "}
                <code>npm run create-admin</code> / the SQL method described in the README.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
