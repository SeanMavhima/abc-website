"use client";

import Link from "next/link";
import { ExternalLink, Eye, EyeOff, Pencil, Star } from "lucide-react";
import { deleteRecord, setArticleStatus, setRecordFlag } from "@/lib/actions/admin/records";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmButton, useAction } from "@/components/admin/primitives";

export function StoryRowActions({ id, slug, status, featured }: { id: string; slug: string; status: string; featured: boolean }) {
  const { run, pending } = useAction();
  const published = status === "published";
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={featured ? "Remove from featured" : "Mark as featured"}
        title={featured ? "Featured" : "Not featured"}
        onClick={() => run(setRecordFlag("articles", id, "is_featured", !featured))}
      >
        <Star className={cn(featured && "fill-amber-400 text-amber-500")} />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={pending}
        aria-label={published ? "Unpublish" : "Publish"}
        title={published ? "Unpublish" : "Publish now"}
        onClick={() => run(setArticleStatus(id, published ? "draft" : "published"))}
      >
        {published ? <EyeOff /> : <Eye />}
      </Button>
      {published ? (
        <Button asChild variant="ghost" size="icon-sm" aria-label="View story">
          <Link href={`/stories/${slug}`} target="_blank">
            <ExternalLink />
          </Link>
        </Button>
      ) : null}
      <Button asChild variant="ghost" size="icon-sm" aria-label="Edit story">
        <Link href={`/admin/stories/${id}`}>
          <Pencil />
        </Link>
      </Button>
      <ConfirmButton title="Delete this story?" onConfirm={() => run(deleteRecord("articles", id))} />
    </div>
  );
}
