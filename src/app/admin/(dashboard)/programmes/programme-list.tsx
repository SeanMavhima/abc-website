"use client";

import Link from "next/link";
import { Pencil, Star } from "lucide-react";
import type { Programme } from "@/lib/types";
import { deleteRecord, setRecordFlag } from "@/lib/actions/admin/records";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { Switch } from "@/components/ui/form-controls";
import { ConfirmButton, useAction } from "@/components/admin/primitives";
import { ReorderableList } from "@/components/admin/reorderable-table";
import { PROGRAMME_STATUS_LABEL } from "@/components/site/cards";

export function ProgrammeList({ items }: { items: Programme[] }) {
  const { run } = useAction();
  return (
    <ReorderableList
      table="programmes"
      items={items}
      renderRow={(p, controls) => (
        <div className="flex flex-wrap items-center gap-4 px-4 py-3 sm:flex-nowrap">
          {controls}
          {p.cover_image?.src ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
            <img src={p.cover_image.src} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="h-12 w-16 shrink-0 rounded-lg bg-muted" />
          )}
          <div className="min-w-0 flex-1">
            <Link href={`/admin/programmes/${p.id}`} className="font-medium hover:text-evergreen">
              {p.title}
            </Link>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <Badge variant="earth">{PROGRAMME_STATUS_LABEL[p.status]}</Badge>
              {p.category ? <span className="text-xs text-muted-foreground">{p.category}</span> : null}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={p.is_featured ? "Remove from featured" : "Feature on homepage"}
            title={p.is_featured ? "Featured" : "Not featured"}
            onClick={() => run(setRecordFlag("programmes", p.id, "is_featured", !p.is_featured))}
          >
            <Star className={cn(p.is_featured && "fill-amber-400 text-amber-500")} />
          </Button>
          <Switch
            label={p.is_published ? "Published" : "Hidden"}
            checked={p.is_published}
            onCheckedChange={(v) => run(setRecordFlag("programmes", p.id, "is_published", v))}
          />
          <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${p.title}`}>
            <Link href={`/admin/programmes/${p.id}`}>
              <Pencil />
            </Link>
          </Button>
          <ConfirmButton title={`Delete ${p.title}?`} onConfirm={() => run(deleteRecord("programmes", p.id))} />
        </div>
      )}
    />
  );
}
