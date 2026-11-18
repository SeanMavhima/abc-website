"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Info } from "lucide-react";
import type { Block } from "@/lib/types";
import { saveHomepage } from "@/lib/actions/admin/content";
import { Button } from "@/components/ui/button";
import { AdminPageHeader, SaveBar, useAction } from "@/components/admin/primitives";
import { SectionsEditor } from "@/components/admin/sections-editor";
import { useDirty } from "@/components/admin/use-dirty";

export function HomepageEditor({ initial }: { initial: Block[] }) {
  const [blocks, setBlocks] = React.useState(initial);
  const { dirty, markSaved } = useDirty(blocks);
  const { run, pending } = useAction();

  async function save() {
    const res = await run(saveHomepage(blocks));
    if (res.ok) markSaved(blocks);
  }

  return (
    <>
      <AdminPageHeader
        title="Homepage"
        description="Edit, reorder, hide or add the sections of the homepage. Changes appear on the website as soon as you save."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/" target="_blank">
              <ExternalLink /> View homepage
            </Link>
          </Button>
        }
      />
      <div className="mb-6 flex gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Programme cards, impact statistics, stories and organisations come from their own managers in the sidebar. Their
          sections here control the headings and which items are shown. Footer content is edited under{" "}
          <Link href="/admin/navigation" className="font-semibold underline">
            Navigation &amp; footer
          </Link>{" "}
          and{" "}
          <Link href="/admin/settings" className="font-semibold underline">
            Website settings
          </Link>
          .
        </p>
      </div>
      <SectionsEditor value={blocks} onChange={setBlocks} emptyHint="The homepage has no sections. Add a Hero section to begin." />
      <SaveBar dirty={dirty} saving={pending} onSave={save} label="Save homepage" />
    </>
  );
}
