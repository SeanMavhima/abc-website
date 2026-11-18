"use client";

import Link from "next/link";
import { ExternalLink, Eye, EyeOff, Pencil } from "lucide-react";
import { deletePage, setPageStatus } from "@/lib/actions/admin/content";
import { Button } from "@/components/ui/button";
import { ConfirmButton, useAction } from "@/components/admin/primitives";

export function PageRowActions({ id, slug, status, isSystem }: { id: string; slug: string; status: string; isSystem: boolean }) {
  const { run, pending } = useAction();
  const published = status === "published";
  return (
    <div className="flex items-center justify-end gap-1">
      <Button asChild variant="ghost" size="icon-sm" aria-label="Edit page">
        <Link href={`/admin/pages/${id}`}>
          <Pencil />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={pending}
        aria-label={published ? "Unpublish page" : "Publish page"}
        title={published ? "Unpublish" : "Publish"}
        onClick={() => run(setPageStatus(id, published ? "draft" : "published"))}
      >
        {published ? <EyeOff /> : <Eye />}
      </Button>
      {published ? (
        <Button asChild variant="ghost" size="icon-sm" aria-label="View page">
          <Link href={`/${slug}`} target="_blank">
            <ExternalLink />
          </Link>
        </Button>
      ) : null}
      {!isSystem ? (
        <ConfirmButton title="Delete this page?" description="The page and all its sections will be permanently deleted." onConfirm={() => run(deletePage(id))} />
      ) : null}
    </div>
  );
}
