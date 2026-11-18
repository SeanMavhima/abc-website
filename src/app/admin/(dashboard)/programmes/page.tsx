import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Sprout } from "lucide-react";
import { requireAdminPage } from "@/lib/auth";
import type { Programme } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AdminPageHeader, EmptyState } from "@/components/admin/primitives";
import { ProgrammeList } from "./programme-list";

export const metadata: Metadata = { title: "Programmes" };

export default async function ProgrammesAdmin() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase.from("programmes").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  const items = (data ?? []) as Programme[];
  return (
    <>
      <AdminPageHeader
        title="Programmes"
        description="Programme areas shown on the Programmes page and homepage. Use the arrows to change their order."
        actions={
          <Button asChild>
            <Link href="/admin/programmes/new">
              <Plus /> New programme
            </Link>
          </Button>
        }
      />
      {items.length === 0 ? (
        <EmptyState icon={<Sprout />} title="No programmes yet" action={<Button asChild><Link href="/admin/programmes/new">Create a programme</Link></Button>} />
      ) : (
        <ProgrammeList items={items} />
      )}
    </>
  );
}
