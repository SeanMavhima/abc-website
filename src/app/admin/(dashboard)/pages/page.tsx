import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { requireAdminPage } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { AdminPageHeader, EmptyState } from "@/components/admin/primitives";
import { PageRowActions } from "./row-actions";

export const metadata: Metadata = { title: "Pages" };

export default async function PagesAdmin() {
  const { supabase } = await requireAdminPage();
  const { data: pages, error } = await supabase
    .from("pages")
    .select("id, slug, title, status, is_system, updated_at")
    .order("is_system", { ascending: false })
    .order("title");
  if (error) throw new Error(error.message);

  return (
    <>
      <AdminPageHeader
        title="Pages"
        description="Core pages such as About and Nature Labs, plus any additional pages you create."
        actions={
          <Button asChild>
            <Link href="/admin/pages/new">
              <Plus /> New page
            </Link>
          </Button>
        }
      />
      {!pages?.length ? (
        <EmptyState icon={<FileText />} title="No pages yet" description="Run the seed script or create your first page." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">Address</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="hidden px-5 py-3 font-medium lg:table-cell">Updated</th>
                <th className="px-5 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/pages/${p.id}`} className="font-medium hover:text-evergreen">
                      {p.title}
                    </Link>
                    {p.is_system ? <span className="ml-2 text-xs text-muted-foreground">Core page</span> : null}
                  </td>
                  <td className="hidden px-5 py-3.5 font-mono text-xs text-muted-foreground md:table-cell">/{p.slug}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={p.status === "published" ? "success" : "warning"}>{p.status === "published" ? "Published" : "Draft"}</Badge>
                  </td>
                  <td className="hidden px-5 py-3.5 text-xs text-muted-foreground lg:table-cell">{formatDateTime(p.updated_at)}</td>
                  <td className="px-5 py-3.5">
                    <PageRowActions id={p.id} slug={p.slug} status={p.status} isSystem={p.is_system} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
